// API Routes redirector for Vercel
const { exec } = require('child_process');
const path = require('path');

module.exports = (req, res) => {
  // Importing the NestJS application
  const { createServer } = require('http');
  const { parse } = require('url');
  
  // This makes sure we're importing the built dist file
  const app = require('../dist/main');
  
  // Forward the request to the NestJS application
  const server = createServer((req, res) => {
    app.default(req, res);
  });
  
  server.listen(process.env.PORT || 3000);
};
