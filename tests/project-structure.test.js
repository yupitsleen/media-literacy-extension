const fs = require('fs');
const path = require('path');

describe('Project Structure Validation', () => {
  const projectRoot = path.join(__dirname, '..');

  test('should have core extension files', () => {
    const coreFiles = [
      'manifest.json',
      'src/background/service-worker.ts',
      'src/popup/popup.html',
      'src/content/content-script.ts',
      'build/background/service-worker.js',
      'build/content/content-script.js',
      'build/popup/popup.js'
    ];

    coreFiles.forEach(file => {
      const filePath = path.join(projectRoot, file);
      expect(fs.existsSync(filePath)).toBe(true);
    });
  });

  test('should have valid extension content', () => {
    const serviceWorkerPath = path.join(projectRoot, 'src/background/service-worker.ts');
    const serviceWorkerContent = fs.readFileSync(serviceWorkerPath, 'utf8');
    expect(serviceWorkerContent).toContain('chrome.runtime');
  });
});