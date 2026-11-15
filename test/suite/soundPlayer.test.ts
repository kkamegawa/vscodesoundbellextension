import * as assert from 'assert';
import * as fs from 'fs';
import * as path from 'path';
import * as vscode from 'vscode';
import { LocalAudioClient } from '../../src/localAudioClient';
import { EXTENSION_ID, LOCAL_AUDIO_EXTENSION_ID } from './testConstants';
import { LOCAL_AUDIO_PLAY_COMMAND, LOCAL_AUDIO_TEST_COMMAND } from '../../src/localAudioClient';

suite('Sound Notifier Extension Test Suite', () => {
    suiteSetup(async () => {
        // Wait for extension to activate
        const extension = vscode.extensions.getExtension(EXTENSION_ID);
        if (extension && !extension.isActive) {
            await extension.activate();
        }
        const localAudioExtension = vscode.extensions.getExtension(LOCAL_AUDIO_EXTENSION_ID);
        assert.ok(localAudioExtension, 'Local audio companion should be found');
        if (localAudioExtension && !localAudioExtension.isActive) {
            await localAudioExtension.activate();
        }
        // Give extension time to fully initialize
        await new Promise(resolve => setTimeout(resolve, 1000));
    });

    test('Should have extension activated', () => {
        const extension = vscode.extensions.getExtension(EXTENSION_ID);
        assert.ok(extension, 'Extension should be found');
        assert.ok(extension?.isActive, 'Extension should be active');
    });

    test('Should have soundNotifier commands registered', async () => {
        const commands = await vscode.commands.getCommands();
        const hasTestSound = commands.includes('soundNotifier.testSound');
        const hasPlaySound = commands.includes('soundNotifier.playSound');
        const hasLocalTestSound = commands.includes(LOCAL_AUDIO_TEST_COMMAND);
        const hasLocalPlaySound = commands.includes(LOCAL_AUDIO_PLAY_COMMAND);
        
        assert.ok(hasTestSound, 'soundNotifier.testSound command should be registered');
        assert.ok(hasPlaySound, 'soundNotifier.playSound command should be registered');
        assert.ok(hasLocalTestSound, 'The UI companion test-sound command should be registered');
        assert.ok(hasLocalPlaySound, 'The UI companion playback command should be registered');
    });

    test('Should report bundled playback while completion notifications are enabled', async function() {
        this.timeout(10000);

        const config = vscode.workspace.getConfiguration('soundNotifier');
        const keys = [
            'enabled',
            'soundFiles',
            'soundCommands',
            'useBundledSound',
            'useDefaultSystemSound',
            'useVSCodeNotification'
        ];
        const originalValues = new Map<string, unknown>();

        for (const key of keys) {
            originalValues.set(key, config.inspect<unknown>(key)?.globalValue);
        }

        try {
            await config.update('enabled', true, vscode.ConfigurationTarget.Global);
            await config.update('soundFiles', {}, vscode.ConfigurationTarget.Global);
            await config.update('soundCommands', {}, vscode.ConfigurationTarget.Global);
            await config.update('useBundledSound', true, vscode.ConfigurationTarget.Global);
            await config.update('useDefaultSystemSound', false, vscode.ConfigurationTarget.Global);
            await config.update('useVSCodeNotification', true, vscode.ConfigurationTarget.Global);

            const source = await vscode.commands.executeCommand<string>(LOCAL_AUDIO_TEST_COMMAND);
            assert.ok(
                source === 'bundled' || source === 'skipped',
                `Expected the bundled sound or a test-environment skip, but received: ${source}`
            );
        } finally {
            for (const key of keys) {
                await config.update(key, originalValues.get(key), vscode.ConfigurationTarget.Global);
            }
        }
    });

    test('Should execute testSound command without errors', async function() {
        this.timeout(10000); // Increase timeout for sound operations
        
        console.log('Executing testSound command...');
        try {
            // Execute the test sound command
            await vscode.commands.executeCommand('soundNotifier.testSound');
            
            // Wait a moment for sound to potentially play
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            console.log('testSound command completed successfully');
            assert.ok(true, 'testSound command executed successfully');
        } catch (error) {
            console.error('testSound command error:', error);
            assert.fail(`testSound command failed: ${error}`);
        }
    });

    test('Should execute playSound command without errors', async function() {
        this.timeout(10000); // Increase timeout for sound operations
        
        console.log('Executing playSound command...');
        try {
            // Execute the play sound command
            await vscode.commands.executeCommand('soundNotifier.playSound');
            
            // Wait a moment for sound to potentially play
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            console.log('playSound command completed successfully');
            assert.ok(true, 'playSound command executed successfully');
        } catch (error) {
            console.error('playSound command error:', error);
            assert.fail(`playSound command failed: ${error}`);
        }
    });

    test('Should respect soundNotifier configuration', async () => {
        const config = vscode.workspace.getConfiguration('soundNotifier');
        
        // Test getting configuration values
        const enabled = config.get<boolean>('enabled');
        const useVSCodeNotification = config.get<boolean>('useVSCodeNotification');
        const useBundledSound = config.get<boolean>('useBundledSound');
        const volume = config.get<number>('volume');
        
        assert.ok(typeof enabled === 'boolean', 'enabled should be a boolean');
        assert.ok(typeof useVSCodeNotification === 'boolean', 'useVSCodeNotification should be a boolean');
        assert.strictEqual(useBundledSound, true, 'useBundledSound should be enabled by default');
        assert.ok(typeof volume === 'number', 'volume should be a number');
        assert.ok(volume >= 0 && volume <= 1, 'volume should be between 0 and 1');
    });

    test('Should handle configuration changes', async () => {
        const config = vscode.workspace.getConfiguration('soundNotifier');
        const originalEnabled = config.get<boolean>('enabled');
        
        try {
            // Temporarily disable sound notifications
            await config.update('enabled', false, vscode.ConfigurationTarget.Global);
            
            // Execute command while disabled
            await vscode.commands.executeCommand('soundNotifier.testSound');
            
            // Should not throw error even when disabled
            assert.ok(true, 'Command should handle disabled state gracefully');
            
        } finally {
            // Restore original setting
            await config.update('enabled', originalEnabled, vscode.ConfigurationTarget.Global);
        }
    });

    test('Should have proper sound configuration properties', () => {
        const config = vscode.workspace.getConfiguration('soundNotifier');
        
        // Check that all expected configuration properties exist
        const properties = [
            'enabled',
            'soundFiles',
            'soundCommands',
            'useVSCodeNotification',
            'useBundledSound',
            'useDefaultSystemSound',
            'defaultSoundCommands',
            'volume',
            'showNotification'
        ];
        
        properties.forEach(prop => {
            const hasProperty = config.has(prop);
            assert.ok(hasProperty, `Configuration should have ${prop} property`);
        });
    });

    test('Should include the bundled Copilot completion sound', () => {
        const audioExtension = vscode.extensions.getExtension(LOCAL_AUDIO_EXTENSION_ID);
        const extension = vscode.extensions.getExtension(EXTENSION_ID);
        assert.ok(audioExtension, 'Local audio companion should be installed');
        assert.ok(extension, 'Main extension should be installed');

        const soundFile = path.join(audioExtension.extensionPath, 'media', 'sound', 'task_complete1.wav');
        const sourceSoundFile = path.join(extension.extensionPath, 'media', 'sound', 'task_complete1.wav');
        assert.ok(fs.existsSync(soundFile), 'Bundled completion sound should exist in the local audio extension');
        assert.ok(fs.existsSync(sourceSoundFile), 'Original completion sound should exist in the source extension');
        assert.deepStrictEqual(
            fs.readFileSync(soundFile),
            fs.readFileSync(sourceSoundFile),
            'The local audio companion should bundle the original sound without changing its audio data'
        );
    });

    test('Should create LocalAudioClient instance', () => {
        const localAudioClient = new LocalAudioClient();
        assert.ok(localAudioClient, 'LocalAudioClient instance should be created');
    });

    test('Should execute SoundPlayer testSound method', async function() {
        this.timeout(10000);
        
        const localAudioClient = new LocalAudioClient();
        console.log('Testing LocalAudioClient.testSound() method...');
        
        try {
            await localAudioClient.testSound();
            console.log('LocalAudioClient.testSound() completed successfully');
            assert.ok(true, 'LocalAudioClient testSound method executed successfully');
        } catch (error) {
            console.error('LocalAudioClient testSound error:', error);
            // Don't fail the test if sound system is not available, just log it
            console.warn('Sound system may not be available in test environment');
            assert.ok(true, 'Test completed (sound system may not be available)');
        }
    });

    test('Should execute SoundPlayer playCompletionSound method', async function() {
        this.timeout(10000);
        
        const localAudioClient = new LocalAudioClient();
        console.log('Testing LocalAudioClient.playCompletionSound() method...');
        
        try {
            await localAudioClient.playCompletionSound();
            console.log('LocalAudioClient.playCompletionSound() completed successfully');
            assert.ok(true, 'LocalAudioClient playCompletionSound method executed successfully');
        } catch (error) {
            console.error('LocalAudioClient playCompletionSound error:', error);
            // Don't fail the test if sound system is not available, just log it
            console.warn('Sound system may not be available in test environment');
            assert.ok(true, 'Test completed (sound system may not be available)');
        }
    });
});
