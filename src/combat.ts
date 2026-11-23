import type { CalculatorTechnologies, FleetUnit } from './fleet.ts';
import { msg, type Message } from './i18n.ts';

export const fieldLabels = {
    ARM: msg('ARM'), LAS: msg('LAS'), MIS: msg('MIS'), PLA: msg('PLA'), SLD: msg('SLD'),
    ION: msg('ION'), PHO: msg('PHO'), DIS: msg('DIS'), CC: msg('CC'), DfC: msg('DfC'), TaC: msg('TaC'),
} as const;

type Modifier = 'CC' | 'DfC' | 'TaC';
type Technology = Exclude<keyof typeof fieldLabels, Modifier>;
type Weapon = Exclude<Technology, 'ARM' | 'SLD'>;
type BaseStats = readonly [weapon: Weapon, attack: number, armour: number, shield: number];

// Borealis v5 官方單位表的基礎數值，使用 AEBits 代碼對照。
const shipStats: Readonly<Partial<Record<string, BaseStats>>> = {
    FT: ['LAS', 2, 2, 0],
    BO: ['MIS', 5, 2, 0],
    HB: ['PLA', 10, 5, 0],
    IB: ['ION', 12, 5, 1],
    CV: ['LAS', 4, 5, 0],
    RC: ['LAS', 2, 2, 0],
    DE: ['PLA', 10, 8, 0],
    FR: ['MIS', 12, 12, 0],
    IF: ['ION', 14, 12, 1],
    SS: ['LAS', 1, 2, 0],
    OS: ['LAS', 2, 4, 0],
    CR: ['PLA', 24, 24, 2],
    CA: ['MIS', 12, 24, 2],
    HC: ['PLA', 48, 48, 4],
    BS: ['ION', 160, 128, 12],
    FC: ['ION', 64, 96, 10],
    DN: ['PHO', 756, 512, 20],
    TI: ['DIS', 3500, 2048, 30],
    LE: ['PHO', 10000, 6600, 40],
    DS: ['DIS', 28000, 15000, 60],
};

const defenseStats: Readonly<Partial<Record<string, BaseStats>>> = {
    BA: ['LAS', 4, 4, 0],
    LT: ['LAS', 8, 8, 0],
    MT: ['MIS', 16, 16, 0],
    PT: ['PLA', 24, 24, 0],
    IT: ['ION', 40, 40, 2],
    OT: ['PHO', 80, 80, 6],
    DT: ['DIS', 320, 320, 8],
    FS: ['ION', 2, 640, 16],
    PS: ['ION', 4, 2000, 20],
    PR: ['PHO', 1600, 1000, 12],
};

export interface FleetUnitRow {
    unit: FleetUnit;
    row: HTMLTableRowElement;
}

export interface CombatObservation {
    code: string | undefined;
    attack?: number;
    armour?: number;
    shield?: number;
}

export interface CombatModifiers {
    CC: number | null;
    TaC: number | null;
    DfC: number | null;
    fullDefenses: boolean;
}

export function inferCombatTechnology(observations: readonly CombatObservation[], modifiers: CombatModifiers) {
    const levels: Record<string, number> = {};
    const candidates = new Map<Technology, number | null>();
    const relevant = new Set<keyof typeof fieldLabels>();
    const reasons: Record<string, Message> = {};
    const codes = new Set(observations.map(({ code }) => code));
    const capitalPercent = codes.has('DS') ? 110 : codes.has('LE') ? 105 : 100;
    const fleetAttack = modifiers.CC === null || modifiers.TaC === null
        ? null : capitalPercent * (100 + 5 * modifiers.CC + modifiers.TaC);
    const defensePower = modifiers.DfC === null ? null : 100 * (100 + modifiers.DfC);

    for (const { code, attack, armour, shield } of observations) {
        if (!code) continue;
        const defense = defenseStats[code];
        const base = defense ?? shipStats[code];
        if (!base) continue;

        const [weapon, baseAttack, baseArmour, baseShield] = base;
        relevant.add(weapon);
        relevant.add('ARM');
        relevant.add('SLD');
        if (defense) {
            relevant.add('DfC');
            if (!modifiers.fullDefenses) {
                for (const key of [weapon, 'ARM', 'SLD']) reasons[key] = msg('damagedDefense');
                continue;
            }
        } else {
            relevant.add('CC');
            relevant.add('TaC');
        }

        observe(weapon, attack, baseAttack, defense ? defensePower : fleetAttack);
        observe('ARM', armour, baseArmour, defense ? defensePower : 100 * capitalPercent);
        observe('SLD', shield, baseShield, 10_000);
    }

    for (const [key, level] of candidates) {
        if (level !== null) levels[key] = level;
    }
    for (const key of ['CC', 'DfC', 'TaC'] as const) {
        const level = modifiers[key];
        if (level !== null && level > 0) levels[key] = level;
    }

    const unresolved = [...relevant].filter(key =>
        key === 'CC' || key === 'DfC' || key === 'TaC' ? modifiers[key] === null : levels[key] === undefined);
    for (const key of unresolved) {
        reasons[key] ??= key === 'CC' || key === 'DfC' || key === 'TaC'
            ? msg('missingModifier') : msg('missingObservation');
    }
    return { levels, unresolved, reasons };

    function observe(key: Technology, displayed: number | undefined, base: number, bonus: number | null): void {
        if (bonus === null) reasons[key] = msg('missingAttackBonus');
        if (displayed === undefined || !base || bonus === null) return;

        // 加成以兩個整數百分比的乘積表示，避免小數乘法影響四捨五入。
        const scaledBase = base * bonus;
        const level = Math.round((displayed * 10_000 / scaledBase - 1) * 20);
        const scaledResult = scaledBase * (100 + 5 * level);
        const matches = level >= 0 && Number.isSafeInteger(scaledResult) &&
            Math.round(scaledResult / 10_000) === Math.round(displayed * 100);
        candidates.set(key, matches && (!candidates.has(key) || candidates.get(key) === level) ? level : null);
        if (candidates.get(key) === null) reasons[key] = msg('conflictingValues');
    }
}

