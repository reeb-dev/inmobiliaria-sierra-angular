import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PanelStoreService } from './panel-store.service';
import { PublishService } from './publish.service';
import type { PanelSettings } from './panel.types';
import type { ApiStatus } from './publish.service';

@Component({
  selector: 'app-panel-settings',
  standalone: true,
  imports: [FormsModule],
  template: `
    <header class="head">
      <p class="eyebrow">Configuración</p>
      <h1>Login APIs + IA</h1>
    </header>

    <section class="card">
      <h2>Estado</h2>
      @if (apiErr()) {
        <p class="err">{{ apiErr() }}</p>
      } @else if (apiStatus()) {
        <ul class="status">
          <li>
            <strong>Mercado Libre</strong>
            <span [class.live]="apiStatus()!.mode.mercadolibre === 'live'">{{
              apiStatus()!.mode.mercadolibre
            }}</span>
          </li>
          <li>
            <strong>Argenprop</strong>
            <span [class.live]="apiStatus()!.mode.argenprop === 'live'">{{
              apiStatus()!.mode.argenprop
            }}</span>
          </li>
          <li>
            <strong>Instagram</strong>
            <span [class.live]="apiStatus()!.mode.instagram === 'live'">{{
              apiStatus()!.mode.instagram
            }}</span>
          </li>
        </ul>
      }
      <button type="button" class="secondary" (click)="refreshApi()">Actualizar</button>
      @if (connMsg()) {
        <p class="ok">{{ connMsg() }}</p>
      }
    </section>

    <section class="card">
      <h2>Mercado Libre — login automático</h2>
      <p class="muted">
        1) Creá una app en developers.mercadolibre.com.ar · 2) Redirect URI:
        <code>http://127.0.0.1:43125/api/ml/callback</code> · 3) Guardá y Conectar
        (abre login de ML y vuelve solo).
      </p>
      <label>Client ID <input [(ngModel)]="ml.clientId" name="mlId" /></label>
      <label
        >Client Secret
        <input type="password" [(ngModel)]="ml.clientSecret" name="mlSecret" placeholder="••••"
      /></label>
      <div class="row">
        <button type="button" (click)="saveMl()">Guardar app ML</button>
        <button type="button" class="secondary" [disabled]="busy()" (click)="connectMl()">
          {{ busy() === 'ml' ? 'Conectando…' : 'Iniciar sesión ML' }}
        </button>
      </div>
    </section>

    <section class="card">
      <h2>Instagram / Meta — login automático</h2>
      <p class="muted">
        Redirect:
        <code>http://127.0.0.1:43125/api/ig/callback</code>. Cuenta Professional +
        página de Facebook.
      </p>
      <label>App ID <input [(ngModel)]="ig.appId" name="igId" /></label>
      <label
        >App Secret
        <input type="password" [(ngModel)]="ig.appSecret" name="igSecret" placeholder="••••"
      /></label>
      <label>IG User ID <input [(ngModel)]="ig.igUserId" name="igUser" /></label>
      <label
        >Page token (opcional)
        <input
          type="password"
          [(ngModel)]="ig.pageAccessToken"
          name="igToken"
          placeholder="••••"
      /></label>
      <div class="row">
        <button type="button" (click)="saveIg()">Guardar app IG</button>
        <button type="button" class="secondary" [disabled]="busy()" (click)="connectIg()">
          {{ busy() === 'ig' ? 'Conectando…' : 'Iniciar sesión Instagram' }}
        </button>
      </div>
    </section>

    <section class="card">
      <h2>Argenprop — login con credenciales</h2>
      <p class="muted">
        No usa OAuth web: comercial te da usr/psd/Ids. Los guardás acá y quedan
        listos para publicar.
      </p>
      <label>Usuario <input [(ngModel)]="ap.usr" name="apUsr" /></label>
      <label
        >Clave <input type="password" [(ngModel)]="ap.psd" name="apPsd" placeholder="••••"
      /></label>
      <label>Id Vendedor <input [(ngModel)]="ap.idVendedor" name="apVend" /></label>
      <label>Id Origen <input [(ngModel)]="ap.idOrigen" name="apOri" /></label>
      <label
        >Sistema Origen Id
        <input [(ngModel)]="ap.sistemaOrigenId" name="apSys"
      /></label>
      <button type="button" [disabled]="busy()" (click)="loginAp()">
        {{ busy() === 'ap' ? 'Guardando…' : 'Guardar login Argenprop' }}
      </button>
    </section>

    <form class="card" (ngSubmit)="saveAi()">
      <h2>IA</h2>
      <label
        >Proveedor
        <select name="aiProvider" [(ngModel)]="form.aiProvider">
          <option value="local">Local (gratis)</option>
          <option value="gemini">Gemini</option>
          <option value="openai">OpenAI</option>
        </select>
      </label>
      <label
        >Gemini key
        <input type="password" name="gemini" [(ngModel)]="form.geminiApiKey"
      /></label>
      <label
        >OpenAI key
        <input type="password" name="openai" [(ngModel)]="form.openaiApiKey"
      /></label>
      <button type="submit">Guardar IA</button>
      @if (msg()) {
        <p class="ok">{{ msg() }}</p>
      }
    </form>

    <section class="card">
      <h2>Datos del panel</h2>
      <button type="button" class="danger" (click)="reset()">Restaurar ejemplo</button>
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
        margin: 0.35rem 0 0.5rem;
        font-family: var(--font-display, Georgia, serif);
        color: #163528;
      }
      h2 {
        font-size: 1.15rem;
      }
      .card {
        background: #fff;
        border: 1px solid #d5ddd7;
        border-radius: 0.9rem;
        padding: 1rem;
        margin-bottom: 0.9rem;
        display: grid;
        gap: 0.7rem;
        max-width: 42rem;
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
      .row {
        display: flex;
        flex-wrap: wrap;
        gap: 0.55rem;
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
        gap: 0.45rem;
      }
      .status li {
        display: flex;
        justify-content: space-between;
        gap: 1rem;
      }
      .live {
        color: #2f5d45;
        font-weight: 700;
      }
      code {
        background: #f3f6f3;
        padding: 0.1rem 0.3rem;
        border-radius: 0.25rem;
        font-size: 0.8rem;
      }
    `,
  ],
})
export class PanelSettingsComponent implements OnInit {
  private readonly store = inject(PanelStoreService);
  private readonly publish = inject(PublishService);

