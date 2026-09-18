import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { PanelAuthService } from './panel-auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-panel-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <div class="shell">
      <aside class="side">
        <p class="brand">Panel Sierra</p>
        <nav>
          <a routerLink="/panel" routerLinkActive="on" [routerLinkActiveOptions]="{ exact: true }"
            >Resumen</a
          >
          <a routerLink="/panel/propiedades" routerLinkActive="on">Propiedades</a>
          <a routerLink="/panel/ajustes" routerLinkActive="on">Ajustes IA</a>
          <a routerLink="/" class="ghost">Ver sitio</a>
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
        grid-template-columns: 15rem 1fr;
        background: #f3f6f3;
      }
      .side {
        background: #163528;
        color: #fff;
        padding: 1.4rem 1rem;
        display: flex;
        flex-direction: column;
        gap: 1rem;
      }
      .brand {
        margin: 0;
        font-family: var(--font-display, Georgia, serif);
        font-size: 1.35rem;
      }
      nav {
        display: grid;
        gap: 0.35rem;
      }
      nav a {
        color: rgba(255, 255, 255, 0.82);
        text-decoration: none;
        padding: 0.55rem 0.7rem;
        border-radius: 0.45rem;
      }
      nav a.on,
      nav a:hover {
        background: rgba(255, 255, 255, 0.1);
        color: #fff;
      }
      .ghost {
        opacity: 0.75;
        font-size: 0.9rem;
      }
      .out {
        margin-top: auto;
        border: 1px solid rgba(255, 255, 255, 0.25);
        background: transparent;
        color: #fff;
        border-radius: 0.45rem;
        padding: 0.55rem;
        cursor: pointer;
      }
      .content {
        padding: 1.5rem;
      }
      @media (max-width: 800px) {
        .shell {
          grid-template-columns: 1fr;
        }
        .side {
          flex-direction: row;
          flex-wrap: wrap;
          align-items: center;
        }
        nav {
          grid-auto-flow: column;
          grid-auto-columns: max-content;
        }
        .out {
          margin-top: 0;
        }
      }
    `,
  ],
})
export class PanelLayoutComponent {
  private readonly auth = inject(PanelAuthService);
  private readonly router = inject(Router);

  logout() {
    this.auth.logout();
    void this.router.navigateByUrl('/panel/login');
  }
}
