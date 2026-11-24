import type { Locale } from './i18n.ts';

export type FleetLanguage = 'chinese' | 'english';
export type CalculatorSide = 'aS' | 'dS';

export interface FleetUnit {
    name: string;
    english: string;
    chinese: string;
    quantity: number;
    code: string | undefined;
}

export type CalculatorRosters = Partial<Record<CalculatorSide, readonly FleetUnit[]>>;
export type CalculatorTechnologies = Partial<Record<'aT' | 'dT', Readonly<Record<string, number>>>>;
export interface CalculatorPillage {
    economy: number;
    income?: number;
    defenderBase?: number;
}

// 名稱沿用術語總表，利維坦的 AEBits 代碼為 LE。
const ships = [
    ['Fighters', '战斗机', 'FT'],
    ['Bombers', '轰炸机', 'BO'],
    ['Heavy Bombers', '重型轰炸机', 'HB'],
    ['Ion Bombers', '离子轰炸机', 'IB'],
    ['Corvette', '炮艇', 'CV'],
    ['Recycler', '回收船', 'RC'],
    ['Destroyer', '驱逐舰', 'DE'],
    ['Frigate', '导弹驱逐舰', 'FR'],
    ['Ion Frigate', '离子驱逐舰', 'IF'],
    ['Scout Ship', '侦察机', 'SS'],
    ['Outpost Ship', '殖民船', 'OS'],
    ['Cruiser', '巡洋舰', 'CR'],
    ['Carrier', '护航母舰', 'CA'],
    ['Heavy Cruiser', '重型巡洋舰', 'HC'],
    ['Battleship', '战列舰', 'BS'],
    ['Fleet Carrier', '舰队级母舰', 'FC'],
    ['Dreadnought', '无畏舰', 'DN'],
    ['Titan', '泰坦巨舰', 'TI'],
    ['Leviathan', '利维坦旗舰', 'LE'],
    ['Death Star', '死星', 'DS'],
] as const;

// AEBits 的防禦代碼有些與術語總表的縮寫不同。
const shipsAndDefenses = [
    ...ships,
    ['Barracks', '基础炮塔', 'BA'],
    ['Laser Turrets', '激光炮塔', 'LT'],
    ['Missile Turrets', '导弹炮塔', 'MT'],
    ['Plasma Turrets', '电浆炮塔', 'PT'],
    ['Ion Turrets', '离子炮塔', 'IT'],
    ['Photon Turrets', '光子炮塔', 'OT'],
    ['Disruptor Turrets', '裂解炮塔', 'DT'],
    ['Deflection Shields', '偏折护盾', 'FS'],
    ['Planetary Shield', '行星护盾', 'PS'],
    ['Planetary Ring', '女神的项链', 'PR'],
] as const;

export function parseFleetUnit(nameText: string, quantityText: string, includeDefenses = false): FleetUnit | undefined {
    const name = nameText.trim();
    const count = quantityText.trim();
    if (!name || !/^(?:\d+|\d{1,3}(?:,\d{3})+)(?:\.\d{1,2})?$/.test(count)) return;

    const normalizedCount = count.replaceAll(',', '').replace(/^0+(?=\d)/, '')
        .replace(/(\.\d*?)0+$/, '$1').replace(/\.$/, '');
    const quantity = Number(normalizedCount);
    if (!Number.isFinite(quantity) || quantity > Number.MAX_SAFE_INTEGER || quantity <= 0 || String(quantity) !== normalizedCount) return;

    return { ...identifyFleetUnit(name, includeDefenses), quantity };
}

export function identifyFleetUnit(nameText: string, includeDefenses = true): Omit<FleetUnit, 'quantity'> {
    const name = nameText.trim();
    const normalizedName = name.toLowerCase();
    const catalog = includeDefenses ? shipsAndDefenses : ships;
    const [english = name, chinese = name, code] = catalog.find(([en, zh]) =>
        en.toLowerCase() === normalizedName || zh === name) ?? [];
    return { name, english, chinese, code };
}

export function formatFleetTsv(units: readonly FleetUnit[], language: FleetLanguage): string {
    return units.map(unit => `${unit[language]}\t${unit.quantity}`).join('\n');
}

export function buildCalculatorUrl(rosters: CalculatorRosters, technologies?: CalculatorTechnologies, locale: Locale = 'zh-CN', pillage?: CalculatorPillage): { url: URL } | { unknownNames: string[] } {
    const unknownNames = Object.values(rosters).flatMap(units => units.filter(unit => !unit.code).map(unit => unit.name));
    if (unknownNames.length) return { unknownNames };

    const url = new URL(`https://aebits.win/${locale === 'en' ? 'en' : 'zh'}/aeBattleCalc`);
    for (const side of ['aS', 'dS'] as const) {
        const units = rosters[side];
        if (units?.length) url.searchParams.set(side, units.map(unit => `${unit.code}:${unit.quantity}`).join(','));
    }
    for (const side of ['aT', 'dT'] as const) {
        const fields = Object.entries(technologies?.[side] ?? {});
        if (fields.length) url.searchParams.set(side, fields.map(([field, level]) => `${field}:${level}`).join(','));
    }
    if (pillage) {
        const values = [`economy:${pillage.economy}`];
        if (pillage.income !== undefined) values.push(`income:${pillage.income}`);
        if (pillage.defenderBase !== undefined) values.push(`defenderBase:${pillage.defenderBase}`);
        url.searchParams.set('p', values.join(','));
    }
    url.searchParams.set('gv', '5');
    return { url };
}
