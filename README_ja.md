# VS Code 拡張機能: Copilot Sound Notifier

[English](README.md)

GitHub Copilot エージェントがターンを終え、操作をユーザーに戻したときにサウンドを再生する VS Code 拡張機能です。エディターを見続けなくても作業の完了に気付けます。

完了の検出には Copilot の `agentStop` フックを使います。フック機能は現在プレビュー中のため、サウンド通知はオプトイン方式です。利用するにはユーザーレベルのフックをインストールしてください。Remote SSHでは、workspace extensionがCopilot実行ホスト上のhookを監視し、ローカルUI companionがクライアント側で音を再生します。

## 主な機能

- macOS、Windows、Linux に対応
- サウンドファイルと OS ごとの再生コマンドを設定可能
- カスタムサウンドが未設定の場合はシステムサウンドを使用
- 音声再生とあわせて VS Code の通知を表示可能
- Copilot の完了フックを明示的にインストール・削除

## 完了フックをインストールする

1. VS Code でコマンドパレットを開きます。
2. **Sound Notifier: Install Copilot Agent Completion Hook** を実行します。
3. フック設定を読み込ませるため、新しい Copilot セッションを開始します。

フックは Copilot エージェントの実行環境で動作します。その環境に Node.js 24 以降をインストールし、`PATH` から `node` を実行できるようにしてください。リモートまたはコンテナーのセッションでは、そのリモート環境またはコンテナーに Node.js をインストールします。Remote SSHでは、Copilotが実行されるホストにフックを置くため、SSH接続中のウィンドウでインストールコマンドを実行してください。ローカル音声companionは依存拡張として自動インストールされます。VSIXを手動で入れる場合は、両方のパッケージをインストールしてください。

フックを削除するには、コマンドパレットから **Sound Notifier: Uninstall Copilot Agent Completion Hook** を実行します。拡張機能が管理するフックファイルだけを削除します。

## 設定

VS Code の設定から拡張機能を構成します。

```json
{
  "soundNotifier.enabled": true,
  "soundNotifier.soundFiles": {
    "win32": "C:/path/to/sound.wav",
    "darwin": "/path/to/sound.wav",
    "linux": "/path/to/sound.wav"
  },
  "soundNotifier.soundCommands": {
    "win32": "powershell -c (New-Object Media.SoundPlayer \"{file}\").PlaySync()",
    "darwin": "afplay \"{file}\"",
    "linux": "paplay \"{file}\""
  },
  "soundNotifier.useVSCodeNotification": true,
  "soundNotifier.volume": 0.5
}
```

`soundNotifier.useVSCodeNotification`は、音声再生に加えてVS Codeの通知を表示します。音声再生の代わりにはなりません。サウンドファイルを空欄にするとシステムサウンドを使います。利用できる形式は再生コマンドと OS によって異なります。拡張機能のファイル検証では WAV、MP4、WMA、WebM に対応しています。

## コマンド

- **Sound Notifier: Install Copilot Agent Completion Hook** — 次回以降の Copilot セッションで完了音を有効にします
- **Sound Notifier: Uninstall Copilot Agent Completion Hook** — 拡張機能が管理するユーザーフックを削除します
- **Sound Notifier: Play Completion Sound** — 設定したサウンドを手動で再生します
- **Sound Notifier: Test Sound** — 現在のサウンド設定をテストします
- **Sound Notifier: Toggle VS Code Completion Notification** — 音声再生とあわせて表示する VS Code 通知を切り替えます

## 開発

1. このリポジトリをクローンします。
2. `npm install` を実行して依存パッケージをインストールします。
3. F5 キーを押して Extension Development Host を起動します。

`npm test` でテストを実行し、`npm run compile` でコンパイルします。

## セキュリティ

この拡張機能は GitHub Advanced Security CodeQL、Dependabot、`npm audit` で定期的に脆弱性を確認しています。セキュリティに関する連絡先は [Security Policy](SECURITY.md) を参照してください。

## ライセンス

MIT
