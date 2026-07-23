/**
 * Returns a deterministic hue from a palette, based on a string seed.
 * Used wherever the UI needs a consistent-but-varied color per entity
 * (e.g. sender avatars, calendar event chips).
 *
 * @param {string} seed  – The string to hash (email address, event id, etc.)
 * @param {number[]} hues – The palette of hue values to choose from.
 * @returns {number} A hue value from the palette.
 */
export function getDeterministicHue(seed, hues) {
  if (!seed || !hues?.length) return hues?.[0] ?? 0;
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash << 5) - hash + seed.charCodeAt(i);
    hash |= 0;
  }
  return hues[Math.abs(hash) % hues.length];
}
