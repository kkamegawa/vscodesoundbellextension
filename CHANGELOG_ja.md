# 変更履歴

[English](CHANGELOG.md)

「Sound Notifier for GitHub Copilot」拡張機能の主な変更を記録します。
変更履歴は Keep a Changelog の形式に準拠し、このプロジェクトは Semantic Versioning に従います。

## [1.0.1] - 2026-11-15

### 変更

- 以前の Marketplace 拡張IDを復元できないため、Local Audio Hostを `KazushiKamegawa.sound-notifier-local-audio-hostex` として再公開できるように変更
- 以前の表示名も削除済みMarketplace拡張で予約されているため、一意な表示名 `Sound Notifier Local Audio Hostex` を使用
- メイン拡張の依存先を新しいLocal Audio Host拡張へ更新
- メイン拡張とLocal Audio Host拡張のバージョンを `1.0.1` に統一

## [0.0.1] - 2025-07-05

### 追加

- Sound Notifier for GitHub Copilot の初回リリース
- Windows、macOS、Linux 向けのクロスプラットフォーム音声再生
- OS ごとのサウンド設定
- 形式検証付きのカスタムサウンドファイル
- カスタムサウンドコマンドの設定
- システムサウンドへのフォールバック
- 互換性向上のための OS 標準コマンド
- サウンド設定を確認するテストコマンド
- VS Code 設定からの詳細な構成
- Copilot エージェント完了を複数の方法で検出

### 機能

- **クロスプラットフォーム音声再生**: Windows（PowerShell）、macOS（afplay）、Linux（paplay）の再生に対応
- **カスタムサウンドファイル**: MP4、WAV、WMA、WebM に対応
- **柔軟な設定**: カスタムコマンドや既定のシステムサウンドを設定可能
- **フォールバック**: カスタムサウンド、システムサウンド、VS Code 通知の順に代替
- **リアルタイム監視**: VS Code のターミナルとドキュメントの変更から Copilot エージェントの操作を監視
- **簡単なテスト**: サウンド設定を確認するコマンドを提供

### 設定項目

- `soundNotifier.enabled`: サウンド通知の有効・無効
- `soundNotifier.soundFiles`: OS ごとのカスタムサウンドファイルのパス
- `soundNotifier.soundCommands`: OS ごとのカスタム再生コマンド
- `soundNotifier.useDefaultSystemSound`: カスタムファイルが利用できない場合にシステムサウンドを使用
- `soundNotifier.defaultSoundCommands`: OS ごとの既定の再生コマンド

### コマンド

- `soundNotifier.testSound`: 現在の設定でサウンドをテスト

### セキュリティ

- CodeQL による静的解析
- Dependabot によるセキュリティ更新
- 安全なコマンド実行方法

### 技術情報

- strict モードを有効にした TypeScript 4.9.4
- Node.js 16.x 以降に対応
- Mocha と TDD によるテスト
- クロスプラットフォームの子プロセス実行
- VS Code Extension API 1.74.0 以降

## [未リリース]

### 追加

- 完了音向けに、ユーザーレベルの Copilot `agentStop` フックを導入・削除するオプトインコマンド
- フックの導入手順、実行環境の要件、Copilot フックのプレビュー状態に関する説明

### 変更

- ターミナルのフォーカス、Copilot 設定の変更、大きなドキュメント挿入ではなく、`agentStop` により Copilot のターン終了時に完了音を再生
- フックはユーザーが明示的に導入し、新しい Copilot セッションから有効化。エージェントの実行環境では Node.js 24 以降が必要

### 今後の予定

- サウンドテーマとプリセット
- 音量設定
- Copilot イベント検出の拡張
- 通知メッセージのカスタマイズ
- サウンドのスケジュールと静音時間帯

この拡張機能の詳細は GitHub リポジトリを参照してください。
