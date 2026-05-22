/**
 * Dungeon Crawler — turn-based 7x7 grid RPG, 10 floors.
 *
 * NOTE: handleDownload() includes ../../i18n.js and ../../style.css.
 */
const DG_I18N = {
  ja: {
    common: { backHome: '← トップへ' },
    dg: {
      title: '🗡️ ダンジョンクローラー',
      subtitle: 'ターンベースで 10 階を踏破せよ',
      floor: '階:', hp: 'HP:', mp: 'MP:', lv: 'Lv:', exp: 'EXP:', gear: '装備:',
      attack: '⚔️ 攻撃', magic: '✨ 魔法(全方位)', defend: '🛡️ 防御', wait: '⏸ 待機', new: '🔀 新規',
      restart: '新しいゲーム',
      download: '📥 オフライン用にダウンロード',
      downloaded: '✅ オフラインで利用可能',
      downloadHint: 'このゲームを保存してオフラインで遊べます',
      downloading: 'ダウンロード中…',
      win: '🏆 ダンジョン制覇！',
      lose: '💀 力尽きた…',
      results: 'F{floor} 到達 / ターン {turns} / 最大ダメージ {dmg}',
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
      log: {
        attack: 'プレイヤー → {enemy} に {dmg} ダメージ',
        attackNoTarget: '攻撃する相手がいない',
        magic: '🔥 魔法！{enemy} に {dmg} ダメージ',
        magicNoMp: 'MP が足りない',
        defend: '🛡️ 防御を構える',
        wait: 'プレイヤーは待機',
        kill: '{enemy} を倒した（EXP +{exp}）',
        levelUp: 'Lv UP! 最大 HP/MP/攻撃が上昇',
        enemyAttack: '{enemy} → プレイヤーに {dmg} ダメージ',
        item: { hp: '回復ポーション (HP +{v})', mp: 'マナポーション (MP +{v})', wpn: '武器を装備 (⚔️+{v})', arm: '防具を装備 (🛡️+{v})' },
        floor: 'F{n} に到達',
        gameover: '力尽きた…',
        clear: 'ダンジョンを制覇！'
      },
      enemy: { slime: 'スライム', goblin: 'ゴブリン', ogre: 'オーガ', boss: 'ドラゴン' }
    }
  },
  en: {
    common: { backHome: '← Home' },
    dg: {
      title: '🗡️ Dungeon Crawler',
      subtitle: 'Turn-based 10-floor dungeon',
      floor: 'Floor:', hp: 'HP:', mp: 'MP:', lv: 'Lv:', exp: 'EXP:', gear: 'Gear:',
      attack: '⚔️ Attack', magic: '✨ Magic(AoE)', defend: '🛡️ Defend', wait: '⏸ Wait', new: '🔀 New',
      restart: 'New Game',
      download: '📥 Download for Offline',
      downloaded: '✅ Downloaded for Offline',
      downloadHint: 'Save this game to play offline',
      downloading: 'Downloading…',
      win: '🏆 Dungeon cleared!',
      lose: '💀 You fell…',
      results: 'F{floor} reached / turns {turns} / max dmg {dmg}',
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
      log: {
        attack: 'You hit {enemy} for {dmg}',
        attackNoTarget: 'No adjacent enemy',
        magic: '🔥 Magic! {enemy} takes {dmg}',
        magicNoMp: 'Not enough MP',
        defend: '🛡️ You brace yourself',
        wait: 'You wait',
        kill: 'Slew {enemy} (EXP +{exp})',
        levelUp: 'Level up! HP/MP/ATK increased',
        enemyAttack: '{enemy} hits you for {dmg}',
        item: { hp: 'Healing potion (HP +{v})', mp: 'Mana potion (MP +{v})', wpn: 'Equipped weapon (⚔️+{v})', arm: 'Equipped armor (🛡️+{v})' },
        floor: 'Reached floor {n}',
        gameover: 'You have fallen…',
        clear: 'You cleared the dungeon!'
      },
      enemy: { slime: 'Slime', goblin: 'Goblin', ogre: 'Ogre', boss: 'Dragon' }
    }
  }
};

