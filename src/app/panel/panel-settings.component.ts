import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PanelStoreService } from './panel-store.service';
import type { PanelSettings } from './panel.types';

@Component({
  selector: 'app-panel-settings',
  standalone: true,
  imports: [FormsModule],
  template: `
    <header class="head">
      <p class="eyebrow">Configuración</p>
      <h1>IA y datos locales</h1>
    </header>

    <form class="card" (ngSubmit)="save()">
      <label
        >Proveedor de IA
        <select name="aiProvider" [(ngModel)]="form.aiProvider">
          <option value="local">Local (gratis, sin API)</option>
          <option value="gemini">Gemini (API key)</option>
          <option value="openai">OpenAI (API key)</option>
        </select>
      </label>
      <label
        >Gemini API key
        <input
          name="gemini"
          type="password"
          [(ngModel)]="form.geminiApiKey"
          placeholder="Opcional"
        />
      </label>
      <label
        >OpenAI API key
        <input
          name="openai"
          type="password"
          [(ngModel)]="form.openaiApiKey"
          placeholder="Opcional"
        />
      </label>
      <p class="muted">
        Sin keys, el botón “Generar texto con IA” usa un redactor local. Las keys
        quedan solo en este navegador.
      </p>
      <button type="submit">Guardar ajustes</button>
      @if (msg()) {
        <p class="ok">{{ msg() }}</p>
      }
    </form>

    <section class="card">
      <h2>Datos del panel</h2>
      <p class="muted">
        Todo corre en localStorage de este navegador. Podés restaurar el
        inventario original del sitio.
      </p>
      <button type="button" class="danger" (click)="reset()">
        Restaurar propiedades de ejemplo
      </button>
    </section>
  `,
  styles: [
    `
      .head {
        margin-bottom: 1rem;
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
        margin: 0.35rem 0 0;
        font-family: var(--font-display, Georgia, serif);
        color: #163528;
      }
      .card {
        background: #fff;
        border: 1px solid #d5ddd7;
        border-radius: 0.9rem;
        padding: 1rem;
        margin-bottom: 0.9rem;
        display: grid;
        gap: 0.75rem;
        max-width: 36rem;
      }
      label {
        display: grid;
        gap: 0.3rem;
        font-size: 0.88rem;
      }
      input,
      select {
        border: 1px solid #d5ddd7;
        border-radius: 0.5rem;
        padding: 0.65rem 0.75rem;
        font: inherit;
      }
      button {
        border: 0;
        border-radius: 0.5rem;
        background: #2f5d45;
        color: #fff;
        font-weight: 700;
        padding: 0.7rem 1rem;
        cursor: pointer;
        width: fit-content;
      }
      .danger {
        background: #f8e8e8;
        color: #9b1c1c;
      }
      .muted {
        margin: 0;
        color: #5b6b62;
        font-size: 0.9rem;
        line-height: 1.45;
      }
      .ok {
        margin: 0;
        color: #2f5d45;
      }
    `,
  ],
})
export class PanelSettingsComponent {
  private readonly store = inject(PanelStoreService);
  form: PanelSettings = { ...this.store.settings() };
  readonly msg = signal('');

  save() {
    this.store.saveSettings(this.form);
    this.msg.set('Ajustes guardados en este navegador');
  }

  reset() {
    if (!confirm('¿Volver al inventario de ejemplo y borrar publicaciones locales?')) {
      return;
    }
    this.store.resetToSeed();
    this.msg.set('Inventario restaurado');
  }
}
