import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const serverRoot = path.resolve(__dirname, '..');
const projectRoot = path.resolve(serverRoot, '..');
const envPath = path.join(projectRoot, '.env');
const dataDir = path.join(serverRoot, '.data');
const credFile = path.join(dataDir, 'credentials.json');

/** Carga .env simple (KEY=VALUE) sin dependencias. */
export function loadEnv() {
  if (!fs.existsSync(envPath)) return;
  for (const line of fs.readFileSync(envPath, 'utf8').split('\n')) {
    const t = line.trim();
    if (!t || t.startsWith('#')) continue;
    const i = t.indexOf('=');
    if (i < 0) continue;
    const k = t.slice(0, i).trim();
    let v = t.slice(i + 1).trim();
    if (
      (v.startsWith('"') && v.endsWith('"')) ||
      (v.startsWith("'") && v.endsWith("'"))
    ) {
      v = v.slice(1, -1);
    }
    if (!(k in process.env)) process.env[k] = v;
  }
}

export function readCredentials() {
  try {
    if (!fs.existsSync(credFile)) return {};
    return JSON.parse(fs.readFileSync(credFile, 'utf8'));
  } catch {
    return {};
  }
}

export function writeCredentials(patch) {
  fs.mkdirSync(dataDir, { recursive: true });
  const next = { ...readCredentials(), ...patch };
  fs.writeFileSync(credFile, JSON.stringify(next, null, 2));
  return next;
}

function pick(cred, envKey, credPath) {
  const fromCred = credPath
    .split('.')
    .reduce((o, k) => (o == null ? o : o[k]), cred);
  if (fromCred) return String(fromCred);
  return process.env[envKey] || '';
}

export function config() {
  loadEnv();
  const cred = readCredentials();
  return {
    port: Number(process.env.API_PORT || 43125),
    publicWeb: process.env.PUBLIC_WEB_URL || 'http://127.0.0.1:43124',
    dataDir,
    ml: {
      clientId: pick(cred, 'ML_CLIENT_ID', 'ml.clientId'),
      clientSecret: pick(cred, 'ML_CLIENT_SECRET', 'ml.clientSecret'),
      redirectUri:
        pick(cred, 'ML_REDIRECT_URI', 'ml.redirectUri') ||
        'http://127.0.0.1:43125/api/ml/callback',
      siteId: pick(cred, 'ML_SITE_ID', 'ml.siteId') || 'MLA',
      // seller_contact (WhatsApp obligatorio en inmuebles desde 01/10/2026)
      contact: {
        contact: pick(cred, 'ML_CONTACT_NAME', 'ml.contact.contact'),
        email: pick(cred, 'ML_CONTACT_EMAIL', 'ml.contact.email'),
        phone: pick(cred, 'ML_CONTACT_PHONE', 'ml.contact.phone'),
        whatsapp: pick(cred, 'ML_CONTACT_WHATSAPP', 'ml.contact.whatsapp'),
        areaCode: pick(cred, 'ML_CONTACT_AREA_CODE', 'ml.contact.areaCode'),
        phoneLocal: pick(cred, 'ML_CONTACT_PHONE_LOCAL', 'ml.contact.phoneLocal'),
        otherInfo: pick(cred, 'ML_CONTACT_OTHER', 'ml.contact.otherInfo'),
        webpage: pick(cred, 'ML_CONTACT_WEBPAGE', 'ml.contact.webpage'),
      },
    },
    argenprop: {
      baseUrl:
        pick(cred, 'ARGENPROP_API_BASE', 'argenprop.baseUrl') ||
        'https://apiw.argenprop.com',
      usr: pick(cred, 'ARGENPROP_USR', 'argenprop.usr'),
      psd: pick(cred, 'ARGENPROP_PSD', 'argenprop.psd'),
      idVendedor: pick(cred, 'ARGENPROP_ID_VENDEDOR', 'argenprop.idVendedor'),
      idOrigen: pick(cred, 'ARGENPROP_ID_ORIGEN', 'argenprop.idOrigen'),
      sistemaOrigenId: Number(
        pick(cred, 'ARGENPROP_SISTEMA_ORIGEN_ID', 'argenprop.sistemaOrigenId') ||
          '0',
      ),
    },
    ig: {
      appId: pick(cred, 'IG_APP_ID', 'ig.appId'),
      appSecret: pick(cred, 'IG_APP_SECRET', 'ig.appSecret'),
      redirectUri:
        pick(cred, 'IG_REDIRECT_URI', 'ig.redirectUri') ||
        'http://127.0.0.1:43125/api/ig/callback',
      igUserId: pick(cred, 'IG_USER_ID', 'ig.igUserId'),
      pageAccessToken: pick(cred, 'IG_PAGE_ACCESS_TOKEN', 'ig.pageAccessToken'),
    },
  };
}

export function statusOf(cfg) {
  return {
    mercadolibre: Boolean(cfg.ml.clientId && cfg.ml.clientSecret),
    argenprop: Boolean(
      cfg.argenprop.usr &&
        cfg.argenprop.psd &&
        cfg.argenprop.idVendedor &&
        cfg.argenprop.idOrigen,
    ),
    instagram: Boolean(
      (cfg.ig.appId && cfg.ig.appSecret) ||
        (cfg.ig.pageAccessToken && cfg.ig.igUserId),
    ),
  };
}

export function maskCredentials() {
  const c = readCredentials();
  const mask = (v) => (v ? `${String(v).slice(0, 3)}…` : '');
  return {
    ml: {
      clientId: c.ml?.clientId || '',
      clientSecretSet: Boolean(c.ml?.clientSecret),
      clientSecretMask: mask(c.ml?.clientSecret),
    },
    ig: {
      appId: c.ig?.appId || '',
      appSecretSet: Boolean(c.ig?.appSecret),
      igUserId: c.ig?.igUserId || '',
      pageAccessTokenSet: Boolean(c.ig?.pageAccessToken),
    },
    argenprop: {
      baseUrl: c.argenprop?.baseUrl || '',
      usr: c.argenprop?.usr || '',
      psdSet: Boolean(c.argenprop?.psd),
      idVendedor: c.argenprop?.idVendedor || '',
      idOrigen: c.argenprop?.idOrigen || '',
      sistemaOrigenId: c.argenprop?.sistemaOrigenId || '',
    },
  };
}
