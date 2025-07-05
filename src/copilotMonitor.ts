import * as vscode from 'vscode';

export class CopilotMonitor {
    private soundPlayer: any;
    private disposables: vscode.Disposable[] = [];
    private isMonitoring: boolean = false;

    constructor(soundPlayer: any) {
        this.soundPlayer = soundPlayer;
    }

    /**
     * Start monitoring Copilot agent activity
     */
    public start(context: vscode.ExtensionContext): void {
        if (this.isMonitoring) {
            return;
        }

        this.isMonitoring = true;

        // Monitor when Copilot agent completes tasks
        // This monitors the terminal output and specific events
        this.monitorTerminalActivity();
        this.monitorCopilotExtensionActivity();
        this.monitorOutputChannels();

        // Add disposables to context
        context.subscriptions.push(...this.disposables);
    }

    /**
     * Stop monitoring
     */
    public stop(): void {
        this.isMonitoring = false;
        this.disposables.forEach(disposable => disposable.dispose());
        this.disposables = [];
    }

    /**
     * Monitor terminal activity for Copilot agent completion
     */
    private monitorTerminalActivity(): void {
        // Monitor terminal creation and changes
        const terminalDisposable = vscode.window.onDidChangeActiveTerminal(terminal => {
            if (terminal) {
                // Check if terminal name or process indicates Copilot activity
                if (this.isLikelyCopilotTerminal(terminal)) {
                    this.onCopilotTaskCompleted();
                }
            }
        });

        this.disposables.push(terminalDisposable);
    }

    /**
     * Monitor Copilot extension activity
     */
    private monitorCopilotExtensionActivity(): void {
        // Monitor for specific Copilot extension events
        const configDisposable = vscode.workspace.onDidChangeConfiguration(event => {
            if (event.affectsConfiguration('github.copilot')) {
                // Copilot configuration changed, might indicate completion
                this.checkForCopilotCompletion();
            }
        });

        this.disposables.push(configDisposable);
    }

    /**
     * Monitor output channels for Copilot activity
     */
    private monitorOutputChannels(): void {
        // Check for GitHub Copilot output channel
        const checkInterval = setInterval(() => {
            if (!this.isMonitoring) {
                clearInterval(checkInterval);
                return;
            }
            
            this.checkCopilotOutputChannel();
        }, 1000);

        const intervalDisposable = new vscode.Disposable(() => {
            clearInterval(checkInterval);
        });

        this.disposables.push(intervalDisposable);
    }

    /**
     * Check if terminal is likely related to Copilot activity
     */
    private isLikelyCopilotTerminal(terminal: vscode.Terminal): boolean {
        const name = terminal.name.toLowerCase();
        return name.includes('copilot') || 
               name.includes('agent') || 
               name.includes('github');
    }

    /**
     * Check if the terminal data indicates Copilot agent completion
     */
    private isCopilotCompletionMessage(data: string): boolean {
        const completionPatterns = [
            /coding agent will continue work/i,
            /task completed/i,
            /implementation complete/i,
            /pull request created/i,
            /github copilot.*complete/i,
            /agent.*finished/i,
            /copilot.*done/i
        ];

        return completionPatterns.some(pattern => pattern.test(data));
    }

    /**
     * Check for Copilot completion in various ways
     */
    private checkForCopilotCompletion(): void {
        // Implementation for checking completion status
        // This could include checking file changes, git status, etc.
        
        // For now, we'll trigger on configuration changes as a simple indicator
        setTimeout(() => {
            if (this.isMonitoring) {
                this.onCopilotTaskCompleted();
            }
        }, 500);
    }

    /**
     * Check Copilot output channel for completion messages
     */
    private checkCopilotOutputChannel(): void {
        // Try to find GitHub Copilot output channel
        // Note: This is a simplified approach as VS Code doesn't provide direct access to all output channels
        
        // We can monitor for document changes that might indicate Copilot activity
        vscode.workspace.onDidChangeTextDocument(event => {
            if (event.document.languageId && this.isLikelyCodeFile(event.document)) {
                // Check if this might be a Copilot-generated change
                if (event.contentChanges.length > 0) {
                    const changes = event.contentChanges;
                    if (this.looksLikeCopilotGeneration(changes)) {
                        this.onCopilotTaskCompleted();
                    }
                }
            }
        });
    }

    /**
     * Check if document is likely a code file
     */
    private isLikelyCodeFile(document: vscode.TextDocument): boolean {
        const codeLanguages = [
            'typescript', 'javascript', 'python', 'java', 'csharp', 
            'cpp', 'c', 'go', 'rust', 'php', 'ruby', 'swift'
        ];
        return codeLanguages.includes(document.languageId);
    }

    /**
     * Check if text changes look like Copilot generation
     */
    private looksLikeCopilotGeneration(changes: readonly vscode.TextDocumentContentChangeEvent[]): boolean {
        // Simple heuristic: large insertions might be Copilot
        return changes.some(change => 
            change.text.length > 50 && 
            change.rangeLength === 0 // insertion, not replacement
        );
    }

    /**
     * Handle Copilot task completion
     */
    private onCopilotTaskCompleted(): void {
        console.log('Copilot task completed detected');
        this.soundPlayer.playCompletionSound();
        
        // Optional: Show notification
        const config = vscode.workspace.getConfiguration('copilotSoundNotifier');
        if (config.get<boolean>('showNotification', false)) {
            vscode.window.showInformationMessage('Copilot task completed!');
        }
    }
}
