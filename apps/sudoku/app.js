/**
 * Sudoku
 * - Pure JS 9x9 sudoku with backtracking generation and seeded RNG.
 * - Difficulty controls how many givens remain (we do not enforce unique solutions
 *   for cost reasons; the generated puzzle is at least solvable since it's
 *   built from a real solution).
 *
 * NOTE: handleDownload() must include ../../i18n.js and ../../style.css.
 */
const SD_I18N = {
  ja: {
    common: { backHome: '← トップへ' },
    sudoku: {
      title: '🔢 数独',
      subtitle: '1〜9 を行・列・3×3 ブロックに 1 個ずつ',
      difficulty: '難易度:',
      easy: 'やさしい', normal: 'ふつう', hard: 'むずかしい',
      new: '🔀 新しいゲーム',
      undo: '↶ 元に戻す',
      note: '📝 メモ',
      errors: 'ミス表示',
      erase: '✕',
      moves: '入力:', time: '時間:', best: 'ベスト:',
      download: '📥 オフライン用にダウンロード',
      downloaded: '✅ オフラインで利用可能',
      downloadHint: 'このゲームを保存してオフラインで遊べます',
      downloading: 'ダウンロード中…',
      winTitle: '🎉 クリア！',
      winBody: '{time} でクリアしました（{moves} 入力）',
      winNew: '次のゲーム',
      iosTitle: 'ホーム画面に追加',
      iosLead: 'iOSでオフラインで遊ぶには:',
      iosSteps:
        '<li>下にある<strong>共有</strong>ボタンをタップ</li>' +
        '<li>下にスクロールして<strong>ホーム画面に追加</strong>をタップ</li>' +
        '<li>名前を付けて<strong>追加</strong>をタップ</li>',
      iosGotIt: 'OK',
      unsupported: 'このブラウザはオフラインモードに対応していません',
      failed: 'ダウンロードに失敗しました',
      saveOk: '保存しました！ {n}/{total} ファイルをキャッシュしました。',
      toast: { nothingToUndo: '元に戻す操作がありません', noteOn: 'メモモード', noteOff: 'メモ解除' }
    }
  },
  en: {
    common: { backHome: '← Home' },
    sudoku: {
      title: '🔢 Sudoku',
      subtitle: 'Fill rows, columns and 3x3 boxes with 1-9',
      difficulty: 'Difficulty:',
      easy: 'Easy', normal: 'Normal', hard: 'Hard',
      new: '🔀 New Game',
      undo: '↶ Undo',
      note: '📝 Notes',
      errors: 'Show Errors',
      erase: '✕',
      moves: 'Moves:', time: 'Time:', best: 'Best:',
      download: '📥 Download for Offline',
      downloaded: '✅ Downloaded for Offline',
      downloadHint: 'Save this game to play offline',
      downloading: 'Downloading…',
      winTitle: '🎉 Cleared!',
      winBody: 'Solved in {time} ({moves} entries)',
      winNew: 'New Game',
      iosTitle: 'Add to Home Screen',
      iosLead: 'To play offline on iOS:',
      iosSteps:
        '<li>Tap the <strong>Share</strong> button at the bottom</li>' +
        '<li>Scroll down and tap <strong>Add to Home Screen</strong></li>' +
        '<li>Name it and tap <strong>Add</strong></li>',
      iosGotIt: 'Got it',
      unsupported: 'Your browser does not support offline mode',
      failed: 'Failed to download',
      saveOk: 'Saved! {n}/{total} files cached.',
      toast: { nothingToUndo: 'Nothing to undo', noteOn: 'Note mode', noteOff: 'Note off' }
    }
  }
};

const DIFFICULTY_HINTS = { easy: 42, normal: 34, hard: 28 };
const MAX_HISTORY = 80;

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

function shuffle(arr, rng) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    const tmp = arr[i]; arr[i] = arr[j]; arr[j] = tmp;
  }
  return arr;
}

function idx(r, c) { return r * 9 + c; }

