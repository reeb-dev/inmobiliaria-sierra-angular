import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DecimalPipe, DatePipe } from '@angular/common';
import { PanelStoreService } from './panel-store.service';
import { PublishService, type ApiStatus } from './publish.service';

@Component({
  selector: 'app-panel-dashboard',
  standalone: true,
  imports: [RouterLink, DecimalPipe, DatePipe],
  template: `
    <header class="head">
      <div>
        <p class="eyebrow">Resumen</p>
        <h1>Actividad del panel</h1>
        <p class="lead">Inventario local, publicaciones y estado de los canales.</p>
      </div>
      <a class="btn" routerLink="/panel/propiedades/nueva">Nueva propiedad</a>
    </header>

    <div class="channels" aria-label="Estado de canales">
      @for (ch of channelRows(); track ch.key) {
        <div class="ch">
          <div>
            <strong>{{ ch.label }}</strong>
            <span class="badge" [attr.data-mode]="ch.mode">{{ modeLabel(ch.mode) }}</span>
          </div>
          @if (ch.mode === 'needs_oauth') {
            <a class="mini" routerLink="/panel/ajustes">Conectar</a>
          } @else if (ch.mode === 'missing_credentials') {
            <a class="mini" routerLink="/panel/ajustes">Configurar</a>
          } @else {
            <span class="mini ok">Listo</span>
          }
        </div>
      }
    </div>

    <div class="kpis">
      <div>
        <strong>{{ store.properties().length }}</strong>
        <span>Propiedades</span>
      </div>
      <div>
        <strong>{{ totals().webViews | number }}</strong>
        <span>Vistas web</span>
      </div>
      <div>
        <strong>{{ totals().mlViews | number }}</strong>
        <span>Vistas ML</span>
      </div>
      <div>
        <strong>{{ totals().igReach | number }}</strong>
        <span>Alcance IG</span>
      </div>
      <div>
        <strong>{{ totals().contacts | number }}</strong>
        <span>Contactos</span>
      </div>
    </div>

    <div class="grid">
      <section>
        <h2>Últimas publicaciones</h2>
        @if (!store.publications().length) {
          <p class="empty">Todavía no publicaste en redes. Abrí una ficha y usá Publicar.</p>
        } @else {
          <ul>
            @for (p of store.publications().slice(0, 8); track p.id) {
              <li>
                <strong>{{ channelLabel(p.channel) }}</strong>
                <span>{{ p.message }}</span>
                <small>{{ p.at | date: 'short' }}</small>
              </li>
            }
          </ul>
        }
      </section>
      <section>
        <h2>Top por contactos</h2>
        <ul>
          @for (row of topContacts(); track row.propertyId) {
            <li>
              <a [routerLink]="['/panel/propiedades', row.propertyId]">{{
                titleOf(row.propertyId)
              }}</a>
              <span>{{ row.contacts }} contactos · {{ row.webViews }} vistas</span>
            </li>
          } @empty {
            <li><span class="empty">Sin estadísticas aún.</span></li>
          }
        </ul>
      </section>
    </div>
  `,
  styles: [
    `
      .head {
        display: flex;
        justify-content: space-between;
        gap: 1rem;
        align-items: end;
        margin-bottom: 1.35rem;
      }
      .eyebrow {
        margin: 0;
        letter-spacing: 0.16em;
        text-transform: uppercase;
        font-size: 0.7rem;
        color: var(--leaf, #3f7a58);
        font-weight: 700;
      }
      h1,
      h2 {
        margin: 0.3rem 0 0;
        font-family: var(--font-display, Georgia, serif);
        color: var(--forest-deep, #163528);
      }
      .lead {
        margin: 0.4rem 0 0;
        color: var(--ink-soft, #5b6b62);
        font-size: 0.95rem;
        max-width: 36rem;
      }
      h2 {
        font-size: 1.2rem;
        margin-bottom: 0.85rem;
      }
      .btn {
        background: var(--forest, #2f5d45);
        color: #fff;
        text-decoration: none;
        font-weight: 700;
        padding: 0.72rem 1.05rem;
        border-radius: 0.5rem;
        white-space: nowrap;
      }
      .channels {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(11rem, 1fr));
        gap: 0.65rem;
        margin-bottom: 1rem;
      }
      .ch {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 0.5rem;
        background: rgba(255, 255, 255, 0.72);
        border: 1px solid var(--line, #d5ddd7);
        border-radius: 0.75rem;
        padding: 0.75rem 0.9rem;
      }
      .ch strong {
        display: block;
        font-size: 0.88rem;
        color: var(--forest-deep, #163528);
        margin-bottom: 0.25rem;
      }
      .badge {
        display: inline-block;
        font-size: 0.68rem;
        font-weight: 700;
        letter-spacing: 0.04em;
        text-transform: uppercase;
        padding: 0.18rem 0.45rem;
        border-radius: 0.3rem;
      }
      .badge[data-mode='live'] {
        background: #dceee3;
        color: #1a5c38;
      }
      .badge[data-mode='needs_oauth'] {
        background: #f5ecd4;
        color: #7a5a12;
      }
      .badge[data-mode='missing_credentials'] {
        background: #f0e4e4;
        color: #8a2e2e;
      }
      .mini {
        font-size: 0.8rem;
        font-weight: 700;
        color: var(--forest, #2f5d45);
        text-decoration: none;
      }
      .mini.ok {
        color: #1a5c38;
      }
      .kpis {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(8rem, 1fr));
        gap: 0.75rem;
        margin-bottom: 1.35rem;
      }
      .kpis div {
        background: #fff;
        border: 1px solid var(--line, #d5ddd7);
        border-radius: 0.8rem;
        padding: 1rem 1.05rem;
      }
      .kpis strong {
        display: block;
        font-size: 1.65rem;
        font-family: var(--font-display, Georgia, serif);
        color: var(--forest-deep, #163528);
        line-height: 1.15;
      }
      .kpis span {
        color: var(--ink-soft, #5b6b62);
        font-size: 0.84rem;
      }
      .grid {
        display: grid;
        gap: 1rem;
      }
      @media (min-width: 900px) {
        .grid {
          grid-template-columns: 1fr 1fr;
        }
      }
      section {
        background: #fff;
        border: 1px solid var(--line, #d5ddd7);
        border-radius: 0.9rem;
        padding: 1.05rem 1.15rem;
      }
      ul {
        list-style: none;
        margin: 0;
        padding: 0;
        display: grid;
        gap: 0.8rem;
      }
      li {
        display: grid;
        gap: 0.15rem;
        padding-bottom: 0.75rem;
        border-bottom: 1px solid #eef2ef;
      }
      li:last-child {
        border-bottom: 0;
        padding-bottom: 0;
      }
      li span,
      li small,
      .empty {
        color: var(--ink-soft, #5b6b62);
        font-size: 0.9rem;
      }
      a {
        color: var(--forest, #2f5d45);
        font-weight: 600;
        text-decoration: none;
      }
      @media (max-width: 600px) {
        .head {
          flex-direction: column;
          align-items: stretch;
        }
      }
    `,
  ],
})
export class PanelDashboardComponent implements OnInit {
  readonly store = inject(PanelStoreService);
  private readonly publish = inject(PublishService);
  readonly totals = computed(() => this.store.totals());
  readonly apiStatus = signal<ApiStatus | null>(null);

  ngOnInit() {
    void this.publish
      .status()
      .then((s) => this.apiStatus.set(s))
      .catch(() => this.apiStatus.set(null));
  }

  channelRows() {
    const mode = this.apiStatus()?.mode;
    return [
      { key: 'ml', label: 'Mercado Libre', mode: mode?.mercadolibre || 'missing_credentials' },
      { key: 'ig', label: 'Instagram', mode: mode?.instagram || 'missing_credentials' },
      { key: 'ap', label: 'Argenprop', mode: mode?.argenprop || 'missing_credentials' },
    ];
  }

  modeLabel(mode: string) {
    if (mode === 'live') return 'Conectado';
    if (mode === 'needs_oauth') return 'Falta login';
    return 'Sin keys';
  }

  topContacts() {
    return [...this.store.stats()]
      .sort((a, b) => b.contacts - a.contacts)
      .slice(0, 6);
  }

  titleOf(id: string) {
    return this.store.get(id)?.title || id;
  }

  channelLabel(ch: string) {
    if (ch === 'mercadolibre') return 'Mercado Libre';
    if (ch === 'instagram') return 'Instagram';
    if (ch === 'argenprop') return 'Argenprop';
    return ch;
  }
}
