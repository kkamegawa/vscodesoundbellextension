'use strict';

const fs = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');

const repositoryRoot = path.resolve(__dirname, '..');
const extensionDirectory = path.join(repositoryRoot, 'local-audio-host');
const documentationFiles = [
    ['README.md', 'README.md'],
    ['CHANGELOG.md', 'CHANGELOG.md'],
];
const temporaryFiles = [];

try {
    for (const [sourceName, targetName] of documentationFiles) {
        const sourcePath = path.join(repositoryRoot, sourceName);
        const targetPath = path.join(extensionDirectory, targetName);

        if (fs.existsSync(targetPath)) {
            throw new Error(`Refusing to overwrite companion documentation: ${targetPath}`);
        }

        fs.copyFileSync(sourcePath, targetPath);
        temporaryFiles.push(targetPath);
    }

    const vsceCli = path.join(repositoryRoot, 'node_modules', '@vscode', 'vsce', 'vsce');
    const result = spawnSync(process.execPath, [
        vsceCli,
        'package',
        '--no-dependencies',
        '--readme-path', 'README.md',
        '--changelog-path', 'CHANGELOG.md',
    ], {
        cwd: extensionDirectory,
        stdio: 'inherit',
    });

    if (result.error) {
        throw result.error;
    }
    if (result.status !== 0) {
        throw new Error(`VSCE package exited with status ${result.status ?? 'unknown'}.`);
    }
} finally {
    for (const temporaryFile of temporaryFiles) {
        fs.rmSync(temporaryFile, { force: true });
    }
}
