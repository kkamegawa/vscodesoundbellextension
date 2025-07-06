const cp = require('child_process');

console.log('Testing sound playback methods...');

const testCommands = [
    'powershell -c "[System.Media.SystemSounds]::Exclamation.Play()"',
    'powershell -c "[console]::beep(800,200)"',
    'powershell -c "echo `a"',
];

async function testSound(command, index) {
    return new Promise((resolve) => {
        console.log(`\nTesting command ${index + 1}: ${command}`);
        
        const startTime = Date.now();
        cp.exec(command, { timeout: 5000 }, (error, stdout, stderr) => {
            const duration = Date.now() - startTime;
            
            if (error) {
                console.log(`❌ Failed (${duration}ms):`, error.message);
            } else {
                console.log(`✅ Success (${duration}ms)`);
                if (stdout) console.log(`   stdout: ${stdout.trim()}`);
                if (stderr) console.log(`   stderr: ${stderr.trim()}`);
            }
            resolve();
        });
    });
}

async function runTests() {
    for (let i = 0; i < testCommands.length; i++) {
        await testSound(testCommands[i], i);
        // Wait a bit between tests
        await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    console.log('\nSound tests completed.');
}

runTests().catch(console.error);
