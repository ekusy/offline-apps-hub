/**
 * Water Sort Puzzle
 *
 * - Standard pour: top contiguous run of source color → destination tube
 *   (destination must be empty OR top color matches; takes min(run, space)).
 * - Pipette tool (3 uses / game): extract any NON-TOP block from a tube and
 *   place it on another tube whose top color matches (or which is empty).
 *   If no valid destination exists, the use is NOT consumed.
 *
 * NOTE: when adding files to the offline cache list in handleDownload(),
 * always include /i18n.js — without it the language toggle breaks offline.
 */

const WS_I18N = {
  ja: {
    common: { backHome: '← トップへ' },
    ws: {
      title: '🧪 水の並べ替えパズル',
      subtitle: '試験管をタップして色水を仕分けよう',
      difficulty: '難易度:',
      easy: 'やさしい', normal: 'ふつう', hard: 'むずかしい',
      new: '🔀 新しいゲーム',
      undo: '↶ 元に戻す',
      spoit: '💧 スポイト',
      share: '🔗 共有',
      moves: '手数:', time: '時間:', best: 'ベスト:',
      seedLabel: 'シード:',
      customSeedPh: 'シード値を入力…',
      loadSeed: '読み込み',
      download: '📥 オフライン用にダウンロード',
      downloaded: '✅ オフラインで利用可能',
      downloadHint: 'このゲームを保存してオフラインで遊べます',
      downloading: 'ダウンロード中…',
      winTitle: '🎉 クリア！',
      winBody: '{moves}手 / {time} でクリアしました\nシード: {seed}',
      winShare: '🔗 シードを共有',
      winNew: '🔀 次のゲーム',
      toast: {
        noDest: '移動先がありません',
        invalidDest: 'そこには移動できません',
        copied: 'シードURLをコピーしました',
        useTap: '最上段以外のブロックを選んでください',
        spoitOn: 'スポイト: 非最上段のブロックをタップ',
        spoitOff: 'スポイトを解除しました',
        noSpoit: 'スポイトの残り回数がありません',
        nothingToUndo: '元に戻す操作がありません',
        badSeed: '無効なシード値です'
      },
      unsupported: 'このブラウザはオフラインモードに対応していません',
      failed: 'ダウンロードに失敗しました',
      iosTitle: 'ホーム画面に追加',
      iosLead: 'iOSでオフラインで遊ぶには:',
      iosSteps:
        '<li>下にある<strong>共有</strong>ボタンをタップ</li>' +
        '<li>下にスクロールして<strong>ホーム画面に追加</strong>をタップ</li>' +
        '<li>名前を付けて<strong>追加</strong>をタップ</li>',
      iosGotIt: 'OK'
    }
  },
  en: {
    common: { backHome: '← Home' },
    ws: {
      title: '🧪 Water Sort Puzzle',
      subtitle: 'Tap a tube, then tap another to pour',
      difficulty: 'Difficulty:',
      easy: 'Easy', normal: 'Normal', hard: 'Hard',
      new: '🔀 New Game',
      undo: '↶ Undo',
      spoit: '💧 Pipette',
      share: '🔗 Share',
      moves: 'Moves:', time: 'Time:', best: 'Best:',
      seedLabel: 'Seed:',
      customSeedPh: 'Enter a seed…',
      loadSeed: 'Load',
      download: '📥 Download for Offline',
      downloaded: '✅ Downloaded for Offline',
      downloadHint: 'Save this game to play offline',
      downloading: 'Downloading…',
      winTitle: '🎉 Cleared!',
      winBody: 'Solved in {moves} moves / {time}\nSeed: {seed}',
      winShare: '🔗 Share Seed',
      winNew: '🔀 New Game',
      toast: {
        noDest: 'No valid destination',
        invalidDest: 'Cannot place here',
        copied: 'Seed URL copied',
        useTap: 'Tap a non-top block',
        spoitOn: 'Pipette: tap a non-top block',
        spoitOff: 'Pipette cancelled',
        noSpoit: 'No pipette uses left',
        nothingToUndo: 'Nothing to undo',
        badSeed: 'Invalid seed'
      },
      unsupported: 'Your browser does not support offline mode',
      failed: 'Failed to download',
      iosTitle: 'Add to Home Screen',
      iosLead: 'To play offline on iOS:',
      iosSteps:
        '<li>Tap the <strong>Share</strong> button at the bottom</li>' +
        '<li>Scroll down and tap <strong>Add to Home Screen</strong></li>' +
        '<li>Name it and tap <strong>Add</strong></li>',
      iosGotIt: 'Got it'
    }
  }
};

