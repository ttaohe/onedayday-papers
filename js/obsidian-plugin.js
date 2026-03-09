// Obsidian 语法插件 - 处理 wikilinks 和 callouts

function obsidianPlugin(md) {
    // 处理 callout: > [!tip] 内容
    const fenceRule = md.renderer.rules.fence || function(tokens, idx, options, env, self) {
        return self.renderToken(tokens, idx, options);
    };

    md.renderer.rules.fence = function(tokens, idx, options, env, self) {
        const token = tokens[idx];
        const info = token.info ? token.info.trim() : '';

        if (info.startsWith('!')) {
            const calloutType = info.substring(1).toLowerCase().split(' ')[0];
            const titleMatch = token.info.match(/!\w+\s+(.+)/);
            const title = titleMatch ? titleMatch[1] : '';

            let content = token.content;
            const lines = content.split('\n');
            if (lines[0].startsWith('> ')) {
                lines[0] = lines[0].substring(2);
            }
            content = lines.join('\n');

            return `<div class="callout callout-${calloutType}">
                <div class="callout-title">${title || calloutType}</div>
                <div class="callout-content">${md.render(content)}</div>
            </div>`;
        }

        return fenceRule(tokens, idx, options, env, self);
    };

    // 处理 wikilinks: [[链接]] 或 [[链接|显示文本]]
    const defaultText = md.renderer.rules.text || function(tokens, idx, options, env, self) {
        return self.renderToken(tokens, idx, options);
    };

    md.renderer.rules.text = function(tokens, idx, options, env, self) {
        let text = tokens[idx].content;

        // 替换 wikilinks
        text = text.replace(/\[\[([^\]|]+)(\|([^\]]+))?\]\]/g, (match, link, _, display) => {
            const text = display || link;
            return `<a href="#paper-${link.toLowerCase().replace(/\s+/g, '-')}" class="wikilink">${text}</a>`;
        });

        return text;
    };
}

if (typeof module !== 'undefined' && typeof exports !== 'undefined') {
    module.exports = obsidianPlugin;
}
