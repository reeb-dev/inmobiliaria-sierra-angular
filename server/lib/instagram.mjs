/**
 * Instagram Graph API (cuenta Professional + Página de Facebook).
 * Flujo: crear contenedor de media → esperar FINISHED → media_publish.
 *
 * Auth actual: Facebook Login (dialog/oauth) con scopes clásicos.
 * Alternativa Meta (Instagram API Login): scopes
 *   instagram_business_basic, instagram_business_content_publish
 *   vía https://www.instagram.com/oauth/authorize — requiere app configurada
 *   para Instagram Login; no se cambia acá para no romper integraciones existentes.
 */

const GRAPH = 'https://graph.facebook.com/v21.0';

/** Scopes Facebook Login (compatibles con Page + IG Professional). */
const FB_LOGIN_SCOPES = [
  'instagram_basic',
  'instagram_content_publish',
  'pages_show_list',
  'pages_read_engagement',
  'business_management',
].join(',');

/** Scopes Instagram API Login (documentados; no usados en el flujo actual). */
export const IG_BUSINESS_SCOPES =
  'instagram_business_basic,instagram_business_content_publish';

export function igAuthUrl(cfg) {
  const u = new URL('https://www.facebook.com/v21.0/dialog/oauth');
  u.searchParams.set('client_id', cfg.ig.appId);
  u.searchParams.set('redirect_uri', cfg.ig.redirectUri);
  u.searchParams.set('scope', FB_LOGIN_SCOPES);
  u.searchParams.set('response_type', 'code');
  return u.toString();
}

export async function igExchangeCode(cfg, code) {
  const u = new URL(`${GRAPH}/oauth/access_token`);
  u.searchParams.set('client_id', cfg.ig.appId);
  u.searchParams.set('client_secret', cfg.ig.appSecret);
  u.searchParams.set('redirect_uri', cfg.ig.redirectUri);
  u.searchParams.set('code', code);
  const res = await fetch(u);
  const data = await res.json();
  if (!res.ok || data.error) {
    throw new Error(data.error?.message || `IG token HTTP ${res.status}`);
  }
  // Long-lived
  const longUrl = new URL(`${GRAPH}/oauth/access_token`);
  longUrl.searchParams.set('grant_type', 'fb_exchange_token');
  longUrl.searchParams.set('client_id', cfg.ig.appId);
  longUrl.searchParams.set('client_secret', cfg.ig.appSecret);
  longUrl.searchParams.set('fb_exchange_token', data.access_token);
  const longRes = await fetch(longUrl);
  const longData = await longRes.json();
  return {
    access_token: longData.access_token || data.access_token,
    expires_in: longData.expires_in || data.expires_in,
  };
}

function firstPublicImage(property, publicWeb) {
  for (const img of property.images || []) {
    if (!img || img.startsWith('data:')) continue;
    if (img.startsWith('http')) return img;
    return `${publicWeb.replace(/\/$/, '')}/${img.replace(/^\//, '')}`;
  }
  return null;
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

/**
 * Espera status_code FINISHED del contenedor antes de media_publish.
 * Timeout corto (~12s) para no alargar el request del panel.
 */
async function waitContainerReady(containerId, token, { timeoutMs = 12_000, intervalMs = 800 } = {}) {
  const deadline = Date.now() + timeoutMs;
  let last = null;
  while (Date.now() < deadline) {
    const u = new URL(`${GRAPH}/${containerId}`);
    u.searchParams.set('fields', 'status_code,status');
    u.searchParams.set('access_token', token);
    const res = await fetch(u);
    const data = await res.json();
    last = data;
    if (!res.ok || data.error) {
      // Si el status endpoint falla, no bloqueamos: se intenta publish igual.
      break;
    }
    const code = String(data.status_code || '').toUpperCase();
    if (code === 'FINISHED') return data;
    if (code === 'ERROR' || code === 'EXPIRED') {
      throw new Error(
        data.status || `Contenedor Instagram en estado ${code}`,
      );
    }
    await sleep(intervalMs);
  }
  return last;
}

export async function igPublish(cfg, tokens, property) {
  const token =
    tokens.ig?.access_token || cfg.ig.pageAccessToken;
  const igUserId = tokens.ig?.ig_user_id || cfg.ig.igUserId;
  if (!token || !igUserId) {
    throw new Error(
      'Instagram no conectado. Completá IG_APP_ID/SECRET y OAuth, o IG_PAGE_ACCESS_TOKEN + IG_USER_ID.',
    );
  }

  const imageUrl = firstPublicImage(property, cfg.publicWeb);
  if (!imageUrl) {
    throw new Error(
      'Instagram necesita una imagen con URL pública http(s) (no data:).',
    );
  }

  const caption = [
    property.title,
    property.price,
    property.location,
    '',
    (property.description || '').slice(0, 1800),
    '',
    '#SierraDeLaVentana #Inmobiliaria',
  ]
    .filter(Boolean)
    .join('\n');

  const createUrl = new URL(`${GRAPH}/${igUserId}/media`);
  createUrl.searchParams.set('image_url', imageUrl);
  createUrl.searchParams.set('caption', caption);
  createUrl.searchParams.set('access_token', token);

  const createRes = await fetch(createUrl, { method: 'POST' });
  const createData = await createRes.json();
  if (!createRes.ok || createData.error) {
    throw new Error(
      createData.error?.message || `IG media create HTTP ${createRes.status}`,
    );
  }

  // Poll suave: si no llega a FINISHED a tiempo, igual intentamos publish.
  try {
    await waitContainerReady(createData.id, token);
  } catch (e) {
    throw new Error(
      e instanceof Error ? e.message : 'Instagram: contenedor de media falló',
    );
  }

  const pubUrl = new URL(`${GRAPH}/${igUserId}/media_publish`);
  pubUrl.searchParams.set('creation_id', createData.id);
  pubUrl.searchParams.set('access_token', token);
  const pubRes = await fetch(pubUrl, { method: 'POST' });
  const pubData = await pubRes.json();
  if (!pubRes.ok || pubData.error) {
    throw new Error(
      pubData.error?.message || `IG publish HTTP ${pubRes.status}`,
    );
  }

  return {
    id: pubData.id,
    permalink: `https://www.instagram.com/`,
    raw: pubData,
  };
}

export async function igMediaInsights(token, mediaId) {
  const u = new URL(`${GRAPH}/${mediaId}/insights`);
  u.searchParams.set('metric', 'impressions,reach,saved');
  u.searchParams.set('access_token', token);
  const res = await fetch(u);
  if (!res.ok) return null;
  return res.json();
}
