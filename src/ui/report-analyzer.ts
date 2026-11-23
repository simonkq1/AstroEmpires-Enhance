import { createApp, h, nextTick, ref } from 'vue';
import { fieldLabels } from '../combat.ts';
import { analyzeReport, buildReportCalculatorUrl } from '../report.ts';
import styles from './report-analyzer.css?inline';

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
            const message = ref('');
            const trigger = ref<HTMLButtonElement | null>(null);
            const analysisButton = ref<HTMLButtonElement | null>(null);
            const input = ref<HTMLTextAreaElement | null>(null);

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
                message.value = '';
                if (!text.value.trim()) {
                    message.value = '請先貼上戰報 BBCode。';
                    return;
                }
                const report = analyzeReport(text.value);
                if (report.error) {
                    message.value = report.error;
                    return;
                }
                if (!report.attacker.count && !report.defender.count) {
                    message.value = '沒有可辨識的單位，請貼上含攻守方標題與 [code] 兵力表格的 BBCode。'
                        + [...report.attacker.importErrors, ...report.defender.importErrors].join(' ');
                    return;
                }
                result.value = report;
            }

            function openCalculator(): void {
                if (!result.value) return;
                const calculator = buildReportCalculatorUrl(result.value);
                if ('error' in calculator) {
                    message.value = calculator.error;
                    return;
                }
                message.value = '';
                window.open(calculator.url.href, '_blank', 'noopener,noreferrer');
            }

            const label = (code: string) => `${fieldLabels[code as keyof typeof fieldLabels]} (${code})`;
            function renderSide(title: string, side: NonNullable<typeof result.value>['attacker']) {
                return h('section', { class: 'side' }, [
                    h('h3', title),
                    !side.count ? h('p', '沒有可辨識的單位資料。') : [
                        Object.keys(side.levels).length ? h('dl', Object.entries(side.levels).flatMap(([code, level]) => [
                            h('dt', label(code)), h('dd', String(level)),
                        ])) : h('p', '目前沒有可確認的科技等級。'),
                        side.unresolved.length ? h('div', [
                            h('h4', '待確認'),
                            h('ul', side.unresolved.map(code => h('li', `${label(code)} — ${side.reasons[code]}`))),
                        ]) : null,
                        h('p', { class: 'note' }, '未列出的科技缺少可用資料。'),
                    ],
                    side.warnings.length ? h('ul', side.warnings.map(warning => h('li', warning))) : null,
                ]);
            }

            return () => h('div', {
                onKeydown: (event: KeyboardEvent) => {
                    if (event.key === 'Escape' && view.value) {
                        event.preventDefault();
                        void show(view.value === 'analysis' ? 'menu' : null);
                    }
                },
            }, [
                h('div', {
                    id: `${panelId}-menu`, class: 'feature-list', hidden: view.value !== 'menu',
                    role: 'group', 'aria-label': '功能選單',
                }, [
                    h('button', { ref: analysisButton, type: 'button', onClick: () => show('analysis') }, '分析 BBCode'),
                ]),
                h('section', {
                    id: `${panelId}-panel`, class: 'panel', hidden: view.value !== 'analysis',
                    role: 'dialog', 'aria-labelledby': `${panelId}-title`,
                }, [
                    h('header', [
                        h('h2', { id: `${panelId}-title` }, 'BBCode 戰報分析'),
                        h('button', { type: 'button', 'aria-label': '關閉戰報分析', onClick: () => show('menu') }, '關閉'),
                    ]),
                    h('label', { for: `${panelId}-input` }, '戰報 BBCode'),
                    h('textarea', {
                        ref: input, id: `${panelId}-input`, rows: 8, spellcheck: false, value: text.value,
                        placeholder: '貼上完整戰報或攻守方兵力表格的 BBCode',
                        onInput: (event: Event) => {
                            text.value = (event.target as HTMLTextAreaElement).value;
                            result.value = null;
                            message.value = '';
                        },
                    }),
                    h('button', { type: 'button', onClick: analyze }, '分析'),
                    h('p', { role: 'status', hidden: !message.value }, message.value),
                    result.value ? h('div', { class: 'results' }, [
                        h('button', { type: 'button', onClick: openCalculator }, '導入 AEBits 戰鬥模擬器'),
                        renderSide('攻方', result.value.attacker), renderSide('守方', result.value.defender),
                    ]) : null,
                ]),
                h('button', {
                    ref: trigger, type: 'button', class: 'trigger',
                    'aria-label': view.value ? '收合功能選單' : '開啟功能選單',
                    'aria-expanded': String(view.value !== null),
                    'aria-controls': `${panelId}-menu ${panelId}-panel`,
                    onClick: () => show(view.value ? null : 'menu'),
                }, [h('span', { class: iconsReady.value ? 'material-icons' : 'icon-fallback', 'aria-hidden': 'true' },
                    iconsReady.value ? (view.value ? 'close' : 'keyboard_arrow_up') : (view.value ? '×' : '↑'))]),
            ]);
        },
    }).mount(container);
}