export function readCombatTechnologies(
    report: HTMLTableElement | null,
    attacker: readonly FleetUnitRow[],
    defender: readonly FleetUnitRow[],
): { technologies: CalculatorTechnologies; notice: Message | null } {
    const modifiers = readModifiers(report);
    const results = {
        aT: inferCombatTechnology(attacker.map(readObservation), modifiers.aT),
        dT: inferCombatTechnology(defender.map(readObservation), modifiers.dT),
    };
    const pending: Message[] = [];
    for (const [key, side] of [['aT', 'attacker'], ['dT', 'defender']] as const) {
        const labels = results[key].unresolved.map(field => fieldLabels[field]);
        if (labels.length) pending.push(msg('sideFields', { side: msg(side), fields: labels }));
    }
    return {
        technologies: { aT: results.aT.levels, dT: results.dT.levels },
        notice: pending.length ? msg('manualConfirm', { sides: pending }) : null,
    };
}

function readObservation({ unit, row }: FleetUnitRow): CombatObservation {
    return {
        code: unit.code,
        attack: readNumber(row.cells[3]?.textContent),
        armour: readNumber(row.cells[4]?.textContent),
        shield: readNumber(row.cells[5]?.textContent),
    };
}

function readModifiers(report: HTMLTableElement | null): Record<'aT' | 'dT', CombatModifiers> {
    const unknown: CombatModifiers = { CC: null, TaC: null, DfC: null, fullDefenses: false };
    const sides = { aT: { ...unknown }, dT: { ...unknown } };
    let side: CombatModifiers | undefined;

    for (const row of report?.rows ?? []) {
        const [keyCell, valueCell] = row.cells;
        const label = keyCell?.textContent.trim().toLowerCase();
        if (row.classList.contains('battle-report_subtitle')) {
            side = label === 'attack force' || label === '攻击舰队' ? sides.aT
                : label === 'defensive force' || label === '防御舰队' ? sides.dT : undefined;
            // 已識別的陣營區塊只會列出存在的加成。
            if (side) Object.assign(side, { CC: 0, TaC: 0, DfC: 0 });
        }
        if (!side || !valueCell) continue;

        const value = valueCell.textContent.trim();
        switch (label) {
            case 'command centers':
            case '指挥中心':
                side.CC = readLevel(value);
                break;
            case 'commander':
            case '指挥官':
                Object.assign(side, readCommander(value));
                break;
            case 'start defenses':
            case '初始防御':
                side.fullDefenses = readNumber(value.replace(/[%％]$/, '')) === 100;
                break;
        }
    }
    return sides;
}

export function readCommander(value: string): Pick<CombatModifiers, 'DfC' | 'TaC'> {
    if (/^(?:[-–—]|none|无|無)?$/i.test(value)) return { DfC: 0, TaC: 0 };

    const match = value.match(/(?:^|[(（]\s*)([^()（）]+?)\s*(\d+)\s*[级級]?\s*[)）]?$/);
    const level = match ? readLevel(match[2]) : null;
    if (level !== null && match) {
        const kind = match[1].trim().toLowerCase();
        if (/^(?:defense|防御精通|防禦精通)$/.test(kind)) return { DfC: level, TaC: 0 };
        if (/^(?:tactical|战术精通|戰術精通)$/.test(kind)) return { DfC: 0, TaC: level };
        if (/^(?:construction|research|production|logistics|建造精通|研究精通|生产精通|后勤精通)$/.test(kind)) {
            return { DfC: 0, TaC: 0 };
        }
    }
    return { DfC: null, TaC: null };
}

export function readLevel(value: string): number | null {
    const level = readNumber(value);
    return level !== undefined && Number.isSafeInteger(level) ? level : null;
}

export function readNumber(text: string | undefined): number | undefined {
    const value = text?.trim() ?? '';
    if (!/^(?:\d+|\d{1,3}(?:,\d{3})+)(?:\.\d{1,2})?$/.test(value)) return;
    const number = Number(value.replaceAll(',', ''));
    return Number.isFinite(number) ? number : undefined;
}
