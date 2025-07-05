# VS Code Extension: Copilot Sound Notifier

A VS Code extension that plays sounds when GitHub Copilot agent completes tasks.

## Features

- **Cross-platform support**: Works on macOS, Windows, and Linux
- **Custom sound files**: Support for mp4, wav, wma, webm formats
- **Platform-specific settings**: Configure different sounds and commands for each OS
- **System sound fallback**: Uses OS built-in system sounds when custom files aren't specified
- **Configurable commands**: Customize sound playback commands per platform

## Installation

1. Clone this repository
2. Run `npm install` to install dependencies
3. Press F5 to launch the Extension Development Host
4. The extension will be active and ready to monitor Copilot activity

## Configuration

Configure the extension through VS Code settings:

```json
{
  "copilotSoundNotifier.enabled": true,
  "copilotSoundNotifier.soundFiles": {
    "win32": "C:/path/to/sound.wav",
    "darwin": "/path/to/sound.wav", 
    "linux": "/path/to/sound.wav"
  },
  "copilotSoundNotifier.soundCommands": {
    "win32": "powershell -c (New-Object Media.SoundPlayer \"{file}\").PlaySync()",
    "darwin": "afplay \"{file}\"",
    "linux": "paplay \"{file}\""
  },
  "copilotSoundNotifier.volume": 0.5
}
```

## Supported Audio Formats

- MP4 (.mp4)
- WAV (.wav)
- WMA (.wma)
- WebM (.webm)

## Commands

- `Copilot Sound Notifier: Play Completion Sound` - Manually trigger the completion sound
- `Copilot Sound Notifier: Test Sound` - Test the current sound configuration

## Security

This extension is regularly scanned for security vulnerabilities using:

- **GitHub Advanced Security CodeQL** - Static analysis for code vulnerabilities
- **Dependabot** - Automated dependency vulnerability scanning
- **npm audit** - Package vulnerability checking

For security concerns, please see our [Security Policy](SECURITY.md).

## Development

This extension follows t_wada style development methodology with TDD approach.

### Running Tests

```bash
npm test
```

### Building

```bash
npm run compile
```

## License

MIT
