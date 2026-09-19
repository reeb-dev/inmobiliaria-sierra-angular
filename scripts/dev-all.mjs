import { spawn } from 'node:child_process';

const kids = [
  spawn('node', ['server/index.mjs'], { stdio: 'inherit', env: process.env }),
  spawn(
    'npx',
    [
      'ng',
      'serve',
      '--port',
      '43124',
      '--host',
      '0.0.0.0',
      '--proxy-config',
      'proxy.conf.json',
    ],
    { stdio: 'inherit', env: process.env },
  ),
];

function shutdown() {
  for (const k of kids) k.kill('SIGTERM');
  process.exit(0);
}
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

for (const k of kids) {
  k.on('exit', (code) => {
    console.log('proceso hijo salió', code);
    shutdown();
  });
}
