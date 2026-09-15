import { Component, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { agency } from '../core/listings';

@Component({
  selector: 'app-site-header',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  template: `
    <header class="header">
      <div class="bar">
        <a routerLink="/" class="brand" (click)="menuOpen.set(false)">
          <span class="name">Sierra de la Ventana</span>
          <span class="sub">Inmobiliaria</span>
        </a>

        <nav class="nav desktop">
          @for (link of links; track link.path) {
            <a
              [routerLink]="link.path"
              routerLinkActive="active"
              [routerLinkActiveOptions]="{ exact: false }"
              >{{ link.label }}</a
            >
          }
        </nav>

        <div class="actions">
          <a class="phone" [href]="agency.phoneHref">{{ agency.phone }}</a>
          <button
            type="button"
            class="burger"
            (click)="toggleMenu()"
            [attr.aria-expanded]="menuOpen()"
            aria-label="Menú"
          >
            {{ menuOpen() ? '✕' : '☰' }}
          </button>
        </div>
      </div>

      @if (menuOpen()) {
        <div class="mobile">
          @for (link of links; track link.path) {
            <a [routerLink]="link.path" (click)="menuOpen.set(false)">{{
              link.label
            }}</a>
          }
          <a [href]="agency.whatsapp" target="_blank" rel="noreferrer"
            >WhatsApp</a
          >
        </div>
      }
    </header>
  `,
  styles: [
    `
      .header {
        position: sticky;
        top: 0;
        z-index: 40;
        border-bottom: 1px solid var(--line);
        background: color-mix(in srgb, var(--mist) 90%, transparent);
        backdrop-filter: blur(14px);
      }
      .bar {
        max-width: 72rem;
        margin: 0 auto;
        padding: 0.85rem 1.25rem;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 1rem;
      }
      .brand {
        text-decoration: none;
        color: var(--forest-deep);
      }
      .name {
        display: block;
        font-family: var(--font-display);
        font-size: 1.35rem;
        line-height: 1;
      }
      .sub {
        display: block;
        margin-top: 0.3rem;
        font-size: 0.68rem;
        letter-spacing: 0.18em;
        text-transform: uppercase;
        color: var(--ink-soft);
      }
      .nav {
        display: none;
        gap: 0.2rem;
      }
      .nav a {
        text-decoration: none;
        color: var(--ink-soft);
        font-weight: 600;
        font-size: 0.92rem;
        padding: 0.5rem 0.85rem;
        border-radius: 0.5rem;
      }
      .nav a.active,
      .nav a:hover {
        background: var(--forest);
        color: #fff;
      }
      .actions {
        display: flex;
        align-items: center;
        gap: 0.5rem;
      }
      .phone {
        display: none;
        text-decoration: none;
        background: var(--forest-deep);
        color: #fff;
        font-weight: 600;
        font-size: 0.85rem;
        padding: 0.55rem 0.9rem;
        border-radius: 0.55rem;
      }
      .burger {
        width: 2.5rem;
        height: 2.5rem;
        border: 2px solid var(--forest);
        border-radius: 0.5rem;
        background: #fff;
        color: var(--forest);
        cursor: pointer;
      }
      .mobile {
        display: grid;
        gap: 0.2rem;
        padding: 0.75rem 1.25rem 1rem;
        border-top: 1px solid var(--line);
        background: #fff;
      }
      .mobile a {
        text-decoration: none;
        color: var(--ink);
        font-weight: 600;
        padding: 0.75rem 0.85rem;
        border-radius: 0.5rem;
      }
      @media (min-width: 768px) {
        .nav {
          display: flex;
        }
        .phone {
          display: inline-flex;
        }
        .burger,
        .mobile {
          display: none;
        }
      }
    `,
  ],
})
export class SiteHeaderComponent {
  readonly agency = agency;
  readonly menuOpen = signal(false);
  readonly links = [
    { path: '/propiedades', label: 'Propiedades' },
    { path: '/nosotros', label: 'Nosotros' },
    { path: '/tasaciones', label: 'Tasaciones' },
    { path: '/contacto', label: 'Contacto' },
  ];

  toggleMenu() {
    this.menuOpen.update((v) => !v);
  }
}
