# Inmobiliaria Sierra de la Ventana (rediseño)

Demo de un sitio inmobiliario más claro y usable, inspirado en la información pública de [inmobiliariasierradelaventana.com](https://www.inmobiliariasierradelaventana.com/).

## Qué mejora respecto al original

- Hero con marca fuerte y un solo mensaje (sin ruido)
- Catálogo con búsqueda y filtros por tipo / venta-alquiler
- Fichas de propiedad con galería, datos clave y CTA a WhatsApp
- Formularios de contacto y tasación
- Diseño responsive, tipografía expresiva y atmósfera serrana

Los listados y textos institucionales se tomaron del sitio público original. Las fotos de propiedades se cargan desde el CDN del portal; el hero usa una imagen de Unsplash.

## Cómo correrlo

```bash
npm install
npm run dev -- --port 43123
```

Abrí [http://127.0.0.1:43123](http://127.0.0.1:43123).

## Stack

Next.js (App Router), TypeScript, Tailwind CSS, Lucide.
