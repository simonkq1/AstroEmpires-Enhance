import { msg, type Message } from './i18n.ts';

export interface BaseObservation {
    economy: number;
    income: number;
    pillage: number | null;
    npc: boolean;
    occupied: boolean;
    hoursSincePillage: number | null;
    ownerLevelPercent: number | null;
}

export function inferBaseCount(base: BaseObservation): { count: number | null; reason: Message | null } {
    const unknown = (key: Parameters<typeof msg>[0]) => ({ count: null, reason: msg(key) });
    if (base.npc) return unknown('baseNpc');
    if (base.occupied || base.hoursSincePillage !== null && base.hoursSincePillage < 100) return unknown('baseRecentlyPillaged');
    if (base.pillage === null) return unknown('baseMissingPillage');
    const minimumIncome = Math.ceil(base.economy * 7 / 10);
    if (base.economy <= 0 || base.income < minimumIncome || base.income > base.economy) return unknown('baseCountMismatch');
    // v5 額外獎勵與收入損失有關；等級比例接近 65% 的顯示捨入界線不提供依據。
    const bonus = 5 * (base.income - minimumIncome) ** 2;
    if (bonus && (base.ownerLevelPercent === null || base.ownerLevelPercent < 66)) return unknown('baseLevelUnknown');
    const count = (base.pillage - bonus) / (2 * base.economy);
    if (!Number.isSafeInteger(bonus) || !Number.isSafeInteger(count) || count < 1) return unknown('baseCountMismatch');
    return { count, reason: null };
}

function integer(value: string): number | null {
    if (!/^(?:\d+|\d{1,3}(?:,\d{3})+)$/.test(value)) return null;
    const result = Number(value.replaceAll(',', ''));
    return Number.isSafeInteger(result) ? result : null;
}

export function findPillageElement(doc: Document): HTMLElement | null {
    return [...doc.querySelectorAll<HTMLElement>('center')].find(element =>
        /^(?:掠夺价值\s*[\d,]+\s*信用点[。.]?|Pillage value\s+[\d,]+\s+credits\.?)$/i.test(element.textContent.trim())) ?? null;
}

export function readBaseDetails(doc: Document) {
    const credits = doc.querySelector('.mini-infobox.infoicon_credits')?.textContent.replace(/\s/g, '').split('/');
    if (!credits || credits.length > 2) return null;
    const income = integer(credits[0]);
    const economy = integer(credits[1] ?? credits[0]);
    if (economy === null || economy <= 0 || income === null) return null;
    const rows = [...doc.querySelectorAll('#base_processing-capacities tr')];
    const owner = rows.find(row => /^(?:所有者|Owner)\s*[:：]/i.test(row.textContent.trim()))?.querySelector('a');
    if (!owner) return null;
    const ownerName = owner.textContent.trim().toLowerCase();
    const npcKind = /^(?:不明生物|drekons)$/.test(ownerName) ? 'drekons'
        : /^(?:联合殖民地|united colonies)$/.test(ownerName) ? 'unitedColonies' : null;
    const npc = npcKind !== null || /(?:游戏\s*NPC|Game\s+NPC)/i.test(owner.title);
    const occupied = rows.some(row => /^(?:占领者|Occupier)\s*[:：]/i.test(row.textContent.trim()) && row.querySelector('a'));
    const pillageText = findPillageElement(doc)?.textContent ?? '';
    const amount = pillageText.match(/[\d,]+/);
    const hours = [...doc.querySelectorAll('center')].map(element => element.textContent.trim())
        .map(text => text.match(/^(?:该基地在\s*(\d+)\s*小时前被掠夺[。.]?|This base was pillaged\s+(\d+)\s+hour\(s\) ago\.?)$/i)).find(Boolean);
    const levelPercent = owner.title.match(/\((\d+)% of your level\)/i);
    const base: BaseObservation = {
        economy, income, npc, occupied,
        pillage: amount ? integer(amount[0]) : null,
        hoursSincePillage: hours ? integer(hours[1] ?? hours[2]) : null,
        ownerLevelPercent: levelPercent ? Number(levelPercent[1]) : null,
    };
    return { ...base, npcKind, ...inferBaseCount(base) };
}

export function readDefenderBaseId(report: HTMLTableElement | null): string | null {
    let defender = false;
    for (const row of report?.rows ?? []) {
        const label = row.cells[0]?.textContent.trim().toLowerCase();
        if (row.classList.contains('battle-report_subtitle')) defender = label === '防御舰队' || label === 'defensive force';
        if (!defender || label !== '基地' && label !== 'base') continue;
        const id = row.cells[1]?.textContent.trim() ?? '';
        return /^[1-9]\d*$/.test(id) ? id : null;
    }
    return null;
}
