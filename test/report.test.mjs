import assert from 'node:assert/strict';
import { test } from 'node:test';
import fixture from './fixtures/report.json' with { type: 'json' };
import { analyzeReport, buildReportCalculatorUrl } from '../src/report.ts';
import { t } from '../src/i18n.ts';

test('完整戰報核對攻方科技，受損防禦保留小數及全滅單位並提示限制', () => {
    const result = analyzeReport(fixture.information + fixture.tables + '\n攻击方征服了此基地');
    assert.deepEqual(result.attacker.levels, { LAS: 23, ARM: 24, PLA: 16, ION: 12, SLD: 15 });
    assert.deepEqual(result.attacker.unresolved, []);
    assert.equal(result.attacker.count, 6);
    assert.deepEqual(result.defender.levels, { CC: 5 });
    assert.equal(result.defender.count, 2);
    for (const code of ['ION', 'ARM', 'SLD', 'PHO']) {
        assert.ok(result.defender.unresolved.includes(code));
        assert.equal(result.defender.reasons[code].key, 'damagedDefense');
    }
});

test('僅有兵力表格時將加成標為未知，仍能確認裝甲與護盾', () => {
    const result = analyzeReport(fixture.tables);
    assert.deepEqual(result.attacker.levels, { ARM: 24, SLD: 15 });
    for (const code of ['LAS', 'PLA', 'ION']) assert.equal(result.attacker.reasons[code].key, 'missingAttackBonus');
    assert.deepEqual(result.defender.levels, {});
    assert.equal(result.defender.count, 2);
    assert.ok(result.defender.unresolved.includes('DfC'));
});

test('讀取 BBCode 連結、粗體、空白字元、千分位及英文欄位', () => {
    const text = (fixture.information + fixture.tables)
        .replaceAll('攻击舰队', 'Attack Force').replaceAll('防御舰队', 'Defensive Force')
        .replaceAll('舰船', 'Unit').replaceAll('指挥中心', 'Command Centers')
        .replaceAll('指挥官', 'Commander').replace('生产精通', 'Production')
        .replaceAll('玩家', 'Player').replaceAll('初始防御', 'Start Defenses')
        .replaceAll('战斗机\t135878', 'Fighters\t135,878')
        .replaceAll('炮艇\t', '&nbsp;Corvette&#x20;\t')
        .replaceAll('离子驱逐舰\t', 'Ion Frigate\t').replaceAll('驱逐舰\t', 'Destroyer\t')
        .replaceAll('战列舰\t', 'Battleship\t').replaceAll('舰队级母舰\t', 'Fleet Carrier\t')
        .replaceAll('行星护盾\t', 'Planetary Shield\t').replaceAll('女神的项链\t', 'Planetary Ring\t')
        .replaceAll('初始数量', 'Start Quant.').replaceAll('战后数量', 'End Quant.')
        .replaceAll('攻击\t', 'Attack\t').replaceAll('装甲\t', 'Armour\t').replaceAll('护盾\n', 'Shield\n')
        .replaceAll('\n', '\r\n')
        .replaceAll('[b]', '[B]').replaceAll('[/b]', '[/B]');
    const result = analyzeReport(text);
    assert.deepEqual(result.attacker.levels, { LAS: 23, ARM: 24, PLA: 16, ION: 12, SLD: 15 });
    assert.deepEqual(result.defender.levels, { CC: 5 });
    assert.equal(result.error, null);
    assert.deepEqual(result.attacker.units.map(unit => unit.code), ['FT', 'CV', 'DE', 'IF', 'BS', 'FC']);
    assert.deepEqual(result.defender.units.map(unit => [unit.code, unit.quantity]), [['PS', 0.01], ['PR', 0.01]]);
    assert.deepEqual(analyzeReport(text.replaceAll('\t', '  ')).attacker.levels, result.attacker.levels);
});

