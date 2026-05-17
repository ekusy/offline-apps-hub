# Offline Apps Hub - 技術設計ドキュメント

## プロジェクト概要

Offline Apps Hub は、ユーザーが任意で選択したアプリケーションをダウンロードして、インターネット接続がない環境で実行可能な PWA（Progressive Web Apps）ベースのアプリケーションハブです。各アプリはサーバー通信を必要とせず、ローカルストレージを活用してゲーム進行状況やスコアを保存できます。

**主要な特徴：**
- オフライン環境での完全な動作
- アプリ単位での選択的ダウンロード
- iOS（Safari）および Android（Chrome）の両プラットフォーム対応
- ゼロ依存のピュア HTML/CSS/JavaScript 実装
- Service Worker による効率的なキャッシュ管理

---

## 技術スタック

### フロントエンド層
- **HTML5**：セマンティックマークアップ
- **CSS3**：レスポンシブデザイン、CSS 変数によるテーマ管理
- **Vanilla JavaScript**：フレームワーク不要、軽量実装

### PWA 基盤
- **Service Worker**：ネットワークリクエストの仲介、キャッシュ管理
- **manifest.json**：アプリメタデータ、ホーム画面追加設定
- **Cache API**：アプリ別の細粒度キャッシュ制御

### 状態管理
- **localStorage**：ゲーム進行状況、ハイスコア等の永続化
- **ブラウザメモリ**：ゲーム実行中の一時状態管理

### ホスティング
- **GitHub Pages**：静的ファイル配信
- **自動デプロイ**：main ブランチへの push で反映

---

## アーキテクチャと設計方針

### 1. 選択的ダウンロード設計

従来の PWA は全リソースを自動キャッシュしますが、本システムはユーザーが明示的に「ダウンロード」ボタンをタップしたアプリのみをキャッシュします。

**メリット：**
- ユーザーのストレージを浪費しない
- 必要なアプリだけをインストール可能
- バンド幅効率が良い（初回訪問時はトップページのみ読み込み）

