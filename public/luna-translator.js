/**
 * LunaTranslator — Reusable sign-language translation widget for the LMS.
 *
 * Extracts the core Kozha translation pipeline from app.html into a
 * self-contained module that can be embedded in any page. Handles:
 *   • SiGML sign-database loading from /data/*.sigml
 *   • Text translation via /api/translate-text
 *   • NLP planning via /api/plan
 *   • SiGML building (with fingerspelling fallback)
 *   • CWASA avatar playback (per-token sequencing)
 *
 * Usage:
 *   const lt = new LunaTranslator({ containerId: 'myDiv', avatarSlot: 1 });
 *   lt.init();
 *   lt.translate('Hello, how are you?', 'en');
 */
(function (root) {
  'use strict';

  // ─── Sign Language Data (mirrored from app.html) ─────────────────
  const SIGN_LANG_GLOSS = {
    bsl: 'en', asl: 'en', dgs: 'en', lsf: 'fr',
    lse: 'es', pjm: 'pl', gsl: 'el', rsl: 'ru',
    algerian: null, bangla: 'en', ngt: 'nl', fsl: null,
    isl: 'en', kurdish: 'ku', vsl: 'en', ksl: 'kk',
    gisl: 'en'
  };

  const SIGN_LANG_DB = {
    bsl:      { sigml: ['/data/hamnosys_bsl_version1.sigml'], csv: '/data/hamnosys_bsl.csv', alphabet: '/data/bsl_alphabet_sigml.sigml' },
    asl:      { sigml: ['/data/American_SL_ASL.sigml'], csv: '/data/asl_concepts.csv', alphabet: '/data/asl_alphabet_sigml.sigml' },
    dgs:      { sigml: ['/data/German_SL_DGS.sigml'], csv: '/data/hamnosys_dgs.csv', alphabet: '/data/dgs_alphabet_sigml.sigml' },
    lsf:      { sigml: ['/data/French_SL_LSF.sigml'], csv: '/data/hamnosys_lsf.csv', alphabet: '/data/lsf_alphabet_sigml.sigml' },
    lse:      { sigml: [], csv: null, alphabet: null },
    pjm:      { sigml: ['/data/Polish_SL_PJM.sigml'], csv: '/data/hamnosys_pjm.csv', alphabet: '/data/pjm_alphabet_sigml.sigml' },
    gsl:      { sigml: ['/data/Greek_SL_GSL.sigml'], csv: '/data/hamnosys_gsl.csv', alphabet: null },
    rsl:      { sigml: [], csv: null, alphabet: null },
    algerian: { sigml: [], csv: null, alphabet: null },
    bangla:   { sigml: ['/data/Bangla_SL.sigml'], csv: null, alphabet: null },
    ngt:      { sigml: ['/data/Dutch_SL_NGT.sigml'], csv: '/data/hamnosys_ngt.csv', alphabet: '/data/ngt_alphabet_sigml.sigml' },
    fsl:      { sigml: [], csv: null, alphabet: null },
    isl:      { sigml: ['/data/Indian_SL.sigml'], csv: null, alphabet: null },
    kurdish:  { sigml: ['/data/Kurdish_SL.sigml'], csv: null, alphabet: null },
    vsl:      { sigml: ['/data/Vietnamese_SL.sigml'], csv: null, alphabet: null },
    ksl:      { sigml: [], csv: null, alphabet: null },
    gisl:     { sigml: ['/data/Indian_SL.sigml', '/data/Gujarat_Localised_ISL_GISL.sigml'], csv: null, alphabet: '/data/gjsl_alphabet_sigml.sigml' },
  };

  const SIGN_LANG_NAMES = {
    bsl: 'BSL', asl: 'ASL', dgs: 'DGS', lsf: 'LSF', lse: 'LSE',
    pjm: 'PJM', gsl: 'GSL', rsl: 'RSL', algerian: 'Algerian SL',
    bangla: 'Bangla SL', ngt: 'NGT', fsl: 'FSL', isl: 'ISL',
    kurdish: 'Kurdish SL', vsl: 'VSL', ksl: 'KSL', gisl: 'G-ISL'
  };

  const SIGN_LANG_DISPLAY = {
    bsl: 'BSL (British)', asl: 'ASL (American)', dgs: 'DGS (German)',
    lsf: 'LSF (French)', lse: 'LSE (Spanish)', pjm: 'PJM (Polish)',
    gsl: 'GSL (Greek)', rsl: 'RSL (Russian)', algerian: 'Algerian SL',
    bangla: 'Bangla SL', ngt: 'NGT (Dutch)', fsl: 'FSL (Filipino)',
    isl: 'ISL (Indian)', kurdish: 'Kurdish SL', vsl: 'VSL (Vietnamese)',
    ksl: 'KSL (Kazakh)', gisl: 'G-ISL (Gujarat-Localised ISL)'
  };

  const SIGN_LANG_COVERAGE = {
    bsl: 881, asl: 14, dgs: 1914, lsf: 381, lse: 0,
    pjm: 1932, gsl: 889, rsl: 0, algerian: 0, bangla: 81,
    ngt: 39, fsl: 0, isl: 763, kurdish: 558, vsl: 3564, ksl: 0,
    gisl: 797
  };

  const SIGN_LANG_CORPUS = {
    bsl: 'BSL Corpus (DictaSign)', asl: 'ASL-LEX 2.0 (pilot)',
    dgs: 'DGS Lexicon', lsf: 'DictaSign LSF', lse: '—',
    pjm: 'PJM Dictionary', gsl: 'DictaSign GSL', rsl: '—',
    algerian: 'Fingerspelling only', bangla: 'bdsl-3d-animation',
    ngt: 'NGT Synthesis', fsl: 'Fingerspelling only',
    isl: 'ISL dataset', kurdish: 'KurdishBLARK', vsl: 'VSL Corpus',
    ksl: 'KSL Lexicon', gisl: 'ISL backbone + Gujarati consonants'
  };

  const BASE_LANG_NAMES = {
    en: 'English', fr: 'French', de: 'German', es: 'Spanish',
    pl: 'Polish', nl: 'Dutch', el: 'Greek', ru: 'Russian',
    ar: 'Arabic', hi: 'Hindi', gu: 'Gujarati', bn: 'Bengali',
    ur: 'Urdu'
  };

  const ARGOS_SUPPORTED = new Set(['en','fr','de','es','pl','nl','el','ru','ar','gu']);

  // Languages shown in the LMS source-language dropdown (only English and Gujarati)
  const LMS_SOURCE_LANGS = [
    { code: 'en', label: 'English' },
    { code: 'gu', label: 'Gujarati / ગુજરાતી' }
  ];

  // Sign languages for the LMS target dropdown (only G-ISL and ISL)
  const LMS_TARGET_ORDER = [
    'gisl', 'isl'
  ];

  // ─── Text helpers ────────────────────────────────────────────────
  const STOPWORDS = new Set(['a','an','the','and','or','but','if','then','than','of','to','in','on','at','for','from','with','as','by','is','are','am','be','been','was','were','do','does','did','that','this','those','these','it','my','your','our']);
  const TOPIC_TIME = new Set(['today','yesterday','tomorrow','morning','afternoon','evening','night','noon','week','month','year','time']);
  const GREETING_STARTERS = new Set(['good','nice','happy','merry']);

  function glossBase(gloss) {
    let str = String(gloss).toLowerCase()
      .replace(/\(.*?\)/g,'').replace(/#\d+$/g,'')
      .replace(/^_num-/g,'').replace(/_\(.*?\)/g,'');
    
    let noNum = str.replace(/\d+[a-z]?\^?$/g,'');
    if (!noNum) noNum = str;

    return noNum
      .replace(/[^a-z0-9\u00C0-\u024F\u0370-\u03FF\u0400-\u04FF\u0100-\u017F]+/g,' ')
      .trim();
  }

  function normalizeText(str) {
    try { return (str||'').toLowerCase().replace(/[\p{P}\p{S}]/gu,' ').split(/\s+/).filter(Boolean); }
    catch(e) { return (str||'').toLowerCase().replace(/[^\w\s]/g,' ').split(/\s+/).filter(Boolean); }
  }

  function heuristicPlan(tokens) {
    const kept = tokens.filter(t => !STOPWORDS.has(t));
    const lockedTime = new Set();
    for (let i = 0; i < kept.length; i++) {
      if (!TOPIC_TIME.has(kept[i])) continue;
      for (let k = 1; k <= 2; k++) {
        const j = i - k;
        if (j < 0) break;
        if (GREETING_STARTERS.has(kept[j])) { lockedTime.add(i); break; }
      }
    }
    const front = kept.filter((t, i) => TOPIC_TIME.has(t) && !lockedTime.has(i));
    const rest = kept.filter((t, i) => !TOPIC_TIME.has(t) || lockedTime.has(i));
    return [...front, ...rest];
  }

  function levenshtein(a, b) {
    const m = a.length, n = b.length;
    if (!m) return n; if (!n) return m;
    const dp = new Array(n + 1);
    for (let j = 0; j <= n; j++) dp[j] = j;
    for (let i = 1; i <= m; i++) {
      let prev = dp[0]; dp[0] = i;
      for (let j = 1; j <= n; j++) {
        const temp = dp[j];
        dp[j] = Math.min(dp[j] + 1, dp[j - 1] + 1, prev + (a[i - 1] === b[j - 1] ? 0 : 1));
        prev = temp;
      }
    }
    return dp[n];
  }

  function similarity(a, b) {
    if (!a || !b) return 0;
    return 1 - levenshtein(a, b) / Math.max(a.length, b.length);
  }

  // ─── Sequencer constants ─────────────────────────────────────────
  const SIGN_BLOCK_MS = 1200;
  const LETTER_BLOCK_MS = 350;
  const INTER_SIGN_MS = 300;

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // LunaTranslator class
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  function LunaTranslator(opts) {
    this.containerId = opts.containerId || 'lunaWidget';
    this.avatarSlot = opts.avatarSlot != null ? opts.avatarSlot : 1;
    this.onStatus = opts.onStatusChange || function () {};
    this.onTokens = opts.onTokensReady || function () {};

    // Internal state
    this.glossToSign = new Map();
    this.letterToSign = new Map();
    this.baseToGloss = new Map();
    this.conceptToGloss = new Map();
    this._switchId = 0;
    this._currentSignLang = '';
    this._playing = false;
    this._sequencerTimer = null;
    this._scrubTimer = null;
    this._tokens = [];
    this._perToken = [];
    this._perTokenBlocks = [];
    this._perTokenMs = [];
    this._cumulativeMs = [];
    this._totalMs = 0;
    this._index = 0;
    this._speed = 1;
    this._looping = false;
    this._onEndedCb = null;
    this._rendered = false;
  }

  // ─── Render the widget HTML ──────────────────────────────────────
  LunaTranslator.prototype.render = function () {
    const container = document.getElementById(this.containerId);
    if (!container) return;
    const avClass = 'av' + this.avatarSlot;
    const pfx = this.containerId; // prefix for unique IDs

    container.innerHTML = `
      <div class="sl-luna-widget">
        <div class="sl-luna-header">
          <div class="sl-luna-header-icon">🤟</div>
          <div>
            <h3 class="sl-luna-title">Luna Sign Language Translator</h3>
            <p class="sl-luna-subtitle">Type anything and watch Luna sign it for you!</p>
          </div>
        </div>

        <div class="sl-luna-body">
          <!-- Left: Input area -->
          <div class="sl-luna-input-pane">
            <div class="sl-luna-lang-row">
              <div class="sl-luna-lang-group">
                <label for="${pfx}_srcLang">You write in</label>
                <select id="${pfx}_srcLang" class="sl-luna-select"></select>
              </div>
              <div class="sl-luna-lang-arrow">→</div>
              <div class="sl-luna-lang-group">
                <label for="${pfx}_tgtLang">Signed in</label>
                <select id="${pfx}_tgtLang" class="sl-luna-select"></select>
              </div>
            </div>

            <textarea id="${pfx}_textInput" class="sl-luna-textarea"
              placeholder="Try something like: Hello, how are you?"
              rows="3" maxlength="5000"></textarea>

            <button id="${pfx}_translateBtn" class="sl-btn sl-btn-primary sl-luna-translate-btn">
              🤟 Translate to Sign
            </button>

            <div id="${pfx}_error" class="sl-luna-error" hidden>
              <span id="${pfx}_errorMsg"></span>
              <button id="${pfx}_errorRetry" class="sl-btn sl-btn-outline sl-luna-retry-btn">Retry</button>
            </div>

            <!-- Token chips -->
            <div id="${pfx}_tokenList" class="sl-luna-token-list"></div>
            <div id="${pfx}_coverage" class="sl-luna-coverage"></div>
          </div>

          <!-- Right: Avatar + controls -->
          <div class="sl-luna-avatar-pane">
            <div class="sl-luna-status-row">
              <span id="${pfx}_status" class="sl-luna-status-badge">Loading…</span>
            </div>

            <div class="sl-luna-avatar-stage" id="${pfx}_avatarStage">
              <!-- Target mount point for CWASA avatar -->
              <div id="${pfx}_avatarMount" style="position:absolute; inset:0; width:100%; height:100%;"></div>
            </div>

            <!-- Caption strip -->
            <div class="sl-luna-caption" id="${pfx}_caption">
              <div class="sl-luna-caption-gloss" id="${pfx}_captionGloss"></div>
              <div class="sl-luna-caption-source" id="${pfx}_captionSource">Translate to see captions</div>
            </div>

            <!-- Playback controls -->
            <div class="sl-luna-playback">
              <button id="${pfx}_playPause" class="sl-luna-pb-btn" disabled>▶</button>
              <button id="${pfx}_stopBtn" class="sl-luna-pb-btn" disabled>⏹</button>
              <button id="${pfx}_replayBtn" class="sl-luna-pb-btn" disabled>⏮</button>
              <div class="sl-luna-pb-time">
                <span id="${pfx}_timeCurrent">0:00</span> / <span id="${pfx}_timeTotal">0:00</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    this._rendered = true;

    // Attach the permanent WebGL CWASA container to our stage
    const avMount = document.getElementById(pfx + '_avatarMount');
    let cwaContainer = document.getElementById('cwa-av' + this.avatarSlot + '-container');
    let cwaGui = document.getElementById('cwa-av' + this.avatarSlot + '-gui');
    
    // Fallback if not found in pool (e.g. standalone usage)
    if (!cwaContainer) {
      cwaContainer = document.createElement('div');
      cwaContainer.id = 'cwa-av' + this.avatarSlot + '-container';
      cwaContainer.className = 'CWASAAvatar av' + this.avatarSlot;
      cwaContainer.style.width = '100%';
      cwaContainer.style.height = '100%';
      
      cwaGui = document.createElement('div');
      cwaGui.id = 'cwa-av' + this.avatarSlot + '-gui';
      cwaGui.className = 'CWASAGUI av' + this.avatarSlot;
      cwaGui.style.display = 'none';
      cwaGui.setAttribute('aria-hidden', 'true');
    }
    
    if (avMount) {
      avMount.appendChild(cwaContainer);
      avMount.appendChild(cwaGui);
    }

    this._wireEvents();
    this._populateSourceLangs();
    this._populateTargetLangs();
  };

  // ─── Populate dropdowns ──────────────────────────────────────────
  LunaTranslator.prototype._populateSourceLangs = function () {
    const sel = this._el('srcLang');
    if (!sel) return;
    sel.innerHTML = '';
    for (const l of LMS_SOURCE_LANGS) {
      const o = document.createElement('option');
      o.value = l.code;
      o.textContent = l.label;
      sel.appendChild(o);
    }
    // Auto-detect browser language
    const raw = (navigator.language || 'en').toLowerCase().split('-')[0];
    const codes = LMS_SOURCE_LANGS.map(l => l.code);
    sel.value = codes.includes(raw) ? raw : 'en';
  };

  LunaTranslator.prototype._populateTargetLangs = function () {
    const sel = this._el('tgtLang');
    if (!sel) return;
    sel.innerHTML = '';
    for (const code of LMS_TARGET_ORDER) {
      const display = SIGN_LANG_DISPLAY[code] || code.toUpperCase();
      const o = document.createElement('option');
      o.value = code;
      o.textContent = display;
      sel.appendChild(o);
    }
    // Default based on browser locale
    const raw = (navigator.language || 'en').toLowerCase().split('-')[0];
    const map = { gu: 'gisl', hi: 'gisl', en: 'gisl' };
    sel.value = map[raw] || 'gisl';
  };

  // ─── Wire DOM events ─────────────────────────────────────────────
  LunaTranslator.prototype._wireEvents = function () {
    const self = this;

    const translateBtn = this._el('translateBtn');
    if (translateBtn) {
      translateBtn.addEventListener('click', function () {
        if (translateBtn.disabled) return;
        self._runTranslate();
      });
    }

    const stopBtn = this._el('stopBtn');
    if (stopBtn) {
      stopBtn.addEventListener('click', function () {
        self.stop();
        self._setStatus('Stopped', '');
      });
    }

    const playPause = this._el('playPause');
    if (playPause) {
      playPause.addEventListener('click', function () {
        if (!self._tokens.length) return;
        if (self._playing) self._pause();
        else self._play();
      });
    }

    const replayBtn = this._el('replayBtn');
    if (replayBtn) {
      replayBtn.addEventListener('click', function () {
        if (!self._tokens.length) return;
        self._play(0);
      });
    }

    const tgtLang = this._el('tgtLang');
    if (tgtLang) {
      tgtLang.addEventListener('change', function () {
        self._loadSignLanguage(tgtLang.value);
      });
    }

    const retryBtn = this._el('errorRetry');
    if (retryBtn) {
      retryBtn.addEventListener('click', function () {
        self._hideError();
        self._runTranslate();
      });
    }

    // Enter key on textarea triggers translate
    const textInput = this._el('textInput');
    if (textInput) {
      textInput.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          self._runTranslate();
        }
      });
    }
  };

  // ─── Helper: get DOM element by suffixed ID ──────────────────────
  LunaTranslator.prototype._el = function (suffix) {
    return document.getElementById(this.containerId + '_' + suffix);
  };

  // ─── Status management ───────────────────────────────────────────
  LunaTranslator.prototype._setStatus = function (text, cls) {
    const el = this._el('status');
    if (el) {
      el.textContent = text;
      el.className = 'sl-luna-status-badge' + (cls ? ' ' + cls : '');
    }
    this.onStatus(text);
  };

  // ─── Error management ────────────────────────────────────────────
  LunaTranslator.prototype._showError = function (msg) {
    const panel = this._el('error');
    const msgEl = this._el('errorMsg');
    if (panel) panel.hidden = false;
    if (msgEl) msgEl.textContent = msg;
  };

  LunaTranslator.prototype._hideError = function () {
    const panel = this._el('error');
    if (panel) panel.hidden = true;
  };

  // ─── Init: load default sign language ────────────────────────────
  LunaTranslator.prototype.init = function () {
    if (!this._rendered) this.render();
    const tgtSel = this._el('tgtLang');
    const lang = tgtSel ? tgtSel.value : 'gisl';
    this._loadSignLanguage(lang);
  };

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // DATABASE LOADING
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  LunaTranslator.prototype._rebuildBaseIndex = function () {
    this.baseToGloss.clear();
    for (const g of this.glossToSign.keys()) {
      const b = glossBase(g);
      if (!this.baseToGloss.has(b)) this.baseToGloss.set(b, g);
    }
  };

  LunaTranslator.prototype._loadSigmlUrl = async function (url, myId) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 15000);
      const res = await fetch(url, { signal: controller.signal, cache: 'no-cache' });
      clearTimeout(timeout);
      if (!res.ok) return;
      const xmlText = await res.text();
      const doc = new DOMParser().parseFromString(xmlText, 'application/xml');
      const signs = Array.from(doc.querySelectorAll('hns_sign'));
      const serializer = new XMLSerializer();
      for (const s of signs) {
        if (this._switchId !== myId) return;
        const gloss = (s.getAttribute('gloss') || '').trim().toLowerCase();
        if (!gloss) continue;
        const xmlStr = s.outerHTML || serializer.serializeToString(s);
        this.glossToSign.set(gloss, xmlStr);
      }
      this._rebuildBaseIndex();
      if (this._switchId === myId) {
        this._setStatus('Loading database (' + this.glossToSign.size + ' signs)…', 'loading');
      }
    } catch (e) { /* optional DB, silently skip */ }
  };

  LunaTranslator.prototype._loadAlphabetUrl = async function (url, myId) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 15000);
      const res = await fetch(url, { signal: controller.signal, cache: 'no-cache' });
      clearTimeout(timeout);
      if (!res.ok) return;
      const xmlText = await res.text();
      const doc = new DOMParser().parseFromString(xmlText, 'application/xml');
      const signs = Array.from(doc.querySelectorAll('hns_sign'));
      const serializer = new XMLSerializer();
      for (const s of signs) {
        if (this._switchId !== myId) return;
        const gloss = (s.getAttribute('gloss') || '').trim().toUpperCase();
        if (!gloss) continue;
        const xmlStr = s.outerHTML || serializer.serializeToString(s);
        this.letterToSign.set(gloss, xmlStr);
      }
    } catch (e) { /* optional, skip */ }
  };

  LunaTranslator.prototype._loadConceptCsv = async function (url, myId) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 15000);
      const res = await fetch(url, { signal: controller.signal, cache: 'no-cache' });
      clearTimeout(timeout);
      if (!res.ok) return;
      const txt = await res.text();
      let cleaned = txt;
      if (txt.charCodeAt(0) === 0xFEFF) cleaned = txt.slice(1);
      const delim = cleaned.includes('\t') ? '\t' : ',';
      const lines = cleaned.split(/\r?\n/).filter(l => l.trim());
      if (!lines.length) return;
      const header = (lines.shift() || '').split(delim).map(s => s.trim().toLowerCase());
      const ci = header.indexOf('concept'), gi = header.indexOf('gloss');
      if (ci < 0 || gi < 0) return;
      for (const line of lines) {
        if (this._switchId !== myId) return;
        const cols = line.split(delim).map(s => s.trim());
        const concept = (cols[ci] || '').toLowerCase().trim();
        const gloss = (cols[gi] || '').toLowerCase().trim();
        if (concept && gloss) this.conceptToGloss.set(glossBase(concept), gloss);
      }
    } catch (e) { /* skip */ }
  };

  LunaTranslator.prototype._extractEmbeddedAlphabet = function () {
    for (const [gloss, sigml] of this.glossToSign.entries()) {
      const upper = gloss.toUpperCase();
      if (upper.length === 1 && upper >= 'A' && upper <= 'Z' && !this.letterToSign.has(upper)) {
        this.letterToSign.set(upper, sigml);
      }
    }
  };

  LunaTranslator.prototype._loadSignLanguage = async function (langCode) {
    const myId = ++this._switchId;
    this._currentSignLang = langCode;
    this.glossToSign.clear();
    this.letterToSign.clear();
    this.baseToGloss.clear();
    this.conceptToGloss.clear();

    const db = SIGN_LANG_DB[langCode];
    if (!db) {
      this._setStatus('No database for: ' + langCode, '');
      return;
    }

    this._setStatus('Loading ' + (SIGN_LANG_NAMES[langCode] || langCode) + ' database…', 'loading');

    for (const url of db.sigml) {
      if (this._switchId !== myId) return;
      await this._loadSigmlUrl(url, myId);
    }
    if (this._switchId !== myId) return;
    if (db.csv) await this._loadConceptCsv(db.csv, myId);
    if (this._switchId !== myId) return;
    if (db.alphabet) await this._loadAlphabetUrl(db.alphabet, myId);
    if (this._switchId !== myId) return;
    this._extractEmbeddedAlphabet();

    if (this._switchId !== myId) return;
    if (this.glossToSign.size === 0 && this.letterToSign.size === 0) {
      this._setStatus('No sign database — fingerspelling only', '');
    } else {
      this._setStatus('Ready — ' + this.glossToSign.size + ' signs loaded', 'ready');
    }
  };

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // TRANSLATION PIPELINE
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  LunaTranslator.prototype._getSourceLang = function () {
    const el = this._el('srcLang');
    return el ? el.value : 'en';
  };

  LunaTranslator.prototype._getSignLang = function () {
    const el = this._el('tgtLang');
    return el ? el.value : 'gisl';
  };

  LunaTranslator.prototype._getTargetLang = function () {
    return SIGN_LANG_GLOSS[this._getSignLang()] || 'en';
  };

  LunaTranslator.prototype._translateText = async function (text, srcLang, tgtLang) {
    if (!text.trim() || srcLang === tgtLang) return text;
    try {
      const resp = await fetch('/api/translate-text', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: text,
          source_text: text,
          source_lang: srcLang,
          target_lang: tgtLang,
          target_sign_lang: this._getSignLang()
        })
      });
      if (!resp.ok) return text;
      const data = await resp.json();
      if (data && data.error) return text;
      return (typeof data.translated === 'string' ? data.translated : text).trim() || text;
    } catch (e) { return text; }
  };

  LunaTranslator.prototype._planWithBackend = async function (rawText) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 10000);
      const resp = await fetch('/api/plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: rawText,
          language: this._getTargetLang(),
          sign_language: this._getSignLang(),
          reviewed_only: false,
        }),
        signal: controller.signal,
      });
      clearTimeout(timeout);
      if (!resp.ok) throw new Error('HTTP ' + resp.status);
      return await resp.json();
    } catch (e) { throw e; }
  };

  LunaTranslator.prototype._mapToAvailable = function (tokens, cutoff) {
    const allowedGlosses = Array.from(this.glossToSign.keys()).sort();
    const mapped = [], subs = {}, missing = [], fingerspelled = [];
    if (!allowedGlosses.length) return { mapped, subs, missing: [...tokens], fingerspelled };
    const bases = allowedGlosses.map(g => glossBase(g));
    const baseToGlossLocal = new Map();
    for (let i = 0; i < allowedGlosses.length; i++) {
      const g = allowedGlosses[i], b = bases[i];
      if (!baseToGlossLocal.has(b)) baseToGlossLocal.set(b, g);
    }
    for (const t of tokens) {
      if (allowedGlosses.includes(t)) { mapped.push(t); continue; }
      const tBase = glossBase(t);
      if (this.conceptToGloss.has(tBase)) {
        const g = this.conceptToGloss.get(tBase);
        if (this.glossToSign.has(g)) { mapped.push(g); if (t !== g) subs[t] = g; continue; }
      }
      if (this.baseToGloss.has(tBase)) {
        const g = this.baseToGloss.get(tBase);
        if (this.glossToSign.has(g)) { mapped.push(g); if (t !== g) subs[t] = g; continue; }
      }
      if (baseToGlossLocal.has(tBase)) {
        const g = baseToGlossLocal.get(tBase); mapped.push(g); if (t !== tBase) subs[t] = g; continue;
      }
      let bestBase = null, bestScore = 0;
      for (const b of baseToGlossLocal.keys()) {
        const s = similarity(tBase, b);
        if (s > bestScore) { bestScore = s; bestBase = b; }
      }
      if (bestBase && bestScore >= cutoff) {
        const g = baseToGlossLocal.get(bestBase); mapped.push(g); subs[t] = g;
      } else {
        if (this.letterToSign.size > 0 && /[A-Za-z]/.test(t)) { mapped.push(t); fingerspelled.push(t); }
        else missing.push(t);
      }
    }
    return { mapped, subs, missing, fingerspelled };
  };

  LunaTranslator.prototype._doPlan = async function (text, wasTranslated) {
    const fuzzyCutoff = wasTranslated ? 1.0 : 0.82;
    // Try server-side spaCy planning first
    try {
      const backend = await this._planWithBackend(text);
      if (backend.error) throw new Error(backend.error);
      const backendTokens = String(backend.final || '').replace(/[.\n]/g, ' ').split(/\s+/).filter(Boolean);
      const m = this._mapToAvailable(backendTokens, fuzzyCutoff);
      return m.mapped.length ? m.mapped : backendTokens;
    } catch (e) {
      // Fallback: local heuristic planning
      const norm = normalizeText(text);
      const heur = heuristicPlan(norm);
      const m = this._mapToAvailable(heur, fuzzyCutoff);
      return m.mapped.length ? m.mapped : heur;
    }
  };

  // ─── Fingerspelling ──────────────────────────────────────────────
  LunaTranslator.prototype._fingerspellWord = function (word) {
    const blocks = [];
    const str = (word || '');
    for (const char of str) {
      let lb = this.letterToSign.get(char.toUpperCase());
      if (!lb) lb = this.glossToSign.get(char.toLowerCase());
      if (lb) blocks.push(lb);
    }
    return blocks;
  };

  // ─── Build SiGML ─────────────────────────────────────────────────
  LunaTranslator.prototype._buildSigml = function (tokens) {
    const perTokenBlocks = [];
    const perToken = [];
    const signLang = this._getSignLang();
    const corpusLong = SIGN_LANG_CORPUS[signLang] || null;
    const corpusShort = (SIGN_LANG_DISPLAY[signLang] || signLang.toUpperCase()).split(' ')[0];
    let signed = 0, fingerspelled = 0, omitted = 0;

    for (let i = 0; i < tokens.length; i++) {
      const blocksForI = [];
      const t = tokens[i];
      const b = this.glossToSign.get(t);
      let accepted = false;

      if (typeof b === 'string') {
        blocksForI.push(b);
        accepted = true;
      }

      if (accepted) {
        perToken.push({ kind: 'sign', origin: corpusLong || 'corpus', originShort: corpusShort || 'sign' });
        signed++;
      } else {
        const base = glossBase(t);
        const lb = this._fingerspellWord(base || t);
        if (lb.length > 0) {
          blocksForI.push(...lb);
          perToken.push({ kind: 'fingerspelled', origin: corpusShort + ' fingerspelling alphabet', originShort: 'fingerspelled' });
          fingerspelled++;
        } else {
          perToken.push({ kind: 'omitted', origin: null, originShort: 'omitted', reason: 'no sign or fingerspelling available' });
          omitted++;
        }
      }
      perTokenBlocks.push(blocksForI);
    }

    this._perToken = perToken;
    this._perTokenBlocks = perTokenBlocks;

    const stats = { signed, fingerspelled, omitted, total: tokens.length };
    const allBlocks = perTokenBlocks.reduce((acc, arr) => acc.concat(arr), []);
    if (!allBlocks.length) return { sigml: null, stats };
    const composed = '<?xml version="1.0" encoding="utf-8"?>\n<sigml>\n' + allBlocks.join('\n') + '\n</sigml>';
    return { sigml: composed, stats };
  };

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // PLAYBACK (Per-token sequencer)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  LunaTranslator.prototype._clearTimers = function () {
    if (this._sequencerTimer) { clearTimeout(this._sequencerTimer); this._sequencerTimer = null; }
    if (this._scrubTimer) { clearInterval(this._scrubTimer); this._scrubTimer = null; }
  };

  LunaTranslator.prototype._estimateMs = function () {
    return this._perTokenBlocks.map((blocks, i) => {
      const info = this._perToken[i] || {};
      if (info.kind === 'omitted' || blocks.length === 0) return 0;
      if (info.kind === 'fingerspelled') return blocks.length * LETTER_BLOCK_MS;
      return SIGN_BLOCK_MS;
    });
  };

  LunaTranslator.prototype._computeCumulative = function (durations) {
    const cum = [];
    let sum = 0;
    for (let i = 0; i < durations.length; i++) { cum.push(sum); sum += durations[i]; }
    cum.push(sum);
    return cum;
  };

  LunaTranslator.prototype._fmtTime = function (ms) {
    const s = Math.max(0, Math.floor(ms / 1000));
    return Math.floor(s / 60) + ':' + (s % 60 < 10 ? '0' : '') + (s % 60);
  };

  LunaTranslator.prototype._loadSequencer = function (tokens) {
    this._clearTimers();
    this._tokens = tokens.slice();
    this._perTokenMs = this._estimateMs();
    this._cumulativeMs = this._computeCumulative(this._perTokenMs);
    this._totalMs = this._cumulativeMs[this._cumulativeMs.length - 1] || 0;
    this._index = 0;
    this._playing = false;
    this._enablePlayback(tokens.length > 0);
    this._updateTime(0);
    this._updateTotals();
    this._updatePlayPauseBtn();
  };

  LunaTranslator.prototype._enablePlayback = function (enabled) {
    ['playPause', 'stopBtn', 'replayBtn'].forEach(id => {
      const el = this._el(id);
      if (el) el.disabled = !enabled;
    });
  };

  LunaTranslator.prototype._updatePlayPauseBtn = function () {
    const el = this._el('playPause');
    if (!el) return;
    el.textContent = this._playing ? '⏸' : '▶';
  };

  LunaTranslator.prototype._updateTime = function (elapsedMs) {
    const cur = this._el('timeCurrent');
    if (cur) cur.textContent = this._fmtTime(elapsedMs / this._speed);
  };

  LunaTranslator.prototype._updateTotals = function () {
    const tot = this._el('timeTotal');
    if (tot) tot.textContent = this._fmtTime(this._totalMs / this._speed);
  };

  LunaTranslator.prototype._renderCaption = function () {
    const idx = Math.min(this._index, this._tokens.length - 1);
    const token = this._tokens[idx] || '';
    const info = this._perToken[idx] || {};
    const glossEl = this._el('captionGloss');
    const sourceEl = this._el('captionSource');
    if (glossEl) glossEl.textContent = token ? token.toUpperCase() : '';
    if (sourceEl) {
      if (info.kind === 'fingerspelled') sourceEl.textContent = 'fingerspelled — ' + (token || '');
      else if (info.kind === 'omitted') sourceEl.textContent = (info.reason || 'no sign available');
      else sourceEl.textContent = (info.origin || info.originShort || '—');
    }
  };

  LunaTranslator.prototype._highlightChips = function () {
    const chips = (this._el('tokenList') || {}).querySelectorAll ? this._el('tokenList').querySelectorAll('.sl-luna-chip') : [];
    chips.forEach((chip, i) => {
      chip.classList.remove('active', 'done');
      if (i < this._index) chip.classList.add('done');
      else if (i === this._index) chip.classList.add('active');
    });
  };

  LunaTranslator.prototype._playCurrent = function () {
    if (!this._playing) return;
    if (this._index >= this._tokens.length) {
      if (this._looping) {
        this._index = 0;
      } else {
        this._playing = false;
        this._updatePlayPauseBtn();
        this._updateTime(this._totalMs);
        if (typeof this._onEndedCb === 'function') this._onEndedCb();
        return;
      }
    }

    this._highlightChips();
    this._renderCaption();

    const blocks = this._perTokenBlocks[this._index] || [];
    if (blocks.length && window.CWASA) {
      const sigml = '<?xml version="1.0" encoding="utf-8"?>\n<sigml>\n' + blocks.join('\n') + '\n</sigml>';
      try { CWASA.stop(this.avatarSlot); } catch (e) {}
      try { CWASA.playSiGMLText(sigml, this.avatarSlot); } catch (e) {}
      const ph = this._el('placeholder');
      if (ph) ph.hidden = true;
    }

    const dur = this._perTokenMs[this._index] || 0;
    const scaled = Math.max(50, Math.round((dur + INTER_SIGN_MS) / this._speed));
    const self = this;
    const startTime = Date.now();

    if (this._scrubTimer) clearInterval(this._scrubTimer);
    this._scrubTimer = setInterval(function () {
      if (!self._playing) return;
      const tokenElapsed = Date.now() - startTime;
      const globalElapsed = (self._cumulativeMs[self._index] || 0) + Math.min(tokenElapsed * self._speed, dur + INTER_SIGN_MS);
      self._updateTime(globalElapsed);
    }, 100);

    this._sequencerTimer = setTimeout(function () {
      self._index++;
      self._playCurrent();
    }, scaled);
  };

  LunaTranslator.prototype._play = function (fromIdx) {
    if (!this._tokens.length) return;
    this._clearTimers();
    if (typeof fromIdx === 'number') this._index = Math.max(0, Math.min(fromIdx, this._tokens.length - 1));
    if (this._index >= this._tokens.length) this._index = 0;
    this._playing = true;
    this._updatePlayPauseBtn();
    this._playCurrent();
  };

  LunaTranslator.prototype._pause = function () {
    this._clearTimers();
    this._playing = false;
    try { if (window.CWASA) CWASA.stop(this.avatarSlot); } catch (e) {}
    this._updatePlayPauseBtn();
    this._updateTime(this._cumulativeMs[this._index] || 0);
  };

  LunaTranslator.prototype.stop = function () {
    this._clearTimers();
    this._playing = false;
    this._index = 0;
    try { if (window.CWASA) CWASA.stop(this.avatarSlot); } catch (e) {}
    this._updatePlayPauseBtn();
    this._updateTime(0);
    const ph = this._el('placeholder');
    if (ph) ph.hidden = false;
    const glossEl = this._el('captionGloss');
    const sourceEl = this._el('captionSource');
    if (glossEl) glossEl.textContent = '';
    if (sourceEl) sourceEl.textContent = 'Translate to see captions';
    const chips = (this._el('tokenList') || {}).querySelectorAll ? this._el('tokenList').querySelectorAll('.sl-luna-chip') : [];
    chips.forEach(c => c.classList.remove('active', 'done'));
  };

  // ─── Show token chips ────────────────────────────────────────────
  LunaTranslator.prototype._showTokenChips = function (tokens) {
    const list = this._el('tokenList');
    if (!list) return;
    list.innerHTML = '';
    tokens.forEach((t, i) => {
      const chip = document.createElement('span');
      chip.className = 'sl-luna-chip';
      const info = this._perToken[i] || {};
      if (info.kind === 'fingerspelled') chip.classList.add('fingerspelled');
      else if (info.kind === 'omitted') chip.classList.add('omitted');
      chip.textContent = t;
      chip.title = info.origin || info.originShort || t;
      list.appendChild(chip);
    });
  };

  LunaTranslator.prototype._showCoverage = function (stats) {
    const el = this._el('coverage');
    if (!el || !stats || !stats.total) { if (el) el.textContent = ''; return; }
    const parts = [stats.signed + ' of ' + stats.total + ' signed'];
    if (stats.fingerspelled) parts.push(stats.fingerspelled + ' fingerspelled');
    if (stats.omitted) parts.push(stats.omitted + ' omitted');
    el.textContent = parts.join(' · ');
  };

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // MAIN TRANSLATE FLOW
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  LunaTranslator.prototype._runTranslate = async function () {
    const translateBtn = this._el('translateBtn');
    if (translateBtn) translateBtn.disabled = true;
    this._hideError();
    this.stop();
    this._setStatus('Translating…', 'loading');

    try {
      const textEl = this._el('textInput');
      const originalText = textEl ? textEl.value.trim() : '';
      if (!originalText) {
        this._setStatus('Enter a phrase first.', '');
        return;
      }

      // Step 1: Translate if needed
      const src = this._getSourceLang();
      const tgt = this._getTargetLang();
      let translated = originalText;
      let wasTranslated = false;
      if (src !== tgt) {
        this._setStatus('Translating ' + src.toUpperCase() + ' → ' + tgt.toUpperCase() + '…', 'loading');
        translated = await this._translateText(originalText, src, tgt);
        wasTranslated = translated !== originalText;
        if (!wasTranslated && src !== tgt) {
          this._showError('Translation from ' + (BASE_LANG_NAMES[src] || src) + ' to ' + (BASE_LANG_NAMES[tgt] || tgt) + ' failed. Using original text.');
        }
      }

      // Step 2: Plan tokens
      this._setStatus('Planning signs…', 'loading');
      const tokens = await this._doPlan(translated, wasTranslated);
      if (!tokens.length) {
        this._setStatus('No matching signs found.', '');
        return;
      }

      // Step 3: Build SiGML
      const { sigml, stats } = this._buildSigml(tokens);
      this._showTokenChips(tokens);
      this._showCoverage(stats);
      this.onTokens(tokens);

      if (!window.CWASA) {
        this._setStatus('Avatar unavailable — showing text output', '');
        return;
      }
      if (!sigml) {
        this._setStatus('No matching signs found.', '');
        return;
      }

      // Step 4: Play via sequencer
      this._setStatus('Playing…', 'loading');
      this._loadSequencer(tokens);
      const self = this;
      this._onEndedCb = function () {
        self._setStatus('Ready — ' + self.glossToSign.size + ' signs loaded', 'ready');
      };
      this._play(0);
    } catch (e) {
      console.error('[LunaTranslator]', e);
      this._setStatus('Translation failed.', '');
      this._showError('Something went wrong. Please try again.');
    } finally {
      if (translateBtn) translateBtn.disabled = false;
    }
  };

  // ─── Public translate method (for programmatic use) ──────────────
  LunaTranslator.prototype.translate = function (text, srcLang) {
    const textEl = this._el('textInput');
    if (textEl) textEl.value = text;
    const srcSel = this._el('srcLang');
    if (srcSel && srcLang) srcSel.value = srcLang;
    this._runTranslate();
  };

  // Expose globally
  root.LunaTranslator = LunaTranslator;

})(window);
