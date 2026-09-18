import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import {
  PANEL_DEMO_PASS,
  PANEL_DEMO_USER,
  PanelAuthService,
} from './panel-auth.service';

@Component({
  selector: 'app-panel-login',
  standalone: true,
  imports: [FormsModule, RouterLink],
  template: `
    <div class="wrap">
      <form class="card" (ngSubmit)="submit()">
        <p class="eyebrow">Panel local</p>
        <h1>Inmobiliaria Sierra</h1>
        <p class="hint">
          Demo local — usuario <code>{{ demoUser }}</code> / clave
          <code>{{ demoPass }}</code>
        </p>
        <label>
          Usuario
          <input name="user" [(ngModel)]="user" autocomplete="username" />
        </label>
        <label>
          Contraseña
          <input
            name="pass"
            type="password"
            [(ngModel)]="pass"
            autocomplete="current-password"
          />
        </label>
        @if (error()) {
          <p class="err">{{ error() }}</p>
        }
        <button type="submit">Entrar</button>
        <a routerLink="/" class="back">← Volver al sitio</a>
      </form>
    </div>
  `,
  styles: [
    `
      .wrap {
        min-height: 100vh;
        display: grid;
        place-items: center;
        padding: 1.5rem;
        background:
          radial-gradient(circle at 20% 20%, rgba(217, 196, 160, 0.35), transparent 40%),
          #e7eee8;
      }
      .card {
        width: min(100%, 24rem);
        background: #fff;
        border: 1px solid #d5ddd7;
        border-radius: 1rem;
        padding: 1.75rem;
        display: grid;
        gap: 0.85rem;
      }
      .eyebrow {
        margin: 0;
        letter-spacing: 0.18em;
        text-transform: uppercase;
        font-size: 0.7rem;
        color: #3f7a58;
      }
      h1 {
        margin: 0;
        font-family: var(--font-display, Georgia, serif);
        font-size: 1.8rem;
        color: #163528;
      }
      .hint {
        margin: 0;
        color: #5b6b62;
        font-size: 0.9rem;
        line-height: 1.45;
      }
      code {
        background: #f3f6f3;
        padding: 0.1rem 0.35rem;
        border-radius: 0.3rem;
      }
      label {
        display: grid;
        gap: 0.35rem;
        font-size: 0.85rem;
        color: #163528;
      }
      input {
        border: 1px solid #d5ddd7;
        border-radius: 0.55rem;
        padding: 0.7rem 0.8rem;
      }
      button {
        border: 0;
        border-radius: 0.55rem;
        background: #2f5d45;
        color: #fff;
        font-weight: 700;
        padding: 0.8rem;
        cursor: pointer;
      }
      .err {
        margin: 0;
        color: #9b1c1c;
        font-size: 0.9rem;
      }
      .back {
        text-align: center;
        color: #5b6b62;
        text-decoration: none;
        font-size: 0.9rem;
      }
    `,
  ],
})
export class PanelLoginComponent {
  private readonly auth = inject(PanelAuthService);
  private readonly router = inject(Router);

  readonly demoUser = PANEL_DEMO_USER;
  readonly demoPass = PANEL_DEMO_PASS;
  user = PANEL_DEMO_USER;
  pass = '';
  readonly error = signal('');

  constructor() {
    if (this.auth.loggedIn()) {
      void this.router.navigateByUrl('/panel');
    }
  }

  submit() {
    this.error.set('');
    if (!this.auth.login(this.user, this.pass)) {
      this.error.set('Usuario o contraseña incorrectos');
      return;
    }
    void this.router.navigateByUrl('/panel');
  }
}
