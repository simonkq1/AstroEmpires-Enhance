import { createApp, h } from 'vue';
import { findPillageElement, readBaseDetails } from '../base.ts';
import { t } from '../i18n.ts';

const panelId = 'astro-empires-base-estimate';

export function mountBaseEstimate(): void {
    if (document.getElementById(panelId)) return;
    const base = readBaseDetails(document);
    const anchor = findPillageElement(document);
    if (!base || !anchor) return;
    const host = document.createElement('div');
    host.id = panelId;
    const root = host.attachShadow({ mode: 'open' });
    const style = document.createElement('style');
    style.textContent = `:host { all: initial !important; display: block !important; margin: 8px 0 !important; }
        div { font: 14px/1.5 system-ui, sans-serif; color: #e7f1f6; text-align: center; direction: ltr; }`;
    const container = document.createElement('div');
    root.append(style, container);
    anchor.after(host);
    createApp({ render: () => [
        h('strong', t('baseCountLabel') + ': '), h('span', base.count === null ? t('unavailable') : String(base.count)),
        base.reason ? h('div', t(base.reason)) : null,
    ] }).mount(container);
}
