import http from 'node:http';
import { config, statusOf } from './lib/config.mjs';
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

const cfg = config();
ensureDir(cfg.dataDir);
const tokens = tokenStore(cfg.dataDir);

function send(res, status, body, headers = {}) {
  const payload = typeof body === 'string' ? body : JSON.stringify(body);
  res.writeHead(status, {
    'Content-Type':
      typeof body === 'string' ? 'text/plain; charset=utf-8' : 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
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

function htmlOk(title, msg) {
  return `<!doctype html><html lang="es"><body style="font-family:system-ui;padding:2rem">
  <h1>${title}</h1><p>${msg}</p>
  <p><a href="${cfg.publicWeb}/panel/ajustes">Volver al panel</a></p>
  <script>setTimeout(()=>location.href="${cfg.publicWeb}/panel/ajustes",1200)</script>
  </body></html>`;
}

const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url || '/', `http://${req.headers.host}`);
    const { pathname } = url;

    if (req.method === 'OPTIONS') {
      return send(res, 204, '');
    }

    if (req.method === 'GET' && pathname === '/api/health') {
      return send(res, 200, { ok: true, service: 'sierra-panel-api' });
    }

    if (req.method === 'GET' && pathname === '/api/status') {
      const st = statusOf(cfg);
      const t = tokens.get();
      return send(res, 200, {
        configured: st,
        connected: {
          mercadolibre: Boolean(t.ml?.access_token),
          instagram: Boolean(t.ig?.access_token || cfg.ig.pageAccessToken),
          argenprop: st.argenprop,
        },
        mode: {
          mercadolibre: st.mercadolibre
            ? t.ml?.access_token
              ? 'live'
              : 'needs_oauth'
            : 'missing_env',
          argenprop: st.argenprop ? 'live' : 'missing_env',
          instagram: st.instagram
            ? t.ig?.access_token || cfg.ig.pageAccessToken
              ? 'live'
              : 'needs_oauth'
            : 'missing_env',
        },
      });
    }

    // ——— Mercado Libre ———
    if (req.method === 'GET' && pathname === '/api/ml/auth') {
      if (!cfg.ml.clientId) {
        return send(res, 400, {
          error: 'Falta ML_CLIENT_ID / ML_CLIENT_SECRET en .env',
        });
      }
      return send(res, 302, '', { Location: mlAuthUrl(cfg) });
    }

    if (req.method === 'GET' && pathname === '/api/ml/callback') {
      const code = url.searchParams.get('code');
      if (!code) return send(res, 400, 'Falta code');
      const data = await mlExchangeCode(cfg, code);
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
        htmlOk('Mercado Libre conectado', 'Ya podés publicar desde el panel.'),
        { 'Content-Type': 'text/html; charset=utf-8' },
      );
    }

    if (req.method === 'POST' && pathname === '/api/ml/publish') {
      const body = await readBody(req);
      const property = body.property;
      if (!property?.title) return send(res, 400, { error: 'Falta property' });

      if (!statusOf(cfg).mercadolibre || !tokens.get().ml?.access_token) {
        return send(res, 200, {
          simulated: true,
          channel: 'mercadolibre',
          message:
            'Simulado: configurá ML_CLIENT_ID/SECRET en .env y conectá OAuth en /api/ml/auth',
          externalUrl: 'https://developers.mercadolibre.com.ar/',
        });
      }

      const result = await mlPublish(cfg, tokens.get(), property, (patch) =>
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
    if (req.method === 'POST' && pathname === '/api/argenprop/publish') {
      const body = await readBody(req);
      const property = body.property;
      if (!property?.title) return send(res, 400, { error: 'Falta property' });

      if (!statusOf(cfg).argenprop) {
        return send(res, 200, {
          simulated: true,
          channel: 'argenprop',
          message:
            'Simulado: pedí credenciales a Argenprop y cargalas en .env (ARGENPROP_*)',
          externalUrl: 'https://gestion.argenprop.com/',
        });
      }

      const result = await argenpropPublish(cfg, property);
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
      if (!cfg.ig.appId) {
        return send(res, 400, { error: 'Falta IG_APP_ID / IG_APP_SECRET en .env' });
      }
      return send(res, 302, '', { Location: igAuthUrl(cfg) });
    }

    if (req.method === 'GET' && pathname === '/api/ig/callback') {
      const code = url.searchParams.get('code');
      if (!code) return send(res, 400, 'Falta code');
      const data = await igExchangeCode(cfg, code);
      tokens.set({
        ig: {
          access_token: data.access_token,
          expires_in: data.expires_in,
          ig_user_id: cfg.ig.igUserId || null,
          obtained_at: Date.now(),
        },
      });
      return send(
        res,
        200,
        htmlOk(
          'Instagram conectado',
          'Si falta IG_USER_ID en .env, agregalo y reiniciá la API.',
        ),
        { 'Content-Type': 'text/html; charset=utf-8' },
      );
    }

    if (req.method === 'POST' && pathname === '/api/ig/publish') {
      const body = await readBody(req);
      const property = body.property;
      if (!property?.title) return send(res, 400, { error: 'Falta property' });

      const live =
        statusOf(cfg).instagram &&
        (tokens.get().ig?.access_token || cfg.ig.pageAccessToken);

      if (!live) {
        return send(res, 200, {
          simulated: true,
          channel: 'instagram',
          message:
            'Simulado: configurá IG_* en .env y conectá OAuth o usá PAGE token + IG_USER_ID',
          externalUrl: 'https://developers.facebook.com/',
        });
      }

      const result = await igPublish(cfg, tokens.get(), property);
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
      const token = tokens.get().ig?.access_token || cfg.ig.pageAccessToken;
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

server.listen(cfg.port, '0.0.0.0', () => {
  console.log(`API_OK http://127.0.0.1:${cfg.port}`);
  console.log('Status:', statusOf(cfg));
});
