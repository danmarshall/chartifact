# Chartifact Atlas Editor

The Atlas editor provides an enhanced, browser-based interface for editing and viewing Chartifact interactive documents with live preview capabilities.

## Features

### Split-Pane Interface
- **Editor Pane** (Left): Full-featured markdown/JSON editor
- **Preview Pane** (Right): Live rendered preview of your document
- **Resizable Divider**: Drag the center divider to adjust pane sizes to your preference

### Live Preview
- Changes appear in the preview pane instantly as you type
- Debounced rendering (300ms) prevents performance issues
- Real-time validation and error feedback

### Multiple Input Methods

#### 1. URL Parameter Loading
Load a document by adding the `load` parameter to the URL:
```
https://microsoft.github.io/chartifact/view/atlas.html?load=<url-to-your-document>
```

Example:
```
https://microsoft.github.io/chartifact/view/atlas.html?load=../assets/examples/markdown/sales-dashboard.idoc.md
```

#### 2. File Upload
Click the "Upload" button to browse and select a local `.idoc.md` or `.idoc.json` file.

#### 3. Drag and Drop
Drag a Chartifact document file from your file system directly onto the editor pane.

#### 4. Paste Content
Click in the editor pane and paste your markdown or JSON content directly (Ctrl+V / Cmd+V).

#### 5. PostMessage API
Programmatically load content using the `window.postMessage` API:

```javascript
// For markdown content
iframe.contentWindow.postMessage({ markdown: "# Hello World" }, "*");

// For JSON content
iframe.contentWindow.postMessage({ json: '{"title": "My Doc"}' }, "*");
```

### Format Modes

#### Markdown Mode (Default)
Edit your document using the human-readable markdown format with embedded JSON blocks for interactive components.

#### JSON Mode
Edit the document using the structured JSON format. Ideal for programmatic generation or when working directly with the document schema.

Switch between modes using the dropdown selector in the header.

### Export

Click the "Download" button to save your current document as a file:
- In Markdown mode: Downloads as `.idoc.md`
- In JSON mode: Downloads as `.idoc.json`

## Design Features

### Dark Mode Support
The Atlas editor automatically adapts to your system's color scheme preference:
- Light mode: Clean, bright interface
- Dark mode: Easy on the eyes for extended editing sessions

### Responsive Design
The interface adapts to different screen sizes:
- **Desktop**: Side-by-side split pane view
- **Mobile/Tablet**: Stacked layout with editor on top, preview below

### Accessibility
- Keyboard navigation support
- Proper ARIA labels
- Screen reader compatible

## Use Cases

### Quick Editing
Make quick changes to existing documents and see results immediately.

### Learning & Exploration
Experiment with Chartifact features and see how changes affect the rendered output in real-time.

### Collaboration
Share a URL with the `load` parameter to let others view and edit your document.

### Development & Testing
Test new components and features with instant visual feedback.

## Comparison with Other Tools

### Atlas vs. Viewer
- **Viewer** (`/view/`): Display-focused, minimal editing, optimized for presentation
- **Atlas** (`/view/atlas.html`): Edit-focused, split-pane, live preview, optimized for authoring

### Atlas vs. VS Code Extension
- **VS Code Extension**: Full IDE integration, file management, advanced features
- **Atlas**: Browser-based, no installation, quick access, shareable URLs

## Technical Details

### Dependencies
- `chartifact.host.umd.js`: Document rendering engine
- `vega`: Visualization library (loaded from CDN)

### Browser Requirements
- Modern browser with ES6 support
- JavaScript enabled
- LocalStorage enabled (for session persistence)

### Security
- Documents render in sandboxed iframes
- No custom JavaScript execution
- Content Security Policy enforced
- Safe HTML rendering

## Tips & Tricks

1. **Quick Load**: Bookmark URLs with the `load` parameter for frequently accessed documents
2. **Keyboard Shortcuts**: Use Ctrl+V (Cmd+V) to paste content directly into the editor
3. **Error Recovery**: If preview fails, check the browser console for detailed error messages
4. **Performance**: For large documents, the 300ms debounce helps maintain smooth editing
5. **Sharing**: Use the `load` parameter with a public URL to share editable documents

## Getting Started

1. Navigate to https://microsoft.github.io/chartifact/view/atlas.html
2. Try one of the example links to see the editor in action
3. Edit the content in the left pane
4. Watch the preview update in the right pane
5. Download your modified document when done

## Support

For issues, questions, or feature requests, please visit:
- [GitHub Issues](https://github.com/microsoft/chartifact/issues)
- [Documentation](https://microsoft.github.io/chartifact/)
- [Examples](https://microsoft.github.io/chartifact/examples)
