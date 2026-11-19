import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import { buildCalculatorUrl, formatFleetTsv, parseFleetUnit } from '../src/fleet.ts';

test('艦船數量須為正整數，可帶千分位逗號', () => {
    assert.deepEqual(parseFleetUnit(' fighters ', ' 22,120 '), {
        name: 'fighters', english: 'Fighters', chinese: '战斗机', quantity: 22120, code: 'FT',
    });
    for (const count of ['', '0', '-5', '1.5', '1,2', '1e3', '9007199254740992']) {
        assert.equal(parseFleetUnit('Fighters', count), undefined, count);
    }
    assert.equal(parseFleetUnit(' ', '500'), undefined);
});

test('雙語 TSV 保留數量、順序與兩欄格式', () => {
    const ships = [parseFleetUnit('战斗机', '500'), parseFleetUnit('Bombers', '768'), parseFleetUnit('护航母舰', '7')];
    assert.equal(formatFleetTsv(ships, 'chinese'), '战斗机\t500\n轰炸机\t768\n护航母舰\t7');
    assert.equal(formatFleetTsv(ships, 'english'), 'Fighters\t500\nBombers\t768\nCarrier\t7');
});

test('計算器只帶入選定的一方與版本 5', () => {
    const ships = [parseFleetUnit('Fighters', '500'), parseFleetUnit('利维坦旗舰', '2')];
    for (const side of ['aS', 'dS']) {
        const { url } = buildCalculatorUrl({ [side]: ships });
        assert.equal(url.origin + url.pathname, 'https://aebits.win/zh/aeBattleCalc');
        assert.deepEqual([...url.searchParams], [[side, 'FT:500,LE:2'], ['gv', '5']]);
    }
});

test('未知艦種可原樣複製，匯入時回報名稱', () => {
    const ships = [parseFleetUnit('Fighters', '500'), parseFleetUnit('未知艦種', '7')];
    assert.equal(formatFleetTsv(ships, 'chinese'), '战斗机\t500\n未知艦種\t7');
    assert.equal(formatFleetTsv(ships, 'english'), 'Fighters\t500\n未知艦種\t7');
    assert.deepEqual(buildCalculatorUrl({ dS: ships, aS: [parseFleetUnit('Corvette', '1')] }), { unknownNames: ['未知艦種'] });
});

test('二十種艦船的名稱與術語總表一致', () => {
    const glossary = readFileSync(new URL('../docs/borealis-glossary.md', import.meta.url), 'utf8');
    const unitSection = glossary.split('## 單位\n')[1].split('## 科技\n')[0];
    const rows = [...unitSection.matchAll(/^\| ([^|]+) \| ([^|]+) \| ([A-Z]+) \|$/gm)];
    assert.equal(rows.length, 20);
    for (const [, english, chinese, abbreviation] of rows) {
        const code = english === 'Leviathan' ? 'LE' : abbreviation;
        for (const name of [english, chinese]) {
            assert.deepEqual(parseFleetUnit(name, '1'), { name, english, chinese, quantity: 1, code });
        }
    }
});

test('戰鬥頁同時匯入雙方，守方可包含基地防禦', () => {
    const attacker = [parseFleetUnit('炮艇', '1')];
    const defender = [
        parseFleetUnit('Fighters', '26400', true),
        parseFleetUnit('裂解炮塔', '15', true),
        parseFleetUnit('Planetary Shield', '10', true),
        parseFleetUnit('女神的项链', '10', true),
    ];
    const { url } = buildCalculatorUrl({ aS: attacker, dS: defender });
    assert.deepEqual([...url.searchParams], [['aS', 'CV:1'], ['dS', 'FT:26400,DT:15,PS:10,PR:10'], ['gv', '5']]);
    assert.equal(formatFleetTsv(defender, 'chinese'), '战斗机\t26400\n裂解炮塔\t15\n行星护盾\t10\n女神的项链\t10');
});

test('十種基地防禦辨識兩種語言與 AEBits 代碼', () => {
    const glossary = readFileSync(new URL('../docs/borealis-glossary.md', import.meta.url), 'utf8');
    const defenseSection = glossary.split('## 防禦\n')[1].split('## 單位\n')[0];
    const rows = [...defenseSection.matchAll(/^\| ([^|]+) \| ([^|]+) \| ([A-Z]+) \|$/gm)];
    const externalCodes = { BKS: 'BA', PLT: 'PT', PHT: 'OT', DFS: 'FS' };
    assert.equal(rows.length, 10);
    for (const [, english, chinese, abbreviation] of rows) {
        const code = externalCodes[abbreviation] ?? abbreviation;
        for (const name of [english, chinese]) {
            assert.deepEqual(parseFleetUnit(name, '5', true), { name, english, chinese, quantity: 5, code });
        }
    }
    assert.equal(parseFleetUnit('Barracks', '5').code, undefined);
});
