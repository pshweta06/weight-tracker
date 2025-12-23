#!/usr/bin/env node

// Script to verify build exists before starting server
const fs = require('fs');
const path = require('path');

const possiblePaths = [
  path.join(__dirname, '../../client/build'),
  path.join(process.cwd(), 'client/build'),
  path.join(process.cwd(), 'build'),
];

let found = false;
for (const buildPath of possiblePaths) {
  const indexPath = path.join(buildPath, 'index.html');
  if (fs.existsSync(indexPath)) {
    console.log(`✓ Build found at: ${buildPath}`);
    found = true;
    break;
  }
}

if (!found) {
  console.error('✗ Build directory not found!');
  console.error('Tried paths:');
  possiblePaths.forEach(p => console.error(`  - ${p}`));
  console.error('\nCurrent directory:', process.cwd());
  console.error('Please run: npm run build');
  process.exit(1);
}

process.exit(0);

