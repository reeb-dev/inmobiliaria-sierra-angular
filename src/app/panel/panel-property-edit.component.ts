import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { assetUrl } from '../core/asset-url';
import { AiCopyService } from './ai-copy.service';
import { PublishService, type ApiStatus } from './publish.service';
import { PanelStoreService } from './panel-store.service';
import type { PanelProperty, PublishChannel } from './panel.types';

@Component({
  selector: 'app-panel-property-edit',
  standalone: true,
  imports: [FormsModule, RouterLink, DatePipe],
  template: `
    <header class="head">
      <div>
        <a routerLink="/panel/propiedades" class="back">← Propiedades</a>
        <h1>{{ isNew ? 'Nueva propiedad' : 'Editar propiedad' }}</h1>
      </div>
      @if (!isNew) {
        <button type="button" class="danger" (click)="remove()">Eliminar</button>
      }
    </header>

    <div class="layout">
      <div class="main">
        <form class="block" (ngSubmit)="save()">
          <h2>Datos</h2>
          <label>Título <input name="title" [(ngModel)]="form.title" required maxlength="120" /></label>
          <div class="row">
            <label
              >Tipo
              <select name="type" [(ngModel)]="form.type">
                @for (t of types; track t) {
                  <option [value]="t">{{ t }}</option>
                }
              </select>
            </label>
            <label
              >Operación
              <select name="status" [(ngModel)]="form.status">
                <option value="venta">Venta</option>
                <option value="alquiler">Alquiler</option>
              </select>
            </label>
          </div>
          <div class="row">
            <label>Precio <input name="price" [(ngModel)]="form.price" /></label>
            <label>Ubicación <input name="location" [(ngModel)]="form.location" /></label>
          </div>
          <div class="row4">
            <label
              >Dorm.
              <input name="bedrooms" type="number" min="0" [(ngModel)]="form.bedrooms" />
            </label>
            <label
              >Baños
              <input name="bathrooms" type="number" min="0" [(ngModel)]="form.bathrooms" />
            </label>
            <label>m² total <input name="surface" [(ngModel)]="form.surface" /></label>
            <label
              >m² cubiertos
              <input name="coveredArea" [(ngModel)]="form.coveredArea" />
            </label>
          </div>
          <label
            >Cocheras
            <input
              name="parkingLots"
              type="number"
              min="0"
              [(ngModel)]="form.parkingLots"
              placeholder="0"
            />
          </label>
          <label
            >Descripción
            <textarea name="description" rows="7" [(ngModel)]="form.description"></textarea>
          </label>
          <button type="submit" class="primary">Guardar</button>
          @if (savedMsg()) {
            <p class="ok">{{ savedMsg() }}</p>
          }
        </form>

        <section class="block">
          <h2>Fotos</h2>
          <label class="file-label"
            >JPG / PNG / WebP (HEIC: convertir antes)
            <input type="file" accept="image/*" multiple (change)="onFiles($event)" />
          </label>
          <div class="thumbs">
            @for (img of form.images; track img; let i = $index) {
              <div class="thumb">
                <img [src]="preview(img)" alt="" />
                <button type="button" (click)="removeImage(i)">Quitar</button>
              </div>
            } @empty {
              <p class="muted">Sin fotos todavía.</p>
            }
          </div>
        </section>

        <section class="block">
          <h2>IA</h2>
          <p class="muted">Genera título y descripción a partir de los datos de la ficha.</p>
          <button type="button" class="secondary" [disabled]="busyAi()" (click)="generateAi()">
            {{ busyAi() ? 'Redactando…' : 'Generar texto con IA' }}
          </button>
          @if (aiNote()) {
            <p class="ok">{{ aiNote() }}</p>
          }
        </section>
      </div>

      <aside class="side">
        <section class="block">
          <h2>Publicar</h2>
          <p class="muted">
            Requiere URLs públicas de fotos. Sin sesión, el panel simula o pide login.
          </p>
          <div class="actions">
            @for (ch of channels; track ch.id) {
              <button
                type="button"
                class="pub"
                [disabled]="busyPub()"
                [attr.data-state]="channelState(ch.id)"
                (click)="publish(ch.id)"
              >
                <span class="pub-label">
                  <span class="dot" [attr.data-state]="channelState(ch.id)"></span>
                  {{ ch.label }}
                </span>
                <small>{{ stateHint(ch.id) }}</small>
              </button>
            }
          </div>
          @if (pubMsg()) {
            <p class="ok">{{ pubMsg() }}</p>
          }
          @if (pubErr()) {
            <p class="err">{{ pubErr() }}</p>
          }
        </section>

        <section class="block">
          <h2>Stats</h2>
          <ul class="stats">
            <li><span>Web</span><strong>{{ stats().webViews }}</strong></li>
            <li><span>WhatsApp</span><strong>{{ stats().whatsappClicks }}</strong></li>
            <li><span>ML</span><strong>{{ stats().mlViews }}</strong></li>
            <li><span>IG</span><strong>{{ stats().igReach }}</strong></li>
            <li><span>Contactos</span><strong>{{ stats().contacts }}</strong></li>
          </ul>
          <button type="button" class="secondary" (click)="simulateHit()">
            Simular interacción
          </button>
        </section>

        <section class="block">
          <h2>Historial</h2>
          @for (p of pubs(); track p.id) {
            <article class="hist">
              <strong>{{ channelLabel(p.channel) }}</strong>
              <span>{{ p.message }}</span>
              <small>{{ p.at | date: 'short' }}</small>
            </article>
          } @empty {
            <p class="muted">Sin publicaciones aún.</p>
          }
        </section>
      </aside>
    </div>
  `,
  styles: [
    `
      .head {
        display: flex;
        justify-content: space-between;
        gap: 1rem;
        margin-bottom: 1.15rem;
      }
      .back {
        color: var(--ink-soft, #5b6b62);
        text-decoration: none;
        font-size: 0.9rem;
      }
      h1,
      h2 {
        margin: 0.35rem 0 0;
        font-family: var(--font-display, Georgia, serif);
        color: var(--forest-deep, #163528);
      }
      h2 {
        font-size: 1.12rem;
        margin: 0 0 0.75rem;
      }
      .layout {
        display: grid;
        gap: 1rem;
      }
      @media (min-width: 980px) {
        .layout {
          grid-template-columns: 1.45fr 0.9fr;
          align-items: start;
        }
      }
      .main,
      .side {
        display: grid;
        gap: 0.85rem;
      }
      .block {
        background: #fff;
        border: 1px solid var(--line, #d5ddd7);
        border-radius: 0.9rem;
        padding: 1.05rem 1.1rem;
      }
      label {
        display: grid;
        gap: 0.3rem;
        margin-bottom: 0.75rem;
        font-size: 0.86rem;
        color: var(--forest-deep, #163528);
        font-weight: 600;
      }
      input,
      select,
      textarea {
        border: 1px solid var(--line, #d5ddd7);
        border-radius: 0.5rem;
        padding: 0.65rem 0.75rem;
        font: inherit;
        font-weight: 400;
      }
      input:focus,
      select:focus,
      textarea:focus {
        outline: 2px solid rgba(47, 93, 69, 0.25);
        border-color: var(--leaf, #3f7a58);
      }
      .row,
      .row4 {
        display: grid;
        gap: 0.7rem;
      }
      @media (min-width: 700px) {
        .row {
          grid-template-columns: 1fr 1fr;
        }
        .row4 {
          grid-template-columns: repeat(4, 1fr);
        }
      }
      .file-label input {
        margin-top: 0.25rem;
      }
      .thumbs {
        display: flex;
        flex-wrap: wrap;
        gap: 0.55rem;
      }
      .thumb {
        width: 6.2rem;
      }
      .thumb img {
        width: 6.2rem;
        height: 4.6rem;
        object-fit: cover;
        border-radius: 0.4rem;
        display: block;
      }
      .thumb button,
      .secondary,
      .primary,
      .danger,
      .pub {
        border: 0;
        border-radius: 0.45rem;
        padding: 0.55rem 0.75rem;
        cursor: pointer;
        font: inherit;
        font-weight: 700;
      }
      .thumb button {
        width: 100%;
        margin-top: 0.25rem;
        background: #f3f6f3;
      }
      .primary {
        background: var(--forest, #2f5d45);
        color: #fff;
        padding: 0.75rem 1rem;
      }
      .secondary {
        background: #e7eee8;
        color: var(--forest-deep, #163528);
      }
      .danger {
        background: #f8e8e8;
        color: #9b1c1c;
      }
      .actions {
        display: grid;
        gap: 0.5rem;
      }
      .pub {
        display: grid;
        gap: 0.15rem;
        background: var(--forest-deep, #163528);
        color: #fff;
        text-align: left;
        padding: 0.7rem 0.85rem;
      }
      .pub[data-state='live'] {
        background: var(--forest, #2f5d45);
      }
      .pub[data-state='needs_oauth'] {
        background: #4a5d3a;
      }
      .pub[data-state='missing_credentials'] {
        background: #5a6560;
      }
      .pub-label {
        display: flex;
        align-items: center;
        gap: 0.45rem;
      }
      .dot {
        width: 0.55rem;
        height: 0.55rem;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.35);
      }
      .dot[data-state='live'] {
        background: #8fd4a8;
      }
      .dot[data-state='needs_oauth'] {
        background: #e8c86a;
      }
      .dot[data-state='missing_credentials'] {
        background: #e0a0a0;
      }
      .pub small {
        font-weight: 500;
        opacity: 0.8;
        font-size: 0.75rem;
      }
      .muted,
      small {
        color: var(--ink-soft, #5b6b62);
        font-size: 0.86rem;
      }
      .ok {
        color: var(--forest, #2f5d45);
        margin: 0.5rem 0 0;
      }
      .err {
        color: #9b1c1c;
        margin: 0.5rem 0 0;
      }
      .stats {
        list-style: none;
        padding: 0;
        margin: 0 0 0.8rem;
        display: grid;
        gap: 0.4rem;
      }
      .stats li {
        display: flex;
        justify-content: space-between;
        padding: 0.35rem 0;
        border-bottom: 1px solid #eef2ef;
        font-size: 0.92rem;
      }
      .hist {
        display: grid;
        gap: 0.15rem;
        margin-bottom: 0.7rem;
        font-size: 0.88rem;
        padding-bottom: 0.65rem;
        border-bottom: 1px solid #eef2ef;
      }
    `,
  ],
})
export class PanelPropertyEditComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly store = inject(PanelStoreService);
  private readonly ai = inject(AiCopyService);
  private readonly publishSvc = inject(PublishService);

  readonly types = ['Casa', 'Cabaña', 'Terreno', 'Departamento', 'Local', 'Campo', 'Casaquinta'];
  readonly channels: { id: PublishChannel; label: string }[] = [
    { id: 'mercadolibre', label: 'Mercado Libre' },
    { id: 'instagram', label: 'Instagram' },
    { id: 'argenprop', label: 'Argenprop' },
  ];

  isNew = true;
  form: PanelProperty = this.blank();
  readonly busyAi = signal(false);
  readonly busyPub = signal(false);
  readonly aiNote = signal('');
  readonly savedMsg = signal('');
  readonly pubMsg = signal('');
  readonly pubErr = signal('');
  readonly stats = signal(this.store.statsFor(''));
  readonly pubs = signal(this.store.publications());
  readonly apiStatus = signal<ApiStatus | null>(null);

  constructor() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id && id !== 'nueva') {
      const existing = this.store.get(id);
      if (existing) {
        this.isNew = false;
        this.form = {
          ...existing,
          coveredArea: existing.coveredArea ?? null,
          parkingLots: existing.parkingLots ?? null,
        };
        this.refreshSide();
      }
    }
  }

  ngOnInit() {
    void this.publishSvc
      .status()
      .then((s) => this.apiStatus.set(s))
      .catch(() => this.apiStatus.set(null));
  }

  channelState(id: PublishChannel): string {
    const m = this.apiStatus()?.mode;
    if (!m) return 'missing_credentials';
    return m[id] || 'missing_credentials';
  }

  stateHint(id: PublishChannel) {
    const s = this.channelState(id);
    if (s === 'live') return 'Conectado';
    if (s === 'needs_oauth') return 'Falta iniciar sesión';
    return 'Faltan credenciales';
  }

  channelLabel(ch: string) {
    if (ch === 'mercadolibre') return 'Mercado Libre';
    if (ch === 'instagram') return 'Instagram';
    if (ch === 'argenprop') return 'Argenprop';
    return ch;
  }

  preview(src: string) {
    if (src.startsWith('data:') || src.startsWith('http')) return src;
    return assetUrl(src);
  }

  async generateAi() {
    this.busyAi.set(true);
    this.aiNote.set('');
    try {
      const out = await this.ai.generate(this.form);
      this.form.title = out.title;
      this.form.description = out.description;
      this.aiNote.set(`Texto generado (${out.source})`);
    } finally {
      this.busyAi.set(false);
    }
  }

  async onFiles(ev: Event) {
    const input = ev.target as HTMLInputElement;
    const files = Array.from(input.files || []);
    for (const file of files) {
      if (file.name.toLowerCase().endsWith('.heic') || file.type === 'image/heic') {
        this.aiNote.set(
          'HEIC: convertí la foto a JPG en el Mac (Exportar) o usá JPG/PNG/WebP.',
        );
        continue;
      }
      const dataUrl = await compressImage(file);
      this.form.images = [...this.form.images, dataUrl];
    }
    input.value = '';
  }

  removeImage(i: number) {
    this.form.images = this.form.images.filter((_, idx) => idx !== i);
  }

  save() {
    const saved = this.store.save({ ...this.form, id: this.isNew ? undefined : this.form.id });
    this.form = { ...saved };
    this.isNew = false;
    this.savedMsg.set('Guardado en este navegador (localStorage)');
    this.refreshSide();
    void this.router.navigate(['/panel/propiedades', saved.id]);
  }

  remove() {
    if (!confirm('¿Eliminar esta propiedad del panel local?')) return;
    this.store.remove(this.form.id);
    void this.router.navigateByUrl('/panel/propiedades');
  }

  async publish(channel: PublishChannel) {
    this.pubErr.set('');
    this.pubMsg.set('');
    this.busyPub.set(true);
    try {
      const saved = this.store.save({ ...this.form, id: this.isNew ? undefined : this.form.id });
      this.form = { ...saved };
      this.isNew = false;
      const pub = await this.publishSvc.republish(saved, channel);
      this.pubMsg.set(pub.message);
      try {
        this.apiStatus.set(await this.publishSvc.status());
      } catch {
        /* ignore */
      }
      this.refreshSide();
    } catch (e) {
      this.pubErr.set(e instanceof Error ? e.message : 'Error al publicar');
    } finally {
      this.busyPub.set(false);
    }
  }

  simulateHit() {
    if (!this.form.id) this.save();
    this.store.bumpStat(this.form.id, 'webViews', 1);
    this.store.bumpStat(this.form.id, 'whatsappClicks', 1);
    this.store.bumpStat(this.form.id, 'contacts', 1);
    this.refreshSide();
  }

  private refreshSide() {
    this.stats.set(this.store.statsFor(this.form.id));
    this.pubs.set(
      this.store.publications().filter((p) => p.propertyId === this.form.id),
    );
  }

  private blank(): PanelProperty {
    return {
      id: '',
      slug: '',
      title: '',
      price: '',
      status: 'venta',
      type: 'Casa',
      location: 'Sierra de la Ventana',
      bedrooms: null,
      bathrooms: null,
      surface: null,
      coveredArea: null,
      parkingLots: 0,
      images: [],
      description: '',
      published: false,
      updatedAt: new Date().toISOString(),
    };
  }
}

function compressImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('No se pudo leer la imagen'));
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const max = 1280;
        const scale = Math.min(1, max / Math.max(img.width, img.height));
        const canvas = document.createElement('canvas');
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(String(reader.result));
          return;
        }
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/jpeg', 0.72));
      };
      img.onerror = () => reject(new Error('Imagen inválida'));
      img.src = String(reader.result);
    };
    reader.readAsDataURL(file);
  });
}
