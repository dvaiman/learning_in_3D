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
    ridge: '#1D9E75'
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

  // Trajectory D: AI-offloaded — task completes fast (short time on x), low effort, low learning
  const nD = 18;
  const tD = linspace(0, 3, nD);
  const dD = tD.map(t => 0.05 + 0.1 * (1 - Math.exp(-0.7 * t)));
  const lD = tD.map(t => 0.32 * (1 - Math.exp(-0.7 * t)));

  // Optimal-challenge ridge (replaces the surface).
  // Difficulty at the optimum rises with time/skill (no ceiling); learning saturates.
  const ridgeN = 60;
  const tR = linspace(0, 10, ridgeN);
  const peakD = (t) => 0.25 + 0.06 * t;        // 0.25 → 0.85 over 0..10
  const optL  = (t) => 0.96 * (1 - Math.exp(-0.32 * t));
  const wT    = (t) => 0.10 + 0.005 * t;       // tolerance widens slightly with skill

  const dRidge = tR.map(peakD);
  const lRidge = tR.map(optL);
  const dRidgeUp = tR.map(t => Math.min(0.98, peakD(t) + wT(t)));
  const dRidgeDn = tR.map(t => Math.max(0.02, peakD(t) - wT(t)));
  // Edges sit one std-dev off the peak → learning is e^(-0.5) ≈ 0.61 of the optimum
  const lEdge = tR.map(t => 0.61 * optL(t));

  function isDark() {
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  }

  function plotColors() {
    const dark = isDark();
    return {
      text: dark ? '#ececea' : '#1c1d1f',
      muted: dark ? '#a4a8b1' : '#5a5d63',
      grid: dark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)',
      zero: dark ? 'rgba(255,255,255,0.18)' : 'rgba(0,0,0,0.18)',
      bg: 'rgba(0,0,0,0)'
    };
  }

  function build3DLayout() {
    const c = plotColors();
    const axisCommon = {
      gridcolor: c.grid,
      zerolinecolor: c.zero,
      linecolor: c.zero,
      tickfont: { color: c.muted, family: 'Inter, sans-serif', size: 11 },
      titlefont: { color: c.text, family: 'Inter, sans-serif', size: 13 },
      backgroundcolor: c.bg,
      showbackground: false,
      range: [0, 1]
    };

    return {
      autosize: true,
      margin: { l: 0, r: 0, b: 0, t: 0 },
      paper_bgcolor: c.bg,
      plot_bgcolor: c.bg,
      showlegend: false,
      font: { family: 'Inter, sans-serif', color: c.text },
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

  function build3DTraces() {
    const traceA = {
      type: 'scatter3d', mode: 'lines+markers',
      name: 'Spaced + progressive difficulty',
      x: tA, y: dA, z: lA,
      line: { color: COLORS.A, width: 6 },
      marker: { size: 3, color: COLORS.A },
      hovertemplate: '<b>Spaced + progressive</b><br>Time: %{x:.1f}<br>Difficulty: %{y:.2f}<br>Learning: %{z:.2f}<extra></extra>'
    };

    const traceB = {
      type: 'scatter3d', mode: 'lines+markers',
      name: 'Massed practice, low difficulty',
      x: tB, y: dB, z: lB,
      line: { color: COLORS.B, width: 6 },
      marker: { size: 3, color: COLORS.B },
      hovertemplate: '<b>Massed, low difficulty</b><br>Time: %{x:.1f}<br>Difficulty: %{y:.2f}<br>Learning: %{z:.2f}<extra></extra>'
    };

    const traceC = {
      type: 'scatter3d', mode: 'lines+markers',
      name: 'Too hard, too fast',
      x: tC, y: dC, z: lC,
      line: { color: COLORS.C, width: 6 },
      marker: { size: 3, color: COLORS.C },
      hovertemplate: '<b>Too hard, too fast</b><br>Time: %{x:.1f}<br>Difficulty: %{y:.2f}<br>Learning: %{z:.2f}<extra></extra>'
    };

    const traceD = {
      type: 'scatter3d', mode: 'lines+markers',
      name: 'AI-offloaded',
      x: tD, y: dD, z: lD,
      line: { color: COLORS.D, width: 6, dash: 'dash' },
      marker: { size: 3, color: COLORS.D, symbol: 'diamond' },
      hovertemplate: '<b>AI-offloaded</b><br>Time: %{x:.1f}<br>Difficulty: %{y:.2f}<br>Learning: %{z:.2f}<extra></extra>'
    };

    const ridgeMain = {
      type: 'scatter3d', mode: 'lines',
      name: 'Optimal challenge ridge',
      x: tR, y: dRidge, z: lRidge,
      line: { color: COLORS.ridge, width: 8 },
      hovertemplate: '<b>Optimal ridge</b><br>Time: %{x:.1f}<br>Difficulty: %{y:.2f}<br>Predicted learning: %{z:.2f}<extra></extra>'
    };

    const ridgeUpper = {
      type: 'scatter3d', mode: 'lines',
      name: 'Upper tolerance',
      x: tR, y: dRidgeUp, z: lEdge,
      line: { color: COLORS.ridge, width: 2, dash: 'dot' },
      opacity: 0.55,
      hoverinfo: 'skip'
    };

    const ridgeLower = {
      type: 'scatter3d', mode: 'lines',
      name: 'Lower tolerance',
      x: tR, y: dRidgeDn, z: lEdge,
      line: { color: COLORS.ridge, width: 2, dash: 'dot' },
      opacity: 0.55,
      hoverinfo: 'skip'
    };

    // Order: 0 ridgeMain, 1 ridgeUpper, 2 ridgeLower, 3 A, 4 B, 5 C, 6 D
    return [ridgeMain, ridgeUpper, ridgeLower, traceA, traceB, traceC, traceD];
  }

  // S toggle controls all three ridge traces
  const TRACE_INDEX = { S: [0, 1, 2], A: [3], B: [4], C: [5], D: [6] };

  const DETAILS = {
    A: {
      title: 'Spaced + progressive difficulty',
      lede: 'Difficulty rises gradually as skill develops, with practice distributed over time.',
      body: 'This is the trajectory predicted by the desirable-difficulties literature. Spacing, retrieval practice, and a steady increase in functional difficulty feel slower in the moment but produce stronger long-term retention and transfer. The curve tracks the optimal-challenge ridge as skill grows.'
    },
    B: {
      title: 'Massed practice, low difficulty',
      lede: 'A great deal of time, very little challenge.',
      body: 'Long study sessions at consistently low functional difficulty &mdash; rereading, copying, undemanding repetition. Performance plateaus early and stays well below the ridge. The spacing-effect literature explains why time alone, without distribution and challenge, is a poor predictor of learning.'
    },
    C: {
      title: 'Too hard, too fast',
      lede: 'Difficulty rises faster than the learner can build skill.',
      body: 'Cognitive load theory: when intrinsic, extraneous, and germane load together exceed working-memory capacity, learning collapses. The orange curve climbs briefly then bends downward as the learner is overwhelmed and disengages.'
    },
    D: {
      title: 'AI-offloaded',
      lede: 'The task completes quickly &mdash; and most of the learning is skipped.',
      body: 'With AI doing the cognitive work, the task is finished fast (short on the time axis) at very low functional difficulty. Performance during practice can look excellent, but durable learning plateaus low &mdash; the fluency illusion documented by Bjork &amp; Bjork and quantified by Bastani et al. The companion bar chart below makes the practice-vs-transfer gap explicit.'
    },
    S: {
      title: 'Optimal challenge ridge',
      lede: 'A prediction, not a measured zone.',
      body: 'The thick green line is the ridge of <em>predicted</em> learning under the challenge-point framework: at each moment, the level of functional difficulty that would maximise learning for a learner whose skill has grown with time. Difficulty at the optimum keeps rising &mdash; what was desirably difficult yesterday is too easy today. The dotted lines mark a tolerance band one standard-deviation wide; outside the band, learning falls off.'
    }
  };

  const plotEl = document.getElementById('plot');
  const detailEl = document.getElementById('trajectoryDetail');

  Plotly.newPlot(plotEl, build3DTraces(), build3DLayout(), {
    responsive: true,
    displaylogo: false,
    displayModeBar: 'hover'
  });

  // ---------- Companion plot 1: effort × learning ----------
  const effortPlotEl = document.getElementById('effortPlot');

  // Effort proxies — what the learner actually expends cognitively at each point.
  // A (spaced): high effort throughout — desirable difficulties mean every session
  //   requires genuine retrieval under forgetting. Effort starts high and stays high.
  const effortA = tA.map(t => 0.62 + 0.18 * (1 - Math.exp(-0.5 * t)));  // 0.62 → 0.80
  // B (massed): consistently low effort — easy repetition, no retrieval demand.
  const effortB = dB.map(d => 0.6 * d);                                    // ~0.09–0.12
  // C (too hard): high effort early (struggling), collapses as learner disengages.
  const effortC = dC.map((d, i) => d * Math.max(0.25, 1 - 0.35 * Math.max(0, tC[i] - 1.8)));
  // D (AI-offloaded): near-zero throughout — AI removes the cognitive work.
  const effortD = tD.map(t => 0.04 + 0.02 * t);                           // 0.04–0.10

  function buildEffortLayout() {
    const c = plotColors();
    return {
      autosize: true,
      margin: { l: 56, r: 18, t: 12, b: 48 },
      paper_bgcolor: c.bg,
      plot_bgcolor: c.bg,
      font: { family: 'Inter, sans-serif', color: c.text, size: 12 },
      showlegend: false,
      xaxis: {
        title: 'Effort  →  (cognitive work expended)',
        range: [0, 1], gridcolor: c.grid, zerolinecolor: c.zero, linecolor: c.zero,
        tickfont: { color: c.muted }, titlefont: { color: c.text, size: 12 }
      },
      yaxis: {
        title: 'Learning  →',
        range: [0, 1], gridcolor: c.grid, zerolinecolor: c.zero, linecolor: c.zero,
        tickfont: { color: c.muted }, titlefont: { color: c.text, size: 12 }
      }
    };
  }

  function buildEffortTraces() {
    const ht = '%{x:.2f}<br>Learning: %{y:.2f}<extra></extra>';
    return [
      { type: 'scatter', mode: 'lines+markers', name: 'Spaced + progressive',
        x: effortA, y: lA, line: { color: COLORS.A, width: 3 }, marker: { size: 5, color: COLORS.A },
        hovertemplate: 'Effort: ' + ht },
      { type: 'scatter', mode: 'lines+markers', name: 'Massed, low difficulty',
        x: effortB, y: lB, line: { color: COLORS.B, width: 3 }, marker: { size: 5, color: COLORS.B },
        hovertemplate: 'Effort: ' + ht },
      { type: 'scatter', mode: 'lines+markers', name: 'Too hard, too fast',
        x: effortC, y: lC, line: { color: COLORS.C, width: 3 }, marker: { size: 5, color: COLORS.C },
        hovertemplate: 'Effort: ' + ht },
      { type: 'scatter', mode: 'lines+markers', name: 'AI-offloaded',
        x: effortD, y: lD, line: { color: COLORS.D, width: 3, dash: 'dash' }, marker: { size: 5, color: COLORS.D, symbol: 'diamond' },
        hovertemplate: 'Effort: ' + ht }
    ];
  }

  Plotly.newPlot(effortPlotEl, buildEffortTraces(), buildEffortLayout(), {
    responsive: true, displaylogo: false, displayModeBar: false
  });

  // ---------- Companion plot 2: practice vs transfer ----------
  const transferPlotEl = document.getElementById('transferPlot');

  // Horizontal grouped bar: conditions on y-axis, score on x-axis — avoids label collision.
  // Values are illustrative but each gap encodes a specific theoretical prediction:
  //   AI-offloaded         → −40   fluency illusion (Bastani; Bjork & Bjork)
  //   Massed, low diff.    → −28   spacing effect violated
  //   Too hard, too fast   → −15   cognitive overload (both bars low)
  //   Spaced + progressive → +12   desirable difficulties (only positive gap)
  const conditions = ['AI-offloaded', 'Too hard, too fast', 'Massed, low difficulty', 'Spaced + progressive'];
  const practiceScores = [95, 45, 78, 70];
  const transferScores = [55, 30, 50, 82];
  const conditionColors = [COLORS.D, COLORS.C, COLORS.B, COLORS.A];

  function buildTransferLayout() {
    const c = plotColors();
    return {
      autosize: true,
      barmode: 'group',
      bargap: 0.22,
      bargroupgap: 0.08,
      margin: { l: 170, r: 24, t: 8, b: 48 },
      paper_bgcolor: c.bg,
      plot_bgcolor: c.bg,
      font: { family: 'Inter, sans-serif', color: c.text, size: 12 },
      legend: {
        orientation: 'h', y: -0.18, x: 0,
        font: { color: c.muted, size: 12 },
        traceorder: 'reversed'
      },
      xaxis: {
        title: 'Score (illustrative, 0–100)',
        range: [0, 105],
        gridcolor: c.grid, zerolinecolor: c.zero, linecolor: c.zero,
        tickfont: { color: c.muted }, titlefont: { color: c.text, size: 12 }
      },
      yaxis: {
        tickfont: { color: c.muted, size: 12 },
        gridcolor: c.bg, linecolor: c.zero,
        automargin: true
      }
    };
  }

  function buildTransferTraces() {
    // Order matters: in horizontal grouped bars the LAST trace renders at the
    // top of each group. Putting "During practice" last places the solid bar
    // above the faded one. The hatch pattern on the transfer bars makes the
    // legend distinguishable beyond opacity alone.
    return [
      {
        type: 'bar', orientation: 'h',
        name: 'Transfer test (no AI)',
        y: conditions, x: transferScores,
        marker: {
          color: conditionColors,
          opacity: 0.55,
          line: { color: conditionColors, width: 1.5 },
          pattern: {
            shape: '/',
            size: 6,
            solidity: 0.35,
            fgcolor: '#ffffff',
            fgopacity: 0.6
          }
        },
        hovertemplate: 'Score: %{x}<br>%{fullData.name}<extra></extra>'
      },
      {
        type: 'bar', orientation: 'h',
        name: 'During practice',
        y: conditions, x: practiceScores,
        marker: { color: conditionColors },
        hovertemplate: 'Score: %{x}<br>%{fullData.name}<extra></extra>'
      }
    ];
  }

  Plotly.newPlot(transferPlotEl, buildTransferTraces(), buildTransferLayout(), {
    responsive: true, displaylogo: false, displayModeBar: false
  });

  // ---------- Toggle controls (3D plot only) ----------
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
    detailEl.style.borderLeft = '3px solid ' + (traceKey === 'S' ? COLORS.ridge : COLORS[traceKey]);
  }

  function clearDetail() {
    detailEl.innerHTML = '<p class="hint">Click a trajectory above to read the underlying theory. Click again to hide it.</p>';
    detailEl.style.borderLeft = '';
  }

  buttons.forEach(btn => {
    btn.addEventListener('click', () => {
      const key = btn.dataset.trace;
      const indices = TRACE_INDEX[key];
      const currentlyPressed = btn.getAttribute('aria-pressed') === 'true';
      const nextPressed = !currentlyPressed;
      btn.setAttribute('aria-pressed', String(nextPressed));
      Plotly.restyle(plotEl, { visible: nextPressed ? true : 'legendonly' }, indices);

      if (nextPressed) {
        activeDetail = key;
        showDetail(key);
      } else if (activeDetail === key) {
        activeDetail = null;
        clearDetail();
      }
    });
  });

  // ---------- React to colour-scheme changes ----------
  if (window.matchMedia) {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = () => {
      Plotly.relayout(plotEl, build3DLayout());
      Plotly.relayout(effortPlotEl, buildEffortLayout());
      Plotly.relayout(transferPlotEl, buildTransferLayout());
    };
    if (mq.addEventListener) mq.addEventListener('change', handler);
    else if (mq.addListener) mq.addListener(handler);
  }
})();
