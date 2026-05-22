# 数独（Sudoku）設計書

## 1. ファイル構成
```
apps/sudoku/
  index.html      # マークアップ + ダウンロード/iOSダイアログ
  style.css       # ボード、数字パッド、メモ表示
  app.js          # 盤面生成・操作・状態管理・ダウンロード
docs/sudoku/
  SPEC.md
  DESIGN.md
```

## 2. データモデル
```js
class SudokuGame {
  difficulty: 'easy'|'normal'|'hard'
  seed: uint32                  // 共有用シード
  solution: number[81]          // 完成解
  puzzle: number[81]            // ヒント済み（0 = 空欄）
  board: number[81]             // 現在の入力（0 = 空欄）
  notes: Set<number>[81]        // メモ候補
  selected: number|null         // 選択中セルの index
  noteMode: boolean             // メモ入力モード
  showErrors: boolean           // ミス検知表示
  history: Snapshot[]           // 元に戻す用
  startTime, timerId, moves     // 計測
}
```

## 3. パズル生成アルゴリズム
1. 完成解の生成
   - 81 マスを再帰的にバックトラッキングで埋める（行/列/ブロック制約 + シード化乱数で順序ランダム化）
2. ヒント削除
   - 完成解をコピー → ランダム順で 1 マスずつ 0 に置換
   - 難易度に応じた残ヒント数になったら停止
   - 一意解保証は重い処理のため、本実装ではコスト/速度を優先し残ヒント数のみで難易度を表現する（モバイル動作・初回ロード速度を優先）
3. シード可搬性
   - `mulberry32(seed)` を使って同じシードで再現可能

## 4. 状態遷移と操作
- セル選択: `selected = i` → 同じ数字をハイライト
- 通常入力: 数字パッド → `board[i] = n`、`history.push(snapshot)`、勝利判定
- メモ入力: `noteMode=true` の場合、`notes[i]` をトグル
- 消去: `board[i] = 0`, `notes[i].clear()`
- 元に戻す: `history.pop()` を復元
- ミス検知: 同じ行/列/ブロック内の重複を赤クラス付与
- 勝利: `board === solution`（または合法かつすべて埋まり）→ ベストタイム保存

## 5. ストレージ
- ベスト保存: `localStorage.setItem('sudoku-best-' + diff, seconds)`
- 状態自動保存: 入力ごとに `sudoku-state` に JSON 保存。リロード時に復元（最後の難易度 + 進行状況）

## 6. レンダリング
- `<div class="sd-board">` 内に 81 個の `<div class="sd-cell">`
- 行/列/3×3 ブロック境界は CSS border で実現
- メモは flex 9 分割の小数字グリッド

## 7. オフライン対応
- 既存パターン踏襲: `handleDownload()` で
  - `./index.html`, `./style.css`, `./app.js`
  - `../../style.css`, `../../i18n.js`
  を Cache API に保存
- `app-sudoku-v1` キャッシュ名

## 8. i18n
- `I18n.register({ja, en})` で `sudoku.*` を登録
- ヘッダーや UI 文言は `data-i18n` 属性で連動

## 9. レスポンシブ
- ボードサイズは `min(94vw, 480px)` を上限に CSS 変数で制御
- 数字パッドはボード幅にフィット

## 10. 外部影響
- `apps.js` に 1 エントリ追加（id: sudoku, subcategory: puzzle）
- 既存アプリ・スタイルへの影響なし

## 11. レビュー指摘反映
- セルに数字入力したら `notes[i]` は自動クリア
- 難易度変更時は `sudoku-state` を破棄
- 言語切替時は数字パッド/ラベルを再描画
