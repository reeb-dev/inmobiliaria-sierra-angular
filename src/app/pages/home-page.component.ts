import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  agency,
  homesFirst,
  properties,
  waLink,
  type Property,
} from '../core/listings';
import { PropertyCardComponent } from '../shared/property-card.component';

@Component({
  selector: 'app-home-page',
  standalone: true,
  imports: [RouterLink, PropertyCardComponent],
  template: `
    <section class="hero">
      <img class="bg" [src]="agency.heroImage" alt="Hueco de la Ventana" />
      <div class="shade"></div>
      <div class="copy">
        <h1>{{ agency.name }}</h1>
        <p class="lead">
          {{ agency.tagline }}. Lotes, casas y cabañas en la comarca, con
          asesoramiento local y trato cercano.
        </p>
        <div class="cta">
          <a routerLink="/propiedades" class="btn light">Ver propiedades</a>
          <a
            class="btn wa"
            [href]="agency.whatsapp"
            target="_blank"
            rel="noreferrer"
            >WhatsApp</a
          >
        </div>
        <p class="credit">Foto: Hueco de la Ventana</p>
      </div>
    </section>

    @if (spotlight; as p) {
      <section class="featured">
        <img class="bg" [src]="p.images[0]" [alt]="p.title" />
        <div class="shade dark"></div>
        <div class="copy">
          <p class="eyebrow">Destacada · {{ p.type }}</p>
          <h2>{{ p.title }}</h2>
          <p class="loc">{{ p.location }}</p>
          <p class="price">{{ p.price }}</p>
          <div class="cta">
            <a class="btn light" [routerLink]="['/propiedades', p.slug]"
              >Ver esta propiedad</a
            >
            <a class="btn wa" [href]="wa(p)" target="_blank" rel="noreferrer"
              >Consultar</a
            >
          </div>
        </div>
      </section>
    }

    <section class="wrap">
      <div class="intro">
        <p class="eyebrow leaf">Vivir en las sierras</p>
        <h2 class="ink">Casas y cabañas con carácter</h2>
        <p class="muted">
          Una selección editorial: menos grilla, más deseo. Cada propiedad con
          su historia y su entorno.
        </p>
      </div>

      @for (p of editorial; track p.id; let i = $index) {
        <article class="editorial" [class.reverse]="i % 2 === 1">
          <a class="media" [routerLink]="['/propiedades', p.slug]">
            <img [src]="p.images[0]" [alt]="p.title" />
            <span>{{ p.type }}</span>
          </a>
          <div>
            <p class="eyebrow leaf">
              {{ p.status === 'alquiler' ? 'Alquiler' : 'En venta' }}
            </p>
            <h3>{{ p.title }}</h3>
            <p class="price ink">{{ p.price }}</p>
            <p class="muted">{{ p.location }}</p>
            <p class="muted clamp">{{ p.description }}</p>
            <a class="btn primary" [routerLink]="['/propiedades', p.slug]"
              >Ver ficha</a
            >
          </div>
        </article>
      }
    </section>

    @if (more.length) {
      <section class="band">
        <div class="wrap">
          <div class="row">
            <div>
              <p class="eyebrow leaf">Más opciones</p>
              <h2 class="ink">Otras propiedades para explorar</h2>
            </div>
            <a routerLink="/propiedades" class="btn primary">Ver catálogo</a>
          </div>
          <div class="cards">
            @for (p of more; track p.id) {
              <app-property-card [property]="p" />
            }
          </div>
        </div>
      </section>
    }

    <section class="wrap why">
      <div class="media-box">
        <img src="/images/villa-ventana.jpg" alt="Villa Ventana" />
      </div>
      <div>
        <p class="eyebrow leaf">Por qué nosotros</p>
        <h2 class="ink">Conocimiento local, trato humano</h2>
        <p class="muted">{{ agency.about[0] }}</p>
        <ul>
          @for (s of agency.stats; track s.label) {
            <li>
              <strong>{{ s.value }}</strong>
              <span>{{ s.label }}</span>
            </li>
          }
        </ul>
        <a routerLink="/nosotros" class="btn primary">Conocé la inmobiliaria</a>
      </div>
    </section>

    <section class="wrap strip">
      <img src="/images/cerro-ceferino.jpg" alt="Cerro Ceferino" />
      <img src="/images/ingreso-sierra.jpg" alt="Ingreso a la sierra" />
      <img src="/images/arroyo-sauce.jpg" alt="Arroyo Sauce" />
    </section>

    <section class="cta-band">
      <img class="bg" src="/images/formaciones.jpg" alt="" />
      <div class="shade deep"></div>
      <div class="copy short">
        <h2>¿Querés vender o saber cuánto vale tu propiedad?</h2>
        <p class="lead">
          Tasaciones con lectura del mercado local. Una charla sin compromiso
          para empezar.
        </p>
        <div class="cta">
          <a routerLink="/tasaciones" class="btn light">Pedir tasación</a>
          <a class="btn light" [href]="agency.phoneHref"
            >Llamar {{ agency.phone }}</a
          >
        </div>
      </div>
    </section>
  `,
  styles: [
    `
      .hero,
      .featured,
      .cta-band {
        position: relative;
        min-height: 90vh;
        overflow: hidden;
        color: #fff;
      }
      .featured {
        min-height: 78vh;
      }
      .cta-band {
        min-height: auto;
        margin: 0 1.25rem 3rem;
        border-radius: 1.5rem;
      }
      .bg {
        position: absolute;
        inset: 0;
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
      .hero .bg {
        object-position: center 35%;
      }
      .shade {
        position: absolute;
        inset: 0;
        background: linear-gradient(
          90deg,
          rgba(0, 0, 0, 0.58),
          rgba(0, 0, 0, 0.2) 55%,
          transparent
        );
      }
      .shade.dark {
        background: linear-gradient(
          90deg,
          rgba(0, 0, 0, 0.78),
          rgba(0, 0, 0, 0.35),
          rgba(0, 0, 0, 0.15)
        );
      }
      .shade.deep {
        background: color-mix(in srgb, var(--forest-deep) 88%, transparent);
      }
      .copy {
        position: relative;
        max-width: 72rem;
        margin: 0 auto;
        padding: 7rem 1.25rem 3.5rem;
        min-height: inherit;
        display: flex;
        flex-direction: column;
        justify-content: flex-end;
      }
      .copy.short {
        padding: 3rem 1.5rem;
        min-height: auto;
      }
      h1 {
        margin: 0;
        font-family: var(--font-display);
        font-size: clamp(2.6rem, 8vw, 5.2rem);
        line-height: 0.95;
        max-width: 12ch;
      }
      h2 {
        margin: 0.35rem 0 0;
        font-family: var(--font-display);
        font-size: clamp(1.8rem, 4vw, 3rem);
        line-height: 1.05;
      }
      h3 {
        margin: 0.35rem 0 0;
        font-family: var(--font-display);
        font-size: clamp(1.5rem, 3vw, 2.1rem);
        color: var(--ink);
      }
      .ink {
        color: var(--ink);
      }
      .lead {
        margin: 1.1rem 0 0;
        max-width: 34rem;
        font-size: 1.05rem;
        line-height: 1.55;
        color: rgba(255, 255, 255, 0.95);
      }
      .eyebrow {
        margin: 0;
        font-size: 0.72rem;
        letter-spacing: 0.22em;
        text-transform: uppercase;
        color: var(--sand);
      }
      .eyebrow.leaf {
        color: var(--leaf);
      }
      .cta {
        display: flex;
        flex-wrap: wrap;
        gap: 0.7rem;
        margin-top: 1.5rem;
      }
      .credit {
        margin: 1.4rem 0 0;
        font-size: 0.7rem;
        color: rgba(255, 255, 255, 0.55);
      }
      .btn {
        display: inline-flex;
        align-items: center;
        text-decoration: none;
        border-radius: 0.55rem;
        padding: 0.75rem 1.1rem;
        font-weight: 700;
        font-size: 0.92rem;
      }
      .btn.light {
        background: #fff;
        color: var(--forest-deep);
      }
      .btn.wa {
        background: #1f8f4e;
        color: #fff;
      }
      .btn.primary {
        background: var(--forest);
        color: #fff;
        margin-top: 1rem;
      }
      .wrap {
        max-width: 72rem;
        margin: 0 auto;
        padding: 3.5rem 1.25rem;
      }
      .intro {
        max-width: 36rem;
        margin-bottom: 2.5rem;
      }
      .muted {
        color: var(--ink-soft);
        line-height: 1.55;
      }
      .editorial {
        display: grid;
        gap: 1.5rem;
        margin-bottom: 3.5rem;
      }
      .media {
        position: relative;
        display: block;
        overflow: hidden;
        border-radius: 1.4rem;
        aspect-ratio: 5 / 4;
      }
      .media img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
      .media span {
        position: absolute;
        top: 1rem;
        left: 1rem;
        background: #fff;
        color: var(--forest-deep);
        font-size: 0.68rem;
        font-weight: 700;
        letter-spacing: 0.06em;
        text-transform: uppercase;
        padding: 0.28rem 0.55rem;
        border-radius: 0.4rem;
      }
      .price {
        margin: 0.7rem 0 0;
        font-family: var(--font-display);
        font-size: 1.7rem;
      }
      .price.ink {
        color: var(--forest);
      }
      .loc {
        margin: 0.45rem 0 0;
        color: rgba(255, 255, 255, 0.8);
      }
      .clamp {
        display: -webkit-box;
        -webkit-line-clamp: 3;
        -webkit-box-orient: vertical;
        overflow: hidden;
      }
      .band {
        border-block: 1px solid var(--line);
        background: rgba(255, 255, 255, 0.35);
      }
      .row {
        display: flex;
        flex-wrap: wrap;
        justify-content: space-between;
        gap: 1rem;
        align-items: end;
        margin-bottom: 1.8rem;
      }
      .cards {
        display: grid;
        gap: 1.2rem;
      }
      .why {
        display: grid;
        gap: 2rem;
        align-items: center;
      }
      .media-box {
        overflow: hidden;
        border-radius: 1.4rem;
        aspect-ratio: 4 / 3;
      }
      .media-box img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
      .why ul {
        list-style: none;
        padding: 0;
        margin: 1.2rem 0 1.4rem;
        display: grid;
        gap: 0.7rem;
      }
      .why li {
        display: grid;
        gap: 0.15rem;
      }
      .why strong {
        font-family: var(--font-display);
        font-size: 1.5rem;
        color: var(--forest-deep);
      }
      .strip {
        display: grid;
        gap: 0.75rem;
        padding-top: 0;
      }
      .strip img {
        width: 100%;
        aspect-ratio: 5 / 4;
        object-fit: cover;
        border-radius: 1rem;
      }
      @media (min-width: 768px) {
        .editorial {
          grid-template-columns: 1fr 1fr;
          align-items: center;
          gap: 2.5rem;
        }
        .editorial.reverse .media {
          order: 2;
        }
        .cards {
          grid-template-columns: repeat(3, 1fr);
        }
        .why {
          grid-template-columns: 1fr 1fr;
        }
        .strip {
          grid-template-columns: repeat(3, 1fr);
        }
      }
    `,
  ],
})
export class HomePageComponent {
  readonly agency = agency;
  private readonly homes = homesFirst();
  readonly spotlight: Property | undefined = this.homes[0] ?? properties[0];
  readonly editorial = this.homes.slice(1, 4);
  readonly more = (this.homes.length > 4 ? this.homes.slice(4) : properties)
    .filter((p) => p.id !== this.spotlight?.id)
    .slice(0, 3);

  wa(p: Property) {
    return waLink(p);
  }
}
