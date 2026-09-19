import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PanelStoreService } from './panel-store.service';
import { PublishService } from './publish.service';
import type { PanelSettings } from './panel.types';

@Component({
  selector: 'app-panel-settings',
  standalone: true,
  imports: [FormsModule],
  template: `
    <header class="head">
      <p class="eyebrow">Configuración</p>
      <h1>IA y APIs de publicación</h1>
    </header>

    <section class="card">
      <h2>Estado de APIs (backend local :43125)</h2>
      @if (apiErr()) {
        <p class="err">{{ apiErr() }}</p>
      } @else if (apiStatus()) {
        <ul class="status">
          <li>
            <strong>Mercado Libre</strong>
            <span>{{ apiStatus()!.mode.mercadolibre }}</span>
            <a href="/api/ml/auth" target="_blank" rel="noreferrer">Conectar OAuth</a>
          </li>
          <li>
            <strong>Argenprop</strong>
            <span>{{ apiStatus()!.mode.argenprop }}</span>
          </li>
          <li>
            <strong>Instagram</strong>
            <span>{{ apiStatus()!.mode.instagram }}</span>
            <a href="/api/ig/auth" target="_blank" rel="noreferrer">Conectar OAuth</a>
          </li>
        </ul>
        <p class="muted">
          Credenciales en archivo <code>.env</code> (ver <code>.env.example</code>).
          Sin keys, publicar queda en modo <em>simulated</em>.
        </p>
      } @else {
        <p class="muted">Consultando API…</p>
      }
      <button type="button" class="secondary" (click)="refreshApi()">Actualizar estado</button>
    </section>

    <form class="card" (ngSubmit)="save()">
      <h2>IA</h2>
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
      <button type="submit">Guardar ajustes IA</button>
      @if (msg()) {
        <p class="ok">{{ msg() }}</p>
      }
    </form>

    <section class="card">
      <h2>Datos del panel</h2>
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
      h2 {
        font-size: 1.15rem;
        margin-bottom: 0.4rem;
      }
      .card {
        background: #fff;
        border: 1px solid #d5ddd7;
        border-radius: 0.9rem;
        padding: 1rem;
        margin-bottom: 0.9rem;
        display: grid;
        gap: 0.75rem;
        max-width: 40rem;
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
      .secondary {
        background: #e7eee8;
        color: #163528;
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
      .err {
        margin: 0;
        color: #9b1c1c;
      }
      .status {
        list-style: none;
        padding: 0;
        margin: 0;
        display: grid;
        gap: 0.55rem;
      }
      .status li {
        display: grid;
        grid-template-columns: 8rem 1fr auto;
        gap: 0.5rem;
        align-items: center;
        font-size: 0.92rem;
      }
      .status a {
        color: #2f5d45;
        font-weight: 700;
      }
      code {
        background: #f3f6f3;
        padding: 0.1rem 0.3rem;
        border-radius: 0.25rem;
      }
    `,
  ],
})
export class PanelSettingsComponent implements OnInit {
  private readonly store = inject(PanelStoreService);
  private readonly publish = inject(PublishService);
  form: PanelSettings = { ...this.store.settings() };
  readonly msg = signal('');
  readonly apiErr = signal('');
  readonly apiStatus = signal<{
    mode: Record<string, string>;
    configured: Record<string, boolean>;
    connected: Record<string, boolean>;
  } | null>(null);

  ngOnInit() {
    void this.refreshApi();
  }

  async refreshApi() {
    this.apiErr.set('');
    try {
      const s = await this.publish.status();
      this.apiStatus.set(s);
    } catch {
      this.apiStatus.set(null);
      this.apiErr.set(
        'API local no responde. Corré: npm run dev:all (web :43124 + api :43125)',
      );
    }
  }

  save() {
    this.store.saveSettings(this.form);
    this.msg.set('Ajustes IA guardados en este navegador');
  }

  reset() {
    if (!confirm('¿Volver al inventario de ejemplo y borrar publicaciones locales?')) {
      return;
    }
    this.store.resetToSeed();
    this.msg.set('Inventario restaurado');
  }
}
