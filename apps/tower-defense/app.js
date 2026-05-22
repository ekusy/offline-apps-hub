/**
 * Tower Defense
 * Canvas-based real-time strategy on a 12x9 tile grid.
 *
 * NOTE: handleDownload() includes ../../i18n.js and ../../style.css.
 */
const TD_I18N = {
  ja: {
    common: { backHome: '← トップへ' },
    td: {
      title: '🏰 タワーディフェンス',
      subtitle: 'タワーを配置して敵を防ごう',
      wave: 'ウェーブ:',
      start: '⏩ 開始',
      tap: '草地をタップで配置・タワータップで売却',
      download: '📥 オフライン用にダウンロード',
      downloaded: '✅ オフラインで利用可能',
      downloadHint: 'このゲームを保存してオフラインで遊べます',
      downloading: 'ダウンロード中…',
      win: '🏆 全ウェーブ撃退！',
      lose: '💀 ゲームオーバー',
      bestWave: '最高到達ウェーブ: {n}',
      restart: 'リスタート',
      tower: { basic: '基本', cannon: '大砲', frost: '凍結' },
      cost: 'コスト',
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
      toast: { noGold: 'ゴールド不足', cantBuild: 'ここには建てられません', sold: '売却 +{g}' }
    }
  },
  en: {
    common: { backHome: '← Home' },
    td: {
      title: '🏰 Tower Defense',
      subtitle: 'Place towers to defeat the enemy waves',
      wave: 'Wave:',
      start: '⏩ Start',
      tap: 'Tap grass to build, tap tower to sell',
      download: '📥 Download for Offline',
      downloaded: '✅ Downloaded for Offline',
      downloadHint: 'Save this game to play offline',
      downloading: 'Downloading…',
      win: '🏆 All waves defeated!',
      lose: '💀 Game Over',
      bestWave: 'Best wave: {n}',
      restart: 'Restart',
      tower: { basic: 'Basic', cannon: 'Cannon', frost: 'Frost' },
      cost: 'Cost',
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
      toast: { noGold: 'Not enough gold', cantBuild: "Can't build here", sold: 'Sold +{g}' }
    }
  }
};

const COLS = 12, ROWS = 9, TILE = 60;
const W = COLS * TILE, H = ROWS * TILE;

// Path in tile coordinates (col, row). Enemies walk between tile centers.
const PATH_TILES = [
  [0, 1], [3, 1], [3, 4], [6, 4], [6, 1], [9, 1], [9, 6], [2, 6], [2, 8], [11, 8]
];

function pathSet() {
  const set = new Set();
  for (let i = 0; i < PATH_TILES.length - 1; i++) {
    const [c1, r1] = PATH_TILES[i];
    const [c2, r2] = PATH_TILES[i + 1];
    if (c1 === c2) {
      const lo = Math.min(r1, r2), hi = Math.max(r1, r2);
      for (let r = lo; r <= hi; r++) set.add(c1 + ',' + r);
    } else {
      const lo = Math.min(c1, c2), hi = Math.max(c1, c2);
      for (let c = lo; c <= hi; c++) set.add(c + ',' + r1);
    }
  }
  return set;
}
const PATH_SET = pathSet();

function pathPoints() {
  return PATH_TILES.map(([c, r]) => ({ x: c * TILE + TILE / 2, y: r * TILE + TILE / 2 }));
}
const PATH_POINTS = pathPoints();

const TOWERS = {
  basic:  { cost: 20, range: 110, dmg: 8,  rate: 1.6, color: '#1976D2', kind: 'bullet' },
  cannon: { cost: 50, range: 130, dmg: 24, rate: 0.7, color: '#5D4037', kind: 'splash', radius: 48 },
  frost:  { cost: 35, range: 100, dmg: 0,  rate: 1.2, color: '#00BCD4', kind: 'slow' }
};

const ENEMIES = {
  basic:   { hp: 30,  speed: 60,  color: '#E53935', gold: 6 },
  fast:    { hp: 18,  speed: 110, color: '#FB8C00', gold: 7 },
  armor:   { hp: 80,  speed: 40,  color: '#37474F', gold: 10 },
  boss:    { hp: 350, speed: 35,  color: '#6A1B9A', gold: 50 }
};

