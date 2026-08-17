// Collapsible left-to-right tidy tree of the SKOS BT/NT hierarchy, drawn with D3 v7.
//
// Every visible concept gets its own row (d3.tree().nodeSize), so labels can
// never overlap — that was the failure mode of the previous breadthfirst
// node-link rendering, which put ~150 same-depth concepts on a single row.
// Only the first-level facets are open at load; the ▸/▾ caret expands.
//
// RT and "sinônimo de" cannot be expressed by a tree, so they are drawn as
// dashed/dotted arcs over the tree whenever both endpoints are visible, and
// counted in a ↔N badge on the label when they are not — nothing is silently
// dropped.
//
// Shared by both contexts: the click target `/concepts/<id>` resolves to the
// editable form in admin and the read-only detail page in public, so no
// per-context configuration is needed here.
(function () {
  const container = document.getElementById('graph-canvas');
  const payload = document.getElementById('graph-data');
  if (!container || !payload || typeof d3 === 'undefined') return;

  const data = JSON.parse(payload.textContent);
  if (!data.roots || data.roots.length === 0) return;

  const ROW = 26; // px between sibling rows — one row per visible concept
  const COL = 260; // px between hierarchy levels
  const PAD = 24;
  const MIN_SCALE = 0.15;
  const MAX_SCALE = 3;
  const STATUS_FILL = { active: '#16a34a', candidate: '#ca8a04', deprecated: '#9ca3af' };

  const svg = d3
    .select(container)
    .append('svg')
    .attr('width', '100%')
    .attr('height', '100%')
    .attr('font-family', 'ui-sans-serif, system-ui, sans-serif');

  const viewport = svg.append('g');
  const linkLayer = viewport.append('g').attr('fill', 'none');
  const crossLayer = viewport.append('g').attr('fill', 'none');
  const nodeLayer = viewport.append('g');

  const zoom = d3
    .zoom()
    .scaleExtent([MIN_SCALE, MAX_SCALE])
    .on('zoom', (event) => viewport.attr('transform', event.transform));
  svg.call(zoom);

  // One synthetic parent lets every facet share a single tidy-tree pass.
  const root = d3.hierarchy({ key: '__root__', children: data.roots });
  const layout = d3.tree().nodeSize([ROW, COL]);

  // Capture the full child list for every node BEFORE collapsing, then close
  // everything below the facets: 300+ rows at once is what made the old view
  // unreadable.
  root.descendants().forEach((d) => {
    d._children = d.children;
    if (d.depth >= 1) d.children = null;
  });

  const isExpandable = (d) => !!(d.children || d._children);
  const conceptId = (d) => d.data.id;

  // Arc routed to the right of both endpoints so an association never hides
  // underneath the hierarchy links.
  function crossPath(a, b) {
    const bend = Math.max(a.y, b.y) + 40;
    return `M${a.y},${a.x}C${bend},${a.x} ${bend},${b.x} ${b.y},${b.x}`;
  }

  function update() {
    layout(root);

    const nodes = root.descendants().filter((d) => d.depth > 0);
    const links = root.links().filter((d) => d.target.depth > 0);

    // For a duplicated multi-parent concept, the first visible instance owns
    // the association arcs.
    const visible = new Map();
    nodes.forEach((d) => {
      if (!visible.has(conceptId(d))) visible.set(conceptId(d), d);
    });

    const hiddenCross = new Map();
    const drawn = [];
    (data.crossLinks || []).forEach((l) => {
      const a = visible.get(l.source);
      const b = visible.get(l.target);
      if (a && b) {
        drawn.push({ a, b, rel: l.rel });
        return;
      }
      if (a) hiddenCross.set(l.source, (hiddenCross.get(l.source) || 0) + 1);
      if (b) hiddenCross.set(l.target, (hiddenCross.get(l.target) || 0) + 1);
    });

    linkLayer
      .selectAll('path')
      .data(links, (d) => d.target.data.key)
      .join('path')
      .attr('stroke', '#93c5fd')
      .attr('stroke-width', 1.5)
      .attr('d', d3.linkHorizontal().x((d) => d.y).y((d) => d.x));

    crossLayer
      .selectAll('path')
      .data(drawn, (d) => d.rel + '|' + d.a.data.key + '|' + d.b.data.key)
      .join('path')
      .attr('stroke', (d) => (d.rel === 'related' ? '#16a34a' : '#d97706'))
      .attr('stroke-width', 1.5)
      .attr('stroke-dasharray', (d) => (d.rel === 'related' ? '6,4' : '2,3'))
      .attr('d', (d) => crossPath(d.a, d.b));

    const node = nodeLayer
      .selectAll('g.node')
      .data(nodes, (d) => d.data.key)
      .join((enter) => {
        const g = enter.append('g').attr('class', 'node');

        g.append('text')
          .attr('class', 'caret')
          .attr('x', -14)
          .attr('dy', '0.32em')
          .attr('fill', '#6b7280')
          .attr('font-size', 10)
          .attr('cursor', 'pointer')
          .on('click', (event, d) => {
            event.stopPropagation();
            toggle(d);
          });

        g.append('circle')
          .attr('r', 5)
          .attr('cursor', 'pointer')
          .on('click', (event, d) => {
            event.stopPropagation();
            if (isExpandable(d)) toggle(d);
            else openConcept(d);
          });

        g.append('text')
          .attr('class', 'label')
          .attr('x', 10)
          .attr('dy', '0.32em')
          .attr('font-size', 12)
          .attr('fill', '#374151')
          .attr('cursor', 'pointer')
          .on('click', (event, d) => {
            event.stopPropagation();
            openConcept(d);
          });

        g.append('title');
        return g;
      });

    node.attr('transform', (d) => `translate(${d.y},${d.x})`);
    node.select('circle').attr('fill', (d) => STATUS_FILL[d.data.status] || STATUS_FILL.active);
    node.select('text.caret').text((d) => (isExpandable(d) ? (d.children ? '▾' : '▸') : ''));

    node
      .select('text.label')
      .attr('font-style', (d) => (d.data.dup ? 'italic' : 'normal'))
      .attr('style', (d) => ((d.data.altLabels || []).length
        ? 'text-decoration: underline; text-decoration-style: dotted; text-underline-offset: 2px;'
        : null))
      .text((d) => {
        const collapsed = !d.children && d._children ? ` (${d._children.length})` : '';
        const hidden = hiddenCross.get(conceptId(d));
        return d.data.label + collapsed + (hidden ? ` ↔${hidden}` : '');
      });

    node.select('title').text((d) => {
      const lines = [d.data.label];
      const alt = d.data.altLabels || [];
      if (alt.length) lines.push('Nomes alternativos: ' + alt.join(', '));
      lines.push('status: ' + d.data.status);
      if (d.data.dup) lines.push('repetido — conceito com mais de um termo mais amplo');
      const hidden = hiddenCross.get(conceptId(d));
      if (hidden) lines.push(hidden + ' associação(ões) com conceito fora da vista');
      return lines.join('\n');
    });

  }

  function toggle(d) {
    d.children = d.children ? null : d._children;
    update();
  }

  function openConcept(d) {
    window.location.assign('/concepts/' + encodeURIComponent(conceptId(d)));
  }

  // Recurses over `_children` (the full snapshot captured at load, populated
  // at every depth) rather than `root.descendants()`, which only walks the
  // currently *visible* `.children` chain — on a collapsed tree that would
  // reveal just one level per click instead of the whole subtree.
  function setAll(expand) {
    const visit = (d) => {
      if (d.depth >= 1) {
        if (expand) {
          if (d._children) d.children = d._children;
        } else if (d.children) {
          d.children = null;
        }
      }
      (d.children || d._children || []).forEach(visit);
    };
    visit(root);
    update();
  }

  // ponytail: fit by measuring the rendered group — d3.zoom has no fit helper,
  // and scaling about the container centre keeps the tree where the curator
  // was looking.
  function fit() {
    const box = viewport.node().getBBox();
    const w = container.clientWidth;
    const h = container.clientHeight;
    if (!box.width || !box.height || !w || !h) return;
    const scale = Math.max(
      MIN_SCALE,
      Math.min(MAX_SCALE, (w - PAD * 2) / box.width, (h - PAD * 2) / box.height)
    );
    const tx = (w - box.width * scale) / 2 - box.x * scale;
    const ty = (h - box.height * scale) / 2 - box.y * scale;
    svg.call(zoom.transform, d3.zoomIdentity.translate(tx, ty).scale(scale));
  }

  function zoomBy(factor) {
    svg.call(zoom.scaleBy, factor);
  }

  // Exportação: a árvore já é SVG, então a rasterização usa só APIs do browser —
  // nenhuma dependência. `blob:` NÃO está em img-src na CSP de nenhum dos dois
  // contextos (public/server.js:18 e admin/server.js:32 permitem 'self', data:,
  // https:), por isso tanto a origem do <img> quanto o href do download são data:.
  const MAX_PX = 16384; // teto de dimensão de canvas; árvore de 300+ nós expandida dá ~8500px de altura

  function exportName(ext) {
    return `grafo-relacoes-semanticas-${new Date().toISOString().slice(0, 10)}.${ext}`;
  }

  // Rasteriza a árvore inteira no tamanho natural, ignorando o zoom/pan atual, e
  // no estado de expansão que está na tela (o que está recolhido não sai na imagem).
  function toPngDataUrl(callback) {
    const box = viewport.node().getBBox();
    if (!box.width || !box.height) return; // mesma guarda de fit()
    const w = Math.ceil(box.width + PAD * 2);
    const h = Math.ceil(box.height + PAD * 2);
    // Sem o teto, uma árvore alta estoura o limite de canvas e o PNG sai em branco.
    const scale = Math.min(2, MAX_PX / Math.max(w, h));

    const clone = svg.node().cloneNode(true);
    clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
    clone.setAttribute('width', w);
    clone.setAttribute('height', h);
    clone.setAttribute('viewBox', `${box.x - PAD} ${box.y - PAD} ${w} ${h}`);
    // getBBox() já vem sem o transform do próprio grupo, e o viewBox acima enquadra
    // a árvore — manter o transform de pan/zoom deslocaria tudo para fora.
    clone.querySelector('g').removeAttribute('transform');

    const xml = new XMLSerializer().serializeToString(clone);
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = Math.ceil(w * scale);
      canvas.height = Math.ceil(h * scale);
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = '#ffffff'; // canvas nasce transparente; PNG sem fundo fica ilegível
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      callback(canvas.toDataURL('image/png'));
    };
    img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(xml);
  }

  const on = (id, handler) => document.getElementById(id)?.addEventListener('click', handler);
  on('graph-zoom-in', () => zoomBy(1.3));
  on('graph-zoom-out', () => zoomBy(1 / 1.3));
  on('graph-fit', fit);
  on('graph-expand-all', () => {
    setAll(true);
    fit();
  });
  on('graph-collapse-all', () => {
    setAll(false);
    fit();
  });
  on('graph-export-png', () => {
    toPngDataUrl((dataUrl) => {
      const a = document.createElement('a');
      a.href = dataUrl;
      a.download = exportName('png');
      document.body.appendChild(a);
      a.click();
      a.remove();
    });
  });

  on('graph-export-pdf', () => {
    // A janela tem de ser aberta de forma síncrona dentro do handler de clique,
    // ANTES da rasterização assíncrona, senão o bloqueador de pop-up a mata.
    const win = window.open('', '_blank');
    if (!win) return;
    toPngDataUrl((dataUrl) => {
      win.document.write(
        '<!doctype html><title>' + exportName('pdf') + '</title>' +
        '<style>@page{margin:10mm}html,body{margin:0}img{width:100%}</style>' +
        '<img src="' + dataUrl + '" onload="window.focus();window.print()">'
      );
      win.document.close();
    });
  });

  update();
  fit();
})();
