// Leonida Ledger — boot, state, tabs, filters and progress wiring.
import { loadProgress, saveProgress, buildExportBlob, parseImportedFile, clearProgress } from './store.js';
import { renderTrophyList, renderDetail } from './render.js';
import { renderRoadmap, renderMissables } from './roadmap.js';

const TOTAL = 55;

const state = {
  trophies: [],
  earned: loadProgress(),
  selectedId: null,
  spoilerOn: true,
  filters: { search: '', kind: 'all', grade: 'all', earned: 'all' },
};

function el(id) {
  return document.getElementById(id);
}

function updateProgress() {
  const n = state.earned.size;
  el('earned-count').textContent = String(n);
  el('progress-fill').style.width = `${Math.round((n / TOTAL) * 100)}%`;
  el('progress-pct').textContent = `${Math.round((n / TOTAL) * 100)}% earned (${n} of ${TOTAL})`;
}

function refreshAll() {
  renderTrophyList(el('trophy-list'), el('result-line'), state.trophies, state.filters, state.earned, state.spoilerOn, state.selectedId);
  const selected = state.trophies.find((t) => t.id === state.selectedId) || null;
  renderDetail(el('detail'), selected, state.earned, state.spoilerOn);
  renderRoadmap(el('roadmap'), state.trophies, state.earned);
  renderMissables(el('missables'), state.trophies, state.earned);
  updateProgress();
  saveProgress(state.earned);
}

function toggleEarned(id) {
  if (state.earned.has(id)) state.earned.delete(id);
  else state.earned.add(id);
  refreshAll();
}

function downloadExport() {
  const blob = buildExportBlob(state.earned);
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'leonida-ledger-progress.json';
  a.click();
  URL.revokeObjectURL(url);
}

async function handleImport(file) {
  if (!file) return;
  try {
    const text = await file.text();
    state.earned = parseImportedFile(text);
    refreshAll();
  } catch (err) {
    alert(`Could not import that file: ${err.message}`);
  }
}

function switchTab(name) {
  document.querySelectorAll('.tab').forEach((b) => {
    const on = b.dataset.tab === name;
    b.classList.toggle('active', on);
    b.setAttribute('aria-selected', String(on));
  });
  document.querySelectorAll('.panel').forEach((p) => {
    p.classList.toggle('active', p.id === `tab-${name}`);
  });
}

async function boot() {
  const res = await fetch('data/trophies.json');
  const data = await res.json();
  state.trophies = data.trophies;

  // Tabs.
  document.querySelectorAll('.tab').forEach((b) => {
    b.addEventListener('click', () => switchTab(b.dataset.tab));
  });

  // Filters.
  el('search').addEventListener('input', (e) => {
    state.filters.search = e.target.value;
    refreshAll();
  });
  el('kind-filter').addEventListener('change', (e) => {
    state.filters.kind = e.target.value;
    refreshAll();
  });
  el('grade-filter').addEventListener('change', (e) => {
    state.filters.grade = e.target.value;
    refreshAll();
  });
  el('earned-filter').addEventListener('change', (e) => {
    state.filters.earned = e.target.value;
    refreshAll();
  });
  el('spoiler-toggle').addEventListener('change', (e) => {
    state.spoilerOn = e.target.checked;
    refreshAll();
  });

  // Checklist clicks: select a trophy; the checkbox area toggles earned.
  el('trophy-list').addEventListener('click', (e) => {
    const row = e.target.closest('.trophy-row');
    if (!row) return;
    const id = Number(row.dataset.id);
    if (e.target.closest('.check')) toggleEarned(id);
    state.selectedId = id;
    refreshAll();
  });

  // Detail pane: the earn button toggles earned.
  el('detail').addEventListener('click', (e) => {
    const btn = e.target.closest('.earn-btn');
    if (!btn) return;
    toggleEarned(Number(btn.dataset.id));
  });

  // Data buttons.
  el('export-btn').addEventListener('click', downloadExport);
  el('import-file').addEventListener('change', (e) => {
    handleImport(e.target.files[0]);
    e.target.value = '';
  });
  el('reset-btn').addEventListener('click', () => {
    if (confirm('Clear all earned trophies? This cannot be undone.')) {
      state.earned = new Set();
      clearProgress();
      refreshAll();
    }
  });

  refreshAll();
}

boot();
