import data from '../../assets/data/listings.json';
import { assetUrl, mapAssetUrls } from './asset-url';

export type Property = {
  id: string;
  slug: string;
  title: string;
  price: string;
  status: string;
  type: string;
  location: string;
  bedrooms: number | null;
  bathrooms: number | null;
  surface: string | null;
  images: string[];
  description: string;
  sourceUrl: string;
};

export type Agency = {
  name: string;
  tagline: string;
  phone: string;
  phoneHref: string;
  whatsapp: string;
  email: string;
  address: string;
  hours: string;
  about: string[];
  stats: { label: string; value: string }[];
  heroImage: string;
  originalSite: string;
};

const rawAgency = data.agency as Agency;
export const agency: Agency = {
  ...rawAgency,
  heroImage: assetUrl(rawAgency.heroImage),
};

export const properties: Property[] = (data.properties as Property[]).map(
  (p) => ({
    ...p,
    images: mapAssetUrls(p.images),
  }),
);

export const propertyTypes = Array.from(
  new Set(properties.map((p) => p.type)),
).sort();

export function getBySlug(slug: string): Property | undefined {
  return properties.find((p) => p.slug === slug);
}

export function relatedProperties(property: Property, limit = 3): Property[] {
  return properties
    .filter(
      (p) =>
        p.id !== property.id &&
        (p.type === property.type || p.status === property.status),
    )
    .slice(0, limit);
}

export function filterProperties(opts: {
  q?: string;
  type?: string;
  status?: string;
}): Property[] {
  const q = opts.q?.trim().toLowerCase() ?? '';
  return properties.filter((p) => {
    if (opts.type && opts.type !== 'todos' && p.type !== opts.type) return false;
    if (opts.status && opts.status !== 'todos' && p.status !== opts.status) {
      return false;
    }
    if (!q) return true;
    const hay = `${p.title} ${p.location} ${p.type} ${p.id}`.toLowerCase();
    return hay.includes(q);
  });
}

export function waLink(property?: Property): string {
  if (!property) return agency.whatsapp;
  const text = encodeURIComponent(
    `Hola, me interesa la propiedad ${property.id}: ${property.title}`,
  );
  return `${agency.whatsapp}?text=${text}`;
}

export function homesFirst(): Property[] {
  const preferred = ['Cabaña', 'Casa', 'Casaquinta'];
  const homes = properties.filter((p) => preferred.includes(p.type));
  return homes.length ? homes : properties;
}
