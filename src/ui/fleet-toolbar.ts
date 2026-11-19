import { createApp, h, nextTick, ref } from 'vue';
import Button from 'primevue/button';
import PrimeVue from 'primevue/config';
import type { readCombatTechnologies } from '../combat.ts';
import { buildCalculatorUrl, formatFleetTsv, type CalculatorRosters, type FleetLanguage, type FleetUnit } from '../fleet.ts';
import styles from './fleet-toolbar.css?inline';
import { setPrimeVueStyleRoot } from './primevue-style.ts';

export const panelId = 'astro-empires-fleet-actions';
export const calculatorLabel = 'AEBits战斗计算器';
const languages = [['chinese', '簡體中文'], ['english', '英文']] as const;

type CopySource = { units: FleetUnit[]; side?: '攻方' | '守方' };
type ActionChoice = [label: string, action: () => void];
type CalculatorChoice = [label: string, rosters: CalculatorRosters];
type Menu = 'copy' | 'aebits';

export function mountFleetActions(
    table: HTMLTableElement,
    sources: CopySource[],
    calculators: CalculatorChoice[],
    readTechnologies?: () => ReturnType<typeof readCombatTechnologies>,
): void {
    const availableSources = sources.filter(({ units }) => units.length);
    if (!availableSources.length) return;

    const host = document.createElement('div');
    host.id = panelId;
    const shadow = host.attachShadow({ mode: 'open' });
    const style = document.createElement('style');
    style.textContent = styles;
    const container = document.createElement('div');
    container.className = 'toolbar';
    shadow.append(style, container);
    table.after(host);
    setPrimeVueStyleRoot(shadow);

    createApp({
        setup() {
            const expanded = ref<Menu | null>(null);
            const status = ref('');
            const fallback = ref<{ text: string; rows: number } | null>(null);
            const textarea = ref<HTMLTextAreaElement | null>(null);
            const copyChoices = availableSources.flatMap(({ units, side }) =>
                languages.map(([language, languageLabel]): ActionChoice => {
                    const label = side ? `${side} ${languageLabel}` : languageLabel;
                    return [label, () => copyFleet(units, language, label)];
                }));
            const calculatorChoices = calculators.map(([label, rosters]): ActionChoice =>
                [label, () => openCalculator(rosters)]);

            function actionButton(label: string, onClick: () => void, attrs = {}) {
                return h(Button, { label, type: 'button', class: 'action', onClick, ...attrs });
            }

            function menu(id: Menu, label: string, choices: ActionChoice[]) {
                const triggerId = `${panelId}-${id}-trigger`;
                const optionsId = `${panelId}-${id}-options`;
                const open = expanded.value === id;
                return h('div', [
                    actionButton(label, () => { expanded.value = open ? null : id; }, {
                        id: triggerId,
                        'aria-controls': optionsId,
                        'aria-expanded': String(open),
                    }),
                    h('div', { id: optionsId, class: 'options', hidden: !open }, choices.map(([choice, action]) =>
                        actionButton(choice, () => {
                            expanded.value = null;
                            shadow.getElementById(triggerId)?.focus();
                            action();
                        }, { key: choice }))),
                ]);
            }

            async function copyFleet(units: FleetUnit[], language: FleetLanguage, label: string): Promise<void> {
                const text = formatFleetTsv(units, language);
                fallback.value = null;
                try {
                    await navigator.clipboard.writeText(text);
                    status.value = `已複製${label}艦隊資料。`;
                } catch {
                    status.value = '無法存取剪貼簿，請手動複製下方的艦隊資料。';
                    fallback.value = { text, rows: Math.min(units.length, 6) };
                    await nextTick();
                    textarea.value?.focus();
                    textarea.value?.select();
                }
            }

            function openCalculator(rosters: CalculatorRosters): void {
                expanded.value = null;
                const combat = readTechnologies?.();
                const result = buildCalculatorUrl(rosters, combat?.technologies);
                if ('unknownNames' in result) {
                    status.value = `無法匯入，未識別的單位為 ${result.unknownNames.join('、')}。`;
                    return;
                }

                if (combat) status.value = combat.notice;
                window.open(result.url.href, '_blank', 'noopener,noreferrer');
            }

            return () => [
                h('div', { class: 'actions' }, [
                    menu('copy', '複製艦隊資料', copyChoices),
                    calculatorChoices.length === 1 ? actionButton(...calculatorChoices[0])
                        : menu('aebits', calculatorLabel, calculatorChoices),
                ]),
                h('div', { class: 'status', role: 'status' }, status.value),
                h('textarea', {
                    ref: textarea,
                    class: 'fallback',
                    readonly: true,
                    hidden: !fallback.value,
                    rows: fallback.value?.rows ?? 1,
                    value: fallback.value?.text ?? '',
                    'aria-label': '艦隊資料',
                }),
            ];
        },
    }).use(PrimeVue, { unstyled: true, ripple: false }).mount(container);
}
