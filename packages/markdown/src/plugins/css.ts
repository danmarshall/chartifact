/*!
* Copyright (c) Microsoft Corporation.
* Licensed under the MIT License.
*/

import { definePlugin, IInstance, Plugin } from '../factory.js';
import { sanitizedHTML } from '../sanitize.js';
import * as Csstree from 'css-tree';

// CSS Tree is expected to be available as a global variable
declare const csstree: typeof Csstree;

interface Declaration {
    css: string;        // Safe CSS
    unsafeCss?: string; // Original unsafe CSS content (for debugging)
    flag?: 'xss' | 'scriptExec' | 'insecureExternalResource' | 'externalResource' | 'malformed' | 'importRule' | 'svgDataUrl';
    reason?: string;
}

interface Rule {
    selector: string;        // e.g., "body", ".class"
    declarations: Declaration[];
}

interface AtRule {
    signature: string;       // e.g., "@media screen", "@keyframes", "" for global
    rules?: Rule[];         // For at-rules that contain rules
    css?: string;           // For simple at-rules that don't contain rules  
    flag?: "xss" | "scriptExec" | "externalResource" | "malformed" | "importRule" | "svgDataUrl";
    reason?: string;
}

interface CategorizedCss {
    atRules: { [atRuleSignature: string]: AtRule };
    hasFlags: boolean;
}

// Helper function to reconstitute an at-rule block from at-rule data
function reconstituteAtRule(atRule: AtRule): string {
    if (atRule.css) {
        // Simple at-rule (like @import) - check if it's flagged
        return atRule.flag ? `/* ${atRule.css} - BLOCKED: ${atRule.reason} */` : atRule.css;
    }

    if (!atRule.rules || atRule.rules.length === 0) return '';

    // At-rule with contained rules - reconstitute each rule
    const reconstitutedRules: string[] = [];

    for (const rule of atRule.rules) {
        const validDeclarations = rule.declarations
            .map(decl => decl.css)
            .filter(css => css.trim() !== '');

        if (validDeclarations.length > 0) {
            reconstitutedRules.push(`${rule.selector} {\n  ${validDeclarations.join(';\n  ')};\n}`);
        }
    }

    if (reconstitutedRules.length === 0) return '';

    if (atRule.signature === '') {
        // Global rules (no at-rule wrapper)
        return reconstitutedRules.join('\n\n');
    } else {
        // At-rule with contained rules
        return `${atRule.signature} {\n${reconstitutedRules.join('\n\n')}\n}`;
    }
}

// Helper function to reconstitute complete CSS from categorized rules
function reconstituteCss(atRules: { [atRuleSignature: string]: AtRule }): string {
    const cssBlocks: string[] = [];

    for (const atRule of Object.values(atRules)) {
        const reconstructed = reconstituteAtRule(atRule);
        if (reconstructed.trim()) {
            cssBlocks.push(reconstructed);
        }
    }

    return cssBlocks.join('\n\n');
}

