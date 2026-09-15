import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { assetUrl } from '../core/asset-url';
import { agency } from '../core/listings';

@Component({
  selector: 'app-nosotros-page',
  standalone: true,
  imports: [RouterLink],
  template: `
    <section class="hero">
      <img [src]="img('/images/panorama-sierra.jpg')" alt="Panorama de la sierra" />
      <div class="shade"></div>
      <div class="copy">
        <p class="eyebrow">Nosotros</p>
        <h1>{{ agency.name }}</h1>
        <p>{{ agency.tagline }}</p>
      </div>
    </section>

    <section class="wrap">
      @for (p of agency.about; track p) {
        <p class="about">{{ p }}</p>
      }

      <div class="stats">
        @for (s of agency.stats; track s.label) {
          <div>
            <strong>{{ s.value }}</strong>
            <span>{{ s.label }}</span>
          </div>
        }
      </div>

      <div class="cta">
        <a routerLink="/propiedades" class="btn">Ver propiedades</a>
        <a routerLink="/contacto" class="btn ghost">Contacto</a>
      </div>
    </section>
  `,
  styles: [
    `
      .hero {
        position: relative;
        min-height: 52vh;
        overflow: hidden;
        color: #fff;
      }
      .hero img {
        position: absolute;
        inset: 0;
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
      .shade {
        position: absolute;
        inset: 0;
        background: linear-gradient(
          90deg,
          rgba(0, 0, 0, 0.65),
          rgba(0, 0, 0, 0.25)
        );
      }
      .copy {
        position: relative;
        max-width: 72rem;
        margin: 0 auto;
        padding: 6rem 1.25rem 2.5rem;
      }
      .eyebrow {
        margin: 0;
        letter-spacing: 0.2em;
        text-transform: uppercase;
        font-size: 0.72rem;
        color: var(--sand);
      }
      h1 {
        margin: 0.5rem 0 0;
        font-family: var(--font-display);
        font-size: clamp(2.2rem, 6vw, 4rem);
        max-width: 14ch;
        line-height: 1;
      }
      .wrap {
        max-width: 48rem;
        margin: 0 auto;
        padding: 3rem 1.25rem 4rem;
      }
      .about {
        color: var(--ink-soft);
        line-height: 1.65;
        font-size: 1.05rem;
      }
      .stats {
        margin-top: 2rem;
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 1rem;
      }
      .stats strong {
        display: block;
        font-family: var(--font-display);
        font-size: 1.8rem;
        color: var(--forest-deep);
      }
      .stats span {
        color: var(--ink-soft);
        font-size: 0.9rem;
      }
      .cta {
        display: flex;
        flex-wrap: wrap;
        gap: 0.7rem;
        margin-top: 2rem;
      }
      .btn {
        text-decoration: none;
        background: var(--forest);
        color: #fff;
        font-weight: 700;
        padding: 0.75rem 1.1rem;
        border-radius: 0.55rem;
      }
      .btn.ghost {
        background: transparent;
        color: var(--forest);
        border: 2px solid var(--forest);
      }
    `,
  ],
})
export class NosotrosPageComponent {
  readonly agency = agency;
  readonly img = assetUrl;
}
