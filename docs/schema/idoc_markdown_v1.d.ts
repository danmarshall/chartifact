/**
 * Copyright (c) Microsoft Corporation.
 * Licensed under the MIT License.
 */

/**
 * Chartifact Document in Markdown Mode
 * 
 * This schema describes how a Chartifact document in Markdown mode
 * can be parsed and edited by AI agents. The document consists of
 * a sequence of prose sections and plugin blocks.
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
 * The root structure for a Chartifact document in Markdown mode.
 * Contains an array of blocks that make up the document.
 */
export interface ChartifactMarkdownDocument {
    blocks: Block[];
}

export interface ChartifactMarkdownDocumentWithSchema extends ChartifactMarkdownDocument {
    $schema?: string;
}
