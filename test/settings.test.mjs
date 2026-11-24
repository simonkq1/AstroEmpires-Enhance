import assert from 'node:assert/strict';
import { test } from 'node:test';
import { language, msg, t } from '../src/i18n.ts';
import { initializeSettings, needsLanguageChoice, readSettings, saveLanguage, settingsKey } from '../src/settings.ts';
import { buildCalculatorUrl } from '../src/fleet.ts';
import { analyzeReport, buildReportCalculatorUrl } from '../src/report.ts';
import fixture from './fixtures/report.json' with { type: 'json' };

test('只接受受支援的語言紀錄，儲存空間異常時進入首次選擇', () => {
    for (const value of [null, '{bad json', 'null', '{}', '{"language":"fr"}', '[]']) {
        assert.equal(readSettings({ getItem: () => value }), null);
    }
    assert.equal(readSettings({ getItem() { throw new Error('Denied'); } }), null);
    for (const locale of ['zh-CN', 'en']) {
        assert.deepEqual(readSettings({ getItem: () => JSON.stringify({ language: locale }) }), { language: locale });
    }
});

test('選擇語言可保存並重新載入，保存失敗仍套用當頁語言', () => {
    const previous = Object.getOwnPropertyDescriptor(globalThis, 'localStorage');
    let saved = null;
    try {
        Object.defineProperty(globalThis, 'localStorage', { configurable: true, value: {
            getItem: key => key === settingsKey ? saved : null,
            setItem(key, value) { assert.equal(key, settingsKey); saved = value; },
        } });
        initializeSettings();
        assert.equal(language.value, 'en');
        assert.equal(needsLanguageChoice.value, true);
        assert.equal(saveLanguage('zh-CN'), true);
        assert.equal(saved, '{"language":"zh-CN"}');
        language.value = 'en';
        initializeSettings();
        assert.equal(language.value, 'zh-CN');
        assert.equal(needsLanguageChoice.value, false);
        Object.defineProperty(globalThis, 'localStorage', { configurable: true, value: {
            getItem() { throw new Error('Denied'); }, setItem() { throw new Error('Denied'); },
        } });
        initializeSettings();
        assert.equal(needsLanguageChoice.value, true);
        assert.equal(saveLanguage('zh-CN'), false);
        assert.equal(language.value, 'zh-CN');
        assert.equal(needsLanguageChoice.value, false);
    } finally {
        if (previous) Object.defineProperty(globalThis, 'localStorage', previous);
        else delete globalThis.localStorage;
        language.value = 'en';
    }
});

test('訊息及巢狀參數可隨顯示語言重新翻譯', () => {
    const message = msg('importBlocked', { issues: [msg('sideIssue', {
        side: msg('defender'), issue: msg('invalidQuantity', { name: 'Planetary Shield' }),
    })] });
    assert.match(t(message, 'en'), /Defender.*Planetary Shield.*invalid initial quantity/);
    assert.match(t(message, 'zh-CN'), /守方.*Planetary Shield.*初始数量无效/);
    const analysis = analyzeReport(fixture.tables.replace('[b]攻击舰队[/b]', '[b]防御舰队[/b]'));
    assert.equal(analysis.defender.reasons.LAS.key, 'missingAttackBonus');
    assert.match(t(analysis.defender.reasons.LAS, 'en'), /bonuses are missing/);
    assert.match(t(analysis.defender.reasons.LAS, 'zh-CN'), /缺少指挥中心/);
});

test('AEBits 依語言切換路徑，兵力與科技參數一致', () => {
    const report = analyzeReport(fixture.information + fixture.tables);
    const english = buildReportCalculatorUrl(report, 'en').url;
    const chinese = buildReportCalculatorUrl(report, 'zh-CN').url;
    assert.equal(english.pathname, '/en/aeBattleCalc');
    assert.equal(chinese.pathname, '/zh/aeBattleCalc');
    assert.equal(english.search, chinese.search);
    assert.equal(buildCalculatorUrl({}).url.pathname, '/zh/aeBattleCalc');
});
