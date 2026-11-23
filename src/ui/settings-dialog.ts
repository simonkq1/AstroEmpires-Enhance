import { defineComponent, h, nextTick, onMounted, ref } from 'vue';
import { msg, t, language, type Locale, type Message } from '../i18n.ts';
import { needsLanguageChoice, saveLanguage } from '../settings.ts';

export const SettingsDialog = defineComponent({
    emits: ['closed'],
    setup(_, { expose, emit }) {
        const dialog = ref<HTMLDialogElement | null>(null);
        const draft = ref<Locale>('en');
        const firstChoice = ref(false);
        const status = ref<Message | null>(null);
        let shown = false;

        async function open(initial = false): Promise<void> {
            firstChoice.value = initial;
            draft.value = language.value;
            status.value = null;
            await nextTick();
            if (!dialog.value?.open) {
                shown = true;
                dialog.value?.showModal();
            }
        }

        function finish(): void {
            if (!shown || dialog.value?.open) return;
            shown = false;
            needsLanguageChoice.value = false;
            emit('closed');
        }

        function close(): void {
            dialog.value?.close();
            finish();
        }

        function save(): void {
            if (saveLanguage(draft.value)) close();
            else status.value = msg('saveFailed');
        }

        expose({ open });
        onMounted(() => { if (needsLanguageChoice.value) void open(true); });

        return () => h('dialog', {
            ref: dialog, class: 'settings-dialog', 'aria-labelledby': 'astro-empires-settings-title',
            lang: language.value,
            onClose: finish,
            onCancel: (event: Event) => { event.preventDefault(); close(); },
        }, [
            h('h2', { id: 'astro-empires-settings-title' }, firstChoice.value ? '选择语言 / Choose language' : t('settings')),
            h('fieldset', [
                h('legend', firstChoice.value ? '显示 / Display' : t('display')),
                h('label', { for: 'astro-empires-settings-language' }, firstChoice.value ? '语言 / Language' : t('language')),
                h('select', {
                    id: 'astro-empires-settings-language', value: draft.value, autofocus: true,
                    onChange: (event: Event) => { draft.value = (event.target as HTMLSelectElement).value as Locale; },
                }, [h('option', { value: 'zh-CN' }, '简体中文'), h('option', { value: 'en' }, 'English')]),
            ]),
            h('p', { role: 'status', hidden: !status.value }, t(status.value)),
            h('div', { class: 'settings-actions' }, [
                h('button', { type: 'button', onClick: save }, firstChoice.value ? '保存 / Save' : t('save')),
                h('button', { type: 'button', onClick: close }, firstChoice.value ? '稍后 / Later' : t('cancel')),
            ]),
        ]);
    },
});
