# ドキュメントレビュー指摘事項と対応

## 共通指摘

1. **新サブカテゴリのラベルが未定義**
   - `strategy` / `rpg` / `cards` を追加するが、`apps.js` の `SUBCATEGORIES` に日英ラベル登録が必要
   - 対応: 設計書に追記＋実装時に追加

2. **Service Worker / sw.js への影響**
   - 現在の `sw.js` は `/apps/{name}/` 配下を `app-{name}-v{ver}` キャッシュに格納するため、追加で sw.js 変更は不要
   - 対応: 確認のみ。新規アプリ追加で sw.js は触らない

3. **shared root assets（style.css / i18n.js）のキャッシュ**
   - 既存の puzzle/water-sort のとおり、`handleDownload()` で `../../style.css` `../../i18n.js` を必ず含める
   - 対応: 各 app.js のダウンロードコメントを統一

4. **言語切替時の動的 UI 再描画**
   - 動的に生成する要素（カード名、敵名、ログ等）は `i18nchange` 後に再描画必要
   - 対応: 各実装で `window.addEventListener('i18nchange', () => this.render())` 相当を入れる

## 個別指摘

### Sudoku
- **一意解保証**: 設計書に明記済み（コスト優先で省略）。OK
- **メモ表示と入力数字の競合**: メモがあるセルに数字が入ったらメモは消える方が UX 良好 → 設計書追記済み (Edit time)
- **`sudoku-state` の互換性**: 難易度変更時は state を破棄するルールを追加

### Tower Defense
- **canvas 解像度**: dpr 対応をプラスで明示
- **準備フェーズスキップ**: 設計に「タップでスキップ」を追記
- **メモリリーク**: requestAnimationFrame は state.over で停止すること

### Dungeon Crawler
- **fog 視界範囲**: 仕様書「1 マス」のままだと暗すぎる → 2 マスに変更（チェビシェフ距離）
- **アイテム重複**: 同じセルに敵・アイテム・階段は不可（生成時にチェック）

### Card Battle
- **手札上限超過**: ドロー時 hand が 5 枚なら追加しない（ドロー消費）
- **エネルギー初期値**: 初回プレイヤーターンは 1 で開始、以後ターン毎に +1（上限 10）と明記

## 対応反映先
本ファイル末尾に記載のとおり、各 SPEC.md / DESIGN.md に反映済み（修正コミットに含める）。
