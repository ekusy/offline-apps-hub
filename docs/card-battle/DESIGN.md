# カードバトル設計書

## 1. ファイル構成
```
apps/card-battle/
  index.html
  style.css
  app.js
docs/card-battle/
  SPEC.md
  DESIGN.md
```

## 2. データモデル
```js
const CARD_POOL = [
  { id, nameJaKey, nameEnKey, cost, kind: 'atk'|'heal'|'shield'|'buff'|'multi', value, hits? },
  ...
] // 20 種

class Battle {
  stage: 1..5
  player: { hp, maxHp, energy, maxEnergy, shield, buff, deck, hand, discard }
  enemy:  { hp, maxHp, energy, deck, hand, discard, shield, buff, ai: 'easy'|'med'|'hard' }
  turn: 'player'|'enemy'
  log: string[]
  state: 'fight'|'win'|'lose'
  turns: number
}
```

## 3. 山札処理
- `draw()`: deck から 1 枚 → hand。空ならば discard を shuffle → deck に
- `play(card)`: コスト消費、効果適用、discard へ
- ターン終了で全 hand を discard へ送らない（残す）。エネルギー +1（上限）

## 4. 効果適用
- atk: target.hp -= max(1, value + buff)
- shield: target.shield = value（次ターン受けるダメージを value 軽減、1 ターンのみ）
- heal: self.hp = min(maxHp, hp + value)
- buff: self.buff += value（次の atk に上乗せ、消費）
- multi: hits 回 atk(value) を繰り返す

## 5. 敵 AI
- 簡易ループ:
  ```
  while (energy >= cheapest hand cost):
    if hp < 30% かつ heal あり → 回復
    else if buff カード保有 かつ atk もある → buff → atk
    else if energy で出せる最大 atk があれば出す
    else 安いカードを出す
    出せなくなれば break
  ```

## 6. デッキ編集 UI
- 別画面（同一ページ内ビュー切替）
- カードプール一覧から 8 枚選択（チェック/カウント）
- 完成で「保存」 → `cb-deck` に id 列を保存

## 7. レンダリング
- カード: `<div class="cb-card">` に名前 / コスト / 効果テキスト
- 手札横並び（モバイルは縦スクロール OK）
- HP/エネルギーはバー + 数値

## 8. アンロック
- ステージ N クリアで `CARD_POOL` の `unlock: N` カードを `cb-unlocks` に追加

## 9. オフライン対応
- 既存パターン同じ。`app-card-battle-v1`

## 10. i18n
- `cb.*` 名前空間

## 11. 外部影響
- `apps.js` に登録 + サブカテゴリ `cards` 追加

## 12. レビュー指摘反映
- 手札上限 5。ドロー時に上限到達なら 1 枚は引かずバーン（または引かないだけ）
- 初回ターン: エネルギー 1、以降毎ターン +1（上限 10）
- 言語切替時にカード名/効果テキスト再描画
- 山札空ドロー時、`discard` を shuffle して deck に戻す
