# Coaster Studio

© 2025 Coaster Studio Holdings, All Rights Reserved

## Local development and GitHub Pages

This repo is a static site. `npm start` now runs a simple static server for local preview (suitable for GitHub Pages-style hosting). Note: Netlify functions will not run on GitHub Pages — use Netlify or a server for serverless functions.

PowerShell (example):

```powershell
# install dependencies once
npm install

# start a local static server at http://localhost:5000
npm start
```

To publish the site to GitHub Pages (publishes the repository root):

```powershell
# ensure your repo is committed and pushed
npm run deploy
```

If you want functions to run in development, use Netlify Dev (`npx netlify dev`) — that runs functions locally but is separate from GitHub Pages deployments.
