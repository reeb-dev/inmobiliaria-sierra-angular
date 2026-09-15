import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { agency } from '../core/listings';

@Component({
  selector: 'app-tasaciones-page',
  standalone: true,
  imports: [FormsModule],
  template: `
    <section class="page">
      <p class="eyebrow">Tasaciones</p>
      <h1>¿Cuánto vale tu propiedad?</h1>
      <p class="lead">
        Tasamos con conocimiento del mercado local en Sierra de la Ventana,
        Villa Ventana y alrededores. Completá el formulario y te contactamos.
      </p>

      @if (sent()) {
        <div class="ok">
          <h2>Listo, recibimos tu pedido</h2>
          <p>
            También podés escribirnos por WhatsApp al {{ agency.phone }} para
            agilizar.
          </p>
          <a [href]="agency.whatsapp" target="_blank" rel="noreferrer"
            >Abrir WhatsApp</a
          >
        </div>
      } @else {
        <form class="form" (ngSubmit)="submit()">
          <label>
            Nombre
            <input name="name" [(ngModel)]="name" required />
          </label>
          <label>
            Teléfono
            <input name="phone" [(ngModel)]="phone" required />
          </label>
          <label>
            Email
            <input name="email" type="email" [(ngModel)]="email" />
          </label>
          <label>
            Zona / dirección
            <input name="zone" [(ngModel)]="zone" required />
          </label>
          <label>
            Comentarios
            <textarea name="notes" rows="4" [(ngModel)]="notes"></textarea>
          </label>
          <button type="submit">Pedir tasación</button>
        </form>
      }
    </section>
  `,
  styles: [
    `
      .page {
        max-width: 40rem;
        margin: 0 auto;
        padding: 2.5rem 1.25rem 4rem;
      }
      .eyebrow {
        margin: 0;
        font-size: 0.72rem;
        letter-spacing: 0.2em;
        text-transform: uppercase;
        color: var(--leaf);
      }
      h1 {
        margin: 0.4rem 0 0;
        font-family: var(--font-display);
        font-size: clamp(2rem, 5vw, 3rem);
        color: var(--ink);
      }
      .lead {
        color: var(--ink-soft);
        line-height: 1.55;
      }
      .form {
        margin-top: 1.5rem;
        display: grid;
        gap: 0.9rem;
      }
      label {
        display: grid;
        gap: 0.35rem;
        font-weight: 600;
        color: var(--ink);
      }
      input,
      textarea {
        border: 1px solid var(--line);
        border-radius: 0.55rem;
        padding: 0.7rem 0.85rem;
        font: inherit;
        background: #fff;
      }
      button {
        margin-top: 0.4rem;
        border: 0;
        border-radius: 0.55rem;
        background: var(--forest);
        color: #fff;
        font-weight: 700;
        padding: 0.85rem 1.1rem;
        cursor: pointer;
      }
      .ok {
        margin-top: 1.5rem;
        padding: 1.5rem;
        border-radius: 1rem;
        background: color-mix(in srgb, var(--mist) 80%, white);
        border: 1px solid var(--line);
      }
      .ok a {
        color: var(--forest);
        font-weight: 700;
      }
    `,
  ],
})
export class TasacionesPageComponent {
  readonly agency = agency;
  readonly sent = signal(false);
  name = '';
  phone = '';
  email = '';
  zone = '';
  notes = '';

  submit() {
    const text = encodeURIComponent(
      `Pedido de tasación\nNombre: ${this.name}\nTel: ${this.phone}\nEmail: ${this.email}\nZona: ${this.zone}\nNotas: ${this.notes}`,
    );
    window.open(`${agency.whatsapp}?text=${text}`, '_blank', 'noopener');
    this.sent.set(true);
  }
}
