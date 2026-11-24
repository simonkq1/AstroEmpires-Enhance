import assert from 'node:assert/strict';
import { test } from 'node:test';
import { inferCombatTechnology, readCommander } from '../src/combat.ts';
import { buildCalculatorUrl, parseFleetUnit } from '../src/fleet.ts';

const noBonuses = { CC: 0, TaC: 0, DfC: 0, fullDefenses: false };

test('六種指揮官的中英文名稱僅防禦及戰術提供戰鬥加成', () => {
    for (const [chinese, english, expected] of [
        ['建筑精通', 'Construction', { DfC: 0, TaC: 0 }],
        ['科研精通', 'Research', { DfC: 0, TaC: 0 }],
        ['生产精通', 'Production', { DfC: 0, TaC: 0 }],
        ['防御精通', 'Defense', { DfC: 14, TaC: 0 }],
        ['战术精通', 'Tactical', { DfC: 0, TaC: 14 }],
        ['后勤精通', 'Logistics', { DfC: 0, TaC: 0 }],
    ]) {
        for (const name of [chinese, english]) assert.deepEqual(readCommander(`Commander (${name} 14)`), expected, name);
    }
    for (const alias of ['建造精通', '研究精通']) {
        assert.deepEqual(readCommander(`Commander (${alias} 14)`), { DfC: 0, TaC: 0 });
    }
    for (const value of ['Commander (未知精通 14)', 'Commander (Defense -1)', 'Commander (Tactical 1.5)',
        'Commander (Construction ?)', 'Commander (Research)', 'Commander (Defense 99999999999999999)']) {
        assert.deepEqual(readCommander(value), { DfC: null, TaC: null }, value);
    }
});

test('半分捨入邊界接受上下顯示值，超出範圍與矛盾觀測仍不確認', () => {
    const modifiers = { ...noBonuses, CC: 3 };
    for (const attack of [4.94, 4.95]) {
        const result = inferCombatTechnology([{ code: 'FT', attack }, { code: 'CV', attack: 9.89 }], modifiers);
        assert.equal(result.levels.LAS, 23);
    }
    for (const attack of [4.93, 4.96, 4.83]) {
        const result = inferCombatTechnology([{ code: 'FT', attack }, { code: 'CV', attack: 9.89 }], modifiers);
        assert.equal(result.levels.LAS, undefined);
        assert.equal(result.reasons.LAS.key, 'conflictingValues');
    }
});

test('指揮中心和战术精通相加，死星加成優先於利維坦', () => {
    const observations = [
        { code: 'BS', attack: 444.93, armour: 309.76, shield: 20.4 },
        { code: 'LE' },
        { code: 'DS' },
    ];
    const result = inferCombatTechnology(observations, { ...noBonuses, CC: 9, TaC: 13 });
    assert.deepEqual(result.levels, { ION: 12, ARM: 24, SLD: 14, CC: 9, TaC: 13 });
    assert.deepEqual(result.unresolved, ['PHO', 'DIS']);
});

test('只有利維坦時，艦船攻擊和裝甲按 5% 加成反推', () => {
    const result = inferCombatTechnology([{ code: 'CV', attack: 9.03, armour: 11.81 }, { code: 'LE' }], noBonuses);
    assert.deepEqual(result.levels, { LAS: 23, ARM: 25 });
    assert.deepEqual(result.unresolved, ['SLD', 'PHO']);
});

test('防御精通只增加設施攻擊和裝甲，核對顯示值時允許四捨五入', () => {
    const observations = [
        { code: 'PS', attack: 7.23, armour: 4972, shield: 34 },
        { code: 'IB', attack: 27.84, armour: 11, shield: 1.7 },
    ];
    const result = inferCombatTechnology(observations, { ...noBonuses, CC: 9, DfC: 13, fullDefenses: true });
    assert.deepEqual(result.levels, { ION: 12, ARM: 24, SLD: 14, CC: 9, DfC: 13 });
    assert.deepEqual(result.unresolved, []);
});

test('防禦受損或狀態不明時，從艦船資料反推科技', () => {
    const observations = [
        { code: 'PS', attack: 3.62, armour: 2486, shield: 17 },
        { code: 'FT', attack: 6.09, armour: 4.4, shield: 0 },
    ];
    const result = inferCombatTechnology(observations, { ...noBonuses, CC: 9, DfC: 13 });
    assert.deepEqual(result.levels, { LAS: 22, ARM: 24, CC: 9, DfC: 13 });
    assert.deepEqual(result.unresolved, ['ION', 'SLD']);
});

test('同一科技出現矛盾或無法回算時，只保留其他可確認的等級', () => {
    const observations = [
        { code: 'FT', attack: 4.2, armour: 4.4, shield: 0 },
        { code: 'RC', attack: 4.3, armour: 4.4, shield: 0 },
        { code: 'CV', attack: 8.4, armour: 11, shield: 0 },
        { code: 'BO', attack: 10.01, armour: 4.4, shield: 0 },
    ];
    const result = inferCombatTechnology(observations, noBonuses);
    assert.deepEqual(result.levels, { ARM: 24 });
    assert.deepEqual(result.unresolved, ['LAS', 'SLD', 'MIS']);
});

test('缺少攻擊加成時仍可匯出裝甲與已核對的零級護盾', () => {
    const observations = [{ code: 'IB', attack: 27.84, armour: 11, shield: 1 }];
    const result = inferCombatTechnology(observations, { ...noBonuses, CC: null });
    assert.deepEqual(result.levels, { ARM: 24, SLD: 0 });
    assert.deepEqual(result.unresolved, ['ION', 'CC']);

    const { url } = buildCalculatorUrl({
        aS: [parseFleetUnit('Corvette', '1')],
        dS: [parseFleetUnit('Ion Bombers', '3')],
    }, { aT: {}, dT: result.levels });
    assert.deepEqual([...url.searchParams], [['aS', 'CV:1'], ['dS', 'IB:3'], ['dT', 'ARM:24,SLD:0'], ['gv', '5']]);
});
