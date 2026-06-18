/* ============================================================
   js/render.js
   All DOM-rendering for the results section:
   renderResults · renderVerdictCard · renderMetrics ·
   renderAIInsights · renderEmailPreview · renderTimeline ·
   renderIndicators · renderURLPanel · renderTips
   Depends on: rules.js (TIPS), engine.js (getVerdict)
   ============================================================ */

/** Master render — called once analysis is complete. */
function renderResults(text, verdict, triggered, score) {
  renderVerdictCard(verdict, triggered, score);
  renderMetrics(verdict, triggered, score);
  renderAIInsights(verdict, triggered, score);
  renderEmailPreview(text, verdict);
  renderTimeline(verdict);
  renderIndicators(triggered);
  renderURLPanel(text, triggered);
  renderTips();
}

/* ---- VERDICT CARD ---- */
function renderVerdictCard(verdict, triggered, score) {
  const vc = document.getElementById('verdictCard');
  vc.className = 'verdict-card ' + verdict.type;
  document.getElementById('verdictIcon').textContent = verdict.icon;
  document.getElementById('verdictName').textContent = verdict.label;
  document.getElementById('verdictDesc').textContent = verdict.desc;

  const metaItems = [
    `${triggered.length} indicator${triggered.length !== 1 ? 's' : ''} flagged`,
    `Risk score: ${score} / 25 pts`,
    `Confidence: ${verdict.confidence}`
  ];
  document.getElementById('verdictMeta').innerHTML = metaItems
    .map(m => `<div class="vmeta"><div class="vmeta-dot"></div>${m}</div>`)
    .join('');

  const color = verdict.type === 'safe' ? 'var(--safe)' : verdict.type === 'warn' ? 'var(--warn)' : 'var(--danger)';
  document.getElementById('verdictScores').innerHTML = `
    <div class="vscore">
      <div class="vscore-num" style="color:${color}">${score}</div>
      <div class="vscore-label">RISK SCORE</div>
    </div>
    <div class="vscore">
      <div class="vscore-num" style="color:${color}">${triggered.length}</div>
      <div class="vscore-label">FLAGS</div>
    </div>
    <div class="vscore">
      <div class="vscore-num" style="color:${color}">${Math.min(Math.round(score / 25 * 100), 99)}%</div>
      <div class="vscore-label">PHISH PROB</div>
    </div>`;
}

/* ---- ADVANCED METRICS ---- */
function renderMetrics(verdict, triggered, score) {
  const phishProb = Math.min(Math.round(score / 25 * 100), 99);
  const credRisk  = triggered.some(r => r.id === 'credentials')                ? 85 : triggered.length > 1 ? 40 : 10;
  const urlRisk   = triggered.some(r => r.id === 'suspiciousurl')              ? 90 : 15;
  const spoofConf = triggered.some(r => r.id === 'spoofed')                    ? 88 : 12;
  const malRisk   = triggered.some(r => r.id === 'attachment')                 ? 75 : 8;
  const seiRisk   = triggered.some(r => r.id === 'urgency' || r.id === 'offer')? 80 : 15;

  const pick = v => v > 60 ? 'var(--danger)' : v > 30 ? 'var(--warn)' : 'var(--safe)';
  const mainColor = verdict.type === 'safe' ? 'var(--safe)' : verdict.type === 'warn' ? 'var(--warn)' : 'var(--danger)';

  const metrics = [
    { label: 'PHISH PROBABILITY',  val: phishProb + '%', sub: 'Overall assessment',    bar: phishProb, color: mainColor     },
    { label: 'CREDENTIAL RISK',    val: credRisk  + '%', sub: 'Theft vector risk',     bar: credRisk,  color: pick(credRisk) },
    { label: 'URL SUSPICION',      val: urlRisk   + '%', sub: 'Link analysis',         bar: urlRisk,   color: pick(urlRisk)  },
    { label: 'SPOOFING RISK',      val: spoofConf + '%', sub: 'Sender authenticity',   bar: spoofConf, color: pick(spoofConf)},
    { label: 'MALWARE RISK',       val: malRisk   + '%', sub: 'Attachment risk',       bar: malRisk,   color: pick(malRisk)  },
    { label: 'SOCIAL ENGINEERING', val: seiRisk   + '%', sub: 'Manipulation tactics',  bar: seiRisk,   color: pick(seiRisk)  }
  ];

  document.getElementById('metricsGrid').innerHTML = metrics.map(m => `
    <div class="metric-cell">
      <div class="metric-label">${m.label}</div>
      <div class="metric-bar-wrap">
        <div class="metric-bar" style="background:${m.color};width:${m.bar}%"></div>
      </div>
      <div class="metric-val" style="color:${m.color}">${m.val}</div>
      <div class="metric-sub">${m.sub}</div>
    </div>`).join('');

  document.getElementById('metricsTag').textContent = `// ${phishProb}% threat probability`;
}

