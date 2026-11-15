// Managed by the Sound Notifier VS Code extension.
'use strict';

const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');

function writeHookOutput() {
    process.stdout.write('{}\n');
}

function readEvent() {
    try {
        const input = fs.readFileSync(0, 'utf8');
        return JSON.parse(input);
    } catch {
        return undefined;
    }
}

function isCompletedTurn(event) {
    if (!event || typeof event !== 'object' || Array.isArray(event)) {
        return false;
    }

    const isEndTurn = event.stopReason === 'end_turn' || event.stop_reason === 'end_turn';
    return isEndTurn && event.stop_hook_active !== true && event.stopHookActive !== true;
}

function signalExtension() {
    const eventDirectory = path.join(__dirname, '.sound-notifier-events');
    const timestamp = Date.now();
    const signalPath = path.join(
        eventDirectory,
        `event-${timestamp}-${process.pid}-${crypto.randomUUID()}.signal`
    );

    try {
        fs.mkdirSync(eventDirectory, { recursive: true });
        fs.writeFileSync(signalPath, '', { flag: 'wx' });
    } catch {
        // Notifications must never interrupt the agent if the extension folder is unavailable.
    }
}

try {
    const event = readEvent();
    if (isCompletedTurn(event)) {
        signalExtension();
    }
} finally {
    writeHookOutput();
}
