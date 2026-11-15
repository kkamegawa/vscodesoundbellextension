'use strict';

const fs = require('node:fs');
const path = require('node:path');

const repositoryRoot = path.resolve(__dirname, '..');
const realRepositoryRoot = fs.realpathSync(repositoryRoot);
const generatedDirectories = ['out', path.join('local-audio-host', 'out')];

for (const relativePath of generatedDirectories) {
    const targetPath = path.resolve(repositoryRoot, relativePath);
    const pathFromRoot = path.relative(repositoryRoot, targetPath);
    const normalizedPathFromRoot = path.normalize(pathFromRoot);
    const normalizedRelativePath = path.normalize(relativePath);
    const pathEscapesRepository = normalizedPathFromRoot === '..' ||
        normalizedPathFromRoot.startsWith(`..${path.sep}`);

    if (normalizedPathFromRoot !== normalizedRelativePath || pathEscapesRepository || path.isAbsolute(pathFromRoot)) {
        throw new Error(`Refusing to clean a path outside the repository: ${targetPath}`);
    }

    const realParentPath = fs.realpathSync(path.dirname(targetPath));
    const realParentFromRoot = path.relative(realRepositoryRoot, realParentPath);
    if (realParentFromRoot === '..' || realParentFromRoot.startsWith(`..${path.sep}`) || path.isAbsolute(realParentFromRoot)) {
        throw new Error(`Refusing to clean a path whose parent is outside the repository: ${targetPath}`);
    }

    let targetStat;
    try {
        targetStat = fs.lstatSync(targetPath);
    } catch (error) {
        if (error.code === 'ENOENT') {
            continue;
        }
        throw error;
    }

    if (!targetStat.isDirectory()) {
        throw new Error(`Refusing to clean a non-directory generated path: ${targetPath}`);
    }

    fs.rmSync(targetPath, { recursive: true });
    console.log(`Removed generated output: ${pathFromRoot}`);
}
