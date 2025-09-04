const fs = require('fs');
const path = require('path');

describe('Manifest Validation', () => {
  let manifest;

  beforeAll(() => {
    const manifestPath = path.join(__dirname, '..', 'manifest.json');
    const manifestContent = fs.readFileSync(manifestPath, 'utf8');
    manifest = JSON.parse(manifestContent);
  });

  test('should have valid manifest structure', () => {
    expect(manifest).toBeDefined();
    expect(manifest.manifest_version).toBe(3);
    expect(manifest.name).toBe('Media Literacy Extension');
    expect(manifest.version).toMatch(/^\d+\.\d+\.\d+$/);
  });

  test('should have required permissions', () => {
    expect(manifest.permissions).toContain('storage');
    expect(manifest.permissions).toContain('activeTab');
  });

  test('should have valid host permissions for APIs', () => {
    expect(manifest.host_permissions).toContain('https://*.fec.gov/*');
    expect(manifest.host_permissions).toContain('https://*.opensecrets.org/*');
  });

  test('should have valid action configuration', () => {
    expect(manifest.action).toBeDefined();
    expect(manifest.action.default_popup).toBe('src/popup/popup.html');
    expect(manifest.action.default_title).toBe('Media Literacy Extension');
  });

  test('should have valid content scripts', () => {
    expect(manifest.content_scripts).toBeDefined();
    expect(manifest.content_scripts).toHaveLength(1);
    
    const contentScript = manifest.content_scripts[0];
    expect(contentScript.matches).toContain('https://*/*');
    expect(contentScript.matches).toContain('http://*/*');
    expect(contentScript.js).toContain('build/content/content-script.js');
    expect(contentScript.css).toContain('src/content/content-styles.css');
  });

  test('should have valid background service worker', () => {
    expect(manifest.background).toBeDefined();
    expect(manifest.background.service_worker).toBe('build/background/service-worker.js');
  });
});