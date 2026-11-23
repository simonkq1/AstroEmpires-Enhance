import { createApp, h, nextTick, ref } from 'vue';
import { reportToBbcode } from '../report-bbcode.ts';
import styles from './fleet-toolbar.css?inline';

const marker = 'data-astro-empires-report-copy';

export function initializeReportCopy(): void {
    if (document.documentElement.hasAttribute(marker)) return;
    document.documentElement.setAttribute(marker, '');

    function attach(report: HTMLElement): void {
        if (report.nextElementSibling?.hasAttribute(marker)) return;
        const host = document.createElement('div');
        host.setAttribute(marker, '');
        const root = host.attachShadow({ mode: 'open' });
        const style = document.createElement('style');
        style.textContent = styles;
        const container = document.createElement('div');
        container.className = 'toolbar';
        root.append(style, container);
        report.after(host);

        createApp({
            setup() {
                const status = ref('');
                const fallback = ref('');
                const textarea = ref<HTMLTextAreaElement | null>(null);
                let copying = false;

                async function copy(): Promise<void> {
                    if (copying) return;
                    copying = true;
                    fallback.value = '';
                    try {
                        const text = reportToBbcode(report, location.href);
                        try {
                            await navigator.clipboard.writeText(text);
                            status.value = '已複製戰報 BBCode。';
                        } catch {
                            status.value = '無法存取剪貼簿，請手動複製下方的 BBCode。';
                            fallback.value = text;
                            await nextTick();
                            textarea.value?.focus();
                            textarea.value?.select();
                        }
                    } catch {
                        status.value = '戰報資料不完整，無法轉換。';
                    } finally {
                        copying = false;
                    }
                }

                return () => [
                    h('button', { type: 'button', class: 'action', onClick: copy }, '複製戰報 BBCode'),
                    h('div', { class: 'status', role: 'status' }, status.value),
                    h('textarea', {
                        ref: textarea, class: 'fallback', readonly: true, rows: 6,
                        hidden: !fallback.value, value: fallback.value, 'aria-label': '戰報 BBCode',
                    }),
                ];
            },
        }).mount(container);
    }

    function scan(element: Element): void {
        if (element.matches('.battle-report')) attach(element as HTMLElement);
        element.querySelectorAll<HTMLElement>('.battle-report').forEach(attach);
    }

    scan(document.body);
    const observer = new MutationObserver(records => {
        for (const record of records) {
            for (const node of record.addedNodes) {
                if (node instanceof Element) scan(node);
            }
        }
    });
    observer.observe(document.body, { childList: true, subtree: true });
}
