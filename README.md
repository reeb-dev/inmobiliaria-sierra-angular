# Inmobiliaria Sierra de la Ventana (Angular)

Sitio inmobiliario en **Angular 19** con inventario y marca de
[inmobiliariasierradelaventana.com](https://www.inmobiliariasierradelaventana.com/).

## Correr en tu máquina (recomendado)

```bash
git clone <URL_DE_ESTE_REPO>
cd inmobiliaria-sierra-angular
npm install
npm start
```

Abrí **http://localhost:4200**

Atajos:

```bash
npm run preview   # sirve el build ya generado
npm run dev       # Angular CLI con hot reload (puerto 4200)
```

## Qué incluye

- Home editorial con hero full-bleed
- Catálogo con filtros (`/propiedades`)
- Ficha (`/propiedades/:slug`)
- Nosotros, tasaciones y contacto (WhatsApp)
- Fotos locales en `public/images` y `public/properties`

## Nota sobre Cloud Agent / preview

Si usás un Cloud Agent de Cursor, el puerto vive en la VM remota.
Tenés que forwardarlo con el ícono de enchufe (Forwarded Ports) o
correr el proyecto localmente con los pasos de arriba.

## Stack

Angular 19 (standalone), TypeScript, SCSS. Fuentes locales.
