# VS Code Extension Development Instructions

## Development Methodology (t_wada style)

- Write tests first (Test-Driven Development: TDD).
- Use small, incremental commits.
- Refactor code frequently to improve readability and maintainability.
- Prefer clear, intention-revealing names for variables, functions, and classes.
- Keep functions and modules small and focused.
- Use TypeScript for all source code.

## Testing Guidelines (t_wada style)

- Write tests using a behavior-driven approach (e.g., Mocha + Chai or Jest).
- Place test files in the `src/test` directory, mirroring the source structure.
- Use descriptive test names and assertions.
- Run tests frequently during development.
- Ensure all new features and bug fixes are covered by tests.
- Use VS Code's built-in test runner or `npm test` to execute tests.

## Security Guidelines

- Follow GitHub Advanced Security best practices
- CodeQL static analysis runs on every push and pull request
- All dependencies are automatically scanned by Dependabot
- Run `npm audit` before committing changes
- Report security vulnerabilities through GitHub Security Advisories

## Development & Debugging

1. Press F5 to launch the Extension Development Host.
2. The entry point is `src/extension.ts`.
3. Use `console.log` for debug output.
4. Use TypeScript strict mode and enable all recommended compiler options.

## Pull Requests & Code Review

- Create an Issue for new features or bug fixes.
- All code changes must be reviewed before merging.
- Ensure all tests pass before submitting a pull request.

## References

- For detailed API reference, see the [VS Code API documentation](https://code.visualstudio.com/api).
