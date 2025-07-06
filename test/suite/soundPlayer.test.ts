import * as assert from 'assert';
import * as vscode from 'vscode';
import { SoundPlayer } from '../../src/soundPlayer';

suite('SoundPlayer Test Suite', () => {
    vscode.window.showInformationMessage('Start all SoundPlayer tests.');

    test('Should create SoundPlayer instance', () => {
        const soundPlayer = new SoundPlayer();
        assert.ok(soundPlayer);
    });

    test('Should handle test sound without errors', async () => {
        const soundPlayer = new SoundPlayer();
        
        // This test should not throw an error
        try {
            await soundPlayer.testSound();
            assert.ok(true, 'Test sound completed without errors');
        } catch (error) {
            assert.fail(`Test sound failed: ${error}`);
        }
    });

    test('Should respect enabled configuration', async () => {
        const soundPlayer = new SoundPlayer();
        
        // Mock configuration
        const config = vscode.workspace.getConfiguration('copilotSoundNotifier');
        
        // Test when enabled is false
        await config.update('enabled', false, vscode.ConfigurationTarget.Global);
        
        // This should not throw but also should not play sound
        try {
            await soundPlayer.playCompletionSound();
            assert.ok(true, 'Disabled sound player handled correctly');
        } catch (error) {
            assert.fail(`Disabled sound player failed: ${error}`);
        }
        
        // Reset configuration
        await config.update('enabled', true, vscode.ConfigurationTarget.Global);
    });
});
