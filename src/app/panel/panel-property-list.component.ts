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
        <p class="lead">{{ store.properties().length }} fichas en este navegador</p>
      </div>
      <a class="btn" routerLink="/panel/propiedades/nueva">Nueva</a>
    </header>

    <div class="table">
      @for (p of store.properties(); track p.id) {
        <article>
          <img [src]="thumb(p.images[0])" [alt]="p.title" />
          <div class="meta">
            <div class="tags">
              <span class="id">{{ p.id }}</span>
              <span class="type">{{ p.type }}</span>
              <span class="op" [attr.data-op]="p.status">{{
                p.status === 'alquiler' ? 'Alquiler' : 'Venta'
              }}</span>
            </div>
            <h2>{{ p.title }}</h2>
            <p class="price">{{ p.price }} · {{ p.location }}</p>
            <p class="muted">
              Actualizada {{ p.updatedAt | date: 'short' }} ·
              {{ store.statsFor(p.id).contacts }} contactos
            </p>
          </div>
          <a class="link" [routerLink]="['/panel/propiedades', p.id]">Editar</a>
        </article>
      } @empty {
        <p class="empty">No hay propiedades. Creá la primera.</p>
      }
    </div>
  `,
  styles: [
    `
      .head {
        display: flex;
        justify-content: space-between;
        align-items: end;
        margin-bottom: 1.25rem;
        gap: 1rem;
      }
      .eyebrow {
        margin: 0;
        letter-spacing: 0.16em;
        text-transform: uppercase;
        font-size: 0.7rem;
        color: var(--leaf, #3f7a58);
        font-weight: 700;
      }
      h1 {
        margin: 0.3rem 0 0;
        font-family: var(--font-display, Georgia, serif);
        color: var(--forest-deep, #163528);
      }
      .lead {
        margin: 0.35rem 0 0;
        color: var(--ink-soft, #5b6b62);
        font-size: 0.92rem;
      }
      .btn {
        background: var(--forest, #2f5d45);
        color: #fff;
        text-decoration: none;
        font-weight: 700;
        padding: 0.68rem 1.05rem;
        border-radius: 0.5rem;
      }
      .table {
        display: grid;
        gap: 0.55rem;
      }
      article {
        display: grid;
        grid-template-columns: 6.8rem 1fr auto;
        gap: 1rem;
        align-items: center;
        background: #fff;
        border: 1px solid var(--line, #d5ddd7);
        border-radius: 0.85rem;
        padding: 0.75rem;
        transition: border-color 0.15s ease, box-shadow 0.15s ease;
      }
      article:hover {
        border-color: #b8c9bc;
        box-shadow: 0 6px 20px rgba(22, 53, 40, 0.06);
      }
      img {
        width: 6.8rem;
        height: 5rem;
        object-fit: cover;
        border-radius: 0.5rem;
        background: #d5ddd7;
      }
      h2 {
        margin: 0.3rem 0 0.2rem;
        font-size: 1.05rem;
        color: var(--forest-deep, #163528);
        font-family: var(--font-display, Georgia, serif);
        font-weight: 600;
        line-height: 1.3;
      }
      .tags {
        display: flex;
        flex-wrap: wrap;
        gap: 0.35rem;
        align-items: center;
      }
      .id,
      .type {
        font-size: 0.72rem;
        color: var(--ink-soft, #5b6b62);
        font-weight: 600;
      }
      .op {
        font-size: 0.68rem;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.04em;
        padding: 0.15rem 0.4rem;
        border-radius: 0.28rem;
      }
      .op[data-op='venta'] {
        background: #dceee3;
        color: #1a5c38;
      }
      .op[data-op='alquiler'] {
        background: #e4eaf2;
        color: #2a4a6e;
      }
      .price,
      .muted,
      .empty {
        margin: 0;
        color: var(--ink-soft, #5b6b62);
        font-size: 0.86rem;
      }
      .price {
        color: var(--ink, #1a2a22);
        font-weight: 600;
      }
      .link {
        color: var(--forest, #2f5d45);
        font-weight: 700;
        text-decoration: none;
        padding: 0.5rem 0.75rem;
        border-radius: 0.4rem;
        background: #e7eee8;
      }
      .link:hover {
        background: #d8e5db;
      }
      @media (max-width: 700px) {
        .head {
          flex-direction: column;
          align-items: stretch;
        }
        article {
          grid-template-columns: 5.2rem 1fr;
        }
        .link {
          grid-column: 1 / -1;
          text-align: center;
        }
      }
    `,
  ],
})
export class PanelPropertyListComponent {
  readonly store = inject(PanelStoreService);

  thumb(src?: string) {
    if (!src)
      return (
        'data:image/svg+xml,' +
        encodeURIComponent(
          '<svg xmlns="http://www.w3.org/2000/svg" width="120" height="90"><rect fill="#d5ddd7" width="100%" height="100%"/></svg>',
        )
      );
    if (src.startsWith('data:') || src.startsWith('http')) return src;
    return assetUrl(src);
  }
}
