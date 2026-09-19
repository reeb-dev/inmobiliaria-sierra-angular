import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const serverRoot = path.resolve(__dirname, '..');
const projectRoot = path.resolve(serverRoot, '..');
const envPath = path.join(projectRoot, '.env');

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

export function config() {
  loadEnv();
  return {
    port: Number(process.env.API_PORT || 43125),
    publicWeb: process.env.PUBLIC_WEB_URL || 'http://127.0.0.1:43124',
    dataDir: path.join(serverRoot, '.data'),
    ml: {
      clientId: process.env.ML_CLIENT_ID || '',
      clientSecret: process.env.ML_CLIENT_SECRET || '',
      redirectUri:
        process.env.ML_REDIRECT_URI ||
        'http://127.0.0.1:43125/api/ml/callback',
      siteId: process.env.ML_SITE_ID || 'MLA',
      listingType: process.env.ML_LISTING_TYPE || 'free',
    },
    argenprop: {
      baseUrl:
        process.env.ARGENPROP_API_BASE ||
        'https://apiw.argenprop.com',
      usr: process.env.ARGENPROP_USR || '',
      psd: process.env.ARGENPROP_PSD || '',
      idVendedor: process.env.ARGENPROP_ID_VENDEDOR || '',
      idOrigen: process.env.ARGENPROP_ID_ORIGEN || '',
      sistemaOrigenId: Number(process.env.ARGENPROP_SISTEMA_ORIGEN_ID || '0'),
    },
    ig: {
      appId: process.env.IG_APP_ID || '',
      appSecret: process.env.IG_APP_SECRET || '',
      redirectUri:
        process.env.IG_REDIRECT_URI ||
        'http://127.0.0.1:43125/api/ig/callback',
      igUserId: process.env.IG_USER_ID || '',
      pageAccessToken: process.env.IG_PAGE_ACCESS_TOKEN || '',
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
