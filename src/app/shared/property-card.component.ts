import { Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Property } from '../core/listings';

@Component({
  selector: 'app-property-card',
  standalone: true,
  imports: [RouterLink],
  template: `
    <article class="card">
      <a [routerLink]="['/propiedades', property.slug]">
        <div class="media">
          @if (property.images[0]; as img) {
            <img [src]="img" [alt]="property.title" loading="lazy" />
          } @else {
            <div class="empty">Sin imagen</div>
          }
          <div class="shade"></div>
          <div class="badges">
            <span>{{
              property.status === 'alquiler' ? 'Alquiler' : 'Venta'
            }}</span>
            <span class="ghost">{{ property.type }}</span>
          </div>
          <div class="meta">
            <p class="price">{{ property.price }}</p>
            <h3>{{ property.title }}</h3>
            <p class="loc">{{ property.location }}</p>
            <p class="facts">
              @if (property.bedrooms != null) {
                <span>{{ property.bedrooms }} dorm.</span>
              }
              @if (property.bathrooms != null) {
                <span>{{ property.bathrooms }} baños</span>
              }
              @if (property.surface) {
                <span>{{ property.surface }} m²</span>
              }
            </p>
          </div>
        </div>
      </a>
    </article>
  `,
  styles: [
    `
      .card {
        overflow: hidden;
        border-radius: 1.1rem;
        background: var(--forest-deep);
        box-shadow: 0 24px 60px -36px rgba(19, 36, 28, 0.75);
      }
      a {
        color: inherit;
        text-decoration: none;
      }
      .media {
        position: relative;
        aspect-ratio: 4 / 5;
      }
      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        display: block;
        transition: transform 0.7s ease;
      }
      .card:hover img {
        transform: scale(1.04);
      }
      .shade {
        position: absolute;
        inset: 0;
        background: linear-gradient(
          to top,
          rgba(0, 0, 0, 0.9),
          rgba(0, 0, 0, 0.25) 45%,
          rgba(0, 0, 0, 0.08)
        );
      }
      .badges {
        position: absolute;
        top: 0.85rem;
        left: 0.85rem;
        display: flex;
        gap: 0.4rem;
      }
      .badges span {
        background: #fff;
        color: var(--forest-deep);
        font-size: 0.68rem;
        font-weight: 700;
        letter-spacing: 0.06em;
        text-transform: uppercase;
        padding: 0.28rem 0.55rem;
        border-radius: 0.4rem;
      }
      .ghost {
        background: rgba(0, 0, 0, 0.45) !important;
        color: #fff !important;
        backdrop-filter: blur(6px);
      }
      .meta {
        position: absolute;
        inset: auto 0 0;
        padding: 1rem 1.1rem 1.15rem;
        color: #fff;
      }
      .price {
        margin: 0;
        font-family: var(--font-display);
        font-size: 1.55rem;
      }
      h3 {
        margin: 0.35rem 0 0;
        font-family: var(--font-display);
        font-size: 1.05rem;
        line-height: 1.25;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
      }
      .loc,
      .facts {
        margin: 0.45rem 0 0;
        font-size: 0.82rem;
        color: rgba(255, 255, 255, 0.75);
      }
      .facts {
        display: flex;
        flex-wrap: wrap;
        gap: 0.75rem;
      }
      .empty {
        height: 100%;
        display: grid;
        place-items: center;
        color: rgba(255, 255, 255, 0.7);
      }
      @media (min-width: 640px) {
        .media {
          aspect-ratio: 5 / 6;
        }
      }
    `,
  ],
})
export class PropertyCardComponent {
  @Input({ required: true }) property!: Property;
}
