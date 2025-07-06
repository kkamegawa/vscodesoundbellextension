import * as vscode from 'vscode';
import { SoundPlayer } from './soundPlayer';
import { CopilotMonitor } from './copilotMonitor';

let soundPlayer: SoundPlayer;
let copilotMonitor: CopilotMonitor;

export function activate(context: vscode.ExtensionContext) {
    console.log('Copilot Sound Notifier is now active!');

    // Initialize sound player
    soundPlayer = new SoundPlayer();
    
    // Initialize Copilot monitor
    copilotMonitor = new CopilotMonitor(soundPlayer);

    // Register commands
    const playCommand = vscode.commands.registerCommand('soundNotifier.playSound', () => {
        soundPlayer.playCompletionSound();
    });

    const testCommand = vscode.commands.registerCommand('soundNotifier.testSound', () => {
        soundPlayer.testSound();
        vscode.window.showInformationMessage('Test sound played! Check console for debug info.');
    });

    const toggleVSCodeNotificationCommand = vscode.commands.registerCommand('soundNotifier.toggleVSCodeNotification', async () => {
        const config = vscode.workspace.getConfiguration('soundNotifier');
        const current = config.get<boolean>('useVSCodeNotification', false);
        await config.update('useVSCodeNotification', !current, vscode.ConfigurationTarget.Global);
        vscode.window.showInformationMessage(`VS Code notification mode: ${!current ? 'Enabled' : 'Disabled'}`);
    });

    // Add to subscriptions
    context.subscriptions.push(playCommand, testCommand, toggleVSCodeNotificationCommand);
    
    // Start monitoring
    copilotMonitor.start(context);
}

export function deactivate() {
    if (copilotMonitor) {
        copilotMonitor.stop();
    }
}
