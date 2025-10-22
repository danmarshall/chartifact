# Atlas Markdown Mode Specification

## Overview

The Atlas page provides an enhanced browser-based interface for editing and viewing Chartifact interactive documents, inspired by OpenAI's Atlas Browser markdown editing capabilities.

## Key Features

### 1. Split-Pane Interface
- **Left Pane**: Live markdown editor with syntax awareness
- **Right Pane**: Real-time preview of the rendered document
- **Resizable**: Users can adjust the split ratio between editor and preview

### 2. Enhanced Editing Experience
- **Live Preview**: Instant rendering as you type
- **Syntax Awareness**: Proper handling of Chartifact markdown including JSON blocks
- **Error Feedback**: Clear error messages when document format is invalid
- **Auto-save**: Content preserved in browser session

### 3. Loading Methods
Support all existing viewer loading methods:
- **Clipboard**: Paste markdown content directly
- **Drag and Drop**: Drop markdown files onto the page
- **URL Parameter**: Load from URL using `?load=url/to/file.md`
- **File Upload**: Browse and upload files from disk
- **PostMessage**: Programmatic content loading via window.postMessage API

### 4. Editing Features
- **Format Toggle**: Switch between markdown and JSON editing modes
- **Full-screen Mode**: Maximize either editor or preview pane
- **Download**: Export current document as file
- **Share**: Generate shareable URLs

### 5. Responsive Design
- **Mobile-Friendly**: Adapt layout for smaller screens
- **Touch Support**: Support for touch-based interactions
- **Accessible**: Keyboard navigation and screen reader support

## Technical Implementation

### File Structure
```
docs/
  view/
    index.html      # Original viewer (unchanged)
    atlas.html      # New atlas page
  assets/
    js/
      view.js       # Original viewer script (unchanged)
      atlas.js      # New atlas script
    css/
      atlas.css     # Atlas-specific styles (optional)
```

### Dependencies
- Reuse existing Chartifact host library (`chartifact.host.umd.js`)
- Reuse existing toolbar component (`chartifact.toolbar.umd.js`)
- No additional external dependencies required

### API Integration
- Leverage existing `Chartifact.host.Listener` API
- Use existing toolbar functionality
- Extend with split-pane layout management

## User Workflow

1. **Initial Load**: User navigates to `/chartifact/view/atlas.html`
2. **Content Input**: User provides content via one of the loading methods
3. **Edit Mode**: Left pane shows editable markdown, right pane shows live preview
4. **Real-time Updates**: Changes in editor immediately reflect in preview
5. **Export**: User can download or share the document

## Benefits

- **Better Editing Experience**: Side-by-side view eliminates context switching
- **Real-time Feedback**: Immediate visual feedback while editing
- **Familiar Interface**: Similar to popular markdown editors
- **No Breaking Changes**: Original viewer remains unchanged
- **Progressive Enhancement**: Users can choose between viewer and atlas modes
