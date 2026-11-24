import { ref, type Ref } from 'vue';
import { readBaseDetails, readDefenderBaseId } from './base.ts';
import type { CalculatorPillage } from './fleet.ts';
import { msg, type Message } from './i18n.ts';

export interface BaseImportState {
    loading: Ref<boolean>;
    pillage: Ref<CalculatorPillage | undefined>;
    notice: Ref<Message | null>;
}

export function loadCombatBase(report: HTMLTableElement | null, origin: string): BaseImportState {
    const state: BaseImportState = { loading: ref(false), pillage: ref(), notice: ref(null) };
    const id = readDefenderBaseId(report);
    if (!id) {
        state.notice.value = msg('baseIdUnavailable');
        return state;
    }
    const url = new URL('/base.aspx', origin);
    url.searchParams.set('base', id);
    state.loading.value = true;
    void (async () => {
        try {
            const response = await window.fetch(url.href, { credentials: 'same-origin', signal: AbortSignal.timeout(5000) });
            const finalUrl = new URL(response.url);
            if (!response.ok || finalUrl.origin !== url.origin || finalUrl.pathname !== '/base.aspx' || finalUrl.searchParams.get('base') !== id) throw new Error('Invalid base response');
            const base = readBaseDetails(new DOMParser().parseFromString(await response.text(), 'text/html'));
            if (!base) throw new Error('Missing base data');
            const count = base.npcKind === 'drekons' ? 8 : base.count;
            state.pillage.value = { economy: base.economy, income: base.income, ...(count === null ? {} : { defenderBase: count }) };
            state.notice.value = base.npcKind === 'drekons' ? msg('baseDrekonsImport')
                : base.reason ? msg('baseManualCount', { reason: base.reason }) : null;
        } catch {
            state.notice.value = msg('baseFetchFailed');
        } finally {
            state.loading.value = false;
        }
    })();
    return state;
}
