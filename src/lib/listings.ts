import data from "@/data/listings.json";

export type Property = {
  id: string;
  slug: string;
  title: string;
  price: string;
  status: "venta" | "alquiler" | string;
  type: string;
  location: string;
  bedrooms: number | null;
  bathrooms: number | null;
  surface: string | null;
  images: string[];
  description: string;
  sourceUrl: string;
};

export type Agency = typeof data.agency;

export const agency = data.agency as Agency;
export const properties = data.properties as Property[];

export function getPropertyBySlug(slug: string) {
  return properties.find((p) => p.slug === slug);
}

export function getRelatedProperties(property: Property, limit = 3) {
  return properties
    .filter((p) => p.id !== property.id && (p.type === property.type || p.status === property.status))
    .slice(0, limit);
}

export const propertyTypes = Array.from(
  new Set(properties.map((p) => p.type)),
).sort();

export function filterProperties(filters: {
  q?: string;
  type?: string;
  status?: string;
}) {
  const q = filters.q?.trim().toLowerCase() ?? "";
  return properties.filter((p) => {
    if (filters.type && filters.type !== "todos" && p.type !== filters.type) {
      return false;
    }
    if (
      filters.status &&
      filters.status !== "todos" &&
      p.status !== filters.status
    ) {
      return false;
    }
    if (!q) return true;
    const haystack = `${p.title} ${p.location} ${p.type} ${p.id}`.toLowerCase();
    return haystack.includes(q);
  });
}
