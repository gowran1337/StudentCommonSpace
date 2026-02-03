type CacheEntry<T> = {
  value: T;
  expiresAt: number;
};

const safe = (fn: () => void) => {
  try {
    fn();
  } catch (err) {
    console.debug("Cache operation failed", err);
  }
};

export function cacheGet<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;

    const entry: CacheEntry<T> = JSON.parse(raw);

    if (!entry?.expiresAt || Date.now() > entry.expiresAt) {
      safe(() => localStorage.removeItem(key));
      return null;
    }

    return entry.value ?? null;
  } catch (err) {
    console.debug("Cache read failed", err);
    safe(() => localStorage.removeItem(key));
    return null;
  }
}

export function cacheSet<T>(key: string, value: T, ttlMinutes: number): void {
  const entry: CacheEntry<T> = {
    value,
    expiresAt: Date.now() + ttlMinutes * 60 * 1000,
  };

  safe(() => localStorage.setItem(key, JSON.stringify(entry)));
}

export function cacheRemove(key: string): void {
  safe(() => localStorage.removeItem(key));
}

export function cacheClearByPrefix(prefix: string): void {
  safe(() => {
    Object.keys(localStorage).forEach((key) => {
      if (key.startsWith(prefix)) {
        localStorage.removeItem(key);
      }
    });
  });
}

export function cacheClearAll(): void {
  cacheClearByPrefix("cache:");
}
