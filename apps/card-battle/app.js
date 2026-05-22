/**
 * Card Battle — deck-building duel against AI across 5 stages.
 *
 * NOTE: handleDownload() includes ../../i18n.js and ../../style.css.
 */
const CB_I18N = {
  ja: {
    common: { backHome: '← トップへ' },
    cb: {
      title: '🎴 カードバトル',
      subtitle: 'デッキを組んで AI と対戦',
      tabBattle: '対戦',
      tabDeck: 'デッキ編集',
      hp: 'HP:', cards: '手札:',
      stage: 'ステージ:',
      endTurn: 'ターン終了',
      deckTip: '山札',
      discardTip: '捨て札',
      deckEditor: '8 枚のカードを選んでください',
      selected: '選択:',
      save: '保存',
      resetDeck: 'デフォルト',
      next: '次へ',
      download: '📥 オフライン用にダウンロード',
      downloaded: '✅ オフラインで利用可能',
      downloadHint: 'このゲームを保存してオフラインで遊べます',
      downloading: 'ダウンロード中…',
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
      win: '🏆 勝利！',
      lose: '💀 敗北…',
      clear: '🎉 全ステージ制覇！',
      results: 'ステージ {stage} / ターン {turns} / 連勝 {streak}',
      mustEight: 'デッキは 8 枚にしてください',
      deckSaved: 'デッキを保存しました',
      toast: { noEnergy: 'エネルギー不足', notYourTurn: 'プレイヤーターンではありません' },
      card: {
        strike: { name: '打撃', desc: '6 ダメージ' },
        slash: { name: '斬撃', desc: '10 ダメージ' },
        heavy: { name: '重撃', desc: '15 ダメージ' },
        shield: { name: '盾', desc: '1 ターン {v} 軽減' },
        bigshield: { name: '大盾', desc: '1 ターン {v} 軽減' },
        heal: { name: '回復', desc: 'HP +{v}' },
        bigheal: { name: '大回復', desc: 'HP +{v}' },
        buff: { name: '強化', desc: '次の攻撃 +{v}' },
        bigbuff: { name: '集中', desc: '次の攻撃 +{v}' },
        flurry: { name: '連撃', desc: '{v} ダメージ × {hits}' },
        triple: { name: '三連撃', desc: '{v} ダメージ × {hits}' },
        fireball: { name: '火球', desc: '12 ダメージ' },
        ice: { name: '氷塊', desc: '8 ダメージ + 自分 HP+3' },
        focus: { name: '集中', desc: '次の攻撃 +5' },
        guard: { name: '見張り', desc: '1 ターン 6 軽減' },
        regen: { name: '再生', desc: 'HP +6' },
        burst: { name: '爆発', desc: '20 ダメージ' },
        finisher: { name: 'とどめ', desc: '20 ダメージ' },
        windcut: { name: '風斬', desc: '8 ダメージ × 2' },
        venom: { name: '毒爪', desc: '5 ダメージ × 3' },
        rush: { name: '突撃', desc: '14 ダメージ' }
      },
      log: {
        play: '{actor}: {card}',
        atk: '→ {target} に {dmg} ダメージ',
        heal: '{actor} HP +{v}',
        shield: '{actor} 盾 +{v}',
        buff: '{actor} 強化 +{v}',
        endTurn: '— {actor} ターン終了 —',
        startTurn: '— {actor} ターン開始 —',
        defeated: '{actor} は倒れた'
      },
      actor: { you: 'あなた', enemy: '敵' }
    }
  },
  en: {
    common: { backHome: '← Home' },
    cb: {
      title: '🎴 Card Battle',
      subtitle: 'Build a deck and duel the AI',
      tabBattle: 'Battle',
      tabDeck: 'Deck Editor',
      hp: 'HP:', cards: 'Cards:',
      stage: 'Stage:',
      endTurn: 'End Turn',
      deckTip: 'Deck',
      discardTip: 'Discard',
      deckEditor: 'Pick 8 cards for your deck.',
      selected: 'Selected:',
      save: 'Save',
      resetDeck: 'Default',
      next: 'Next',
      download: '📥 Download for Offline',
      downloaded: '✅ Downloaded for Offline',
      downloadHint: 'Save this game to play offline',
      downloading: 'Downloading…',
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
      win: '🏆 Victory!',
      lose: '💀 Defeat…',
      clear: '🎉 All stages cleared!',
      results: 'Stage {stage} / Turns {turns} / Streak {streak}',
      mustEight: 'Deck must have exactly 8 cards',
      deckSaved: 'Deck saved',
      toast: { noEnergy: 'Not enough energy', notYourTurn: "Not your turn" },
      card: {
        strike: { name: 'Strike', desc: '6 damage' },
        slash: { name: 'Slash', desc: '10 damage' },
        heavy: { name: 'Smash', desc: '15 damage' },
        shield: { name: 'Shield', desc: 'Block {v} for 1 turn' },
        bigshield: { name: 'Bulwark', desc: 'Block {v} for 1 turn' },
        heal: { name: 'Heal', desc: 'HP +{v}' },
        bigheal: { name: 'Restore', desc: 'HP +{v}' },
        buff: { name: 'Empower', desc: 'Next atk +{v}' },
        bigbuff: { name: 'Focus', desc: 'Next atk +{v}' },
        flurry: { name: 'Flurry', desc: '{v} dmg × {hits}' },
        triple: { name: 'Triple', desc: '{v} dmg × {hits}' },
        fireball: { name: 'Fireball', desc: '12 damage' },
        ice: { name: 'Ice Shard', desc: '8 dmg + HP+3' },
        focus: { name: 'Focus', desc: 'Next atk +5' },
        guard: { name: 'Guard', desc: 'Block 6 for 1 turn' },
        regen: { name: 'Regen', desc: 'HP +6' },
        burst: { name: 'Burst', desc: '20 damage' },
        finisher: { name: 'Finisher', desc: '20 damage' },
        windcut: { name: 'Wind Cut', desc: '8 dmg × 2' },
        venom: { name: 'Venom', desc: '5 dmg × 3' },
        rush: { name: 'Rush', desc: '14 damage' }
      },
      log: {
        play: '{actor}: {card}',
        atk: '→ {target} takes {dmg}',
        heal: '{actor} HP +{v}',
        shield: '{actor} shield +{v}',
        buff: '{actor} empower +{v}',
        endTurn: '— {actor} ends turn —',
        startTurn: '— {actor} turn starts —',
        defeated: '{actor} fell'
      },
      actor: { you: 'You', enemy: 'Enemy' }
    }
  }
};

