// Leonida Ledger — the platinum roadmap and the missables page.
export const ROADMAP_STAGES = [
  {
    stage: 1,
    title: 'Stage 1 — Play the story',
    blurb:
      'Finish Chapters 1–4 and the final mission, and take the stranger strands as they appear. This stage alone earns every chapter trophy, every mission trophy and the gold for the final mission. Start the meditation spots now: one of them only exists during Chapter 1.',
  },
  {
    stage: 2,
    title: 'Stage 2 — Side content',
    blurb:
      'Clear the stranger strands to their final missions, try every activity once, and pick up the one-off moments — fishing against Cal, the arcade, bowling, the airport departure and the Rhino. Most of these pop in one visit each.',
  },
  {
    stage: 3,
    title: 'Stage 3 — Grinds and races',
    blurb:
      'The long ones: 250 stunts, gold at all 42 Shooting Range challenges, drone races at every location, 20 different race wins, 50 challenges, and the robbery set — 5 bank vaults, the armored truck, the jewelry store and one illegal operation per gang.',
  },
  {
    stage: 4,
    title: 'Stage 4 — Collectibles, money and 100%',
    blurb:
      'With the whole map open, finish the collectibles (cards, WAiNK It spots, vehicles, meditation), explore all 52 regions, launder $250,000, spend $100,000, buy the 8 garages, and close out the 100% checklist for A Long Road — then the platinum pops.',
  },
];

// Render the four roadmap stages with their trophies grouped beneath each.
export function renderRoadmap(roadmapEl, trophies, earnedIds) {
  roadmapEl.innerHTML = ROADMAP_STAGES.map((s) => {
    const members = trophies.filter((t) => t.stage === s.stage);
    const done = members.filter((t) => earnedIds.has(t.id)).length;
    const items = members
      .map((t) => `<li>${t.name} <span class="grade grade-${t.grade}">(${t.grade})</span>${t.missable ? ' <span class="pill missable">Missable</span>' : ''}</li>`)
      .join('');
    return `<div class="stage"><h3>${s.title} <span class="stage-count">${done} / ${members.length} earned</span></h3>
      <p>${s.blurb}</p><ul>${items}</ul></div>`;
  }).join('');
}

// Render the missables page: the one missable trophy, plus the reassurance.
export function renderMissables(missablesEl, trophies, earnedIds) {
  const missable = trophies.filter((t) => t.missable);
  const cards = missable
    .map((t) => {
      const earned = earnedIds.has(t.id);
      return `<div class="missable-card"><h3>⚠ ${t.name}${earned ? ' — earned ✓' : ''}</h3>
      <p><strong>Official description:</strong> ${t.description}</p>
      <p>${t.guide}</p>
      <p><strong>Sources:</strong> ${t.sources.join('; ')}</p></div>`;
    })
    .join('');
  missablesEl.innerHTML = `${cards}
    <div class="safe-note"><strong>The other 54 trophies are safe.</strong> Nothing else on this list can be missed: every story trophy, stranger final, activity, robbery and collectible can still be earned after the final mission, in free roam. Only Positive Mental Attitude has a spot that disappears — the Lucia balcony meditation spot in Chapter 1.</div>`;
}
