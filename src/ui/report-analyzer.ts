import { createApp, h, nextTick, ref } from 'vue';
import { fieldLabels } from '../combat.ts';
import { analyzeReport, buildReportCalculatorUrl } from '../report.ts';
import styles from './report-analyzer.css?inline';
import { language, msg, t, type Message } from '../i18n.ts';
import { SettingsDialog } from './settings-dialog.ts';

const panelId = 'astro-empires-report-analyzer';
const materialIconsUrl = 'https://fonts.gstatic.com/s/materialicons/v145/flUhRq6tzZclQEJ-Vdg-IuiaDsNZ.ttf';

export function mountReportAnalyzer(): void {
    if (document.getElementById(panelId)) return;
    const host = document.createElement('div');
    host.id = panelId;
    const root = host.attachShadow({ mode: 'open' });
    const style = document.createElement('style');
    style.textContent = styles;
    const container = document.createElement('div');
    root.append(style, container);
    document.body.append(host);

    createApp({
        setup() {
            const view = ref<'menu' | 'analysis' | null>(null);
            const iconsReady = ref(false);
            const text = ref('');
            const result = ref<ReturnType<typeof analyzeReport> | null>(null);
            const message = ref<Message | null>(null);
            const trigger = ref<HTMLButtonElement | null>(null);
            const analysisButton = ref<HTMLButtonElement | null>(null);
            const input = ref<HTMLTextAreaElement | null>(null);
            const settingsButton = ref<HTMLButtonElement | null>(null);
            const settingsDialog = ref<{ open(initial?: boolean): Promise<void> } | null>(null);
            const returningFromSettings = ref(false);

            const font = new FontFace('Astro Empires Material Icons', `url("${materialIconsUrl}") format("truetype")`, {
                style: 'normal', weight: '400',
            });
            void font.load().then(loaded => {
                document.fonts.add(loaded);
                iconsReady.value = true;
            }).catch(() => { /* 保留可操作的文字備援圖示。 */ });

            async function show(next: typeof view.value): Promise<void> {
                view.value = next;
                await nextTick();
                if (next === 'analysis') input.value?.focus();
                else if (next === 'menu') analysisButton.value?.focus();
                else trigger.value?.focus();
            }

            function analyze(): void {
                result.value = null;
                message.value = null;
                if (!text.value.trim()) {
                    message.value = msg('pasteFirst');
                    return;
                }
                const report = analyzeReport(text.value);
                if (report.error) {
                    message.value = report.error;
                    return;
                }
                if (!report.attacker.count && !report.defender.count) {
                    message.value = msg('noRecognized', { details: [...report.attacker.importErrors, ...report.defender.importErrors] });
                    return;
                }
                result.value = report;
            }

            function openCalculator(): void {
                if (!result.value) return;
                const calculator = buildReportCalculatorUrl(result.value, language.value);
                if ('error' in calculator) {
                    message.value = calculator.error;
                    return;
                }
                message.value = null;
                window.open(calculator.url.href, '_blank', 'noopener,noreferrer');
            }

            const label = (code: string) => `${t(fieldLabels[code as keyof typeof fieldLabels])} (${code})`;
            function renderSide(title: string, side: NonNullable<typeof result.value>['attacker']) {
                return h('section', { class: 'side' }, [
                    h('h3', title),
                    !side.count ? h('p', t('noUnits')) : [
                        Object.keys(side.levels).length ? h('dl', Object.entries(side.levels).flatMap(([code, level]) => [
                            h('dt', label(code)), h('dd', String(level)),
                        ])) : h('p', t('noLevels')),
                        side.unresolved.length ? h('div', [
                            h('h4', t('pending')),
                            h('ul', side.unresolved.map(code => h('li', t(msg('fieldReason', { field: label(code), reason: side.reasons[code] }))))),
                        ]) : null,
                        h('p', { class: 'note' }, t('unlisted')),
                    ],
                    side.warnings.length ? h('ul', side.warnings.map(warning => h('li', t(warning)))) : null,
                ]);
            }

            return () => h('div', {
                lang: language.value,
                onKeydown: (event: KeyboardEvent) => {
                    if (event.key === 'Escape' && view.value) {
                        event.preventDefault();
                        void show(view.value === 'analysis' ? 'menu' : null);
                    }
                },
            }, [
                h('div', {
                    id: `${panelId}-menu`, class: 'feature-list', hidden: view.value !== 'menu',
                    role: 'group', 'aria-label': t('menu'),
                }, [
                    h('button', { ref: analysisButton, type: 'button', onClick: () => show('analysis') }, t('analyzeBbcode')),
                    h('button', { ref: settingsButton, type: 'button', onClick: () => {
                        returningFromSettings.value = true;
                        view.value = null;
                        void settingsDialog.value?.open();
                    } }, t('settings')),
                ]),
                h('section', {
                    id: `${panelId}-panel`, class: 'panel', hidden: view.value !== 'analysis',
                    role: 'dialog', 'aria-labelledby': `${panelId}-title`,
                }, [
                    h('header', [
                        h('h2', { id: `${panelId}-title` }, t('analysisTitle')),
                        h('button', { type: 'button', 'aria-label': t('closeAnalysis'), onClick: () => show('menu') }, t('close')),
                    ]),
                    h('label', { for: `${panelId}-input` }, t('reportInput')),
                    h('textarea', {
                        ref: input, id: `${panelId}-input`, rows: 8, spellcheck: false, value: text.value,
                        placeholder: t('reportPlaceholder'),
                        onInput: (event: Event) => {
                            text.value = (event.target as HTMLTextAreaElement).value;
                            result.value = null;
                            message.value = null;
                        },
                    }),
                    h('button', { type: 'button', onClick: analyze }, t('analyze')),
                    h('p', { role: 'status', hidden: !message.value }, t(message.value)),
                    result.value ? h('div', { class: 'results' }, [
                        h('button', { type: 'button', onClick: openCalculator }, t('importCalculator')),
                        renderSide(t('attacker'), result.value.attacker), renderSide(t('defender'), result.value.defender),
                    ]) : null,
                ]),
                h('button', {
                    ref: trigger, type: 'button', class: 'trigger',
                    'aria-label': t(view.value ? 'closeMenu' : 'openMenu'),
                    'aria-expanded': String(view.value !== null),
                    'aria-controls': `${panelId}-menu ${panelId}-panel`,
                    onClick: () => show(view.value ? null : 'menu'),
                }, [h('span', { class: iconsReady.value ? 'material-icons' : 'icon-fallback', 'aria-hidden': 'true' },
                    iconsReady.value ? (view.value ? 'close' : 'keyboard_arrow_up') : (view.value ? '×' : '↑'))]),
                h(SettingsDialog, { ref: settingsDialog, onClosed: async () => {
                    if (returningFromSettings.value) {
                        returningFromSettings.value = false;
                        await show('menu');
                        settingsButton.value?.focus();
                    } else trigger.value?.focus();
                } }),
            ]);
        },
    }).mount(container);
}
