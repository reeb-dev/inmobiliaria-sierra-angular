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
      <div class="stage">
        <div class="brand-pane" aria-hidden="true">
          <p class="mark">Sierra</p>
          <p class="tag">Panel de la inmobiliaria</p>
        </div>
        <form class="card" (ngSubmit)="submit()">
          <p class="eyebrow">Acceso local</p>
          <h1>Inmobiliaria Sierra de la Ventana</h1>
          <p class="hint">
            Demo del panel — usuario <code>{{ demoUser }}</code> · clave
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
          <button type="submit">Entrar al panel</button>
          <a routerLink="/" class="back">Volver al sitio público</a>
        </form>
      </div>
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
          radial-gradient(ellipse at 15% 20%, rgba(217, 196, 160, 0.4), transparent 42%),
          radial-gradient(ellipse at 88% 10%, rgba(47, 93, 69, 0.18), transparent 38%),
          linear-gradient(165deg, #e7eee8 0%, #f3f6f3 48%, #ebe6da 100%);
      }
      .stage {
        width: min(100%, 52rem);
        display: grid;
        grid-template-columns: 1fr;
        gap: 0;
        border-radius: 1.15rem;
        overflow: hidden;
        border: 1px solid rgba(213, 221, 215, 0.9);
        box-shadow: 0 24px 48px rgba(22, 53, 40, 0.1);
        background: #fff;
      }
      @media (min-width: 760px) {
        .stage {
          grid-template-columns: 0.95fr 1.15fr;
        }
      }
      .brand-pane {
        display: none;
        background:
          linear-gradient(160deg, rgba(22, 53, 40, 0.92), rgba(47, 93, 69, 0.85)),
          radial-gradient(circle at 30% 70%, rgba(217, 196, 160, 0.35), transparent 50%);
        color: #fff;
        padding: 2.5rem 2rem;
        min-height: 18rem;
        align-content: end;
      }
      @media (min-width: 760px) {
        .brand-pane {
          display: grid;
        }
      }
      .mark {
        margin: 0;
        font-family: var(--font-display, Georgia, serif);
        font-size: clamp(2.4rem, 4vw, 3.2rem);
        font-weight: 700;
        letter-spacing: -0.03em;
        line-height: 1;
      }
      .tag {
        margin: 0.65rem 0 0;
        font-size: 0.95rem;
        opacity: 0.82;
        max-width: 14rem;
        line-height: 1.4;
      }
      .card {
        padding: 1.85rem 1.75rem 1.6rem;
        display: grid;
        gap: 0.85rem;
      }
      .eyebrow {
        margin: 0;
        letter-spacing: 0.18em;
        text-transform: uppercase;
        font-size: 0.68rem;
        color: var(--leaf, #3f7a58);
        font-weight: 700;
      }
      h1 {
        margin: 0;
        font-family: var(--font-display, Georgia, serif);
        font-size: clamp(1.45rem, 3vw, 1.85rem);
        color: var(--forest-deep, #163528);
        line-height: 1.2;
      }
      .hint {
        margin: 0;
        color: var(--ink-soft, #5b6b62);
        font-size: 0.9rem;
        line-height: 1.45;
      }
      code {
        background: #f3f6f3;
        padding: 0.1rem 0.35rem;
        border-radius: 0.3rem;
        font-size: 0.85em;
      }
      label {
        display: grid;
        gap: 0.35rem;
        font-size: 0.85rem;
        color: var(--forest-deep, #163528);
        font-weight: 600;
      }
      input {
        border: 1px solid var(--line, #d5ddd7);
        border-radius: 0.55rem;
        padding: 0.75rem 0.85rem;
        font: inherit;
        font-weight: 400;
      }
      input:focus {
        outline: 2px solid rgba(47, 93, 69, 0.25);
        border-color: var(--leaf, #3f7a58);
      }
      button {
        border: 0;
        border-radius: 0.55rem;
        background: var(--forest, #2f5d45);
        color: #fff;
        font: inherit;
        font-weight: 700;
        padding: 0.85rem;
        cursor: pointer;
        margin-top: 0.2rem;
      }
      button:hover {
        background: var(--forest-deep, #163528);
      }
      .err {
        margin: 0;
        color: #9b1c1c;
        font-size: 0.9rem;
      }
      .back {
        text-align: center;
        color: var(--ink-soft, #5b6b62);
        text-decoration: none;
        font-size: 0.9rem;
      }
      .back:hover {
        color: var(--forest, #2f5d45);
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
