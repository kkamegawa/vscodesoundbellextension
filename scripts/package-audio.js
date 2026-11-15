'use strict';

const fs = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');

const repositoryRoot = path.resolve(__dirname, '..');
const extensionDirectory = path.join(repositoryRoot, 'local-audio-host');
const modeArguments = process.argv.slice(2);
const packageMode = modeArguments[0] ?? 'package';
const supportedModes = new Set(['package', '--publish-marketplace', '--publish-open-vsx']);
const documentationFiles = [
    ['README.md', 'README.md'],
    ['CHANGELOG.md', 'CHANGELOG.md'],
];
const temporaryFiles = [];

if (modeArguments.length > 1 || !supportedModes.has(packageMode)) {
    throw new Error('Usage: node scripts/package-audio.js [--publish-marketplace|--publish-open-vsx]');
}

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

    if (packageMode !== 'package') {
        const manifest = JSON.parse(fs.readFileSync(path.join(extensionDirectory, 'package.json'), 'utf8'));
        const vsixPath = path.join(extensionDirectory, `${manifest.name}-${manifest.version}.vsix`);
        if (!fs.existsSync(vsixPath)) {
            throw new Error(`Expected companion VSIX was not created: ${vsixPath}`);
        }

        if (packageMode === '--publish-marketplace') {
            runVscodeMarketplacePublish(vsceCli, vsixPath);
        } else {
            runOpenVsxPublish(vsixPath);
        }
    }
} finally {
    for (const temporaryFile of temporaryFiles) {
        fs.rmSync(temporaryFile, { force: true });
    }
}

function runVscodeMarketplacePublish(vsceCli, vsixPath) {
    const result = spawnSync(process.execPath, [
        vsceCli,
        'publish',
        '--no-yarn',
        '--packagePath',
        vsixPath,
    ], {
        cwd: repositoryRoot,
        stdio: 'inherit',
    });

    assertSuccessfulCommand(result, 'VSCE publish');
}

function runOpenVsxPublish(vsixPath) {
    const npmCli = process.env.npm_execpath;
    if (!npmCli) {
        throw new Error('Open VSX publishing must be run through npm so its CLI can be resolved.');
    }

    const result = spawnSync(process.execPath, [
        npmCli,
        'exec',
        '--yes',
        '--package=ovsx',
        '--',
        'ovsx',
        'publish',
        vsixPath,
    ], {
        cwd: repositoryRoot,
        stdio: 'inherit',
    });

    assertSuccessfulCommand(result, 'Open VSX publish');
}

function assertSuccessfulCommand(result, commandName) {
    if (result.error) {
        throw result.error;
    }
    if (result.status !== 0) {
        throw new Error(`${commandName} exited with status ${result.status ?? 'unknown'}.`);
    }
}
