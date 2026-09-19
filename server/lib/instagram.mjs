/**
 * Instagram Graph API (cuenta Professional + Página de Facebook).
 * Flujo: crear contenedor de media → publicar.
 */

export function igAuthUrl(cfg) {
  const u = new URL('https://www.facebook.com/v21.0/dialog/oauth');
  u.searchParams.set('client_id', cfg.ig.appId);
  u.searchParams.set('redirect_uri', cfg.ig.redirectUri);
  u.searchParams.set(
    'scope',
    [
      'instagram_basic',
      'instagram_content_publish',
      'pages_show_list',
      'pages_read_engagement',
      'business_management',
    ].join(','),
  );
  u.searchParams.set('response_type', 'code');
  return u.toString();
}

export async function igExchangeCode(cfg, code) {
  const u = new URL('https://graph.facebook.com/v21.0/oauth/access_token');
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
  const longUrl = new URL('https://graph.facebook.com/v21.0/oauth/access_token');
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

  const createUrl = new URL(`https://graph.facebook.com/v21.0/${igUserId}/media`);
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

  const pubUrl = new URL(
    `https://graph.facebook.com/v21.0/${igUserId}/media_publish`,
  );
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
  const u = new URL(`https://graph.facebook.com/v21.0/${mediaId}/insights`);
  u.searchParams.set('metric', 'impressions,reach,saved');
  u.searchParams.set('access_token', token);
  const res = await fetch(u);
  if (!res.ok) return null;
  return res.json();
}
