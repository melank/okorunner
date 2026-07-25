# やる気起こrunner (okorunner)

やる気が出ないときに、作業興奮のきっかけになる家事や雑務を提案してくれる個人用アプリ。

## コンセプト

- 任意のタイミングでメニューバーから即起動
- 作業興奮を起こす単純作業を提案
- 提案・実行の履歴を学習し、時間帯に応じて適切な項目を提示
- 「Done」で記録。押し忘れ防止のリマインドあり
- 「やる気が出た Done」も記録して学習に反映
- やる気が出ないときは、とりあえずこのアプリを開く

## 技術スタック

- **Tauri 2**（Rust + TypeScript / React）— macOS メニューバー常駐アプリ
- **SQLite**（`tauri-plugin-sql`）— 履歴の永続化
- 提案ロジック — 時間帯 × タスクの ε-greedy

## 開発ハーネス: TAKT

本リポジトリは [TAKT](https://github.com/nrslib/takt) を開発ハーネスとして利用する。

```bash
takt          # AI と対話してタスクを整理・キュー登録
takt run      # 隔離 worktree でワークフロー実行（plan → implement → review → fix）
takt list     # タスクブランチの管理（merge / retry / delete）
```

- プロバイダ設定: `~/.takt/config.yaml`（provider: codex）
- ワークフローは builtin を使用。カスタマイズ時は `takt eject` で `.takt/` に取り込む

## ライセンス / author

melank 単著。個人利用のため配布は想定しない。
