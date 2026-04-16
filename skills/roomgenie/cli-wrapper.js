#!/usr/bin/env node
const { spawnSync } = require('child_process');

function main() {
  const args = process.argv.slice(2);
  const processedArgs = [];

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    if (arg === '--city' || arg === '--keyword') {
      processedArgs.push(arg);
      i++;
      if (i < args.length) {
        const value = args[i];
        const encodedValue = encodeURIComponent(value);
        processedArgs.push(encodedValue);
      }
    } else {
      processedArgs.push(arg);
    }
  }

  const result = spawnSync('roomgenie', processedArgs, {
    encoding: 'utf8',
    stdio: ['inherit', 'pipe', 'pipe']
  });

  if (result.stdout) {
    console.log(result.stdout);
  }

  if (result.stderr) {
    console.error(result.stderr);
  }

  process.exit(result.status || 0);
}

main();
