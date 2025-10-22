# Markdown Meta-Schema Build Instructions

## Overview

The markdown meta-schema is generated automatically from TypeScript definitions, just like the main `idoc_v1.json` schema.

## Build Process

When you run `npm run build` in the schema-doc package (or at the root level), these steps occur:

### 1. TypeScript Compilation
```bash
npm run tsc
```
Compiles `src/markdown.ts` (and other TypeScript files) to JavaScript.

### 2. Generate JSON Schema
```bash
npm run schema-markdown
```
Uses `ts-json-schema-generator` to generate `dist/idoc_markdown.schema.json` from the TypeScript types in `src/markdown.ts`.

### 3. Copy to Docs
```bash
npm run copy-schema
```
Copies the generated schema files to `docs/schema/`:
- `dist/idoc_markdown.schema.json` → `docs/schema/idoc_markdown_v1.json`
- `dist/markdown.d.ts` → `docs/schema/idoc_markdown_v1.d.ts`

## Prerequisites

Before building, you need to install dependencies:

```bash
# From repository root
npm install
```

This installs:
- `ts-json-schema-generator` - Generates JSON schemas from TypeScript
- `vega` and `treebark` - Required for other schema types
- Other build tools

## Building the Schema

```bash
# From repository root
npm run build

# Or just the schema package
cd packages/schema-doc
npm run build
```

## Modifying the Schema

To change the markdown meta-schema:

1. Edit `packages/schema-doc/src/markdown.ts`
2. Run `npm run build` to regenerate the JSON schema
3. The updated schema will be copied to `docs/schema/idoc_markdown_v1.json`
4. Commit both the TypeScript source and generated JSON schema

## Schema URL

The generated schema is accessible at:
```
https://microsoft.github.io/chartifact/schema/idoc_markdown_v1.json
```

This URL is referenced in HTML pages via a `<script type="application/schema+json">` tag so AI agents know how to parse markdown documents.

## Testing

After building, validate test examples:

```bash
cd packages/schema-doc/test
ajv validate -s ../../docs/schema/idoc_markdown_v1.json -d valid-example.json
```

## Schema Versioning

The schema uses semantic versioning in the filename (`v1`). When making breaking changes:

1. Create new version (e.g., `idoc_markdown_v2.json`)
2. Update the `$id` field in the schema
3. Keep old version for backwards compatibility
4. Update documentation and HTML references