const GRID = 7;
const VIEW_RANGE = 2; // Chebyshev distance

const ENEMY_BASE = {
  slime:  { hp: 8,  atk: 3, def: 1, exp: 3,  emoji: '🟢' },
  goblin: { hp: 14, atk: 5, def: 2, exp: 6,  emoji: '👺' },
  ogre:   { hp: 28, atk: 8, def: 4, exp: 12, emoji: '👹' },
  boss:   { hp: 60, atk: 12, def: 6, exp: 30, emoji: '🐉' }
};

function rngInt(n) { return Math.floor(Math.random() * n); }
function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }
function idx(c, r) { return r * GRID + c; }

class DungeonGame {
  constructor() {
    this.appName = 'dungeon';
    I18n.register(DG_I18N);
    I18n.apply();
    I18n.mountToggle(document.getElementById('lang-toggle'));
    window.addEventListener('i18nchange', () => {
      I18n.apply();
      this.renderAll();
    });

    this.gridEl = document.getElementById('dg-grid');
    this.logEl = document.getElementById('dg-log');
    this.toastEl = document.getElementById('dg-toast');
    this.endEl = document.getElementById('dg-end');
    this.endTitleEl = document.getElementById('dg-end-title');
    this.endBodyEl = document.getElementById('dg-end-body');
    this.downloadBtn = document.getElementById('download-btn');
    this.downloadDialog = document.getElementById('download-dialog');
    this.iosDialog = document.getElementById('ios-dialog');

    this.bind();
    this.startNew();

    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('../../sw.js').catch(() => {});
    }
    this.checkOfflineInstallation();
  }

  bind() {
    document.getElementById('dg-up').addEventListener('click', () => this.move(0, -1));
    document.getElementById('dg-down').addEventListener('click', () => this.move(0, 1));
    document.getElementById('dg-left').addEventListener('click', () => this.move(-1, 0));
    document.getElementById('dg-right').addEventListener('click', () => this.move(1, 0));
    document.getElementById('dg-attack').addEventListener('click', () => this.attackAction());
    document.getElementById('dg-magic').addEventListener('click', () => this.magicAction());
    document.getElementById('dg-defend').addEventListener('click', () => this.defendAction());
    document.getElementById('dg-wait').addEventListener('click', () => this.waitAction());
    document.getElementById('dg-new').addEventListener('click', () => this.startNew());
    document.getElementById('dg-end-restart').addEventListener('click', () => {
      this.endEl.classList.add('hidden');
      this.startNew();
    });
    document.getElementById('ios-close-btn').addEventListener('click', () => {
      this.iosDialog.classList.add('hidden');
    });
    document.addEventListener('keydown', (e) => {
      if (e.target && (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT')) return;
      const k = e.key.toLowerCase();
      if (e.key === 'ArrowUp'    || k === 'w') this.move(0, -1);
      else if (e.key === 'ArrowDown'  || k === 's') this.move(0, 1);
      else if (e.key === 'ArrowLeft'  || k === 'a') this.move(-1, 0);
      else if (e.key === 'ArrowRight' || k === 'd') this.move(1, 0);
      else if (k === 'x' || k === ' ') { e.preventDefault(); this.attackAction(); }
      else if (k === 'm') this.magicAction();
      else if (k === 'g') this.defendAction();
      else if (k === '.') this.waitAction();
    });
    this.downloadBtn.addEventListener('click', () => this.handleDownload());
  }

  startNew() {
    this.player = {
      c: 3, r: 3,
      hp: 30, maxHp: 30,
      mp: 10, maxMp: 10,
      atk: 5, def: 2, lv: 1, exp: 0,
      weaponAtk: 0, armorDef: 0,
      defendingNext: false
    };
    this.floor = 0;
    this.turn = 0;
    this.maxDamage = 0;
    this.state = 'play';
    this.enemies = [];
    this.items = [];
    this.fog = new Array(GRID * GRID).fill(true);
    this.log = [];
    this.nextFloor(true);
  }

  nextFloor(isFirst) {
    this.floor++;
    if (this.floor > 10) {
      this.gameOver(true);
      return;
    }
    this.enemies = [];
    this.items = [];
    this.stairs = -1;

    // Place player at a corner-ish spot
    if (isFirst) { this.player.c = 0; this.player.r = 0; }

    const occupied = new Set();
    occupied.add(idx(this.player.c, this.player.r));

    // Stairs
    let s;
    do { s = rngInt(GRID * GRID); } while (occupied.has(s));
    this.stairs = s;
    occupied.add(s);

    const ePool = this.enemyPool();
    const enemyCount = 2 + rngInt(4);
    for (let i = 0; i < enemyCount; i++) {
      let p;
      let tries = 0;
      do {
        p = rngInt(GRID * GRID);
        tries++;
        if (tries > 40) break;
      } while (occupied.has(p) || this.isAdjacent(this.player.c, this.player.r, p % GRID, Math.floor(p / GRID)));
      if (tries > 40) break;
      occupied.add(p);
      const type = ePool[rngInt(ePool.length)];
      const base = ENEMY_BASE[type];
      const scale = 1 + (this.floor - 1) * 0.25;
      this.enemies.push({
        id: 'e' + i + '_' + p,
        type,
        c: p % GRID,
        r: Math.floor(p / GRID),
        hp: Math.round(base.hp * scale),
        maxHp: Math.round(base.hp * scale),
        atk: Math.round(base.atk * scale),
        def: Math.round(base.def * scale)
      });
    }

    // Item drops: every floor is guaranteed at least one gear item (weapon or
    // armor) so the player can keep up with scaling. Remaining drops are weighted
    // toward consumables.
    const itemCount = 2 + rngInt(2); // 2-3 items per floor
    const gearPool = ['wpn', 'arm'];
    const consumablePool = ['hp', 'hp', 'mp', 'wpn', 'arm'];
    for (let i = 0; i < itemCount; i++) {
      let p;
      let tries = 0;
      do {
        p = rngInt(GRID * GRID);
        tries++;
        if (tries > 40) break;
      } while (occupied.has(p));
      if (tries > 40) break;
      occupied.add(p);
      // First item slot of each floor is guaranteed to be gear.
      const kind = i === 0
        ? gearPool[rngInt(gearPool.length)]
        : consumablePool[rngInt(consumablePool.length)];
      const value = kind === 'hp' ? 12 + rngInt(8)
                  : kind === 'mp' ? 4 + rngInt(4)
                  : 1 + Math.floor((this.floor + 1) / 2); // gear scales faster
      this.items.push({ c: p % GRID, r: Math.floor(p / GRID), kind, value });
    }

    this.fog = new Array(GRID * GRID).fill(true);
    this.revealFog();
    this.pushLog(I18n.t('dg.log.floor').replace('{n}', this.floor));
    this.renderAll();
  }

  enemyPool() {
    if (this.floor >= 10) return ['boss', 'ogre'];
    if (this.floor >= 7) return ['ogre', 'goblin'];
    if (this.floor >= 4) return ['goblin', 'slime', 'goblin'];
    return ['slime', 'slime', 'goblin'];
  }

  // Chebyshev — used only for "don't spawn an enemy right next to the player".
  isAdjacent(c1, r1, c2, r2) {
    return Math.max(Math.abs(c1 - c2), Math.abs(r1 - r2)) <= 1;
  }
  // Manhattan — players and enemies can only act on the four cardinal neighbors.
  isCardinalAdjacent(c1, r1, c2, r2) {
    return Math.abs(c1 - c2) + Math.abs(r1 - r2) === 1;
  }

  revealFog() {
    for (let r = 0; r < GRID; r++) {
      for (let c = 0; c < GRID; c++) {
        if (Math.max(Math.abs(c - this.player.c), Math.abs(r - this.player.r)) <= VIEW_RANGE) {
          this.fog[idx(c, r)] = false;
        }
      }
    }
  }

  enemyAt(c, r) {
    return this.enemies.find(e => e.c === c && e.r === r && e.hp > 0);
  }
  itemAt(c, r) {
    return this.items.find(it => it.c === c && it.r === r);
  }
  blocked(c, r) {
    if (c < 0 || c >= GRID || r < 0 || r >= GRID) return true;
    return !!this.enemyAt(c, r);
  }

  move(dc, dr) {
    if (this.state !== 'play') return;
    const nc = this.player.c + dc, nr = this.player.r + dr;
    if (nc < 0 || nc >= GRID || nr < 0 || nr >= GRID) return;
    const targetEnemy = this.enemyAt(nc, nr);
    if (targetEnemy) {
      // Bump = attack
      this.attackAdjacent(targetEnemy);
      this.endPlayerTurn();
      return;
    }
    this.player.c = nc; this.player.r = nr;
    this.player.defendingNext = false;
    // pickup item
    const item = this.itemAt(nc, nr);
    if (item) this.applyItem(item);
    // stairs?
    if (idx(nc, nr) === this.stairs) {
      this.endPlayerTurn(true); // process enemy first? no — stepping on stairs ends floor immediately
      return;
    }
    this.endPlayerTurn();
  }

  attackAction() {
    if (this.state !== 'play') return;
    const dirs = [[0,-1],[0,1],[-1,0],[1,0]];
    let target = null;
    for (const [dc, dr] of dirs) {
      const e = this.enemyAt(this.player.c + dc, this.player.r + dr);
      if (e) { target = e; break; }
    }
    if (!target) {
      this.pushLog(I18n.t('dg.log.attackNoTarget'));
      this.renderAll();
      return;
    }
    this.attackAdjacent(target);
    this.endPlayerTurn();
  }

  adjacentEnemies() {
    const dirs = [[0,-1],[0,1],[-1,0],[1,0]];
    const list = [];
    for (const [dc, dr] of dirs) {
      const e = this.enemyAt(this.player.c + dc, this.player.r + dr);
      if (e) list.push(e);
    }
    return list;
  }

  attackAdjacent(target) {
    const dmg = Math.max(1, this.player.atk + this.player.weaponAtk - target.def);
    target.hp -= dmg;
    this.maxDamage = Math.max(this.maxDamage, dmg);
    this.pushLog(I18n.t('dg.log.attack')
      .replace('{enemy}', I18n.t('dg.enemy.' + target.type))
      .replace('{dmg}', String(dmg)));
    if (target.hp <= 0) this.killEnemy(target);
  }

  magicAction() {
    if (this.state !== 'play') return;
    if (this.player.mp < 4) {
      this.pushLog(I18n.t('dg.log.magicNoMp'));
      this.renderAll();
      return;
    }
    const targets = this.adjacentEnemies();
    if (targets.length === 0) {
      this.pushLog(I18n.t('dg.log.attackNoTarget'));
      this.renderAll();
      return;
    }
    this.player.mp -= 4;
    const dmg = Math.max(1, Math.round((this.player.atk + this.player.weaponAtk) * 1.5));
    // AoE: hit every cardinally-adjacent enemy. Defense still applies per target.
    for (const target of targets) {
      const applied = Math.max(1, dmg - Math.floor(target.def / 2));
      target.hp -= applied;
      this.maxDamage = Math.max(this.maxDamage, applied);
      this.pushLog(I18n.t('dg.log.magic')
        .replace('{enemy}', I18n.t('dg.enemy.' + target.type))
        .replace('{dmg}', String(applied)));
      if (target.hp <= 0) this.killEnemy(target);
    }
    this.endPlayerTurn();
  }

  defendAction() {
    if (this.state !== 'play') return;
    this.player.defendingNext = true;
    this.pushLog(I18n.t('dg.log.defend'));
    this.endPlayerTurn();
  }

  waitAction() {
    if (this.state !== 'play') return;
    this.player.defendingNext = false;
    this.pushLog(I18n.t('dg.log.wait'));
    this.endPlayerTurn();
  }

  killEnemy(target) {
    target.hp = 0;
    this.enemies = this.enemies.filter(e => e !== target);
    const base = ENEMY_BASE[target.type];
    const exp = base.exp;
    this.player.exp += exp;
    this.pushLog(I18n.t('dg.log.kill')
      .replace('{enemy}', I18n.t('dg.enemy.' + target.type))
      .replace('{exp}', String(exp)));
    const needed = 10 * this.player.lv;
    if (this.player.exp >= needed) {
      this.player.exp -= needed;
      this.player.lv++;
      this.player.maxHp += 5; this.player.hp = this.player.maxHp;
      this.player.maxMp += 2; this.player.mp = this.player.maxMp;
      this.player.atk += 1;
      this.pushLog(I18n.t('dg.log.levelUp'));
    }
  }

  applyItem(item) {
    if (item.kind === 'hp') {
      this.player.hp = Math.min(this.player.maxHp, this.player.hp + item.value);
      this.pushLog(I18n.t('dg.log.item.hp').replace('{v}', String(item.value)));
    } else if (item.kind === 'mp') {
      this.player.mp = Math.min(this.player.maxMp, this.player.mp + item.value);
      this.pushLog(I18n.t('dg.log.item.mp').replace('{v}', String(item.value)));
    } else if (item.kind === 'wpn') {
      if (item.value > this.player.weaponAtk) {
        this.player.weaponAtk = item.value;
        this.pushLog(I18n.t('dg.log.item.wpn').replace('{v}', String(item.value)));
      }
    } else if (item.kind === 'arm') {
      if (item.value > this.player.armorDef) {
        this.player.armorDef = item.value;
        this.pushLog(I18n.t('dg.log.item.arm').replace('{v}', String(item.value)));
      }
    }
    this.items = this.items.filter(i => i !== item);
  }

  endPlayerTurn(steppedStairs) {
    this.turn++;
    if (steppedStairs) {
      this.nextFloor(false);
      return;
    }
    // Enemy turn — iterate over a snapshot since enemies may be killed mid-loop
    // by chain reactions; we don't actually have those, but it's defensive.
    const snapshot = this.enemies.slice();
    for (const e of snapshot) {
      if (e.hp <= 0) continue;
      this.enemyTurn(e);
      if (this.state !== 'play') return;
    }
    this.revealFog();
    this.renderAll();
    this.saveState();
  }

  enemyTurn(e) {
    const dr = Math.sign(this.player.r - e.r);
    const dc = Math.sign(this.player.c - e.c);
    if (this.isCardinalAdjacent(e.c, e.r, this.player.c, this.player.r)) {
      let dmg = Math.max(1, e.atk - this.player.def - this.player.armorDef);
      if (this.player.defendingNext) dmg = Math.max(1, Math.ceil(dmg / 2));
      this.player.hp -= dmg;
      this.pushLog(I18n.t('dg.log.enemyAttack')
        .replace('{enemy}', I18n.t('dg.enemy.' + e.type))
        .replace('{dmg}', String(dmg)));
      if (this.player.hp <= 0) {
        this.player.hp = 0;
        this.gameOver(false);
      }
      return;
    }
    // Move toward player (pick axis randomly when both differ)
    const tries = (Math.random() < 0.5) ? [[dc, 0], [0, dr]] : [[0, dr], [dc, 0]];
    for (const [mc, mr] of tries) {
      if (mc === 0 && mr === 0) continue;
      const nc = e.c + mc, nr = e.r + mr;
      if (nc < 0 || nc >= GRID || nr < 0 || nr >= GRID) continue;
      if (this.enemyAt(nc, nr)) continue;
      if (nc === this.player.c && nr === this.player.r) continue;
      e.c = nc; e.r = nr;
      return;
    }
  }

  pushLog(text) {
    this.log.unshift(text);
    if (this.log.length > 4) this.log.pop();
  }

  renderAll() {
    this.renderGrid();
    this.renderStats();
    this.renderLog();
  }

  renderGrid() {
    this.gridEl.innerHTML = '';
    for (let r = 0; r < GRID; r++) {
      for (let c = 0; c < GRID; c++) {
        const cell = document.createElement('div');
        cell.className = 'dg-cell';
        if (this.fog[idx(c, r)]) {
          cell.classList.add('fog');
          this.gridEl.appendChild(cell);
          continue;
        }
        cell.classList.add('visible');
        if (this.player.c === c && this.player.r === r) {
          cell.classList.add('player');
          cell.textContent = '🧙';
        } else if (idx(c, r) === this.stairs) {
          cell.classList.add('stairs');
          cell.textContent = '⬇️';
        } else {
          const e = this.enemyAt(c, r);
          if (e) {
            cell.classList.add('enemy');
            cell.textContent = ENEMY_BASE[e.type].emoji;
          } else {
            const it = this.itemAt(c, r);
            if (it) {
              cell.classList.add('item');
              cell.textContent = it.kind === 'hp' ? '🧪' : it.kind === 'mp' ? '💧' : it.kind === 'wpn' ? '⚔️' : '🛡️';
            }
          }
        }
        this.gridEl.appendChild(cell);
      }
    }
  }

  renderStats() {
    document.getElementById('dg-floor').textContent = String(this.floor);
    document.getElementById('dg-hp').textContent = `${this.player.hp}/${this.player.maxHp}`;
    document.getElementById('dg-mp').textContent = `${this.player.mp}/${this.player.maxMp}`;
    document.getElementById('dg-lv').textContent = String(this.player.lv);
    document.getElementById('dg-exp').textContent = String(this.player.exp);
    document.getElementById('dg-gear').textContent = `⚔️${this.player.weaponAtk} 🛡️${this.player.armorDef}`;
  }

  renderLog() {
    this.logEl.innerHTML = '';
    for (const l of this.log) {
      const d = document.createElement('div');
      d.className = 'dg-log-line';
      d.textContent = l;
      this.logEl.appendChild(d);
    }
  }

  gameOver(won) {
    if (this.state !== 'play') return;
    this.state = won ? 'cleared' : 'gameover';
    this.pushLog(I18n.t(won ? 'dg.log.clear' : 'dg.log.gameover'));
    const bestFloor = parseInt(localStorage.getItem('dungeon-best-floor'), 10) || 0;
    if (this.floor > bestFloor) localStorage.setItem('dungeon-best-floor', String(this.floor));
    const bestDmg = parseInt(localStorage.getItem('dungeon-best-damage'), 10) || 0;
    if (this.maxDamage > bestDmg) localStorage.setItem('dungeon-best-damage', String(this.maxDamage));
    if (won) {
      const bestTurns = parseInt(localStorage.getItem('dungeon-best-turns'), 10) || Infinity;
      if (this.turn < bestTurns) localStorage.setItem('dungeon-best-turns', String(this.turn));
    }
    this.endTitleEl.textContent = I18n.t(won ? 'dg.win' : 'dg.lose');
    this.endBodyEl.textContent = I18n.t('dg.results')
      .replace('{floor}', String(this.floor))
      .replace('{turns}', String(this.turn))
      .replace('{dmg}', String(this.maxDamage));
    this.endEl.classList.remove('hidden');
    this.renderAll();
  }

  saveState() {
    // Lightweight autosave (skip on terminal states)
    if (this.state !== 'play') return;
    try {
      localStorage.setItem('dungeon-state', JSON.stringify({
        floor: this.floor, turn: this.turn, maxDamage: this.maxDamage,
        player: this.player, enemies: this.enemies, items: this.items,
        stairs: this.stairs, fog: this.fog
      }));
    } catch (e) {}
  }

  showToast(text) {
    if (!this.toastEl) return;
    this.toastEl.textContent = text;
    this.toastEl.classList.add('toast-visible');
    clearTimeout(this._toastT);
    this._toastT = setTimeout(() => this.toastEl.classList.remove('toast-visible'), 1200);
  }

  markDownloaded() {
    this.downloadBtn.setAttribute('data-i18n', 'dg.downloaded');
    this.downloadBtn.textContent = I18n.t('dg.downloaded');
    this.downloadBtn.disabled = true;
  }

  async handleDownload() {
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    if (isIOS && !this.isStandaloneMode()) {
      this.iosDialog.classList.remove('hidden');
      return;
    }
    if (!('caches' in window)) {
      alert(I18n.t('dg.unsupported'));
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
        const msg = I18n.t('dg.saveOk').replace('{n}', ok).replace('{total}', files.length);
        alert(msg);
      } else {
        throw new Error('failed');
      }
    } catch (e) {
      alert(I18n.t('dg.failed'));
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

document.addEventListener('DOMContentLoaded', () => new DungeonGame());
