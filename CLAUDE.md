# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Visited** is a Chrome browser extension (Manifest V3) that allows users to customize the color of visited links (`:visited`).

- **Type**: Chrome Extension
- **Version**: 1.0.0
- **Chrome Web Store**: https://chromewebstore.google.com/detail/geodgckkcjhcndhnfkpbolfjjmdhibgd

## Build Commands

```bash
# Package extension into ZIP for Chrome Web Store submission
npm run pack
# Output: visited-1.0.0.zip
```

## Architecture

### Three-Layer Structure

1. **Popup UI** (`dist/popup.html` + `dist/popup.js`)
   - User interface with 5 preset colors + custom color picker
   - Saves color preference to `chrome.storage.sync`

2. **Content Script** (`dist/content.js`)
   - Injected into all webpages (`<all_urls>`)
   - Applies saved color via CSS `:visited` pseudo-class with `!important`

3. **Manifest** (`dist/manifest.json`)
   - Manifest V3
   - Permissions: `storage`, `activeTab`

### Communication Flow

```
User selects color → popup.js saves to chrome.storage.sync
                   → sends message to content.js
                   → applyVisitedStyle() injects CSS
                   → all a:visited elements update immediately
```

### Key Functions

- `popup.js:selectColor()` - Update UI when user picks a color
- `popup.js:saveColor()` - Persist to storage and notify content script
- `content.js:applyVisitedStyle()` - Create and inject `<style>` tag

### Default Configuration

- **Default color**: #D01060 (Crimson Red)
- **Preset colors**: #D01060, #FF4500, #008000, #4B0082, #FF1493

## Development

### Load Extension for Testing

1. Open `chrome://extensions/`
2. Enable "Developer mode"
3. Click "Load unpacked"
4. Select the `dist/` directory

### Project Structure

```
dist/              # Extension source (used directly for distribution)
├── manifest.json  # Extension config
├── popup.html     # Popup UI
├── popup.js       # Popup logic
├── content.js     # Content script
└── icons/         # Icon assets
pack.js            # ZIP packaging script
```

### Tech Stack

- Pure JavaScript (ES6+), no frameworks
- Chrome Extension APIs (storage, runtime, tabs)
- adm-zip for packaging

No build tools, transpilers, or test frameworks are used - source code in `dist/` is the final product.
