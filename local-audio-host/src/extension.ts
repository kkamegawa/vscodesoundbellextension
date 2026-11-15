import * as vscode from 'vscode';
import { SoundPlayer } from './soundPlayer';

export function activate(context: vscode.ExtensionContext): void {
    const soundPlayer = new SoundPlayer(context.extensionUri.fsPath);
    const playCompletionSound = vscode.commands.registerCommand(
        'soundNotifierAudio.playCompletionSound',
        () => soundPlayer.playCompletionSound()
    );
    const testSound = vscode.commands.registerCommand(
        'soundNotifierAudio.testSound',
        () => soundPlayer.testSound()
    );

    context.subscriptions.push(playCompletionSound, testSound);
    console.log('Sound Notifier local audio component is active.');
}
