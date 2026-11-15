import * as crypto from 'crypto';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import * as vscode from 'vscode';

const HOOK_CONFIG_FILE = 'sound-notifier-agent-stop.json';
const HOOK_SCRIPT_FILE = 'sound-notifier-agent-stop.cjs';
const HOOK_MARKER_FILE = '.sound-notifier-agent-stop-managed';
const EVENT_DIRECTORY = '.sound-notifier-events';
const MANAGED_MARKER_PREFIX = 'sound-notifier-agent-stop-hook-v1';
const SCRIPT_OWNERSHIP_HEADER = '// Managed by the Sound Notifier VS Code extension.';
const MAX_SIGNAL_AGE_MS = 30_000;
const MAX_HANDLED_SIGNALS = 256;

export interface CopilotMonitorOptions {
    extensionPath?: string;
    hooksDirectory?: string;
    hookScriptSource?: string;
}

interface ManagedFilesMarker {
    scriptHash: string;
    configHash: string;
}

/**
 * Receives completion signals from the opt-in Copilot agentStop hook.
 */
export class CopilotMonitor {
    private readonly soundPlayer: { playCompletionSound: () => Promise<void> | void };
    private readonly hooksDirectory: string;
    private readonly configPath: string;
    private readonly scriptPath: string;
    private readonly markerPath: string;
    private readonly eventDirectory: string;
    private readonly hookScriptSource: string;
    private watcher?: fs.FSWatcher;
    private isStarted = false;
    private readonly handledSignals = new Set<string>();

    constructor(
        soundPlayer: { playCompletionSound: () => Promise<void> | void },
        options: CopilotMonitorOptions = {}
    ) {
        this.soundPlayer = soundPlayer;
        const copilotHome = process.env.COPILOT_HOME || path.join(os.homedir(), '.copilot');
        this.hooksDirectory = options.hooksDirectory || path.resolve(copilotHome, 'hooks');
        const extensionPath = options.extensionPath || path.resolve(__dirname, '..', '..');
        this.hookScriptSource = options.hookScriptSource || path.join(extensionPath, 'scripts', 'copilot-agent-stop.cjs');
        this.configPath = path.join(this.hooksDirectory, HOOK_CONFIG_FILE);
        this.scriptPath = path.join(this.hooksDirectory, HOOK_SCRIPT_FILE);
        this.markerPath = path.join(this.hooksDirectory, HOOK_MARKER_FILE);
        this.eventDirectory = path.join(this.hooksDirectory, EVENT_DIRECTORY);
    }

    /** Start listening for signals if the user-level hook is installed. */
    public start(context?: vscode.ExtensionContext): void {
        if (this.isStarted) {
            return;
        }

        this.isStarted = true;
        this.startWatching();
        context?.subscriptions.push(new vscode.Disposable(() => this.stop()));
    }

    public getUserHooksDirectory(): string {
        return this.hooksDirectory;
    }

    /** Stop listening for hook signals. */
    public stop(): void {
        this.isStarted = false;
        this.watcher?.close();
        this.watcher = undefined;
        this.handledSignals.clear();
    }

    /**
     * Install the extension-owned user-level Copilot hook. Existing files are
     * preserved unless they carry a matching ownership marker and hashes.
     */
    public installAgentStopHook(): string {
        const sourceScript = fs.readFileSync(this.hookScriptSource, 'utf8');
        if (!sourceScript.startsWith(SCRIPT_OWNERSHIP_HEADER)) {
            throw new Error('The bundled Copilot hook script is missing its ownership header.');
        }

        const config = this.createHookConfig();
        const configContent = `${JSON.stringify(config, null, 2)}\n`;
        const scriptHash = this.hash(sourceScript);
        const configHash = this.hash(configContent);

        if (this.isAlreadyInstalled(scriptHash, configHash)) {
            if (this.isStarted) {
                this.startWatching();
            }
            return this.hooksDirectory;
        }

        fs.mkdirSync(this.hooksDirectory, { recursive: true });
        try {
            fs.mkdirSync(this.eventDirectory);
            this.writeFile(this.scriptPath, sourceScript);
            this.writeFile(this.configPath, configContent);
            this.writeFile(this.markerPath, this.serializeMarker({ scriptHash, configHash }));
        } catch (error) {
            this.removeIfExists(this.markerPath);
            this.removeIfExists(this.configPath);
            this.removeIfExists(this.scriptPath);
            this.removeDirectoryIfEmpty(this.eventDirectory);
            throw error;
        }

        if (this.isStarted) {
            this.startWatching();
        }

        return this.hooksDirectory;
    }

    /** Remove only files whose contents still match this extension's marker. */
    public uninstallAgentStopHook(): string {
        const marker = this.readMarker();
        if (!marker) {
            throw new Error('The Sound Notifier Copilot hook is not installed or its managed files were changed.');
        }

        if (this.fileHash(this.scriptPath) !== marker.scriptHash || this.fileHash(this.configPath) !== marker.configHash) {
            throw new Error('A managed Copilot hook file has changed. The files were preserved for review.');
        }

        this.stopWatching();
        this.removeIfExists(this.configPath);
        this.removeIfExists(this.scriptPath);
        this.removeIfExists(this.markerPath);
        this.removeSignalFiles();
        this.removeDirectoryIfEmpty(this.eventDirectory);
        return this.hooksDirectory;
    }

