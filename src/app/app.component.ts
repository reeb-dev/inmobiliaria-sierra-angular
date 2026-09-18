import { Component, inject } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { filter, map, startWith } from 'rxjs';
import { SiteHeaderComponent } from './shared/site-header.component';
import { SiteFooterComponent } from './shared/site-footer.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, SiteHeaderComponent, SiteFooterComponent],
  template: `
    @if (!isPanel()) {
      <app-site-header />
    }
    <main [class.panel-main]="isPanel()">
      <router-outlet />
    </main>
    @if (!isPanel()) {
      <app-site-footer />
    }
  `,
  styles: [
    `
      :host {
        min-height: 100vh;
        display: flex;
        flex-direction: column;
      }
      main {
        flex: 1;
      }
      .panel-main {
        padding: 0;
      }
    `,
  ],
})
export class AppComponent {
  private readonly router = inject(Router);

  readonly isPanel = toSignal(
    this.router.events.pipe(
      filter((e): e is NavigationEnd => e instanceof NavigationEnd),
      map((e) => e.urlAfterRedirects.startsWith('/panel')),
      startWith(this.router.url.startsWith('/panel')),
    ),
    { initialValue: false },
  );
}
