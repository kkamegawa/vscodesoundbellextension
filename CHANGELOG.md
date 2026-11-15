# Changelog

[日本語](CHANGELOG_ja.md)

All notable changes to the "Sound Notifier for GitHub Copilot" extension will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.1] - 2026-11-15

### Changed

- Republish the Local Audio Host as `KazushiKamegawa.sound-notifier-local-audio-hostex` because the previous Marketplace extension ID cannot be restored
- Update the main extension to depend on the replacement Local Audio Host extension
- Align the main and Local Audio Host extension versions at `1.0.1`

## [0.0.1] - 2025-07-05

### Added

- Initial release of Sound Notifier for GitHub Copilot extension
- Cross-platform sound playback support (Windows, macOS, Linux)
- Configurable sound settings for different platforms
- Custom sound file support with format validation
- Custom sound command configuration
- System sound fallback functionality
- Default OS command configuration for enhanced compatibility
- Test sound command for configuration validation
- Comprehensive configuration options in VS Code settings
- Multi-detection approach for Copilot agent completion monitoring

### Features

- **Cross-Platform Audio Support**: Native audio playback on Windows (PowerShell), macOS (afplay), and Linux (paplay)
- **Custom Sound Files**: Support for MP4, WAV, WMA, and WebM audio formats
- **Flexible Configuration**: Multiple configuration options including custom commands and default system sounds
- **Intelligent Fallbacks**: Graceful degradation from custom sounds to system sounds to VS Code notifications
- **Real-time Monitoring**: Monitors VS Code terminal and document changes for Copilot agent activity
- **Easy Testing**: Built-in test command to validate sound configuration

### Configuration Options

- `soundNotifier.enabled`: Enable/disable sound notifications
- `soundNotifier.soundFiles`: Platform-specific custom sound file paths
- `soundNotifier.soundCommands`: Platform-specific custom audio commands
- `soundNotifier.useDefaultSystemSound`: Use system sounds when custom files unavailable
- `soundNotifier.defaultSoundCommands`: Default OS commands for audio playback

### Commands

- `soundNotifier.testSound`: Test sound playback with current configuration

### Security

- CodeQL static analysis integration
- Dependabot security updates
- Secure command execution practices

### Technical Details

- TypeScript 4.9.4 with strict mode
- Node.js 16.x+ compatibility
- Mocha testing framework with TDD approach
- Cross-platform child process execution
- VS Code Extension API 1.74.0+

## [Unreleased]

### Added

- Opt-in commands to install or uninstall a user-level Copilot `agentStop` hook for completion sounds
- Documentation for hook setup, runtime requirements, and the preview status of Copilot hooks

### Changed

- Completion sounds are now triggered when Copilot finishes a turn through `agentStop`, rather than on terminal focus, Copilot configuration changes, or large document insertions
- Hook installation is explicit and applies to new Copilot sessions; Node.js 24 or later must be available on the agent runtime host

### Planned Features

- Sound themes and presets
- Volume control settings
- Advanced Copilot event detection
- Custom notification messages
- Sound scheduling and quiet hours

---

For more information about this extension, visit the [GitHub repository](https://github.com/kkamegawa/vscodesoundbellextension).
