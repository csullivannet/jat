# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

JAT (Job Application Tracker) is a React-based Electron desktop application for tracking job applications. It can run as
both a web application and a native desktop app, with local data persistence and file upload capabilities.

It ALWAYS RUNS LOCALLY! It makes no calls to remote services and all data remains local.

## Development Commands

### Core Development
- `npm install` - Install dependencies
- `npm run dev` - Start webpack dev server at http://localhost:8080 (web version)
- `npm start` - Run Electron desktop application locally
- `npm run build` - Build production web bundle to `build/` directory

### Distribution
- `npm run pack` - Package Electron app (no installer)
- `npm run dist` - Build and create distributable packages
- `npm run dist:win` - Build Windows executables (.exe and portable)
- `npm run dist:all` - Build for all platforms (Windows, Linux, macOS)

### Build Process
- Webpack builds the React app to `build/` directory
- Electron packages the app with `src/main.js` as the main process
- Built files are output to `dist/` directory for distribution

## Architecture

### Application Structure
- **React SPA**: Single-page application built with React 18
- **Electron Wrapper**: Desktop app using Electron 25 with secure defaults
- **Data Persistence**: localStorage for web, same storage mechanism in Electron
- **File Handling**: Base64 encoding for file uploads with in-browser preview

### Key Components
- `src/JobTracker.js` - Main React component containing all application logic
- `src/index.js` - React entry point and DOM mounting
- `src/main.js` - Electron main process configuration
- `public/index.html` - HTML template with Tailwind CSS via CDN

### Data Management
- All job application data stored in localStorage as JSON
- File uploads converted to base64 and embedded in job records
- Export/import functionality for full data backup with embedded files
- Dark mode preference persisted in localStorage

### UI Framework
- Tailwind CSS loaded via CDN for styling
- Lucide React for icons
- Responsive design with dark mode support
- Modal-based forms and file viewers

## Development Notes

### Webpack Configuration
- Entry: `src/index.js`
- Output: `build/bundle.js`
- Dev server runs on port 3000 (not 8080 as mentioned in README)
- Babel loader for React JSX transformation
- CSS loader for style processing

### Electron Security
- `nodeIntegration: false` and `contextIsolation: true` for security
- No IPC communication - app runs in renderer process only
- File operations handled through web APIs (FileReader, localStorage)

### File Support
- Resume and job description uploads
- Accepted formats: PDF, DOC, DOCX, TXT
- In-app file preview for PDF and text files
- Files stored as base64 data URLs within application data

### Cross-Platform Considerations
- Primary development in WSL/Linux environment
- Windows builds require Wine for cross-compilation
- Web version provides immediate cross-platform compatibility
- Portable executable option available for Windows deployment