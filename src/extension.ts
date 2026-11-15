import * as vscode from 'vscode';
import { LocalAudioClient } from './localAudioClient';
import { CopilotMonitor } from './copilotMonitor';

let localAudioClient: LocalAudioClient;
let copilotMonitor: CopilotMonitor;

export function activate(context: vscode.ExtensionContext) {
    console.log('Copilot Sound Notifier is now active!');

    // The sound player lives in a UI extension so it can access local audio.
    localAudioClient = new LocalAudioClient();
    
    // Initialize Copilot monitor
    copilotMonitor = new CopilotMonitor(localAudioClient);

    // Register commands
    const playCommand = vscode.commands.registerCommand('soundNotifier.playSound', async () => {
        await localAudioClient.playCompletionSound();
    });

    const testCommand = vscode.commands.registerCommand('soundNotifier.testSound', async () => {
        try {
            const playbackSource = await localAudioClient.testSound();
            switch (playbackSource) {
                case 'bundled':
                    vscode.window.showInformationMessage('Bundled completion sound played on the local machine.');
                    break;
                case 'custom':
                    vscode.window.showInformationMessage('Configured custom sound played on the local machine.');
                    break;
                case 'system':
                    vscode.window.showWarningMessage('A system sound was used because the configured or bundled audio file could not be played. Check the Extension Host output for details.');
                    break;
                case 'command':
                    vscode.window.showWarningMessage('A fallback sound command was used because the configured or bundled audio file could not be played. Check the Extension Host output for details.');
                    break;
                case 'notification':
                    vscode.window.showWarningMessage('No audio command played a sound; a VS Code notification was shown instead.');
                    break;
                case 'disabled':
                    vscode.window.showWarningMessage('Sound notifications are disabled.');
                    break;
                case 'skipped':
                    vscode.window.showInformationMessage('Sound playback was skipped in the test environment.');
                    break;
                default:
                    vscode.window.showWarningMessage('The sound test finished, but the playback source could not be identified.');
                    break;
            }
        } catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            vscode.window.showErrorMessage(`Could not play a test sound on the local machine: ${message}`);
        }
    });

    const toggleVSCodeNotificationCommand = vscode.commands.registerCommand('soundNotifier.toggleVSCodeNotification', async () => {
        const config = vscode.workspace.getConfiguration('soundNotifier');
        const current = config.get<boolean>('useVSCodeNotification', false);
        await config.update('useVSCodeNotification', !current, vscode.ConfigurationTarget.Global);
        vscode.window.showInformationMessage(`VS Code notification alongside sound: ${!current ? 'Enabled' : 'Disabled'}`);
    });

    const installAgentStopHookCommand = vscode.commands.registerCommand('soundNotifier.installAgentStopHook', async () => {
        const hooksDirectory = copilotMonitor.getUserHooksDirectory();
        const choice = await vscode.window.showWarningMessage(
            'Install a user-level Copilot agent completion hook?',
            { modal: true, detail: `Agent hooks are in preview. This writes extension-managed files to ${hooksDirectory}. Start a new Copilot session after installation.` },
            'Install Hook'
        );

        if (choice !== 'Install Hook') {
            return;
        }

        try {
            const installedAt = copilotMonitor.installAgentStopHook();
            vscode.window.showInformationMessage(`Copilot completion hook installed in ${installedAt}. Start a new Copilot session to load it.`);
        } catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            vscode.window.showErrorMessage(`Could not install the Copilot completion hook: ${message}`);
        }
    });

    const uninstallAgentStopHookCommand = vscode.commands.registerCommand('soundNotifier.uninstallAgentStopHook', async () => {
        const hooksDirectory = copilotMonitor.getUserHooksDirectory();
        const choice = await vscode.window.showWarningMessage(
            'Remove the extension-managed Copilot agent completion hook?',
            { modal: true, detail: `The extension will remove only its managed hook files from ${hooksDirectory}.` },
            'Uninstall Hook'
        );

        if (choice !== 'Uninstall Hook') {
            return;
        }

        try {
            const removedFrom = copilotMonitor.uninstallAgentStopHook();
            vscode.window.showInformationMessage(`Copilot completion hook removed from ${removedFrom}.`);
        } catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            vscode.window.showErrorMessage(`Could not remove the Copilot completion hook: ${message}`);
        }
    });

    // Add to subscriptions
    context.subscriptions.push(
        playCommand,
        testCommand,
        toggleVSCodeNotificationCommand,
        installAgentStopHookCommand,
        uninstallAgentStopHookCommand
    );
    
    // Start monitoring
    copilotMonitor.start(context);
}

export function deactivate() {
    if (copilotMonitor) {
        copilotMonitor.stop();
    }
}
