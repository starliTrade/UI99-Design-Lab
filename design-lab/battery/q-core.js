// ui99-battery-v2 · pure logic for the q measurement. No DOM here.
// A block is a state machine: next() gives the stimulus to show, answer(choseLeft) takes the choice.
// Built on core.js (Bayesian 2AFC staircase, validated by simulation).
//
// Design, and why each part exists:
//  - Two INTERLEAVED staircases (A and B) on the same candidates. Each is a full, independent
//    estimate. Their agreement is the replicate check. (A repeat of the same near-threshold stimulus
//    cannot serve this purpose: a perfect 75% observer agrees with itself only ~62% of the time.)
//  - Catch trials: a large seam that must be seen. A miss means lapse or inattention.
//  - Null trials: two identical panels. Their left-choice fraction exposes a side bias.
//  - The stop rule is the posterior interval itself, not a fixed count, so easy runs end early.
(function (root) {
  const BC = (typeof BatteryCore !== 'undefined') ? BatteryCore : root.BatteryCore;

  const MIN_ADAPTIVE = 18;      // below this a threshold is not reported
  const MAX_ADAPTIVE = 40;      // hard cap on adaptive trials
  const MAX_TRIALS = 50;        // hard cap on everything
  const STOP_RATIO = 1.3;       // stop when the combined 10–90% interval is this narrow
  const VALID_RATIO = 1.6;      // a reported interval wider than this is not valid
  const REPLICATE_RATIO = 1.5;  // staircase A and B must agree within this factor
  const K_MARGIN = 2;           // q_bg = K × threshold (protocol v1 §5)
  const CATCH_EVERY = 10, CATCH_AT = 5;
  const NULL_EVERY = 12, NULL_AT = 11;

  function roleOf(i) {
    if (i % CATCH_EVERY === CATCH_AT) return 'catch';
    if (i % NULL_EVERY === NULL_AT) return 'null';
    return 'adaptive';
  }

  // candidates: [{x, key}] sorted by x; catchStim: a clearly visible seam, a full stimulus object
  function makeBlock(candidates, catchStim, rand) {
    const rnd = rand || Math.random;
    const stA = BC.newStaircase(candidates);
    const stB = BC.newStaircase(candidates);
    const stAll = BC.newStaircase(candidates);
    const trials = [];
    let adaptiveCount = 0;
    let cur = null;

    function done() {
      if (trials.length >= MAX_TRIALS) return true;
      if (adaptiveCount >= MAX_ADAPTIVE) return true;
      if (adaptiveCount >= MIN_ADAPTIVE) {
        const iv = BC.threshold75Interval(stAll);
        if (iv.hi / iv.lo <= STOP_RATIO) return true;
      }
      return false;
    }

    return {
      next() {
        if (cur) return cur;
        if (done()) return null;
        const i = trials.length;
        const role = roleOf(i);
        let stim, side = null;
        if (role === 'catch') stim = { ...catchStim, kind: 'catch', role };
        else if (role === 'null') stim = { x: 0, key: 'null:' + i, kind: 'null', role };
        else {
          // interleave: even adaptive trials go to A, odd to B
          side = adaptiveCount % 2 === 0 ? 'A' : 'B';
          const st = side === 'A' ? stA : stB;
          stim = { ...BC.nextStimulus(st), role: 'adaptive', side };
        }
        cur = { ...stim, seamLeft: rnd() < 0.5, index: i };
        return cur;
      },
      answer(choseLeft) {
        if (!cur) return;
        const correct = cur.kind === 'null' ? null : choseLeft === cur.seamLeft;
        trials.push({ role: cur.role, side: cur.side || null, key: cur.key, x: cur.x, seamLeft: cur.seamLeft, choseLeft, correct });
        if (cur.role === 'adaptive') {
          const st = cur.side === 'A' ? stA : stB;
          BC.update(st, cur, correct);
          BC.update(stAll, cur, correct);
          adaptiveCount++;
        }
        cur = null;
      },
      trials,
      staircase: stAll,
      stA, stB,
      minX: candidates[0].x, maxX: candidates[candidates.length - 1].x,
      // the largest gap between neighbouring stimulus levels: the resolution of the method here
      stepMax: candidates.reduce((m, c, i) => (i ? Math.max(m, c.x - candidates[i - 1].x) : m), 0),
    };
  }

  function blockResult(block) {
    const T = block.trials;
    const catches = T.filter((t) => t.role === 'catch');
    const nulls = T.filter((t) => t.role === 'null');
    const adaptive = T.filter((t) => t.role === 'adaptive');
    const catchOk = catches.filter((t) => t.correct).length;
    const leftFrac = T.length ? T.filter((t) => t.choseLeft).length / T.length : null;

    const th = BC.threshold75(block.staircase);
    const iv = BC.threshold75Interval(block.staircase);
    const ratio = iv.hi / iv.lo;
    const xA = BC.threshold75(block.stA).x75, xB = BC.threshold75(block.stB).x75;
    const rep = Math.max(xA, xB) / Math.min(xA, xB);

    const reasons = [];
    if (adaptive.length < MIN_ADAPTIVE) reasons.push(`کوشش تطبیقی کم (${adaptive.length} < ${MIN_ADAPTIVE})`);
    if (block.stepMax > 0.5) reasons.push(`قدرت تفکیک محرک‌ها کم است (گام ${block.stepMax.toFixed(2)}q > 0.5q؛ کوانتیزیشن ۸بیتی در این سطح)`);
    if (ratio > VALID_RATIO) reasons.push(`بازهٔ آستانه پهن (${ratio.toFixed(2)} > ${VALID_RATIO})`);
    if (rep > REPLICATE_RATIO) reasons.push(`دو زنجیرهٔ مستقل همخوان نیستند (${rep.toFixed(2)} > ${REPLICATE_RATIO})`);
    if (catches.length < 2 || catchOk / catches.length < 0.75) reasons.push(`کنترل ساده کم است (${catchOk}/${catches.length})`);
    // a threshold pinned to the edge of the stimulus range is a range artifact, not a measurement
    if (th.x75 > 0.9 * block.maxX || th.x75 < 1.1 * block.minX) reasons.push(`آستانه روی لبهٔ محرک‌ها (${th.x75.toFixed(2)} در بازهٔ ${block.minX.toFixed(2)}–${block.maxX.toFixed(2)})`);
    if (leftFrac !== null && Math.abs(leftFrac - 0.5) > 0.3) reasons.push(`سوگیری موقعیت (چپ ${(leftFrac * 100).toFixed(0)}٪)`);

    return {
      x75: +th.x75.toFixed(3),
      lo: +iv.lo.toFixed(3),
      hi: +iv.hi.toFixed(3),
      qBg: +(K_MARGIN * th.x75).toFixed(3),
      adaptive: adaptive.length,
      trials: T.length,
      replicateA: +xA.toFixed(3),
      replicateB: +xB.toFixed(3),
      replicateRatio: +rep.toFixed(2),
      catchAcc: catches.length ? +(catchOk / catches.length).toFixed(2) : null,
      nullLeftFrac: nulls.length ? +(nulls.filter((t) => t.choseLeft).length / nulls.length).toFixed(2) : null,
      leftFrac: leftFrac === null ? null : +leftFrac.toFixed(2),
      valid: reasons.length === 0,
      reasons,
    };
  }

  const api = { makeBlock, blockResult, roleOf, MIN_ADAPTIVE, MAX_ADAPTIVE, MAX_TRIALS, STOP_RATIO, VALID_RATIO, REPLICATE_RATIO, K_MARGIN };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.QCore = api;
})(typeof window !== 'undefined' ? window : globalThis);
