/* ============================================================
   js/rules.js
   All phishing detection rules and tip definitions.
   Loaded first — other scripts depend on RULES and TIPS.
   ============================================================ */

const RULES = [
  {
    id: 'urgency',
    name: 'Urgent / Threatening Language',
    severity: 'high',
    points: 3,
    category: 'Social Engineering',
    why: 'Creates artificial panic to override rational thinking — a core phishing tactic used to bypass critical evaluation.',
    patterns: [
      /urgent/i, /immediately/i, /account.{0,20}(suspend|terminat|lock|disabl)/i,
      /verify.{0,20}(now|immediately|today)/i, /action.{0,10}required/i,
      /within\s+\d+\s+hours?/i, /limited time/i, /expire/i
    ]
  },
  {
    id: 'credentials',
    name: 'Request for Sensitive Information',
    severity: 'high',
    points: 4,
    category: 'Credential Theft',
    why: 'Legitimate services never ask for passwords, PINs or card details via email. This is a near-certain indicator of phishing.',
    patterns: [
      /confirm.{0,20}(password|pin|card)/i,
      /enter.{0,20}(password|credentials|login|card|account number)/i,
      /verify.{0,20}(identity|account|password)/i,
      /provide.{0,20}(bank|credit card|social security|ssn)/i,
      /update.{0,20}(payment|billing|card)/i
    ]
  },
  {
    id: 'suspiciousurl',
    name: 'Suspicious or Spoofed URL Pattern',
    severity: 'high',
    points: 5,
    category: 'URL Spoofing',
    why: 'Attackers use typosquatted or misleading domains to steal credentials on fake login pages that mimic trusted services.',
    patterns: [
      /paypa[l1][^a-z]/i, /g[o0]{2}gle/i, /amaz[o0]n/i,
      /secure[-.]login/i, /account[-.]verify/i, /login[-.]secure/i,
      /http:\/\//i, /bit\.ly|tinyurl|t\.co/i,
      /click here/i, /\[link\]|\[url\]/i
    ]
  },
  {
    id: 'greeting',
    name: 'Generic / Impersonal Greeting',
    severity: 'low',
    points: 2,
    category: 'Mass Targeting',
    why: 'Phishers send mass emails without personalisation — legitimate companies use your real name to address you.',
    patterns: [
      /dear (customer|user|client|member|account holder|valued|sir|madam)/i,
      /hello (customer|user|friend|there)/i,
      /greetings,?\s*(customer|user)?$/im,
      /to whom it may concern/i
    ]
  },
  {
    id: 'offer',
    name: 'Too-Good-to-Be-True Offer',
    severity: 'med',
    points: 3,
    category: 'Bait & Lure',
    why: 'Fake prizes and rewards are used as bait to collect personal data or redirect victims to malicious sites.',
    patterns: [
      /you.{0,10}(won|win|selected|chosen|winner)/i,
      /\$[\d,]+[,\s]*(prize|reward|gift|free)/i,
      /free.{0,20}(iphone|laptop|gift card|cash)/i,
      /claim.{0,20}(prize|reward|winnings)/i,
      /lottery|jackpot|congratulations.{0,30}won/i
    ]
  },
  {
    id: 'attachment',
    name: 'Suspicious Attachment Reference',
    severity: 'med',
    points: 3,
    category: 'Malware Delivery',
    why: 'Malicious attachments are a primary malware delivery vector, often containing ransomware or macros that execute exploits.',
    patterns: [
      /open.{0,20}attach/i,
      /download.{0,20}(file|document|invoice|receipt)/i,
      /see.{0,20}attach/i,
      /attached.{0,20}(invoice|document|file|pdf|receipt)/i,
      /\.exe|\.zip|\.doc|\.xls/i
    ]
  },
  {
    id: 'spoofed',
    name: 'Spoofed or Suspicious Sender',
    severity: 'high',
    points: 5,
    category: 'Identity Spoofing',
    why: 'Display names can be trivially faked — the real sending domain often reveals the deception when examined closely.',
    patterns: [
      /from:.{0,60}(@gmail\.com|@yahoo\.com|@hotmail\.com).{0,20}(bank|paypal|amazon|apple|microsoft|support)/i,
      /noreply@[^a-z]/i,
      /support@[a-z0-9-]+\.(xyz|top|tk|ml|ga|cf)/i,
      /@[a-z0-9]+-[a-z0-9]+\.(com|net)/i
    ]
  },
  {
    id: 'grammar',
    name: 'Poor Grammar or Unusual Phrasing',
    severity: 'low',
    points: 2,
    category: 'Quality Indicator',
    why: 'Phishing emails often originate from non-native speakers, translation tools, or automated text generators.',
    patterns: [
      /kindly.{0,20}do the needful/i,
      /revert back/i,
      /your (account|password) (have|has been) (compromize|comprimize|hacke?d?)/i,
      /we are (bank|team) of/i,
      /please to click/i
    ]
  }
];

const TIPS = [
  { title: 'Hover before you click',               text: 'Always hover over links to preview the actual destination URL before clicking. The display text and actual URL can be completely different.' },
  { title: 'Verify the sender domain',             text: 'The display name can be faked — check the actual email address domain carefully. "PayPal Support" could be sending from a random Gmail account.' },
  { title: 'Never enter credentials from email links', text: 'Go directly to the website by typing the address in your browser instead of following email links.' },
  { title: 'Enable multi-factor authentication',   text: 'MFA protects your account even if your password is compromised. Use an authenticator app rather than SMS when possible.' },
  { title: 'Report suspicious emails',             text: "Use your email client's built-in \"Report phishing\" feature to protect other users and help train spam filters." },
  { title: 'Verify via official channels',         text: 'If an email requests urgent action, call the company directly using a number from their official website — not any number in the email.' },
];
