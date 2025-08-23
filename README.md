# Media Literacy Browser Extension

A browser extension designed to improve media literacy by detecting logical fallacies, hypocrisy, and campaign finance connections in web content. Helps users develop critical thinking skills when consuming online content, particularly in political contexts.

## Features (Planned)

- **Logical Fallacy Detection** - Identify and highlight 15+ common fallacies
- **Hypocrisy Detection** - Find contradictory statements within content
- **Campaign Finance Transparency** - Surface politician donor connections
- **Educational Context** - Provide tooltips and explanations for detected patterns

## Development Setup

### Prerequisites
- Node.js 16+ and npm
- Chrome or Firefox browser for testing

### Installation
```bash
# Clone the repository
git clone https://github.com/yupitsleen/media-literacy-extension.git
cd media-literacy-extension

# Install dependencies
npm install

# Build for development
npm run dev
```

### Loading the Extension
1. Open Chrome and navigate to `chrome://extensions/`
2. Enable "Developer mode" (toggle in top right)
3. Click "Load unpacked" and select the `build/` directory
4. The extension should now appear in your browser toolbar

### Development Commands
```bash
npm run dev        # Build in development mode with watch
npm run build      # Build for production
npm run test       # Run tests
npm run lint       # Check code quality
```

## Project Structure

```
media-literacy-extension/
├── manifest.json          # Extension manifest (Manifest V3)
├── src/
│   ├── content/           # Content scripts (run on web pages)
│   ├── background/        # Background scripts (service workers)
│   ├── popup/            # Extension popup UI
│   ├── utils/            # Shared utilities and helpers
│   └── data/             # Fallacy definitions, patterns, datasets
├── tests/                # Test files
├── docs/                 # Documentation
└── build/                # Built extension files
```

## Development Status

🚧 **In Development** - Project structure initialized. Working on Epic 1: Core Extension Infrastructure.

See [GitHub Issues](https://github.com/yupitsleen/media-literacy-extension/issues) for current Epics and User Stories.

## Contributing

This project follows Epic/User Story methodology for organized development. Contributions welcome!

## License

MIT License - see LICENSE file for details