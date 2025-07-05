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
    const playCommand = vscode.commands.registerCommand('copilotSoundNotifier.playSound', () => {
        soundPlayer.playCompletionSound();
    });

    const testCommand = vscode.commands.registerCommand('copilotSoundNotifier.testSound', () => {
        soundPlayer.testSound();
        vscode.window.showInformationMessage('Test sound played!');
    });

    // Add to subscriptions
    context.subscriptions.push(playCommand, testCommand);
    
    // Start monitoring
    copilotMonitor.start(context);
}

export function deactivate() {
    if (copilotMonitor) {
        copilotMonitor.stop();
    }
}
