import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { assetUrl } from '../core/asset-url';
import { AiCopyService } from './ai-copy.service';
import { PublishService } from './publish.service';
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
      <form class="form" (ngSubmit)="save()">
        <label>Título <input name="title" [(ngModel)]="form.title" required /></label>
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
        <div class="row3">
          <label
            >Dorm.
            <input
              name="bedrooms"
              type="number"
              [(ngModel)]="form.bedrooms"
            />
          </label>
          <label
            >Baños
            <input
              name="bathrooms"
              type="number"
              [(ngModel)]="form.bathrooms"
            />
          </label>
          <label>m² <input name="surface" [(ngModel)]="form.surface" /></label>
        </div>
        <label
          >Descripción
          <textarea name="description" rows="7" [(ngModel)]="form.description"></textarea>
        </label>

        <div class="ai">
          <button type="button" class="secondary" [disabled]="busyAi()" (click)="generateAi()">
            {{ busyAi() ? 'Redactando…' : 'Generar texto con IA' }}
          </button>
          @if (aiNote()) {
            <small>{{ aiNote() }}</small>
          }
        </div>

        <label
          >Fotos (JPG/PNG/WebP; HEIC conviene convertirlo antes)
          <input type="file" accept="image/*" multiple (change)="onFiles($event)" />
        </label>
        <div class="thumbs">
          @for (img of form.images; track img; let i = $index) {
            <div class="thumb">
              <img [src]="preview(img)" alt="" />
              <button type="button" (click)="removeImage(i)">Quitar</button>
            </div>
          }
        </div>

        <button type="submit" class="primary">Guardar</button>
        @if (savedMsg()) {
          <p class="ok">{{ savedMsg() }}</p>
        }
      </form>

      <aside class="side">
        <section>
          <h2>Publicar / republicar</h2>
          <p class="muted">Modo local simulado. No publica de verdad hasta conectar APIs.</p>
          <div class="actions">
            <button type="button" [disabled]="busyPub()" (click)="publish('mercadolibre')">
              Mercado Libre
            </button>
            <button type="button" [disabled]="busyPub()" (click)="publish('instagram')">
              Instagram
            </button>
            <button type="button" [disabled]="busyPub()" (click)="publish('argenprop')">
              Argenprop
            </button>
          </div>
          @if (pubMsg()) {
            <p class="ok">{{ pubMsg() }}</p>
          }
          @if (pubErr()) {
            <p class="err">{{ pubErr() }}</p>
          }
        </section>

        <section>
          <h2>Estadísticas</h2>
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

        <section>
          <h2>Historial</h2>
          @for (p of pubs(); track p.id) {
            <article class="hist">
              <strong>{{ p.channel }}</strong>
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
        margin-bottom: 1.1rem;
      }
      .back {
        color: #5b6b62;
        text-decoration: none;
        font-size: 0.9rem;
      }
      h1,
      h2 {
        margin: 0.35rem 0 0;
        font-family: var(--font-display, Georgia, serif);
        color: #163528;
      }
      h2 {
        font-size: 1.15rem;
      }
      .layout {
        display: grid;
        gap: 1rem;
      }
      @media (min-width: 980px) {
        .layout {
          grid-template-columns: 1.4fr 0.9fr;
          align-items: start;
        }
      }
      .form,
      aside section {
        background: #fff;
        border: 1px solid #d5ddd7;
        border-radius: 0.9rem;
        padding: 1rem;
      }
      aside {
        display: grid;
        gap: 0.85rem;
      }
      label {
        display: grid;
        gap: 0.3rem;
        margin-bottom: 0.75rem;
        font-size: 0.86rem;
        color: #163528;
      }
      input,
      select,
      textarea {
        border: 1px solid #d5ddd7;
        border-radius: 0.5rem;
        padding: 0.65rem 0.75rem;
        font: inherit;
      }
      .row,
      .row3 {
        display: grid;
        gap: 0.7rem;
      }
      @media (min-width: 700px) {
        .row {
          grid-template-columns: 1fr 1fr;
        }
        .row3 {
          grid-template-columns: 1fr 1fr 1fr;
        }
      }
      .ai {
        display: flex;
        flex-wrap: wrap;
        gap: 0.6rem;
        align-items: center;
        margin-bottom: 0.8rem;
      }
      .thumbs {
        display: flex;
        flex-wrap: wrap;
        gap: 0.55rem;
        margin-bottom: 0.9rem;
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
      .actions button,
      .secondary,
      .primary,
      .danger {
        border: 0;
        border-radius: 0.45rem;
        padding: 0.55rem 0.75rem;
        cursor: pointer;
        font-weight: 700;
      }
      .thumb button {
        width: 100%;
        margin-top: 0.25rem;
        background: #f3f6f3;
      }
      .primary {
        background: #2f5d45;
        color: #fff;
        padding: 0.75rem 1rem;
      }
      .secondary {
        background: #e7eee8;
        color: #163528;
      }
      .danger {
        background: #f8e8e8;
        color: #9b1c1c;
      }
      .actions {
        display: grid;
        gap: 0.45rem;
      }
      .actions button {
        background: #163528;
        color: #fff;
        text-align: left;
      }
      .muted,
      small {
        color: #5b6b62;
        font-size: 0.86rem;
      }
      .ok {
        color: #2f5d45;
      }
      .err {
        color: #9b1c1c;
      }
      .stats {
        list-style: none;
        padding: 0;
        margin: 0 0 0.8rem;
        display: grid;
        gap: 0.35rem;
      }
      .stats li {
        display: flex;
        justify-content: space-between;
      }
      .hist {
        display: grid;
        gap: 0.15rem;
        margin-bottom: 0.65rem;
        font-size: 0.88rem;
      }
    `,
  ],
})
export class PanelPropertyEditComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly store = inject(PanelStoreService);
  private readonly ai = inject(AiCopyService);
  private readonly publishSvc = inject(PublishService);

  readonly types = ['Casa', 'Cabaña', 'Terreno', 'Departamento', 'Local', 'Campo', 'Casaquinta'];
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

  constructor() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id && id !== 'nueva') {
      const existing = this.store.get(id);
      if (existing) {
        this.isNew = false;
        this.form = { ...existing };
        this.refreshSide();
      }
    }
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
