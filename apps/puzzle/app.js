/**
 * 15 Puzzle Game
 * Classic sliding number puzzle game with offline support.
 *
 * NOTE: when adding files to the offline cache list in handleDownload(),
 * always include /i18n.js — without it the language toggle breaks offline.
 */

const PUZZLE_I18N = {
  ja: {
    common: { backHome: '← トップへ' },
    puzzle: {
      title: '🧩 15パズル',
      subtitle: '1〜15の数字を順番に並べよう',
      moves: '手数:',
      time: '時間:',
      best: 'ベスト:',
      shuffle: '🔀 シャッフル',
      reset: '↻ リセット',
      download: '📥 オフライン用にダウンロード',
      downloaded: '✅ オフラインで利用可能',
      downloadHint: 'このゲームを保存してオフラインで遊べます',
      downloading: 'ダウンロード中…',
      iosTitle: 'ホーム画面に追加',
      iosLead: 'iOSでオフラインで遊ぶには:',
      iosSteps:
        '<li>下にある<strong>共有</strong>ボタンをタップ</li>' +
        '<li>下にスクロールして<strong>ホーム画面に追加</strong>をタップ</li>' +
        '<li>「15パズル」と名前を付けて<strong>追加</strong>をタップ</li>',
      iosGotIt: 'OK',
      win: '🎉 {moves}手でクリア！\n\nタイム: {time}',
      saveOk: '保存しました！ {n}/{total} ファイルをキャッシュしました。\nこれでオフラインでも遊べます。',
      unsupported: 'このブラウザはオフラインモードに対応していません',
      failed: 'ダウンロードに失敗しました'
    }
  },
  en: {
    common: { backHome: '← Home' },
    puzzle: {
      title: '🧩 15 Puzzle',
      subtitle: 'Arrange all numbers in order from 1 to 15',
      moves: 'Moves:',
      time: 'Time:',
      best: 'Best:',
      shuffle: '🔀 Shuffle',
      reset: '↻ Reset',
      download: '📥 Download for Offline',
      downloaded: '✅ Downloaded for Offline',
      downloadHint: 'Save this game to play offline',
      downloading: 'Downloading…',
      iosTitle: 'Add to Home Screen',
      iosLead: 'To play offline on iOS:',
      iosSteps:
        '<li>Tap the <strong>Share</strong> button at the bottom</li>' +
        '<li>Scroll down and tap <strong>Add to Home Screen</strong></li>' +
        '<li>Name it "15 Puzzle" and tap <strong>Add</strong></li>',
      iosGotIt: 'Got it',
      win: '🎉 You won in {moves} moves!\n\nTime: {time}',
      saveOk: 'Game saved! {n}/{total} files cached.\nYou can now play offline.',
      unsupported: 'Your browser does not support offline mode',
      failed: 'Failed to download'
    }
  }
};

class PuzzleGame {
  constructor() {
    this.board = [];
    this.moves = 0;
    this.startTime = null;
    this.timerInterval = null;
    this.isGameWon = false;
    this.isDownloaded = false;
    this.appName = 'puzzle';

    // i18n setup must happen before reading any localized DOM
    I18n.register(PUZZLE_I18N);
    I18n.apply();
    I18n.mountToggle(document.getElementById('lang-toggle'));
    window.addEventListener('i18nchange', () => I18n.apply());

    // DOM elements
    this.boardElement = document.getElementById('puzzle-board');
    this.movesElement = document.getElementById('moves');
    this.timerElement = document.getElementById('timer');
    this.bestMovesElement = document.getElementById('best-moves');
    this.shuffleBtn = document.getElementById('shuffle-btn');
    this.resetBtn = document.getElementById('reset-btn');
    this.downloadBtn = document.getElementById('download-btn');
    this.downloadDialog = document.getElementById('download-dialog');
    this.iosDialog = document.getElementById('ios-dialog');
    this.iosCloseBtn = document.getElementById('ios-close-btn');

    this.init();
  }