    private createHookConfig(): object {
        return {
            version: 1,
            hooks: {
                // The Copilot harness uses camelCase events with camelCase payloads.
                agentStop: [
                    {
                        type: 'command',
                        bash: `node ${this.quotePosix(this.scriptPath)}`,
                        powershell: `node '${this.scriptPath.replace(/'/g, "''")}'`,
                        timeoutSec: 10
                    }
                ]
            }
        };
    }

    private isAlreadyInstalled(scriptHash: string, configHash: string): boolean {
        const hasAnyTarget = [this.configPath, this.scriptPath, this.markerPath, this.eventDirectory]
            .some(target => fs.existsSync(target));

        if (!hasAnyTarget) {
            return false;
        }

        const marker = this.readMarker();
        if (!marker) {
            throw new Error(`A file already exists in ${this.hooksDirectory}; it was left unchanged.`);
        }

        if (this.fileHash(this.scriptPath) !== marker.scriptHash || this.fileHash(this.configPath) !== marker.configHash) {
            throw new Error('A managed Copilot hook file has changed. The files were left unchanged.');
        }

        if (marker.scriptHash !== scriptHash || marker.configHash !== configHash) {
            throw new Error('A different version of the Copilot hook is already installed. Uninstall it before reinstalling.');
        }

        return true;
    }

    private startWatching(): void {
        if (this.watcher || !this.hasValidInstalledFiles()) {
            return;
        }

        try {
            fs.mkdirSync(this.eventDirectory, { recursive: true });
            this.watcher = fs.watch(this.eventDirectory, (_eventType, filename) => {
                if (filename) {
                    this.handleSignalFile(filename.toString());
                } else {
                    this.scanSignalFiles();
                }
            });
            this.scanSignalFiles();
        } catch (error) {
            console.warn('Could not watch the Copilot agentStop signal directory:', error);
            this.watcher = undefined;
        }
    }

    private stopWatching(): void {
        this.watcher?.close();
        this.watcher = undefined;
    }

    private hasValidInstalledFiles(): boolean {
        const marker = this.readMarker();
        return Boolean(marker &&
            this.fileHash(this.scriptPath) === marker.scriptHash &&
            this.fileHash(this.configPath) === marker.configHash);
    }

    private scanSignalFiles(): void {
        try {
            for (const filename of fs.readdirSync(this.eventDirectory)) {
                this.handleSignalFile(filename);
            }
        } catch {
            // The hook directory can be removed while the extension is running.
        }
    }

    private handleSignalFile(filename: string): void {
        if (!/^event-\d+-\d+-[a-f0-9-]+\.signal$/i.test(filename) || this.handledSignals.has(filename)) {
            return;
        }

        const timestampMatch = /^event-(\d+)-/.exec(filename);
        if (!timestampMatch) {
            return;
        }

        const age = Date.now() - Number(timestampMatch[1]);
        const signalPath = path.join(this.eventDirectory, filename);
        this.handledSignals.add(filename);
        if (this.handledSignals.size > MAX_HANDLED_SIGNALS) {
            const oldestSignal = this.handledSignals.values().next().value;
            if (oldestSignal !== undefined) {
                this.handledSignals.delete(oldestSignal);
            }
        }
        this.removeIfExists(signalPath);

        if (age < 0 || age > MAX_SIGNAL_AGE_MS) {
            return;
        }

        try {
            void this.soundPlayer.playCompletionSound();
        } catch (error) {
            console.error('Failed to play the Copilot completion sound:', error);
        }
    }

    private removeSignalFiles(): void {
        try {
            for (const filename of fs.readdirSync(this.eventDirectory)) {
                if (/^event-\d+-\d+-[a-f0-9-]+\.signal$/i.test(filename)) {
                    this.removeIfExists(path.join(this.eventDirectory, filename));
                }
            }
        } catch {
            // The event directory may not exist or may already have been removed.
        }
    }

    private quotePosix(value: string): string {
        return `'${value.replace(/'/g, `'\\''`)}'`;
    }

    private hash(value: string): string {
        return crypto.createHash('sha256').update(value).digest('hex');
    }

    private fileHash(filePath: string): string | undefined {
        try {
            return this.hash(fs.readFileSync(filePath, 'utf8'));
        } catch {
            return undefined;
        }
    }

    private readMarker(): ManagedFilesMarker | undefined {
        try {
            const lines = fs.readFileSync(this.markerPath, 'utf8').trim().split('\n');
            if (lines.length !== 3 || lines[0] !== MANAGED_MARKER_PREFIX) {
                return undefined;
            }
            if (!/^[a-f0-9]{64}$/.test(lines[1]) || !/^[a-f0-9]{64}$/.test(lines[2])) {
                return undefined;
            }
            return { scriptHash: lines[1], configHash: lines[2] };
        } catch {
            return undefined;
        }
    }

    private serializeMarker(marker: ManagedFilesMarker): string {
        return `${MANAGED_MARKER_PREFIX}\n${marker.scriptHash}\n${marker.configHash}\n`;
    }

    private writeFile(filePath: string, content: string): void {
        const temporaryPath = `${filePath}.tmp-${process.pid}`;
        fs.writeFileSync(temporaryPath, content, { encoding: 'utf8', mode: 0o600 });
        fs.renameSync(temporaryPath, filePath);
    }

    private removeIfExists(filePath: string): void {
        try {
            fs.unlinkSync(filePath);
        } catch (error) {
            if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
                throw error;
            }
        }
    }

    private removeDirectoryIfEmpty(directoryPath: string): void {
        try {
            fs.rmdirSync(directoryPath);
        } catch {
            // Keep directories containing files not created by this extension.
        }
    }
}
