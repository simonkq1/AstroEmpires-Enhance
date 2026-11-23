const reportTables = new Set(['battle-report_info', 'battle-report_attack', 'battle-report_defense']);

export function reportToBbcode(report: HTMLElement, baseUrl: string): string {
    for (const name of reportTables) {
        if (!report.querySelector(`table.${name}`)) throw new Error('incompleteReport');
    }

    function serialize(node: Node): string {
        if (node.nodeType === 3) return (node.textContent ?? '').replace(/\s+/g, ' ');
        if (node.nodeType !== 1) return '';
        const element = node as HTMLElement;
        if (element.matches('script,style')) return '';
        if (element.tagName === 'BR') return '\n';
        if (element.tagName === 'TABLE') return serializeTable(element as HTMLTableElement);
        const contents = Array.from(element.childNodes, serialize).join('');
        if (element.matches('b,strong')) return `[b]${contents}[/b]`;
        if (element.tagName === 'A') {
            const url = new URL(element.getAttribute('href') ?? '', baseUrl);
            if (url.protocol === 'https:' || url.protocol === 'http:') {
                const href = url.href.replaceAll('[', '%5B').replaceAll(']', '%5D');
                return `[url=${href}]${contents}[/url]`;
            }
        }
        return element.matches('center,div,p') ? `${contents.trim()}\n` : contents;
    }

    function serializeTable(table: HTMLTableElement): string {
        const name = [...table.classList].find(value => reportTables.has(value));
        if (!name || table.closest('.battle-report') !== report) return '';
        const rows = Array.from(table.rows).filter(row => row.closest('table') === table);
        if (name === 'battle-report_info') {
            return rows.map(row => {
                const cells = Array.from(row.cells, cell => Array.from(cell.childNodes, serialize).join('').trim());
                return cells.length === 1 ? `[b]${cells[0]}[/b]` : `${cells[0]}：${cells.slice(1).join(' ')}`;
            }).join('\n') + '\n';
        }
        let title = '';
        const lines: string[] = [];
        for (const row of rows) {
            const cells = Array.from(row.cells, cell => cell.textContent.replace(/\s+/g, ' ').trim());
            if (cells.length === 1) title = `[b]${cells[0]}[/b]`;
            else lines.push(cells.join('\t'));
        }
        return `${title}\n[code]\n${lines.join('\n')}\n[/code]\n`;
    }

    return Array.from(report.childNodes, serialize).join('').replace(/\n{3,}/g, '\n\n').trim();
}
