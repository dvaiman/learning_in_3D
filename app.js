(function () {
  'use strict';

  function linspace(start, end, n) {
    const arr = new Array(n);
    const step = (end - start) / (n - 1);
    for (let i = 0; i < n; i++) arr[i] = start + i * step;
    return arr;
  }

  const COLORS = {
    A: '#1D9E75',
    B: '#378ADD',
    C: '#D85A30',
    D: '#D4537E',
    surface: '#1D9E75'
  };

  // Trajectory A: spaced + progressive difficulty
  const nA = 40;
  const tA = linspace(0, 10, nA);
  const dA = tA.map(t => 0.3 + 0.6 * (1 - Math.exp(-0.3 * t)));
  const lA = tA.map((t, i) => 0.95 * (1 - Math.exp(-0.35 * t)) * Math.min(1, 0.5 + 0.8 * dA[i]));

  // Trajectory B: massed practice, low difficulty
  const nB = 40;
  const tB = linspace(0, 10, nB);
  const dB = tB.map(t => 0.15 + 0.05 * Math.sin(t * 0.5));
  const lB = tB.map(t => 0.45 * (1 - Math.exp(-0.2 * t)));

  // Trajectory C: too hard, too fast
  const nC = 20;
  const tC = linspace(0, 3.5, nC);
  const dC = tC.map(t => 0.3 + 0.65 * (1 - Math.exp(-1.2 * t)));
  const lC = tC.map(t => Math.max(0, 0.35 * (1 - Math.exp(-0.8 * t)) - 0.08 * Math.pow(Math.max(0, t - 2), 2)));

  // Trajectory D: AI-offloaded
  const nD = 40;
  const tD = linspace(0, 10, nD);
  const dD = tD.map(t => 0.05 + 0.1 * (1 - Math.exp(-0.5 * t)));
  const lD = tD.map(t => 0.38 * (1 - Math.exp(-0.6 * t)));

  // Optimal-zone surface (challenge point prediction)
  const sN = 36;
  const sT = linspace(0, 10, sN);
  const sD = linspace(0, 1, sN);
  const sL = [];
  for (let j = 0; j < sN; j++) {
    const row = [];
    for (let i = 0; i < sN; i++) {
      const t = sT[i];
      const d = sD[j];
      const peak = 0.4 + 0.2 * Math.min(1, t / 5);
      const w = 0.25 + 0.1 * Math.min(1, t / 8);
      const l = 0.95 * Math.exp(-Math.pow(d - peak, 2) / (2 * w * w)) * (1 - Math.exp(-0.3 * t));
      row.push(l);
    }
    sL.push(row);
  }

  function isDark() {
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  }

  function buildLayout() {
    const dark = isDark();
    const text = dark ? '#ececea' : '#1c1d1f';
    const muted = dark ? '#a4a8b1' : '#5a5d63';
    const grid = dark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)';
    const zero = dark ? 'rgba(255,255,255,0.18)' : 'rgba(0,0,0,0.18)';
    const bg = 'rgba(0,0,0,0)';

    const axisCommon = {
      gridcolor: grid,
      zerolinecolor: zero,
      linecolor: zero,
      tickfont: { color: muted, family: 'Inter, sans-serif', size: 11 },
      titlefont: { color: text, family: 'Inter, sans-serif', size: 13 },
      backgroundcolor: bg,
      showbackground: false,
      range: [0, 1]
    };

    return {
      autosize: true,
      margin: { l: 0, r: 0, b: 0, t: 0 },
      paper_bgcolor: bg,
      plot_bgcolor: bg,
      showlegend: false,
      font: { family: 'Inter, sans-serif', color: text },
      scene: {
        camera: { eye: { x: 1.5, y: -1.7, z: 0.9 } },
        aspectmode: 'cube',
        xaxis: Object.assign({}, axisCommon, {
          title: 'Time  →  (duration & spacing of practice)',
          range: [0, 10]
        }),
        yaxis: Object.assign({}, axisCommon, {
          title: 'Difficulty  →  (functional, relative to skill)',
          range: [0, 1]
        }),
        zaxis: Object.assign({}, axisCommon, {
          title: 'Learning  →  (long-term retention & transfer)',
          range: [0, 1]
        })
      }
    };
  }

  function buildTraces() {
    const surfaceColorscale = [
      [0, 'rgba(29,158,117,0.02)'],
      [0.4, 'rgba(29,158,117,0.18)'],
      [0.8, 'rgba(29,158,117,0.45)'],
      [1, 'rgba(29,158,117,0.65)']
    ];

    const traceA = {
      type: 'scatter3d',
      mode: 'lines+markers',
      name: 'Spaced + progressive difficulty',
      x: tA, y: dA, z: lA,
      line: { color: COLORS.A, width: 6 },
      marker: { size: 3, color: COLORS.A },
      hovertemplate: '<b>Spaced + progressive</b><br>Time: %{x:.1f}<br>Difficulty: %{y:.2f}<br>Learning: %{z:.2f}<extra></extra>'
    };

    const traceB = {
      type: 'scatter3d',
      mode: 'lines+markers',
      name: 'Massed practice, low difficulty',
      x: tB, y: dB, z: lB,
      line: { color: COLORS.B, width: 6 },
      marker: { size: 3, color: COLORS.B },
      hovertemplate: '<b>Massed, low difficulty</b><br>Time: %{x:.1f}<br>Difficulty: %{y:.2f}<br>Learning: %{z:.2f}<extra></extra>'
    };

    const traceC = {
      type: 'scatter3d',
      mode: 'lines+markers',
      name: 'Too hard, too fast',
      x: tC, y: dC, z: lC,
      line: { color: COLORS.C, width: 6 },
      marker: { size: 3, color: COLORS.C },
      hovertemplate: '<b>Too hard, too fast</b><br>Time: %{x:.1f}<br>Difficulty: %{y:.2f}<br>Learning: %{z:.2f}<extra></extra>'
    };

    const traceD = {
      type: 'scatter3d',
      mode: 'lines+markers',
      name: 'AI-offloaded',
      x: tD, y: dD, z: lD,
      line: { color: COLORS.D, width: 6, dash: 'dash' },
      marker: { size: 3, color: COLORS.D, symbol: 'diamond' },
      hovertemplate: '<b>AI-offloaded</b><br>Time: %{x:.1f}<br>Difficulty: %{y:.2f}<br>Learning: %{z:.2f}<extra></extra>'
    };

    const surface = {
      type: 'surface',
      name: 'Optimal-zone surface',
      x: sT,
      y: sD,
      z: sL,
      opacity: 0.55,
      showscale: false,
      colorscale: surfaceColorscale,
      contours: {
        z: { show: false }
      },
      hovertemplate: '<b>Optimal zone</b><br>Time: %{x:.1f}<br>Difficulty: %{y:.2f}<br>Predicted learning: %{z:.2f}<extra></extra>'
    };

    return [surface, traceA, traceB, traceC, traceD];
  }

  // Trace order in plot: 0 surface, 1 A, 2 B, 3 C, 4 D
  const TRACE_INDEX = { S: 0, A: 1, B: 2, C: 3, D: 4 };

  const DETAILS = {
    A: {
      title: 'Spaced + progressive difficulty',
      lede: 'Difficulty rises gradually as skill develops, with practice distributed over time.',
      body: 'This is the trajectory predicted by the desirable-difficulties literature. Spacing, retrieval practice, and a steady increase in functional difficulty feel slower in the moment but produce stronger long-term retention and transfer. The curve hugs the optimal-zone surface as skill grows.'
    },
    B: {
      title: 'Massed practice, low difficulty',
      lede: 'A great deal of time, very little challenge.',
      body: 'Long study sessions at consistently low functional difficulty &mdash; rereading, copying, undemanding repetition. Performance plateaus early and stays well below the optimal surface. The spacing effect literature explains why time alone, without distribution and challenge, is a poor predictor of learning.'
    },
    C: {
      title: 'Too hard, too fast',
      lede: 'Difficulty rises faster than the learner can build skill.',
      body: 'Cognitive load theory: when intrinsic, extraneous, and germane load together exceed working-memory capacity, learning collapses. The orange curve climbs briefly then bends downward as the learner is overwhelmed and disengages.'
    },
    D: {
      title: 'AI-offloaded',
      lede: 'AI removes the effort &mdash; and most of the learning.',
      body: 'The dashed pink trajectory shows what happens when generative tools eliminate functional difficulty rather than calibrating it. Performance during practice can look excellent, but durable learning plateaus low &mdash; the fluency illusion documented by Bjork &amp; Bjork and quantified by Bastani et al.'
    },
    S: {
      title: 'Optimal-zone surface',
      lede: 'The challenge point prediction.',
      body: 'The translucent green surface marks the band where functional difficulty maximises learning for a given amount of skill-building time. As time (and therefore skill) grows, the ridge of optimal difficulty shifts upward &mdash; what was a desirable difficulty yesterday is too easy today.'
    }
  };

  const plotEl = document.getElementById('plot');
  const detailEl = document.getElementById('trajectoryDetail');

  Plotly.newPlot(plotEl, buildTraces(), buildLayout(), {
    responsive: true,
    displaylogo: false,
    displayModeBar: 'hover'
  });

  // Toggle visibility
  const buttons = document.querySelectorAll('.toggle');
  let activeDetail = null;

  function showDetail(traceKey) {
    const d = DETAILS[traceKey];
    if (!d) return;
    detailEl.innerHTML = '';
    const title = document.createElement('p');
    title.className = 'detail-title';
    title.textContent = d.title;
    const lede = document.createElement('p');
    lede.className = 'detail-body';
    lede.innerHTML = d.lede;
    const body = document.createElement('p');
    body.className = 'detail-body';
    body.innerHTML = d.body;
    detailEl.appendChild(title);
    detailEl.appendChild(lede);
    detailEl.appendChild(body);
    detailEl.style.borderLeft = '3px solid ' + (traceKey === 'S' ? COLORS.surface : COLORS[traceKey]);
  }

  function clearDetail() {
    detailEl.innerHTML = '<p class="hint">Click a trajectory above to read the underlying theory. Click again to hide it.</p>';
    detailEl.style.borderLeft = '';
  }

  buttons.forEach(btn => {
    btn.addEventListener('click', () => {
      const key = btn.dataset.trace;
      const idx = TRACE_INDEX[key];
      const currentlyPressed = btn.getAttribute('aria-pressed') === 'true';
      const nextPressed = !currentlyPressed;
      btn.setAttribute('aria-pressed', String(nextPressed));
      Plotly.restyle(plotEl, { visible: nextPressed ? true : 'legendonly' }, [idx]);

      if (nextPressed) {
        activeDetail = key;
        showDetail(key);
      } else if (activeDetail === key) {
        activeDetail = null;
        clearDetail();
      }
    });
  });

  // React to colour-scheme changes
  if (window.matchMedia) {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = () => Plotly.relayout(plotEl, buildLayout());
    if (mq.addEventListener) mq.addEventListener('change', handler);
    else if (mq.addListener) mq.addListener(handler);
  }
})();
