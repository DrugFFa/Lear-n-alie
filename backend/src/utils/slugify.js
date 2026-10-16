/**
 * Generates a clean URL slug from a title string
 */
export function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .normalize('NFD') // normalize accented characters
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '') // remove invalid chars
    .replace(/[\s_]+/g, '-') // collapse whitespace and replace with -
    .replace(/^-+|-+$/g, ''); // trim -
}
