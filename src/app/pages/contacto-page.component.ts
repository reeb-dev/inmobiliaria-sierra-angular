import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { agency } from '../core/listings';

@Component({
  selector: 'app-contacto-page',
  standalone: true,
  imports: [FormsModule],
  template: `
    <section class="page">
      <p class="eyebrow">Contacto</p>
      <h1>Hablemos de tu próximo lugar</h1>
      <p class="lead">
        Escribinos por el formulario, WhatsApp o teléfono. Atendemos
        {{ agency.hours.toLowerCase() }}.
      </p>

      <div class="grid">
        <div class="info">
          <p><strong>Teléfono</strong><br /><a [href]="agency.phoneHref">{{ agency.phone }}</a></p>
          <p><strong>Email</strong><br /><a [href]="'mailto:' + agency.email">{{ agency.email }}</a></p>
          <p><strong>WhatsApp</strong><br /><a [href]="agency.whatsapp" target="_blank" rel="noreferrer">Enviar mensaje</a></p>
          <p><strong>Dirección</strong><br />{{ agency.address }}</p>
        </div>

        @if (sent()) {
          <div class="ok">
            <h2>Mensaje listo</h2>
            <p>Te abrimos WhatsApp con el texto cargado para enviarlo.</p>
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
              Mensaje
              <textarea name="message" rows="5" [(ngModel)]="message" required></textarea>
            </label>
            <button type="submit">Enviar consulta</button>
          </form>
        }
      </div>
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
        letter-spacing: 0.2em;
        text-transform: uppercase;
        color: var(--leaf);
      }
      h1 {
        margin: 0.4rem 0 0;
        font-family: var(--font-display);
        font-size: clamp(2rem, 5vw, 3.2rem);
        color: var(--ink);
        max-width: 16ch;
      }
      .lead {
        max-width: 36rem;
        color: var(--ink-soft);
        line-height: 1.55;
      }
      .grid {
        margin-top: 2rem;
        display: grid;
        gap: 2rem;
      }
      .info p {
        color: var(--ink-soft);
        line-height: 1.5;
      }
      .info a {
        color: var(--forest);
        font-weight: 600;
        text-decoration: none;
      }
      .form {
        display: grid;
        gap: 0.9rem;
      }
      label {
        display: grid;
        gap: 0.35rem;
        font-weight: 600;
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
        border: 0;
        border-radius: 0.55rem;
        background: var(--forest);
        color: #fff;
        font-weight: 700;
        padding: 0.85rem 1.1rem;
        cursor: pointer;
      }
      .ok {
        padding: 1.5rem;
        border-radius: 1rem;
        border: 1px solid var(--line);
        background: color-mix(in srgb, var(--mist) 80%, white);
      }
      @media (min-width: 768px) {
        .grid {
          grid-template-columns: 0.9fr 1.1fr;
        }
      }
    `,
  ],
})
export class ContactoPageComponent {
  readonly agency = agency;
  readonly sent = signal(false);
  name = '';
  phone = '';
  message = '';

  submit() {
    const text = encodeURIComponent(
      `Consulta desde la web\nNombre: ${this.name}\nTel: ${this.phone}\nMensaje: ${this.message}`,
    );
    window.open(`${agency.whatsapp}?text=${text}`, '_blank', 'noopener');
    this.sent.set(true);
  }
}
