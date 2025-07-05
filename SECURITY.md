# Security Policy

## Supported Versions

Use this section to tell people about which versions of your project are
currently being supported with security updates.

| Version | Supported          |
| ------- | ------------------ |
| 0.0.x   | :white_check_mark: |

## Reporting a Vulnerability

Use this section to tell people how to report a vulnerability.

To report a security vulnerability, please use the GitHub Security Advisory ["Report a Vulnerability"](https://github.com/your-username/copilot-sound-notifier/security/advisories/new) tab.

We will send a response indicating the next steps in handling your report. After the initial reply to your report, the security team will keep you informed of the progress towards a fix and full announcement, and may ask for additional information or guidance.

Please report security vulnerabilities in third-party modules to the person or team maintaining the module.

## Security Considerations

This VS Code extension:

- Does not collect or transmit personal data
- Only accesses local file system for custom sound files (with user permission)
- Executes system commands only for playing audio files
- Does not make network requests
- Does not access sensitive VS Code APIs beyond what's necessary for functionality

## Security Best Practices

When using this extension:

1. Only use trusted sound files from reliable sources
2. Be cautious when specifying custom sound commands
3. Regularly update the extension to get security fixes
4. Review file permissions when using custom sound files
