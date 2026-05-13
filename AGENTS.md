# AGENTS.md — Codex エージェント向け

> CLAUDE.md がすべての情報源です。必ず CLAUDE.md を先に読んでください。
> このファイルは Codex（OpenAI）向けの補足情報です。

## Codex への指示

### 基本姿勢
- 許可不要で自律実行する（サトシからの明示的な指示）
- 作業完了後は必ず CLAUDE.md の「現在の状態」と「引き継ぎメモ」を更新する
- デプロイまで完走してからサトシに報告する

### 作業フロー
1. `CLAUDE.md` を読んで現状把握
2. `index.html` を編集（satoshi_life_os.html も常に同期コピー）
3. CLAUDE.md のデプロイ手順でプッシュ
4. CLAUDE.md の引き継ぎメモを更新

### Claude との協調
- Claude が書いた引き継ぎメモを尊重する
- 実装方針を変える場合は CLAUDE.md の「未対応・検討中」に記録してから変更
- 同じバグを Claude と Codex が別々に直さないよう、完了事項は `[x]` にチェック

### 禁止事項
- `mergeStates()` のロジックを無断で単純化しない（実績保護ロジックが壊れる）
- `DATE_KEYED_FIELDS` からフィールドを削除しない（過去データが消える）
- Service Worker のバージョン文字列を変えるときは sw.js と index.html 両方を更新