test('英文 Unit 表頭的完整戰報能分析防禦設施並匯入初始兵力', () => {
    const text = `[b]Battle Report[/b]
Location：[url=https://borealis.astroempires.com/map.aspx?loc=B40:07:90:21]Base (B40:07:90:21)[/url]
Time：2026-11-22 19:14:40
Server：Borealis
[b]Attack Force[/b]
Player：Attacker
Fleet Name：Fleet 1864 [b](Destroyed)[/b]
[b]Defensive Force[/b]
Player：Defender
Fleet Name：Fleet 78
Base：23211
Start Defenses：[b]100%[/b]
End Defenses：[b]100%[/b]
Command Centers：4
[b]Attack Force[/b]
[code]
Unit\tStart Quant.\tEnd Quant.\tAttack\tArmour\tShield
Bombers\t545\t0\t10.5\t4.7\t0
[/code]
[b]Defensive Force[/b]
[code]
Unit\tStart Quant.\tEnd Quant.\tAttack\tArmour\tShield
Fighters\t1210\t0\t5.04\t4.3\t0
Scout Ship\t7\t0\t2.52\t4.3\t0
Heavy Cruiser\t1\t0\t97.92\t103.2\t6.6
Disruptor Turrets\t5\t5\t352\t688\t13.2
Planetary Ring\t5\t5\t2400\t2150\t19.8
[/code]`;
    const report = analyzeReport(text);
    assert.equal(report.error, null);
    assert.deepEqual(report.attacker.levels, { MIS: 22, ARM: 27 });
    assert.deepEqual(report.defender.levels, { LAS: 22, ARM: 23, PLA: 14, SLD: 13, DIS: 2, PHO: 10, CC: 4 });
    assert.deepEqual(report.defender.unresolved, []);
    assert.deepEqual(report.defender.warnings, []);
    const { url } = buildReportCalculatorUrl(report, 'en');
    assert.equal(url.pathname, '/en/aeBattleCalc');
    assert.equal(url.searchParams.get('aS'), 'BO:545');
    assert.equal(url.searchParams.get('dS'), 'FT:1210,SS:7,HC:1,DT:5,PR:5');
    assert.deepEqual(analyzeReport(text.replaceAll('Unit\t', 'UNIT\t')).defender.levels, report.defender.levels);
});

test('矛盾數值無法回算時保留其他科技，無效與未知單位提供提示', () => {
    const text = (fixture.information + fixture.tables)
        .replace('\t8.6\t', '\t8.4\t')
        .replace('\t7.4\t', '\t未知\t')
        .replace('女神的项链\t', '未知舰船\t');
    const result = analyzeReport(text);
    assert.equal(result.attacker.levels.LAS, undefined);
    assert.equal(result.attacker.levels.ARM, 24);
    assert.equal(result.attacker.reasons.LAS.key, 'conflictingValues');
    assert.match(result.defender.warnings.map(message => t(message, 'zh-CN')).join('\n'), /未识别单位.*未知舰船/);
    assert.match(result.defender.warnings.map(message => t(message, 'zh-CN')).join('\n'), /资料不完整/);
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
        assert.match(t(analyzeReport(text).error, 'en'), /BBCode/);
    }
    assert.equal(analyzeReport(fixture.tables).error, null);
    const result = analyzeReport(fixture.tables.replace('战斗机', '<b>战斗机</b>'));
    assert.match(result.attacker.warnings.map(message => t(message, 'zh-CN')).join('\n'), /未识别单位/);
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
        [fixture.tables.replace('炮艇', '未知舰船'), /未识别单位「未知舰船」/],
        [fixture.tables.replace('炮艇\t6601', '炮艇\t無效'), /炮艇.*初始数量无效/],
        [fixture.tables.replace('炮艇\t6601', '炮艇\t-1'), /炮艇.*初始数量无效/],
        [fixture.tables.replace('炮艇\t6601', '炮艇\t0'), /炮艇.*初始数量无效/],
        [fixture.tables.replace('6601\t6601\t8.6\t11\t0', '6601\t6601\t8.6\t11'), /炮艇.*兵力列不完整/],
        ['[code]Ships', /缺少结束标签/],
        ['', /没有可导入/],
    ]) {
        const result = buildReportCalculatorUrl(analyzeReport(text));
        assert.equal('url' in result, false);
        assert.match(t(result.error, 'zh-CN'), expected);
    }
});

test('六欄兵力的數值觀測缺失時仍可匯入，省略無法確認的科技', () => {
    const text = '[b]攻击舰队[/b]\n[code]\n舰船\t初始数量\t战后数量\t攻击\t装甲\t护盾\n炮艇\t1\t0\t未知\t未知\t未知\n[/code]';
    const { url } = buildReportCalculatorUrl(analyzeReport(text));
    assert.equal(url.searchParams.get('aS'), 'CV:1');
    assert.equal(url.searchParams.has('aT'), false);
});
