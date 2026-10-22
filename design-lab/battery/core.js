// Pure psychophysics core for the perception battery. No DOM here, so it can be
// tested in Node and reused by the page.
//
// Model: 2AFC (which panel has the seam). P(correct) = 0.5 + 0.5(1-λ)(1-exp(-(x/α)^β)).
// α = threshold scale (x in quanta), β fixed (slope), λ = lapse. Bayesian posterior
// over α on a grid; the next stimulus is the one whose posterior-mean P(correct) is
// closest to 0.75 (the 2AFC threshold). Threshold = x where P(correct) = 0.75.
(function (root) {
  const BETA = 3.5, LAMBDA = 0.02;

  function pCorrect(x, alpha) {
    if (x <= 0) return 0.5;
    return 0.5 + 0.5 * (1 - LAMBDA) * (1 - Math.exp(-Math.pow(x / alpha, BETA)));
  }

  function makeGrid(lo, hi, n) {
    const g = [];
    for (let i = 0; i < n; i++) g.push(lo + (hi - lo) * i / (n - 1));
    return g;
  }

  function newStaircase(candidates) {
    // candidates: [{d, x}] — d = requested Δ (quanta), x = achieved Δ after 8-bit quantisation.
    const alphas = makeGrid(0.2, 3.0, 57);
    return { alphas, post: alphas.map(() => 1 / alphas.length), candidates, history: [] };
  }

  function meanP(st, x) {
    let s = 0;
    for (let i = 0; i < st.alphas.length; i++) s += st.post[i] * pCorrect(x, st.alphas[i]);
    return s;
  }

  function nextStimulus(st) {
    let best = null, bestErr = Infinity;
    for (const c of st.candidates) {
      const err = Math.abs(meanP(st, c.x) - 0.75);
      if (err < bestErr) { bestErr = err; best = c; }
    }
    return best;
  }

  function update(st, stim, correct) {
    for (let i = 0; i < st.alphas.length; i++) {
      const p = pCorrect(stim.x, st.alphas[i]);
      st.post[i] *= correct ? p : 1 - p;
    }
    const s = st.post.reduce((a, b) => a + b, 0);
    st.post = st.post.map((v) => v / s);
    st.history.push({ d: stim.d, x: stim.x, correct });
  }

  function threshold75(st) {
    let a = 0;
    for (let i = 0; i < st.alphas.length; i++) a += st.post[i] * st.alphas[i];
    // solve 0.5 + 0.5(1-λ)(1-e^{-(x/a)^β}) = 0.75
    const inner = -Math.log(1 - 0.5 / (1 - LAMBDA));
    return { alpha: a, x75: a * Math.pow(inner, 1 / BETA) };
  }

  // Posterior spread: 10th–90th percentile of the threshold, for an honest interval.
  function threshold75Interval(st) {
    const xs = [];
    const inner = -Math.log(1 - 0.5 / (1 - LAMBDA));
    const cdf = [];
    let acc = 0;
    for (let i = 0; i < st.alphas.length; i++) { acc += st.post[i]; cdf.push(acc); }
    const pick = (q) => { for (let i = 0; i < cdf.length; i++) if (cdf[i] >= q) return st.alphas[i]; return st.alphas[st.alphas.length - 1]; };
    return { lo: pick(0.1) * Math.pow(inner, 1 / BETA), hi: pick(0.9) * Math.pow(inner, 1 / BETA) };
  }

  const api = { pCorrect, newStaircase, nextStimulus, update, threshold75, threshold75Interval, BETA, LAMBDA };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.BatteryCore = api;
})(typeof window !== 'undefined' ? window : globalThis);
