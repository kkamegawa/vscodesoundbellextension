"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const assert = __importStar(require("assert"));
const vscode = __importStar(require("vscode"));
const soundPlayer_1 = require("../../soundPlayer");
suite('SoundPlayer Test Suite', () => {
    vscode.window.showInformationMessage('Start all SoundPlayer tests.');
    test('Should create SoundPlayer instance', () => {
        const soundPlayer = new soundPlayer_1.SoundPlayer();
        assert.ok(soundPlayer);
    });
    test('Should handle test sound without errors', async () => {
        const soundPlayer = new soundPlayer_1.SoundPlayer();
        // This test should not throw an error
        try {
            await soundPlayer.testSound();
            assert.ok(true, 'Test sound completed without errors');
        }
        catch (error) {
            assert.fail(`Test sound failed: ${error}`);
        }
    });
    test('Should respect enabled configuration', async () => {
        const soundPlayer = new soundPlayer_1.SoundPlayer();
        // Mock configuration
        const config = vscode.workspace.getConfiguration('copilotSoundNotifier');
        // Test when enabled is false
        await config.update('enabled', false, vscode.ConfigurationTarget.Global);
        // This should not throw but also should not play sound
        try {
            await soundPlayer.playCompletionSound();
            assert.ok(true, 'Disabled sound player handled correctly');
        }
        catch (error) {
            assert.fail(`Disabled sound player failed: ${error}`);
        }
        // Reset configuration
        await config.update('enabled', true, vscode.ConfigurationTarget.Global);
    });
});
//# sourceMappingURL=soundPlayer.test.js.map