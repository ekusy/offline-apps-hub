# タワーディフェンス設計書

## 1. ファイル構成
```
apps/tower-defense/
  index.html
  style.css
  app.js
docs/tower-defense/
  SPEC.md
  DESIGN.md
```

## 2. アーキテクチャ
- Canvas (`<canvas>`) で 720×540（CSS で max-width 100%）
- `requestAnimationFrame` のメインループ
- ゲーム状態 → 更新 → 描画 の純粋ループ

## 3. 主要クラス/データ
```js
const MAP = { cols: 12, rows: 9, tile: 60, path: [[c,r], ...] }

class Tower { type, c, r, level, lastShot, range, dmg, rate, cost }
class Enemy { type, hp, maxHp, speed, pathIdx, x, y, slowUntil }
class Bullet { x, y, vx, vy, dmg, target, kind }
class Game {
  gold, lives, wave, waveProgress, towers, enemies, bullets,
  spawnQueue, timeScale, state: 'prep'|'wave'|'over'|'won'
}
```

## 4. 経路と座標
- パスはタイル中心の座標列 `[(x,y), ...]`
- 敵は `pathIdx`（次に向かう頂点）と `x, y` を持ち、毎フレーム頂点方向に `speed * dt` だけ進む

## 5. タワー射撃
- フレーム毎に全タワーを巡回:
  - `lastShot + 1000/rate <= now` かつ範囲内に敵がいれば最寄り敵を狙って Bullet 生成
- 弾は線形に target へ向かい衝突で `target.hp -= dmg`
- 凍結タワーは Bullet ではなく直接 `enemy.slowUntil = now + 1500` を設定

## 6. ウェーブ
- `WAVES[i] = [{type, count, interval}, ...]` の宣言的データ
- prep フェーズ 5 秒（スキップ可）→ wave フェーズで spawnQueue 消化
- 全敵処理完了で wave 進行

## 7. 入力
- Pointer 座標 → タイル変換
- パレットでタワー種別選択 → タイルクリックで配置（金 + 配置可判定）
- 配置済みタイルクリック → 売却ダイアログ

## 8. 描画
- 背景タイル（草と道）
- タワー: 種別ごとの色 + シンプルな矩形/円
- 敵: 種別ごとの色、頭上に HP バー
- 弾: 小さな点
- 選択中タワー: 射程円表示

## 9. パフォーマンス
- 敵数は最大 ~30 体、弾は ~80 で十分軽量
- DPR を尊重しつつ canvas は内部解像度を CSS と分離

## 10. オフライン対応
- 既存パターン: `handleDownload()` で
  - `./index.html`, `./style.css`, `./app.js`
  - `../../style.css`, `../../i18n.js`
  をキャッシュ
- `app-tower-defense-v1`

## 11. i18n
- `td.*` 名前空間で日英を register

## 12. 外部影響
- 新サブカテゴリ `strategy` を `apps.js` に追加
- 既存アプリへの影響なし

## 13. レビュー指摘反映
- Canvas は DPR 対応（内部解像度 = CSS × devicePixelRatio）
- 準備フェーズはタップでスキップ可
- `state === 'over'|'won'` で rAF ループを停止しリークを防ぐ
- 言語切替時に HUD 文言・パレットを再描画
