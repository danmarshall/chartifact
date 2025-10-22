# Markdown Meta-Schema Test Examples

This directory contains test examples demonstrating how the Chartifact markdown meta-schema is used by AI agents.

## What is the Meta-Schema?

The meta-schema (`idoc_markdown_v1.json`) describes the **internal structure** that AI agents use to parse, understand, and edit Chartifact markdown documents.

**Important:** This is NOT a new document format. Chartifact documents remain plain text markdown files with fenced code blocks (plugin islands).

## How AI Agents Use the Meta-Schema

### Step 1: Parse Markdown to Blocks

An AI agent reads a plain markdown file like:

```markdown
## My Title

Some prose text.

```json vega
{ "mark": "bar" }
```

More prose.
```

And parses it into the blocks structure:

```json
{
  "blocks": [
    { "type": "prose", "markdown": "## My Title\n\nSome prose text.\n\n" },
    { "type": "plugin", "language": "json vega", "content": "{ \"mark\": \"bar\" }" },
    { "type": "prose", "markdown": "\n\nMore prose." }
  ]
}
```

### Step 2: Edit Plugin Blocks

The agent can now safely edit plugin blocks without touching prose:

```javascript
// Find and edit the vega plugin
blocks[1].content = JSON.stringify({
  "mark": "bar",
  "data": { "values": [1, 2, 3] }  // Agent adds data
});
```

### Step 3: Serialize Back to Markdown

Convert the blocks back to plain markdown text:

```javascript
const markdown = blocks.map(block => 
  block.type === 'prose' 
    ? block.markdown
    : `\`\`\`${block.language}\n${block.content}\n\`\`\``
).join('');
```

## Files in This Directory

- **`markdown-example.ts`** - Complete example showing parse → edit → serialize workflow
- **`valid-example.json`** - Valid blocks structure that validates against the schema

## Validating Examples

Once the schema is built, you can validate examples:

```bash
ajv validate -s ../../docs/schema/idoc_markdown_v1.json -d valid-example.json
```

## Plugin Types

Common plugin types in Chartifact markdown:
- `json vega` - Vega visualization specs
- `json vega-lite` - Vega-Lite visualization specs
- `json tabulator` - Tabulator table configurations
- `yaml mermaid` - Mermaid diagram definitions
- `json treebark` - Treebark HTML templates