function fillSolution(rng) {
  const board = new Array(81).fill(0);
  const digits = [1, 2, 3, 4, 5, 6, 7, 8, 9];

  function ok(i, n) {
    const r = Math.floor(i / 9), c = i % 9;
    const br = Math.floor(r / 3) * 3, bc = Math.floor(c / 3) * 3;
    for (let k = 0; k < 9; k++) {
      if (board[idx(r, k)] === n) return false;
      if (board[idx(k, c)] === n) return false;
      const rr = br + Math.floor(k / 3), cc = bc + (k % 3);
      if (board[idx(rr, cc)] === n) return false;
    }
    return true;
  }

  function solve(i) {
    if (i === 81) return true;
    if (board[i] !== 0) return solve(i + 1);
    const order = shuffle(digits.slice(), rng);
    for (const n of order) {
      if (ok(i, n)) {
        board[i] = n;
        if (solve(i + 1)) return true;
        board[i] = 0;
      }
    }
    return false;
  }

  solve(0);
  return board;
}

function randomUint32() { return (Math.random() * 0x100000000) >>> 0; }

class SudokuGame {
  constructor() {
    this.appName = 'sudoku';
    this.difficulty = 'normal';
    this.seed = 0;
    this.solution = [];
    this.given = new Array(81).fill(false);
    this.board = new Array(81).fill(0);
    this.notes = Array.from({ length: 81 }, () => new Set());
    this.selected = null;
    this.noteMode = false;
    this.showErrors = false;
    this.history = [];
    this.moves = 0;
    this.startTime = null;
    this.timerId = null;
    this.isWon = false;

    I18n.register(SD_I18N);
    I18n.apply();
    I18n.mountToggle(document.getElementById('lang-toggle'));
    window.addEventListener('i18nchange', () => {
      I18n.apply();
      this.render();
    });

    this.boardEl = document.getElementById('sd-board');
    this.movesEl = document.getElementById('sd-moves');
    this.timeEl = document.getElementById('sd-time');
    this.bestEl = document.getElementById('sd-best');
    this.diffSel = document.getElementById('sd-difficulty');
    this.noteBtn = document.getElementById('sd-note');
    this.errorsBox = document.getElementById('sd-errors');
    this.winEl = document.getElementById('sd-win');
    this.winBodyEl = document.getElementById('sd-win-body');
    this.toastEl = document.getElementById('sd-toast');
    this.downloadBtn = document.getElementById('download-btn');
    this.downloadDialog = document.getElementById('download-dialog');
    this.iosDialog = document.getElementById('ios-dialog');

    this.init();
  }

