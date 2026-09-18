import { Injectable, signal } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import seed from '../../assets/data/listings.json';
import type {
  PanelProperty,
  PanelSettings,
  PropertyStats,
  Publication,
  PublishChannel,
} from './panel.types';
import { PanelAuthService } from './panel-auth.service';

const PROPS_KEY = 'sierra-panel-props';
const PUBS_KEY = 'sierra-panel-pubs';
const STATS_KEY = 'sierra-panel-stats';
const SETTINGS_KEY = 'sierra-panel-settings';

function slugify(text: string) {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .slice(0, 80);
}

function seedProperties(): PanelProperty[] {
  return (seed.properties as Omit<PanelProperty, 'updatedAt' | 'published'>[]).map(
    (p) => ({
      ...p,
      status: p.status === 'alquiler' ? 'alquiler' : 'venta',
      published: true,
      updatedAt: new Date().toISOString(),
    }),
  );
}

function seedStats(props: PanelProperty[]): PropertyStats[] {
  return props.map((p, i) => ({
    propertyId: p.id,
    webViews: 40 + ((i * 17) % 90),
    whatsappClicks: 3 + ((i * 5) % 20),
    mlViews: 20 + ((i * 11) % 60),
    igReach: 80 + ((i * 23) % 200),
    contacts: 1 + ((i * 3) % 12),
  }));
}

@Injectable({ providedIn: 'root' })
export class PanelStoreService {
  readonly properties = signal<PanelProperty[]>([]);
  readonly publications = signal<Publication[]>([]);
  readonly stats = signal<PropertyStats[]>([]);
  readonly settings = signal<PanelSettings>({
    geminiApiKey: '',
    openaiApiKey: '',
    aiProvider: 'local',
  });

  constructor() {
    this.hydrate();
  }

  private hydrate() {
    const props = this.readJson<PanelProperty[]>(PROPS_KEY) ?? seedProperties();
    const pubs = this.readJson<Publication[]>(PUBS_KEY) ?? [];
    const stats =
      this.readJson<PropertyStats[]>(STATS_KEY) ?? seedStats(props);
    const settings =
      this.readJson<PanelSettings>(SETTINGS_KEY) ?? this.settings();
    this.properties.set(props);
    this.publications.set(pubs);
    this.stats.set(stats);
    this.settings.set(settings);
  }

  resetToSeed() {
    const props = seedProperties();
    this.properties.set(props);
    this.publications.set([]);
    this.stats.set(seedStats(props));
    this.persistAll();
  }

  list() {
    return this.properties();
  }

  get(id: string) {
    return this.properties().find((p) => p.id === id);
  }

  save(input: Partial<PanelProperty> & { id?: string }) {
    const now = new Date().toISOString();
    const all = [...this.properties()];
    if (input.id && all.some((p) => p.id === input.id)) {
      const idx = all.findIndex((p) => p.id === input.id);
      const merged: PanelProperty = {
        ...all[idx],
        ...input,
        id: all[idx].id,
        slug:
          input.slug ||
          all[idx].slug ||
          `${all[idx].id.toLowerCase()}-${slugify(input.title || all[idx].title)}`,
        updatedAt: now,
      } as PanelProperty;
      all[idx] = merged;
      this.properties.set(all);
      this.persistProps();
      return merged;
    }

    const id = input.id || `SIE-${Date.now().toString().slice(-6)}`;
    const title = input.title || 'Nueva propiedad';
    const created: PanelProperty = {
      id,
      slug: `${id.toLowerCase()}-${slugify(title)}`,
      title,
      price: input.price || 'Consultar',
      status: input.status || 'venta',
      type: input.type || 'Casa',
      location: input.location || 'Sierra de la Ventana',
      bedrooms: input.bedrooms ?? null,
      bathrooms: input.bathrooms ?? null,
      surface: input.surface ?? null,
      images: input.images || [],
      description: input.description || '',
      published: input.published ?? false,
      updatedAt: now,
    };
    this.properties.set([created, ...all]);
    this.stats.set([
      {
        propertyId: id,
        webViews: 0,
        whatsappClicks: 0,
        mlViews: 0,
        igReach: 0,
        contacts: 0,
      },
      ...this.stats(),
    ]);
    this.persistProps();
    this.persistStats();
    return created;
  }

  remove(id: string) {
    this.properties.set(this.properties().filter((p) => p.id !== id));
    this.publications.set(
      this.publications().filter((p) => p.propertyId !== id),
    );
    this.stats.set(this.stats().filter((s) => s.propertyId !== id));
    this.persistAll();
  }

  saveSettings(patch: Partial<PanelSettings>) {
    const next = { ...this.settings(), ...patch };
    this.settings.set(next);
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(next));
  }

  addPublication(
    propertyId: string,
    channel: PublishChannel,
    message: string,
    externalUrl?: string,
  ) {
    const pub: Publication = {
      id: `pub-${Date.now()}`,
      propertyId,
      channel,
      status: 'simulated',
      message,
      at: new Date().toISOString(),
      externalUrl,
    };
    this.publications.set([pub, ...this.publications()]);
    localStorage.setItem(PUBS_KEY, JSON.stringify(this.publications()));
    return pub;
  }

  statsFor(propertyId: string) {
    return (
      this.stats().find((s) => s.propertyId === propertyId) ?? {
        propertyId,
        webViews: 0,
        whatsappClicks: 0,
        mlViews: 0,
        igReach: 0,
        contacts: 0,
      }
    );
  }

  bumpStat(
    propertyId: string,
    field: keyof Omit<PropertyStats, 'propertyId'>,
    by = 1,
  ) {
    const all = [...this.stats()];
    const idx = all.findIndex((s) => s.propertyId === propertyId);
    if (idx < 0) {
      const base = this.statsFor(propertyId);
      base[field] += by;
      all.push(base);
    } else {
      all[idx] = { ...all[idx], [field]: all[idx][field] + by };
    }
    this.stats.set(all);
    this.persistStats();
  }

  totals() {
    return this.stats().reduce(
      (acc, s) => {
        acc.webViews += s.webViews;
        acc.whatsappClicks += s.whatsappClicks;
        acc.mlViews += s.mlViews;
        acc.igReach += s.igReach;
        acc.contacts += s.contacts;
        return acc;
      },
      {
        webViews: 0,
        whatsappClicks: 0,
        mlViews: 0,
        igReach: 0,
        contacts: 0,
      },
    );
  }

  private persistProps() {
    localStorage.setItem(PROPS_KEY, JSON.stringify(this.properties()));
  }
  private persistStats() {
    localStorage.setItem(STATS_KEY, JSON.stringify(this.stats()));
  }
  private persistAll() {
    this.persistProps();
    this.persistStats();
    localStorage.setItem(PUBS_KEY, JSON.stringify(this.publications()));
  }

  private readJson<T>(key: string): T | null {
    try {
      const raw = localStorage.getItem(key);
      return raw ? (JSON.parse(raw) as T) : null;
    } catch {
      return null;
    }
  }
}

export const panelGuard: CanActivateFn = () => {
  const auth = inject(PanelAuthService);
  const router = inject(Router);
  if (auth.loggedIn()) return true;
  return router.createUrlTree(['/panel/login']);
};
