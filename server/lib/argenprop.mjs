/**
 * Argenprop — API de publicación (credenciales que da comercial/partner).
 * Campos típicos: usr, psd, IdVendedor, IdOrigen, SistemaOrigen.Id
 */

function absoluteImages(property, publicWeb) {
  return (property.images || [])
    .map((img) => {
      if (!img) return null;
      if (img.startsWith('http')) return img;
      if (img.startsWith('data:')) return null;
      return `${publicWeb.replace(/\/$/, '')}/${img.replace(/^\//, '')}`;
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

export async function argenpropPublish(cfg, property) {
  const a = cfg.argenprop;
  if (!a.usr || !a.psd || !a.idVendedor || !a.idOrigen) {
    throw new Error(
      'Faltan ARGENPROP_USR / PSD / ID_VENDEDOR / ID_ORIGEN en .env (las da Argenprop).',
    );
  }

  const fotos = absoluteImages(property, cfg.publicWeb).map((Url) => ({ Url }));
  if (!fotos.length) {
    throw new Error(
      'Argenprop necesita fotos con URL http(s). No acepta data: del navegador.',
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
      Precio: property.price,
    },
    visibilidades: [{ Nombre: 'Web', Activa: true }],
  };

  const url = `${a.baseUrl.replace(/\/$/, '')}/Avisos/Create/?contentType=json`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify(body),
  });

  const text = await res.text();
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    data = { raw: text };
  }

  if (!res.ok) {
    throw new Error(
      `Argenprop HTTP ${res.status}: ${typeof data === 'object' ? JSON.stringify(data).slice(0, 400) : text.slice(0, 400)}`,
    );
  }

  return {
    id: data?.ids?.[0] || data?.Id || property.id,
    permalink: 'https://www.argenprop.com/',
    raw: data,
  };
}