const DIFFICULTY = {
  easy:   { colors: 4, fullTubes: 4, emptyTubes: 2, capacity: 4 },
  normal: { colors: 6, fullTubes: 6, emptyTubes: 2, capacity: 4 },
  hard:   { colors: 8, fullTubes: 8, emptyTubes: 2, capacity: 4 }
};

const PALETTE = [
  '#E53935', // red
  '#1E88E5', // blue
  '#43A047', // green
  '#FDD835', // yellow
  '#8E24AA', // purple
  '#FB8C00', // orange
  '#00ACC1', // cyan
  '#6D4C41'  // brown
];

const SPOIT_USES = 3;
const MAX_HISTORY = 50;

function mulberry32(seed) {
  let s = seed >>> 0;
  return function () {
    s = (s + 0x6D2B79F5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function randomUint32() {
  return (Math.random() * 0x100000000) >>> 0;
}

function deepCloneTubes(tubes) {
  return tubes.map(t => t.slice());
}

class WaterSort {
  constructor() {
    this.appName = 'water-sort';
    this.tubes = [];
    this.capacity = 4;
    this.colorCount = 0;
    this.tubeCount = 0;
    this.difficulty = 'normal';
    this.seed = 0;

    this.moves = 0;
    this.startTime = null;
    this.timerId = null;
    this.isWon = false;

    this.spoitRemaining = SPOIT_USES;
    this.mode = 'normal';            // 'normal' | 'spoit-pick' | 'spoit-place'
    this.selectedTube = null;        // for normal pour
    this.spoitPick = null;           // {tube, index, color}
    this.history = [];
    this.lastSpoitMerge = null;      // {tube, indexA, indexB} consumed by render once

    // i18n must be set up before any text reads
    I18n.register(WS_I18N);
    I18n.apply();
    I18n.mountToggle(document.getElementById('lang-toggle'));
    window.addEventListener('i18nchange', () => {
      I18n.apply();
      this.renderStatic();
    });

    // DOM
    this.tubesEl = document.getElementById('ws-tubes');
    this.movesEl = document.getElementById('ws-moves');
    this.timeEl = document.getElementById('ws-time');
    this.bestEl = document.getElementById('ws-best');
    this.seedEl = document.getElementById('ws-seed');
    this.spoitBtn = document.getElementById('ws-spoit');
    this.spoitBadge = document.getElementById('ws-spoit-badge');
    this.diffSelect = document.getElementById('ws-difficulty');
    this.toastEl = document.getElementById('ws-toast');
    this.winEl = document.getElementById('ws-win');
    this.winBodyEl = document.getElementById('ws-win-body');
    this.customSeedEl = document.getElementById('ws-custom-seed');

    this.downloadBtn = document.getElementById('download-btn');
    this.downloadDialog = document.getElementById('download-dialog');
    this.iosDialog = document.getElementById('ios-dialog');

    this.init();
  }

  init() {
    this.setupEventListeners();
    this.loadFromURL();
    this.checkOfflineInstallation();

    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('../../sw.js').catch(err => {
        console.warn('Service Worker registration failed:', err);
      });
    }
  }

  setupEventListeners() {
    document.getElementById('ws-new').addEventListener('click', () => this.newGame());
    document.getElementById('ws-undo').addEventListener('click', () => this.undo());
    document.getElementById('ws-share').addEventListener('click', () => this.share());
    document.getElementById('ws-load-seed').addEventListener('click', () => this.loadCustomSeed());
    document.getElementById('ws-win-new').addEventListener('click', () => {
      this.winEl.classList.add('hidden');
      this.newGame();
    });
    document.getElementById('ws-win-share').addEventListener('click', () => this.share());
    document.getElementById('ios-close-btn').addEventListener('click', () => {
      this.iosDialog.classList.add('hidden');
    });

    this.diffSelect.addEventListener('change', () => {
      this.setDifficulty(this.diffSelect.value);
    });

    this.spoitBtn.addEventListener('click', () => this.toggleSpoitMode());

    this.downloadBtn.addEventListener('click', () => this.handleDownload());
  }

  /* ===== Level loading ===== */

  loadFromURL() {
    const params = new URLSearchParams(window.location.search);
    const paramDiff = params.get('difficulty');
    const paramSeed = params.get('seed');

    let diff = (paramDiff && DIFFICULTY[paramDiff]) ? paramDiff
             : (localStorage.getItem('water-sort-difficulty') || 'normal');
    if (!DIFFICULTY[diff]) diff = 'normal';

    let seed;
    if (paramSeed !== null && /^\d+$/.test(paramSeed)) {
      seed = parseInt(paramSeed, 10) >>> 0;
    } else {
      seed = randomUint32();
    }

    this.difficulty = diff;
    this.diffSelect.value = diff;
    this.generate(diff, seed);
    this.updateURL();
    this.loadBest();
    this.startTimer();
  }

  setDifficulty(diff) {
    if (!DIFFICULTY[diff]) return;
    this.difficulty = diff;
    localStorage.setItem('water-sort-difficulty', diff);
    this.newGame();
  }

  newGame() {
    const seed = randomUint32();
    this.generate(this.difficulty, seed);
    this.updateURL();
    this.loadBest();
    this.startTimer();
  }

  loadCustomSeed() {
    const raw = (this.customSeedEl.value || '').trim();
    if (!/^\d+$/.test(raw)) {
      this.showToast('ws.toast.badSeed');
      return;
    }
    const seed = parseInt(raw, 10) >>> 0;
    this.generate(this.difficulty, seed);
    this.updateURL();
    this.loadBest();
    this.startTimer();
    this.customSeedEl.value = '';
  }

  generate(diff, seed) {
    const cfg = DIFFICULTY[diff];
    this.capacity = cfg.capacity;
    this.colorCount = cfg.colors;
    this.tubeCount = cfg.fullTubes + cfg.emptyTubes;
    this.seed = seed >>> 0;

    // Build flat multiset: each color × capacity copies.
    // NOTE: Pure shuffle is not provably solvable. The 3 pipette uses act as
    // a safety valve for tricky seeds; sharing seeds also lets players pick
    // known-good ones.
    const rng = mulberry32(this.seed);
    const flat = [];
    for (let c = 0; c < cfg.colors; c++) {
      for (let k = 0; k < cfg.capacity; k++) flat.push(c);
    }
    for (let i = flat.length - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1));
      const tmp = flat[i]; flat[i] = flat[j]; flat[j] = tmp;
    }
    const tubes = [];
    for (let t = 0; t < cfg.fullTubes; t++) {
      tubes.push(flat.slice(t * cfg.capacity, (t + 1) * cfg.capacity));
    }
    for (let e = 0; e < cfg.emptyTubes; e++) {
      tubes.push([]);
    }
    this.tubes = tubes;

    this.moves = 0;
    this.isWon = false;
    this.spoitRemaining = SPOIT_USES;
    this.mode = 'normal';
    this.selectedTube = null;
    this.spoitPick = null;
    this.history = [];
    this.lastSpoitMerge = null;

    this.movesEl.textContent = '0';
    this.seedEl.textContent = String(this.seed);
    this.refreshSpoitButton();
    this.render();
  }

  updateURL() {
    const url = `${window.location.pathname}?difficulty=${this.difficulty}&seed=${this.seed}`;
    window.history.replaceState(null, '', url);
  }

  /* ===== Rendering ===== */

  renderStatic() {
    this.refreshSpoitButton();
  }

  render() {
    this.tubesEl.innerHTML = '';
    const merge = this.lastSpoitMerge;
    this.lastSpoitMerge = null;

    this.tubes.forEach((tube, ti) => {
      const tubeEl = document.createElement('div');
      tubeEl.className = 'ws-tube';
      tubeEl.dataset.tube = String(ti);
      if (this.mode === 'spoit-pick' || this.mode === 'spoit-place') {
        tubeEl.classList.add('spoit-mode');
      }
      if (this.selectedTube === ti && this.mode === 'normal') {
        tubeEl.classList.add('ws-tube-selected');
      }
      if (this.spoitPick && this.spoitPick.tube === ti) {
        tubeEl.classList.add('ws-tube-spoit-source');
      }
      if (this.mode === 'spoit-place' && this.isValidSpoitDest(ti)) {
        tubeEl.classList.add('ws-tube-valid');
      }

      // Render `capacity` slots, bottom→top (index 0 = bottom).
      // CSS uses column-reverse so first appended is at the visual bottom.
      for (let s = 0; s < this.capacity; s++) {
        const block = document.createElement('div');
        block.className = 'ws-block';
        if (s < tube.length) {
          block.style.backgroundColor = PALETTE[tube[s]];
          block.dataset.index = String(s);
          block.addEventListener('click', (ev) => this.onBlockClick(ti, s, ev));
          if (merge && merge.tube === ti && (s === merge.indexA || s === merge.indexB)) {
            block.classList.add('ws-merge-flash');
          }
        } else {
          block.classList.add('empty');
        }
        tubeEl.appendChild(block);
      }

      tubeEl.addEventListener('click', () => this.onTubeClick(ti));
      this.tubesEl.appendChild(tubeEl);
    });
  }

  /* ===== Input handling ===== */

  onTubeClick(t) {
    if (this.isWon) return;

    if (this.mode === 'spoit-place') {
      this.placeSpoit(t);
      return;
    }
    if (this.mode === 'spoit-pick') {
      // tube background tap in spoit-pick → ignored (must tap a block)
      return;
    }

    // Normal pour
    if (this.selectedTube === null) {
      if (this.tubes[t].length === 0) return;
      this.selectedTube = t;
      this.render();
      return;
    }
    if (this.selectedTube === t) {
      this.selectedTube = null;
      this.render();
      return;
    }
    const src = this.selectedTube;
    this.selectedTube = null;
    this.pour(src, t);
  }

  onBlockClick(t, i, ev) {
    if (this.mode !== 'spoit-pick') return; // let it bubble to tube click

    ev.stopPropagation();

    if (this.isWon) return;
    const tube = this.tubes[t];
    if (i === tube.length - 1) {
      // Top block — excluded per spec; standard pour covers this case.
      this.showToast('ws.toast.useTap');
      return;
    }
    this.beginSpoit(t, i);
  }

  /* ===== Normal pour ===== */

  pour(srcIdx, dstIdx) {
    const src = this.tubes[srcIdx];
    const dst = this.tubes[dstIdx];
    if (src.length === 0) return;
    if (dst.length >= this.capacity) return;

    const topColor = src[src.length - 1];
    if (dst.length > 0 && dst[dst.length - 1] !== topColor) return;

    // count contiguous top run of topColor in src
    let run = 0;
    for (let i = src.length - 1; i >= 0; i--) {
      if (src[i] === topColor) run++; else break;
    }
    const space = this.capacity - dst.length;
    const moveN = Math.min(run, space);
    if (moveN === 0) return;

    this.pushHistory();
    for (let k = 0; k < moveN; k++) {
      dst.push(src.pop());
    }
    this.moves++;
    this.movesEl.textContent = String(this.moves);
    this.render();
    this.checkWin();
  }

  /* ===== Spoit (pipette) ===== */

  toggleSpoitMode() {
    if (this.isWon) return;
    if (this.mode === 'spoit-pick' || this.mode === 'spoit-place') {
      this.mode = 'normal';
      this.spoitPick = null;
      this.refreshSpoitButton();
      this.render();
      this.showToast('ws.toast.spoitOff');
      return;
    }
    if (this.spoitRemaining <= 0) {
      this.showToast('ws.toast.noSpoit');
      return;
    }
    this.mode = 'spoit-pick';
    this.selectedTube = null;
    this.refreshSpoitButton();
    this.render();
    this.showToast('ws.toast.spoitOn');
  }

  refreshSpoitButton() {
    this.spoitBadge.textContent = String(this.spoitRemaining);
    this.spoitBtn.classList.toggle('spoit-active',
      this.mode === 'spoit-pick' || this.mode === 'spoit-place');
    this.spoitBtn.disabled = (this.spoitRemaining <= 0 && this.mode === 'normal');
  }

  isValidSpoitDest(d) {
    if (!this.spoitPick) return false;
    if (d === this.spoitPick.tube) return false;
    const dst = this.tubes[d];
    if (dst.length >= this.capacity) return false;
    if (dst.length === 0) return true;
    return dst[dst.length - 1] === this.spoitPick.color;
  }

  beginSpoit(t, i) {
    const color = this.tubes[t][i];
    // Find at least one valid destination among other tubes.
    let hasDest = false;
    for (let d = 0; d < this.tubes.length; d++) {
      if (d === t) continue;
      const dst = this.tubes[d];
      if (dst.length >= this.capacity) continue;
      if (dst.length === 0 || dst[dst.length - 1] === color) { hasDest = true; break; }
    }
    if (!hasDest) {
      // No valid destination — DO NOT consume a use.
      this.showToast('ws.toast.noDest');
      this.mode = 'spoit-pick'; // stay in pick mode so user can try another block
      return;
    }
    this.spoitPick = { tube: t, index: i, color: color };
    this.mode = 'spoit-place';
    this.render();
  }

  placeSpoit(d) {
    if (!this.spoitPick) return;
    if (d === this.spoitPick.tube) {
      // Cancel pick
      this.spoitPick = null;
      this.mode = 'spoit-pick';
      this.render();
      return;
    }
    if (!this.isValidSpoitDest(d)) {
      this.showToast('ws.toast.invalidDest');
      return;
    }

    this.pushHistory();

    const src = this.tubes[this.spoitPick.tube];
    const i = this.spoitPick.index;
    const color = this.spoitPick.color;

    // Remove the targeted block; indices above shift down automatically.
    src.splice(i, 1);
    this.tubes[d].push(color);

    // After splice, check whether the cell now at index i (formerly i+1)
    // matches the cell at index i-1 — that's the "merge" moment.
    let mergeInfo = null;
    if (i > 0 && i < src.length && src[i - 1] === src[i]) {
      mergeInfo = { tube: this.spoitPick.tube, indexA: i - 1, indexB: i };
    }
    this.lastSpoitMerge = mergeInfo;

    this.spoitRemaining--;
    this.moves++;
    this.movesEl.textContent = String(this.moves);
    this.spoitPick = null;
    this.mode = 'normal';
    this.refreshSpoitButton();
    this.render();
    this.checkWin();
  }

  /* ===== History / Undo ===== */

  pushHistory() {
    this.history.push({
      tubes: deepCloneTubes(this.tubes),
      moves: this.moves,
      spoitRemaining: this.spoitRemaining
    });
    if (this.history.length > MAX_HISTORY) this.history.shift();
  }

  undo() {
    if (this.history.length === 0) {
      this.showToast('ws.toast.nothingToUndo');
      return;
    }
    if (this.isWon) return;
    const snap = this.history.pop();
    this.tubes = snap.tubes;
    this.moves = snap.moves;
    this.spoitRemaining = snap.spoitRemaining;
    this.movesEl.textContent = String(this.moves);
    this.selectedTube = null;
    this.spoitPick = null;
    this.mode = 'normal';
    this.lastSpoitMerge = null;
    this.refreshSpoitButton();
    this.render();
  }

  /* ===== Win ===== */

  checkWin() {
    for (const tube of this.tubes) {
      if (tube.length === 0) continue;
      if (tube.length !== this.capacity) return;
      const c = tube[0];
      for (let i = 1; i < tube.length; i++) {
        if (tube[i] !== c) return;
      }
    }
    this.win();
  }

  win() {
    this.isWon = true;
    if (this.timerId) clearInterval(this.timerId);

    const bestKey = `water-sort-best-${this.difficulty}`;
    const prev = parseInt(localStorage.getItem(bestKey), 10);
    if (!Number.isFinite(prev) || this.moves < prev) {
      localStorage.setItem(bestKey, String(this.moves));
      this.loadBest();
    }

    const body = I18n.t('ws.winBody')
      .replace('{moves}', this.moves)
      .replace('{time}', this.timeEl.textContent)
      .replace('{seed}', String(this.seed));
    this.winBodyEl.textContent = body;
    this.winEl.classList.remove('hidden');
  }

  /* ===== Sharing ===== */

  buildShareURL() {
    return `${window.location.origin}${window.location.pathname}?difficulty=${this.difficulty}&seed=${this.seed}`;
  }

  async share() {
    const url = this.buildShareURL();
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(url);
      } else {
        const ta = document.createElement('textarea');
        ta.value = url;
        ta.style.position = 'fixed';
        ta.style.opacity = '0';
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
      }
      this.showToast('ws.toast.copied');
    } catch (e) {
      // Fallback: prompt the user to copy manually
      window.prompt(this.buildShareURL(), url);
    }
  }

  /* ===== Stats ===== */

  loadBest() {
    const best = localStorage.getItem(`water-sort-best-${this.difficulty}`);
    this.bestEl.textContent = best ? best : '-';
  }

  startTimer() {
    if (this.timerId) clearInterval(this.timerId);
    this.startTime = Date.now();
    this.timeEl.textContent = '00:00';
    this.timerId = setInterval(() => {
      const elapsed = Math.floor((Date.now() - this.startTime) / 1000);
      const m = Math.floor(elapsed / 60);
      const s = elapsed % 60;
      this.timeEl.textContent =
        `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    }, 250);
  }

  /* ===== Toast ===== */

  showToast(key, ms) {
    const dur = ms || 1800;
    this.toastEl.textContent = I18n.t(key);
    this.toastEl.classList.add('toast-visible');
    if (this._toastTimer) clearTimeout(this._toastTimer);
    this._toastTimer = setTimeout(() => {
      this.toastEl.classList.remove('toast-visible');
    }, dur);
  }

  /* ===== Offline download (same shape as 15-puzzle) ===== */

  markDownloaded() {
    this.downloadBtn.setAttribute('data-i18n', 'ws.downloaded');
    this.downloadBtn.textContent = I18n.t('ws.downloaded');
    this.downloadBtn.disabled = true;
  }

  isStandaloneMode() {
    return window.navigator.standalone === true ||
           window.matchMedia('(display-mode: standalone)').matches;
  }

  async handleDownload() {
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    if (isIOS && !this.isStandaloneMode()) {
      this.iosDialog.classList.remove('hidden');
      return;
    }
    if (!('caches' in window)) {
      alert(I18n.t('ws.unsupported'));
      return;
    }

    try {
      this.downloadBtn.disabled = true;
      this.downloadDialog.classList.remove('hidden');

      const baseUrl = window.location.origin;
      const appPath = window.location.pathname.substring(0, window.location.pathname.lastIndexOf('/'));

      // Include /i18n.js so the language toggle keeps working offline.
      const files = [
        `${baseUrl}${appPath}/index.html`,
        `${baseUrl}${appPath}/style.css`,
        `${baseUrl}${appPath}/app.js`,
        `${baseUrl}/style.css`,
        `${baseUrl}/i18n.js`
      ];

      const cacheName = `app-${this.appName}-v1`;
      const cache = await caches.open(cacheName);

      let successCount = 0;
      for (const file of files) {
        try {
          const response = await fetch(file);
          if (response.ok) {
            await cache.put(file, response);
            successCount++;
          }
        } catch (err) {
          console.warn(`Failed to cache ${file}:`, err);
        }
      }

      this.downloadDialog.classList.add('hidden');

      if (successCount > 0) {
        this.markDownloaded();
      } else {
        throw new Error('Failed to cache any files');
      }
    } catch (error) {
      console.error('Download failed:', error);
      alert(I18n.t('ws.failed') + ': ' + error.message);
      this.downloadBtn.disabled = false;
      this.downloadDialog.classList.add('hidden');
    }
  }

  checkOfflineInstallation() {
    if (!this.isStandaloneMode()) return;
    if (!('caches' in window)) return;
    caches.keys().then(names => {
      if (names.includes(`app-${this.appName}-v1`)) {
        this.markDownloaded();
      }
    }).catch(() => {});
  }
}

document.addEventListener('DOMContentLoaded', () => {
  new WaterSort();
});
