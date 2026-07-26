/**
 * Deterministic pseudo-randomness for anything rendered on both the server
 * and the client.
 *
 * `Math.random()` in a render path produces different markup on each side
 * of hydration, which React reports as a mismatch and then silently
 * repaints. Every decorative pattern and animation stagger in the design
 * system draws from here instead, seeded by a constant, so both passes
 * agree byte for byte.
 */

/** mulberry32 — small, fast, fully deterministic. */
export function makeRng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Turns a string into a stable 32-bit seed, so a component can seed itself
 * from its own content rather than needing a magic number passed in.
 */
export function seedFromString(input: string) {
  let h = 2166136261;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}
