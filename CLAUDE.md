# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

JAT (Job Application Tracker) is a React-based Tauri desktop application for tracking job applications. It can run as
both a web application and a native desktop app, with local data persistence and file upload capabilities.

It ALWAYS RUNS LOCALLY! It makes no calls to remote services and all data remains local.

## Development Commands

### Core Development
- `npm install` - Install dependencies
- `npm run dev` - Start webpack dev server at http://localhost:3000 (web version)
- `npm run tauri:dev` - Run Tauri desktop application in development mode
- `npm run build` - Build production web bundle to `build/` directory

### Distribution
- `npm run tauri:build` - Build Tauri desktop application (Windows MSI/NSIS installers)

### Build Process
- Webpack builds the React app to `build/` directory
- Tauri packages the app with Rust backend
- Built files are output to `src-tauri/target/release/bundle/` directory for distribution

## Architecture

### Application Structure
- **React SPA**: Single-page application built with React 18
- **Tauri Wrapper**: Desktop app using Tauri 2.x with Rust backend
- **Data Persistence**: localStorage for web, same storage mechanism in Tauri
- **File Handling**: Base64 encoding for file uploads with in-browser preview

### Key Components
- `src/JobTracker.js` - Main React component containing all application logic
- `src/index.js` - React entry point and DOM mounting
- `src-tauri/src/main.rs` - Tauri Rust main process configuration
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

### Tauri Security
- Secure by default with Rust backend
- No IPC communication - app runs in webview only
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