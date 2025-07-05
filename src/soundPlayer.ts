import * as vscode from 'vscode';
import * as cp from 'child_process';
import * as path from 'path';
import * as fs from 'fs';

export class SoundPlayer {
    private config: vscode.WorkspaceConfiguration;

    constructor() {
        this.config = vscode.workspace.getConfiguration('copilotSoundNotifier');
    }

    /**
     * Play sound when Copilot agent completes a task
     */
    public async playCompletionSound(): Promise<void> {
        if (!this.config.get<boolean>('enabled', true)) {
            return;
        }

        try {
            await this.playSound();
        } catch (error) {
            console.error('Failed to play completion sound:', error);
        }
    }

    /**
     * Test sound functionality
     */
    public async testSound(): Promise<void> {
        try {
            await this.playSound();
        } catch (error) {
            console.error('Failed to play test sound:', error);
            vscode.window.showErrorMessage(`Failed to play sound: ${error}`);
        }
    }

    /**
     * Play sound based on current platform and configuration
     */
    private async playSound(): Promise<void> {
        const platform = process.platform;
        const soundFiles = this.config.get<any>('soundFiles', {});
        const soundCommands = this.config.get<any>('soundCommands', {});
        
        const customSoundFile = soundFiles[platform];
        const customCommand = soundCommands[platform];

        if (customSoundFile && fs.existsSync(customSoundFile)) {
            // Use custom sound file
            if (customCommand) {
                // Use custom command
                await this.executeCustomCommand(customCommand, customSoundFile);
            } else {
                // Use default command for the platform
                await this.playCustomSoundFile(customSoundFile);
            }
        } else {
            // Use system sound
            await this.playSystemSound();
        }
    }

    /**
     * Execute custom sound command
     */
    private async executeCustomCommand(command: string, soundFile: string): Promise<void> {
        return new Promise((resolve, reject) => {
            const fullCommand = command.replace('{file}', soundFile);
            cp.exec(fullCommand, (error) => {
                if (error) {
                    reject(error);
                } else {
                    resolve();
                }
            });
        });
    }

    /**
     * Play custom sound file using platform-specific default commands
     */
    private async playCustomSoundFile(soundFile: string): Promise<void> {
        const platform = process.platform;
        let command: string;

        switch (platform) {
            case 'win32':
                command = `powershell -c "(New-Object Media.SoundPlayer '${soundFile}').PlaySync()"`;
                break;
            case 'darwin':
                command = `afplay "${soundFile}"`;
                break;
            case 'linux':
                command = `paplay "${soundFile}"`;
                break;
            default:
                throw new Error(`Unsupported platform: ${platform}`);
        }

        return new Promise((resolve, reject) => {
            cp.exec(command, (error) => {
                if (error) {
                    reject(error);
                } else {
                    resolve();
                }
            });
        });
    }

    /**
     * Play system sound
     */
    private async playSystemSound(): Promise<void> {
        const platform = process.platform;
        let command: string;

        switch (platform) {
            case 'win32':
                command = 'powershell -c "[System.Media.SystemSounds]::Exclamation.Play()"';
                break;
            case 'darwin':
                command = 'afplay /System/Library/Sounds/Glass.aiff';
                break;
            case 'linux':
                command = 'paplay /usr/share/sounds/alsa/Front_Left.wav';
                break;
            default:
                // Fallback to VS Code notification sound
                vscode.window.showInformationMessage('Copilot task completed!');
                return;
        }

        return new Promise((resolve, reject) => {
            cp.exec(command, (error) => {
                if (error) {
                    // Fallback to VS Code notification
                    vscode.window.showInformationMessage('Copilot task completed!');
                    resolve();
                } else {
                    resolve();
                }
            });
        });
    }

    /**
     * Validate sound file format
     */
    private isSupportedAudioFormat(filePath: string): boolean {
        const supportedExtensions = ['.mp4', '.wav', '.wma', '.webm'];
        const extension = path.extname(filePath).toLowerCase();
        return supportedExtensions.includes(extension);
    }
}
