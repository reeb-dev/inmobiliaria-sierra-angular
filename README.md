# Inmobiliaria Sierra de la Ventana (Angular)

Sitio inmobiliario en **Angular 19** + **panel local** para fichas, IA y redes.

## Demo (GitHub Pages)

**https://reeb-dev.github.io/inmobiliaria-sierra-angular/**

## Correr en local

```bash
git clone https://github.com/reeb-dev/inmobiliaria-sierra-angular.git
cd inmobiliaria-sierra-angular
npm install
npm run dev
```

Abrí http://localhost:4200

### Panel de control (local)

1. Abrí http://localhost:4200/panel/login  
2. Usuario: `admin` · Clave: `sierra2026`  
3. Desde el panel podés:
   - crear/editar propiedades y fotos
   - generar textos con IA (modo local gratis; Gemini/OpenAI opcional en Ajustes)
   - simular publicación / republicación en Mercado Libre, Instagram y Argenprop
   - ver estadísticas por interacción

Los datos del panel viven en el navegador (`localStorage`). No publican de verdad en portales hasta conectar APIs/OAuth.

```bash
npm start         # build + static en :4200
npm run dev       # hot reload
npm run build:pages
```

## Deploy

El workflow `.github/workflows/deploy-github-pages.yml` publica en Pages
en cada push a `main`.

## Stack

Angular 19 (standalone), TypeScript, SCSS.