**実装方法：**
\`\`\`
ユーザー操作
  ↓
ダウンロードボタンクリック
  ↓
JavaScript で fetch + Cache API
  ↓
app-{appName}-v1 キャッシュを作成
  ↓
localStorage にインストール状態を記録
\`\`\`

### 2. アプリ毎の独立したキャッシュ戦略

各アプリは独立した Cache Store を持ちます：

\`\`\`
Cache Storage
  ├── app-puzzle-v1       ← /apps/puzzle/ の全ファイル
  ├── app-game2-v1        ← /apps/game2/ の全ファイル
  └── app-game3-v1        ← /apps/game3/ の全ファイル
\`\`\`

**利点：**
- アプリの追加・削除が容易（1つのキャッシュ削除で完結）
- キャッシュバージョン管理がシンプル
- 他のアプリに影響しない

### 3. OS別のユーザーフロー制御

#### Android（Chrome）
- Service Worker が完全に対応しているため、JavaScript から直接キャッシュを作成可能
- ダウンロード後、オフラインでのアクセスが透過的に機能

#### iOS（Safari）
- Service Worker の制約により、JavaScript からのキャッシュ生成が不確実
- ユーザーは「共有」→「ホーム画面に追加」の手順を実施
- ホーム画面からアプリ起動時には Service Worker が正常に動作

**実装：**各ページで UA を判定し、iOS では専用ダイアログを表示してユーザーに手順を案内

### 4. 状態永続化の仕組み

ゲーム内のローカルストレージ活用：

\`\`\`javascript
// ゲーム内での状態保存例
localStorage.setItem('puzzle-best', moves.toString());
\`\`\`

**特徴：**
- サーバー通信なしにユーザーデータを保存
- ブラウザのプライバシー設定で消去されない限り永続
- 同じデバイスの同じブラウザでのみアクセス可能

---

## ファイル構成と責務分離

\`\`\`
offline-apps-hub/
├── README.md                    # プロジェクト説明
├── manifest.json                # PWA メタデータ、アイコン設定
├── sw.js                        # Service Worker（全体キャッシュ管理）
├── index.html                   # トップページ（アプリディレクトリ）
├── style.css                    # ベーススタイル（全アプリが参照）
└── apps/
    └── puzzle/
        ├── index.html           # ゲームページ
        ├── style.css            # ゲーム専用スタイル
        └── app.js               # ゲームロジック + ダウンロード機能
\`\`\`

### ファイル責務

| ファイル | 責務 |
|---------|------|
| **sw.js** | ネットワークリクエスト仲介、キャッシュ配信、メッセージハンドラ |
| **manifest.json** | PWA インストール情報、アイコン、テーマカラー定義 |
| **style.css** | グローバルデザイン、カラースキーム、レスポンシブ基盤 |
| **apps/puzzle/app.js** | ゲーム状態管理、ユーザー入力処理、ダウンロード実行 |
| **index.html** | アプリ一覧表示、オフライン説明 |

---

## データフロー

### ダウンロード実行時

\`\`\`
ユーザー: ダウンロードボタンをタップ
  ↓
app.js: window.location.pathname から現在 URL を解析
  ↓
app.js: 必要なファイルの絶対パスを構築
  ↓
app.js: fetch で各ファイルを取得
  ↓
app.js: cache.put() で Cache API に保存
  ↓
app.js: localStorage に完了フラグを記録
  ↓
ユーザー: 「✅ Downloaded for Offline」ボタが表示
\`\`\`

### オフラインアクセス時

\`\`\`
ユーザー: /apps/puzzle/ にアクセス
  ↓
ブラウザ: Service Worker の fetch イベント発火
  ↓
sw.js: URL パターンマッチングで app-puzzle-v1 キャッシュを特定
  ↓
sw.js: キャッシュにファイルが存在するか確認
  ↓
キャッシュHIT
  ├→ キャッシュから返却
  └→ ゲーム実行開始
\`\`\`

---

## セキュリティと制限事項

### セキュリティ考慮

- **HTTPS のみ対応**：Service Worker は HTTPS（または localhost）でのみ動作
- **同一オリジンポリシー**：各アプリは /apps/{appName}/ 配下に完全に閉じ込められている
- **localStorage の独立性**：各ブラウザ/デバイスで独立したストレージ

### 制限事項

- **オフライン状態での新規ダウンロード不可**：初回ダウンロードはオンライン必須
- **複数デバイス間のクラウド同期なし**：各デバイスのローカルストレージのみ
- **外部 API 呼び出し不可**：オフライン環境では外部通信が発生しないアプリのみ対応
- **iOS Safari の制約**：ホーム画面追加手順が必須

---

## 開発フロー

### 新規アプリ追加の手順

1. **アプリディレクトリ作成**
   \`\`\`bash
   mkdir apps/{appName}
   \`\`\`

2. **必須ファイル作成**
   - \`index.html\`：アプリメインページ
   - \`style.css\`：アプリ専用スタイル（base.css を継承）
   - \`app.js\`：アプリロジック

3. **base.css の継承**
   \`\`\`html
   <link rel="stylesheet" href="../../style.css">
   <link rel="stylesheet" href="./style.css">
   \`\`\`

4. **ダウンロード機能の実装**
   - \`handleDownload()\` メソッドをコピー・カスタマイズ
   - \`checkOfflineInstallation()\` でインストール状態を確認

5. **localStorage を活用した状態保存**
   \`\`\`javascript
   const appName = 'appname';
   localStorage.setItem(\`\${appName}-key\`, value);
   \`\`\`

6. **GitHub にコミット・デプロイ**
   \`\`\`bash
   git add .
   git commit -m "Add {appName}"
   git push origin main
   \`\`\`

### バージョン管理とキャッシュ更新

キャッシュバージョンは \`sw.js\` の \`CACHE_VERSION = 'v1'\` で管理します。アプリの大幅な更新時はこれを \`v2\` に変更することで、全キャッシュを強制リロード可能です。

---

## パフォーマンス最適化

### ファイルサイズ

- **単一アプリの典型的なサイズ**：HTML 5KB + CSS 3KB + JS 10KB ≈ 18KB
- **複数アプリ同時ダウンロード時**：キャッシュを共有しないため、アプリ数 × 18KB

### ネットワーク効率

- **初回訪問**：トップページのみ読み込み（＜50KB）
- **アプリ初回ダウンロード**：18KB 程度
- **2回目以降**：オフラインで完全に動作、通信ゼロ

### キャッシュ戦略

Service Worker は以下の戦略を採用：
- **Cache-First**：キャッシュが優先、ネットワークはフォールバック
- **Stale-While-Revalidate 的な動作**：キャッシュにない場合のみ fetch

---

## 今後の拡張性

### 推奨拡張機能

1. **複数アプリの追加**
   - 同じボイラープレートを使用して容易に拡張可能
   - 各アプリは完全に独立したキャッシュを持つため、干渉なし

2. **アプリ内アナリティクス**
   - オフライン環境でのイベント記録、オンライン復帰時に送信

3. **マルチ言語対応**
   - localStorage で言語設定を保存

4. **アプリランチャー画面の追加機能**
   - ダウンロード済みアプリの一覧表示
   - アプリの削除機能

5. **クラウド同期（オプション）**
   - IndexedDB でローカルDBを構築
   - Web Sync API でバックグラウンド同期

### スケーラビリティ

本アーキテクチャは 100+ のアプリまでスケール可能です。各アプリが独立したキャッシュを持つため、1 つのアプリのエラーが他に波及しません。

---

## 参考資料と標準仕様

- [PWA - MDN Web Docs](https://developer.mozilla.org/ja/docs/Web/Progressive_web_apps)
- [Service Workers - W3C](https://w3c.github.io/ServiceWorker/)
- [Web App Manifest - W3C](https://www.w3.org/TR/appmanifest/)
- [Cache API - MDN](https://developer.mozilla.org/ja/docs/Web/API/Cache)