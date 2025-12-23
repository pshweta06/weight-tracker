#!/usr/bin/env node

// Script to verify build exists before starting server
const fs = require('fs');
const path = require('path');

// Check multiple possible build locations (handles different deployment environments)
const possiblePaths = [
  path.join(process.cwd(), 'client/build'),      // Standard: project root/client/build
  path.join(__dirname, '../../client/build'),    // Relative to scripts directory
  path.join(process.cwd(), 'build'),             // Alternative: project root/build
  path.join(process.cwd(), 'src/client/build'),  // Render alternative structure
  path.join(process.cwd(), 'src/build'),         // Render alternative structure
  path.join(process.cwd(), 'client/dist'),       // Vite default (if config changed)
  path.join(__dirname, '../client/build'),       // If scripts is at root level
];

let found = false;
let foundPath = null;

for (const buildPath of possiblePaths) {
  const indexPath = path.join(buildPath, 'index.html');
  if (fs.existsSync(indexPath)) {
    console.log(`✓ Build found at: ${buildPath}`);
    found = true;
    foundPath = buildPath;
    break;
  }
}

if (!found) {
  console.error('✗ Build directory not found!');
  console.error('Tried paths:');
  possiblePaths.forEach(p => {
    const exists = fs.existsSync(p);
    console.error(`  - ${p} ${exists ? '(exists but no index.html)' : '(not found)'}`);
  });
  console.error('\nCurrent directory:', process.cwd());
  console.error('__dirname:', __dirname);
  
  // List what actually exists
  console.error('\nChecking what exists:');
  const clientPath = path.join(process.cwd(), 'client');
  if (fs.existsSync(clientPath)) {
    console.error(`client/ directory exists, contents:`, fs.readdirSync(clientPath));
  }
  
  console.error('\nPlease ensure the build completed successfully.');
  console.error('Run: npm run build');
  process.exit(1);
}

process.exit(0);

