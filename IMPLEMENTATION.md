# Chartifact Markdown Meta-Schema Implementation

## What Was Implemented

This implementation adds a **meta-schema** for Chartifact documents in Markdown mode, as specified in `atlas-markdown-mode.md`. The meta-schema enables AI agents (like ChatGPT Atlas) to safely parse, edit, and reassemble Chartifact markdown documents.

## Key Concept: Meta-Schema vs Document Format

**Important Distinction:**
- The **document format** is plain text markdown with fenced code blocks (islands)
- The **meta-schema** is an internal representation that AI agents use to work with the document

Think of it like an AST (Abstract Syntax Tree) for markdown documents.

## Files Created/Modified

### 1. Schema Definition
- **`packages/schema-doc/src/markdown.ts`**
  - TypeScript types defining the meta-schema structure
  - Exported types: `ProseBlock`, `PluginBlock`, `Block`, `MarkdownDocument`, `MarkdownDocumentWithSchema`
  - Heavily commented to explain the meta-schema concept

### 2. Build Process Integration
- **`packages/schema-doc/package.json`**
  - Added `schema-markdown` script to generate JSON schema from TypeScript
  - Updated `build` script to include markdown schema generation

- **`packages/schema-doc/scripts/copy-schema.js`**
  - Updated to copy both main schema and markdown meta-schema
  - Copies to `docs/schema/idoc_markdown_v1.json` and `.d.ts`

- **`packages/schema-doc/src/index.ts`**
  - Added export for markdown schema types

### 3. HTML Integration
- **`docs/_layouts/view.html`**
  - Added `<script type="application/schema+json">` tag with schema reference
  - Added `data-schema-ref` attribute to markdown textarea
  - Enables AI agents to discover and use the meta-schema

### 4. Documentation
- **`packages/schema-doc/BUILD.md`**
  - Complete build process documentation
  - Instructions for modifying the schema
  - Versioning guidelines

- **`packages/schema-doc/test/README.md`**
  - Explains how AI agents use the meta-schema
  - Lists common plugin types
  - Validation examples

### 5. Test Examples
- **`packages/schema-doc/test/markdown-example.ts`**
  - Complete example showing parse → edit → serialize workflow
  - Demonstrates agent editing a vega-lite plugin

- **`packages/schema-doc/test/valid-example.json`**
  - Valid blocks structure for testing
  - Can be validated against the generated schema

## How It Works

### For AI Agents

1. **Discovery**: Agent finds the schema via `<script type="application/schema+json">` in HTML
2. **Parse**: Agent reads markdown text and parses it into blocks structure
3. **Edit**: Agent modifies plugin block content while preserving prose
4. **Serialize**: Agent converts blocks back to markdown text

### Example Workflow

**Input Markdown:**
```markdown
## Title

Some text.

```json vega
{ "mark": "bar" }
```

More text.
```

**Parsed Structure:**
```json
{
  "blocks": [
    { "type": "prose", "markdown": "## Title\n\nSome text.\n\n" },
    { "type": "plugin", "language": "json vega", "content": "{ \"mark\": \"bar\" }" },
    { "type": "prose", "markdown": "\n\nMore text." }
  ]
}
```

**After Agent Edit:**
```json
{
  "blocks": [
    { "type": "prose", "markdown": "## Title\n\nSome text.\n\n" },
    { "type": "plugin", "language": "json vega", "content": "{ \"mark\": \"bar\", \"data\": {...} }" },
    { "type": "prose", "markdown": "\n\nMore text." }
  ]
}
```

**Output Markdown:**
```markdown
## Title

Some text.

```json vega
{ "mark": "bar", "data": {...} }
```

More text.
```

## Schema Structure

```typescript
interface ProseBlock {
  type: 'prose';
  markdown: string;
}

interface PluginBlock {
  type: 'plugin';
  language: string;  // e.g., "json vega", "yaml mermaid"
  content: string;   // Plugin configuration as string
}

interface MarkdownDocument {
  blocks: (ProseBlock | PluginBlock)[];
}
```

## Common Plugin Types

- `json vega` - Vega visualization specifications
- `json vega-lite` - Vega-Lite visualization specifications
- `json tabulator` - Tabulator table configurations
- `yaml mermaid` - Mermaid diagram definitions
- `json treebark` - Treebark HTML template structures

## Building the Schema

### Prerequisites
```bash
npm install
```

### Generate Schema
```bash
npm run build
```

This generates:
- `docs/schema/idoc_markdown_v1.json` - JSON Schema
- `docs/schema/idoc_markdown_v1.d.ts` - TypeScript definitions

### Schema URL
```
https://microsoft.github.io/chartifact/schema/idoc_markdown_v1.json
```

## Testing

```bash
# Validate test example
cd packages/schema-doc/test
ajv validate -s ../../docs/schema/idoc_markdown_v1.json -d valid-example.json
```

## Security Considerations

Per `atlas-markdown-mode.md`:

1. **Prose Preservation**: Agents should NOT modify prose blocks unless specifically instructed
2. **Plugin Validation**: Each plugin's content should be validated against its own schema (Vega v5, Tabulator, etc.)
3. **Versioning**: Use versioned `$id` for explicit schema changes

## Future Enhancements

- Parser/serializer utility functions for agents
- Validation of plugin content against plugin-specific schemas
- Support for nested plugins or custom block types
- Version 2 of the meta-schema with additional features

## References

- Specification: `atlas-markdown-mode.md`
- Example Documents: `docs/assets/examples/markdown/*.idoc.md`
- Main Schema: `docs/schema/idoc_v1.json`
