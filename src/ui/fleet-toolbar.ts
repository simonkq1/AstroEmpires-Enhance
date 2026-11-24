import { createApp, h, nextTick, ref } from 'vue';
import Button from 'primevue/button';
import PrimeVue from 'primevue/config';
import type { readCombatTechnologies } from '../combat.ts';
import { buildCalculatorUrl, formatFleetTsv, type CalculatorRosters, type FleetLanguage, type FleetUnit } from '../fleet.ts';
import styles from './fleet-toolbar.css?inline';
import { setPrimeVueStyleRoot } from './primevue-style.ts';
import { language, msg, t, type Message, type MessageKey } from '../i18n.ts';
import type { BaseImportState } from '../combat-base.ts';

export const panelId = 'astro-empires-fleet-actions';
const languages = [['chinese', 'chinese'], ['english', 'english']] as const;

type CopySource = { units: FleetUnit[]; side?: 'attacker' | 'defender' };
type ActionChoice = [label: Message, action: () => void];
type CalculatorChoice = [label: MessageKey, rosters: CalculatorRosters];
type Menu = 'copy' | 'aebits';

export function mountFleetActions(
    table: HTMLTableElement,
    sources: CopySource[],
    calculators: CalculatorChoice[],
    readTechnologies?: () => ReturnType<typeof readCombatTechnologies>,
    baseImport?: BaseImportState,
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
            const status = ref<Message | null>(null);
            const fallback = ref<{ text: string; rows: number } | null>(null);
            const textarea = ref<HTMLTextAreaElement | null>(null);
            const copyChoices = availableSources.flatMap(({ units, side }) =>
                languages.map(([language, languageLabel]): ActionChoice => {
                    const label = side ? msg('copyChoice', { side: msg(side), language: msg(languageLabel) }) : msg(languageLabel);
                    return [label, () => copyFleet(units, language, label)];
                }));
            const calculatorChoices = calculators.map(([label, rosters]): ActionChoice =>
                [msg(label), () => openCalculator(rosters)]);

            function actionButton(label: Message | MessageKey, onClick: () => void, attrs = {}) {
                return h(Button, { label: t(label), type: 'button', class: 'action', onClick, ...attrs });
            }

            function menu(id: Menu, label: MessageKey, choices: ActionChoice[]) {
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
                        }, { key: t(choice) }))),
                ]);
            }

            async function copyFleet(units: FleetUnit[], language: FleetLanguage, label: Message): Promise<void> {
                const text = formatFleetTsv(units, language);
                fallback.value = null;
                try {
                    await navigator.clipboard.writeText(text);
                    status.value = msg('copiedFleet', { choice: label });
                } catch {
                    status.value = msg('clipboardFleet');
                    fallback.value = { text, rows: Math.min(units.length, 6) };
                    await nextTick();
                    textarea.value?.focus();
                    textarea.value?.select();
                }
            }

            function openCalculator(rosters: CalculatorRosters): void {
                expanded.value = null;
                const combat = readTechnologies?.();
                if (baseImport?.loading.value) return;
                const result = buildCalculatorUrl(rosters, combat?.technologies, language.value, baseImport?.pillage.value);
                if ('unknownNames' in result) {
                    status.value = msg('unknownImport', { names: result.unknownNames });
                    return;
                }

                if (combat) status.value = combat.notice;
                window.open(result.url.href, '_blank', 'noopener,noreferrer');
            }

            return () => [
                h('div', { class: 'actions' }, [
                    menu('copy', 'copyFleet', copyChoices),
                    calculatorChoices.length === 1 ? actionButton(calculatorChoices[0][0], calculatorChoices[0][1], { disabled: baseImport?.loading.value ?? false })
                        : menu('aebits', 'calculator', calculatorChoices),
                ]),
                h('div', { class: 'status', role: 'status' }, t(status.value)),
                baseImport ? h('div', { class: 'status', role: 'status' }, baseImport.loading.value ? t('baseLoading') : t(baseImport.notice.value)) : null,
                h('textarea', {
                    ref: textarea,
                    class: 'fallback',
                    readonly: true,
                    hidden: !fallback.value,
                    rows: fallback.value?.rows ?? 1,
                    value: fallback.value?.text ?? '',
                    'aria-label': t('fleetData'),
                }),
            ];
        },
    }).use(PrimeVue, { unstyled: true, ripple: false }).mount(container);
}
