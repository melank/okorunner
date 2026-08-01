# やる気起こrunner (okorunner)

やる気が出ないときに、作業興奮のきっかけになる家事や雑務を提案してくれる個人用アプリ。

## コンセプト

- 任意のタイミングでメニューバーから即起動（トレイアイコンまたは ⌘⇧O）
- 作業興奮を起こす単純作業を提案
- 提案・実行の履歴を学習し、時間帯に応じて適切な項目を提示
- 「Done」で記録。未記録が30分続くとリマインド通知
- 「やる気が出た Done」も記録して学習に反映
- やる気が出ないときは、とりあえずこのアプリを開く

## 技術スタック

- **Tauri 2**（Rust + TypeScript / React）— macOS メニューバー常駐アプリ
- **SQLite**（`tauri-plugin-sql`）— 履歴の永続化
- 提案ロジック — 時間帯 × タスクの ε-greedy（詳細は [docs/suggestion-logic.md](docs/suggestion-logic.md)）

## ドキュメント

- [提案ロジック](docs/suggestion-logic.md) — 時間帯・スコア・ε-greedy の仕様

## 開発

前提: Node.js / npm、[rustup](https://rustup.rs/) の stable toolchain（`rustc` / `cargo`）。

```bash
npm install
npm run build          # フロントエンドビルド
cargo check --manifest-path src-tauri/Cargo.toml
npm run tauri dev      # macOS 開発ウィンドウを起動
```

初回の `cargo` / `tauri` 実行時に `src-tauri/gen/` が生成される（ビルド成果物のため Git 管理外）。

## 公開リポジトリについて

- ソースは公開しているが、**個人用プロジェクト**であり再配布・商用利用の許諾はしない（[LICENSE](LICENSE) 参照）
- 秘密情報はコミットしない。ローカルでは [gitleaks](https://github.com/gitleaks/gitleaks) の pre-commit と CI でスキャンする
- アイコンは Tauri 雛形のプレースホルダ（後で差し替え予定）

## ライセンス / author

melank。All Rights Reserved。
