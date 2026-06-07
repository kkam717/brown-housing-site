export function normalizeUserKey(name: string): string {
  return name.toLowerCase().replace(/\s+/g, "_");
}
