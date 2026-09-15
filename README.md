# Inmobiliaria Sierra de la Ventana (rediseño)

Demo de un sitio inmobiliario más claro y usable, inspirado en la información pública de [inmobiliariasierradelaventana.com](https://www.inmobiliariasierradelaventana.com/).

## Qué mejora respecto al original

- Hero con marca fuerte y un solo mensaje (sin ruido)
- Catálogo con búsqueda y filtros por tipo / venta-alquiler
- Fichas de propiedad con galería, datos clave y CTA a WhatsApp
- Formularios de contacto y tasación
- Diseño responsive, tipografía expresiva y atmósfera serrana

Los listados y textos institucionales se tomaron del sitio público original. Las fotos de propiedades se cargan desde el CDN del portal; el hero usa una imagen de Unsplash.

## Fotos con mejora automática al publicar

Cada vez que se publican propiedades, las fotos se procesan solas:

```bash
# Mejora todas (o las pendientes) y actualiza el catálogo
npm run publish:images

# Demo rápida (4 propiedades × 4 fotos)
npm run publish:images:demo
```

También podés publicar por API:

```bash
curl -X POST http://127.0.0.1:43123/api/publish \
  -H 'content-type: application/json' \
  -d '{"property":{"id":"SIE-999","title":"Cabaña demo","images":["https://..."]}}'
```

El pipeline (Sharp):
1. Prefiere el original sin watermark si existe
2. Upscale a ~1600px si viene chica
3. Normaliza contraste, satura levemente y afina nitidez
4. Guarda JPEG mozjpeg en `public/properties/{id}/`
5. Actualiza `src/data/listings.json` con las URLs locales

## Cómo correrlo

```bash
npm install
npm run publish:images        # opcional: localiza/mejora fotos del catálogo
npm run build
npm run start -- --port 43123 --hostname 0.0.0.0
```

Abrí [http://127.0.0.1:43123](http://127.0.0.1:43123).

Para desarrollo (puede ser más pesado por HMR):

```bash
npm run dev -- --port 43123 --hostname 0.0.0.0
```

> Tip: si el preview se “clava”, usá `build` + `start` (modo producción). Las fotos del catálogo viven en `public/properties/` para no depender del CDN remoto.

## Stack

Next.js (App Router), TypeScript, Tailwind CSS, Lucide, Sharp.
