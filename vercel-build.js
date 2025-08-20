// Script to run during Vercel build
const { execSync } = require('child_process');
const fs = require('fs');

// Ensure the api directory exists
if (!fs.existsSync('./api')) {
  fs.mkdirSync('./api', { recursive: true });
}

// Run the NestJS build
console.log('Building NestJS application...');
execSync('npm run build', { stdio: 'inherit' });
console.log('NestJS build completed');

// Create the serverless function
console.log('Creating serverless function...');
fs.writeFileSync('./api/server.js', `
// This file is auto-generated during build
const { createServer } = require('http');
const { app } = require('../dist/main');

module.exports = (req, res) => {
  const server = createServer((req, res) => {
    // Forward the request to the NestJS application
    app.handle(req, res);
  });
  
  server.listen(process.env.PORT || 3000);
};
`);
console.log('Serverless function created');