// 10 waves, each = list of (type, count, interval ms)
const WAVES = [
  [{ type: 'basic', count: 6,  interval: 800 }],
  [{ type: 'basic', count: 10, interval: 700 }],
  [{ type: 'basic', count: 6,  interval: 600 }, { type: 'fast', count: 4, interval: 400 }],
  [{ type: 'fast',  count: 12, interval: 350 }],
  [{ type: 'basic', count: 8,  interval: 500 }, { type: 'armor', count: 4, interval: 700 }],
  [{ type: 'fast',  count: 10, interval: 300 }, { type: 'armor', count: 6, interval: 600 }],
  [{ type: 'armor', count: 10, interval: 500 }],
  [{ type: 'fast',  count: 15, interval: 250 }, { type: 'armor', count: 6, interval: 500 }],
  [{ type: 'basic', count: 12, interval: 400 }, { type: 'armor', count: 8, interval: 500 }, { type: 'fast', count: 10, interval: 250 }],
  [{ type: 'armor', count: 12, interval: 400 }, { type: 'fast', count: 12, interval: 250 }, { type: 'boss', count: 1, interval: 500 }]
];

class TowerDefense {
  constructor() {
    this.appName = 'tower-defense';
    this.canvas = document.getElementById('td-canvas');
    this.ctx = this.canvas.getContext('2d');
    this.setupCanvasDPI();

    this.livesEl = document.getElementById('td-lives');
    this.goldEl = document.getElementById('td-gold');
    this.waveEl = document.getElementById('td-wave');
    this.speedBtn = document.getElementById('td-speed');
    this.startBtn = document.getElementById('td-start');
    this.palEl = document.getElementById('td-pal');
    this.toastEl = document.getElementById('td-toast');
    this.endEl = document.getElementById('td-end');
    this.endTitleEl = document.getElementById('td-end-title');
    this.endBodyEl = document.getElementById('td-end-body');
    this.downloadBtn = document.getElementById('download-btn');
    this.downloadDialog = document.getElementById('download-dialog');
    this.iosDialog = document.getElementById('ios-dialog');

    I18n.register(TD_I18N);
    I18n.apply();
    I18n.mountToggle(document.getElementById('lang-toggle'));
    window.addEventListener('i18nchange', () => {
      I18n.apply();
      this.renderPalette();
    });

    this.reset();
    this.bindEvents();

    this.lastT = performance.now();
    this.loopId = requestAnimationFrame(this.loop.bind(this));

    this.checkOfflineInstallation();
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('../../sw.js').catch(() => {});
    }
  }

  setupCanvasDPI() {
    const dpr = window.devicePixelRatio || 1;
    this.canvas.width = W * dpr;
    this.canvas.height = H * dpr;
    this.canvas.style.aspectRatio = `${W} / ${H}`;
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  reset() {
    this.lives = 10;
    this.gold = 100;
    this.wave = 0;
    this.timeScale = 1;
    this.state = 'prep'; // 'prep' | 'wave' | 'over' | 'won'
    this.towers = [];
    this.enemies = [];
    this.bullets = [];
    this.spawns = [];
    this.spawnTimer = 0;
    this.selectedTower = 'basic';
    this.updateHUD();
    this.renderPalette();
  }

  bindEvents() {
    this.speedBtn.addEventListener('click', () => {
      this.timeScale = this.timeScale === 1 ? 2 : 1;
      this.speedBtn.textContent = this.timeScale + 'x';
    });
    this.startBtn.addEventListener('click', () => this.startWave());
    document.getElementById('td-end-restart').addEventListener('click', () => {
      this.endEl.classList.add('hidden');
      this.reset();
      this.lastT = performance.now();
      if (!this.loopId) this.loopId = requestAnimationFrame(this.loop.bind(this));
    });
    document.getElementById('ios-close-btn').addEventListener('click', () => {
      this.iosDialog.classList.add('hidden');
    });

    this.canvas.addEventListener('click', (e) => this.onCanvasClick(e));
    this.downloadBtn.addEventListener('click', () => this.handleDownload());
  }

  renderPalette() {
    this.palEl.innerHTML = '';
    Object.keys(TOWERS).forEach(key => {
      const t = TOWERS[key];
      const btn = document.createElement('button');
      btn.className = 'td-pal-btn' + (key === this.selectedTower ? ' selected' : '') +
                     (this.gold < t.cost ? ' disabled' : '');
      const icon = document.createElement('span');
      icon.className = 'td-pal-icon';
      icon.textContent = key === 'basic' ? '🗼' : key === 'cannon' ? '💣' : '❄️';
      const meta = document.createElement('div');
      const name = document.createElement('div');
      name.className = 'td-pal-name';
      name.textContent = I18n.t('td.tower.' + key);
      const cost = document.createElement('div');
      cost.className = 'td-pal-cost';
      cost.textContent = `💰 ${t.cost}`;
      meta.appendChild(name); meta.appendChild(cost);
      btn.appendChild(icon); btn.appendChild(meta);
      btn.addEventListener('click', () => {
        this.selectedTower = key;
        this.renderPalette();
      });
      this.palEl.appendChild(btn);
    });
  }

  updateHUD() {
    this.livesEl.textContent = String(this.lives);
    this.goldEl.textContent = String(this.gold);
    this.waveEl.textContent = String(this.wave);
  }

  startWave() {
    if (this.state !== 'prep') return;
    if (this.wave >= WAVES.length) return;
    this.wave++;
    this.state = 'wave';
    const w = WAVES[this.wave - 1];
    this.spawns = [];
    for (const group of w) {
      for (let i = 0; i < group.count; i++) {
        this.spawns.push({ type: group.type, atMs: i * group.interval });
      }
    }
    // Sort by atMs ascending
    this.spawns.sort((a, b) => a.atMs - b.atMs);
    this.spawnTimer = 0;
    this.updateHUD();
  }

  onCanvasClick(e) {
    if (this.state === 'over' || this.state === 'won') return;
    const rect = this.canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) * (W / rect.width);
    const y = (e.clientY - rect.top) * (H / rect.height);
    const c = Math.floor(x / TILE), r = Math.floor(y / TILE);
    if (c < 0 || c >= COLS || r < 0 || r >= ROWS) return;
    const existing = this.towers.find(t => t.c === c && t.r === r);
    if (existing) {
      const refund = Math.floor(TOWERS[existing.type].cost * 0.7);
      this.gold += refund;
      this.towers = this.towers.filter(t => t !== existing);
      this.showToast(I18n.t('td.toast.sold').replace('{g}', refund));
      this.updateHUD();
      this.renderPalette();
      return;
    }
    if (PATH_SET.has(c + ',' + r)) {
      this.showToast(I18n.t('td.toast.cantBuild'));
      return;
    }
    const cfg = TOWERS[this.selectedTower];
    if (this.gold < cfg.cost) {
      this.showToast(I18n.t('td.toast.noGold'));
      return;
    }
    this.gold -= cfg.cost;
    this.towers.push({
      type: this.selectedTower, c, r,
      x: c * TILE + TILE / 2, y: r * TILE + TILE / 2,
      cooldown: 0
    });
    this.updateHUD();
    this.renderPalette();
  }

  spawnEnemy(type) {
    const cfg = ENEMIES[type];
    const waveScale = 1 + (this.wave - 1) * 0.08;
    const start = PATH_POINTS[0];
    this.enemies.push({
      type,
      hp: cfg.hp * waveScale,
      maxHp: cfg.hp * waveScale,
      speed: cfg.speed,
      x: start.x, y: start.y,
      pathIdx: 1,
      slowUntil: 0
    });
  }

  loop(now) {
    const dt = Math.min(0.05, (now - this.lastT) / 1000) * this.timeScale;
    this.lastT = now;
    if (this.state === 'wave' || this.state === 'prep') {
      this.update(dt);
    }
    this.draw();
    if (this.state === 'over' || this.state === 'won') {
      this.loopId = null;
      return;
    }
    this.loopId = requestAnimationFrame(this.loop.bind(this));
  }

  update(dt) {
    // Spawn enemies
    if (this.state === 'wave') {
      this.spawnTimer += dt * 1000;
      while (this.spawns.length > 0 && this.spawns[0].atMs <= this.spawnTimer) {
        const s = this.spawns.shift();
        this.spawnEnemy(s.type);
      }
    }

    // Move enemies
    const survivors = [];
    for (const e of this.enemies) {
      const slowed = performance.now() < e.slowUntil;
      const sp = e.speed * (slowed ? 0.4 : 1);
      const target = PATH_POINTS[e.pathIdx];
      if (!target) {
        // Reached end of path → lose a life and remove enemy.
        this.lives = Math.max(0, this.lives - 1);
        this.updateHUD();
        if (this.lives === 0) {
          this.gameOver(false);
        }
        continue;
      }
      const dx = target.x - e.x, dy = target.y - e.y;
      const d = Math.hypot(dx, dy);
      const step = sp * dt;
      if (d <= step) {
        e.x = target.x; e.y = target.y; e.pathIdx++;
      } else {
        e.x += dx / d * step;
        e.y += dy / d * step;
      }
      if (e.hp > 0) survivors.push(e);
    }
    this.enemies = survivors;

    // Tower fire
    const nowMs = performance.now();
    for (const t of this.towers) {
      const cfg = TOWERS[t.type];
      if (t.cooldown > 0) t.cooldown -= dt;
      if (t.cooldown > 0) continue;
      // find closest enemy in range
      let best = null, bestD = Infinity;
      for (const e of this.enemies) {
        const d = Math.hypot(e.x - t.x, e.y - t.y);
        if (d <= cfg.range && d < bestD) { best = e; bestD = d; }
      }
      if (!best) continue;
      t.cooldown = 1 / cfg.rate;
      if (cfg.kind === 'slow') {
        // splash slow in range
        for (const e of this.enemies) {
          const d = Math.hypot(e.x - t.x, e.y - t.y);
          if (d <= cfg.range) e.slowUntil = nowMs + 1500;
        }
      } else if (cfg.kind === 'bullet') {
        const dx = best.x - t.x, dy = best.y - t.y;
        const d = Math.hypot(dx, dy);
        this.bullets.push({
          x: t.x, y: t.y, vx: dx / d * 380, vy: dy / d * 380,
          dmg: cfg.dmg, target: best, kind: 'bullet', life: 1.5
        });
      } else if (cfg.kind === 'splash') {
        this.bullets.push({
          x: t.x, y: t.y, vx: 0, vy: 0,
          dmg: cfg.dmg, target: best, kind: 'splash', radius: cfg.radius, life: 1.0
        });
      }
    }

    // Update bullets
    const liveB = [];
    for (const b of this.bullets) {
      b.life -= dt;
      if (b.life <= 0) continue;
      if (b.kind === 'bullet') {
        // home in: each frame point velocity toward (now-current) target if alive
        if (b.target && b.target.hp > 0) {
          const dx = b.target.x - b.x, dy = b.target.y - b.y;
          const d = Math.hypot(dx, dy);
          if (d <= 14) {
            b.target.hp -= b.dmg;
            if (b.target.hp <= 0) this.killEnemy(b.target);
            continue;
          }
          b.vx = dx / d * 380;
          b.vy = dy / d * 380;
        }
        b.x += b.vx * dt; b.y += b.vy * dt;
        liveB.push(b);
      } else if (b.kind === 'splash') {
        // detonate immediately at target position
        const tx = b.target ? b.target.x : b.x;
        const ty = b.target ? b.target.y : b.y;
        for (const e of this.enemies) {
          if (Math.hypot(e.x - tx, e.y - ty) <= b.radius) {
            e.hp -= b.dmg;
            if (e.hp <= 0) this.killEnemy(e);
          }
        }
        b.explodeAt = { x: tx, y: ty, radius: b.radius };
        b.life = 0.18; // brief visible explosion
        b.kind = 'boom';
        liveB.push(b);
      } else if (b.kind === 'boom') {
        liveB.push(b);
      }
    }
    this.bullets = liveB;

    // Wave end check
    if (this.state === 'wave' && this.spawns.length === 0 && this.enemies.length === 0) {
      this.state = 'prep';
      this.gold += 25; // wave clear bonus
      this.updateHUD();
      this.renderPalette();
      if (this.wave >= WAVES.length) {
        this.gameOver(true);
      }
    }
  }

  killEnemy(e) {
    e.hp = 0;
    this.gold += ENEMIES[e.type].gold;
    this.updateHUD();
  }

  draw() {
    const ctx = this.ctx;
    ctx.fillStyle = '#2E7D32';
    ctx.fillRect(0, 0, W, H);

    // Tile grid (light)
    ctx.strokeStyle = 'rgba(0,0,0,0.06)';
    for (let c = 0; c <= COLS; c++) {
      ctx.beginPath();
      ctx.moveTo(c * TILE, 0);
      ctx.lineTo(c * TILE, H);
      ctx.stroke();
    }
    for (let r = 0; r <= ROWS; r++) {
      ctx.beginPath();
      ctx.moveTo(0, r * TILE);
      ctx.lineTo(W, r * TILE);
      ctx.stroke();
    }

    // Path tiles
    ctx.fillStyle = '#8D6E63';
    PATH_SET.forEach(k => {
      const [c, r] = k.split(',').map(Number);
      ctx.fillRect(c * TILE + 2, r * TILE + 2, TILE - 4, TILE - 4);
    });

    // Start/end markers
    const start = PATH_POINTS[0], end = PATH_POINTS[PATH_POINTS.length - 1];
    ctx.fillStyle = '#FFC107';
    ctx.beginPath(); ctx.arc(start.x, start.y, 10, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#FFEB3B';
    ctx.fillRect(end.x - 14, end.y - 14, 28, 28);

    // Towers
    for (const t of this.towers) {
      const cfg = TOWERS[t.type];
      ctx.fillStyle = cfg.color;
      ctx.beginPath();
      ctx.arc(t.x, t.y, 18, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = 'white';
      ctx.font = '18px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      const icon = t.type === 'basic' ? '🗼' : t.type === 'cannon' ? '💣' : '❄️';
      ctx.fillText(icon, t.x, t.y + 1);
    }

    // Enemies
    for (const e of this.enemies) {
      const cfg = ENEMIES[e.type];
      ctx.fillStyle = cfg.color;
      ctx.beginPath();
      const radius = e.type === 'boss' ? 18 : 12;
      ctx.arc(e.x, e.y, radius, 0, Math.PI * 2);
      ctx.fill();
      // HP bar
      const w = radius * 2, h = 4;
      ctx.fillStyle = '#000';
      ctx.fillRect(e.x - w / 2, e.y - radius - 8, w, h);
      ctx.fillStyle = '#4CAF50';
      ctx.fillRect(e.x - w / 2, e.y - radius - 8, w * Math.max(0, e.hp / e.maxHp), h);
      if (performance.now() < e.slowUntil) {
        ctx.strokeStyle = '#80DEEA';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(e.x, e.y, radius + 3, 0, Math.PI * 2);
        ctx.stroke();
      }
    }

    // Bullets
    for (const b of this.bullets) {
      if (b.kind === 'bullet') {
        ctx.fillStyle = '#FFF';
        ctx.beginPath();
        ctx.arc(b.x, b.y, 4, 0, Math.PI * 2);
        ctx.fill();
      } else if (b.kind === 'boom' && b.explodeAt) {
        ctx.fillStyle = 'rgba(255,152,0,0.5)';
        ctx.beginPath();
        ctx.arc(b.explodeAt.x, b.explodeAt.y, b.explodeAt.radius * (1 - b.life / 0.18 + 0.4), 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }

  gameOver(won) {
    if (this.state === 'over' || this.state === 'won') return;
    this.state = won ? 'won' : 'over';
    const prev = parseInt(localStorage.getItem('td-best-wave'), 10) || 0;
    if (this.wave > prev) localStorage.setItem('td-best-wave', String(this.wave));
    this.endTitleEl.textContent = I18n.t(won ? 'td.win' : 'td.lose');
    this.endBodyEl.textContent = I18n.t('td.bestWave').replace('{n}', String(Math.max(prev, this.wave)));
    this.endEl.classList.remove('hidden');
  }

  showToast(text) {
    if (!this.toastEl) return;
    this.toastEl.textContent = text;
    this.toastEl.classList.add('toast-visible');
    clearTimeout(this._toastT);
    this._toastT = setTimeout(() => this.toastEl.classList.remove('toast-visible'), 1200);
  }

  markDownloaded() {
    this.downloadBtn.setAttribute('data-i18n', 'td.downloaded');
    this.downloadBtn.textContent = I18n.t('td.downloaded');
    this.downloadBtn.disabled = true;
  }

  async handleDownload() {
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    if (isIOS && !this.isStandaloneMode()) {
      this.iosDialog.classList.remove('hidden');
      return;
    }
    if (!('caches' in window)) {
      alert(I18n.t('td.unsupported'));
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
        const msg = I18n.t('td.saveOk').replace('{n}', ok).replace('{total}', files.length);
        alert(msg);
      } else {
        throw new Error('failed');
      }
    } catch (e) {
      alert(I18n.t('td.failed'));
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

document.addEventListener('DOMContentLoaded', () => new TowerDefense());
