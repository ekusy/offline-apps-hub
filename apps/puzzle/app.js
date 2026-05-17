/**
 * 15 Puzzle Game
 * Classic sliding number puzzle game with offline support
 */

class PuzzleGame {
  constructor() {
    this.board = [];
    this.moves = 0;
    this.startTime = null;
    this.timerInterval = null;
    this.isGameWon = false;
    this.appName = 'puzzle';
    
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
    // Initialize game
    this.createBoard();
    this.loadBestMoves();
    this.setupEventListeners();
    this.checkOfflineInstallation();
    
    // Register Service Worker if available
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
    // Fisher-Yates shuffle with solvability check
    for (let i = this.board.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.board[i], this.board[j]] = [this.board[j], this.board[i]];
    }
    
    // Ensure puzzle is solvable
    if (!this.isSolvable()) {
      // Swap first two non-zero elements
      const nonZeroIndices = this.board
        .map((v, i) => (v !== 0 ? i : -1))
        .filter(i => i !== -1);
      const i = nonZeroIndices[0];
      const j = nonZeroIndices[1];
      [this.board[i], this.board[j]] = [this.board[j], this.board[i]];
    }
  }

  isSolvable() {
    // Count inversions
    let inversions = 0;
    const flat = this.board.filter(n => n !== 0);
    
    for (let i = 0; i < flat.length; i++) {
      for (let j = i + 1; j < flat.length; j++) {
        if (flat[i] > flat[j]) inversions++;
      }
    }
    
    // Find blank row from bottom (1-indexed)
    const blankRow = 4 - Math.floor(this.board.indexOf(0) / 4);
    
    // Solvable if: (inversions is even AND blank row is odd) OR (inversions is odd AND blank row is even)
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
        
        // Check if tile is movable
        if (this.isMovable(index)) {
          tile.classList.add('movable');
        }
        
        // Add click event
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
    
    // Tile is movable if it's adjacent to blank
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
    
    // Save best moves
    const best = parseInt(localStorage.getItem(`${this.appName}-best`)) || Infinity;
    if (this.moves < best) {
      localStorage.setItem(`${this.appName}-best`, this.moves.toString());
      this.loadBestMoves();
    }
    
    // Animate tiles
    document.querySelectorAll('.tile:not(.empty)').forEach(tile => {
      tile.classList.add('solved');
    });
    
    setTimeout(() => {
      alert(`🎉 You won in ${this.moves} moves!\n\nTime: ${this.timerElement.textContent}`);
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

  async handleDownload() {
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    
    if (isIOS && !this.isStandaloneMode()) {
      // Show iOS instructions
      this.iosDialog.classList.remove('hidden');
      return;
    }
    
    if (!('caches' in window)) {
      alert('Your browser does not support offline mode');
      return;
    }
    
    try {
      this.downloadBtn.disabled = true;
      this.downloadDialog.classList.remove('hidden');
      
      // Get absolute paths for caching
      const baseUrl = window.location.origin;
      const appPath = window.location.pathname.substring(0, window.location.pathname.lastIndexOf('/'));
      
      const files = [
        `${baseUrl}${appPath}/index.html`,
        `${baseUrl}${appPath}/style.css`,
        `${baseUrl}${appPath}/app.js`,
        `${baseUrl}/style.css`
      ];
      
      // Use direct cache API approach (iOS Safari compatible)
      const cacheName = `app-${this.appName}-v1`;
      const cache = await caches.open(cacheName);
      
      // Cache files one by one for better error handling
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
        this.downloadBtn.textContent = '✅ Downloaded for Offline';
        this.downloadBtn.disabled = true;
        alert(`Game saved! ${successCount}/${files.length} files cached.\nYou can now play offline.`);
      } else {
        throw new Error('Failed to cache any files');
      }
      
    } catch (error) {
      console.error('Download failed:', error);
      alert('Failed to download: ' + error.message);
      this.downloadBtn.disabled = false;
      this.downloadDialog.classList.add('hidden');
    }
  }

  isStandaloneMode() {
    return window.navigator.standalone === true || 
           window.matchMedia('(display-mode: standalone)').matches;
  }

  checkOfflineInstallation() {
    // Only check in standalone mode
    if (!this.isStandaloneMode()) {
      return;
    }
    
    // Check if already installed offline
    if ('caches' in window) {
      caches.keys().then(names => {
        console.log('Available caches:', names);
        if (names.includes(`app-${this.appName}-v1`)) {
          this.downloadBtn.textContent = '✅ Downloaded for Offline';
          this.downloadBtn.disabled = true;
        }
      }).catch(err => {
        console.warn('Failed to check caches:', err);
      });
    }
  }
}

// Initialize game when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  new PuzzleGame();
});