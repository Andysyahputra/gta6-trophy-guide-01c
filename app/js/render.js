// Leonida Ledger — trophy list and detail rendering, filters and spoiler mode.
export const KIND_LABELS = {
  story: 'Story',
  missable: 'Missable',
  collectibles: 'Collectibles',
  activities: 'Activities',
  robbery: 'Robbery',
  money: 'Money',
  world: 'World',
  completion: 'Completion',
};

export const STAGE_LABELS = {
  1: 'Stage 1 · Story',
  2: 'Stage 2 · Side content',
  3: 'Stage 3 · Grinds',
  4: 'Stage 4 · Cleanup',
};

// Escape text for safe HTML insertion.
export function escapeHtml(text) {
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// A trophy's name/description are hidden while spoiler mode is on and it is unearned.
export function isMasked(trophy, earnedIds, spoilerOn) {
  return spoilerOn && trophy.hidden && !earnedIds.has(trophy.id);
}

// Does a trophy pass the current filters?
export function trophyMatches(trophy, filters, earnedIds) {
  const q = filters.search.trim().toLowerCase();
  if (q) {
    const hay = `${trophy.name} ${trophy.description} ${trophy.guide}`.toLowerCase();
    if (!hay.includes(q)) return false;
  }
  if (filters.kind !== 'all') {
    if (filters.kind === 'missable') {
      if (!trophy.missable) return false;
    } else if (trophy.kind !== filters.kind) {
      return false;
    }
  }
  if (filters.grade !== 'all' && trophy.grade !== filters.grade) return false;
  if (filters.earned === 'earned' && !earnedIds.has(trophy.id)) return false;
  if (filters.earned === 'remaining' && earnedIds.has(trophy.id)) return false;
  return true;
}

// One row of the checklist.
export function trophyRowHtml(trophy, earnedIds, spoilerOn, selectedId) {
  const earned = earnedIds.has(trophy.id);
  const masked = isMasked(trophy, earnedIds, spoilerOn);
  const name = masked ? 'Hidden trophy' : escapeHtml(trophy.name);
  const desc = masked
    ? 'Hidden on PlayStation until earned — turn spoiler mode off or earn it to reveal.'
    : escapeHtml(trophy.description);
  const pills = [];
  if (trophy.missable) pills.push('<span class="pill missable">Missable</span>');
  if (trophy.hidden) pills.push('<span class="pill hidden-tag">Hidden</span>');
  if (trophy.count != null) pills.push(`<span class="pill count">0/${trophy.count}</span>`);
  return `<li><button type="button" class="trophy-row${earned ? ' earned' : ''}${selectedId === trophy.id ? ' selected' : ''}" data-id="${trophy.id}">
    <span class="check" aria-hidden="true">${earned ? '✓' : ''}</span>
    <span>
      <span class="trophy-name">${name}</span><br>
      <span class="trophy-desc">${desc}</span>
      <span class="meta"><span class="grade grade-${trophy.grade}">${trophy.grade}</span>${pills.join('')}</span>
    </span>
    <span class="stage-tag">${STAGE_LABELS[trophy.stage] || ''}</span>
  </button></li>`;
}

// Render the filtered checklist into the list element.
export function renderTrophyList(listEl, resultEl, trophies, filters, earnedIds, spoilerOn, selectedId) {
  const shown = trophies.filter((t) => trophyMatches(t, filters, earnedIds));
  listEl.innerHTML = shown.map((t) => trophyRowHtml(t, earnedIds, spoilerOn, selectedId)).join('');
  resultEl.textContent = `Showing ${shown.length} of ${trophies.length} trophies · ${earnedIds.size} earned`;
}

// Render the detail pane for one trophy.
export function renderDetail(detailEl, trophy, earnedIds, spoilerOn) {
  if (!trophy) {
    detailEl.innerHTML = '<p class="detail-empty">Select a trophy to read its guide, its sources and its place on the road to the platinum.</p>';
    return;
  }
  const earned = earnedIds.has(trophy.id);
  const masked = isMasked(trophy, earnedIds, spoilerOn);
  const name = masked ? 'Hidden trophy' : escapeHtml(trophy.name);
  const official = masked
    ? 'Hidden on PlayStation until earned. Turn spoiler mode off to reveal its name and description.'
    : escapeHtml(trophy.description);
  const sourceItems = trophy.sources.map((s) => `<li>${escapeHtml(s)}</li>`).join('');
  const countLine = trophy.count != null ? ` · Target: ${trophy.count}` : '';
  const missableLine = trophy.missable
    ? '<p><strong>⚠ Missable.</strong> See the Missables tab before you finish Chapter 1.</p>'
    : '';
  detailEl.innerHTML = `
    <h3>${name}</h3>
    <p class="official">Official description: ${official}</p>
    <p class="grade-line"><span class="grade grade-${trophy.grade}">${trophy.grade}</span> · ${KIND_LABELS[trophy.kind] || trophy.kind} · ${STAGE_LABELS[trophy.stage] || ''}${countLine}</p>
    ${masked ? '<p class="spoiler-mask">Spoiler mode is hiding this trophy. Earn it in the game, or switch spoiler mode off, to read its guide.</p>' : `
    <h4>How to earn it</h4>
    <div class="guide-text"><p>${escapeHtml(trophy.guide)}</p></div>
    ${missableLine}
    <h4>Sources</h4>
    <ul class="sources">${sourceItems}</ul>`}
    <button type="button" class="earn-btn${earned ? ' earned' : ''}" data-id="${trophy.id}">${earned ? '✓ Earned — click to unmark' : 'Mark as earned'}</button>`;
}
