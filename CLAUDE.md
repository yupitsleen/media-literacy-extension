# CLAUDE.md

This file provides guidance to Claude Code when working with the Media Literacy Browser Extension project.

## Project Overview

This is a browser extension project designed to improve media literacy by detecting logical fallacies, hypocrisy, and campaign finance connections in web content. The goal is to help users develop critical thinking skills when consuming online content, particularly in political contexts.

## Project Architecture & Features

### Core Features Planned

1. **Logical Fallacy Detection** - Identify and highlight 15+ common fallacies (ad hominem, strawman, false dilemma, etc.)
2. **Hypocrisy Detection** - Find contradictory statements within content or across time
3. **Campaign Finance Transparency** - Surface politician donor connections when they make statements
4. **Motivation Analysis** - Suggest potential motivations behind fallacious arguments
5. **Educational Context** - Provide tooltips and explanations for detected patterns

### Technical Stack

- **Core**: Browser Extension (Manifest V3), JavaScript/TypeScript
- **APIs**: FEC API, OpenSecrets API for campaign finance data
- **UI**: HTML/CSS, potentially React for complex popup components
- **Testing**: Jest, Playwright for e2e testing
- **Build**: Webpack/Vite for bundling

## Project Structure (Planned)

```
media-literacy-ext/
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

## Development Approach & Planning

### Agile Structure

We have planned this project using Epic/User Story methodology:

**Epic 1: Core Extension Infrastructure** (P0)

- Browser extension installation
- Extension toggle control
- Text content extraction
- Basic settings management

**Epic 2: Logical Fallacy Detection** (P0)

- Pattern matching for 15+ fallacies
- Visual highlighting system
- Educational tooltips
- Configurable fallacy types

**Epic 4: Campaign Finance Transparency** (P1)

- Politician recognition
- Campaign donor data integration
- Policy-donor connection analysis
- Real-time finance data display

**Epic 3: Hypocrisy Detection** (P2)

- Statement contradiction analysis
- Cross-reference capability
- Context-aware detection

**Epic 5: Motivation Analysis** (P2)

- Fallacy-to-motivation mapping
- Context analysis for speaker identification

### MVP Prioritization

**Phase 1:** Epics 1 + 2 (Infrastructure + Fallacy Detection)
**Phase 2:** Epic 4 (Campaign Finance)
**Phase 3:** Epics 3 + 5 (Hypocrisy + Motivation)

## GitHub Repository Management

### Issue Templates Created

We have created comprehensive GitHub issue templates:

- Epic template for major features
- User Story template with acceptance criteria
- Detailed setup guide with labels and priorities

### Required GitHub Setup

1. Create labels: epic, user-story, P0-P3 priorities, feature-specific epic labels
2. Create Epic issues for each major feature area
3. Create detailed User Stories with acceptance criteria and story points
4. Set up Project Board for progress tracking

## Development Commands (To Be Implemented)

```bash
npm install        # Install dependencies
npm run dev        # Start development server
npm run build      # Build extension for production
npm run test       # Run tests
npm run lint       # Run linting
```

## Key Technical Considerations

### Browser Compatibility

- Use Manifest V3 for future Chrome compatibility
- Ensure cross-browser support (Chrome, Firefox)
- Minimize permissions for user trust

### Performance & Privacy

- Process text locally when possible
- Use web workers for heavy computation
- Be transparent about any API usage
- Implement rate limiting for external API calls

### Accuracy & User Experience

- Implement confidence scoring to reduce false positives
- Allow user feedback and corrections
- Provide clear educational context
- Handle edge cases gracefully (sarcasm, quotes, hypotheticals)

### Data Sources

- **FEC API** - Federal Election Commission campaign finance data
- **OpenSecrets.org API** - Political donation and lobbying data
- **Pattern Libraries** - Curated fallacy detection patterns
- **Political Entity Databases** - Politician name recognition

## Development Notes

- Focus on media literacy and critical thinking education
- Maintain neutrality - analyze patterns, not political positions
- Ensure all data sources are publicly available and properly attributed
- Consider ethical implications of motivation attribution
- Start with effect-based analysis rather than intent attribution

## Current Status

✅ Project planning and Epic/User Story structure complete

🚧 Need to create fresh GitHub issue structure

⏳ Next: Initialize project structure (package.json, manifest.json, basic folders)

⏳ Next: Implement Epic 1 (Core Extension Infrastructure)

## Important Reminders

1. Prioritize user privacy and data transparency
2. Educational focus - help users think critically, don't think for them
