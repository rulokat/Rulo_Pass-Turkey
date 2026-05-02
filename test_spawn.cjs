const { spawn } = require('child_process');
const path = require('path');

const exePath = path.join(__dirname, 'resources', 'bin', 'x86_64', 'goodbyedpi.exe');
const p = spawn(exePath, ['--help'], { shell: true, windowsHide: true });

p.stdout.on('data', d => console.log('STDOUT:', d.toString()));
p.stderr.on('data', d => console.log('STDERR:', d.toString()));
p.on('close', c => console.log('CLOSE:', c));
p.on('error', e => console.log('ERROR:', e.message));
