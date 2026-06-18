/* ============================================================
   js/ui.js
   UI state management: analyze flow · scanning animation ·
   clear · activity feed · mobile nav drawer
   Depends on: engine.js · render.js
   ============================================================ */

let scanCount   = 0;
let threatCount = 0;

/* ---- MAIN ANALYZE FLOW ---- */

/**
 * Triggered by the Analyze button or Ctrl+Enter.
 * Runs the scanning animation, then calls the detection
 * engine and passes results to render.js.
 */
function analyze() {
  const text = document.getElementById('emailInput').value.trim();
  if (!text) {
    const ta = document.getElementById('emailInput');
    ta.focus();
    ta.style.borderBottom = '1px solid var(--danger)';
    setTimeout(() => { ta.style.borderBottom = ''; }, 1500);
    return;
  }

  setScanning(true);
  animateScanSteps();

  setTimeout(() => {
    const { triggered, score } = runDetection(text);
    const verdict = getVerdict(score);

    setScanning(false);
    resetScanSteps();

    // Update header counters
    scanCount++;
    if (verdict.type !== 'safe') threatCount++;
    document.getElementById('scanCount').textContent  = scanCount;
    document.getElementById('threatCount').textContent = threatCount;

    // Render all result panels
    renderResults(text, verdict, triggered, score);

    // Add entry to activity feed
    addActivityItem(verdict, score, triggered.length);

    // Show results, hide activity feed
    document.getElementById('results-section').classList.add('visible');
    document.getElementById('activitySection').style.display = 'none';

    setTimeout(() => {
      document.getElementById('results-section').scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  }, 1600);
}

/* ---- SCANNING STATE ---- */

function setScanning(active) {
  const btn        = document.getElementById('analyzeBtn');
  const mobileBtn  = document.getElementById('mobileAnalyzeBtn');
  const progress   = document.getElementById('scanProgress');
  const tagReady   = document.getElementById('tagReady');
  const tagScanning= document.getElementById('tagScanning');

  if (active) {
    btn.disabled = mobileBtn.disabled = true;
    document.getElementById('btnText').textContent       = '⟳ Scanning…';
    document.getElementById('mobileBtnText').textContent = '⟳ Scanning…';
    progress.classList.add('active');
    tagReady.style.display    = 'none';
    tagScanning.style.display = 'inline-block';
    document.getElementById('engineStatus').textContent  = '// scanning...';
  } else {
    btn.disabled = mobileBtn.disabled = false;
    document.getElementById('btnText').textContent       = '▶ Analyze';
    document.getElementById('mobileBtnText').textContent = '▶ Analyze Email';
    progress.classList.remove('active');
    tagReady.style.display    = 'inline-block';
    tagScanning.style.display = 'none';
    document.getElementById('engineStatus').textContent  = '// engine ready';
  }
}

function animateScanSteps() {
  const steps  = ['step1','step2','step3','step4','step5'];
  const delays = [200, 500, 800, 1100, 1300];
  steps.forEach((s, i) => {
    setTimeout(() => {
      document.getElementById(s).className = 'scan-step active';
      document.getElementById('scanBarFill').style.width = ((i + 1) / 5 * 100) + '%';
      if (i > 0) document.getElementById(steps[i - 1]).className = 'scan-step done';
    }, delays[i]);
  });
}

function resetScanSteps() {
  ['step1','step2','step3','step4','step5'].forEach(s => {
    document.getElementById(s).className = 'scan-step';
  });
  document.getElementById('scanBarFill').style.width = '0%';
}

/* ---- CLEAR ---- */

function clearAll() {
  document.getElementById('emailInput').value = '';
  document.getElementById('charCount').textContent = '0 chars';
  document.getElementById('results-section').classList.remove('visible');
  document.getElementById('activitySection').style.display = '';
  resetLiveMeter();
  document.getElementById('emailInput').focus();
}

/* ---- ACTIVITY FEED ---- */

function addActivityItem(verdict, score, flags) {
  const feed   = document.getElementById('activityFeed');
  const typeMap = {
    safe:   { color: 'var(--safe)',   text: `Scan complete — <strong>No threats detected</strong> (score: ${score})` },
    warn:   { color: 'var(--warn)',   text: `Scan complete — <strong>Suspicious email</strong> detected, ${flags} indicator${flags !== 1 ? 's' : ''} (score: ${score})` },
    danger: { color: 'var(--danger)', text: `Scan complete — <strong>PHISHING detected</strong>, ${flags} indicators (score: ${score})` }
  };
  const item    = typeMap[verdict.type];
  const newItem = document.createElement('div');
  newItem.className = 'activity-item';
  newItem.style.animation = 'fadeSlide 0.3s ease';
  newItem.innerHTML = `
    <div class="activity-dot" style="background:${item.color}"></div>
    <div class="activity-text">${item.text}</div>
    <div class="activity-time">just now</div>`;
  feed.insertBefore(newItem, feed.firstChild);
}

/* ---- MOBILE NAV ---- */

function openNav() {
  document.getElementById('navOverlay').classList.add('open');
  document.getElementById('mobileSidebar').classList.add('open');
}

function closeNav() {
  document.getElementById('navOverlay').classList.remove('open');
  document.getElementById('mobileSidebar').classList.remove('open');
}
