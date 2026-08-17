// Unit tests for ConceptService.buildRelationForest — the payload behind the
// /graph page in both contexts.
import { randomUUID } from 'crypto';
import { connect, disconnect, clearCollections, getDb } from '../helpers/db.js';
import * as ConceptService from '../../src/services/ConceptService.js';

let db = null;

beforeAll(async () => {
  const { db: testDb } = await connect();
  db = testDb;
});

afterAll(async () => {
  await disconnect();
});

beforeEach(async () => {
  await clearCollections();
});

function makeConcept(literalForm, overrides = {}) {
  const id = overrides.id ?? randomUUID();
  return {
    id,
    uri: `etnotermos:${id}`,
    status: 'active',
    sourceFields: ['comunidades.plantas.tipoUso'],
    sourceCommunities: [],
    prefLabels: [
      { id: randomUUID(), literalForm, language: 'pt', type: 'pref', accessLevel: 'public', labelRelations: [] },
    ],
    altLabels: [],
    hiddenLabels: [],
    broader: [],
    narrower: [],
    related: [],
    synonym: [],
    synonymFor: [],
    ancestors: [],
    version: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...overrides,
    id,
  };
}

function insert(concept) {
  const now = new Date().toISOString();
  db.prepare(`INSERT INTO etnotermos (id, doc, created_at, updated_at) VALUES (?, ?, ?, ?)`).run(
    concept.id,
    JSON.stringify(concept),
    now,
    now
  );
  return concept;
}

describe('buildRelationForest', () => {
  test('nests the child under its parent, ignores the narrower reciprocal, drops isolated concepts', () => {
    const parent = insert(makeConcept('medicinal'));
    const child = insert(makeConcept('asma', { broader: [parent.id] }));
    insert(makeConcept('mutirão'));
    // Reciprocal written by addBroader in production — must not double anything.
    db.prepare(`UPDATE etnotermos SET doc = json_set(doc,'$.narrower', json_array(?)) WHERE id = ?`).run(
      child.id,
      parent.id
    );

    const forest = ConceptService.buildRelationForest(db);

    expect(forest.roots.map((r) => r.label)).toEqual(['medicinal']);
    expect(forest.roots[0].children.map((c) => c.label)).toEqual(['asma']);
    expect(forest.roots[0].children[0].children).toEqual([]);
    expect(forest.counts).toEqual({ concepts: 2, broader: 1, related: 0, synonym: 0 });
    expect(forest.truncated).toBe(false);
  });

  test('a symmetric related pair yields one crossLink and two childless roots', () => {
    const a = insert(makeConcept('gripe'));
    const b = insert(makeConcept('resfriado', { related: [a.id] }));
    db.prepare(`UPDATE etnotermos SET doc = json_set(doc,'$.related', json_array(?)) WHERE id = ?`).run(b.id, a.id);

    const forest = ConceptService.buildRelationForest(db);

    expect(forest.crossLinks).toHaveLength(1);
    expect(forest.crossLinks[0].rel).toBe('related');
    expect(forest.roots.map((r) => r.label)).toEqual(['gripe', 'resfriado']);
    expect(forest.counts).toEqual({ concepts: 2, broader: 0, related: 1, synonym: 0 });
  });

  test('a concept with two parents is emitted under each, marked dup after the first', () => {
    const p1 = insert(makeConcept('medicinal'));
    const p2 = insert(makeConcept('ritual e espiritual'));
    insert(makeConcept('fumo', { broader: [p1.id, p2.id] }));

    const forest = ConceptService.buildRelationForest(db);

    expect(forest.roots.map((r) => r.label)).toEqual(['medicinal', 'ritual e espiritual']);
    const fumo = forest.roots.flatMap((r) => r.children).filter((c) => c.label === 'fumo');
    expect(fumo).toHaveLength(2);
    expect(fumo.filter((c) => c.dup)).toHaveLength(1);
    expect(new Set(fumo.map((c) => c.key)).size).toBe(2);
    expect(new Set(fumo.map((c) => c.id)).size).toBe(1);
    expect(forest.counts).toEqual({ concepts: 3, broader: 2, related: 0, synonym: 0 });
  });

  test('status filter drops the non-matching parent and its dangling branch', () => {
    const parent = insert(makeConcept('medicinal', { status: 'candidate' }));
    insert(makeConcept('asma', { broader: [parent.id] }));

    const active = ConceptService.buildRelationForest(db, { status: 'active' });
    expect(active.roots).toEqual([]);
    expect(active.counts.concepts).toBe(0);

    expect(ConceptService.buildRelationForest(db).counts.concepts).toBe(2);
  });

  test('sourceField filter drops non-matching concepts, same as status', () => {
    const parent = insert(makeConcept('medicinal', { sourceFields: ['comunidades.tipo'] }));
    insert(makeConcept('asma', { broader: [parent.id], sourceFields: ['comunidades.tipo'] }));

    const filtered = ConceptService.buildRelationForest(db, { sourceField: 'comunidades.plantas.tipoUso' });
    expect(filtered.roots).toEqual([]);
    expect(filtered.counts.concepts).toBe(0);

    const matching = ConceptService.buildRelationForest(db, { sourceField: 'comunidades.tipo' });
    expect(matching.roots.map((r) => r.label)).toEqual(['medicinal']);
    expect(matching.counts.concepts).toBe(2);
  });

  test('a stale broader cycle at the top of a branch does not hide it — every connected concept still surfaces', () => {
    // a <-broader- b <-broader- a: neither ever has an empty present(broader),
    // so the normal rootIds walk never reaches this pair or its descendant.
    const a = insert(makeConcept('a'));
    const b = insert(makeConcept('b', { broader: [a.id] }));
    db.prepare(`UPDATE etnotermos SET doc = json_set(doc,'$.broader', json_array(?)) WHERE id = ?`).run(b.id, a.id);
    const c = insert(makeConcept('c', { broader: [b.id] }));

    const forest = ConceptService.buildRelationForest(db);

    expect(forest.counts.concepts).toBe(3);
    const allLabels = new Set();
    const collect = (nodes) => nodes.forEach((n) => { allLabels.add(n.label); collect(n.children); });
    collect(forest.roots);
    expect(allLabels).toEqual(new Set(['a', 'b', 'c']));
  });
});
