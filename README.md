# JAT (Job Application Tracker)

Only ~ V ~ I ~ B ~ E ~ S ~

A job application tracker vibed by Claude.

## Development Setup (WSL/Linux)

1. Install dependencies:
```bash
npm install
```

2. Run in development mode:
```bash
npm run dev
```
   This starts the webpack dev server. Access the web app in your Windows browser at `http://localhost:8080`

3. Test Electron app locally:
```bash
npm start
```

## Building for Windows

### From WSL/Linux:
```bash
# Build Windows executable (requires Wine for cross-compilation)
npm run dist:win

# Or build for all platforms
npm run dist:all
```

### Alternative: Browser Version
For immediate Windows compatibility, you can run the web version:

1. Build the web app:
```bash
npm run build
```

2. Copy the `build/` folder to Windows and serve it with any web server, or open `build/index.html` directly in Chrome/Firefox.

## Files Structure

- `src/JobTracker.js` - Main React component
- `src/index.js` - React entry point
- `src/main.js` - Electron main process
- `public/index.html` - HTML template
- `webpack.config.js` - Build configuration
- `package.json` - Dependencies and build scripts

## Features

- Track job applications with status stages
- Upload and view resume/job description files
- Export/import data as JSON backup
- Statistics dashboard
- Responsive design with Tailwind CSS

## Windows Deployment Options

1. **Electron App**: Full desktop application with native OS integration
2. **Portable Executable**: Single .exe file that doesn't require installation
3. **Web App**: Runs in any modern browser (Chrome, Firefox, Edge)

The built files will be in the `dist/` folder after running the build commands.