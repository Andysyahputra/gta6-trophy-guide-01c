// Leonida Ledger — a GTA VI trophy guide and tracker for gta6-trophy-guide-01.
// Node 22, standard library only. The guide is plain static files in app/ and
// its screenshots live in screenshots/. This program hands the entry in: it copies
// app/ and screenshots/ beside this file into /output (or MAKEFUN_OUTPUT_DIR
// outside the grader) and writes /output/dossier.json with the vendored make.fun
// library. vendor/makefun-frontend.ts is the kit's copy, left unchanged, so the
// dossier the scorer rebuilds matches this one byte for byte.
//
// Run it outside the grader with:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { cpSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-frontend.ts';

const here = fileURLToPath(new URL('.', import.meta.url));
const out = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

mkdirSync(out, { recursive: true });
cpSync(join(here, 'app'), join(out, 'app'), { recursive: true });
mkdirSync(join(out, 'screenshots'), { recursive: true });
if (existsSync(join(here, 'screenshots'))) cpSync(join(here, 'screenshots'), join(out, 'screenshots'), { recursive: true });

// Caps from the competition's gate (reference/gate.json): the dossier text cap
// shapes the bytes, and the rest refuse an entry the scorer would refuse —
// more than 4 screenshots, one over 256 KiB, or app/ past 993 files or 48 MiB.
const dossier = buildDossier(out, { text_max_bytes: 163840, screenshots: { max: 4, max_bytes: 262144 }, app_max_files: 993, app_max_bytes: 50331648 });
writeFileSync(join(out, 'dossier.json'), dossier);

// Say what was handed in, so a local run shows its result at a glance.
console.log(`Leonida Ledger handed in to ${out}: dossier.json is ${dossier.length} bytes.`);
