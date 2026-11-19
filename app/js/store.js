// Leonida Ledger — progress store: localStorage save, file export and import.
const STORAGE_KEY = 'leonida-ledger-progress-v1';

// Read the saved set of earned trophy ids. Returns a Set of numbers.
export function loadProgress() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return new Set();
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return new Set();
    return new Set(parsed.filter((n) => Number.isInteger(n)));
  } catch {
    return new Set();
  }
}

// Persist the set of earned trophy ids.
export function saveProgress(earnedIds) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...earnedIds].sort((a, b) => a - b)));
  } catch {
    // Storage full or unavailable: progress lives in memory for this visit.
  }
}

// Build the downloadable export file for the earned set.
export function buildExportBlob(earnedIds) {
  const payload = {
    app: 'leonida-ledger',
    game: 'Grand Theft Auto VI',
    exportedAt: new Date().toISOString(),
    earned: [...earnedIds].sort((a, b) => a - b),
  };
  return new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
}

// Parse an imported progress file. Returns a Set of ids, or throws on bad input.
export function parseImportedFile(text) {
  const parsed = JSON.parse(text);
  const list = Array.isArray(parsed) ? parsed : parsed.earned;
  if (!Array.isArray(list)) throw new Error('No earned list found in file.');
  return new Set(list.filter((n) => Number.isInteger(n) && n >= 1 && n <= 55));
}

// Clear saved progress entirely.
export function clearProgress() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Nothing to clear.
  }
}
