import { defineComponent, h, nextTick, ref } from 'vue';
import { language, t } from '../i18n.ts';

const sections = [
    { title: 'copyReport', text: ['helpReportPages', 'helpReportCopy'] },
    { title: 'analyzeBbcode', text: ['helpAnalyzePaste', 'helpAnalyzeResults'] },
    { title: 'importCalculator', text: ['helpImport', 'helpImportErrors'] },
    { title: 'helpFleetCombat', text: ['helpFleet', 'helpCombat'] },
    { title: 'estimatedArrival', text: ['helpArrival', 'helpClocks'] },
    { title: 'settings', text: ['helpLanguageFirst', 'helpLanguageSettings'] },
] as const;

export const HelpDialog = defineComponent({
    emits: ['closed'],
    setup(_, { expose, emit }) {
        const dialog = ref<HTMLDialogElement | null>(null);
        const title = ref<HTMLHeadingElement | null>(null);
        let shown = false;

        async function open(): Promise<void> {
            await nextTick();
            if (!dialog.value?.open) {
                shown = true;
                dialog.value?.showModal();
                title.value?.focus();
            }
        }

        function finish(): void {
            if (!shown || dialog.value?.open) return;
            shown = false;
            emit('closed');
        }

        function close(): void {
            dialog.value?.close();
            finish();
        }

        expose({ open });

        return () => h('dialog', {
            ref: dialog, id: 'astro-empires-help', class: 'help-dialog', lang: language.value,
            'aria-labelledby': 'astro-empires-help-title', onClose: finish,
            onCancel: (event: Event) => { event.preventDefault(); close(); },
        }, [
            h('h2', { ref: title, id: 'astro-empires-help-title', tabindex: -1 }, t('helpTitle')),
            h('p', t('helpIntro')),
            ...sections.map(section => h('section', [
                h('h3', t(section.title)),
                ...section.text.map(key => h('p', t(key))),
            ])),
            h('div', { class: 'settings-actions' }, [h('button', { type: 'button', onClick: close }, t('close'))]),
        ]);
    },
});
