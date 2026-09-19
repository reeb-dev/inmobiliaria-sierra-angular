/**
 * Mercado Libre — inmobiliaria (MLA).
 * Docs: https://developers.mercadolibre.com.ar/es_ar/publica-inmueble
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const listingsPath = path.resolve(__dirname, '../../src/assets/data/listings.json');

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

/** Solo dígitos. */
function digitsOnly(value) {
  return String(value || '').replace(/\D/g, '');
}

/**
 * Extrae country_code2 + phone2 desde un WhatsApp / teléfono AR.
 * Ej: 5492916450560 → { country_code2: "54", phone2: "92916450560" }
 */
export function splitWhatsApp(raw) {
  let digits = digitsOnly(raw);
  // wa.me/549… o +54 9 …
  if (!digits && typeof raw === 'string') {
    const m = raw.match(/(\d{10,15})/);
    digits = m ? m[1] : '';
  }
  if (!digits) return null;

  if (digits.startsWith('54') && digits.length >= 12) {
    return { country_code2: '54', phone2: digits.slice(2) };
  }
  if (digits.startsWith('9') && digits.length >= 10) {
    return { country_code2: '54', phone2: digits };
  }
  // Celular local sin 9 ni país: asumir AR + 9
  if (digits.length >= 8 && digits.length <= 10) {
    return { country_code2: '54', phone2: digits.startsWith('9') ? digits : `9${digits}` };
  }
  return { country_code2: '54', phone2: digits };
}

function loadAgency() {
  try {
    const data = JSON.parse(fs.readFileSync(listingsPath, 'utf8'));
    return data.agency || {};
  } catch {
    return {};
  }
}

/**
 * seller_contact según docs ML (country_code2 + phone2 obligatorios para inmuebles).
 * Prioridad: credenciales guardadas → env ML_CONTACT_* → agency en listings.json.
 */
export function buildSellerContact(cfg) {
  const agency = loadAgency();
  const contactCfg = cfg.ml?.contact || {};

  const contact =
    contactCfg.contact ||
    process.env.ML_CONTACT_NAME ||
    agency.name ||
    'Inmobiliaria';

  const email =
    contactCfg.email ||
    process.env.ML_CONTACT_EMAIL ||
    agency.email ||
    '';

  const phoneRaw =
    contactCfg.phone ||
    process.env.ML_CONTACT_PHONE ||
    agency.phone ||
    agency.phoneHref ||
    '';

  const whatsappRaw =
    contactCfg.whatsapp ||
    process.env.ML_CONTACT_WHATSAPP ||
    agency.whatsapp ||
    agency.phoneHref ||
    phoneRaw;

  const wa = splitWhatsApp(whatsappRaw) || splitWhatsApp(phoneRaw);
  if (!wa?.phone2) {
    throw new Error(
      'ML requiere seller_contact.phone2 (WhatsApp). Definí ML_CONTACT_WHATSAPP, agency.whatsapp o teléfono en listings.json.',
    );
  }

  const phoneDigits = digitsOnly(phoneRaw);
  // Teléfono principal opcional: si hay, separar area si parece BA/local
  let area_code = contactCfg.areaCode || process.env.ML_CONTACT_AREA_CODE || '';
  let phone = contactCfg.phoneLocal || process.env.ML_CONTACT_PHONE_LOCAL || '';
  if (!phone && phoneDigits) {
    // Quitar 54 / 549 del inicio para el teléfono “fijo/principal”
    let rest = phoneDigits;
    if (rest.startsWith('54')) rest = rest.slice(2);
    if (rest.startsWith('9') && rest.length > 10) rest = rest.slice(1);
    phone = rest || phoneDigits;
  }

  const seller = {
    contact: String(contact).slice(0, 80),
    email: String(email),
    country_code2: wa.country_code2,
    phone2: wa.phone2,
    other_info: contactCfg.otherInfo || process.env.ML_CONTACT_OTHER || '',
    webpage: contactCfg.webpage || agency.originalSite || '',
    webmail: '',
  };

  if (area_code) seller.area_code = String(area_code);
  if (phone) {
    seller.country_code = seller.country_code || '54';
    seller.phone = phone;
  }

  return seller;
}

function absolutePictures(property, publicWeb) {
  const base = String(publicWeb || '').replace(/\/$/, '');
  return (property.images || [])
    .map((img) => {
      if (!img || typeof img !== 'string') return null;
      if (img.startsWith('data:')) return null;
      if (img.startsWith('http://') || img.startsWith('https://')) return img;
      if (!base) return null;
      return `${base}/${img.replace(/^\//, '')}`;
    })
    .filter(Boolean)
    .slice(0, 12)
    .map((source) => ({ source }));
}

function areaValue(surface) {
  if (surface == null || surface === '') return null;
  const raw = String(surface).trim();
  if (!raw) return null;
  // ML espera p.ej. "170 m²"
  if (/\d/.test(raw) && /m/i.test(raw)) return raw;
  const n = Number(raw.replace(/[^\d.,]/g, '').replace(',', '.'));
  if (!Number.isFinite(n) || n <= 0) return null;
  return `${n} m²`;
}

function parkingLots(property) {
  if (property.parkingLots != null && property.parkingLots !== '') {
    const n = Number(property.parkingLots);
    return Number.isFinite(n) && n >= 0 ? n : 0;
  }
  const text = `${property.title || ''} ${property.description || ''}`.toLowerCase();
  if (/cochera|garage|estacionamiento|parking/.test(text)) return 1;
  return 0;
}

function buildAttributes(property) {
  const bedrooms = property.bedrooms ?? 0;
  const bathrooms = property.bathrooms ?? 0;
  // Ambientes ≈ dormitorios + estar (mínimo dormitorios o 1)
  const rooms =
    property.rooms != null
      ? Number(property.rooms)
      : Math.max(1, Number(bedrooms) || 0);

  const attrs = [
    { id: 'ROOMS', value_name: String(rooms) },
    { id: 'BEDROOMS', value_name: String(bedrooms ?? 0) },
    { id: 'FULL_BATHROOMS', value_name: String(bathrooms ?? 0) },
    { id: 'PARKING_LOTS', value_name: String(parkingLots(property)) },
  ];

  const total = areaValue(property.surface);
  if (total) attrs.push({ id: 'TOTAL_AREA', value_name: total });

  const covered = areaValue(property.coveredArea ?? property.covered_area);
  if (covered) attrs.push({ id: 'COVERED_AREA', value_name: covered });

  return attrs;
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

  const pictures = absolutePictures(property, cfg.publicWeb);
  if (!pictures.length) {
    throw new Error(
      'ML requiere URLs públicas http(s) de fotos. Subí a un host o Storage y usá links absolutos (no data:).',
    );
  }

  const seller_contact = buildSellerContact(cfg);

  const payload = {
    title: String(property.title || '').slice(0, 60),
    category_id: mapCategory(property.type, property.status),
    price: parsePrice(property.price),
    currency_id: String(property.price).toUpperCase().includes('USD') ? 'USD' : 'ARS',
    available_quantity: 1,
    buying_mode: 'classified',
    listing_type_id: process.env.ML_LISTING_TYPE || 'free',
    condition: 'not_specified',
    channels: ['marketplace'],
    pictures,
    description: {
      plain_text: String(property.description || property.title || '').slice(0, 50000),
    },
    location: {
      address_line: property.location || '',
    },
    attributes: buildAttributes(property),
    seller_contact,
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
