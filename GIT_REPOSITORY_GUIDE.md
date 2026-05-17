# Offline Apps Hub - Git & リポジトリ管理ガイド

## リポジトリ情報

### 基本情報

| 項目 | 内容 |
|-----|------|
| **リポジトリ名** | offline-apps-hub |
| **GitHub URL** | https://github.com/ekusy/offline-apps-hub |
| **公開サイト URL** | https://ekusy.github.io/offline-apps-hub/ |
| **リポジトリタイプ** | Public |
| **デプロイ方法** | GitHub Pages（main ブランチ） |
| **言語** | HTML, CSS, JavaScript |
| **ライセンス** | MIT（推奨） |

### リポジトリ所有者

- **GitHub ユーザー名**: ekusy
- **メールアドレス**: （設定に応じて）

---

## Git セットアップ

### 初回セットアップ

#### 1. Git のインストール確認
\`\`\`bash
git --version
\`\`\`

#### 2. グローバル設定（初回のみ）
\`\`\`bash
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"
\`\`\`

#### 3. リポジトリのクローン
\`\`\`bash
git clone https://github.com/ekusy/offline-apps-hub.git
cd offline-apps-hub
\`\`\`

#### 4. リモート確認
\`\`\`bash
git remote -v
# origin  https://github.com/ekusy/offline-apps-hub.git (fetch)
# origin  https://github.com/ekusy/offline-apps-hub.git (push)
\`\`\`

---

## ブランチ戦略

### ブランチ構成

\`\`\`
main
  ├─ 本番環境（GitHub Pages に自動デプロイ）
  ├─ 常に安定した状態を保つ
  └─ 直接コミット禁止（Pull Request 経由）

develop（オプション）
  ├─ 開発用ブランチ
  ├─ 新機能やバグ修正を統合
  └─ 検証後に main にマージ

feature/xxx
  ├─ 新機能開発用
  ├─ develop から分岐
  └─ 完成後に develop にマージ
\`\`\`

### シンプル運用の場合（推奨）

**main ブランチのみで管理**（小規模プロジェクト向け）

\`\`\`bash
# 新機能開発
git checkout -b feature/new-game
git add .
git commit -m "Add new game feature"
git push origin feature/new-game

# GitHub で Pull Request を作成 → review → merge
\`\`\`

---

## コミット規約

### コミットメッセージの形式

\`\`\`
<type>(<scope>): <subject>

<body>

<footer>
\`\`\`

### タイプ一覧

| タイプ | 説明 | 例 |
|--------|------|-----|
| **feat** | 新機能追加 | \`feat(puzzle): Add hint feature\` |
| **fix** | バグ修正 | \`fix(ios): Fix offline caching issue\` |
| **docs** | ドキュメント更新 | \`docs: Update architecture guide\` |
| **style** | コード形式（動作変更なし） | \`style: Format JavaScript files\` |
| **refactor** | コード整理（機能変更なし） | \`refactor(sw): Simplify cache logic\` |
| **perf** | パフォーマンス改善 | \`perf(app): Reduce bundle size\` |
| **test** | テスト追加/修正 | \`test(puzzle): Add game logic tests\` |
| **chore** | ビルド・依存関係等 | \`chore: Update package.json\` |

### コミットメッセージの例

\`\`\`bash
# 新機能追加
git commit -m "feat(puzzle): Add solution hint button"

# バグ修正
git commit -m "fix(ios): Fix Service Worker caching on Safari"

# ドキュメント更新
git commit -m "docs(readme): Add development guide"

# 複数行コメント
git commit -m "fix(download): Resolve root path issue

- Calculate correct absolute path for style.css
- Fix 3/4 files caching issue
- Add debug logging for troubleshooting"
\`\`\`

---

## GitHub Actions による自動デプロイ

### 現在の構成

GitHub Pages は **main ブランチの push に自動反応**

\`\`\`
git push origin main
  ↓
GitHub Pages ビルド開始（1-2分）
  ↓
https://ekusy.github.io/offline-apps-hub/ に反映
\`\`\`

### デプロイ確認方法

1. **GitHub リポジトリページ** → 「Actions」タブ
2. 最新の「Deployment」ワークフロー を確認
3. ✅ 緑色 = デプロイ成功
4. ❌ 赤色 = デプロイ失敗（ログを確認）

---

## 常用 Git コマンド

### 基本操作

\`\`\`bash
# リポジトリの状態確認
git status

# 変更内容を確認
git diff

# ファイルをステージング
git add .
git add <filename>

# コミット
git commit -m "commit message"

# 直前のコミットを修正（未 push の場合）
git commit --amend

# リモートに push
git push origin main
git push origin <branch-name>

# リモートから pull
git pull origin main
\`\`\`

### ブランチ操作

\`\`\`bash
# ブランチ一覧表示
git branch -a

# ブランチ作成
git branch feature/new-feature
git checkout -b feature/new-feature  # 作成 + 切り替え

# ブランチ切り替え
git checkout main
git checkout feature/new-feature

# ブランチ削除
git branch -d feature/new-feature  # ローカルのみ削除
git push origin --delete feature/new-feature  # リモートからも削除

# ブランチ名変更
git branch -m old-name new-name
\`\`\`

### リモート操作

\`\`\`bash
# リモート確認
git remote -v

# リモート追加
git remote add origin https://github.com/ekusy/offline-apps-hub.git

# 最新の変更を取得（マージなし）
git fetch origin

# リモートブランチを確認
git branch -r
\`\`\`

### 履歴確認

\`\`\`bash
# コミット履歴表示
git log
git log --oneline  # 簡潔表示
git log --graph --all --oneline  # グラフ表示

# 特定ファイルの変更履歴
git log <filename>

# コミット詳細確認
git show <commit-hash>
\`\`\`

### 変更の取り消し

\`\`\`bash
# ステージング前の変更を取り消し
git checkout -- <filename>

# ステージングを取り消し
git reset HEAD <filename>

# 直前のコミットを取り消し（変更は保持）
git reset --soft HEAD~1

# 直前のコミットを完全に取り消し
git reset --hard HEAD~1
\`\`\`

---

## 開発ワークフロー

### 新機能開発の流れ

#### 1. 新しいブランチを作成
\`\`\`bash
git checkout -b feature/new-game-feature
\`\`\`

#### 2. ローカルで開発
\`\`\`bash
# ファイルを編集
# テストなど実施
\`\`\`

#### 3. 変更を確認してコミット
\`\`\`bash
git status  # 変更確認
git add .
git commit -m "feat(games): Add new puzzle game"
\`\`\`

#### 4. リモートに push
\`\`\`bash
git push origin feature/new-game-feature
\`\`\`

#### 5. GitHub で Pull Request を作成
- GitHub リポジトリ → 「Pull requests」タブ
- 「New pull request」をクリック
- base: \`main\`, compare: \`feature/new-game-feature\`
- PR 説明を記入（変更内容を説明）
- 「Create pull request」

#### 6. レビュー & マージ
- コードレビュー実施
- 問題なければ「Merge pull request」
- マージ後、自動的に main ブランチが GitHub Pages に反映

---

## GitHub Pages デプロイメント

### 自動デプロイの仕組み

\`\`\`
main ブランチへの push
  ↓
GitHub が変更を検出
  ↓
Jekyll ビルド（デフォルト）
  または GitHub Actions ワークフロー実行
  ↓
静的ファイルをリポジトリの gh-pages ブランチに配置
  ↓
https://ekusy.github.io/offline-apps-hub/ で公開
\`\`\`

### デプロイ設定確認

1. GitHub リポジトリ → **Settings**
2. 左メニュー → **Pages**
3. 以下を確認：
   - **Source**: \`Deploy from a branch\`
   - **Branch**: \`main\` / \`/ (root)\`
   - **Status**: ✅ "Your site is live at..."

### デプロイ失敗時の対処

#### 1. ビルドログを確認
- **Settings** → **Pages** → 「View deployment history」
- 最新のデプロイをクリック → エラーログ確認

#### 2. よくあるエラー
| エラー | 原因 | 対処 |
|--------|------|------|
| 404 エラー | ファイルパスが間違っている | 相対パスを確認 |
| キャッシュが古い | ブラウザキャッシュ | \`Ctrl+Shift+Delete\` でキャッシュ削除 |
| CORS エラー | クロスオリジンリクエスト | Service Worker で対応 |

---

## トラブルシューティング

### よくある問題と解決方法

#### 1. 「Permission denied」エラー
\`\`\`bash
# SSH キーが登録されていない場合
git config --global credential.helper store
git pull  # アカウント情報を入力
\`\`\`

#### 2. 「fatal: Could not resolve host」
\`\`\`bash
# ネットワーク接続を確認
ping github.com

# プロキシ設定が必要な場合
git config --global http.proxy [proxy-address]
\`\`\`

#### 3. コミットが push されない
\`\`\`bash
# リモート状態を確認
git log -1  # ローカルの最新コミット
git log -1 origin/main  # リモートの最新コミット

# 強制的に push（注意！main には使用禁止）
git push origin feature/branch -f
\`\`\`

#### 4. ブランチを間違えて削除した
\`\`\`bash
# 削除されたコミットを復元
git reflog  # 削除前の状態を確認
git checkout -b recovered-branch <commit-hash>
\`\`\`

---

## セキュリティベストプラクティス

### 認証情報の管理

\`\`\`bash
# アクセストークンを使用（パスワード未推奨）
# GitHub Settings → Developer settings → Personal access tokens
# 使用例：
git clone https://<token>@github.com/ekusy/offline-apps-hub.git
\`\`\`

### .gitignore の設定

本プロジェクトでは不要ですが、本番環境では以下を除外：

\`\`\`
# .gitignore 例
node_modules/
.env
.DS_Store
*.log
dist/
build/
\`\`\`

### シークレット管理

- **パスワード、API キー**は Git に追加しない
- 環境変数は \`.env\` ファイルに記入（.gitignore に追加）
- GitHub Secrets を活用（CI/CD パイプライン用）

---

## 参考資料

### Git 学習資料
- [Git 公式ドキュメント](https://git-scm.com/doc)
- [GitHub Docs](https://docs.github.com/)
- [Atlassian Git チュートリアル](https://www.atlassian.com/ja/git/tutorials)

### GitHub Pages
- [GitHub Pages 公式ドキュメント](https://pages.github.com/)
- [GitHub Pages トラブルシューティング](https://docs.github.com/en/pages/getting-started-with-github-pages/troubleshooting-common-issues-with-github-pages)

### ベストプラクティス
- [Conventional Commits](https://www.conventionalcommits.org/ja/)
- [GitHub フロー](https://guides.github.com/introduction/flow/)

---

## よくあるワークフロー例

### シナリオ1: 新しいゲームを追加する

\`\`\`bash
# 1. ブランチ作成
git checkout -b feature/add-memory-game

# 2. ファイル作成・編集
mkdir apps/memory
# ... ファイルを作成 ...

# 3. ステージング & コミット
git add apps/memory/
git commit -m "feat(memory): Add memory matching game"

# 4. Push
git push origin feature/add-memory-game

# 5. GitHub で PR を作成 & マージ
# → 自動的に https://ekusy.github.io/offline-apps-hub/ に反映
\`\`\`

### シナリオ2: バグを修正する

\`\`\`bash
# 1. ブランチ作成
git checkout -b fix/puzzle-offline-issue

# 2. バグ修正
# ... apps/puzzle/app.js を編集 ...

# 3. コミット
git add apps/puzzle/app.js
git commit -m "fix(puzzle): Resolve offline caching issue on iOS"

# 4. Push & PR
git push origin fix/puzzle-offline-issue
# GitHub で PR を作成 & マージ
\`\`\`

### シナリオ3: ドキュメントを更新

\`\`\`bash
# 1. ブランチ作成
git checkout -b docs/update-architecture

# 2. ドキュメント編集
# ... README.md や TECHNICAL_ARCHITECTURE.md を編集 ...

# 3. コミット
git add *.md
git commit -m "docs: Update architecture documentation"

# 4. Push & マージ
git push origin docs/update-architecture
\`\`\`

---

## 定期的なメンテナンス

### 定期タスク

\`\`\`bash
# 古いローカルブランチをクリーンアップ
git branch -d <merged-branch-name>

# リモートで削除されたブランチをローカルから削除
git remote prune origin

# 大きなファイルを検出
git ls-files --long | sort -k 5 -hr | head -10
\`\`\`

### リポジトリの最適化

\`\`\`bash
# 不要なオブジェクトを削除してスペースを節約
git gc --aggressive
git prune
\`\`\`