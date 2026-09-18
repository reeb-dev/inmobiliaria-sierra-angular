import { Injectable, signal } from '@angular/core';

const KEY = 'sierra-panel-auth';
/** Credencial local de demo — cambiar en producción real. */
export const PANEL_DEMO_USER = 'admin';
export const PANEL_DEMO_PASS = 'sierra2026';

@Injectable({ providedIn: 'root' })
export class PanelAuthService {
  readonly loggedIn = signal(this.read());

  login(user: string, pass: string): boolean {
    const ok =
      user.trim() === PANEL_DEMO_USER && pass === PANEL_DEMO_PASS;
    if (ok) {
      localStorage.setItem(KEY, '1');
      this.loggedIn.set(true);
    }
    return ok;
  }

  logout() {
    localStorage.removeItem(KEY);
    this.loggedIn.set(false);
  }

  private read() {
    try {
      return localStorage.getItem(KEY) === '1';
    } catch {
      return false;
    }
  }
}
