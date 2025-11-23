const PodParser = {
    parse: function (text) {
        if (!text) return "";
        text = text.replace(/\r\n/g, "\n");
        const blocks = text.split(/\n\n+/);

        let html = "";

        // --- STATE TRACKING ---
        const listStack = [];
        let forceNewList = false;
        let inVerbatim = false;

        blocks.forEach((block) => {
            let cleanBlock = block.trim();
            if (!cleanBlock) return;

            // Check indentation using the raw block
            const isVerbatimBlock = block.match(/^\s/);

            // --- COMMANDS ---
            if (cleanBlock.startsWith("=")) {
                if (inVerbatim) {
                    html += "</code></pre>";
                    inVerbatim = false;
                }

                const parts = cleanBlock.split(/\s+/);
                const command = parts[0];
                const rawContent = cleanBlock.substring(command.length).trim();

                if (command === "=over") {
                    forceNewList = true;
                    return;
                }

                if (command === "=back") {
                    if (listStack.length > 0) {
                        html += "</li>";
                        html += `</${listStack.pop()}>`;
                    }
                    forceNewList = false;
                    return;
                }

                if (command === "=item") {
                    const isNumbered = rawContent.match(/^\d+\./);
                    const targetType = isNumbered ? "ol" : "ul";

                    let itemContent = rawContent.replace(/^(\*|\d+\.?)\s*/, "");
                    itemContent = this.formatInline(itemContent);

                    if (forceNewList) {
                        html += `<${targetType}>`;
                        listStack.push(targetType);
                        forceNewList = false;
                    } else if (listStack.length === 0) {
                        html += `<${targetType}>`;
                        listStack.push(targetType);
                    } else {
                        html += "</li>";
                        const currentType = listStack[listStack.length - 1];
                        if (currentType !== targetType) {
                            html += `</${currentType}><${targetType}>`;
                            listStack.pop();
                            listStack.push(targetType);
                        }
                    }
                    html += `<li>${itemContent}`;
                    return;
                }

                switch (command) {
                    case "=head1": html += `<h1>${this.formatInline(rawContent)}</h1>`; break;
                    case "=head2": html += `<h2>${this.formatInline(rawContent)}</h2>`; break;
                    case "=head3": html += `<h3>${this.formatInline(rawContent)}</h3>`; break;
                    case "=head4": html += `<h4>${this.formatInline(rawContent)}</h4>`; break;
                    case "=cut": break;
                }
            }

            // --- TEXT & CODE ---
            else {
                if (isVerbatimBlock) {
                    // CASE: Code Block
                    if (!inVerbatim) {
                        // Start new block with the class
                        html += '<pre><code class="language-perl">';
                        inVerbatim = true;
                        html += this.escapeHtml(block);
                    } else {
                        // Merge with previous block
                        html += "\n\n" + this.escapeHtml(block);
                    }
                } else {
                    // CASE: Standard Paragraph
                    if (inVerbatim) {
                        html += "</code></pre>";
                        inVerbatim = false;
                    }
                    html += `<p>${this.formatInline(cleanBlock)}</p>`;
                }
            }
        });

        // Cleanup
        if (inVerbatim) {
            html += "</code></pre>";
        }
        while (listStack.length > 0) {
            html += "</li>";
            html += `</${listStack.pop()}>`;
        }

        return html;
    },

    formatInline: function (text) {
        if (!text) return "";

        const placeholders = [];
        // Double angle brackets C<< ... >>
        text = text.replace(/C<<\s+(.*?)\s+>>/g, (match, codeContent) => {
            placeholders.push(codeContent);
            return `__POD_DBL_CODE_${placeholders.length - 1}__`;
        });

        let html = this.escapeHtml(text);

        // Standard tags
        const regex = /([BCIFEL])&lt;((?:(?!&lt;|&gt;).)*)&gt;/g;

        let matchFound = true;
        while (matchFound) {
            matchFound = false;
            html = html.replace(regex, (match, code, content) => {
                matchFound = true;
                switch (code) {
                    case 'B': return `<strong>${content}</strong>`;
                    case 'I': return `<em>${content}</em>`;
                    case 'C': return `<code class="language-perl">${content}</code>`; // Added class here
                    case 'F': return `<em>${content}</em>`;
                    case 'E': return this.parseEntity(content);
                    case 'L': return this.parseLink(content);
                    default: return match;
                }
            });
        }

        // Restore double angle brackets
        html = html.replace(/__POD_DBL_CODE_(\d+)__/g, (match, index) => {
            // Added class here as well
            return `<code class="language-perl">${this.escapeHtml(placeholders[index])}</code>`;
        });

        return html;
    },

    parseLink: function (content) {
        let parts = content.split('|');
        let text = parts[0];
        let url = parts[1] || ("https://metacpan.org/pod/" + text);
        return `<a href="${url}" target="_blank">${text}</a>`;
    },

    parseEntity: function (content) {
        const ent = { 'lt': '&lt;', 'gt': '&gt;', 'sol': '/', 'verbar': '|' };
        return ent[content] || `&${content};`;
    },

    escapeHtml: function (text) {
        return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;").replace(/'/g, "&#039;");
    }
};
