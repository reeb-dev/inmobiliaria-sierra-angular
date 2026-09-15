import { Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { map } from 'rxjs';
import {
  agency,
  getBySlug,
  relatedProperties,
  waLink,
  type Property,
} from '../core/listings';
import { PropertyCardComponent } from '../shared/property-card.component';

@Component({
  selector: 'app-propiedad-detail-page',
  standalone: true,
  imports: [RouterLink, PropertyCardComponent],
  template: `
    @if (property(); as p) {
      <section class="page">
        <a routerLink="/propiedades" class="back">← Volver al catálogo</a>
        <div class="layout">
          <div class="gallery">
            @for (img of p.images; track img; let i = $index) {
              <img
                [src]="img"
                [alt]="p.title + ' foto ' + (i + 1)"
                [class.main]="i === 0"
              />
            }
          </div>
          <aside>
            <p class="eyebrow">
              {{ p.type }} ·
              {{ p.status === 'alquiler' ? 'Alquiler' : 'Venta' }}
            </p>
            <h1>{{ p.title }}</h1>
            <p class="price">{{ p.price }}</p>
            <p class="loc">{{ p.location }}</p>
            <div class="facts">
              @if (p.bedrooms != null) {
                <span>{{ p.bedrooms }} dormitorios</span>
              }
              @if (p.bathrooms != null) {
                <span>{{ p.bathrooms }} baños</span>
              }
              @if (p.surface) {
                <span>{{ p.surface }} m²</span>
              }
              <span>{{ p.id }}</span>
            </div>
            <p class="desc">{{ p.description }}</p>
            <div class="cta">
              <a class="btn wa" [href]="wa(p)" target="_blank" rel="noreferrer"
                >Consultar por WhatsApp</a
              >
              <a class="btn phone" [href]="agency.phoneHref">{{
                agency.phone
              }}</a>
            </div>
          </aside>
        </div>

        @if (related().length) {
          <div class="related">
            <h2>También te puede interesar</h2>
            <div class="cards">
              @for (r of related(); track r.id) {
                <app-property-card [property]="r" />
              }
            </div>
          </div>
        }
      </section>
    } @else {
      <section class="page empty">
        <h1>Propiedad no encontrada</h1>
        <a routerLink="/propiedades">Volver al catálogo</a>
      </section>
    }
  `,
  styles: [
    `
      .page {
        max-width: 72rem;
        margin: 0 auto;
        padding: 1.5rem 1.25rem 4rem;
      }
      .back {
        color: var(--forest);
        text-decoration: none;
        font-weight: 600;
      }
      .layout {
        margin-top: 1.25rem;
        display: grid;
        gap: 1.5rem;
      }
      .gallery {
        display: grid;
        gap: 0.6rem;
        grid-template-columns: 1fr 1fr;
      }
      .gallery img {
        width: 100%;
        aspect-ratio: 4 / 3;
        object-fit: cover;
        border-radius: 1rem;
        background: var(--mist);
      }
      .gallery img.main {
        grid-column: 1 / -1;
        aspect-ratio: 16 / 10;
      }
      aside {
        position: sticky;
        top: 5.5rem;
        align-self: start;
        padding: 1.25rem;
        border: 1px solid var(--line);
        border-radius: 1.1rem;
        background: rgba(255, 255, 255, 0.7);
      }
      .eyebrow {
        margin: 0;
        font-size: 0.72rem;
        letter-spacing: 0.18em;
        text-transform: uppercase;
        color: var(--leaf);
      }
      h1 {
        margin: 0.45rem 0 0;
        font-family: var(--font-display);
        font-size: clamp(1.7rem, 4vw, 2.4rem);
        line-height: 1.1;
        color: var(--ink);
      }
      .price {
        margin: 0.8rem 0 0;
        font-family: var(--font-display);
        font-size: 2rem;
        color: var(--forest-deep);
      }
      .loc,
      .desc {
        color: var(--ink-soft);
        line-height: 1.55;
      }
      .facts {
        display: flex;
        flex-wrap: wrap;
        gap: 0.7rem;
        margin: 1rem 0;
        font-size: 0.9rem;
        color: var(--ink-soft);
      }
      .cta {
        display: grid;
        gap: 0.6rem;
        margin-top: 1.2rem;
      }
      .btn {
        display: inline-flex;
        justify-content: center;
        text-decoration: none;
        border-radius: 0.55rem;
        padding: 0.8rem 1rem;
        font-weight: 700;
      }
      .btn.wa {
        background: #1f8f4e;
        color: #fff;
      }
      .btn.phone {
        background: var(--forest-deep);
        color: #fff;
      }
      .related {
        margin-top: 3rem;
      }
      .related h2 {
        font-family: var(--font-display);
        color: var(--ink);
      }
      .cards {
        margin-top: 1rem;
        display: grid;
        gap: 1.2rem;
      }
      .empty {
        text-align: center;
        padding-top: 4rem;
      }
      @media (min-width: 900px) {
        .layout {
          grid-template-columns: 1.4fr 0.8fr;
          gap: 2rem;
        }
        .cards {
          grid-template-columns: repeat(3, 1fr);
        }
      }
    `,
  ],
})
export class PropiedadDetailPageComponent {
  private readonly route = inject(ActivatedRoute);
  readonly agency = agency;

  private readonly slug = toSignal(
    this.route.paramMap.pipe(map((p) => p.get('slug') ?? '')),
    { initialValue: '' },
  );

  readonly property = computed(() => getBySlug(this.slug()));
  readonly related = computed(() => {
    const p = this.property();
    return p ? relatedProperties(p) : [];
  });

  wa(p: Property) {
    return waLink(p);
  }
}
