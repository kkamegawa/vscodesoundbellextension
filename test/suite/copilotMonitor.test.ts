import * as assert from 'assert';
import { spawnSync } from 'child_process';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import * as vscode from 'vscode';
import { CopilotMonitor } from '../../src/copilotMonitor';
import { EXTENSION_ID } from './testConstants';

suite('CopilotMonitor Test Suite', () => {
    let context: vscode.ExtensionContext;
    let hookDirectory: string;
    let monitor: CopilotMonitor;
    let soundPlayCount: number;

    suiteSetup(async () => {
        const extension = vscode.extensions.getExtension(EXTENSION_ID);
        if (extension && !extension.isActive) {
            await extension.activate();
        }
        await new Promise(resolve => setTimeout(resolve, 500));
    });

    setup(() => {
        soundPlayCount = 0;
        const temporaryDirectory = fs.mkdtempSync(path.join(os.tmpdir(), 'sound-notifier-hook-test-'));
        hookDirectory = path.join(temporaryDirectory, 'copilot', 'hooks');
        monitor = new CopilotMonitor({
            playCompletionSound: () => {
                soundPlayCount++;
            }
        }, {
            hooksDirectory: hookDirectory,
            hookScriptSource: path.resolve(__dirname, '../../../scripts/copilot-agent-stop.cjs')
        });

        context = {
            subscriptions: [],
            workspaceState: {} as any,
            globalState: {} as any,
            secrets: {} as any,
            extensionUri: vscode.Uri.file(''),
            extensionPath: '',
            environmentVariableCollection: {} as any,
            asAbsolutePath: (filePath: string) => filePath,
            storageUri: undefined,
            storagePath: undefined,
            globalStorageUri: vscode.Uri.file(''),
            globalStoragePath: '',
            logUri: vscode.Uri.file(''),
            logPath: '',
            extensionMode: vscode.ExtensionMode.Test,
            extension: {} as any,
            languageModelAccessInformation: {} as any
        };
    });

    teardown(() => {
        monitor.stop();
        fs.rmSync(path.dirname(path.dirname(hookDirectory)), { recursive: true, force: true });
    });

    test('does not treat ordinary document edits as agent completion', async () => {
        monitor.start(context);

        const document = await vscode.workspace.openTextDocument({
            language: 'typescript',
            content: 'const original = 1;'
        });
        const editor = await vscode.window.showTextDocument(document);
        await editor.edit(editBuilder => {
            editBuilder.insert(new vscode.Position(0, document.lineAt(0).text.length), '\nconst generated = 2; // a large insertion is not an agent completion event');
        });

        await new Promise(resolve => setTimeout(resolve, 200));
        assert.strictEqual(soundPlayCount, 0, 'Document edits must not play a completion sound');
        await vscode.commands.executeCommand('workbench.action.closeActiveEditor');
    });

    test('plays only for valid agentStop end-turn signals', async () => {
        monitor.installAgentStopHook();
        monitor.start(context);

        const hookScript = path.join(hookDirectory, 'sound-notifier-agent-stop.cjs');
        const completedTurn = spawnSync('node', [hookScript], {
            input: JSON.stringify({ stopReason: 'end_turn', stop_hook_active: false }),
            encoding: 'utf8'
        });
        const invalidInput = spawnSync('node', [hookScript], { input: '{', encoding: 'utf8' });
        const continuingTurn = spawnSync('node', [hookScript], {
            input: JSON.stringify({ stopReason: 'end_turn', stop_hook_active: true }),
            encoding: 'utf8'
        });
        assert.strictEqual(completedTurn.status, 0, completedTurn.stderr);
        assert.strictEqual(invalidInput.status, 0);
        assert.strictEqual(continuingTurn.status, 0);
        assert.deepStrictEqual(JSON.parse(completedTurn.stdout), {});
        assert.deepStrictEqual(JSON.parse(invalidInput.stdout), {});
        assert.deepStrictEqual(JSON.parse(continuingTurn.stdout), {});

        await waitForSoundCount(1);
        assert.strictEqual(soundPlayCount, 1, 'Only the completed turn should play one sound');
    });

    test('installs and removes only its user-level hook files', () => {
        const installedAt = monitor.installAgentStopHook();
        assert.strictEqual(installedAt, hookDirectory);
        assert.ok(fs.existsSync(path.join(hookDirectory, 'sound-notifier-agent-stop.json')));
        assert.ok(fs.existsSync(path.join(hookDirectory, 'sound-notifier-agent-stop.cjs')));
        assert.ok(fs.existsSync(path.join(hookDirectory, '.sound-notifier-agent-stop-managed')));

        const removedAt = monitor.uninstallAgentStopHook();
        assert.strictEqual(removedAt, hookDirectory);
        assert.ok(!fs.existsSync(path.join(hookDirectory, 'sound-notifier-agent-stop.json')));
        assert.ok(!fs.existsSync(path.join(hookDirectory, 'sound-notifier-agent-stop.cjs')));
        assert.ok(!fs.existsSync(path.join(hookDirectory, '.sound-notifier-agent-stop-managed')));
    });

    async function waitForSoundCount(expectedCount: number): Promise<void> {
        const deadline = Date.now() + 3000;
        while (Date.now() < deadline && soundPlayCount < expectedCount) {
            await new Promise(resolve => setTimeout(resolve, 25));
        }
    }
});
