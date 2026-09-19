import { Component, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { PanelAuthService } from './panel-auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-panel-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <div class="shell" [class.nav-open]="navOpen()">
      <button
        type="button"
        class="menu-toggle"
        (click)="navOpen.set(!navOpen())"
        [attr.aria-expanded]="navOpen()"
        aria-controls="panel-nav"
      >
        {{ navOpen() ? 'Cerrar' : 'Menú' }}
      </button>
      @if (navOpen()) {
        <button type="button" class="scrim" (click)="navOpen.set(false)" aria-label="Cerrar menú"></button>
      }
      <aside class="side" id="panel-nav">
        <div class="brand-block">
          <p class="brand">Sierra</p>
          <p class="brand-sub">Panel de control</p>
        </div>
        <nav>
          <a
            routerLink="/panel"
            routerLinkActive="on"
            [routerLinkActiveOptions]="{ exact: true }"
            (click)="navOpen.set(false)"
            >Resumen</a
          >
          <a routerLink="/panel/propiedades" routerLinkActive="on" (click)="navOpen.set(false)"
            >Propiedades</a
          >
          <a routerLink="/panel/ajustes" routerLinkActive="on" (click)="navOpen.set(false)"
            >Ajustes</a
          >
          <a routerLink="/" class="ghost" (click)="navOpen.set(false)">Ver sitio público</a>
        </nav>
        <button type="button" class="out" (click)="logout()">Salir</button>
      </aside>
      <section class="content">
        <router-outlet />
      </section>
    </div>
  `,
  styles: [
    `
      .shell {
        min-height: 100vh;
        display: grid;
        grid-template-columns: 15.5rem 1fr;
        background:
          radial-gradient(circle at 90% 0%, rgba(63, 122, 88, 0.08), transparent 28%),
          linear-gradient(180deg, #f3f6f3 0%, #eef2ef 100%);
      }
      .menu-toggle,
      .scrim {
        display: none;
      }
      .side {
        position: sticky;
        top: 0;
        align-self: start;
        height: 100vh;
        background: var(--forest-deep, #163528);
        color: #fff;
        padding: 1.5rem 1.1rem;
        display: flex;
        flex-direction: column;
        gap: 1.25rem;
        border-right: 1px solid rgba(255, 255, 255, 0.06);
      }
      .brand-block {
        padding: 0 0.35rem 0.5rem;
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
      }
      .brand {
        margin: 0;
        font-family: var(--font-display, Georgia, serif);
        font-size: 1.55rem;
        font-weight: 700;
        letter-spacing: -0.02em;
      }
      .brand-sub {
        margin: 0.2rem 0 0;
        font-size: 0.78rem;
        color: rgba(255, 255, 255, 0.55);
        letter-spacing: 0.04em;
      }
      nav {
        display: grid;
        gap: 0.3rem;
      }
      nav a {
        color: rgba(255, 255, 255, 0.78);
        text-decoration: none;
        padding: 0.6rem 0.75rem;
        border-radius: 0.45rem;
        font-weight: 600;
        font-size: 0.95rem;
        transition: background 0.15s ease, color 0.15s ease;
      }
      nav a.on {
        background: rgba(255, 255, 255, 0.14);
        color: #fff;
      }
      nav a:hover {
        background: rgba(255, 255, 255, 0.08);
        color: #fff;
      }
      .ghost {
        opacity: 0.7;
        font-size: 0.88rem;
        font-weight: 500;
        margin-top: 0.35rem;
      }
      .out {
        margin-top: auto;
        border: 1px solid rgba(255, 255, 255, 0.22);
        background: transparent;
        color: #fff;
        border-radius: 0.45rem;
        padding: 0.6rem;
        cursor: pointer;
        font: inherit;
        font-weight: 600;
      }
      .out:hover {
        background: rgba(255, 255, 255, 0.08);
      }
      .content {
        padding: 1.6rem 1.75rem 2.5rem;
        min-width: 0;
      }
      @media (max-width: 860px) {
        .shell {
          grid-template-columns: 1fr;
        }
        .menu-toggle {
          display: inline-flex;
          position: fixed;
          top: 0.85rem;
          left: 0.85rem;
          z-index: 40;
          border: 0;
          background: var(--forest, #2f5d45);
          color: #fff;
          font: inherit;
          font-weight: 700;
          font-size: 0.85rem;
          padding: 0.55rem 0.85rem;
          border-radius: 0.45rem;
          cursor: pointer;
          box-shadow: 0 4px 16px rgba(22, 53, 40, 0.2);
        }
        .scrim {
          display: block;
          position: fixed;
          inset: 0;
          z-index: 30;
          border: 0;
          background: rgba(22, 53, 40, 0.35);
          cursor: pointer;
        }
        .side {
          position: fixed;
          inset: 0 auto 0 0;
          width: min(16.5rem, 84vw);
          height: 100vh;
          z-index: 35;
          transform: translateX(-105%);
          transition: transform 0.22s ease;
          box-shadow: 8px 0 32px rgba(0, 0, 0, 0.18);
        }
        .shell.nav-open .side {
          transform: translateX(0);
        }
        .content {
          padding: 3.6rem 1rem 2rem;
        }
      }
    `,
  ],
})
export class PanelLayoutComponent {
  private readonly auth = inject(PanelAuthService);
  private readonly router = inject(Router);
  readonly navOpen = signal(false);

  logout() {
    this.auth.logout();
    void this.router.navigateByUrl('/panel/login');
  }
}