  init() {
    document.getElementById('sd-new').addEventListener('click', () => this.newGame());
    document.getElementById('sd-undo').addEventListener('click', () => this.undo());
    document.getElementById('sd-win-new').addEventListener('click', () => {
      this.winEl.classList.add('hidden');
      this.newGame();
    });
    document.getElementById('ios-close-btn').addEventListener('click', () => {
      this.iosDialog.classList.add('hidden');
    });
    this.diffSel.addEventListener('change', () => this.setDifficulty(this.diffSel.value));
    this.noteBtn.addEventListener('click', () => this.toggleNote());
    this.errorsBox.addEventListener('change', () => {
      this.showErrors = this.errorsBox.checked;
      this.render();
    });
    document.querySelectorAll('.sd-pad-btn').forEach(b => {
      b.addEventListener('click', () => this.inputNumber(parseInt(b.dataset.num, 10)));
    });
    document.addEventListener('keydown', (e) => {
      if (e.target && (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT' || e.target.tagName === 'TEXTAREA')) return;
      if (/^[1-9]$/.test(e.key)) this.inputNumber(parseInt(e.key, 10));
      else if (e.key === '0' || e.key === 'Backspace' || e.key === 'Delete') this.inputNumber(0);
      else if (e.key === 'n' || e.key === 'N') this.toggleNote();
      else if (e.key === 'ArrowUp')    this.moveSelection(0, -1);
      else if (e.key === 'ArrowDown')  this.moveSelection(0, 1);
      else if (e.key === 'ArrowLeft')  this.moveSelection(-1, 0);
      else if (e.key === 'ArrowRight') this.moveSelection(1, 0);
    });
    this.downloadBtn.addEventListener('click', () => this.handleDownload());

    this.loadFromURL();
    this.checkOfflineInstallation();
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('../../sw.js').catch(() => {});
    }
  }

  loadFromURL() {
    const params = new URLSearchParams(window.location.search);
    const paramDiff = params.get('difficulty');
    const paramSeed = params.get('seed');
    let diff = paramDiff && DIFFICULTY_HINTS[paramDiff]
      ? paramDiff
      : (localStorage.getItem('sudoku-difficulty') || 'normal');
    if (!DIFFICULTY_HINTS[diff]) diff = 'normal';
    let seed;
    if (paramSeed !== null && /^\d+$/.test(paramSeed)) {
      seed = parseInt(paramSeed, 10) >>> 0;
    } else {
      seed = randomUint32();
    }
    this.difficulty = diff;
    this.diffSel.value = diff;
    this.generate(diff, seed);
    this.updateURL();
    this.loadBest();
    this.startTimer();
  }

  setDifficulty(diff) {
    if (!DIFFICULTY_HINTS[diff]) return;
    this.difficulty = diff;
    localStorage.setItem('sudoku-difficulty', diff);
    this.newGame();
  }

  newGame() {
    this.generate(this.difficulty, randomUint32());
    this.updateURL();
    this.loadBest();
    this.startTimer();
  }

  generate(diff, seed) {
    const rng = mulberry32(seed);
    this.seed = seed;
    this.solution = fillSolution(rng);
    const hints = DIFFICULTY_HINTS[diff];
    const positions = shuffle(Array.from({ length: 81 }, (_, i) => i), rng);
    const removeCount = 81 - hints;
    const puzzle = this.solution.slice();
    for (let i = 0; i < removeCount; i++) puzzle[positions[i]] = 0;
    this.board = puzzle.slice();
    this.given = puzzle.map(v => v !== 0);
    this.notes = Array.from({ length: 81 }, () => new Set());
    this.selected = null;
    this.history = [];
    this.moves = 0;
    this.isWon = false;
    this.movesEl.textContent = '0';
    this.render();
  }

  updateURL() {
    const url = `${window.location.pathname}?difficulty=${this.difficulty}&seed=${this.seed}`;
    window.history.replaceState(null, '', url);
  }

  toggleNote() {
    this.noteMode = !this.noteMode;
    this.noteBtn.setAttribute('aria-pressed', this.noteMode ? 'true' : 'false');
    this.showToast(this.noteMode ? 'sudoku.toast.noteOn' : 'sudoku.toast.noteOff');
  }

  moveSelection(dc, dr) {
    if (this.selected === null) { this.selectCell(0); return; }
    const r = Math.floor(this.selected / 9), c = this.selected % 9;
    const nr = Math.max(0, Math.min(8, r + dr));
    const nc = Math.max(0, Math.min(8, c + dc));
    this.selectCell(nr * 9 + nc);
  }

  selectCell(i) {
    this.selected = i;
    this.render();
  }

  inputNumber(n) {
    if (this.isWon) return;
    if (this.selected === null) return;
    const i = this.selected;
    if (this.given[i]) return;

    this.pushHistory();
    if (this.noteMode && n !== 0) {
      if (this.board[i] !== 0) {
        // Notes only make sense on empty cells
      } else {
        const s = this.notes[i];
        if (s.has(n)) s.delete(n); else s.add(n);
      }
    } else {
      this.board[i] = n;
      this.notes[i].clear();
    }
    this.moves++;
    this.movesEl.textContent = String(this.moves);
    this.render();
    if (this.isComplete()) this.win();
  }

  pushHistory() {
    if (this.history.length >= MAX_HISTORY) this.history.shift();
    this.history.push({
      board: this.board.slice(),
      notes: this.notes.map(s => new Set(s)),
      moves: this.moves,
    });
  }

  undo() {
    if (this.history.length === 0) {
      this.showToast('sudoku.toast.nothingToUndo');
      return;
    }
    const s = this.history.pop();
    this.board = s.board;
    this.notes = s.notes;
    this.moves = s.moves;
    this.movesEl.textContent = String(this.moves);
    this.render();
  }

  isComplete() {
    // Must be fully filled and satisfy every row/col/box (allows alternate solutions
    // when the generated puzzle is not strictly unique).
    for (let i = 0; i < 81; i++) if (!this.board[i]) return false;
    for (let r = 0; r < 9; r++) {
      const seen = new Set();
      for (let c = 0; c < 9; c++) {
        const v = this.board[idx(r, c)];
        if (seen.has(v)) return false;
        seen.add(v);
      }
    }
    for (let c = 0; c < 9; c++) {
      const seen = new Set();
      for (let r = 0; r < 9; r++) {
        const v = this.board[idx(r, c)];
        if (seen.has(v)) return false;
        seen.add(v);
      }
    }
    for (let br = 0; br < 3; br++) for (let bc = 0; bc < 3; bc++) {
      const seen = new Set();
      for (let k = 0; k < 9; k++) {
        const v = this.board[idx(br * 3 + Math.floor(k / 3), bc * 3 + (k % 3))];
        if (seen.has(v)) return false;
        seen.add(v);
      }
    }
    return true;
  }

  errorSet() {
    const errs = new Set();
    if (!this.showErrors) return errs;
    for (let r = 0; r < 9; r++) {
      const seen = {};
      for (let c = 0; c < 9; c++) {
        const v = this.board[idx(r, c)];
        if (!v) continue;
        if (seen[v] !== undefined) { errs.add(idx(r, c)); errs.add(seen[v]); }
        else seen[v] = idx(r, c);
      }
    }
    for (let c = 0; c < 9; c++) {
      const seen = {};
      for (let r = 0; r < 9; r++) {
        const v = this.board[idx(r, c)];
        if (!v) continue;
        if (seen[v] !== undefined) { errs.add(idx(r, c)); errs.add(seen[v]); }
        else seen[v] = idx(r, c);
      }
    }
    for (let br = 0; br < 3; br++) for (let bc = 0; bc < 3; bc++) {
      const seen = {};
      for (let k = 0; k < 9; k++) {
        const r = br * 3 + Math.floor(k / 3), c = bc * 3 + (k % 3);
        const v = this.board[idx(r, c)];
        if (!v) continue;
        if (seen[v] !== undefined) { errs.add(idx(r, c)); errs.add(seen[v]); }
        else seen[v] = idx(r, c);
      }
    }
    return errs;
  }

  render() {
    this.boardEl.innerHTML = '';
    const errs = this.errorSet();
    const selVal = this.selected !== null ? this.board[this.selected] : 0;
    const selR = this.selected !== null ? Math.floor(this.selected / 9) : -1;
    const selC = this.selected !== null ? this.selected % 9 : -1;
    const selBR = selR >= 0 ? Math.floor(selR / 3) : -1;
    const selBC = selC >= 0 ? Math.floor(selC / 3) : -1;

    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        const i = idx(r, c);
        const cell = document.createElement('div');
        cell.className = 'sd-cell';
        cell.setAttribute('role', 'gridcell');
        cell.dataset.index = String(i);
        if ((r + 1) % 3 === 0 && r !== 8) cell.classList.add('bb');
        if ((c + 1) % 3 === 0 && c !== 8) cell.classList.add('br');
        if (this.given[i]) cell.classList.add('given');
        if (this.selected === i) cell.classList.add('selected');
        else {
          if (selR === r || selC === c) cell.classList.add('peer');
          else if (selBR >= 0 && Math.floor(r / 3) === selBR && Math.floor(c / 3) === selBC) cell.classList.add('peer');
          if (selVal && this.board[i] === selVal) cell.classList.add('same-num');
        }
        if (errs.has(i)) cell.classList.add('error');

        const v = this.board[i];
        if (v) {
          cell.textContent = String(v);
        } else if (this.notes[i].size > 0) {
          const notes = document.createElement('div');
          notes.className = 'sd-notes';
          for (let n = 1; n <= 9; n++) {
            const span = document.createElement('span');
            span.textContent = this.notes[i].has(n) ? String(n) : '';
            notes.appendChild(span);
          }
          cell.appendChild(notes);
        }

        cell.addEventListener('click', () => this.selectCell(i));
        this.boardEl.appendChild(cell);
      }
    }
  }

  startTimer() {
    if (this.timerId) clearInterval(this.timerId);
    this.startTime = Date.now();
    this.timeEl.textContent = '00:00';
    this.timerId = setInterval(() => {
      const t = Math.floor((Date.now() - this.startTime) / 1000);
      const m = Math.floor(t / 60), s = t % 60;
      this.timeEl.textContent = `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    }, 500);
  }

  loadBest() {
    const k = `sudoku-best-${this.difficulty}`;
    const v = parseInt(localStorage.getItem(k), 10);
    if (!isNaN(v) && v > 0) {
      const m = Math.floor(v / 60), s = v % 60;
      this.bestEl.textContent = `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    } else {
      this.bestEl.textContent = '-';
    }
  }

  win() {
    this.isWon = true;
    if (this.timerId) clearInterval(this.timerId);
    const t = Math.floor((Date.now() - this.startTime) / 1000);
    const k = `sudoku-best-${this.difficulty}`;
    const prev = parseInt(localStorage.getItem(k), 10);
    if (isNaN(prev) || prev <= 0 || t < prev) {
      localStorage.setItem(k, String(t));
      this.loadBest();
    }
    const m = Math.floor(t / 60), s = t % 60;
    const tStr = `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    this.winBodyEl.textContent = I18n.t('sudoku.winBody')
      .replace('{time}', tStr)
      .replace('{moves}', String(this.moves));
    this.winEl.classList.remove('hidden');
  }

  showToast(key) {
    if (!this.toastEl) return;
    this.toastEl.textContent = I18n.t(key);
    this.toastEl.classList.add('toast-visible');
    clearTimeout(this._toastT);
    this._toastT = setTimeout(() => this.toastEl.classList.remove('toast-visible'), 1400);
  }

  markDownloaded() {
    this.downloadBtn.setAttribute('data-i18n', 'sudoku.downloaded');
    this.downloadBtn.textContent = I18n.t('sudoku.downloaded');
    this.downloadBtn.disabled = true;
  }

  async handleDownload() {
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    if (isIOS && !this.isStandaloneMode()) {
      this.iosDialog.classList.remove('hidden');
      return;
    }
    if (!('caches' in window)) {
      alert(I18n.t('sudoku.unsupported'));
      return;
    }
    try {
      this.downloadBtn.disabled = true;
      this.downloadDialog.classList.remove('hidden');
      const files = [
        new URL('./index.html', window.location.href).href,
        new URL('./style.css',  window.location.href).href,
        new URL('./app.js',     window.location.href).href,
        new URL('../../style.css', window.location.href).href,
        new URL('../../i18n.js',   window.location.href).href,
      ];
      const cache = await caches.open(`app-${this.appName}-v1`);
      let ok = 0;
      for (const f of files) {
        try {
          const r = await fetch(f);
          if (r.ok) { await cache.put(f, r); ok++; }
        } catch (e) {}
      }
      this.downloadDialog.classList.add('hidden');
      if (ok > 0) {
        this.markDownloaded();
        const msg = I18n.t('sudoku.saveOk').replace('{n}', ok).replace('{total}', files.length);
        alert(msg);
      } else {
        throw new Error('failed');
      }
    } catch (e) {
      alert(I18n.t('sudoku.failed'));
      this.downloadBtn.disabled = false;
      this.downloadDialog.classList.add('hidden');
    }
  }

  isStandaloneMode() {
    return window.navigator.standalone === true ||
           window.matchMedia('(display-mode: standalone)').matches;
  }

  checkOfflineInstallation() {
    if (!this.isStandaloneMode()) return;
    if ('caches' in window) {
      caches.keys().then(names => {
        if (names.includes(`app-${this.appName}-v1`)) this.markDownloaded();
      }).catch(() => {});
    }
  }
}

document.addEventListener('DOMContentLoaded', () => new SudokuGame());
