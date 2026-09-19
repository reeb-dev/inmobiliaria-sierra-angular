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

### Credenciales y login automático

En el panel → **Ajustes IA** podés pegar las keys y conectar:

1. **Mercado Libre** → Guardar app → **Iniciar sesión ML** (popup OAuth, vuelve solo)
2. **Instagram** → Guardar app → **Iniciar sesión Instagram**
3. **Argenprop** → usr/psd/Ids → **Guardar login Argenprop**

Si publicás sin sesión, el panel abre el login OAuth solo y reintenta.

También sirve `.env` (ver `.env.example`). Tokens en `server/.data/` (gitignored).

| Canal | Dónde sacar keys | Redirect URI local |
|-------|------------------|--------------------|
| Mercado Libre | developers.mercadolibre.com.ar | `http://127.0.0.1:43125/api/ml/callback` |
| Instagram/Meta | developers.facebook.com | `http://127.0.0.1:43125/api/ig/callback` |
| Argenprop | comercial / partner | login por usr/psd (sin OAuth web) |

ML envía `seller_contact` (WhatsApp `country_code2`/`phone2`) desde `ML_CONTACT_*` o `agency` en `listings.json`. Instagram usa Facebook Login; el publish espera `status_code=FINISHED` del contenedor antes de `media_publish`.

Estado: `GET /api/status` · salud: `GET /api/health`.

## Deploy

El workflow `.github/workflows/deploy-github-pages.yml` publica el **sitio estático** en Pages en cada push a `main`. La API Node (`:43125`) es solo para desarrollo local; no corre en GitHub Pages.

## Stack

Angular 19 (standalone), TypeScript, SCSS, Node HTTP API para publicaciones.
