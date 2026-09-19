/**
 * Argenprop — API de publicación (credenciales que da comercial/partner).
 * Campos típicos: usr, psd, IdVendedor, IdOrigen, SistemaOrigen.Id
 */

function absoluteImages(property, publicWeb) {
  const base = String(publicWeb || '').replace(/\/$/, '');
  return (property.images || [])
    .map((img) => {
      if (!img || typeof img !== 'string') return null;
      if (img.startsWith('http://') || img.startsWith('https://')) return img;
      if (img.startsWith('data:')) return null;
      if (!base) return null;
      return `${base}/${img.replace(/^\//, '')}`;
    })
    .filter(Boolean)
    .slice(0, 20);
}

function tipoPropiedad(type) {
  const map = {
    Casa: 'Casa',
    Cabaña: 'Cabaña',
    Casaquinta: 'Casa',
    Departamento: 'Departamento',
    Terreno: 'Terreno',
    Local: 'Local',
    Campo: 'Campo',
  };
  return map[type] || 'Casa';
}

function formatArgenpropError(res, data, text) {
  if (typeof data === 'object' && data) {
    const msg =
      data.Message ||
      data.message ||
      data.error ||
      data.Error ||
      data.Descripcion ||
      (Array.isArray(data.errors) ? data.errors.join('; ') : null);
    if (msg) return `Argenprop HTTP ${res.status}: ${msg}`;
    const slice = JSON.stringify(data).slice(0, 400);
    return `Argenprop HTTP ${res.status}: ${slice}`;
  }
  return `Argenprop HTTP ${res.status}: ${(text || 'respuesta vacía').slice(0, 400)}`;
}

export async function argenpropPublish(cfg, property) {
  const a = cfg.argenprop;
  if (!a.usr || !a.psd || !a.idVendedor || !a.idOrigen) {
    throw new Error(
      'Faltan ARGENPROP_USR / PSD / ID_VENDEDOR / ID_ORIGEN en .env o Ajustes (las da Argenprop comercial).',
    );
  }

  const fotos = absoluteImages(property, cfg.publicWeb).map((Url) => ({ Url }));
  if (!fotos.length) {
    throw new Error(
      'Argenprop necesita fotos con URL http(s) absolutas. No acepta data: del navegador; usá rutas relativas del sitio o links públicos.',
    );
  }

  const body = {
    usr: a.usr,
    psd: a.psd,
    tipoProp: tipoPropiedad(property.type),
    aviso: {
      EsWeb: false,
      Titulo: String(property.title).slice(0, 100),
      IdOrigen: property.id,
      SistemaOrigen: { Id: a.sistemaOrigenId || Number(a.idOrigen) || 0 },
      InformacionAdicional: property.description || '',
      TipoOperacion: property.status === 'alquiler' ? 'Alquiler' : 'Venta',
      Vendedor: {
        IdOrigen: a.idVendedor,
        SistemaOrigen: { Id: a.sistemaOrigenId || Number(a.idOrigen) || 0 },
      },
      Fotos: fotos,
    },
    propiedad: {
      Direccion: property.location,
      Ambientes: property.bedrooms ?? 0,
      Banios: property.bathrooms ?? 0,
      SuperficieTotal: property.surface ? Number(property.surface) : 0,
      SuperficieCubierta: property.coveredArea
        ? Number(property.coveredArea)
        : 0,
      Cocheras: property.parkingLots != null ? Number(property.parkingLots) : 0,
      Precio: property.price,
    },
    visibilidades: [{ Nombre: 'Web', Activa: true }],
  };

  const url = `${a.baseUrl.replace(/\/$/, '')}/Avisos/Create/?contentType=json`;
  let res;
  try {
    res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(body),
    });
  } catch (e) {
    throw new Error(
      `Argenprop no responde (${a.baseUrl}): ${e instanceof Error ? e.message : String(e)}`,
    );
  }

  const text = await res.text();
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    data = { raw: text };
  }

  if (!res.ok) {
    throw new Error(formatArgenpropError(res, data, text));
  }

  // Algunas respuestas 200 traen error de negocio
  if (data?.error || data?.Error || data?.Success === false) {
    throw new Error(
      formatArgenpropError(
        { status: res.status },
        data,
        text,
      ).replace(/^Argenprop HTTP \d+:/, 'Argenprop:'),
    );
  }

  return {
    id: data?.ids?.[0] || data?.Id || property.id,
    permalink: 'https://www.argenprop.com/',
    raw: data,
  };
}
