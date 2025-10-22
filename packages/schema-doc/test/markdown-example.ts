/**
 * Test/Example: Parsing and serializing Chartifact markdown documents
 * 
 * This demonstrates how the meta-schema is used by AI agents to parse
 * plain markdown text into a structured format for editing, then serialize
 * it back to markdown.
 */

// Example markdown document (plain text)
const markdownText = `## Select the items you want to buy

\`\`\`json tabulator
{
  "dataSourceName": "itemsData",
  "tabulatorOptions": {
    "autoColumns": true,
    "selectableRows": true
  },
  "variableId": "itemsData_selected"
}
\`\`\`

## Total Price

${{total}}

### Categories

\`\`\`json vega-lite
{
  "$schema": "https://vega.github.io/schema/vega-lite/v6.json",
  "data": {
    "name": "itemsData_selected"
  },
  "mark": "bar",
  "encoding": {
    "x": {
      "field": "category",
      "type": "nominal"
    }
  }
}
\`\`\``;

// This is how an AI agent would parse it using the meta-schema:
const parsedStructure = {
  "blocks": [
    {
      "type": "prose",
      "markdown": "## Select the items you want to buy\n\n"
    },
    {
      "type": "plugin",
      "language": "json tabulator",
      "content": "{\n  \"dataSourceName\": \"itemsData\",\n  \"tabulatorOptions\": {\n    \"autoColumns\": true,\n    \"selectableRows\": true\n  },\n  \"variableId\": \"itemsData_selected\"\n}"
    },
    {
      "type": "prose",
      "markdown": "\n\n## Total Price\n\n${{total}}\n\n### Categories\n\n"
    },
    {
      "type": "plugin",
      "language": "json vega-lite",
      "content": "{\n  \"$schema\": \"https://vega.github.io/schema/vega-lite/v6.json\",\n  \"data\": {\n    \"name\": \"itemsData_selected\"\n  },\n  \"mark\": \"bar\",\n  \"encoding\": {\n    \"x\": {\n      \"field\": \"category\",\n      \"type\": \"nominal\"\n    }\n  }\n}"
    }
  ]
};

// Agent can now edit plugin blocks, e.g., modify the vega-lite content:
parsedStructure.blocks[3].content = JSON.stringify({
  "$schema": "https://vega.github.io/schema/vega-lite/v6.json",
  "data": {
    "name": "itemsData_selected"
  },
  "mark": "bar",
  "encoding": {
    "x": {
      "field": "category",
      "type": "nominal",
      "title": "Category"  // Agent added title
    },
    "y": {
      "aggregate": "count",  // Agent added count
      "type": "quantitative",
      "title": "Number of Items"
    }
  }
}, null, 2);

// Then serialize back to markdown:
function serializeToMarkdown(blocks) {
  return blocks.map(block => {
    if (block.type === 'prose') {
      return block.markdown;
    } else {
      return `\`\`\`${block.language}\n${block.content}\n\`\`\``;
    }
  }).join('');
}

const editedMarkdown = serializeToMarkdown(parsedStructure.blocks);
console.log("Edited markdown:");
console.log(editedMarkdown);

export { parsedStructure, serializeToMarkdown };
