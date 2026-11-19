import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import packageInfo from '../package.json' with { type: 'json' };

const chrome = process.env.CHROME_BIN ?? (process.platform === 'darwin'
    ? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' : 'chromium');
const source = readFileSync(new URL('../dist/astroempires.user.js', import.meta.url), 'utf8');
const vue = readFileSync(new URL(import.meta.resolve('vue/dist/vue.runtime.global.prod.js')), 'utf8');
const expectedRequire = `https://cdn.jsdelivr.net/npm/vue@${packageInfo.dependencies.vue}/dist/vue.runtime.global.prod.js`;
assert.deepEqual([...source.matchAll(/^\/\/ @require\s+(\S+)$/gm)].map(match => match[1]), [expectedRequire]);
const suite = `<!doctype html><meta charset="utf-8">
<style>body{font:40px fantasy;color:magenta}button,textarea{background:red!important;display:none!important}</style>
<script>${vue.replace(/<\/script/gi, '<\\/script')}</script>
<body><div id="fleet_overview"><table class="listing"><tr><td>Fighters</td><td>500</td></tr></table></div>
<script>
const program = ${JSON.stringify(source).replace(/<\//g, '<\\/')};

async function verify() {
    const head = document.head.innerHTML;
    const execute = new Function('location', 'navigator', 'window', program);
    const url = new URL('https://borealis.astroempires.com/fleet.aspx?fleet=1');
    const clipboard = { async writeText() { throw new Error('Clipboard denied'); } };
    execute(url, { clipboard }, window);
    execute(url, { clipboard }, window);

    const id = 'astro-empires-fleet-actions';
    const host = document.getElementById(id);
    const root = host?.shadowRoot;
    const ensure = (condition, message) => { if (!condition) throw new Error(message); };
    ensure(root && document.querySelectorAll('#' + id).length === 1, 'Expected one open Shadow Root');
    ensure(document.head.innerHTML === head, 'A style escaped into document.head');
    ensure(root.querySelector('style[data-primevue-style-id="base"]'), 'PrimeVue base styles are missing from the Shadow Root');
    ensure(!document.body.querySelector('style, button, textarea'), 'Toolbar content escaped into the page');
    const toggle = root.querySelector('button');
    ensure(toggle.dataset.pcName === 'button', 'Expected a PrimeVue Button');
    ensure(getComputedStyle(toggle).display !== 'none' && getComputedStyle(toggle).backgroundColor === 'rgb(23, 43, 55)', 'Page button CSS leaked in');
    ensure(getComputedStyle(toggle).fontSize === '14px', 'Page font leaked in');
    toggle.click();
    await new Promise(resolve => setTimeout(resolve, 0));
    root.querySelector('button[aria-label="英文"]').click();
    await new Promise(resolve => setTimeout(resolve, 0));
    const backup = root.querySelector('textarea');
    ensure(!backup.hidden && getComputedStyle(backup).display !== 'none', 'The textarea should be visible despite page styles');
    ensure(backup.value === 'Fighters\\t500' && backup.selectionEnd === backup.value.length, 'Manual copy text did not retain focus and selection');
    ensure(root.activeElement === backup, 'Manual copy focus escaped the Shadow Root');
}

async function verifyArrival() {
    document.getElementById('astro-empires-fleet-actions').remove();
    document.getElementById('fleet_overview').remove();
    const fixture = document.createElement('div');
    fixture.innerHTML = '<span id="server-time">2026-11-19 00:03:53</span><span id="local-time">2026-11-19 09:00:00</span>' +
        '<span id="translation_h">小时</span>' +
        '<form id="move_fleet_form"><table><tr><td><input id="destination" value="B45:65:09:30"></td>' +
        '<td id="duration">24分钟 12秒</td></tr></table></form>';
    document.body.append(fixture);
    const execute = new Function('location', 'window', 'performance', 'Date', program);
    const id = 'astro-empires-fleet-arrival';
    const url = 'https://borealis.astroempires.com/fleet.aspx?fleet=1&view=move';
    const ensure = (condition, message) => { if (!condition) throw new Error(message); };
    const settle = () => new Promise(resolve => setTimeout(resolve, 0));
    const head = document.head.innerHTML;
    let tick, timers = 0, elapsed = 0;
    let deviceNow = new Date(2026, 10, 19, 14, 3, 54).getTime();
    class DeviceDate extends Date {
        static now() { return deviceNow; }
    }
    const run = href => execute(new URL(href), {
        setInterval(callback, interval) {
            ensure(interval === 1000, 'Expected one-second arrival updates');
            tick = callback;
            timers++;
        },
    }, { now: () => elapsed }, DeviceDate);

    for (const invalid of [url.replace('borealis', 'altair'), url.replace('fleet=1', 'fleet=0'),
        url.replace('fleet=1&', ''), url.replace('view=move', 'view=move_start')]) run(invalid);
    ensure(!document.getElementById(id), 'Arrival should be limited to valid move pages');
    run(url);
    run(url);
    const host = document.getElementById(id);
    const root = host?.shadowRoot;
    const serverArrival = () => root.querySelector('dd')?.textContent;
    const localArrival = () => root.querySelectorAll('dd')[1]?.textContent;
    const serverClock = fixture.querySelector('#server-time');
    const destination = fixture.querySelector('#destination');
    const duration = fixture.querySelector('#duration');
    await settle();
    ensure(root && timers === 1 && fixture.querySelector('table').nextElementSibling === host, 'Expected one arrival panel below the move table');
    ensure(document.head.innerHTML === head && root.querySelector('style'), 'Arrival styles must stay inside the Shadow Root');
    ensure(serverArrival() === '2026-11-19 00:28:05', 'Unexpected server arrival for the reported case');
    ensure(localArrival() === '2026-11-19 14:28:06', 'Local arrival should use the device clock instead of either page clock');

    elapsed = 1000;
    deviceNow += 1000;
    tick();
    await settle();
    ensure(serverArrival() === '2026-11-19 00:28:06', 'A static server clock should advance');
    ensure(localArrival() === '2026-11-19 14:28:07', 'Local arrival should update on each tick');

    serverClock.textContent = '2026-11-19 00:04:10';
    tick();
    await settle();
    ensure(serverArrival() === '2026-11-19 00:28:22', 'Server arrival should follow the corrected server clock');
    ensure(localArrival() === '2026-11-19 14:28:07', 'A server clock correction should leave local arrival based on the device clock');

    destination.value = 'B45:65:09:31';
    destination.dispatchEvent(new Event('input'));
    await settle();
    ensure(!serverArrival() && !localArrival(), 'Changes to the destination should hide stale arrival times');
    duration.innerHTML = '24分钟 12秒';
    await settle();
    ensure(serverArrival() === '2026-11-19 00:28:22' && localArrival() === '2026-11-19 14:28:07',
        'Both arrivals should return after recalculation with the same duration');
    duration.textContent = '3m 09s';
    await settle();
    ensure(serverArrival() === '2026-11-19 00:07:19' && localArrival() === '2026-11-19 14:07:04',
        'Both arrivals should update immediately after a duration change');

    serverClock.remove();
    deviceNow += 2000;
    tick();
    await settle();
    ensure(serverArrival() === '无法取得' && localArrival() === '2026-11-19 14:07:06',
        'Local arrival should keep following the device clock when the server clock is missing');
    duration.textContent = '';
    await settle();
    ensure(!serverArrival() && !localArrival(), 'Empty travel duration must clear both estimates');
}

verify().then(verifyArrival).then(() => { document.body.dataset.result = 'pass'; }, error => {
    document.body.dataset.result = 'fail';
    document.body.dataset.error = error.message;
});
</script>`;

const directory = mkdtempSync(join(tmpdir(), 'astroempires-shadow-'));
try {
    const page = join(directory, 'test.html');
    writeFileSync(page, suite);
    const result = spawnSync(chrome, [
        '--headless', '--disable-gpu', '--disable-background-networking', '--host-resolver-rules=MAP * ~NOTFOUND',
        '--no-first-run', '--no-default-browser-check', `--user-data-dir=${join(directory, 'chrome')}`,
        '--dump-dom', '--virtual-time-budget=5000', pathToFileURL(page).href,
    ], { encoding: 'utf8', timeout: 30_000, maxBuffer: 4_000_000 });
    if (result.error) throw result.error;
    assert.equal(result.status, 0, result.stderr);
    assert.match(result.stdout.match(/<body[^>]*>/)?.[0] ?? '', /data-result="pass"/);
    console.log('Shadow DOM 樣式隔離、剪貼簿備援及抵達時間預測通過瀏覽器測試。');
} finally {
    rmSync(directory, { recursive: true, force: true });
}
