#!/usr/bin/env bash
# SATOSHI LIFE OS — ワンコマンドデプロイ
# 使い方: ./deploy.sh "コミットメッセージ"
set -euo pipefail

MSG="${1:-Deploy Life OS update}"
DIR="$(cd "$(dirname "$0")" && pwd)"

# トークン取得（Keychain → 環境変数）
TOKEN=$(security find-generic-password -a satoshi -s github-pat -w 2>/dev/null || echo "${GITHUB_TOKEN:-}")
if [ -z "$TOKEN" ]; then
  echo "❌ GitHub トークンが見つかりません"
  echo "   security add-generic-password -a satoshi -s github-pat -w <TOKEN> -U"
  exit 1
fi

cd "$DIR"

# index.html を satoshi_life_os.html にもコピー
cp index.html satoshi_life_os.html

# git 設定
git config user.name "Satoshi Fujinuma"
git config user.email "satoshi@example.local"
git remote set-url origin "https://fujisss358:${TOKEN}@github.com/fujisss358/satoshi-life-os.git"

git add index.html satoshi_life_os.html CLAUDE.md AGENTS.md 2>/dev/null || true

if git diff --cached --quiet; then
  echo "変更なし。デプロイスキップ。"
else
  git commit -m "$MSG"
  git push -u origin main
  echo "✅ デプロイ完了: https://fujisss358.github.io/satoshi-life-os/"
fi

# URLをクリーンに戻す
git remote set-url origin "https://github.com/fujisss358/satoshi-life-os.git"
