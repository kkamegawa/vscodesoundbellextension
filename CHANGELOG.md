# Changelog

All notable changes to the "Copilot Sound Notifier" extension will be documented in this file.

## [0.0.1] - 2025-07-05

### Added
- Initial release
- Cross-platform sound notification support (Windows, macOS, Linux)
- Custom sound file configuration per platform
- Support for multiple audio formats (mp4, wav, wma, webm)
- Configurable sound commands per platform
- System sound fallback when custom files aren't specified
- GitHub Copilot agent task completion detection
- Test sound functionality
- Settings for enabling/disabling notifications
- Volume control

### Features
- Monitor GitHub Copilot agent activity
- Play completion sounds when tasks finish
- Platform-specific sound configuration
- TDD development approach with comprehensive tests

### Configuration Options
- `copilotSoundNotifier.enabled`: Enable/disable sound notifications
- `copilotSoundNotifier.soundFiles`: Custom sound files per platform
- `copilotSoundNotifier.soundCommands`: Custom sound commands per platform  
- `copilotSoundNotifier.volume`: Sound volume control
- `copilotSoundNotifier.showNotification`: Show notification messages
