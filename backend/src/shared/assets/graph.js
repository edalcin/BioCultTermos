// Interactive Cytoscape.js view of the SKOS semantic relation graph.
// Shared by both contexts: the click target `/concepts/<id>` resolves to the
// editable form in admin and to the read-only detail page in public, so no
// per-context configuration is needed here.
(function () {
  const container = document.getElementById('cy');
  const payload = document.getElementById('graph-data');
  if (!container || !payload || typeof cytoscape === 'undefined') return;

  const data = JSON.parse(payload.textContent);

  const cy = cytoscape({
    container,
    minZoom: 0.1,
    maxZoom: 4,
    wheelSensitivity: 0.2,
    elements: [
      ...data.nodes.map((n) => ({ data: { id: n.id, label: n.label, status: n.status } })),
      ...data.edges.map((e) => ({ data: { id: e.id, source: e.source, target: e.target, rel: e.rel } })),
    ],
    style: [
      {
        selector: 'node',
        style: {
          label: 'data(label)',
          width: 14,
          height: 14,
          'background-color': '#16a34a',
          'font-size': '11px',
          color: '#374151',
          'text-valign': 'center',
          'text-halign': 'right',
          'text-margin-x': 6,
        },
      },
      { selector: 'node[status = "candidate"]', style: { 'background-color': '#ca8a04' } },
      { selector: 'node[status = "deprecated"]', style: { 'background-color': '#9ca3af' } },
      {
        selector: 'edge',
        style: {
          width: 1.5,
          'curve-style': 'bezier',
          'line-color': '#93c5fd',
          'target-arrow-color': '#93c5fd',
          'target-arrow-shape': 'triangle',
          'arrow-scale': 0.8,
        },
      },
      {
        selector: 'edge[rel = "related"]',
        style: { 'line-color': '#16a34a', 'line-style': 'dashed', 'target-arrow-shape': 'none' },
      },
      {
        selector: 'edge[rel = "synonym"]',
        style: { 'line-color': '#d97706', 'target-arrow-color': '#d97706', 'line-style': 'dotted' },
      },
    ],
    layout: { name: 'breadthfirst', directed: true, spacingFactor: 1.1, padding: 24, avoidOverlap: true },
  });

  cy.on('tap', 'node', (event) => {
    window.location.assign('/concepts/' + encodeURIComponent(event.target.id()));
  });

  // ponytail: zoom about the viewport centre — cy.zoom(level) alone drifts the
  // pan away from whatever the curator was looking at.
  function zoomBy(factor) {
    cy.zoom({
      level: cy.zoom() * factor,
      renderedPosition: { x: cy.width() / 2, y: cy.height() / 2 },
    });
  }

  document.getElementById('graph-zoom-in')?.addEventListener('click', () => zoomBy(1.3));
  document.getElementById('graph-zoom-out')?.addEventListener('click', () => zoomBy(1 / 1.3));
  document.getElementById('graph-fit')?.addEventListener('click', () => cy.fit(undefined, 30));
})();
