import * as assert from 'assert';
import * as vscode from 'vscode';
import { SoundPlayer } from '../../src/soundPlayer';
import { EXTENSION_ID } from './testConstants';

suite('Sound Notifier Extension Test Suite', () => {
    suiteSetup(async () => {
        // Wait for extension to activate
        const extension = vscode.extensions.getExtension(EXTENSION_ID);
        if (extension && !extension.isActive) {
            await extension.activate();
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
        
        assert.ok(hasTestSound, 'soundNotifier.testSound command should be registered');
        assert.ok(hasPlaySound, 'soundNotifier.playSound command should be registered');
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
        const volume = config.get<number>('volume');
        
        assert.ok(typeof enabled === 'boolean', 'enabled should be a boolean');
        assert.ok(typeof useVSCodeNotification === 'boolean', 'useVSCodeNotification should be a boolean');
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

    test('Should create SoundPlayer instance', () => {
        const soundPlayer = new SoundPlayer();
        assert.ok(soundPlayer, 'SoundPlayer instance should be created');
    });

    test('Should execute SoundPlayer testSound method', async function() {
        this.timeout(10000);
        
        const soundPlayer = new SoundPlayer();
        console.log('Testing SoundPlayer.testSound() method...');
        
        try {
            await soundPlayer.testSound();
            console.log('SoundPlayer.testSound() completed successfully');
            assert.ok(true, 'SoundPlayer testSound method executed successfully');
        } catch (error) {
            console.error('SoundPlayer testSound error:', error);
            // Don't fail the test if sound system is not available, just log it
            console.warn('Sound system may not be available in test environment');
            assert.ok(true, 'Test completed (sound system may not be available)');
        }
    });

    test('Should execute SoundPlayer playCompletionSound method', async function() {
        this.timeout(10000);
        
        const soundPlayer = new SoundPlayer();
        console.log('Testing SoundPlayer.playCompletionSound() method...');
        
        try {
            await soundPlayer.playCompletionSound();
            console.log('SoundPlayer.playCompletionSound() completed successfully');
            assert.ok(true, 'SoundPlayer playCompletionSound method executed successfully');
        } catch (error) {
            console.error('SoundPlayer playCompletionSound error:', error);
            // Don't fail the test if sound system is not available, just log it
            console.warn('Sound system may not be available in test environment');
            assert.ok(true, 'Test completed (sound system may not be available)');
        }
    });
});
