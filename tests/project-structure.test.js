const fs = require('fs');
const path = require('path');

describe('Project Structure Validation', () => {
  const projectRoot = path.join(__dirname, '..');

  test('should have core extension files', () => {
    const coreFiles = [
      'manifest.json',
      'src/background/service-worker.js',
      'src/popup/popup.html',
      'src/content/content-script.js'
    ];

    coreFiles.forEach(file => {
      const filePath = path.join(projectRoot, file);
      expect(fs.existsSync(filePath)).toBe(true);
    });
  });

  test('should have valid extension content', () => {
    const serviceWorkerPath = path.join(projectRoot, 'src/background/service-worker.js');
    const serviceWorkerContent = fs.readFileSync(serviceWorkerPath, 'utf8');
    expect(serviceWorkerContent).toContain('chrome.runtime');
  });
});