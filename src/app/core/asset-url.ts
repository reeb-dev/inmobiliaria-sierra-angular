/** Quita el `/` inicial para que las rutas respeten el `<base href>` (GitHub Pages). */
export function assetUrl(path: string): string {
  if (!path || /^https?:\/\//i.test(path)) return path;
  return path.replace(/^\//, '');
}

export function mapAssetUrls(paths: string[]): string[] {
  return paths.map(assetUrl);
}
