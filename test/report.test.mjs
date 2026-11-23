import assert from 'node:assert/strict';
import { test } from 'node:test';
import fixture from './fixtures/report.json' with { type: 'json' };
import { analyzeReport, buildReportCalculatorUrl } from '../src/report.ts';

test('完整戰報核對攻方科技，受損防禦保留小數及全滅單位並提示限制', () => {
    const result = analyzeReport(fixture.information + fixture.tables + '\n攻击方征服了此基地');
    assert.deepEqual(result.attacker.levels, { LAS: 23, ARM: 24, PLA: 16, ION: 12, SLD: 15 });
    assert.deepEqual(result.attacker.unresolved, []);
    assert.equal(result.attacker.count, 6);
    assert.deepEqual(result.defender.levels, { CC: 5 });
    assert.equal(result.defender.count, 2);
    for (const code of ['ION', 'ARM', 'SLD', 'PHO']) {
        assert.ok(result.defender.unresolved.includes(code));
        assert.match(result.defender.reasons[code], /防禦受損/);
    }
});

test('僅有兵力表格時將加成標為未知，仍能確認裝甲與護盾', () => {
    const result = analyzeReport(fixture.tables);
    assert.deepEqual(result.attacker.levels, { ARM: 24, SLD: 15 });
    for (const code of ['LAS', 'PLA', 'ION']) assert.match(result.attacker.reasons[code], /缺少指揮中心或指揮官/);
    assert.deepEqual(result.defender.levels, {});
    assert.equal(result.defender.count, 2);
    assert.ok(result.defender.unresolved.includes('DfC'));
});

test('讀取 BBCode 連結、粗體、空白字元、千分位及英文欄位', () => {
    const text = (fixture.information + fixture.tables)
        .replaceAll('攻击舰队', 'Attack Force').replaceAll('防御舰队', 'Defensive Force')
        .replaceAll('舰船', 'Ships').replaceAll('指挥中心', 'Command Centers')
        .replaceAll('指挥官', 'Commander').replace('生产精通', 'Production')
        .replaceAll('玩家', 'Player').replaceAll('初始防御', 'Start Defenses')
        .replaceAll('战斗机\t135878', 'Fighters\t135,878')
        .replaceAll('炮艇\t', '&nbsp;Corvette&#x20;\t').replaceAll('\n', '\r\n')
        .replaceAll('[b]', '[B]').replaceAll('[/b]', '[/B]');
    const result = analyzeReport(text);
    assert.deepEqual(result.attacker.levels, { LAS: 23, ARM: 24, PLA: 16, ION: 12, SLD: 15 });
    assert.deepEqual(result.defender.levels, { CC: 5 });
    assert.equal(result.error, null);
    assert.deepEqual(analyzeReport(text.replaceAll('\t', '  ')).attacker.levels, result.attacker.levels);
});

test('矛盾數值無法回算時保留其他科技，無效與未知單位提供提示', () => {
    const text = (fixture.information + fixture.tables)
        .replace('\t8.6\t', '\t8.4\t')
        .replace('\t7.4\t', '\t未知\t')
        .replace('女神的项链\t', '未知舰船\t');
    const result = analyzeReport(text);
    assert.equal(result.attacker.levels.LAS, undefined);
    assert.equal(result.attacker.levels.ARM, 24);
    assert.match(result.attacker.reasons.LAS, /矛盾/);
    assert.match(result.defender.warnings.join('\n'), /未識別單位.*未知舰船/);
    assert.match(result.defender.warnings.join('\n'), /資料不完整/);
    for (const text of ['', '不是戰報', '<script>alert(1)</script>', '| 战斗报告 | |']) {
        const result = analyzeReport(text);
        assert.equal(result.attacker.count + result.defender.count, 0);
    }
});

test('完整防禦與指揮官加成沿用現有反推公式', () => {
    const result = analyzeReport(`[b]防御舰队[/b]
玩家：defender
初始防御：100%
指挥官：commander (Defense 13)
[b]防御舰队[/b]
[code]
舰船\t初始数量\t战后数量\t攻击\t装甲\t护盾
Planetary Shield\t0.01\t0\t7.23\t4972\t34
[/code]`);
    assert.deepEqual(result.defender.levels, { ION: 12, ARM: 24, SLD: 14, DfC: 13 });
});

