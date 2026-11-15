# VS Code Extension: Copilot Sound Notifier

[日本語](README_ja.md)

A VS Code extension that plays a sound when a GitHub Copilot agent finishes a turn and hands control back to you. It provides an audible cue so you can stay focused without watching the editor.

Completion detection uses Copilot's `agentStop` hook. The hook feature is currently in preview, so sound notifications are opt-in and require installing the user-level hook. In Remote SSH, the workspace extension watches the hook on the Copilot host and a local UI companion plays the sound on the client machine.

## Features

- Cross-platform support for macOS, Windows, and Linux
- Custom sound files and platform-specific playback commands
- System sound fallback when no custom sound file is configured
- Optional VS Code notification alongside sound playback
- Explicit installation and removal of the Copilot completion hook

## Install the completion hook

1. Open the Command Palette in VS Code.
2. Run **Sound Notifier: Install Copilot Agent Completion Hook**.
3. Start a new Copilot session so it loads the hook configuration.

The hook runs on the Copilot agent runtime host. Node.js 24 or later must be installed there and available as `node` on `PATH`. In a remote or container session, install Node.js in that remote or container environment. In Remote SSH, run the install command from the SSH-connected window so the hook is installed on the host where Copilot runs. The local audio companion is installed automatically as a dependency; if installing VSIX files manually, install both packages.

To remove the hook, run **Sound Notifier: Uninstall Copilot Agent Completion Hook** from the Command Palette. The extension removes only the hook files it manages.

## Configuration

Configure the extension through VS Code settings:

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

`soundNotifier.useVSCodeNotification` shows a VS Code notification in addition to the sound. It does not replace audio playback. Leave a platform's sound file empty to use a system sound. The available audio formats depend on the playback command and operating system; WAV, MP4, WMA, and WebM are supported by the extension's file validation.

## Commands

- **Sound Notifier: Install Copilot Agent Completion Hook** — enable completion sounds for future Copilot sessions
- **Sound Notifier: Uninstall Copilot Agent Completion Hook** — remove the extension-managed user hook
- **Sound Notifier: Play Completion Sound** — play the configured sound manually
- **Sound Notifier: Test Sound** — test the current sound configuration
- **Sound Notifier: Toggle VS Code Completion Notification** — toggle the VS Code toast shown alongside sound playback

## Development

1. Clone this repository.
2. Run `npm install` to install dependencies.
3. Press F5 to launch the Extension Development Host.

Run the tests with `npm test` and compile with `npm run compile`.

## Security

This extension is regularly scanned for security vulnerabilities using GitHub Advanced Security CodeQL, Dependabot, and `npm audit`. For security concerns, please see the [Security Policy](SECURITY.md).

## License

MIT
