import assert from 'node:assert/strict';
import { test } from 'node:test';
import { formatLocalTime, formatServerTime, parseServerTime, parseTravelDuration } from '../src/arrival.ts';

test('解析中英文航行時間及分鐘、秒的短航程', () => {
    for (const value of ['8h 34m 18s', '8小时 34分钟 18秒']) {
        assert.equal(parseTravelDuration(value), 30858);
    }
    for (const value of ['24m 12s', '24分钟 12秒']) {
        assert.equal(parseTravelDuration(value), 1452);
    }
    assert.equal(parseTravelDuration('3m 09s'), 189);
    assert.equal(parseTravelDuration('3分钟'), 180);
    assert.equal(parseTravelDuration('09s'), 9);
    for (const value of ['', '—', '0秒', '1h 60m 00s', '60s', '8h 5m error']) {
        assert.equal(parseTravelDuration(value), null, value);
    }
});

test('頁首的日期格式皆以固定 GMT+1 解析', () => {
    const expected = Date.UTC(2026, 10, 18, 19, 39, 30);
    for (const value of ['2026-11-18 20:39:30', '2026/11/18 20:39:30', '18 Nov 2026, 20:39:30',
        'Nov 18 2026,  20:39:30', '18 十一月 2026, 20:39:30']) {
        assert.equal(parseServerTime(value), expected, value);
    }
    for (const value of ['', '2026-02-29 20:39:30', '2026-11-18 24:00:00', 'Nov 18 2026, 20:60:00']) {
        assert.equal(parseServerTime(value), null, value);
    }
});

test('兩個時鐘各自推算跨日抵達，本地依抵達當時的夏令時間顯示', () => {
    const previousZone = process.env.TZ;
    try {
        process.env.TZ = 'Asia/Taipei';
        const serverDeparture = parseServerTime('2026-11-18 20:39:30');
        const deviceDeparture = new Date(2026, 10, 18, 23, 39, 31).getTime();
        assert.equal(formatServerTime(serverDeparture + 30858 * 1000), '2026-11-19 05:13:48');
        assert.equal(formatLocalTime(deviceDeparture + 30858 * 1000), '2026-11-19 08:13:49');

        process.env.TZ = 'America/New_York';
        const beforeTransition = new Date(2026, 2, 8, 1, 30).getTime();
        assert.equal(formatLocalTime(beforeTransition + 3600 * 1000), '2026-03-08 03:30:00');
    } finally {
        if (previousZone === undefined) delete process.env.TZ;
        else process.env.TZ = previousZone;
    }
});