  init() {
    this.createBoard();
    this.loadBestMoves();
    this.setupEventListeners();
    this.checkOfflineInstallation();

    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('../../sw.js').catch(err => {
        console.warn('Service Worker registration failed:', err);
      });
    }
  }

  createBoard() {
    this.board = Array.from({ length: 16 }, (_, i) => i);
    this.shuffle();
    this.render();
  }

  shuffle() {
    for (let i = this.board.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.board[i], this.board[j]] = [this.board[j], this.board[i]];
    }

    if (!this.isSolvable()) {
      const nonZeroIndices = this.board
        .map((v, i) => (v !== 0 ? i : -1))
        .filter(i => i !== -1);
      const i = nonZeroIndices[0];
      const j = nonZeroIndices[1];
      [this.board[i], this.board[j]] = [this.board[j], this.board[i]];
    }
  }

  isSolvable() {
    let inversions = 0;
    const flat = this.board.filter(n => n !== 0);

    for (let i = 0; i < flat.length; i++) {
      for (let j = i + 1; j < flat.length; j++) {
        if (flat[i] > flat[j]) inversions++;
      }
    }

    const blankRow = 4 - Math.floor(this.board.indexOf(0) / 4);
    return (inversions % 2) === (blankRow % 2);
  }

  render() {
    this.boardElement.innerHTML = '';

    this.board.forEach((num, index) => {
      const tile = document.createElement('div');
      tile.className = 'tile';

      if (num === 0) {
        tile.classList.add('empty');
      } else {
        tile.textContent = num;
        tile.dataset.index = index;

        if (this.isMovable(index)) {
          tile.classList.add('movable');
        }

        tile.addEventListener('click', () => this.moveTile(index));
      }

      this.boardElement.appendChild(tile);
    });
  }

  isMovable(index) {
    const blankIndex = this.board.indexOf(0);
    const row = Math.floor(index / 4);
    const col = index % 4;
    const blankRow = Math.floor(blankIndex / 4);
    const blankCol = blankIndex % 4;

    return (
      (row === blankRow && Math.abs(col - blankCol) === 1) ||
      (col === blankCol && Math.abs(row - blankRow) === 1)
    );
  }

  moveTile(index) {
    if (!this.isMovable(index) || this.isGameWon) return;

    const blankIndex = this.board.indexOf(0);
    [this.board[index], this.board[blankIndex]] = [this.board[blankIndex], this.board[index]];

    this.moves++;
    this.movesElement.textContent = this.moves;
    this.render();

    if (this.isWon()) {
      this.win();
    }
  }

  isWon() {
    for (let i = 0; i < 15; i++) {
      if (this.board[i] !== i + 1) return false;
    }
    return this.board[15] === 0;
  }

  win() {
    this.isGameWon = true;
    clearInterval(this.timerInterval);

    const best = parseInt(localStorage.getItem(`${this.appName}-best`)) || Infinity;
    if (this.moves < best) {
      localStorage.setItem(`${this.appName}-best`, this.moves.toString());
      this.loadBestMoves();
    }

    document.querySelectorAll('.tile:not(.empty)').forEach(tile => {
      tile.classList.add('solved');
    });

    setTimeout(() => {
      const msg = I18n.t('puzzle.win')
        .replace('{moves}', this.moves)
        .replace('{time}', this.timerElement.textContent);
      alert(msg);
    }, 500);
  }

  setupEventListeners() {
    this.shuffleBtn.addEventListener('click', () => {
      this.moves = 0;
      this.isGameWon = false;
      this.shuffle();
      this.startTimer();
      this.movesElement.textContent = '0';
      this.render();
    });

    this.resetBtn.addEventListener('click', () => {
      this.moves = 0;
      this.isGameWon = false;
      this.createBoard();
      this.startTimer();
      this.movesElement.textContent = '0';
    });

    this.downloadBtn.addEventListener('click', () => this.handleDownload());
    this.iosCloseBtn.addEventListener('click', () => {
      this.iosDialog.classList.add('hidden');
    });
  }

  startTimer() {
    if (this.timerInterval) clearInterval(this.timerInterval);
    this.startTime = Date.now();

    this.timerInterval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - this.startTime) / 1000);
      const mins = Math.floor(elapsed / 60);
      const secs = elapsed % 60;
      this.timerElement.textContent =
        `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    }, 100);
  }

  loadBestMoves() {
    const best = localStorage.getItem(`${this.appName}-best`);
    this.bestMovesElement.textContent = best ? best : '-';
  }

  markDownloaded() {
    this.isDownloaded = true;
    // Hand the button over to I18n.apply() so language toggles re-translate it.
    this.downloadBtn.setAttribute('data-i18n', 'puzzle.downloaded');
    this.downloadBtn.textContent = I18n.t('puzzle.downloaded');
    this.downloadBtn.disabled = true;
  }

  async handleDownload() {
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);

    if (isIOS && !this.isStandaloneMode()) {
      this.iosDialog.classList.remove('hidden');
      return;
    }

    if (!('caches' in window)) {
      alert(I18n.t('puzzle.unsupported'));
      return;
    }

    try {
      this.downloadBtn.disabled = true;
      this.downloadDialog.classList.remove('hidden');

      // Resolve every URL against the current document so the cache keys
      // match exactly what the browser will request — including when
      // deployed at a sub-path (e.g. https://user.github.io/repo/).
      // Include the shared root assets (style.css, i18n.js) so the page
      // renders correctly and the language toggle still works offline.
      const files = [
        new URL('./index.html', window.location.href).href,
        new URL('./style.css',  window.location.href).href,
        new URL('./app.js',     window.location.href).href,
        new URL('../../style.css', window.location.href).href,
        new URL('../../i18n.js',   window.location.href).href
      ];

      const cacheName = `app-${this.appName}-v1`;
      const cache = await caches.open(cacheName);

      let successCount = 0;
      for (const file of files) {
        try {
          console.log('Fetching:', file);
          const response = await fetch(file);
          if (response.ok) {
            await cache.put(file, response);
            successCount++;
            console.log('Cached:', file);
          } else {
            console.warn('Failed to fetch:', file, response.status);
          }
        } catch (err) {
          console.warn(`Failed to cache ${file}:`, err);
        }
      }

      this.downloadDialog.classList.add('hidden');

      if (successCount > 0) {
        this.markDownloaded();
        const msg = I18n.t('puzzle.saveOk')
          .replace('{n}', successCount)
          .replace('{total}', files.length);
        alert(msg);
      } else {
        throw new Error('Failed to cache any files');
      }

    } catch (error) {
      console.error('Download failed:', error);
      alert(I18n.t('puzzle.failed') + ': ' + error.message);
      this.downloadBtn.disabled = false;
      this.downloadDialog.classList.add('hidden');
    }
  }

  isStandaloneMode() {
    return window.navigator.standalone === true ||
           window.matchMedia('(display-mode: standalone)').matches;
  }

  checkOfflineInstallation() {
    if (!this.isStandaloneMode()) {
      return;
    }

    if ('caches' in window) {
      caches.keys().then(names => {
        console.log('Available caches:', names);
        if (names.includes(`app-${this.appName}-v1`)) {
          this.markDownloaded();
        }
      }).catch(err => {
        console.warn('Failed to check caches:', err);
      });
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  new PuzzleGame();
});