/* ---- AI INSIGHTS ---- */
function renderAIInsights(verdict, triggered, score) {
  const insights = [];

  if (verdict.type === 'danger') {
    insights.push({ icon: '🚨', bg: 'rgba(255,61,90,0.1)',
      text: `<strong>High-confidence phishing detected.</strong> This email exhibits ${triggered.length} distinct attack indicators with a combined risk score of ${score}/25. Do not click any links or reply.` });
  } else if (verdict.type === 'warn') {
    insights.push({ icon: '⚠️', bg: 'rgba(255,184,0,0.1)',
      text: `<strong>Suspicious patterns identified.</strong> ${triggered.length} red flag${triggered.length > 1 ? 's' : ''} detected. This email warrants verification before taking any action.` });
  } else {
    insights.push({ icon: '✅', bg: 'rgba(0,232,150,0.1)',
      text: `<strong>No significant threats detected.</strong> This email passed all detection rule categories and appears consistent with legitimate communication patterns.` });
  }

  if (triggered.some(r => r.id === 'credentials')) {
    insights.push({ icon: '🔐', bg: 'rgba(255,61,90,0.1)',
      text: `<strong>Credential harvesting vector confirmed.</strong> This email contains explicit requests for sensitive authentication data — a hallmark of credential phishing attacks.` });
  }
  if (triggered.some(r => r.id === 'suspiciousurl')) {
    insights.push({ icon: '🔗', bg: 'rgba(255,184,0,0.1)',
      text: `<strong>Malicious URL patterns detected.</strong> The email contains links consistent with typosquatting or URL spoofing techniques used to redirect victims to fake login pages.` });
  }
  if (triggered.some(r => r.id === 'urgency')) {
    insights.push({ icon: '⏰', bg: 'rgba(0,215,255,0.08)',
      text: `<strong>Psychological manipulation tactic.</strong> Urgency language is designed to trigger fear responses and bypass rational evaluation — a classic social engineering technique.` });
  }
  if (triggered.some(r => r.id === 'spoofed')) {
    insights.push({ icon: '🎭', bg: 'rgba(124,92,252,0.1)',
      text: `<strong>Identity spoofing indicators present.</strong> The sender information contains patterns inconsistent with legitimate corporate email infrastructure.` });
  }
  if (insights.length < 3) {
    insights.push({ icon: '🛡', bg: 'rgba(0,215,255,0.06)',
      text: `<strong>Recommendation:</strong> Always independently verify unexpected requests by contacting the organization through official contact information — not details provided in the email.` });
  }

  document.getElementById('aiBody').innerHTML = insights.slice(0, 4).map((ins, i) => `
    <div class="ai-insight" style="animation-delay:${i * 0.12}s">
      <div class="ai-insight-icon" style="background:${ins.bg}">${ins.icon}</div>
      <div class="ai-insight-text">${ins.text}</div>
    </div>`).join('');
}

