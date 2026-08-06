/**
 * Migration: label language code `pt` (ISO 639-1) → `por` (ISO 639-3)
 *
 * The SKOS-XL model documents label languages as ISO 639-3 (Concept.js
 * `createLabel`, and the "Idioma (ISO 639-3)" field in the admin UI), but
 * AcquisitionService seeded every concept with the ISO 639-1 code `pt`. This
 * left two conventions in the same column.
 *
 * ISO 639-3 is the one that survives: it codes the indigenous languages this
 * vocabulary exists to hold (`tup`, `kgp`, `gub`), which ISO 639-1 cannot
 * represent at all.
 *
 * Rewrites `language: "pt"` → `"por"` across prefLabels, altLabels and
 * hiddenLabels of every concept. Idempotent: re-running is a no-op.
 *
 * Run: node backend/scripts/migrate-language-pt-to-por.js
 */

import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';
import database from '../src/shared/database.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const LABEL_ARRAYS = ['prefLabels', 'altLabels', 'hiddenLabels'];
const FROM = 'pt';
const TO = 'por';

/** Rewrites the language code in place. Returns how many labels changed. */
function rewrite(concept) {
  let changed = 0;
  for (const key of LABEL_ARRAYS) {
    for (const label of concept[key] ?? []) {
      if (label.language === FROM) {
        label.language = TO;
        changed++;
      }
    }
  }
  return changed;
}

function main() {
  const db = database.connect();

  const rows = db
    .prepare(
      `SELECT id, doc FROM etnotermos
       WHERE EXISTS (
         SELECT 1 FROM json_each(coalesce(json_extract(doc,'$.prefLabels'),'[]')) je
         WHERE json_extract(je.value,'$.language') = :from
       )
       OR EXISTS (
         SELECT 1 FROM json_each(coalesce(json_extract(doc,'$.altLabels'),'[]')) je
         WHERE json_extract(je.value,'$.language') = :from
       )
       OR EXISTS (
         SELECT 1 FROM json_each(coalesce(json_extract(doc,'$.hiddenLabels'),'[]')) je
         WHERE json_extract(je.value,'$.language') = :from
       )`
    )
    .all({ from: FROM });

  console.log(`Concepts with '${FROM}' labels: ${rows.length}`);

  if (rows.length === 0) {
    console.log('Nothing to migrate.');
    database.disconnect();
    return;
  }

  let concepts = 0;
  let labels = 0;

  const migrate = db.transaction((batch) => {
    const update = db.prepare('UPDATE etnotermos SET doc = ?, updated_at = ? WHERE id = ?');
    for (const row of batch) {
      const concept = JSON.parse(row.doc);
      const changed = rewrite(concept);
      if (changed === 0) continue;

      // The language code is not curatorial content: it does not bump `version`,
      // so it cannot collide with a curator's optimistic lock.
      concept.updatedAt = new Date().toISOString();
      update.run(JSON.stringify(concept), concept.updatedAt, row.id);
      concepts++;
      labels += changed;
    }
  });

  migrate(rows);

  console.log(`Migration complete: ${labels} labels in ${concepts} concepts rewritten to '${TO}'.`);
  database.disconnect();
}

try {
  main();
} catch (err) {
  console.error('Migration failed:', err.message);
  process.exitCode = 1;
}
