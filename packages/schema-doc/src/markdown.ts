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
 * Base interface for plugin blocks. A plugin block represents a fenced code block
 * with a language annotation (e.g., `json vega`, `json tabulator`, `yaml mermaid`, etc.).
 * 
 * The language field indicates which plugin schema should be used to validate the content.
 * Agents may edit these blocks.
 */
export interface PluginBlock {
    type: 'plugin';
    language: string;
    content: string;
}

/**
 * Vega plugin block for Vega visualizations.
 * Language: "json vega"
 */
export interface VegaPluginBlock extends PluginBlock {
    language: 'json vega';
}

/**
 * Vega-Lite plugin block for Vega-Lite visualizations.
 * Language: "json vega-lite"
 */
export interface VegaLitePluginBlock extends PluginBlock {
    language: 'json vega-lite';
}

/**
 * Tabulator plugin block for interactive tables.
 * Language: "json tabulator"
 */
export interface TabulatorPluginBlock extends PluginBlock {
    language: 'json tabulator';
}

/**
 * Mermaid plugin block for diagrams (flowcharts, sequence diagrams, etc.).
 * Language: "yaml mermaid"
 */
export interface MermaidPluginBlock extends PluginBlock {
    language: 'yaml mermaid';
}

/**
 * Treebark plugin block for safe HTML templates.
 * Language: "yaml treebark"
 */
export interface TreebarkPluginBlock extends PluginBlock {
    language: 'yaml treebark';
}

/**
 * Dropdown plugin block for dropdown input controls.
 * Language: "yaml dropdown"
 */
export interface DropdownPluginBlock extends PluginBlock {
    language: 'yaml dropdown';
}

/**
 * Slider plugin block for slider input controls.
 * Language: "yaml slider"
 */
export interface SliderPluginBlock extends PluginBlock {
    language: 'yaml slider';
}

/**
 * Number plugin block for number input controls.
 * Language: "yaml number"
 */
export interface NumberPluginBlock extends PluginBlock {
    language: 'yaml number';
}

/**
 * CSS plugin block for styling.
 * Language: "css"
 */
export interface CSSPluginBlock extends PluginBlock {
    language: 'css';
}

/**
 * CSV plugin block for inline data.
 * Language starts with "csv" (e.g., "csv activityData", "csv budgetCategories")
 */
export interface CSVPluginBlock extends PluginBlock {
    language: string; // "csv <dataSourceName>"
}

/**
 * A block is either a prose block or a plugin block.
 */
export type Block = ProseBlock | 
    VegaPluginBlock | 
    VegaLitePluginBlock | 
    TabulatorPluginBlock | 
    MermaidPluginBlock | 
    TreebarkPluginBlock | 
    DropdownPluginBlock | 
    SliderPluginBlock | 
    NumberPluginBlock | 
    CSSPluginBlock | 
    CSVPluginBlock | 
    PluginBlock; // Keep generic PluginBlock last for extensibility

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
