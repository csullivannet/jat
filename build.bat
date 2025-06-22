@echo off
echo Installing dependencies...
npm install

echo Building the application...
npm run build

echo Creating Windows executable...
npm run dist

echo Build complete! Check the dist folder for your Windows installer.
pause