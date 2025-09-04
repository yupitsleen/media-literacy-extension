const fs = require('fs');
const path = require('path');

describe('Package.json Validation', () => {
  let packageJson;

  beforeAll(() => {
    const packagePath = path.join(__dirname, '..', 'package.json');
    const packageContent = fs.readFileSync(packagePath, 'utf8');
    packageJson = JSON.parse(packageContent);
  });

  test('should have required package fields', () => {
    expect(packageJson.name).toBe('media-literacy-extension');
    expect(packageJson.version).toMatch(/^\d+\.\d+\.\d+$/);
    expect(packageJson.description).toContain('browser extension');
    expect(packageJson.license).toBe('MIT');
  });

  test('should have essential npm scripts', () => {
    expect(packageJson.scripts).toBeDefined();
    expect(packageJson.scripts.test).toBeDefined();
    expect(packageJson.scripts.lint).toBeDefined();
  });

  test('should have required development dependencies', () => {
    expect(packageJson.devDependencies).toBeDefined();
    expect(packageJson.devDependencies.jest).toBeDefined();
    expect(packageJson.devDependencies.eslint).toBeDefined();
    expect(packageJson.devDependencies.webpack).toBeDefined();
    expect(packageJson.devDependencies.husky).toBeDefined();
  });

  test('should have appropriate keywords', () => {
    expect(packageJson.keywords).toContain('browser-extension');
    expect(packageJson.keywords).toContain('media-literacy');
    expect(packageJson.keywords).toContain('logical-fallacies');
  });
});