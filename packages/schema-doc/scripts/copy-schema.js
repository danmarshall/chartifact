import fs from 'fs';

// Copy the main schema files
fs.copyFileSync('dist/idoc.schema.json', '../../docs/schema/idoc_v1.json');
fs.copyFileSync('dist/idoc.d.ts', '../../docs/schema/idoc_v1.d.ts');

// Copy the markdown meta-schema files
fs.copyFileSync('dist/idoc_markdown.schema.json', '../../docs/schema/idoc_markdown_v1.json');
fs.copyFileSync('dist/esnext/markdown.d.ts', '../../docs/schema/idoc_markdown_v1.d.ts');

console.log('Schema files copied successfully to ../../docs/schema');
