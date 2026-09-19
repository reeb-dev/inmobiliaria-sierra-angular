import http from 'node:http';
import {
  config,
  statusOf,
  writeCredentials,
  maskCredentials,
  readCredentials,
} from './lib/config.mjs';
import { ensureDir, tokenStore } from './lib/store.mjs';
import {
  mlAuthUrl,
  mlExchangeCode,
  mlPublish,
  mlItemVisits,
} from './lib/mercadolibre.mjs';
import { argenpropPublish } from './lib/argenprop.mjs';
import {
  igAuthUrl,
  igExchangeCode,
  igPublish,
  igMediaInsights,
} from './lib/instagram.mjs';

const boot = config();
ensureDir(boot.dataDir);
const tokens = tokenStore(boot.dataDir);

function cfg() {
  return config();
}

function send(res, status, body, headers = {}) {
  const payload = typeof body === 'string' ? body : JSON.stringify(body);
  res.writeHead(status, {
    'Content-Type':
      typeof body === 'string'
        ? 'text/html; charset=utf-8'
        : 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS,DELETE',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    ...headers,
  });
  res.end(payload);
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', (c) => chunks.push(c));
    req.on('end', () => {
      const raw = Buffer.concat(chunks).toString('utf8');
      if (!raw) return resolve({});
      try {
        resolve(JSON.parse(raw));
      } catch (e) {
        reject(e);
      }
    });
    req.on('error', reject);
  });
}

function oauthDoneHtml(provider, ok, detail) {
  const channel =
    provider === 'ml'
      ? 'mercadolibre'
      : provider === 'ig'
        ? 'instagram'
        : provider;
  return `<!doctype html><html lang="es"><head><meta charset="utf-8"><title>${provider}</title></head>
<body style="font-family:system-ui;padding:2rem;background:#e7eee8;color:#163528">
  <h1>${ok ? 'Conectado' : 'Error'}: ${provider}</h1>
  <p>${detail}</p>
  <p>Podés cerrar esta ventana.</p>
  <script>
    try {
      if (window.opener) {
        window.opener.postMessage({
          type: 'sierra-oauth',
          provider: '${channel}',
          ok: ${ok ? 'true' : 'false'},
          detail: ${JSON.stringify(detail)}
        }, '*');
      }
    } catch (e) {}
    setTimeout(function () { window.close(); }, 900);
  </script>
</body></html>`;
}

function buildStatus() {
  const c = cfg();
  const st = statusOf(c);
  const t = tokens.get();
  return {
    configured: st,
    connected: {
      mercadolibre: Boolean(t.ml?.access_token),
      instagram: Boolean(t.ig?.access_token || c.ig.pageAccessToken),
      argenprop: st.argenprop,
    },
    mode: {
      mercadolibre: st.mercadolibre
        ? t.ml?.access_token
          ? 'live'
          : 'needs_oauth'
        : 'missing_credentials',
      argenprop: st.argenprop ? 'live' : 'missing_credentials',
      instagram: st.instagram
        ? t.ig?.access_token || c.ig.pageAccessToken
          ? 'live'
          : 'needs_oauth'
        : 'missing_credentials',
    },
    authUrls: {
      mercadolibre: '/api/ml/auth',
      instagram: '/api/ig/auth',
    },
  };
}