// id → cost, kind, value/hits/etc, icon, default? (in starter deck)
const CARD_POOL = [
  { id: 'strike',    cost: 1, kind: 'atk',    value: 6,             icon: '🗡️', starter: true,  unlock: 0 },
  { id: 'slash',     cost: 2, kind: 'atk',    value: 10,            icon: '⚔️', starter: true,  unlock: 0 },
  { id: 'heavy',     cost: 3, kind: 'atk',    value: 15,            icon: '🔨', starter: false, unlock: 0 },
  { id: 'shield',    cost: 1, kind: 'shield', value: 4,             icon: '🛡️', starter: true,  unlock: 0 },
  { id: 'bigshield', cost: 3, kind: 'shield', value: 9,             icon: '🛡️', starter: false, unlock: 0 },
  { id: 'heal',      cost: 2, kind: 'heal',   value: 4,             icon: '🧪', starter: true,  unlock: 0 },
  { id: 'bigheal',   cost: 4, kind: 'heal',   value: 9,             icon: '🍶', starter: false, unlock: 2 },
  { id: 'buff',      cost: 1, kind: 'buff',   value: 3,             icon: '💪', starter: true,  unlock: 0 },
  { id: 'bigbuff',   cost: 2, kind: 'buff',   value: 6,             icon: '🔥', starter: false, unlock: 3 },
  { id: 'flurry',    cost: 1, kind: 'multi',  value: 3, hits: 2,    icon: '🌀', starter: true,  unlock: 0 },
  { id: 'triple',    cost: 2, kind: 'multi',  value: 4, hits: 3,    icon: '🌪️', starter: false, unlock: 1 },
  { id: 'fireball',  cost: 3, kind: 'atk',    value: 12,            icon: '🔥', starter: true,  unlock: 0 },
  { id: 'ice',       cost: 2, kind: 'iceatk', value: 8,             icon: '❄️', starter: false, unlock: 1 },
  { id: 'focus',     cost: 1, kind: 'buff',   value: 5,             icon: '✨', starter: false, unlock: 2 },
  { id: 'guard',     cost: 2, kind: 'shield', value: 6,             icon: '🪨', starter: false, unlock: 0 },
  { id: 'regen',     cost: 2, kind: 'heal',   value: 6,             icon: '🌿', starter: false, unlock: 4 },
  { id: 'burst',     cost: 4, kind: 'atk',    value: 20,            icon: '💥', starter: false, unlock: 3 },
  { id: 'finisher',  cost: 3, kind: 'atk',    value: 20,            icon: '🌟', starter: false, unlock: 5 },
  { id: 'windcut',   cost: 2, kind: 'multi',  value: 8, hits: 2,    icon: '🌬️', starter: false, unlock: 4 },
  { id: 'venom',     cost: 2, kind: 'multi',  value: 5, hits: 3,    icon: '🐍', starter: false, unlock: 5 },
  { id: 'rush',      cost: 3, kind: 'atk',    value: 14,            icon: '🐎', starter: true,  unlock: 0 },
];

