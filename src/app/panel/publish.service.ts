import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import type { PanelProperty, PublishChannel } from './panel.types';
import { PanelStoreService } from './panel-store.service';

export type ApiChannelStatus = {
  mercadolibre: boolean;
  argenprop: boolean;
  instagram: boolean;
};

export type ApiStatus = {
  configured: ApiChannelStatus;
  connected: ApiChannelStatus;
  mode: {
    mercadolibre: string;
    argenprop: string;
    instagram: string;
  };
  authUrls?: {
    mercadolibre?: string;
    instagram?: string;
    argenprop?: string;
  };
};

type PublishApiResponse = {
  simulated?: boolean;
  needsAuth?: boolean;
  authUrl?: string | null;
  channel: PublishChannel;
  message: string;
  externalUrl?: string;
  remoteId?: string;
  error?: string;
};

@Injectable({ providedIn: 'root' })
export class PublishService {
  private readonly store = inject(PanelStoreService);
  private readonly http = inject(HttpClient);

  private endpoint(channel: PublishChannel) {
    if (channel === 'mercadolibre') return '/api/ml/publish';
    if (channel === 'instagram') return '/api/ig/publish';
    return '/api/argenprop/publish';
  }

  status() {
    return firstValueFrom(this.http.get<ApiStatus>('/api/status'));
  }

  getCredentials() {
    return firstValueFrom(this.http.get<Record<string, unknown>>('/api/credentials'));
  }

  saveCredentials(body: Record<string, unknown>) {
    return firstValueFrom(
      this.http.post<{ ok: boolean; status: ApiStatus }>('/api/credentials', body),
    );
  }

  loginArgenprop(argenprop: Record<string, string>) {
    return firstValueFrom(
      this.http.post<{ ok: boolean; message: string; status: ApiStatus }>(
        '/api/argenprop/login',
        { argenprop },
      ),
    );
  }

  /** Abre OAuth en popup y espera postMessage o polling de /api/status. */
  async connectOAuth(channel: 'mercadolibre' | 'instagram'): Promise<boolean> {
    const authPath = channel === 'mercadolibre' ? '/api/ml/auth' : '/api/ig/auth';
    const popup = window.open(
      authPath,
      `oauth-${channel}`,
      'width=560,height=720,menubar=no,toolbar=no',
    );

    return await new Promise<boolean>((resolve) => {
      let done = false;
      const finish = (ok: boolean) => {
        if (done) return;
        done = true;
        window.removeEventListener('message', onMsg);
        clearInterval(poll);
        clearTimeout(timer);
        try {
          popup?.close();
        } catch {
          /* ignore */
        }
        resolve(ok);
      };

      const onMsg = (ev: MessageEvent) => {
        const d = ev.data;
        if (!d || d.type !== 'sierra-oauth') return;
        if (d.provider !== channel) return;
        finish(Boolean(d.ok));
      };
      window.addEventListener('message', onMsg);

      const poll = setInterval(async () => {
        try {
          if (popup && popup.closed) {
            const st = await this.status();
            finish(Boolean(st.connected[channel]));
            return;
          }
          const st = await this.status();
          if (st.connected[channel]) finish(true);
        } catch {
          /* API aún no lista */
        }
      }, 1200);

      const timer = setTimeout(() => finish(false), 180_000);
    });
  }

  async ensureConnected(channel: PublishChannel): Promise<void> {
    const st = await this.status();
    if (st.connected[channel] || st.mode[channel] === 'live') return;

    if (channel === 'argenprop') {
      throw new Error(
        'Argenprop: guardá usr/psd/IdVendedor/IdOrigen en Ajustes y tocá “Guardar login”.',
      );
    }

    if (st.mode[channel] === 'missing_credentials') {
      throw new Error(
        `${channel}: faltan credenciales de app en Ajustes antes del login OAuth.`,
      );
    }

    const ok = await this.connectOAuth(channel);
    if (!ok) {
      throw new Error(`No se completó el login de ${channel}. Reintentá.`);
    }
  }

  async publish(property: PanelProperty, channel: PublishChannel) {
    if (!property.title || !property.price || !property.location) {
      throw new Error('Faltan título, precio o ubicación');
    }
    if (!property.images.length) {
      throw new Error('Agregá al menos una foto antes de publicar');
    }

    let api = await this.postPublish(property, channel);

    if (api.needsAuth && api.authUrl) {
      await this.ensureConnected(channel);
      api = await this.postPublish(property, channel);
    } else if (api.needsAuth) {
      throw new Error(api.message);
    }

    if (api.error) throw new Error(api.error);

    const pub = this.store.addPublication(
      property.id,
      channel,
      api.message,
      api.externalUrl,
      api.simulated ? 'simulated' : 'published',
      api.remoteId,
    );

    if (channel === 'mercadolibre') this.store.bumpStat(property.id, 'mlViews', 5);
    if (channel === 'instagram') this.store.bumpStat(property.id, 'igReach', 25);

    return pub;
  }

  async republish(property: PanelProperty, channel: PublishChannel) {
    return this.publish(property, channel);
  }

  private async postPublish(property: PanelProperty, channel: PublishChannel) {
    try {
      return await firstValueFrom(
        this.http.post<PublishApiResponse>(this.endpoint(channel), { property }),
      );
    } catch (e: unknown) {
      const msg =
        (e as { error?: { error?: string }; message?: string })?.error?.error ||
        (e as { message?: string })?.message ||
        'No se pudo hablar con la API local (:43125). ¿Corriste npm run dev:all?';
      throw new Error(msg);
    }
  }
}