/* ---- EMAIL PREVIEW ---- */
function renderEmailPreview(text, verdict) {
  const lines     = text.split('\n');
  const fromLine  = lines.find(l => /^from:/i.test(l))    || 'From: unknown@sender.com';
  const subjLine  = lines.find(l => /^subject:/i.test(l)) || 'Subject: (No subject)';
  const fromAddr  = fromLine.replace(/^from:\s*/i, '').trim();
  const subject   = subjLine.replace(/^subject:\s*/i, '').trim();
  const initials  = fromAddr.charAt(0).toUpperCase() || '?';
  const bodyText  = lines.filter(l => !/^(from:|subject:|to:|date:)/i.test(l)).join('\n').trim();

  const highlighted = bodyText
    .replace(/(urgent|immediately|verify now|action required|expire|suspended)/gi, '<span class="highlight-danger">$1</span>')
    .replace(/(click here|bit\.ly|http:\/\/|confirm your password|enter your)/gi, '<span class="highlight-danger">$1</span>')
    .replace(/(dear customer|dear user|dear member|valued customer)/gi, '<span class="highlight-warn">$1</span>')
    .replace(/\n/g, '<br>');

  const avatarBg  = verdict.type === 'safe'
    ? 'linear-gradient(135deg,var(--safe),var(--cyan2))'
    : 'linear-gradient(135deg,var(--danger),#ff8c00)';
  const addrColor = verdict.type === 'safe' ? 'var(--text2)' : 'var(--danger)';
  const badge     = verdict.type !== 'safe' ? `<span class="ep-warning-badge">⚠ SUSPICIOUS</span>` : '';
  const shortSubj = subject.length > 50 ? subject.substring(0, 50) + '…' : subject;
  const shortAddr = fromAddr.length > 55 ? fromAddr.substring(0, 55) + '…' : fromAddr;

  document.getElementById('emailPreview').innerHTML = `
    <div class="ep-toolbar">
      <div class="ep-dots">
        <div class="ep-dot ep-dot-r"></div>
        <div class="ep-dot ep-dot-y"></div>
        <div class="ep-dot ep-dot-g"></div>
      </div>
      <span style="margin-left:6px;">Inbox — Mail Client Simulator</span>
    </div>
    <div class="ep-from">
      <div class="ep-avatar" style="background:${avatarBg}">${initials}</div>
      <div class="ep-sender-info">
        <div class="ep-sender-name">${shortSubj}</div>
        <div class="ep-sender-addr" style="color:${addrColor}">${shortAddr}</div>
      </div>
      ${badge}
    </div>
    <div class="ep-body">${highlighted || '<span style="color:var(--muted)">(No body content)</span>'}</div>`;
}

/* ---- THREAT TIMELINE ---- */
function renderTimeline(verdict) {
  const thresholds = { safe: 1, warn: 3, danger: 5 };
  const active = thresholds[verdict.type];

  for (let i = 1; i <= 5; i++) {
    const el = document.getElementById('tls' + i);
    if      (i < active)  el.className = 'tl-stage done';
    else if (i === active) el.className = 'tl-stage active';
    else                  el.className = 'tl-stage';
  }

  const explainMap = {
    safe:   '<p style="font-size:13px;color:var(--safe)">✓ Email does not appear to progress past the delivery stage — no significant attack vectors detected.</p>',
    warn:   '<p style="font-size:13px;color:var(--warn)">⚠ Email shows characteristics consistent with early hook/social engineering stages of a phishing attack.</p>',
    danger: '<p style="font-size:13px;color:var(--danger)">🚨 Email exhibits a complete phishing attack chain — delivery, social engineering, and credential harvesting stages are all represented.</p>'
  };
  document.getElementById('timelineExplain').innerHTML = explainMap[verdict.type];
}

