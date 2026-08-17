// Unit tests for ConceptService.buildRelationGraph — the payload behind the
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

describe('buildRelationGraph', () => {
  test('emits one parent→child edge per broader link, ignores the narrower reciprocal, drops isolated concepts', () => {
    const parent = insert(makeConcept('medicinal'));
    const child = insert(makeConcept('asma', { broader: [parent.id] }));
    insert(makeConcept('mutirão'));
    // Reciprocal written by addBroader in production — must not double the edge.
    db.prepare(`UPDATE etnotermos SET doc = json_set(doc,'$.narrower', json_array(?)) WHERE id = ?`).run(
      child.id,
      parent.id
    );

    const graph = ConceptService.buildRelationGraph(db);

    expect(graph.nodes.map((n) => n.label).sort()).toEqual(['asma', 'medicinal']);
    expect(graph.edges).toEqual([{ id: 'e0', source: parent.id, target: child.id, rel: 'broader' }]);
  });

  test('emits a single edge for a symmetric related pair', () => {
    const a = insert(makeConcept('gripe'));
    const b = insert(makeConcept('resfriado', { related: [a.id] }));
    db.prepare(`UPDATE etnotermos SET doc = json_set(doc,'$.related', json_array(?)) WHERE id = ?`).run(b.id, a.id);

    const graph = ConceptService.buildRelationGraph(db);

    expect(graph.edges).toHaveLength(1);
    expect(graph.edges[0].rel).toBe('related');
  });

  test('status filter removes non-matching concepts and their dangling edges', () => {
    const parent = insert(makeConcept('medicinal', { status: 'candidate' }));
    insert(makeConcept('asma', { broader: [parent.id] }));

    expect(ConceptService.buildRelationGraph(db, { status: 'active' })).toEqual({ nodes: [], edges: [] });
    expect(ConceptService.buildRelationGraph(db).nodes).toHaveLength(2);
  });
});
