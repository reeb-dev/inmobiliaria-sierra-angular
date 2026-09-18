import { Injectable, inject } from '@angular/core';
import type { PanelProperty, PublishChannel } from './panel.types';
import { PanelStoreService } from './panel-store.service';

@Injectable({ providedIn: 'root' })
export class PublishService {
  private readonly store = inject(PanelStoreService);

  async publish(property: PanelProperty, channel: PublishChannel) {
    // Modo local: no llama APIs reales; deja auditoría en el panel.
    await delay(450);
    const labels: Record<PublishChannel, string> = {
      mercadolibre: 'Mercado Libre',
      instagram: 'Instagram',
      argenprop: 'Argenprop',
    };
    const urls: Record<PublishChannel, string> = {
      mercadolibre: `https://www.mercadolibre.com.ar/publicaciones?q=${encodeURIComponent(property.id)}`,
      instagram: 'https://www.instagram.com/',
      argenprop: 'https://www.argenprop.com/',
    };

    if (!property.title || !property.price || !property.location) {
      throw new Error('Faltan título, precio o ubicación');
    }
    if (!property.images.length) {
      throw new Error('Agregá al menos una foto antes de publicar');
    }

    const message = `Simulado en local → ${labels[channel]}: “${property.title}” (${property.price}). Conectá OAuth/API keys para publicar de verdad.`;
    const pub = this.store.addPublication(
      property.id,
      channel,
      message,
      urls[channel],
    );

    if (channel === 'mercadolibre') this.store.bumpStat(property.id, 'mlViews', 5);
    if (channel === 'instagram') this.store.bumpStat(property.id, 'igReach', 25);
    this.store.bumpStat(property.id, 'contacts', 0);

    return pub;
  }

  async republish(property: PanelProperty, channel: PublishChannel) {
    await delay(350);
    const pub = await this.publish(property, channel);
    pub.message = `Republicación simulada en ${channel}: ${property.title}`;
    return pub;
  }
}

function delay(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}