/* ---- INDICATORS LIST ---- */
function renderIndicators(triggered) {
  document.getElementById('indicatorCount').textContent = `// ${triggered.length} flag${triggered.length !== 1 ? 's' : ''}`;

  if (triggered.length === 0) {
    document.getElementById('indicatorsList').innerHTML = `
      <div class="no-flags">
        <div class="no-flags-icon">✅</div>
        <p>No phishing indicators were detected. This email passed all 8 rule categories with 0 risk points.</p>
      </div>`;
    return;
  }

  document.getElementById('indicatorsList').innerHTML = triggered.map((r, i) => `
    <div class="indicator-item ${r.severity}" style="animation-delay:${i * 0.08}s">
      <div class="indicator-badge">${r.severity.toUpperCase()}</div>
      <div class="indicator-content">
        <div class="indicator-name">${r.name}</div>
        <div class="indicator-why">${r.why}</div>
        <div style="margin-top:6px;font-family:var(--mono);font-size:10px;color:var(--muted);">Category: ${r.category}</div>
      </div>
      <div class="indicator-pts">+${r.points}</div>
    </div>`).join('');
}

/* ---- URL ANALYZER PANEL ---- */
function renderURLPanel(text, triggered) {
  const urlMatches  = text.match(/https?:\/\/[^\s<>"']*/gi) || [];
  const hasUrlFlag  = triggered.some(r => r.id === 'suspiciousurl');

  if (urlMatches.length === 0 && !hasUrlFlag) {
    document.getElementById('urlPanel').innerHTML = `
      <div style="text-align:center;padding:24px;color:var(--muted);font-size:13px;">
        <div style="font-size:28px;margin-bottom:8px;">🔗</div>
        No explicit URLs detected in this email content.
      </div>`;
    return;
  }

  if (urlMatches.length === 0 && hasUrlFlag) {
    document.getElementById('urlPanel').innerHTML = `
      <div class="ai-insight" style="background:rgba(255,61,90,0.05);border-color:rgba(255,61,90,0.15);">
        <div class="ai-insight-icon" style="background:rgba(255,61,90,0.1)">⚠️</div>
        <div class="ai-insight-text"><strong>Suspicious link patterns detected</strong> in email body text — possible obfuscated or text-formatted URLs present.</div>
      </div>`;
    return;
  }

  const isDangerous = u => /bit\.ly|tinyurl|t\.co|http:\/\/|paypa[l1]|secure[-.]login|account[-.]verify/.test(u);
  const isMedium    = u => /login|secure|verify|account|update/.test(u);

  document.getElementById('urlPanel').innerHTML = urlMatches.slice(0, 5).map(u => {
    const risk  = isDangerous(u) ? 'high' : isMedium(u) ? 'med' : 'low';
    const color = risk === 'high' ? 'var(--danger)' : risk === 'med' ? 'var(--warn)' : 'var(--safe)';
    const label = risk === 'high' ? '🚨 HIGH RISK' : risk === 'med' ? '⚠ MODERATE' : '✓ LOW RISK';
    const short = u.length > 45 ? u.substring(0, 45) + '…' : u;
    return `
      <div style="padding:10px 12px;background:rgba(255,255,255,0.02);border:1px solid var(--border);border-left:3px solid ${color};border-radius:8px;margin-bottom:8px;">
        <div style="display:flex;align-items:center;justify-content:space-between;gap:8px;flex-wrap:wrap;">
          <div style="font-family:var(--mono);font-size:11px;color:${color};word-break:break-all;">${short}</div>
          <span style="font-family:var(--mono);font-size:9px;color:${color};background:${color}20;border:1px solid ${color}40;padding:2px 7px;border-radius:4px;white-space:nowrap;">${label}</span>
        </div>
      </div>`;
  }).join('');
}

/* ---- TIPS ---- */
function renderTips() {
  document.getElementById('tipsList').innerHTML = TIPS.map((t, i) => `
    <div class="tip-item" style="animation-delay:${i * 0.07}s">
      <span class="tip-num">0${i + 1}</span>
      <p class="tip-text"><strong>${t.title}.</strong> ${t.text}</p>
    </div>`).join('');
}
