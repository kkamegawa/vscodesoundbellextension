import * as path from 'path';

export async function run(): Promise<void> {
    // Create the mocha test
    const Mocha = require('mocha');
    const globSync = require('glob').sync;
    const mocha = new Mocha({
        ui: 'tdd',
        color: true,
        timeout: 10000
    });

    const testsRoot = path.resolve(__dirname, '..');

    try {
        // globSyncで同期的にファイルリストを取得
    const files: string[] = globSync('**/*.test.js', { cwd: testsRoot });

        console.log(`Found ${files.length} test files`);

        files.forEach(f => {
            console.log(`Adding test file: ${f}`);
            mocha.addFile(path.resolve(testsRoot, f));
        });

        return new Promise<void>((resolve, reject) => {
            try {
                mocha.run((failures: number) => {
                    if (failures > 0) {
                        reject(new Error(`${failures} tests failed.`));
                    } else {
                        resolve();
                    }
                });
            } catch (err) {
                console.error(err);
                reject(err);
            }
        });
    } catch (err) {
        console.error('Failed to find test files:', err);
        throw err;
    }
}
