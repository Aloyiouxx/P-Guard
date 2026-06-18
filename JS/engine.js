/* ============================================================
   js/engine.js
   Core detection logic: runDetection · getVerdict ·
   live meter updates while typing.
   Depends on: rules.js (RULES must be loaded first)
   ============================================================ */

let liveDebounce = null;

/* ---- CORE DETECTION (Original engine preserved) ---- */

/**
 * Runs all RULES against the email text.
 * Returns triggered rules array and total risk score.
 */
function runDetection(text) {
  const triggered = [];
  let score = 0;
  for (const rule of RULES) {
    const matched = rule.patterns.some(p => p.test(text));
    if (matched) {
      triggered.push(rule);
      score += rule.points;
    }
  }
  return { triggered, score };
}

/**
 * Maps a numeric score to a verdict object.
 * Thresholds: 0-4 = safe, 5-9 = warn, 10+ = danger
 */
function getVerdict(score) {
  if (score >= 10) return {
    type: 'danger', label: 'PHISHING', icon: '🚨',
    desc: 'High-confidence phishing detected. Do not interact with this email, click any links, or provide any information.',
    confidence: 'High'
  };
  if (score >= 5) return {
    type: 'warn', label: 'SUSPICIOUS', icon: '⚠️',
    desc: 'Multiple red flags detected. Treat with caution and verify through official channels before taking any action.',
    confidence: 'Medium'
  };
  return {
    type: 'safe', label: 'LEGITIMATE', icon: '✅',
    desc: 'No significant phishing indicators found. This email appears to be legitimate based on pattern analysis.',
    confidence: 'Low threat'
  };
}

/* ---- LIVE METER (updates as user types) ---- */

/**
 * Called by textarea oninput. Debounces 300ms then runs a
 * lightweight detection pass to update the live threat meter.
 */
function handleInput() {
  const text = document.getElementById('emailInput').value;
  const len  = text.length;
  document.getElementById('charCount').textContent = len.toLocaleString() + ' chars';

  clearTimeout(liveDebounce);
  liveDebounce = setTimeout(() => {
    if (len > 10) {
      const { triggered, score } = runDetection(text);
      updateLiveMeter(score, triggered);
    } else {
      resetLiveMeter();
    }
  }, 300);
}

/**
 * Animates the circular SVG meter and mini-bars to reflect
 * the current risk score without running the full render.
 */
function updateLiveMeter(score, triggered) {
  const maxScore    = 25;
  const pct         = Math.min(score / maxScore, 1);
  const circumference = 314;
  const offset      = circumference - (circumference * pct);

  const fill        = document.getElementById('threatFill');
  const scoreEl     = document.getElementById('liveScore');
  const labelEl     = document.getElementById('liveThreatLabel');
  const confEl      = document.getElementById('liveConfidence');
  const meterStatus = document.getElementById('meterStatus');

  let color, label, conf;
  if (score >= 10)     { color = 'var(--danger)'; label = 'HIGH RISK';   conf = 'High confidence'; }
  else if (score >= 5) { color = 'var(--warn)';   label = 'SUSPICIOUS';  conf = 'Medium confidence'; }
  else if (score > 0)  { color = 'var(--cyan)';   label = 'LOW RISK';    conf = 'Monitoring'; }
  else                 { color = 'var(--safe)';   label = 'NO THREAT';   conf = 'Clean'; }

  fill.style.stroke           = color;
  fill.style.strokeDashoffset = offset;
  scoreEl.style.color         = color;
  scoreEl.textContent         = score;
  labelEl.style.color         = color;
  labelEl.textContent         = label;
  confEl.textContent          = conf;
  meterStatus.textContent     = `// score: ${score} pts`;

  // Map rules to the 5 indicator bars
  const ruleMap = { urgency: 0, credentials: 1, suspiciousurl: 2, spoofed: 3 };
  const barMaxes = [3, 4, 5, 5, 3];
  const barVals  = [0, 0, 0, 0, 0];

  for (const r of triggered) {
    const idx = ruleMap[r.id] ?? 4;
    barVals[idx] = Math.min(barVals[idx] + r.points, barMaxes[idx]);
  }

  for (let i = 1; i <= 5; i++) {
    const p = (barVals[i-1] / barMaxes[i-1]) * 100;
    document.getElementById('tbar' + i).style.width = p + '%';
    document.getElementById('tbarv' + i).textContent = Math.round(p) + '%';
  }
}

/** Resets meter to zero state (e.g. after clear). */
function resetLiveMeter() {
  document.getElementById('threatFill').style.strokeDashoffset = 314;
  document.getElementById('threatFill').style.stroke           = 'var(--safe)';
  document.getElementById('liveScore').textContent             = '0';
  document.getElementById('liveScore').style.color             = 'var(--safe)';
  document.getElementById('liveThreatLabel').textContent       = 'NO THREAT';
  document.getElementById('liveThreatLabel').style.color       = 'var(--safe)';
  document.getElementById('liveConfidence').textContent        = '—';
  document.getElementById('meterStatus').textContent           = '// awaiting input';
  for (let i = 1; i <= 5; i++) {
    document.getElementById('tbar' + i).style.width   = '0%';
    document.getElementById('tbarv' + i).textContent  = '0%';
  }
}
