import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { agency } from '../core/listings';

@Component({
  selector: 'app-site-footer',
  standalone: true,
  imports: [RouterLink],
  template: `
    <footer class="footer">
      <div class="grid">
        <div>
          <p class="name">{{ agency.name }}</p>
          <p class="tag">{{ agency.tagline }}</p>
        </div>
        <div>
          <p class="label">Contacto</p>
          <a [href]="agency.phoneHref">{{ agency.phone }}</a>
          <a [href]="'mailto:' + agency.email">{{ agency.email }}</a>
          <a [href]="agency.whatsapp" target="_blank" rel="noreferrer"
            >WhatsApp</a
          >
        </div>
        <div>
          <p class="label">Explorar</p>
          <a routerLink="/propiedades">Propiedades</a>
          <a routerLink="/tasaciones">Tasaciones</a>
          <a routerLink="/contacto">Contacto</a>
        </div>
      </div>
      <p class="copy">{{ agency.address }} · {{ agency.hours }}</p>
    </footer>
  `,
  styles: [
    `
      .footer {
        margin-top: auto;
        background: var(--forest-deep);
        color: rgba(255, 255, 255, 0.82);
        padding: 3rem 1.25rem 2rem;
      }
      .grid {
        max-width: 72rem;
        margin: 0 auto;
        display: grid;
        gap: 2rem;
      }
      .name {
        margin: 0;
        font-family: var(--font-display);
        font-size: 1.6rem;
        color: #fff;
      }
      .tag {
        margin: 0.6rem 0 0;
        max-width: 28rem;
        line-height: 1.5;
      }
      .label {
        margin: 0 0 0.55rem;
        font-size: 0.72rem;
        letter-spacing: 0.18em;
        text-transform: uppercase;
        color: var(--sand);
      }
      a {
        display: block;
        margin-top: 0.35rem;
        color: rgba(255, 255, 255, 0.85);
        text-decoration: none;
      }
      a:hover {
        color: #fff;
      }
      .copy {
        max-width: 72rem;
        margin: 2rem auto 0;
        padding-top: 1.2rem;
        border-top: 1px solid rgba(255, 255, 255, 0.15);
        font-size: 0.85rem;
        color: rgba(255, 255, 255, 0.55);
      }
      @media (min-width: 768px) {
        .grid {
          grid-template-columns: 1.4fr 1fr 1fr;
        }
      }
    `,
  ],
})
export class SiteFooterComponent {
  readonly agency = agency;
}
