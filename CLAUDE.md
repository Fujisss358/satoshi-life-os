# SATOSHI LIFE OS — エージェント共通ガイド

> このファイルは Claude（Claude.ai チャット・Claude Code CLI）と Codex の両方が読む。
> 作業前に必ずここを確認し、作業後は「## 現在の状態」と「## 引き継ぎメモ」を更新すること。

---

## オーナー設定（最重要）

- **オーナー**: サトシ・フジヌマ
- **許可スタイル**: **許可不要で自律実行**。実装・ファイル操作・デプロイ・フォルダ整理はすべて勝手に進めてよい
- **確認が必要なのは**: 「機能の方向性を大きく変える」「既存データを削除する」ケースのみ
- **言語**: 日本語でサトシと会話する。コード内コメントも日本語でOK

---

## プロジェクト概要

| 項目 | 内容 |
|---|---|
| アプリ名 | SATOSHI LIFE OS |
| 種類 | シングルファイル PWA（HTML + JS + CSS） |
| 本番URL | https://fujisss358.github.io/satoshi-life-os/ |
| リポジトリ | https://github.com/Fujisss358/satoshi-life-os |
| データ | Supabase REST API（クラウド同期）+ localStorage |
| ローカルパス | /Users/satoshifujinuma/FX攻略テスト/life-os/ |

---

## ファイル構成

```
life-os/
├── index.html          ← 本番ファイル（これを編集してデプロイ）
├── satoshi_life_os.html ← index.html のローカルバックアップ（常に同期）
├── sw.js               ← Service Worker（PWA）
├── manifest.json       ← PWA マニフェスト
├── guides/             ← トレーニングガイド画像（7枚）
│   ├── shoulder.jpg / chest.jpg / back.jpg / legs.jpg
│   ├── arms.jpg / abs.jpg / glutes.jpg
├── CLAUDE.md           ← このファイル（両エージェント共通）
├── AGENTS.md           ← Codex 用エイリアス（CLAUDE.md を参照）
├── deploy_api.py       ← GitHub API デプロイスクリプト（※ファイルが1MB以上の場合はgit pushを使う）
└── upload_guides.py    ← ガイド画像アップロードスクリプト
```

---

## デプロイ手順

### 標準（git push）← 推奨
```bash
TOKEN=$(security find-generic-password -a satoshi -s github-pat -w 2>/dev/null || echo "$GITHUB_TOKEN")
cd "/Users/satoshifujinuma/FX攻略テスト/life-os"
cp index.html satoshi_life_os.html
git remote set-url origin "https://fujisss358:${TOKEN}@github.com/fujisss358/satoshi-life-os.git"
git add index.html satoshi_life_os.html
git commit -m "作業内容の説明"
git push origin main
git remote set-url origin "https://github.com/fujisss358/satoshi-life-os.git"
```

### ファイルが小さい場合のみ（GitHub API）
```bash
cd "/Users/satoshifujinuma/FX攻略テスト/life-os"
python3 deploy_api.py
```

---

## Supabase 設定

```
URL: https://qzawejnjkmacufbybqak.supabase.co
KEY: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF6YXdlam5qa21hY3VmYnlicWFrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDYxOTQ0NDMsImV4cCI6MjA2MTc3MDQ0M30.OBDLFdHhDjkFPFSAiEbhBJAOCaVTxQB3--6B4vblbQ8
TABLE: life_os_state
USER_ID: satoshi_fujinuma
```

---

## 現在の状態（最終更新: 2026-05-13）

### ✅ 完了済み機能
- [x] 習慣トラッカー（7種 + XP・ストリーク・バッジ）
- [x] 食事・カロリー管理（Supabase同期）
- [x] 筋トレトラッカー（全カテゴリ: 肩/胸/背/脚/腕/腹/お尻＋有酸素）
  - ar1〜ar8（腕）、sh1〜sh6（肩）、ch1〜ch7（胸）、bk1〜bk7（背）、lg1〜lg7（脚）、ab1〜ab5（腹）、gl1〜gl3（お尻）
  - 各種目に説明モーダル（ℹ️ボタン）
  - 各カテゴリに「📋 完全ガイド」ボタン → 7枚の画像をフルスクリーン表示
- [x] FX分析タブ（Market Mode: Codex実装）
- [x] クラウド同期（Supabase）+ 実績保護マージロジック
- [x] PWA（Service Worker、オフライン対応）
- [x] 体重記録・前回記録表示
- [x] XP・レベルシステム・バッジ

### 🔧 重要な実装ノート
- `mergeStates(local, cloud)` でクラウド同期。**実績（streak/XP/バッジ）は常にmaxを採用**
- `repairArrayFields()` で起動時にデータ修復→クラウドへ書き戻し
- `CATEGORY_GUIDES` オブジェクトでカテゴリID→ガイド画像URLをマッピング
- ガイド画像は `https://fujisss358.github.io/satoshi-life-os/guides/` 配下

### 🔄 PWA自動アップデート（2026-05-13 実装済み）
- `deploy.sh` が実行されるたびに `sw.js` のバージョン文字列を**タイムスタンプで自動書き換え**
- ブラウザが新しいSWを検知 → `skipWaiting()` → `controllerchange` → **ページ自動リロード**
- 30分ごとにSWのアップデートをバックグラウンドでチェック
- **デプロイ = スマホも自動で最新版に切り替わる**

### 📋 未対応・検討中
- [ ] 習慣の詳細統計（週別・月別グラフ）
- [ ] 筋トレのボリューム推移グラフ
- [ ] 食事の栄養バランスビジュアライズ
- [ ] プッシュ通知（PWA）

---

## エージェント間引き継ぎメモ

### 最後に作業したエージェント: Claude（2026-05-13）

**直前の作業:**
1. 7枚のトレーニングガイド画像をGitHubにアップロード（guides/ディレクトリ）
2. 「📋 完全ガイド」ボタンを各筋トレカテゴリヘッダーに追加
3. 腕トレ3種目追加（ar6: キックバック、ar7: オーバーヘッドエクステンション、ar8: チェアディップス）
4. mergeStates修正: 同期時の実績（XP/streak/バッジ/stats）が消えないよう保護

**次のエージェントへ:**
- サトシから新しい依頼が来たらそれを優先する
- このCLAUDE.mdを作業後に必ず更新すること
- 完了したタスクは `[x]` に変更し、新しいタスクは `[ ]` で追加

---

## コーディング規約

- シングルファイルHTML：CSS → `<style>` タグ、JS → `<script>` タグに集約
- 関数名: キャメルケース（`renderGymTracker`、`showExerciseDetail`）
- 状態管理: グローバル `state` オブジェクト → `saveState()` で保存
- 日付: `today()` / `localDateStr()` で統一（タイムゾーン対応済み）
- エラー処理: try/catch で握りつぶさずに `console.warn` を残す

---

## エージェント協調プロトコル

1. **作業開始時**: このファイルを読んで現状把握
2. **作業中**: 大きな変更をする前にコードの該当箇所を `grep` で確認
3. **作業完了時**: 「現在の状態」と「引き継ぎメモ」を更新 → デプロイ → コミット
4. **コンテキスト枯渇時（Claude）**: 引き継ぎメモを詳細に書いてからセッション終了
5. **不明点**: CLAUDE.mdに `⚠️ 要確認: [内容]` と記載してサトシに一言伝える
