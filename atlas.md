# 🎩 Chartifact AI-Editable Document Spec (v1)  

**Schema:** [`https://microsoft.github.io/chartifact/schema/idoc_v1.json`](https://microsoft.github.io/chartifact/schema/idoc_v1.json)  
**Author:** [Dan Marshall](https://github.com/danmarshall)  
**Purpose:** Define how AI browsers (like ChatGPT Atlas) can safely detect, validate, and edit Chartifact documents directly within the browser.  

---  

## 1. Overview  

This spec describes how an AI browser or agent can:  

- Detect Chartifact document structure.  
- Validate edits using your JSON schema.  
- Safely modify the editable source (e.g., Markdown or JSON).  
- Communicate via a lightweight `postMessage` bridge — a client‑side MCP‑style protocol.  

---  

## 2. Schema Declaration  

Embed or link your existing JSON Schema anywhere in the document host:  

```html
<script
  id="chartifact-schema"
  type="application/schema+json"
  src="https://microsoft.github.io/chartifact/schema/idoc_v1.json">
</script>
```  

Atlas and other AI clients will automatically follow this link to understand your document’s structure and validation rules.  

---  

## 3. Editable Region Declaration  

Mark the editable Markdown or JSON region with attributes describing its schema and format:  

```html
<textarea
  id="chartifact-editor"
  data-schema-ref="#chartifact-schema"
  data-editable="true"
  data-format="markdown"
  data-block-type="idoc_v1">
<!-- Chartifact markdown or JSON source -->
</textarea>
```  

| Attribute | Description |  
|------------|-------------|  
| `data-schema-ref` | References the schema definition element or URL. |  
| `data-editable="true"` | Declares that this region may be safely edited. |  
| `data-format` | Indicates the format: `markdown`, `yaml`, or `json`. |  
| `data-block-type` | Optionally specifies a schema subtype, e.g. `idoc_v1`. |  

---  

## 4. AI Communication Protocol (Client‑Side MCP)  

### 4.1 Message Transport  

The host page communicates with the AI runtime using `window.postMessage`. All messages are JSON objects with an `action` string and an optional `payload`.  

### 4.2 Supported Actions  

| Direction | Action | Payload | Description |  
|------------|---------|----------|--------------|  
| → Page | `chartifact:getContent` | none | Request current editor content. |  
| ← AI | `chartifact:content` | `{ text: string }` | Response containing document text. |  
| → Page | `chartifact:setContent` | `{ text: string }` | Replace editor content. |  
| → Page | `chartifact:validate` | `{ text: string }` | Request schema validation. |  
| ← AI | `chartifact:validation` | `{ valid: boolean, errors?: any[] }` | Validation result. |  

### 4.3 Reference Implementation  

```js
window.addEventListener("message", async (event) => {
  const { action, payload } = event.data || {};
  if (!action) return;

  switch (action) {
    case "chartifact:getContent":
      event.source.postMessage({
        action: "chartifact:content",
        payload: { text: getEditorContent() }
      }, "*");
      break;

    case "chartifact:setContent":
      setEditorContent(payload.text);
      renderChartifact(); // your existing render logic
      break;

    case "chartifact:validate":
      const result = await validateAgainstSchema(payload.text);
      event.source.postMessage({
        action: "chartifact:validation",
        payload: result
      }, "*");
      break;
  }
});

function getEditorContent() {
  return document.querySelector("#chartifact-editor").value;
}

function setEditorContent(text) {
  document.querySelector("#chartifact-editor").value = text;
}

async function validateAgainstSchema(text) {
  // Example using AJV or your own validator
  return { valid: true };
}
```  

---  

## 5. Security and Validation Rules  

- Only elements marked `data-editable="true"` may be modified.  
- The `$id` of the schema must remain `https://microsoft.github.io/chartifact/schema/idoc_v1.json`.  
- All AI edits should pass validation before being rendered.  
- Pages may optionally expose a capabilities manifest via:  

```html
<meta name="chartifact-capabilities" content="editable,validatable,exportable">
```  

---  

## 6. Export / Share Hooks (Optional)  

If the page provides download/share buttons, tag them so Atlas can trigger them:  

```html
<button data-chartifact-action="download">Download</button>
<button data-chartifact-action="share">Share</button>
```  

Agents will use normal click events to activate these.  

---  

## 7. Summary  

| Feature | Implementation |  
|----------|----------------|  
| Schema source | `https://microsoft.github.io/chartifact/schema/idoc_v1.json` |  
| Schema embed | `<script type="application/schema+json" id="chartifact-schema" src="...">` |  
| Editable node | `<textarea data-schema-ref="#chartifact-schema" data-editable="true">` |  
| Communication | `window.postMessage` bridge |  
| Validation | Client-side (AJV or equivalent) | 
