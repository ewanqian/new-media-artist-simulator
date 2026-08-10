function hashString(input: string): number {
  let h = 2166136261;
  for (let i = 0; i < input.length; i += 1) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function mulberry32(seed: number): () => number {
  let value = seed >>> 0;
  return () => {
    value += 0x6d2b79f5;
    let t = value;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export interface DeterministicRng {
  roll(namespace?: string, sequence?: number): number;
  int(min: number, max: number, namespace?: string, sequence?: number): number;
  pick<T>(items: readonly T[], namespace?: string, sequence?: number): T | null;
}

export function createDeterministicRng(baseSeed: string): DeterministicRng {
  const seedText = String(baseSeed || 'new-media-artist-simulator');

  return {
    roll(namespace = 'default', sequence = 0) {
      const seed = hashString(`${seedText}:${namespace}:${sequence}`);
      return mulberry32(seed)();
    },
    int(min, max, namespace = 'default', sequence = 0) {
      if (!Number.isInteger(min) || !Number.isInteger(max) || max < min) {
        throw new Error('Invalid rng.int range.');
      }
      const roll = this.roll(namespace, sequence);
      return min + Math.floor(roll * (max - min + 1));
    },
    pick<T>(items: readonly T[], namespace = 'default', sequence = 0): T | null {
      if (!items.length) return null;
      return items[this.int(0, items.length - 1, namespace, sequence)] ?? null;
    }
  };
}
