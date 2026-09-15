import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SiteHeaderComponent } from './shared/site-header.component';
import { SiteFooterComponent } from './shared/site-footer.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, SiteHeaderComponent, SiteFooterComponent],
  template: `
    <app-site-header />
    <main>
      <router-outlet />
    </main>
    <app-site-footer />
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
    `,
  ],
})
export class AppComponent {}
