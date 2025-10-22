import fs from 'fs';

// Add $id to markdown schema
const schemaPath = 'dist/idoc_markdown.schema.json';
const schema = JSON.parse(fs.readFileSync(schemaPath, 'utf8'));

// Add $id at the top level
schema.$id = 'https://microsoft.github.io/chartifact/schema/idoc_markdown_v1.json';

// Write back
fs.writeFileSync(schemaPath, JSON.stringify(schema, null, 2));

console.log('Added $id to markdown schema');
