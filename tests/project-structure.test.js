const fs = require('fs');
const path = require('path');

describe('Project Structure Validation', () => {
  const projectRoot = path.join(__dirname, '..');

  test('should have required directories', () => {
    const requiredDirs = [
      'src',
      'src/background',
      'src/content', 
      'src/popup',
      'tests',
      'docs'
    ];

    requiredDirs.forEach(dir => {
      const dirPath = path.join(projectRoot, dir);
      expect(fs.existsSync(dirPath)).toBe(true);
      expect(fs.statSync(dirPath).isDirectory()).toBe(true);
    });
  });

  test('should have required files', () => {
    const requiredFiles = [
      'manifest.json',
      'package.json',
      'README.md',
      'CLAUDE.md',
      'src/background/service-worker.js',
      'src/content/content-script.js',
      'src/content/content-styles.css',
      'src/popup/popup.html',
      'src/popup/popup.js'
    ];

    requiredFiles.forEach(file => {
      const filePath = path.join(projectRoot, file);
      expect(fs.existsSync(filePath)).toBe(true);
      expect(fs.statSync(filePath).isFile()).toBe(true);
    });
  });

  test('should have valid file contents', () => {
    const serviceWorkerPath = path.join(projectRoot, 'src/background/service-worker.js');
    const serviceWorkerContent = fs.readFileSync(serviceWorkerPath, 'utf8');
    expect(serviceWorkerContent).toContain('chrome.runtime.onInstalled');

    const popupHtmlPath = path.join(projectRoot, 'src/popup/popup.html');
    const popupHtmlContent = fs.readFileSync(popupHtmlPath, 'utf8');
    expect(popupHtmlContent).toContain('Media Literacy Extension');
    expect(popupHtmlContent).toContain('bootstrap');
  });
});