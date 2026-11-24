import assert from 'node:assert/strict';
import test from 'node:test';
import { inferBaseCount } from '../src/base.ts';
import { buildCalculatorUrl, parseFleetUnit } from '../src/fleet.ts';

const playerBase = { economy: 133, income: 133, pillage: 10531, npc: false, occupied: false, hoursSincePillage: null, ownerLevelPercent: 83 };

test('v5 基地掠奪價值扣除收入損失獎勵後得到所有者 11 座基地', () => {
    assert.deepEqual(inferBaseCount(playerBase), { count: 11, reason: null });
    assert.deepEqual(inferBaseCount({ ...playerBase, hoursSincePillage: 100 }), { count: 11, reason: null });
    assert.deepEqual(inferBaseCount({ ...playerBase, economy: 126, income: 89, pillage: 252, ownerLevelPercent: null }), { count: 1, reason: null });
});

test('NPC、占領、近期掠奪及無法確認的數值不產生基地數量', () => {
    for (const [changes, reason] of [
        [{ npc: true }, 'baseNpc'], [{ occupied: true }, 'baseRecentlyPillaged'],
        [{ hoursSincePillage: 45 }, 'baseRecentlyPillaged'], [{ pillage: null }, 'baseMissingPillage'],
        [{ pillage: 10532 }, 'baseCountMismatch'], [{ pillage: 7605 }, 'baseCountMismatch'],
        [{ economy: 0 }, 'baseCountMismatch'], [{ income: 90 }, 'baseCountMismatch'],
        [{ ownerLevelPercent: null }, 'baseLevelUnknown'], [{ ownerLevelPercent: 65 }, 'baseLevelUnknown'],
    ]) {
        const result = inferBaseCount({ ...playerBase, ...changes });
        assert.equal(result.count, null);
        assert.equal(result.reason.key, reason);
    }
});

test('AEBits p 參數只帶入已取得的經濟與可推算的基地數量', () => {
    const ships = { aS: [parseFleetUnit('Scout Ship', '1')] };
    for (const locale of ['zh-CN', 'en']) {
        const complete = buildCalculatorUrl(ships, {}, locale, { economy: 133, defenderBase: 11 }).url;
        assert.equal(complete.searchParams.get('p'), 'economy:133,defenderBase:11');
        assert.equal(complete.searchParams.get('aS'), 'SS:1');
        assert.equal(complete.searchParams.get('gv'), '5');
        const economyOnly = buildCalculatorUrl(ships, {}, locale, { economy: 206 }).url;
        assert.equal(economyOnly.searchParams.get('p'), 'economy:206');
        assert.equal(buildCalculatorUrl(ships, {}, locale).url.searchParams.has('p'), false);
    }
});

test('AEBits 收入與經濟分別傳入，並保留零收入', () => {
    for (const locale of ['zh-CN', 'en']) {
        for (const [pillage, expected] of [
            [{ economy: 126, income: 89 }, 'economy:126,income:89'],
            [{ economy: 133, income: 133, defenderBase: 11 }, 'economy:133,income:133,defenderBase:11'],
            [{ economy: 206, income: 206, defenderBase: 8 }, 'economy:206,income:206,defenderBase:8'],
            [{ economy: 133, income: 0 }, 'economy:133,income:0'],
        ]) {
            const { url } = buildCalculatorUrl({}, {}, locale, pillage);
            assert.equal(url.searchParams.get('p'), expected);
        }
    }
});
