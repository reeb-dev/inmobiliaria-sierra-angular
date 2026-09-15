import { Component, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { filterProperties, propertyTypes } from '../core/listings';
import { PropertyCardComponent } from '../shared/property-card.component';

@Component({
  selector: 'app-propiedades-page',
  standalone: true,
  imports: [FormsModule, PropertyCardComponent],
  template: `
    <section class="page">
      <p class="eyebrow">Catálogo</p>
      <h1>Propiedades en la comarca</h1>
      <p class="lead">
        Buscá por tipo, venta/alquiler o zona. Inventario público de la
        inmobiliaria, con fotos locales.
      </p>

      <div class="filters">
        <input
          type="search"
          placeholder="Buscar por zona, tipo o código SIE…"
          [ngModel]="q()"
          (ngModelChange)="q.set($event)"
        />
        <select [ngModel]="type()" (ngModelChange)="type.set($event)">
          <option value="todos">Todos los tipos</option>
          @for (t of types; track t) {
            <option [value]="t">{{ t }}</option>
          }
        </select>
        <select [ngModel]="status()" (ngModelChange)="status.set($event)">
          <option value="todos">Venta y alquiler</option>
          <option value="venta">En venta</option>
          <option value="alquiler">En alquiler</option>
        </select>
        <p class="count">
          {{ results().length }}
          {{
            results().length === 1
              ? 'propiedad encontrada'
              : 'propiedades encontradas'
          }}
        </p>
      </div>

      @if (results().length === 0) {
        <div class="empty">
          <h2>Sin resultados</h2>
          <p>Probá otra zona o borrá los filtros.</p>
          <button type="button" (click)="clear()">Limpiar filtros</button>
        </div>
      } @else {
        <div class="cards">
          @for (p of results(); track p.id) {
            <app-property-card [property]="p" />
          }
        </div>
      }
    </section>
  `,
  styles: [
    `
      .page {
        max-width: 72rem;
        margin: 0 auto;
        padding: 2.5rem 1.25rem 4rem;
      }
      .eyebrow {
        margin: 0;
        font-size: 0.72rem;
        letter-spacing: 0.22em;
        text-transform: uppercase;
        color: var(--leaf);
      }
      h1 {
        margin: 0.4rem 0 0;
        font-family: var(--font-display);
        font-size: clamp(2rem, 5vw, 3.2rem);
        color: var(--ink);
      }
      .lead {
        max-width: 40rem;
        color: var(--ink-soft);
        line-height: 1.55;
      }
      .filters {
        margin-top: 1.5rem;
        padding: 1rem;
        border: 1px solid var(--line);
        border-radius: 1rem;
        background: color-mix(in srgb, var(--mist) 70%, white);
        display: grid;
        gap: 0.75rem;
      }
      input,
      select {
        height: 2.75rem;
        border: 1px solid var(--line);
        border-radius: 0.55rem;
        padding: 0 0.85rem;
        background: white;
        font: inherit;
      }
      .count {
        margin: 0;
        font-size: 0.9rem;
        color: var(--ink-soft);
      }
      .cards {
        margin-top: 1.5rem;
        display: grid;
        gap: 1.2rem;
      }
      .empty {
        margin-top: 2rem;
        padding: 3rem 1rem;
        text-align: center;
        border: 1px dashed var(--line);
        border-radius: 1rem;
      }
      button {
        margin-top: 1rem;
        border: 0;
        background: transparent;
        color: var(--forest);
        font-weight: 700;
        text-decoration: underline;
        cursor: pointer;
      }
      @media (min-width: 768px) {
        .filters {
          grid-template-columns: 1.4fr 1fr 1fr;
        }
        .count {
          grid-column: 1 / -1;
        }
        .cards {
          grid-template-columns: repeat(3, 1fr);
        }
      }
    `,
  ],
})
export class PropiedadesPageComponent {
  readonly types = propertyTypes;
  readonly q = signal('');
  readonly type = signal('todos');
  readonly status = signal('todos');

  readonly results = computed(() =>
    filterProperties({
      q: this.q(),
      type: this.type(),
      status: this.status(),
    }),
  );

  clear() {
    this.q.set('');
    this.type.set('todos');
    this.status.set('todos');
  }
}
