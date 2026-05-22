# ダンジョンクローラー設計書

## 1. ファイル構成
```
apps/dungeon/
  index.html
  style.css
  app.js
docs/dungeon/
  SPEC.md
  DESIGN.md
```

## 2. データモデル
```js
class Dungeon {
  floor: 1..10
  grid: Cell[49]                 // 7×7、index = r*7 + c
  player: { c, r, hp, mp, atk, def, lv, exp, weaponAtk, armorDef }
  enemies: Enemy[]               // { id, type, c, r, hp, atk, def }
  items:   Item[]                // { id, c, r, kind, value }
  fog: boolean[49]               // 視界
  stairsAt: index
  turn: number
  log: string[]                  // 最大 4
  state: 'play'|'gameover'|'cleared'
  defendingNext: boolean
}
```

## 3. 階層生成
- 階段位置: ランダム（プレイヤー位置と異なる）
- 敵配置: 階層に応じた数。プレイヤー隣接 4 マス・階段マスを除外
- アイテム配置: 敵と被らないマス
- 敵パラメータ: `base * (1 + 0.25 * (floor-1))` 程度

## 4. ターン処理
```
プレイヤー入力 → 行動実行 → ログ追加
 → 死亡判定 → 階段判定（移動なら）
 → 各敵 AI 実行（順番）
 → ステータス保存
 → fog 再計算 → render
```

## 5. 敵 AI（簡易）
- 隣接時: 攻撃
- 非隣接: BFS は重いので、`dr = sign(p.r - e.r)`, `dc = sign(p.c - e.c)` で 1 軸選択。優先軸はランダムでブレ
- 壁/他敵で塞がれていれば待機

## 6. 戦闘式
- ダメージ = max(1, attacker.atk + weapon - defender.def - armor)
- 防御中は damage = ceil(damage / 2)
- 魔法: 隣接敵に 1.5x、固定 MP コスト 4

## 7. アイテム
- 回復: HP += value（上限 max）
- MP: MP += value
- 武器/防具: 既存より高ければ置換、ログ「装備を更新」

## 8. レンダリング
- 7×7 グリッドを `<div class="dg-grid">` で表示
- 各 Cell に絵文字（プレイヤー🧙 / 敵👺👹🐉👑 / アイテム💊✨🗡️🛡️ / 階段⬇️）
- 霧マスは暗色オーバーレイ

## 9. 操作
- ボタン: ↑↓←→ 移動 / 攻撃 / 魔法 / 防御 / 待機
- キーボード: 矢印/WASD/A=攻撃, M=魔法, D=防御, .=待機

## 10. 永続化
- 各 input 後に `dungeon-state` を JSON で保存
- ゲームオーバー時にベスト値更新

## 11. オフライン対応
- 既存パターンと同じ。`app-dungeon-v1`

## 12. i18n
- `dg.*` で日英 register

## 13. 外部影響
- `apps.js` に登録 + サブカテゴリ `rpg` 追加

## 14. レビュー指摘反映
- 視界はチェビシェフ距離 ≤ 2（仕様書の「1 マス」を更新）
- 階層生成時、敵/アイテム/階段が同じセルに置かれないようガード
- 言語切替で行動ボタンとログ再描画
