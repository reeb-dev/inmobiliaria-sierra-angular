# Inmobiliaria Sierra de la Ventana (Angular)

Sitio inmobiliario en **Angular 19**.

## Demo (GitHub Pages)

Cuando el workflow termine:

**https://reeb-dev.github.io/inmobiliaria-sierra-angular/**

## Correr en local

```bash
git clone https://github.com/reeb-dev/inmobiliaria-sierra-angular.git
cd inmobiliaria-sierra-angular
npm install
npm start
```

Abrí http://localhost:4200

```bash
npm run dev       # hot reload
npm run build:pages   # build para GitHub Pages
```

## Deploy

El workflow `.github/workflows/deploy-github-pages.yml` publica en Pages
en cada push a `main`.

En el repo de GitHub: **Settings → Pages → Source: GitHub Actions**.

## Stack

Angular 19 (standalone), TypeScript, SCSS.
