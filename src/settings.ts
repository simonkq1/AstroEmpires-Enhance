import { ref } from 'vue';
import { language, type Locale } from './i18n.ts';

export const settingsKey = 'astro-empires-settings';
export interface Settings { language: Locale }
export const needsLanguageChoice = ref(false);

export function readSettings(storage: Pick<Storage, 'getItem'>): Settings | null {
    try {
        const value: unknown = JSON.parse(storage.getItem(settingsKey) ?? 'null');
        if (value && typeof value === 'object' && 'language' in value
            && (value.language === 'zh-CN' || value.language === 'en')) return { language: value.language };
    } catch { /* 首次選擇流程也處理無法讀取的儲存空間。 */ }
    return null;
}

export function initializeSettings(): void {
    let settings: Settings | null = null;
    try { settings = readSettings(localStorage); } catch { /* 保留當頁英文預設。 */ }
    language.value = settings?.language ?? 'en';
    needsLanguageChoice.value = settings === null;
}

export function saveLanguage(locale: Locale): boolean {
    language.value = locale;
    needsLanguageChoice.value = false;
    try {
        localStorage.setItem(settingsKey, JSON.stringify({ language: locale } satisfies Settings));
        return true;
    } catch {
        return false;
    }
}
