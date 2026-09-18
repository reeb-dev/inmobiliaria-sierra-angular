import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DecimalPipe, DatePipe } from '@angular/common';
import { PanelStoreService } from './panel-store.service';

@Component({
  selector: 'app-panel-dashboard',
  standalone: true,
  imports: [RouterLink, DecimalPipe, DatePipe],
  template: `
    <header class="head">
      <div>
        <p class="eyebrow">Resumen</p>
        <h1>Actividad local</h1>
      </div>
      <a class="btn" routerLink="/panel/propiedades/nueva">Nueva propiedad</a>
    </header>

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
          <p class="empty">Todavía no republicaste en redes (modo simulado).</p>
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
        margin-bottom: 1.4rem;
      }
      .eyebrow {
        margin: 0;
        letter-spacing: 0.16em;
        text-transform: uppercase;
        font-size: 0.7rem;
        color: #3f7a58;
      }
      h1,
      h2 {
        margin: 0.3rem 0 0;
        font-family: var(--font-display, Georgia, serif);
        color: #163528;
      }
      h2 {
        font-size: 1.25rem;
        margin-bottom: 0.8rem;
      }
      .btn {
        background: #2f5d45;
        color: #fff;
        text-decoration: none;
        font-weight: 700;
        padding: 0.7rem 1rem;
        border-radius: 0.5rem;
      }
      .kpis {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(8rem, 1fr));
        gap: 0.75rem;
        margin-bottom: 1.4rem;
      }
      .kpis div {
        background: #fff;
        border: 1px solid #d5ddd7;
        border-radius: 0.8rem;
        padding: 1rem;
      }
      .kpis strong {
        display: block;
        font-size: 1.6rem;
        font-family: var(--font-display, Georgia, serif);
        color: #163528;
      }
      .kpis span {
        color: #5b6b62;
        font-size: 0.85rem;
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
        border: 1px solid #d5ddd7;
        border-radius: 0.9rem;
        padding: 1rem 1.1rem;
      }
      ul {
        list-style: none;
        margin: 0;
        padding: 0;
        display: grid;
        gap: 0.75rem;
      }
      li {
        display: grid;
        gap: 0.15rem;
      }
      li span,
      li small,
      .empty {
        color: #5b6b62;
        font-size: 0.9rem;
      }
      a {
        color: #2f5d45;
        font-weight: 600;
        text-decoration: none;
      }
    `,
  ],
})
export class PanelDashboardComponent {
  readonly store = inject(PanelStoreService);
  readonly totals = computed(() => this.store.totals());

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
