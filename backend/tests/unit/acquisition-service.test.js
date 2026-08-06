import { randomUUID } from 'crypto';
import { connect, disconnect, clearCollections, getDb } from '../helpers/db.js';
import * as AcquisitionService from '../../src/services/AcquisitionService.js';

function makeEtnodbDoc(overrides = {}) {
  return {
    comunidades: [
      {
        nome: 'Guarani Mbya',
        tipo: 'Indígena',
        plantas: [{ nomeVernacular: 'erva-mate', tipoUso: ['medicinal', 'alimentício'] }],
        atividadesEconomicas: ['artesanato'],
      },
    ],
    ...overrides,
  };
}

function insertBiocultdbRecord(db, doc) {
  const now = new Date().toISOString();
  db.prepare(
    'INSERT INTO biocultdb_records (id, doc, created_at, updated_at) VALUES (?, ?, ?, ?)'
  ).run(randomUUID(), JSON.stringify(doc), now, now);
}

function findConceptByPrefLabel(db, literalForm) {
  const row = db
    .prepare(
      `SELECT doc FROM etnotermos WHERE EXISTS (
         SELECT 1 FROM json_each(json_extract(doc,'$.prefLabels')) je
         WHERE json_extract(je.value,'$.literalForm') = ?
       )`
    )
    .get(literalForm);
  return row ? JSON.parse(row.doc) : null;
}

function findConceptsByPrefLabel(db, literalForm) {
  return db
    .prepare(
      `SELECT doc FROM etnotermos WHERE EXISTS (
         SELECT 1 FROM json_each(json_extract(doc,'$.prefLabels')) je
         WHERE json_extract(je.value,'$.literalForm') = ?
       )`
    )
    .all(literalForm)
    .map((r) => JSON.parse(r.doc));
}

function countEtnotermos(db) {
  return db.prepare('SELECT COUNT(*) as n FROM etnotermos').get().n;
}

function countAcquisitionLogs(db) {
  return db.prepare('SELECT COUNT(*) as n FROM etnotermos_acquisition_log').get().n;
}

function findAcquisitionLogByStatus(db, status) {
  const row = db
    .prepare(`SELECT doc FROM etnotermos_acquisition_log WHERE json_extract(doc,'$.status') = ?`)
    .get(status);
  return row ? JSON.parse(row.doc) : null;
}

