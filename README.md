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

## Preview en Cursor (importante)

El sitio corre en la **VM del Cloud Agent**. En tu Mac no hay nada en el 43123
hasta que Cursor reenvíe el puerto.

1. En la ventana del agente, arriba a la derecha, abrí el ícono de **enchufe** (Forwarded Ports).
2. Buscá el puerto **43123** (Detected) y forwardealo si no está en Auto.
3. Abrí **Open in internal browser**, o en Chrome usá exactamente el puerto local que muestre ese menú (a veces no es 43123 si ya estaba ocupado).

URL esperada: [http://localhost:43123](http://localhost:43123)

## Cómo correrlo local (en tu máquina)

```bash
npm install
npm run build
npm run preview
```

Abrí [http://localhost:43123](http://localhost:43123).

Desarrollo con hot reload:

```bash
npm run dev
```

## Stack

Angular 19 (standalone), TypeScript, SCSS. Fuentes locales (sin Google Fonts en runtime).

