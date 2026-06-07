const STORAGE_KEY = "brown-housing-favorites";

export function getFavorites(): number[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as number[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function isFavorite(dormId: number): boolean {
  return getFavorites().includes(dormId);
}

export function toggleFavorite(dormId: number): boolean {
  const favorites = getFavorites();
  const index = favorites.indexOf(dormId);
  if (index >= 0) {
    favorites.splice(index, 1);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites));
    return false;
  }
  favorites.push(dormId);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites));
  return true;
}

export function clearFavorites(): void {
  localStorage.removeItem(STORAGE_KEY);
}
