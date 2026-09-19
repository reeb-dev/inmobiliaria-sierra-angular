import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import type { PanelProperty, PublishChannel } from './panel.types';
import { PanelStoreService } from './panel-store.service';

type PublishApiResponse = {
  simulated?: boolean;
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

  async publish(property: PanelProperty, channel: PublishChannel) {
    if (!property.title || !property.price || !property.location) {
      throw new Error('Faltan título, precio o ubicación');
    }
    if (!property.images.length) {
      throw new Error('Agregá al menos una foto antes de publicar');
    }

    let api: PublishApiResponse;
    try {
      api = await firstValueFrom(
        this.http.post<PublishApiResponse>(this.endpoint(channel), { property }),
      );
    } catch (e: unknown) {
      const msg =
        (e as { error?: { error?: string }; message?: string })?.error?.error ||
        (e as { message?: string })?.message ||
        'No se pudo hablar con la API local (:43125). ¿Corriste npm run dev:all?';
      throw new Error(msg);
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

  status() {
    return firstValueFrom(
      this.http.get<{
        configured: Record<string, boolean>;
        connected: Record<string, boolean>;
        mode: Record<string, string>;
      }>('/api/status'),
    );
  }
}
