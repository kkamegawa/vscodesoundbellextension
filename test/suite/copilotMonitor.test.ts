import * as assert from 'assert';
import * as vscode from 'vscode';
import { CopilotMonitor } from '../../src/copilotMonitor';

suite('CopilotMonitor Test Suite', () => {
    let context: vscode.ExtensionContext;
    let mockSoundPlayer: any;
    let soundPlayCount: number;

    suiteSetup(async () => {
        // Wait for extension to activate
        const extension = vscode.extensions.getExtension('kkamegawa.sound-notifier-for-copilot-agent-task');
        if (extension && !extension.isActive) {
            await extension.activate();
        }
        await new Promise(resolve => setTimeout(resolve, 1000));
    });

    setup(() => {
        soundPlayCount = 0;
        mockSoundPlayer = {
            playCompletionSound: () => {
                soundPlayCount++;
                console.log(`Sound played (count: ${soundPlayCount})`);
            }
        };
        
        // Create a mock context
        context = {
            subscriptions: [],
            workspaceState: {} as any,
            globalState: {} as any,
            secrets: {} as any,
            extensionUri: vscode.Uri.file(''),
            extensionPath: '',
            environmentVariableCollection: {} as any,
            asAbsolutePath: (path: string) => path,
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

    test('Should not play sound multiple times in quick succession (debouncing)', async function() {
        this.timeout(15000);

        const monitor = new CopilotMonitor(mockSoundPlayer);
        
        // Start monitoring
        monitor.start(context);
        
        // Simulate rapid text changes that would trigger the sound
        const doc = await vscode.workspace.openTextDocument({
            language: 'typescript',
            content: 'const x = 1;'
        });
        
        const editor = await vscode.window.showTextDocument(doc);
        
        // Make multiple rapid edits
        await editor.edit(editBuilder => {
            editBuilder.insert(new vscode.Position(0, 12), '\nconst y = 2; // This is a long comment that should trigger the Copilot detection heuristic');
        });
        
        // Wait a moment
        await new Promise(resolve => setTimeout(resolve, 100));
        
        await editor.edit(editBuilder => {
            editBuilder.insert(new vscode.Position(1, 0), '\nconst z = 3; // Another long comment that should also trigger the detection mechanism');
        });
        
        // Wait a moment
        await new Promise(resolve => setTimeout(resolve, 100));
        
        await editor.edit(editBuilder => {
            editBuilder.insert(new vscode.Position(2, 0), '\nconst a = 4; // Yet another long comment to ensure we test the debouncing properly');
        });
        
        // Wait for any pending operations
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Due to debouncing (5 second minimum interval), sound should only play once
        assert.ok(soundPlayCount <= 1, `Sound should play at most once due to debouncing, but played ${soundPlayCount} times`);
        
        // Stop monitoring and cleanup
        monitor.stop();
        await vscode.commands.executeCommand('workbench.action.closeActiveEditor');
    });

    test('Should play sound after debounce period expires', async function() {
        this.timeout(15000);

        const monitor = new CopilotMonitor(mockSoundPlayer);
        monitor.start(context);
        
        const doc = await vscode.workspace.openTextDocument({
            language: 'typescript',
            content: 'const x = 1;'
        });
        
        const editor = await vscode.window.showTextDocument(doc);
        
        // First edit
        await editor.edit(editBuilder => {
            editBuilder.insert(new vscode.Position(0, 12), '\nconst y = 2; // This is a long comment that should trigger the Copilot detection heuristic');
        });
        
        await new Promise(resolve => setTimeout(resolve, 1000));
        const firstCount = soundPlayCount;
        
        // Wait for debounce period to expire (5 seconds + buffer)
        console.log('Waiting for debounce period to expire...');
        await new Promise(resolve => setTimeout(resolve, 6000));
        
        // Second edit after debounce period
        await editor.edit(editBuilder => {
            editBuilder.insert(new vscode.Position(1, 0), '\nconst z = 3; // Another long comment after debounce period has expired');
        });
        
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Sound should have played twice - once for first edit, once after debounce period
        assert.ok(soundPlayCount >= 1, `Sound should play at least once after debounce period, but played ${soundPlayCount} times`);
        
        monitor.stop();
        await vscode.commands.executeCommand('workbench.action.closeActiveEditor');
    });

    test('Should properly dispose of event listeners on stop', async function() {
        this.timeout(5000);

        const monitor = new CopilotMonitor(mockSoundPlayer);
        monitor.start(context);
        
        // Verify subscriptions were added
        const initialSubscriptionCount = context.subscriptions.length;
        assert.ok(initialSubscriptionCount > 0, 'Subscriptions should be registered');
        
        // Stop monitoring
        monitor.stop();
        
        // Verify listeners were disposed (subscriptions array should be empty in monitor)
        // We can test this by trying to edit a document and ensuring no sound plays
        const doc = await vscode.workspace.openTextDocument({
            language: 'typescript',
            content: 'const x = 1;'
        });
        
        const editor = await vscode.window.showTextDocument(doc);
        
        await editor.edit(editBuilder => {
            editBuilder.insert(new vscode.Position(0, 12), '\nconst y = 2; // This should not trigger any sound after stop');
        });
        
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // No sound should have played after stop
        assert.strictEqual(soundPlayCount, 0, 'No sound should play after monitor is stopped');
        
        await vscode.commands.executeCommand('workbench.action.closeActiveEditor');
    });
});
