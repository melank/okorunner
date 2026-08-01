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

## 開発

前提: Node.js / npm、[rustup](https://rustup.rs/) の stable toolchain（`rustc` / `cargo`）。

```bash
npm install
npm run build          # フロントエンドビルド
cargo check --manifest-path src-tauri/Cargo.toml
npm run tauri dev      # macOS 開発ウィンドウを起動
```

## ライセンス / author

melank 単著。個人利用のため配布は想定しない。
