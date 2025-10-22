# 📜 Chartifact AI-Editable Document Spec – Markdown Mode (v1)

## Purpose
Define how Chartifact documents in Markdown mode can be parsed and edited by AI agents like ChatGPT Atlas. In Markdown mode, Chartifact documents consist of a sequence of prose sections and plugin blocks. This spec provides a JSON meta‑schema describing that structure so that agents can identify and safely edit plugin blocks while leaving the surrounding prose intact.

## Meta-Schema for Markdown Mode
Use the following JSON Schema to describe a Chartifact document composed of an array of blocks. Each block is either a prose block or a plugin block.

```json
{
  "$id": "https://microsoft.github.io/chartifact/schema/idoc_markdown_v1.json",
  "type": "object",
  "properties": {
    "blocks": {
      "type": "array",
      "items": {
        "oneOf": [
          { "$ref": "#/$defs/proseBlock" },
          { "$ref": "#/$defs/pluginBlock" }
        ]
      }
    }
  },
  "$defs": {
    "proseBlock": {
      "type": "object",
      "properties": {
        "type": { "const": "prose" },
        "markdown": { "type": "string" }
      },
      "required": ["type", "markdown"]
    },
    "pluginBlock": {
      "type": "object",
      "properties": {
        "type": { "const": "plugin" },
        "language": { "type": "string" },
        "content": { "type": "string" }
      },
      "required": ["type", "language", "content"]
    }
  },
  "required": ["blocks"]
}
```

- **proseBlock**: represents free‑form Markdown paragraphs or headings. Agents should not modify the `markdown` content unless specifically instructed.
- **pluginBlock**: represents a fenced code block with a language annotation (e.g., `json vega`, `json tabulator`, `yaml mermaid`, etc.). The `language` field indicates which plugin schema should be used to validate the `content`. Agents may edit these blocks.

## Usage
1. Add a `<script>` tag of type `application/schema+json` pointing to the above meta‑schema URL on the Chartifact page containing the Markdown textarea.
2. Annotate the textarea with `data-schema-ref` referencing the script's ID.
3. When editing a document in Markdown mode, AI agents can parse the Markdown into an array of blocks according to the schema. They can modify plugin blocks by updating their `content` field with valid plugin data (validated against the plugin’s own schema) and reassemble the Markdown.

## Example
Given the following Markdown:

````markdown
Here is a chart:

```json vega
{ "data": { "values": [1, 2, 3] } }
```

Some concluding text.
````

It can be represented under the schema as:

```json
{
  "blocks": [
    {
      "type": "prose",
      "markdown": "Here is a chart:\n\n"
    },
    {
      "type": "plugin",
      "language": "json vega",
      "content": "{ \"data\": { \"values\": [1, 2, 3] } }"
    },
    {
      "type": "prose",
      "markdown": "\n\nSome concluding text."
    }
  ]
}
```

Agents can modify the `content` of the plugin block while preserving the `prose` sections.

## Security Considerations
- Only plugin blocks should be edited by default; prose content should remain unchanged unless specifically directed.
- Each plugin language must reference its own schema (e.g., Vega v5, Tabulator config, Mermaid) for validation.
- Use versioned `$id` values for the meta‑schema and plugin schemas so that changes are explicit.