const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url || '/', `http://${req.headers.host}`);
    const { pathname } = url;

    if (req.method === 'OPTIONS') return send(res, 204, '');

    if (req.method === 'GET' && pathname === '/api/health') {
      return send(res, 200, { ok: true, service: 'sierra-panel-api' });
    }

    if (req.method === 'GET' && pathname === '/api/status') {
      return send(res, 200, buildStatus());
    }

    if (req.method === 'GET' && pathname === '/api/credentials') {
      return send(res, 200, maskCredentials());
    }

    if (req.method === 'POST' && pathname === '/api/credentials') {
      const body = await readBody(req);
      const prev = readCredentials();
      const next = {
        ml: {
          ...(prev.ml || {}),
          ...(body.ml || {}),
        },
        ig: {
          ...(prev.ig || {}),
          ...(body.ig || {}),
        },
        argenprop: {
          ...(prev.argenprop || {}),
          ...(body.argenprop || {}),
        },
      };
      // no pisar secretos si mandan vacío
      if (body.ml && !body.ml.clientSecret && prev.ml?.clientSecret) {
        next.ml.clientSecret = prev.ml.clientSecret;
      }
      if (body.ig && !body.ig.appSecret && prev.ig?.appSecret) {
        next.ig.appSecret = prev.ig.appSecret;
      }
      if (body.ig && !body.ig.pageAccessToken && prev.ig?.pageAccessToken) {
        next.ig.pageAccessToken = prev.ig.pageAccessToken;
      }
      if (body.argenprop && !body.argenprop.psd && prev.argenprop?.psd) {
        next.argenprop.psd = prev.argenprop.psd;
      }
      writeCredentials(next);
      return send(res, 200, { ok: true, status: buildStatus(), masked: maskCredentials() });
    }

    if (req.method === 'DELETE' && pathname === '/api/ml/session') {
      const fs = await import('node:fs');
      const cleaned = { ...tokens.get() };
      delete cleaned.ml;
      fs.writeFileSync(
        `${boot.dataDir}/tokens.json`,
        JSON.stringify(cleaned, null, 2),
      );
      return send(res, 200, { ok: true, status: buildStatus() });
    }

    if (req.method === 'DELETE' && pathname === '/api/ig/session') {
      const fs = await import('node:fs');
      const cleaned = { ...tokens.get() };
      delete cleaned.ig;
      fs.writeFileSync(
        `${boot.dataDir}/tokens.json`,
        JSON.stringify(cleaned, null, 2),
      );
      return send(res, 200, { ok: true, status: buildStatus() });
    }

    // ——— Mercado Libre ———
    if (req.method === 'GET' && pathname === '/api/ml/auth') {
      const c = cfg();
      if (!c.ml.clientId || !c.ml.clientSecret) {
        return send(res, 400, {
          error:
            'Faltan Client ID/Secret de Mercado Libre. Guardalos en Ajustes del panel.',
        });
      }
      return send(res, 302, '', { Location: mlAuthUrl(c) });
    }

    if (req.method === 'GET' && pathname === '/api/ml/callback') {
      try {
        const code = url.searchParams.get('code');
        if (!code) {
          return send(res, 400, oauthDoneHtml('ml', false, 'Falta code'));
        }
        const data = await mlExchangeCode(cfg(), code);
        tokens.set({
          ml: {
            access_token: data.access_token,
            refresh_token: data.refresh_token,
            expires_in: data.expires_in,
            user_id: data.user_id,
            obtained_at: Date.now(),
          },
        });
        return send(
          res,
          200,
          oauthDoneHtml('ml', true, 'Mercado Libre listo. Ya podés publicar.'),
        );
      } catch (e) {
        return send(
          res,
          200,
          oauthDoneHtml('ml', false, e instanceof Error ? e.message : String(e)),
        );
      }
    }

    if (req.method === 'POST' && pathname === '/api/ml/publish') {
      const body = await readBody(req);
      const property = body.property;
      if (!property?.title) return send(res, 400, { error: 'Falta property' });
      const c = cfg();
      const st = statusOf(c);

      if (!st.mercadolibre) {
        return send(res, 200, {
          needsAuth: true,
          authUrl: null,
          channel: 'mercadolibre',
          message:
            'Configurá Client ID y Secret de ML en Ajustes y después Conectar.',
        });
      }
      if (!tokens.get().ml?.access_token) {
        return send(res, 200, {
          needsAuth: true,
          authUrl: '/api/ml/auth',
          channel: 'mercadolibre',
          message: 'Tenés que iniciar sesión en Mercado Libre.',
        });
      }

      const result = await mlPublish(c, tokens.get(), property, (patch) =>
        tokens.set(patch),
      );
      return send(res, 200, {
        simulated: false,
        channel: 'mercadolibre',
        message: `Publicado en Mercado Libre (${result.id})`,
        externalUrl: result.permalink,
        remoteId: result.id,
      });
    }

    if (req.method === 'GET' && pathname.startsWith('/api/ml/stats/')) {
      const itemId = pathname.split('/').pop();
      const access = tokens.get().ml?.access_token;
      if (!access) return send(res, 400, { error: 'ML no conectado' });
      const visits = await mlItemVisits(access, itemId);
      return send(res, 200, { itemId, visits });
    }

    // ——— Argenprop ———
    if (req.method === 'POST' && pathname === '/api/argenprop/login') {
      const body = await readBody(req);
      const prev = readCredentials();
      writeCredentials({
        argenprop: {
          ...(prev.argenprop || {}),
          ...(body.argenprop || body || {}),
        },
      });
      const st = statusOf(cfg());
      return send(res, 200, {
        ok: st.argenprop,
        message: st.argenprop
          ? 'Credenciales Argenprop guardadas. Listo para publicar.'
          : 'Faltan usr, psd, idVendedor o idOrigen.',
        status: buildStatus(),
      });
    }

    if (req.method === 'POST' && pathname === '/api/argenprop/publish') {
      const body = await readBody(req);
      const property = body.property;
      if (!property?.title) return send(res, 400, { error: 'Falta property' });
      const c = cfg();
      if (!statusOf(c).argenprop) {
        return send(res, 200, {
          needsAuth: true,
          authUrl: null,
          channel: 'argenprop',
          message:
            'Cargá usuario/clave Argenprop en Ajustes (las da comercial) y guardá.',
        });
      }
      const result = await argenpropPublish(c, property);
      return send(res, 200, {
        simulated: false,
        channel: 'argenprop',
        message: `Enviado a Argenprop (${result.id})`,
        externalUrl: result.permalink,
        remoteId: result.id,
      });
    }

    // ——— Instagram ———
    if (req.method === 'GET' && pathname === '/api/ig/auth') {
      const c = cfg();
      if (!c.ig.appId || !c.ig.appSecret) {
        return send(res, 400, {
          error: 'Faltan App ID/Secret de Meta. Guardalos en Ajustes.',
        });
      }
      return send(res, 302, '', { Location: igAuthUrl(c) });
    }

    if (req.method === 'GET' && pathname === '/api/ig/callback') {
      try {
        const code = url.searchParams.get('code');
        if (!code) {
          return send(res, 400, oauthDoneHtml('ig', false, 'Falta code'));
        }
        const c = cfg();
        const data = await igExchangeCode(c, code);
        tokens.set({
          ig: {
            access_token: data.access_token,
            expires_in: data.expires_in,
            ig_user_id: c.ig.igUserId || null,
            obtained_at: Date.now(),
          },
        });
        return send(
          res,
          200,
          oauthDoneHtml(
            'ig',
            true,
            c.ig.igUserId
              ? 'Instagram listo.'
              : 'Token OK. Completá IG User ID en Ajustes si aún no está.',
          ),
        );
      } catch (e) {
        return send(
          res,
          200,
          oauthDoneHtml('ig', false, e instanceof Error ? e.message : String(e)),
        );
      }
    }

    if (req.method === 'POST' && pathname === '/api/ig/publish') {
      const body = await readBody(req);
      const property = body.property;
      if (!property?.title) return send(res, 400, { error: 'Falta property' });
      const c = cfg();
      const live =
        statusOf(c).instagram &&
        (tokens.get().ig?.access_token || c.ig.pageAccessToken);

      if (!statusOf(c).instagram) {
        return send(res, 200, {
          needsAuth: true,
          authUrl: null,
          channel: 'instagram',
          message: 'Configurá App ID/Secret (o page token) en Ajustes.',
        });
      }
      if (!live) {
        return send(res, 200, {
          needsAuth: true,
          authUrl: '/api/ig/auth',
          channel: 'instagram',
          message: 'Tenés que iniciar sesión en Instagram / Meta.',
        });
      }

      const result = await igPublish(c, tokens.get(), property);
      return send(res, 200, {
        simulated: false,
        channel: 'instagram',
        message: `Publicado en Instagram (${result.id})`,
        externalUrl: result.permalink,
        remoteId: result.id,
      });
    }

    if (req.method === 'GET' && pathname.startsWith('/api/ig/stats/')) {
      const mediaId = pathname.split('/').pop();
      const c = cfg();
      const token = tokens.get().ig?.access_token || c.ig.pageAccessToken;
      if (!token) return send(res, 400, { error: 'IG no conectado' });
      const insights = await igMediaInsights(token, mediaId);
      return send(res, 200, { mediaId, insights });
    }

    send(res, 404, { error: 'Not found', path: pathname });
  } catch (err) {
    console.error(err);
    send(res, 500, { error: err instanceof Error ? err.message : String(err) });
  }
});

server.listen(boot.port, '0.0.0.0', () => {
  console.log(`API_OK http://127.0.0.1:${boot.port}`);
  console.log('Status:', buildStatus().mode);
});
