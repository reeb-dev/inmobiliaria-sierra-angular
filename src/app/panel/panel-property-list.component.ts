import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { assetUrl } from '../core/asset-url';
import { PanelStoreService } from './panel-store.service';

@Component({
  selector: 'app-panel-property-list',
  standalone: true,
  imports: [RouterLink, DatePipe],
  template: `
    <header class="head">
      <div>
        <p class="eyebrow">Inventario</p>
        <h1>Propiedades</h1>
      </div>
      <a class="btn" routerLink="/panel/propiedades/nueva">Nueva</a>
    </header>

    <div class="table">
      @for (p of store.properties(); track p.id) {
        <article>
          <img [src]="thumb(p.images[0])" [alt]="p.title" />
          <div class="meta">
            <p class="id">{{ p.id }} · {{ p.type }} · {{ p.status }}</p>
            <h2>{{ p.title }}</h2>
            <p>{{ p.price }} · {{ p.location }}</p>
            <p class="muted">
              Actualizada {{ p.updatedAt | date: 'short' }} ·
              {{ store.statsFor(p.id).contacts }} contactos
            </p>
          </div>
          <a class="link" [routerLink]="['/panel/propiedades', p.id]">Editar</a>
        </article>
      }
    </div>
  `,
  styles: [
    `
      .head {
        display: flex;
        justify-content: space-between;
        align-items: end;
        margin-bottom: 1.2rem;
      }
      .eyebrow {
        margin: 0;
        letter-spacing: 0.16em;
        text-transform: uppercase;
        font-size: 0.7rem;
        color: #3f7a58;
      }
      h1 {
        margin: 0.3rem 0 0;
        font-family: var(--font-display, Georgia, serif);
        color: #163528;
      }
      .btn {
        background: #2f5d45;
        color: #fff;
        text-decoration: none;
        font-weight: 700;
        padding: 0.65rem 1rem;
        border-radius: 0.5rem;
      }
      .table {
        display: grid;
        gap: 0.75rem;
      }
      article {
        display: grid;
        grid-template-columns: 6.5rem 1fr auto;
        gap: 0.9rem;
        align-items: center;
        background: #fff;
        border: 1px solid #d5ddd7;
        border-radius: 0.85rem;
        padding: 0.7rem;
      }
      img {
        width: 6.5rem;
        height: 4.8rem;
        object-fit: cover;
        border-radius: 0.55rem;
        background: #d5ddd7;
      }
      h2 {
        margin: 0.15rem 0;
        font-size: 1.05rem;
        color: #163528;
      }
      .id,
      .muted,
      p {
        margin: 0;
        color: #5b6b62;
        font-size: 0.86rem;
      }
      .link {
        color: #2f5d45;
        font-weight: 700;
        text-decoration: none;
      }
      @media (max-width: 700px) {
        article {
          grid-template-columns: 5rem 1fr;
        }
        .link {
          grid-column: 1 / -1;
        }
      }
    `,
  ],
})
export class PanelPropertyListComponent {
  readonly store = inject(PanelStoreService);

  thumb(src?: string) {
    if (!src) return 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="120" height="90"><rect fill="#d5ddd7" width="100%" height="100%"/></svg>');
    if (src.startsWith('data:') || src.startsWith('http')) return src;
    return assetUrl(src);
  }
}