test('BBCode 區塊不完整時提供錯誤，未套用的 HTML 保持文字', () => {
    for (const text of ['[code]Ships', '[/code]', '[code][code][/code][/code]']) {
        assert.match(analyzeReport(text).error, /BBCode/);
    }
    assert.equal(analyzeReport(fixture.tables).error, null);
    const result = analyzeReport(fixture.tables.replace('战斗机', '<b>战斗机</b>'));
    assert.match(result.attacker.warnings.join('\n'), /未識別單位/);
});

test('完整 BBCode 匯入雙方初始兵力、小數防禦與已確認科技', () => {
    const report = analyzeReport(fixture.information + fixture.tables);
    assert.deepEqual(report.defender.units.map(({ name, code, quantity }) => ({ name, code, quantity })), [
        { name: '行星护盾', code: 'PS', quantity: 0.01 },
        { name: '女神的项链', code: 'PR', quantity: 0.01 },
    ]);
    const { url } = buildReportCalculatorUrl(report);
    assert.equal(url.origin + url.pathname, 'https://aebits.win/zh/aeBattleCalc');
    assert.equal(url.searchParams.get('aS'), 'FT:135878,CV:6601,DE:4629,IF:14272,BS:469,FC:181');
    assert.equal(url.searchParams.get('dS'), 'PS:0.01,PR:0.01');
    assert.equal(url.searchParams.get('aT').split(',').sort().join(','), 'ARM:24,ION:12,LAS:23,PLA:16,SLD:15');
    assert.equal(url.searchParams.get('dT'), 'CC:5');
    assert.equal(url.searchParams.get('gv'), '5');
});

test('僅有兵力表格時仍可匯入雙方，未知科技欄位省略', () => {
    const report = analyzeReport(fixture.tables);
    const { url } = buildReportCalculatorUrl(report);
    assert.equal(url.searchParams.get('aT'), 'ARM:24,SLD:15');
    assert.equal(url.searchParams.has('dT'), false);
    assert.equal(url.searchParams.get('dS'), 'PS:0.01,PR:0.01');
    assert.ok(report.attacker.unresolved.includes('ION'));
});

test('單方利維坦使用 LE，戰後全滅仍使用初始數量', () => {
    const text = '[b]Defensive Force[/b]\n[code]\nShips\tStart\tEnd\tAttack\tArmour\tShield\nLeviathan\t2\t0\t15750\t15246\t68\n[/code]';
    const { url } = buildReportCalculatorUrl(analyzeReport(text));
    assert.equal(url.searchParams.get('dS'), 'LE:2');
    assert.equal(url.searchParams.has('aS'), false);
    assert.equal(url.searchParams.has('aT'), false);
    assert.equal(url.searchParams.get('dT'), 'ARM:24,SLD:14');
});

test('未知單位、無效數量或不完整兵力列會阻止整份匯入', () => {
    for (const [text, expected] of [
        [fixture.tables.replace('炮艇', '未知舰船'), /未識別單位「未知舰船」/],
        [fixture.tables.replace('炮艇\t6601', '炮艇\t無效'), /炮艇.*初始數量無效/],
        [fixture.tables.replace('炮艇\t6601', '炮艇\t-1'), /炮艇.*初始數量無效/],
        [fixture.tables.replace('炮艇\t6601', '炮艇\t0'), /炮艇.*初始數量無效/],
        [fixture.tables.replace('6601\t6601\t8.6\t11\t0', '6601\t6601\t8.6\t11'), /炮艇.*兵力列不完整/],
        ['[code]Ships', /缺少結束標籤/],
        ['', /沒有可匯入/],
    ]) {
        const result = buildReportCalculatorUrl(analyzeReport(text));
        assert.equal('url' in result, false);
        assert.match(result.error, expected);
    }
});

test('六欄兵力的數值觀測缺失時仍可匯入，省略無法確認的科技', () => {
    const text = '[b]攻击舰队[/b]\n[code]\n舰船\t初始数量\t战后数量\t攻击\t装甲\t护盾\n炮艇\t1\t0\t未知\t未知\t未知\n[/code]';
    const { url } = buildReportCalculatorUrl(analyzeReport(text));
    assert.equal(url.searchParams.get('aS'), 'CV:1');
    assert.equal(url.searchParams.has('aT'), false);
});