function categorizeCss(cssContent: string): CategorizedCss {
    const result: CategorizedCss = {
        atRules: {},
        hasFlags: false
    };

    // Helper function to check for security issues using AST node analysis
    function checkSecurityIssues(node: any): Pick<Declaration, 'flag' | 'reason'> | null {
        // Check for script execution in CSS expressions
        if (node.type === 'Function' && node.name === 'expression') {
            return { flag: 'scriptExec', reason: 'CSS expression() function detected' };
        }

        // Check URLs for security issues
        if (node.type === 'Url') {
            const urlValue = node.value;
            if (!urlValue) return null;

            const url = urlValue.value || urlValue;
            const urlStr = url.toLowerCase();

            // Script URLs
            if (urlStr.startsWith('javascript:') || urlStr.startsWith('vbscript:')) {
                return { flag: 'scriptExec', reason: `${urlStr.split(':')[0]} URL detected` };
            }

            // Data URLs need specific checking
            if (urlStr.startsWith('data:')) {
                // SVG data URLs can contain scripts
                if (urlStr.includes('data:image/svg+xml')) {
                    if (urlStr.includes('<script')) {
                        return { flag: 'svgDataUrl', reason: 'SVG data URL with script detected' };
                    }
                    //TODO check for inline handlers
                }
                // Other data URLs might be safe, but let's flag for review
                return { flag: 'externalResource', reason: 'Data URL detected' };
            }

            // External HTTP/HTTPS URLs
            if (urlStr.startsWith('http://')) {
                return { flag: 'insecureExternalResource', reason: 'Insecure external URL (http) detected' };
            } else if (urlStr.startsWith('https://')) {
                return { flag: 'externalResource', reason: 'External URL detected' };
            }
        }

        // Check for CSS-encoded XSS attempts in values
        if (node.type === 'String' || node.type === 'Identifier') {
            const value = node.value || node.name || '';
            if (typeof value === 'string') {
                const valueStr = value.toLowerCase();
                // Check for CSS-encoded characters that could be XSS
                if (valueStr.includes('\\') && (valueStr.includes('3c') || valueStr.includes('3e') || valueStr.includes('22') || valueStr.includes('27'))) {
                    return { flag: 'xss', reason: 'Potential CSS-encoded XSS detected' };
                }
            }
        }

        return null;
    }

    try {
        // Parse CSS with CSS Tree
        const ast = csstree.parse(cssContent);

        // Track current rule being built as we walk
        let currentRule: Rule | null = null;
        let currentAtRuleSignature = ''; // Global context by default

        // Single walk through the AST - process each node once
        csstree.walk(ast, (node) => {
            if (node.type === 'Atrule') {
                const atRuleSignature = `@${node.name}${node.prelude ? ` ${csstree.generate(node.prelude)}` : ''}`;

                // Check for @import specifically
                if (node.name === 'import') {
                    const ruleContent = csstree.generate(node);
                    result.atRules[atRuleSignature] = {
                        signature: atRuleSignature,
                        css: ruleContent,
                        flag: 'importRule',
                        reason: '@import rule detected - requires approval'
                    };
                    result.hasFlags = true;
                    return;
                }

                // For other at-rules that contain rules (like @media, @keyframes)
                if (node.block) {
                    if (!result.atRules[atRuleSignature]) {
                        result.atRules[atRuleSignature] = {
                            signature: atRuleSignature,
                            rules: []
                        };
                    }
                    // Set current context for nested rules
                    currentAtRuleSignature = atRuleSignature;
                } else {
                    // Simple at-rule without block
                    const ruleContent = csstree.generate(node);
                    result.atRules[atRuleSignature] = {
                        signature: atRuleSignature,
                        css: ruleContent
                    };
                }

            } else if (node.type === 'Rule') {
                // Finish previous rule if one exists
                if (currentRule && currentRule.declarations.length > 0) {
                    const targetAtRule = currentAtRuleSignature;

                    if (!result.atRules[targetAtRule]) {
                        result.atRules[targetAtRule] = {
                            signature: targetAtRule,
                            rules: []
                        };
                    }

                    if (result.atRules[targetAtRule].rules) {
                        result.atRules[targetAtRule].rules.push(currentRule);
                    } else {
                        result.atRules[targetAtRule].rules = [currentRule];
                    }
                }

                // Start building a new rule
                const selector = csstree.generate(node.prelude);
                currentRule = {
                    selector,
                    declarations: []
                };

            } else if (node.type === 'Declaration' && currentRule) {
                // Process declaration within the current rule
                const declCss = csstree.generate(node);
                const declaration: Declaration = { css: declCss };

                // Check this declaration node directly for security issues
                const securityCheck = checkSecurityIssues(node);
                if (securityCheck) {
                    declaration.css = `/* omitted (${securityCheck.reason}) */`;
                    declaration.unsafeCss = declCss;
                    declaration.flag = securityCheck.flag;
                    declaration.reason = securityCheck.reason;
                    result.hasFlags = true;
                }

                currentRule.declarations.push(declaration);

            } else if (currentRule &&
                (node.type === 'Function' || node.type === 'Url' ||
                    node.type === 'String' || node.type === 'Identifier')) {
                // Check child nodes of the current declaration for security issues
                const securityCheck = checkSecurityIssues(node);
                if (securityCheck && currentRule.declarations.length > 0) {
                    const lastDecl = currentRule.declarations[currentRule.declarations.length - 1];
                    if (!lastDecl.flag) { // Only flag if not already flagged
                        lastDecl.unsafeCss = lastDecl.css; // Preserve original before overwriting
                        lastDecl.css = `/* omitted (${securityCheck.reason}) */`;
                        lastDecl.flag = securityCheck.flag;
                        lastDecl.reason = securityCheck.reason;
                        result.hasFlags = true;
                    }
                }
            }
        });

        // Don't forget to add the last rule if it exists
        if (currentRule && currentRule.declarations.length > 0) {
            const targetAtRule = currentAtRuleSignature;

            if (!result.atRules[targetAtRule]) {
                result.atRules[targetAtRule] = {
                    signature: targetAtRule,
                    rules: []
                };
            }

            if (result.atRules[targetAtRule].rules) {
                result.atRules[targetAtRule].rules.push(currentRule);
            } else {
                result.atRules[targetAtRule].rules = [currentRule];
            }
        }

    } catch (parseError) {
        // Don't swallow CSS parsing errors - throw them so they can be handled upstream
        throw new Error(`CSS parsing failed: ${parseError.message}`);
    }

    return result;
}