  form: PanelSettings = { ...this.store.settings() };
  ml = { clientId: '', clientSecret: '' };
  ig = { appId: '', appSecret: '', igUserId: '', pageAccessToken: '' };
  ap = {
    usr: '',
    psd: '',
    idVendedor: '',
    idOrigen: '',
    sistemaOrigenId: '',
  };

  readonly msg = signal('');
  readonly connMsg = signal('');
  readonly apiErr = signal('');
  readonly busy = signal<'' | 'ml' | 'ig' | 'ap'>('');
  readonly apiStatus = signal<ApiStatus | null>(null);

  ngOnInit() {
    void this.refreshApi();
    void this.loadCreds();
  }

  async refreshApi() {
    this.apiErr.set('');
    try {
      this.apiStatus.set(await this.publish.status());
    } catch {
      this.apiStatus.set(null);
      this.apiErr.set('API local no responde. Corré npm run dev:all');
    }
  }

  async loadCreds() {
    try {
      const c = (await this.publish.getCredentials()) as {
        ml?: { clientId?: string };
        ig?: { appId?: string; igUserId?: string };
        argenprop?: {
          usr?: string;
          idVendedor?: string;
          idOrigen?: string;
          sistemaOrigenId?: string | number;
        };
      };
      this.ml.clientId = c.ml?.clientId || '';
      this.ig.appId = c.ig?.appId || '';
      this.ig.igUserId = c.ig?.igUserId || '';
      this.ap.usr = c.argenprop?.usr || '';
      this.ap.idVendedor = c.argenprop?.idVendedor || '';
      this.ap.idOrigen = c.argenprop?.idOrigen || '';
      this.ap.sistemaOrigenId = String(c.argenprop?.sistemaOrigenId || '');
    } catch {
      /* ignore */
    }
  }

  async saveMl() {
    await this.publish.saveCredentials({ ml: { ...this.ml } });
    this.connMsg.set('App Mercado Libre guardada');
    await this.refreshApi();
  }

  async connectMl() {
    this.busy.set('ml');
    this.connMsg.set('');
    try {
      if (this.ml.clientId || this.ml.clientSecret) {
        await this.publish.saveCredentials({ ml: { ...this.ml } });
      }
      const ok = await this.publish.connectOAuth('mercadolibre');
      this.connMsg.set(
        ok
          ? 'Sesión Mercado Libre activa'
          : 'No se completó el login ML (¿cerraste el popup?)',
      );
      await this.refreshApi();
    } catch (e) {
      this.connMsg.set(e instanceof Error ? e.message : 'Error ML');
    } finally {
      this.busy.set('');
    }
  }

  async saveIg() {
    await this.publish.saveCredentials({ ig: { ...this.ig } });
    this.connMsg.set('App Instagram/Meta guardada');
    await this.refreshApi();
  }

  async connectIg() {
    this.busy.set('ig');
    this.connMsg.set('');
    try {
      if (this.ig.appId || this.ig.appSecret || this.ig.igUserId) {
        await this.publish.saveCredentials({ ig: { ...this.ig } });
      }
      const ok = await this.publish.connectOAuth('instagram');
      this.connMsg.set(
        ok
          ? 'Sesión Instagram activa'
          : 'No se completó el login IG (¿cerraste el popup?)',
      );
      await this.refreshApi();
    } catch (e) {
      this.connMsg.set(e instanceof Error ? e.message : 'Error IG');
    } finally {
      this.busy.set('');
    }
  }

  async loginAp() {
    this.busy.set('ap');
    this.connMsg.set('');
    try {
      const res = await this.publish.loginArgenprop({ ...this.ap });
      this.connMsg.set(res.message);
      this.apiStatus.set(res.status);
    } catch (e) {
      this.connMsg.set(e instanceof Error ? e.message : 'Error Argenprop');
    } finally {
      this.busy.set('');
    }
  }

  saveAi() {
    this.store.saveSettings(this.form);
    this.msg.set('Ajustes IA guardados');
  }

  reset() {
    if (!confirm('¿Restaurar inventario de ejemplo?')) return;
    this.store.resetToSeed();
    this.msg.set('Inventario restaurado');
  }
}
