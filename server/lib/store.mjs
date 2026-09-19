import fs from 'node:fs';
import path from 'node:path';

export function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

export function readJson(file, fallback) {
  try {
    if (!fs.existsSync(file)) return fallback;
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch {
    return fallback;
  }
}

export function writeJson(file, data) {
  ensureDir(path.dirname(file));
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
}

export function tokenStore(dataDir) {
  const file = path.join(dataDir, 'tokens.json');
  return {
    get() {
      return readJson(file, {});
    },
    set(patch) {
      const next = { ...this.get(), ...patch };
      writeJson(file, next);
      return next;
    },
  };
}
