# Inmobiliaria Sierra de la Ventana (Angular)

Sitio inmobiliario en **Angular 19** con el inventario y la identidad de
[inmobiliariasierradelaventana.com](https://www.inmobiliariasierradelaventana.com/).

## Qué incluye

- Home editorial con hero full-bleed
- Catálogo con filtros (`/propiedades`)
- Ficha de propiedad (`/propiedades/:slug`)
- Nosotros, tasaciones y contacto (WhatsApp)
- Fotos locales en `public/images` y `public/properties`

## Cómo correrlo

Modo estable (recomendado para preview): build + servidor estático, sin HMR.

```bash
npm install
npm start
```

Abrí [http://localhost:43123](http://localhost:43123).

Solo servir un build ya hecho:

```bash
npm run preview
```

Desarrollo con hot reload:

```bash
npm run dev
```

## Stack

Angular 19 (standalone), TypeScript, SCSS. Fuentes locales (sin Google Fonts en runtime).
