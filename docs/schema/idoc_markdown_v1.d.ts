/**
 * Copyright (c) Microsoft Corporation.
 * Licensed under the MIT License.
 */
/**
 * Chartifact Markdown Mode Meta-Schema
 *
 * This is a META-SCHEMA that describes how AI agents should parse and edit
 * Chartifact documents written in Markdown format. The actual document is
 * plain text markdown with fenced code blocks (islands), but agents can use
 * this schema to understand the document structure for safe editing.
 *
 * When an agent reads a markdown document, it parses it into this structure,
 * edits plugin blocks as needed, then reassembles it back into markdown text.
 *
 * Example markdown:
 * ```
 * Here is a chart:
 *
 * ```json vega
 * { "data": { "values": [1, 2, 3] } }
 * ```
 *
 * Some concluding text.
 * ```
 *
 * Gets parsed as blocks array for agent manipulation, then serialized back.
 */
/**
 * A prose block represents free-form Markdown paragraphs or headings.
 * Agents should not modify the markdown content unless specifically instructed.
 */
export interface ProseBlock {
    type: 'prose';
    markdown: string;
}
/**
 * A plugin block represents a fenced code block with a language annotation
 * (e.g., `json vega`, `json tabulator`, `yaml mermaid`, etc.).
 *
 * The language field indicates which plugin schema should be used to
 * validate the content. Agents may edit these blocks.
 */
export interface PluginBlock {
    type: 'plugin';
    language: string;
    content: string;
}
/**
 * A block is either a prose block or a plugin block.
 */
export type Block = ProseBlock | PluginBlock;
/**
 * Internal representation of a Chartifact markdown document for AI agent editing.
 * This is NOT the actual document format - the document is plain markdown text.
 * This is the structure agents use to safely parse, edit, and reassemble markdown.
 */
export interface MarkdownDocument {
    blocks: Block[];
}
/** JSON Schema version with $schema property for validation */
export type MarkdownDocumentWithSchema = MarkdownDocument & {
    $schema?: string;
};
