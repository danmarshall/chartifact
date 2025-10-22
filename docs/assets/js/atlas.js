/**
 * Copyright (c) Microsoft Corporation.
 * Licensed under the MIT License.
 */

window.addEventListener('DOMContentLoaded', () => {
    const editor = document.getElementById('editor');
    const preview = document.getElementById('preview');
    const loading = document.getElementById('loading');
    const help = document.getElementById('help');
    const modeSelect = document.getElementById('mode-select');
    const downloadBtn = document.getElementById('download-btn');
    const uploadBtn = document.getElementById('upload-btn');
    const fileInput = document.getElementById('file-input');
    const resizer = document.getElementById('resizer');

    let currentMode = 'markdown';
    let renderFunction = null;
    let host = null;
    let hasContent = false;
    let debounceTimer = null;

    // Initialize the Chartifact host
    host = new Chartifact.host.Listener({
        preview: '#preview',
        loading: '#loading',
        help: '#help',
        uploadButton: '#upload-btn',
        fileInput: '#file-input',
        onApprove: (message) => {
            const { specs } = message;
            return specs;
        }
    });

    // Show help initially
    function showHelp() {
        if (help) help.style.display = 'block';
        if (loading) loading.style.display = 'block';
        hasContent = false;
    }

    // Hide help when content is loaded
    function hideHelp() {
        if (help) help.style.display = 'none';
        if (loading) loading.style.display = 'none';
        hasContent = true;
    }

    // Render markdown
    function renderMarkdown(markdown) {
        if (!markdown || markdown.trim().length === 0) {
            showHelp();
            return;
        }
        hideHelp();
        try {
            host.renderMarkdown(markdown);
        } catch (error) {
            host.errorHandler(error, 'Failed to render markdown');
        }
    }

    // Render JSON
    function renderJSON(json) {
        if (!json || json.trim().length === 0) {
            showHelp();
            return;
        }
        hideHelp();
        try {
            const interactiveDocument = JSON.parse(json);
            if (typeof interactiveDocument !== 'object') {
                host.errorHandler('Invalid JSON format', 'Please provide a valid Interactive Document JSON.');
                return;
            }
            host.renderInteractiveDocument(interactiveDocument);
        } catch (error) {
            host.errorHandler(error, 'Failed to parse Interactive Document JSON');
        }
    }

    // Set up render function based on mode
    function setRenderMode(mode) {
        currentMode = mode;
        if (mode === 'json') {
            renderFunction = () => renderJSON(editor.value);
        } else {
            renderFunction = () => renderMarkdown(editor.value);
        }
    }

    // Debounced render for live preview
    function debouncedRender() {
        if (debounceTimer) {
            clearTimeout(debounceTimer);
        }
        debounceTimer = setTimeout(() => {
            if (renderFunction) {
                renderFunction();
            }
        }, 300);
    }

    // Editor input handler
    editor.addEventListener('input', debouncedRender);

    // Mode selection
    modeSelect.addEventListener('change', (e) => {
        const newMode = e.target.value;
        
        // Convert content if switching modes
        if (hasContent && editor.value.trim()) {
            if (currentMode === 'markdown' && newMode === 'json') {
                // Try to get the JSON representation from the host
                // For now, just notify user to paste JSON
                alert('Please paste JSON format content in the editor.');
            } else if (currentMode === 'json' && newMode === 'markdown') {
                // Try to convert JSON to markdown
                try {
                    const interactiveDocument = JSON.parse(editor.value);
                    // This is a simplified conversion - in reality you'd use the compiler
                    alert('Please paste Markdown format content in the editor.');
                } catch (error) {
                    // Invalid JSON, just switch mode
                }
            }
        }
        
        setRenderMode(newMode);
        if (hasContent) {
            renderFunction();
        }
    });

    // Download functionality
    downloadBtn.addEventListener('click', () => {
        if (!editor.value.trim()) {
            alert('Nothing to download. Please add content first.');
            return;
        }

        const content = editor.value;
        const extension = currentMode === 'json' ? '.idoc.json' : '.idoc.md';
        const mimeType = currentMode === 'json' ? 'application/json' : 'text/markdown';
        const filename = 'document' + extension;

        const blob = new Blob([content], { type: mimeType });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    });

    // Upload functionality
    uploadBtn.addEventListener('click', () => {
        fileInput.click();
    });

    fileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            const content = event.target.result;
            editor.value = content;
            
            // Determine mode from file extension
            if (file.name.endsWith('.json')) {
                modeSelect.value = 'json';
                setRenderMode('json');
            } else {
                modeSelect.value = 'markdown';
                setRenderMode('markdown');
            }
            
            renderFunction();
        };
        reader.readAsText(file);
        
        // Reset file input
        fileInput.value = '';
    });

    // Drag and drop support
    editor.addEventListener('dragover', (e) => {
        e.preventDefault();
        e.stopPropagation();
        editor.style.background = '#f0f0f0';
    });

    editor.addEventListener('dragleave', (e) => {
        e.preventDefault();
        e.stopPropagation();
        editor.style.background = '';
    });

    editor.addEventListener('drop', (e) => {
        e.preventDefault();
        e.stopPropagation();
        editor.style.background = '';

        const files = e.dataTransfer.files;
        if (files.length > 0) {
            const file = files[0];
            const reader = new FileReader();
            reader.onload = (event) => {
                const content = event.target.result;
                editor.value = content;
                
                // Determine mode from file extension
                if (file.name.endsWith('.json')) {
                    modeSelect.value = 'json';
                    setRenderMode('json');
                } else {
                    modeSelect.value = 'markdown';
                    setRenderMode('markdown');
                }
                
                renderFunction();
            };
            reader.readAsText(file);
        }
    });

    // Clipboard paste support (Ctrl+V / Cmd+V)
    editor.addEventListener('paste', (e) => {
        // Let the default paste behavior happen
        setTimeout(() => {
            debouncedRender();
        }, 10);
    });

    // Resizer functionality
    let isResizing = false;
    let startX = 0;
    let startWidth = 0;

    resizer.addEventListener('mousedown', (e) => {
        isResizing = true;
        startX = e.clientX;
        const editorPane = document.querySelector('.atlas-editor-pane');
        startWidth = editorPane.offsetWidth;
        document.body.style.cursor = 'col-resize';
        e.preventDefault();
    });

    document.addEventListener('mousemove', (e) => {
        if (!isResizing) return;

        const editorPane = document.querySelector('.atlas-editor-pane');
        const delta = e.clientX - startX;
        const newWidth = startWidth + delta;
        const minWidth = 200;
        const maxWidth = window.innerWidth - 200;

        if (newWidth >= minWidth && newWidth <= maxWidth) {
            editorPane.style.flex = 'none';
            editorPane.style.width = newWidth + 'px';
        }
    });

    document.addEventListener('mouseup', () => {
        if (isResizing) {
            isResizing = false;
            document.body.style.cursor = '';
        }
    });

    // Load content from URL parameter
    function loadFromURL() {
        const params = new URLSearchParams(window.location.search);
        const loadUrl = params.get('load');
        
        if (loadUrl) {
            fetch(loadUrl)
                .then(response => {
                    if (!response.ok) {
                        throw new Error(`HTTP error! status: ${response.status}`);
                    }
                    return response.text();
                })
                .then(content => {
                    editor.value = content;
                    
                    // Determine mode from URL extension
                    if (loadUrl.endsWith('.json')) {
                        modeSelect.value = 'json';
                        setRenderMode('json');
                    } else {
                        modeSelect.value = 'markdown';
                        setRenderMode('markdown');
                    }
                    
                    renderFunction();
                })
                .catch(error => {
                    host.errorHandler(error, `Failed to load content from ${loadUrl}`);
                });
        } else {
            showHelp();
        }
    }

    // PostMessage support for programmatic content loading
    window.addEventListener('message', (event) => {
        if (event.data && event.data.markdown) {
            editor.value = event.data.markdown;
            modeSelect.value = 'markdown';
            setRenderMode('markdown');
            renderFunction();
        } else if (event.data && event.data.json) {
            editor.value = event.data.json;
            modeSelect.value = 'json';
            setRenderMode('json');
            renderFunction();
        }
    });

    // Initialize
    setRenderMode('markdown');
    loadFromURL();
});
