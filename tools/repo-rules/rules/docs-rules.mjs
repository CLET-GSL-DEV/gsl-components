// The design contracts point at real files, or they are fiction that reads like documentation.
import fs from 'node:fs';
import path from 'node:path';

import { ROOT, rel } from '../lib/core.mjs';

const INVENTORY = path.join(ROOT, 'docs/ui/PAGE-INVENTORY.md');

/** A file path in the inventory's last column, written relative to `src/features/`. */
const FEATURE_PATH = /`([a-z][a-z0-9-]*\/pages\/[A-Za-z0-9]+\.tsx)`/g;

const pageInventoryPathsResolve = {
  id: 'page-inventory-paths-resolve',
  doc: 'Every file path named in docs/ui/PAGE-INVENTORY.md points at a file that exists.',
  why: 'The inventory is the map from a page id to the code that draws it, and it is the first thing anyone reads to find a screen. Four of its paths had drifted, naming two feature folders that were merged into one and a dashboard that had moved, so following the map led nowhere. Nothing failed, because prose cannot fail.',
  check() {
    if (!fs.existsSync(INVENTORY)) return [];
    const text = fs.readFileSync(INVENTORY, 'utf8');
    const lines = text.split('\n');
    const out = [];
    for (const [index, line] of lines.entries()) {
      for (const match of line.matchAll(FEATURE_PATH)) {
        const target = path.join(ROOT, 'src/features', match[1]);
        if (fs.existsSync(target)) continue;
        out.push({
          file: rel(INVENTORY),
          line: index + 1,
          message: `names \`${match[1]}\`, which does not exist under src/features: point the row at the file that actually draws this page`,
        });
      }
    }
    return out;
  },
};

export default [pageInventoryPathsResolve];