export const cssPlugin: Plugin = {
    name: 'css',
    initializePlugin: (md) => {
        // Check for required css-tree dependency
        if (typeof csstree === 'undefined') {
            throw new Error('css-tree library is required for CSS plugin. Please include the css-tree script.');
        }

        definePlugin(md, 'css');
        // Custom rule for CSS blocks
        md.block.ruler.before('fence', 'css_block', function (state, startLine, endLine) {
            const start = state.bMarks[startLine] + state.tShift[startLine];
            const max = state.eMarks[startLine];

            // Check if the block starts with "```css"
            if (!state.src.slice(start, max).trim().startsWith('```css')) {
                return false;
            }

            let nextLine = startLine;
            while (nextLine < endLine) {
                nextLine++;
                if (state.src.slice(state.bMarks[nextLine] + state.tShift[nextLine], state.eMarks[nextLine]).trim() === '```') {
                    break;
                }
            }

            state.line = nextLine + 1;
            const token = state.push('fence', 'code', 0);
            token.info = 'css';
            token.content = state.getLines(startLine + 1, nextLine, state.blkIndent, true);
            token.map = [startLine, state.line];

            return true;
        });

        // Custom renderer for CSS fence blocks
        const originalFence = md.renderer.rules.fence;
        md.renderer.rules.fence = function (tokens, idx, options, env, slf) {
            const token = tokens[idx];
            const info = token.info.trim();

            if (info === 'css') {
                const cssId = `css-${idx}`;
                const cssContent = token.content.trim();

                // Parse and categorize CSS content
                const categorizedCss = categorizeCss(cssContent);

                return sanitizedHTML('div', { id: cssId, class: 'css-component' }, JSON.stringify(categorizedCss));
            }

            // Fallback to original fence renderer
            if (originalFence) {
                return originalFence(tokens, idx, options, env, slf);
            } else {
                return '';
            }
        };
    },
    hydrateComponent: async (renderer, errorHandler) => {
        const cssInstances: { id: string; element: HTMLStyleElement }[] = [];
        const containers = renderer.element.querySelectorAll('.css-component');

        for (const [index, container] of Array.from(containers).entries()) {
            if (!container.textContent) continue;

            try {
                const categorizedCss: CategorizedCss = JSON.parse(container.textContent);
                const comments: string[] = [];

                // Log security issues found
                if (categorizedCss.hasFlags) {
                    console.warn(`CSS security: Security issues detected in CSS`);
                    comments.push(`<!-- CSS security issues detected and filtered -->`);
                }

                // Generate and apply safe CSS
                const safeCss = reconstituteCss(categorizedCss.atRules);

                if (safeCss.trim().length > 0) {
                    const styleElement = document.createElement('style');
                    styleElement.type = 'text/css';
                    styleElement.id = `idocs-css-${container.id}`;
                    styleElement.textContent = safeCss;

                    // Apply to shadow DOM if available, otherwise document
                    const target = renderer.shadowRoot || document.head;
                    target.appendChild(styleElement);

                    comments.push(`<!-- CSS styles applied to ${renderer.shadowRoot ? 'shadow DOM' : 'document'} -->`);

                    cssInstances.push({
                        id: container.id,
                        element: styleElement
                    });
                } else {
                    comments.push(`<!-- No safe CSS styles to apply -->`);
                }
                container.innerHTML = comments.join('\n');
            } catch (e) {
                container.innerHTML = `<div class="error">${e.toString()}</div>`;
                errorHandler(e, 'CSS', index, 'parse', container);
                continue;
            }
        }

        const instances: IInstance[] = cssInstances.map((cssInstance) => {
            return {
                id: cssInstance.id,
                initialSignals: [], // CSS doesn't need signals
                destroy: () => {
                    // Remove the style element when the instance is destroyed
                    if (cssInstance.element && cssInstance.element.parentNode) {
                        cssInstance.element.parentNode.removeChild(cssInstance.element);
                    }
                },
            };
        });

        return instances;
    },
};
