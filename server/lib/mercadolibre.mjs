/**
 * Mercado Libre — inmobiliaria (MLA).
 * Docs: https://developers.mercadolibre.com.ar/
 */

function parsePrice(price) {
  const n = Number(String(price).replace(/[^\d.,]/g, '').replace(/\./g, '').replace(',', '.'));
  return Number.isFinite(n) && n > 0 ? n : 1;
}

function mapCategory(type, status) {
  // Categorías MLA frecuentes para inmuebles (aprox.; se puede sobreescribir).
  const venta = {
    Casa: 'MLA401685',
    Cabaña: 'MLA401685',
    Casaquinta: 'MLA401685',
    Departamento: 'MLA401686',
    Terreno: 'MLA401704',
    Local: 'MLA401690',
    Campo: 'MLA401705',
  };
  const alquiler = {
    Casa: 'MLA401706',
    Cabaña: 'MLA401706',
    Casaquinta: 'MLA401706',
    Departamento: 'MLA401707',
    Terreno: 'MLA401704',
    Local: 'MLA401711',
    Campo: 'MLA401705',
  };
  const table = status === 'alquiler' ? alquiler : venta;
  return table[type] || (status === 'alquiler' ? 'MLA401706' : 'MLA401685');
}

export function mlAuthUrl(cfg) {
  const u = new URL('https://auth.mercadolibre.com.ar/authorization');
  u.searchParams.set('response_type', 'code');
  u.searchParams.set('client_id', cfg.ml.clientId);
  u.searchParams.set('redirect_uri', cfg.ml.redirectUri);
  return u.toString();
}

export async function mlExchangeCode(cfg, code) {
  const body = new URLSearchParams({
    grant_type: 'authorization_code',
    client_id: cfg.ml.clientId,
    client_secret: cfg.ml.clientSecret,
    code,
    redirect_uri: cfg.ml.redirectUri,
  });
  const res = await fetch('https://api.mercadolibre.com/oauth/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded', Accept: 'application/json' },
    body,
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || data.error || `ML token HTTP ${res.status}`);
  }
  return data;
}

export async function mlRefresh(cfg, refreshToken) {
  const body = new URLSearchParams({
    grant_type: 'refresh_token',
    client_id: cfg.ml.clientId,
    client_secret: cfg.ml.clientSecret,
    refresh_token: refreshToken,
  });
  const res = await fetch('https://api.mercadolibre.com/oauth/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded', Accept: 'application/json' },
    body,
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || data.error || `ML refresh HTTP ${res.status}`);
  }
  return data;
}

async function getAccessToken(cfg, tokens, setTokens) {
  const ml = tokens.ml;
  if (!ml?.access_token) {
    throw new Error('Mercado Libre no conectado. Abrí /api/ml/auth desde Ajustes.');
  }
  const exp = (ml.obtained_at || 0) + (ml.expires_in || 0) * 1000;
  if (Date.now() < exp - 60_000) return ml.access_token;
  if (!ml.refresh_token) {
    throw new Error('Token ML vencido. Volvé a autorizar la app.');
  }
  const fresh = await mlRefresh(cfg, ml.refresh_token);
  setTokens({
    ml: {
      ...ml,
      access_token: fresh.access_token,
      refresh_token: fresh.refresh_token || ml.refresh_token,
      expires_in: fresh.expires_in,
      obtained_at: Date.now(),
    },
  });
  return fresh.access_token;
}

export async function mlPublish(cfg, tokens, property, setTokens) {
  const access = await getAccessToken(cfg, tokens, setTokens);

  const pictures = (property.images || [])
    .filter((u) => typeof u === 'string' && u.startsWith('http'))
    .slice(0, 12)
    .map((source) => ({ source }));

  if (!pictures.length) {
    throw new Error(
      'ML requiere URLs públicas http(s) de fotos. Subí a un host o Storage y usá links absolutos (no data:).',
    );
  }

  const payload = {
    title: String(property.title).slice(0, 60),
    category_id: mapCategory(property.type, property.status),
    price: parsePrice(property.price),
    currency_id: String(property.price).toUpperCase().includes('USD') ? 'USD' : 'ARS',
    available_quantity: 1,
    buying_mode: 'classified',
    listing_type_id: process.env.ML_LISTING_TYPE || 'free',
    condition: 'not_specified',
    pictures,
    description: {
      plain_text: property.description || property.title,
    },
    location: {
      address_line: property.location,
    },
    attributes: [
      { id: 'ROOMS', value_name: String(property.bedrooms ?? 0) },
      { id: 'FULL_BATHROOMS', value_name: String(property.bathrooms ?? 0) },
      ...(property.surface
        ? [{ id: 'TOTAL_AREA', value_name: String(property.surface) }]
        : []),
    ],
  };

  const res = await fetch('https://api.mercadolibre.com/items', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${access}`,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) {
    const detail =
      data?.cause?.map?.((c) => c.message).join('; ') ||
      data.message ||
      data.error ||
      JSON.stringify(data).slice(0, 300);
    throw new Error(`ML publish: ${detail}`);
  }
  return {
    id: data.id,
    permalink: data.permalink,
    status: data.status,
    raw: data,
  };
}

export async function mlItemVisits(accessToken, itemId) {
  const res = await fetch(
    `https://api.mercadolibre.com/items/${itemId}/visits/time_window?last=30&unit=day`,
    { headers: { Authorization: `Bearer ${accessToken}` } },
  );
  if (!res.ok) return null;
  return res.json();
}