describe('AcquisitionService — unit tests', () => {
  let db;

  beforeAll(async () => {
    await connect();
    db = getDb();
  });

  afterAll(async () => {
    await disconnect();
  });

  beforeEach(async () => {
    await clearCollections();
  });

  // ---------------------------------------------------------------------------
  // Normalization
  // ---------------------------------------------------------------------------

  describe('normalization', () => {
    test('toLower + trim applied to all field values', async () => {
      insertBiocultdbRecord(db, {
        comunidades: [{ nome: 'X', tipo: '  ARTESANATO  ', plantas: [], atividadesEconomicas: [] }],
      });

      await AcquisitionService.run(db);

      const concept = findConceptByPrefLabel(db, 'artesanato');
      expect(concept).not.toBeNull();
    });

    test('null and empty values are ignored (no concept sourced from that community)', async () => {
      insertBiocultdbRecord(db, {
        comunidades: [
          {
            nome: 'Y',
            tipo: null,
            plantas: [{ nomeVernacular: null, tipoUso: [null, ''] }],
            atividadesEconomicas: [null, ''],
          },
        ],
      });

      await AcquisitionService.run(db);

      const fromCommunityY = db
        .prepare(
          `SELECT COUNT(*) as n FROM etnotermos WHERE EXISTS (
             SELECT 1 FROM json_each(json_extract(doc,'$.sourceCommunities')) je WHERE je.value = 'Y'
           )`
        )
        .get().n;
      expect(fromCommunityY).toBe(0);
    });
  });

  // ---------------------------------------------------------------------------
  // Cross-field deduplication
  // ---------------------------------------------------------------------------

  describe('cross-field deduplication', () => {
    test('same literalForm from two fields → single concept with both sourceFields', async () => {
      insertBiocultdbRecord(db, {
        comunidades: [
          {
            nome: 'Krenak',
            tipo: 'medicinal',
            plantas: [{ nomeVernacular: 'cipó', tipoUso: ['medicinal'] }],
            atividadesEconomicas: [],
          },
        ],
      });

      await AcquisitionService.run(db);

      const concepts = findConceptsByPrefLabel(db, 'medicinal');

      expect(concepts).toHaveLength(1);
      expect(concepts[0].sourceFields).toContain('comunidades.tipo');
      expect(concepts[0].sourceFields).toContain('comunidades.plantas.tipoUso');
    });
  });

  // ---------------------------------------------------------------------------
  // Curation survival: a term folded into another concept must not be recreated
  // ---------------------------------------------------------------------------

  describe('curation survival', () => {
    /** Folds `term` into `targetLiteralForm` as a label of `arrayKey`, the way a
     *  curator merging duplicates does. */
    function foldLabelInto(db, targetLiteralForm, arrayKey, term) {
      const target = findConceptByPrefLabel(db, targetLiteralForm);
      target[arrayKey].push({
        id: randomUUID(),
        literalForm: term,
        language: 'por',
        type: arrayKey === 'altLabels' ? 'alt' : 'hidden',
        accessLevel: 'public',
        labelRelations: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      db.prepare('UPDATE etnotermos SET doc = ? WHERE id = ?').run(
        JSON.stringify(target),
        target.id
      );
    }

    test('a term folded in as an altLabel is not recreated as a new concept', async () => {
      insertBiocultdbRecord(db, {
        comunidades: [
          {
            nome: 'Krenak',
            tipo: 'Indígena',
            plantas: [{ nomeVernacular: 'guaco', tipoUso: ['gripe', 'gripes'] }],
            atividadesEconomicas: [],
          },
        ],
      });
      await AcquisitionService.run(db);
      expect(findConceptsByPrefLabel(db, 'gripes')).toHaveLength(1);

      // Curator merges: 'gripes' becomes an alternative label of 'gripe' and the
      // duplicate concept is removed.
      const dupe = findConceptByPrefLabel(db, 'gripes');
      db.prepare('DELETE FROM etnotermos WHERE id = ?').run(dupe.id);
      foldLabelInto(db, 'gripe', 'altLabels', 'gripes');

      await AcquisitionService.run(db);

      expect(findConceptsByPrefLabel(db, 'gripes')).toHaveLength(0);
      const gripe = findConceptByPrefLabel(db, 'gripe');
      expect(gripe.altLabels.map((l) => l.literalForm)).toContain('gripes');
    });

    test('a misspelling folded in as a hiddenLabel is not recreated as a new concept', async () => {
      insertBiocultdbRecord(db, {
        comunidades: [
          {
            nome: 'Fulni-ô',
            tipo: 'Indígena',
            plantas: [{ nomeVernacular: 'goiaba', tipoUso: ['diarreia', 'diarréia'] }],
            atividadesEconomicas: [],
          },
        ],
      });
      await AcquisitionService.run(db);

      const dupe = findConceptByPrefLabel(db, 'diarréia');
      db.prepare('DELETE FROM etnotermos WHERE id = ?').run(dupe.id);
      foldLabelInto(db, 'diarreia', 'hiddenLabels', 'diarréia');

      await AcquisitionService.run(db);

      expect(findConceptsByPrefLabel(db, 'diarréia')).toHaveLength(0);
    });

    test('seeded concepts use the ISO 639-3 language code', async () => {
      insertBiocultdbRecord(db, {
        comunidades: [
          {
            nome: 'Tekoha',
            tipo: 'Indígena',
            plantas: [{ nomeVernacular: 'jaborandi', tipoUso: [] }],
            atividadesEconomicas: [],
          },
        ],
      });

      await AcquisitionService.run(db);

      expect(findConceptByPrefLabel(db, 'jaborandi').prefLabels[0].language).toBe('por');
    });
  });

  // ---------------------------------------------------------------------------
  // Scientific name extraction
  // ---------------------------------------------------------------------------

  describe('nomeCientifico extraction', () => {
    test('scientific names are extracted as candidate concepts', async () => {
      insertBiocultdbRecord(db, {
        comunidades: [
          {
            nome: 'Guarani',
            tipo: 'Indígena',
            plantas: [{ nomeCientifico: 'Foeniculum vulgare', nomeVernacular: 'erva-doce', tipoUso: [] }],
            atividadesEconomicas: [],
          },
        ],
      });

      await AcquisitionService.run(db);

      const concept = findConceptByPrefLabel(db, 'foeniculum vulgare');
      expect(concept).not.toBeNull();
      expect(concept.sourceFields).toContain('comunidades.plantas.nomeCientifico');
      expect(concept.status).toBe('candidate');
    });
  });

  // ---------------------------------------------------------------------------
  // Static reference vocabulary seeding
  // ---------------------------------------------------------------------------

  describe('reference term seeding', () => {
    test('a known docs/tipoUso.txt term is created even with no matching biocultdb_records', async () => {
      await AcquisitionService.run(db);

      const concept = findConceptByPrefLabel(db, 'cicatrizante');
      expect(concept).not.toBeNull();
      expect(concept.sourceFields).toContain('comunidades.plantas.tipoUso');
      expect(concept.status).toBe('candidate');
      expect(concept.sourceCommunities).toEqual([]);
    });

    test('a reference term already mined from live data merges instead of duplicating', async () => {
      insertBiocultdbRecord(db, {
        comunidades: [
          {
            nome: 'Krenak',
            tipo: 'Indígena',
            plantas: [{ nomeVernacular: 'cipó', tipoUso: ['cicatrizante'] }],
            atividadesEconomicas: [],
          },
        ],
      });

      await AcquisitionService.run(db);

      const concepts = findConceptsByPrefLabel(db, 'cicatrizante');
      expect(concepts).toHaveLength(1);
      expect(concepts[0].sourceCommunities).toContain('Krenak');
    });

    test('running twice does not duplicate reference-seeded concepts', async () => {
      await AcquisitionService.run(db);
      const countAfterFirst = countEtnotermos(db);

      await AcquisitionService.run(db);
      const countAfterSecond = countEtnotermos(db);

      expect(countAfterSecond).toBe(countAfterFirst);
    });
  });

  // ---------------------------------------------------------------------------
  // Idempotency
  // ---------------------------------------------------------------------------

  describe('idempotency', () => {
    test('running twice does not create duplicate concepts', async () => {
      insertBiocultdbRecord(db, makeEtnodbDoc());

      await AcquisitionService.run(db);
      const countAfterFirst = countEtnotermos(db);

      await AcquisitionService.run(db);
      const countAfterSecond = countEtnotermos(db);

      expect(countAfterSecond).toBe(countAfterFirst);
    });

    test('second run adds new sourceField to existing concept', async () => {
      insertBiocultdbRecord(db, {
        comunidades: [
          {
            nome: 'Guarani',
            tipo: 'medicinal',
            plantas: [],
            atividadesEconomicas: [],
          },
        ],
      });

      await AcquisitionService.run(db);

      insertBiocultdbRecord(db, {
        comunidades: [
          {
            nome: 'Krenak',
            tipo: 'artesanato',
            plantas: [{ nomeVernacular: 'cipó', tipoUso: ['medicinal'] }],
            atividadesEconomicas: [],
          },
        ],
      });

      await AcquisitionService.run(db);

      const concept = findConceptByPrefLabel(db, 'medicinal');

      expect(concept).not.toBeNull();
      expect(concept.sourceFields).toContain('comunidades.tipo');
      expect(concept.sourceFields).toContain('comunidades.plantas.tipoUso');
    });
  });

  // ---------------------------------------------------------------------------
  // Failure log
  // ---------------------------------------------------------------------------

  describe('failure logging', () => {
    test('corrupt comunidades field → AcquisitionLog with status:failure and hasUnresolved:true', async () => {
      insertBiocultdbRecord(db, {
        comunidades: 'NOT_AN_ARRAY',
      });

      await AcquisitionService.run(db);

      const log = findAcquisitionLogByStatus(db, 'failure');

      expect(log).not.toBeNull();
      expect(log.hasUnresolved).toBe(true);
      expect(log.errorMessage).toMatch(/comunidades/i);
    });
  });

  // ---------------------------------------------------------------------------
  // Success log
  // ---------------------------------------------------------------------------

  describe('success logging', () => {
    test('successful run with data creates AcquisitionLog', async () => {
      insertBiocultdbRecord(db, makeEtnodbDoc());

      await AcquisitionService.run(db);

      const log = findAcquisitionLogByStatus(db, 'success');

      expect(log).not.toBeNull();
      expect(typeof log.conceptsCreated).toBe('number');
      expect(typeof log.durationMs).toBe('number');
    });

    test('run with no biocultdb_records still seeds the static reference vocabulary', async () => {
      const log = await AcquisitionService.run(db);

      expect(countAcquisitionLogs(db)).toBe(1);
      expect(log.conceptsCreated).toBeGreaterThan(0);
    });
  });

  // ---------------------------------------------------------------------------
  // getLastRunStatus
  // ---------------------------------------------------------------------------

  describe('getLastRunStatus', () => {
    test('returns lastRun:null when no logs exist', async () => {
      const result = await AcquisitionService.getLastRunStatus(db);
      expect(result.lastRun).toBeNull();
    });

    test('returns most recent log when logs exist', async () => {
      insertBiocultdbRecord(db, makeEtnodbDoc());
      await AcquisitionService.run(db);

      const result = await AcquisitionService.getLastRunStatus(db);
      expect(result.lastRun).not.toBeNull();
      expect(result.lastRun).toHaveProperty('status');
    });
  });
});
