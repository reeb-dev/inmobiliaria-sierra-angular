# Inmobiliaria Sierra de la Ventana (Angular)

Sitio inmobiliario en **Angular 19** + **panel local** para fichas, IA y redes.

## Demo (GitHub Pages)

**https://reeb-dev.github.io/inmobiliaria-sierra-angular/**

## Correr en local (sitio + panel + APIs)

```bash
git clone https://github.com/reeb-dev/inmobiliaria-sierra-angular.git
cd inmobiliaria-sierra-angular
npm install
cp .env.example .env   # opcional; sin keys todo queda en modo simulado
npm run dev:all
```

Eso levanta:

| Servicio | URL |
|----------|-----|
| Web (Angular + proxy `/api`) | http://127.0.0.1:43124 |
| API de publicación | http://127.0.0.1:43125 |

Scripts sueltos:

```bash
npm run dev       # solo Angular en :43124 (proxy a :43125)
npm run dev:api   # solo API en :43125
npm run build
npm start         # build + static en :4200
```

### Panel de control

1. Abrí http://127.0.0.1:43124/panel/login  
2. Usuario: `admin` · Clave: `sierra2026`  
3. Desde el panel podés crear/editar propiedades, generar textos con IA y publicar en Mercado Libre, Instagram y Argenprop.

Los datos del panel viven en el navegador (`localStorage`). Las publicaciones pasan por la API local (`server/`).

### Credenciales reales (`.env`)

Copiá `.env.example` → `.env` y completá solo lo que uses. Sin keys, `POST /api/*/publish` responde `simulated: true` (seguro para demos).

| Canal | Variables | OAuth / conexión |
|-------|-----------|------------------|
| Mercado Libre | `ML_CLIENT_ID`, `ML_CLIENT_SECRET`, `ML_REDIRECT_URI` | http://127.0.0.1:43125/api/ml/auth (también link en Panel → Ajustes) |
| Instagram / Meta | `IG_APP_ID`, `IG_APP_SECRET`, `IG_USER_ID` o `IG_PAGE_ACCESS_TOKEN` | http://127.0.0.1:43125/api/ig/auth |
| Argenprop | `ARGENPROP_USR`, `ARGENPROP_PSD`, `ARGENPROP_ID_VENDEDOR`, `ARGENPROP_ID_ORIGEN` | credenciales partner (sin OAuth en el panel) |

Tokens OAuth se guardan en `server/.data/` (ignorado por git). Estado: `GET /api/status` · salud: `GET /api/health`.

Apps:

- ML: https://developers.mercadolibre.com.ar/
- Instagram/Meta: https://developers.facebook.com/
- Argenprop: pedir acceso a comercial / partner

## Deploy

El workflow `.github/workflows/deploy-github-pages.yml` publica el **sitio estático** en Pages en cada push a `main`. La API Node (`:43125`) es solo para desarrollo local; no corre en GitHub Pages.

## Stack

Angular 19 (standalone), TypeScript, SCSS, Node HTTP API para publicaciones.