const HAND_LIMIT = 5;
const MAX_ENERGY = 10;
const PLAYER_MAX_HP = 20;
const ENEMY_BASE_HP = 20;
const STAGES = 5;

function findCard(id) { return CARD_POOL.find(c => c.id === id); }
function shuffleArr(a) {
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const t = a[i]; a[i] = a[j]; a[j] = t;
  }
  return a;
}

class CardBattle {
  constructor() {
    this.appName = 'card-battle';
    I18n.register(CB_I18N);
    I18n.apply();
    I18n.mountToggle(document.getElementById('lang-toggle'));
    window.addEventListener('i18nchange', () => {
      I18n.apply();
      this.renderAll();
    });

    this.toastEl = document.getElementById('cb-toast');
    this.handEl = document.getElementById('cb-hand');
    this.logEl = document.getElementById('cb-log');
    this.endDialog = document.getElementById('cb-end-dialog');
    this.endTitleEl = document.getElementById('cb-end-title');
    this.endBodyEl = document.getElementById('cb-end-body');
    this.downloadBtn = document.getElementById('download-btn');
    this.downloadDialog = document.getElementById('download-dialog');
    this.iosDialog = document.getElementById('ios-dialog');

    this.battleEl = document.getElementById('cb-battle');
    this.deckEl = document.getElementById('cb-deck-section');
    this.deckGridEl = document.getElementById('cb-deck-grid');
    this.deckCountEl = document.getElementById('cb-deck-count');

    this.bind();

    this.unlocks = this.loadUnlocks();
    this.deckIds = this.loadDeck();
    this.stage = parseInt(localStorage.getItem('cb-stage'), 10) || 1;
    this.streak = parseInt(localStorage.getItem('cb-best-streak'), 10) || 0;
    this.log = [];
    this.startBattle();

    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('../../sw.js').catch(() => {});
    }
    this.checkOfflineInstallation();
  }

  bind() {
    document.getElementById('cb-end').addEventListener('click', () => this.endPlayerTurn());
    document.getElementById('cb-view-battle').addEventListener('click', () => this.switchView('battle'));
    document.getElementById('cb-view-deck').addEventListener('click', () => this.switchView('deck'));
    document.getElementById('cb-deck-save').addEventListener('click', () => this.saveDeck());
    document.getElementById('cb-deck-reset').addEventListener('click', () => {
      this.editingDeck = CARD_POOL.filter(c => c.starter).map(c => c.id);
      this.renderDeckEditor();
    });
    document.getElementById('cb-end-next').addEventListener('click', () => {
      this.endDialog.classList.add('hidden');
      this.startBattle();
    });
    document.getElementById('ios-close-btn').addEventListener('click', () => {
      this.iosDialog.classList.add('hidden');
    });
    this.downloadBtn.addEventListener('click', () => this.handleDownload());
  }

  switchView(view) {
    const tabB = document.getElementById('cb-view-battle');
    const tabD = document.getElementById('cb-view-deck');
    if (view === 'battle') {
      tabB.classList.add('cb-tab-active'); tabD.classList.remove('cb-tab-active');
      this.battleEl.classList.remove('hidden');
      this.deckEl.classList.add('hidden');
    } else {
      tabD.classList.add('cb-tab-active'); tabB.classList.remove('cb-tab-active');
      this.battleEl.classList.add('hidden');
      this.deckEl.classList.remove('hidden');
      this.editingDeck = this.deckIds.slice();
      this.renderDeckEditor();
    }
  }

  loadUnlocks() {
    try {
      const raw = localStorage.getItem('cb-unlocks');
      if (raw) return JSON.parse(raw);
    } catch (e) {}
    // Starter cards always usable
    return CARD_POOL.filter(c => c.starter).map(c => c.id);
  }

  loadDeck() {
    try {
      const raw = localStorage.getItem('cb-deck');
      if (raw) {
        const arr = JSON.parse(raw);
        if (Array.isArray(arr) && arr.length === 8 && arr.every(id => findCard(id))) return arr;
      }
    } catch (e) {}
    const starters = CARD_POOL.filter(c => c.starter).map(c => c.id);
    return starters.slice(0, 8);
  }

  saveDeck() {
    if (!this.editingDeck || this.editingDeck.length !== 8) {
      this.showToast(I18n.t('cb.mustEight'));
      return;
    }
    this.deckIds = this.editingDeck.slice();
    localStorage.setItem('cb-deck', JSON.stringify(this.deckIds));
    this.showToast(I18n.t('cb.deckSaved'));
    this.switchView('battle');
    this.startBattle();
  }

  startBattle() {
    if (this.stage > STAGES) {
      // Already cleared, start over
      this.stage = 1;
      localStorage.setItem('cb-stage', '1');
    }
    const enemyHp = ENEMY_BASE_HP + (this.stage - 1) * 6;
    this.player = {
      hp: PLAYER_MAX_HP, maxHp: PLAYER_MAX_HP,
      energy: 1, maxEnergy: 1,
      shield: 0, buff: 0,
      deck: shuffleArr(this.deckIds.slice()),
      hand: [], discard: []
    };
    // Enemy starter deck composes attacks + a heal.
    // maxEnergy starts at 0 so the +1 at the start of enemy's first turn brings
    // both players to 1 energy on turn 1.
    const enemyDeckTemplate = ['strike', 'strike', 'slash', 'shield', 'heal', 'buff', 'flurry', 'rush'];
    this.enemy = {
      hp: enemyHp, maxHp: enemyHp,
      energy: 0, maxEnergy: 0,
      shield: 0, buff: 0,
      deck: shuffleArr(enemyDeckTemplate.slice()),
      hand: [], discard: []
    };
    this.turn = 'player';
    this.turnCount = 1;
    this.state = 'fight';
    this.log = [];
    this.draw(this.player, 5);
    this.draw(this.enemy, 5);
    this.pushLog(I18n.t('cb.log.startTurn').replace('{actor}', I18n.t('cb.actor.you')));
    this.renderAll();
  }

  draw(p, n) {
    for (let i = 0; i < n; i++) {
      if (p.hand.length >= HAND_LIMIT) return;
      if (p.deck.length === 0) {
        if (p.discard.length === 0) return;
        p.deck = shuffleArr(p.discard);
        p.discard = [];
      }
      p.hand.push(p.deck.pop());
    }
  }

  playCard(handIdx) {
    if (this.turn !== 'player' || this.state !== 'fight') return;
    const id = this.player.hand[handIdx];
    if (!id) return;
    const card = findCard(id);
    if (!card) return;
    if (this.player.energy < card.cost) {
      this.showToast(I18n.t('cb.toast.noEnergy'));
      return;
    }
    this.player.energy -= card.cost;
    this.player.hand.splice(handIdx, 1);
    this.player.discard.push(id);
    this.applyCard(card, this.player, this.enemy, 'you');
    this.renderAll();
    if (this.enemy.hp <= 0) { this.battleEnd(true); return; }
  }

  applyCard(card, self, opp, actorKey) {
    const actor = I18n.t('cb.actor.' + actorKey);
    const target = actorKey === 'you' ? I18n.t('cb.actor.enemy') : I18n.t('cb.actor.you');
    const nameKey = `cb.card.${card.id}.name`;
    let nameTr = I18n.t(nameKey);
    if (nameTr === nameKey) nameTr = card.id;
    this.pushLog(I18n.t('cb.log.play').replace('{actor}', actor).replace('{card}', nameTr));

    if (card.kind === 'atk') {
      const total = (card.value || 0) + (self.buff || 0);
      self.buff = 0;
      this.dealDamage(opp, total, target);
    } else if (card.kind === 'multi') {
      // Buff applies to every hit of the multi card, then is consumed.
      const buffBonus = self.buff || 0;
      self.buff = 0;
      for (let h = 0; h < card.hits; h++) {
        if (opp.hp <= 0) break;
        this.dealDamage(opp, (card.value || 0) + buffBonus, target);
      }
    } else if (card.kind === 'shield') {
      self.shield = (self.shield || 0) + (card.value || 0);
      this.pushLog(I18n.t('cb.log.shield').replace('{actor}', actor).replace('{v}', String(card.value)));
    } else if (card.kind === 'heal') {
      const before = self.hp;
      self.hp = Math.min(self.maxHp, self.hp + (card.value || 0));
      this.pushLog(I18n.t('cb.log.heal').replace('{actor}', actor).replace('{v}', String(self.hp - before)));
    } else if (card.kind === 'buff') {
      self.buff = (self.buff || 0) + (card.value || 0);
      this.pushLog(I18n.t('cb.log.buff').replace('{actor}', actor).replace('{v}', String(card.value)));
    } else if (card.kind === 'iceatk') {
      const total = (card.value || 0) + (self.buff || 0);
      self.buff = 0;
      this.dealDamage(opp, total, target);
      self.hp = Math.min(self.maxHp, self.hp + 3);
      this.pushLog(I18n.t('cb.log.heal').replace('{actor}', actor).replace('{v}', '3'));
    }
  }

  dealDamage(target, dmg, targetName) {
    let remaining = dmg;
    if (target.shield > 0) {
      const absorb = Math.min(target.shield, remaining);
      target.shield -= absorb;
      remaining -= absorb;
    }
    if (remaining > 0) target.hp = Math.max(0, target.hp - remaining);
    this.pushLog(I18n.t('cb.log.atk').replace('{target}', targetName).replace('{dmg}', String(dmg)));
  }

  endPlayerTurn() {
    if (this.turn !== 'player' || this.state !== 'fight') return;
    this.pushLog(I18n.t('cb.log.endTurn').replace('{actor}', I18n.t('cb.actor.you')));
    this.player.shield = 0; // shield only lasts one turn
    this.turn = 'enemy';
    this.renderAll();
    setTimeout(() => this.runEnemyTurn(), 350);
  }

  runEnemyTurn() {
    if (this.state !== 'fight') return;
    this.pushLog(I18n.t('cb.log.startTurn').replace('{actor}', I18n.t('cb.actor.enemy')));
    this.enemy.maxEnergy = Math.min(MAX_ENERGY, this.enemy.maxEnergy + 1);
    this.enemy.energy = this.enemy.maxEnergy;
    this.draw(this.enemy, 1);

    let safety = 10;
    while (safety-- > 0) {
      const decision = this.enemyDecide();
      if (!decision) break;
      const card = findCard(this.enemy.hand[decision.idx]);
      this.enemy.energy -= card.cost;
      this.enemy.hand.splice(decision.idx, 1);
      this.enemy.discard.push(card.id);
      this.applyCard(card, this.enemy, this.player, 'enemy');
      this.renderAll();
      if (this.player.hp <= 0) { this.battleEnd(false); return; }
      if (this.enemy.hp <= 0) { this.battleEnd(true); return; }
    }

    // End enemy turn
    this.pushLog(I18n.t('cb.log.endTurn').replace('{actor}', I18n.t('cb.actor.enemy')));
    this.enemy.shield = 0;
    this.turn = 'player';
    this.turnCount++;
    this.player.maxEnergy = Math.min(MAX_ENERGY, this.player.maxEnergy + 1);
    this.player.energy = this.player.maxEnergy;
    this.draw(this.player, 1);
    this.pushLog(I18n.t('cb.log.startTurn').replace('{actor}', I18n.t('cb.actor.you')));
    this.renderAll();
  }

  enemyDecide() {
    const hand = this.enemy.hand;
    const available = hand
      .map((id, idx) => ({ idx, card: findCard(id) }))
      .filter(x => x.card && this.enemy.energy >= x.card.cost);
    if (available.length === 0) return null;
    const hpRatio = this.enemy.hp / this.enemy.maxHp;
    // Heal preference
    if (hpRatio < 0.4) {
      const heal = available.find(x => x.card.kind === 'heal');
      if (heal) return heal;
    }
    // If has buff, then attack next
    if (this.enemy.buff > 0) {
      const atk = available.find(x => x.card.kind === 'atk' || x.card.kind === 'multi' || x.card.kind === 'iceatk');
      if (atk) return atk;
    }
    // Save buff for next turn maybe — but for simplicity, play buff early
    const buff = available.find(x => x.card.kind === 'buff');
    if (buff && this.enemy.energy >= 2) return buff;
    // Biggest attack
    const atks = available.filter(x => x.card.kind === 'atk' || x.card.kind === 'multi' || x.card.kind === 'iceatk');
    if (atks.length) {
      atks.sort((a, b) => (b.card.value * (b.card.hits || 1)) - (a.card.value * (a.card.hits || 1)));
      return atks[0];
    }
    // Shield if available
    const sh = available.find(x => x.card.kind === 'shield');
    if (sh) return sh;
    return available[0];
  }

  battleEnd(won) {
    if (this.state !== 'fight') return;
    this.state = won ? 'win' : 'lose';
    this.pushLog(I18n.t(won ? 'cb.win' : 'cb.lose'));
    if (won) {
      this.streak++;
      localStorage.setItem('cb-best-streak', String(Math.max(this.streak, parseInt(localStorage.getItem('cb-best-streak'), 10) || 0)));
      const bestTurns = parseInt(localStorage.getItem('cb-best-turns'), 10) || Infinity;
      if (this.turnCount < bestTurns) localStorage.setItem('cb-best-turns', String(this.turnCount));
      // unlock cards for this stage
      const newly = CARD_POOL.filter(c => c.unlock === this.stage && !this.unlocks.includes(c.id));
      if (newly.length) {
        for (const c of newly) this.unlocks.push(c.id);
        localStorage.setItem('cb-unlocks', JSON.stringify(this.unlocks));
      }
      this.stage++;
      if (this.stage > STAGES) {
        this.endTitleEl.textContent = I18n.t('cb.clear');
        this.stage = 1;
      } else {
        this.endTitleEl.textContent = I18n.t('cb.win');
      }
      localStorage.setItem('cb-stage', String(this.stage));
    } else {
      this.streak = 0;
      this.endTitleEl.textContent = I18n.t('cb.lose');
    }
    this.endBodyEl.textContent = I18n.t('cb.results')
      .replace('{stage}', String(this.stage))
      .replace('{turns}', String(this.turnCount))
      .replace('{streak}', String(this.streak));
    this.endDialog.classList.remove('hidden');
    this.renderAll();
  }

  pushLog(text) {
    this.log.unshift(text);
    if (this.log.length > 6) this.log.pop();
  }

  renderAll() {
    this.renderStatus();
    this.renderHand();
    this.renderLog();
    document.getElementById('cb-stage').textContent = String(this.stage);
    document.getElementById('cb-deck-n').textContent = String(this.player ? this.player.deck.length : 0);
    document.getElementById('cb-discard-n').textContent = String(this.player ? this.player.discard.length : 0);
  }

  renderStatus() {
    if (!this.player) return;
    document.getElementById('cb-player-hp').textContent = String(this.player.hp);
    document.getElementById('cb-player-maxhp').textContent = String(this.player.maxHp);
    document.getElementById('cb-player-shield').textContent = String(this.player.shield);
    document.getElementById('cb-player-energy').textContent = String(this.player.energy);
    document.getElementById('cb-player-maxenergy').textContent = String(this.player.maxEnergy);
    document.getElementById('cb-player-buff').textContent = String(this.player.buff);
    document.getElementById('cb-enemy-hp').textContent = String(this.enemy.hp);
    document.getElementById('cb-enemy-maxhp').textContent = String(this.enemy.maxHp);
    document.getElementById('cb-enemy-shield').textContent = String(this.enemy.shield);
    document.getElementById('cb-enemy-energy').textContent = String(this.enemy.energy);
    document.getElementById('cb-enemy-cards').textContent = String(this.enemy.hand.length);
  }

  renderHand() {
    this.handEl.innerHTML = '';
    if (!this.player) return;
    this.player.hand.forEach((id, idx) => {
      const card = findCard(id);
      if (!card) return;
      const el = document.createElement('button');
      el.className = `cb-card ${card.kind === 'iceatk' ? 'atk' : card.kind}`;
      if (this.turn !== 'player' || this.player.energy < card.cost || this.state !== 'fight') {
        el.classList.add('unplayable');
      }
      const cost = document.createElement('div');
      cost.className = 'cb-card-cost';
      cost.textContent = String(card.cost);
      const icon = document.createElement('div');
      icon.className = 'cb-card-icon';
      icon.textContent = card.icon;
      const name = document.createElement('div');
      name.className = 'cb-card-name';
      const nameKey = `cb.card.${card.id}.name`;
      let nameTr = I18n.t(nameKey);
      if (nameTr === nameKey) nameTr = card.id;
      name.textContent = nameTr;
      const desc = document.createElement('div');
      desc.className = 'cb-card-desc';
      const descKey = `cb.card.${card.id}.desc`;
      let descTr = I18n.t(descKey);
      if (descTr === descKey) descTr = '';
      desc.textContent = descTr.replace('{v}', String(card.value)).replace('{hits}', String(card.hits || 1));
      el.appendChild(cost);
      el.appendChild(icon);
      el.appendChild(name);
      el.appendChild(desc);
      el.addEventListener('click', () => this.playCard(idx));
      this.handEl.appendChild(el);
    });
  }

  renderLog() {
    this.logEl.innerHTML = '';
    for (const l of this.log) {
      const d = document.createElement('div');
      d.className = 'cb-log-line';
      d.textContent = l;
      this.logEl.appendChild(d);
    }
  }

  renderDeckEditor() {
    this.deckGridEl.innerHTML = '';
    const selectedSet = new Set(this.editingDeck);
    this.deckCountEl.textContent = String(this.editingDeck.length);

    CARD_POOL.forEach(card => {
      const el = document.createElement('div');
      el.className = 'cb-deck-card';
      const isUnlocked = card.starter || this.unlocks.includes(card.id);
      if (!isUnlocked) el.classList.add('locked');
      if (selectedSet.has(card.id)) el.classList.add('selected');
      const head = document.createElement('div');
      head.className = 'cb-deck-card-head';
      const cost = document.createElement('span');
      cost.className = 'cb-deck-card-cost';
      cost.textContent = String(card.cost);
      const name = document.createElement('span');
      name.className = 'cb-deck-card-name';
      const nameKey = `cb.card.${card.id}.name`;
      let nameTr = I18n.t(nameKey);
      if (nameTr === nameKey) nameTr = card.id;
      name.textContent = `${card.icon} ${nameTr}`;
      head.appendChild(cost); head.appendChild(name);
      const desc = document.createElement('div');
      desc.className = 'cb-deck-card-desc';
      const descKey = `cb.card.${card.id}.desc`;
      let descTr = I18n.t(descKey);
      if (descTr === descKey) descTr = '';
      desc.textContent = descTr.replace('{v}', String(card.value)).replace('{hits}', String(card.hits || 1));
      el.appendChild(head); el.appendChild(desc);

      if (isUnlocked) {
        el.addEventListener('click', () => {
          if (selectedSet.has(card.id)) {
            this.editingDeck.splice(this.editingDeck.indexOf(card.id), 1);
          } else {
            if (this.editingDeck.length >= 8) return;
            this.editingDeck.push(card.id);
          }
          this.renderDeckEditor();
        });
      }
      this.deckGridEl.appendChild(el);
    });
  }

  showToast(text) {
    if (!this.toastEl) return;
    this.toastEl.textContent = text;
    this.toastEl.classList.add('toast-visible');
    clearTimeout(this._toastT);
    this._toastT = setTimeout(() => this.toastEl.classList.remove('toast-visible'), 1300);
  }

  markDownloaded() {
    this.downloadBtn.setAttribute('data-i18n', 'cb.downloaded');
    this.downloadBtn.textContent = I18n.t('cb.downloaded');
    this.downloadBtn.disabled = true;
  }

  async handleDownload() {
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    if (isIOS && !this.isStandaloneMode()) {
      this.iosDialog.classList.remove('hidden');
      return;
    }
    if (!('caches' in window)) {
      alert(I18n.t('cb.unsupported'));
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
        const msg = I18n.t('cb.saveOk').replace('{n}', ok).replace('{total}', files.length);
        alert(msg);
      } else {
        throw new Error('failed');
      }
    } catch (e) {
      alert(I18n.t('cb.failed'));
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

document.addEventListener('DOMContentLoaded', () => new CardBattle());
