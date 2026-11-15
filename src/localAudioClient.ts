import * as vscode from 'vscode';

export const LOCAL_AUDIO_PLAY_COMMAND = 'soundNotifierAudio.playCompletionSound';
export const LOCAL_AUDIO_TEST_COMMAND = 'soundNotifierAudio.testSound';

/** Routes sound requests from the workspace host to the local UI extension. */
export class LocalAudioClient {
    private hasShownUnavailableMessage = false;

    public async playCompletionSound(): Promise<void> {
        try {
            await vscode.commands.executeCommand(LOCAL_AUDIO_PLAY_COMMAND);
        } catch (error) {
            console.error('Could not reach the local sound playback extension:', error);
            this.showUnavailableMessage();
        }
    }

    public async testSound(): Promise<void> {
        await vscode.commands.executeCommand(LOCAL_AUDIO_TEST_COMMAND);
    }

    private showUnavailableMessage(): void {
        if (this.hasShownUnavailableMessage) {
            return;
        }

        this.hasShownUnavailableMessage = true;
        vscode.window.showErrorMessage(
            'Local sound playback is unavailable. Reinstall the Sound Notifier audio component and reload VS Code.'
        );
    }
}
