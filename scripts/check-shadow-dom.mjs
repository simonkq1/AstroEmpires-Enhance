import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import packageInfo from '../package.json' with { type: 'json' };
import reportFixture from '../test/fixtures/report.json' with { type: 'json' };
import reportPages from '../test/fixtures/report-pages.json' with { type: 'json' };
import englishReportPages from '../test/fixtures/report-pages-en.json' with { type: 'json' };
import combatBase from '../test/fixtures/combat-base.json' with { type: 'json' };
import basePages from '../test/fixtures/base-pages.json' with { type: 'json' };

const chrome = process.env.CHROME_BIN ?? (process.platform === 'darwin'
    ? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' : 'chromium');
const source = readFileSync(new URL('../dist/astroempires.user.js', import.meta.url), 'utf8');
const fleetFractional = readFileSync(new URL('../test/fixtures/fleet-fractional.html', import.meta.url), 'utf8');
const vue = readFileSync(new URL(import.meta.resolve('vue/dist/vue.runtime.global.prod.js')), 'utf8');
const expectedRequire = `https://cdn.jsdelivr.net/npm/vue@${packageInfo.dependencies.vue}/dist/vue.runtime.global.prod.js`;
assert.deepEqual([...source.matchAll(/^\/\/ @require\s+(\S+)$/gm)].map(match => match[1]), [expectedRequire]);
const suite = `<!doctype html><meta charset="utf-8">
<style>body{font:40px fantasy;color:magenta}button,textarea{background:red!important;display:none!important}</style>
<script>${vue.replace(/<\/script/gi, '<\\/script')}</script>
<body><div id="fleet_overview"><table class="listing"><tr><td>Fighters</td><td>500</td></tr></table></div>
<script>
const program = ${JSON.stringify(source).replace(/<\//g, '<\\/')};
const reportFixture = ${JSON.stringify(reportFixture).replace(/<\//g, '<\\/')};
const reportPages = ${JSON.stringify(reportPages).replace(/<\//g, '<\\/')};
const englishReportPages = ${JSON.stringify(englishReportPages).replace(/<\//g, '<\\/')};
const combatBase = ${JSON.stringify(combatBase).replace(/<\//g, '<\\/')};
const basePages = ${JSON.stringify(basePages).replace(/<\//g, '<\\/')};
const fleetFractional = ${JSON.stringify(fleetFractional).replace(/<\//g, '<\\/')};
const vueProgram = ${JSON.stringify(vue).replace(/<\//g, '<\\/')};
localStorage.setItem('astro-empires-settings', JSON.stringify({ language: 'zh-CN' }));

async function verifySettings() {
    const ensure = (condition, message) => { if (!condition) throw new Error(message); };
    const settle = () => new Promise(resolve => setTimeout(resolve, 0));
    const key = 'astro-empires-settings';
    const fleetHtml = '<div id="fleet_overview"><table class="listing"><tr><td>Fighters</td><td>500</td></tr></table></div>';
    let saved = null;
    const storage = { getItem: () => saved, setItem(_, value) { saved = value; } };

    async function page(path, html = fleetHtml, store = storage, fetchBase = async () => { throw new Error('Base unavailable'); }) {
        const frame = document.createElement('iframe');
        frame.style.cssText = 'position:fixed;inset:0;width:100%;height:100%;border:0;z-index:2147483647';
        const loaded = new Promise(resolve => { frame.onload = resolve; });
        frame.srcdoc = '<!doctype html><meta charset="utf-8"><style>body{font:40px fantasy}button,textarea,select{display:none!important}</style><body>' + html;
        document.body.append(frame);
        await loaded;
        const child = frame.contentWindow;
        child.eval(vueProgram);
        const state = { copied: '', blocked: false, opened: [], requests: [] };
        const targetWindow = new Proxy(child, { get(target, name) {
            if (name === 'open') return (...args) => state.opened.push(args);
            if (name === 'fetch') return (url, options) => { state.requests.push({ url, options }); return fetchBase(url, options); };
            const value = Reflect.get(target, name, target);
            return typeof value === 'function' ? value.bind(target) : value;
        } });
        const execute = child.Function('location', 'navigator', 'window', 'localStorage', program);
        const run = () => execute(new URL('https://borealis.astroempires.com/' + path), {
            clipboard: { async writeText(text) { if (state.blocked) throw new Error('Denied'); state.copied = text; } },
        }, targetWindow, store);
        const head = child.document.head.innerHTML;
        run();
        await settle();
        const root = child.document.getElementById('astro-empires-report-analyzer').shadowRoot;
        const dialog = root.querySelector('dialog');
        const find = (label, target = root) => [...target.querySelectorAll('button')].find(button => button.textContent === label);
        const click = async (label, target = root) => {
            const node = find(label, target);
            ensure(node, 'Missing translated button ' + label);
            node.click();
            await settle();
        };
        const choose = value => {
            const select = dialog.querySelector('select');
            select.value = value;
            select.dispatchEvent(new child.Event('change'));
        };
        const settings = async () => {
            const trigger = root.querySelector('.trigger');
            if (root.querySelector('.feature-list').hidden) {
                if (trigger.getAttribute('aria-expanded') === 'true') { trigger.click(); await settle(); }
                trigger.click(); await settle();
            }
            const buttons = root.querySelectorAll('.feature-list button');
            buttons[1].click();
            await settle();
            ensure(dialog.open && dialog.matches(':modal'), 'Settings must use a native modal dialog');
        };
        const save = async value => {
            await settings();
            choose(value);
            await click(dialog.querySelector('.settings-actions button').textContent, dialog);
        };
        const analyze = async text => {
            const trigger = root.querySelector('.trigger');
            if (root.querySelector('.feature-list').hidden) {
                if (trigger.getAttribute('aria-expanded') === 'true') { trigger.click(); await settle(); }
                trigger.click(); await settle();
            }
            root.querySelector('.feature-list button').click();
            await settle();
            if (text !== undefined) {
                const input = root.querySelector('textarea'); input.value = text;
                input.dispatchEvent(new child.Event('input')); await settle();
                root.querySelector('.panel > button').click(); await settle();
            }
        };
        return { frame, child, state, root, dialog, choose, settings, save, analyze, click, run, head,
            close() { if (dialog.open) dialog.close(); frame.remove(); } };
    }

    async function verifyHelp(current, locale) {
        const { root, child } = current;
        const menu = root.querySelector('.feature-list');
        const trigger = root.querySelector('.trigger');
        const entry = menu.querySelector('[aria-controls="astro-empires-help"]');
        const help = root.querySelector('.help-dialog');
        const input = root.querySelector('textarea').value;
        const result = root.querySelector('.results').textContent;
        const chinese = locale === 'zh-CN';
        ensure(entry.textContent === (chinese ? '说明' : 'Help'), 'Help entry should follow the selected language');
        if (menu.hidden) { trigger.click(); await settle(); trigger.click(); await settle(); }
        entry.click(); await settle();
        ensure(help.open && help.matches(':modal') && menu.hidden && help.lang === locale,
            'Help should replace the feature list with a native modal in the current language');
        ensure(root.activeElement === help.querySelector('h2') && help.getAttribute('aria-labelledby') === help.querySelector('h2').id,
            'Help should focus its accessible title for reading');
        const expected = chinese
            ? ['复制战报 BBCode', '分析 BBCode', '导入 AEBits 战斗模拟器', '舰队详情与战斗页', '基地经济与基地数量', '预计到达', '设置', '许可证']
            : ['Copy battle report BBCode', 'Analyze BBCode', 'Import into AEBits Battle Calculator', 'Fleet details and combat pages', 'Base economy and base count', 'Estimated arrival', 'Settings', 'License'];
        ensure(JSON.stringify([...help.querySelectorAll('h3')].map(title => title.textContent)) === JSON.stringify(expected) &&
            [...help.querySelectorAll('section')].every(section => section.querySelectorAll('p').length === 2),
            'Help should describe every feature with translated usage instructions');
        ensure(help.textContent.includes('messages.aspx') && help.textContent.includes('board.aspx') &&
            help.textContent.includes('combat.aspx') && help.textContent.includes('view=move') && help.textContent.includes('GMT+1'),
            'Help should identify the supported pages and server clock');
        const notice = help.querySelector('.license-notice');
        ensure(notice.textContent.includes('Copyright (C) 2026 simonkq1') && notice.textContent.includes('GPL-3.0-or-later') &&
            notice.textContent.includes(chinese ? '不提供任何担保' : 'WITHOUT ANY WARRANTY') &&
            notice.textContent.includes(chinese ? '第三方库' : 'Third-party libraries'),
            'Help should display translated license, warranty and third-party notices');
        const links = [...notice.querySelectorAll('a')];
        ensure(links[0].href === 'https://www.gnu.org/licenses/gpl-3.0.html' && links[0].textContent === (chinese ? 'GPLv3 完整条款' : 'Full GPLv3 terms') &&
            links[1].href === 'https://github.com/simonkq1/AstroEmpires-Enhance' && links[1].textContent === (chinese ? '源代码' : 'Source code') &&
            links.every(link => link.target === '_blank' && link.rel === 'noopener noreferrer'),
            'Help should provide accessible license and source links in both languages');
        const bounds = help.getBoundingClientRect();
        ensure(Math.abs(bounds.left + bounds.width / 2 - child.innerWidth / 2) < 2 &&
            Math.abs(bounds.top + bounds.height / 2 - child.innerHeight / 2) < 2 && bounds.width <= child.innerWidth - 30 &&
            bounds.top >= 0 && bounds.bottom <= child.innerHeight && help.scrollHeight > help.clientHeight,
            'Help should be centered, scrollable and fit the narrow viewport');
        help.scrollTop = help.scrollHeight;
        ensure(help.scrollTop > 0 && child.getComputedStyle(help).overflowY === 'auto' &&
            child.getComputedStyle(help.querySelector('button')).display !== 'none',
            'Help content should scroll and ignore the game button styles');
        current.run(); await settle();
        ensure(root.querySelectorAll('.help-dialog').length === 1 && menu.querySelectorAll('[aria-controls="astro-empires-help"]').length === 1 && help.open,
            'Repeated initialization should keep a single open help dialog and menu entry');
        await current.click(chinese ? '关闭' : 'Close', help);
        ensure(!help.open && !menu.hidden && root.activeElement === entry,
            'Closing Help should restore the menu and focus its entry');
        entry.click(); await settle();
        ensure(root.activeElement === help.querySelector('h2') && help.scrollTop === 0, 'Reopening Help should start at the title');
        help.requestClose(); await settle();
        ensure(!help.open && !menu.hidden && root.activeElement === entry,
            'Native Escape cancellation should return to the Help menu entry');
        await current.analyze();
        ensure(root.querySelector('textarea').value === input && root.querySelector('.results').textContent === result,
            'Opening and closing Help should preserve report input and analysis results');
        ensure(child.document.head.innerHTML === current.head, 'Help styles must stay in Shadow DOM');
    }

    let current = await page('fleet.aspx?fleet=1');
    ensure(current.dialog.open && current.dialog.textContent.includes('选择语言 / Choose language') && current.dialog.querySelector('select').value === 'en',
        'Missing settings should show a bilingual first-use dialog with English selected');
    const bounds = current.dialog.getBoundingClientRect();
    ensure(Math.abs(bounds.left + bounds.width / 2 - current.child.innerWidth / 2) < 2 &&
        Math.abs(bounds.top + bounds.height / 2 - current.child.innerHeight / 2) < 2, 'Settings should be centered in the viewport');
    ensure(current.dialog.querySelector('select') === current.root.activeElement && bounds.width <= current.child.innerWidth - 30,
        'First-use dialog should focus the language choice and fit a narrow viewport');
    await current.click('稍后 / Later', current.dialog);
    ensure(!current.dialog.open && saved === null && current.root.querySelector('.feature-list button').textContent === 'Analyze BBCode',
        'Later should use English for this page without saving');
    current.run(); await settle();
    ensure(current.child.document.querySelectorAll('#astro-empires-report-analyzer').length === 1 && !current.dialog.open,
        'Repeated initialization should keep a single entry and avoid reopening the first-use dialog');
    current.close();

    current = await page('fleet.aspx?fleet=1');
    ensure(current.dialog.open, 'Later should prompt again on the next page load');
    current.choose('zh-CN');
    await current.click('保存 / Save', current.dialog);
    ensure(saved === '{"language":"zh-CN"}' && !current.dialog.open, 'Saving the first choice should persist the language');
    const fleet = current.child.document.getElementById('astro-empires-fleet-actions').shadowRoot;
    current.state.blocked = true;
    await current.click('复制舰队资料', fleet);
    await current.click('英文', fleet);
    ensure(fleet.querySelector('[role=status]').textContent.includes('无法访问剪贴板'), 'Chinese clipboard errors should be translated');
    const copiedText = fleet.querySelector('textarea').value;
    await current.analyze(reportFixture.tables);
    ensure(current.root.querySelector('.results').textContent.includes('基地防御受损'), 'Analysis reasons should use the selected language');
    await verifyHelp(current, 'zh-CN');
    await current.save('en');
    ensure(current.root.activeElement === current.root.querySelectorAll('.feature-list button')[1], 'Settings should restore focus to its menu entry');
    ensure(fleet.querySelector('button').textContent === 'Copy fleet data' && fleet.querySelector('[role=status]').textContent.includes('Clipboard access failed') &&
        fleet.querySelector('textarea').value === copiedText, 'Existing fleet controls and statuses should translate live while retaining manual-copy text');
    ensure(current.root.querySelector('textarea').value === reportFixture.tables && current.root.querySelector('.results').textContent.includes('Armour (ARM)') &&
        current.root.querySelector('.results').textContent.includes('Base defenses are damaged'), 'Analysis input, numeric results and warnings should survive a live language switch');
    await verifyHelp(current, 'en');
    await current.analyze();
    await current.click('Import into AEBits Battle Calculator');
    const englishUrl = new URL(current.state.opened.at(-1)[0]);
    ensure(englishUrl.pathname === '/en/aeBattleCalc' && englishUrl.searchParams.get('aT') === 'LAS:23,ARM:24,PLA:16,ION:12,SLD:15', 'English analysis should import confirmed levels into the English calculator');
    current.state.blocked = false;
    await current.click('Copy fleet data', fleet);
    await current.click('Simplified Chinese', fleet);
    ensure(current.state.copied === '战斗机' + String.fromCharCode(9) + '500', 'Copy output language should remain independently selectable');
    await current.click('AEBits Battle Calculator', fleet); await current.click('Attacker', fleet);
    ensure(new URL(current.state.opened.at(-1)[0]).pathname === '/en/aeBattleCalc', 'Fleet import should follow the selected language');
    await current.settings(); current.choose('zh-CN'); await current.click('Cancel', current.dialog);
    ensure(fleet.querySelector('button').textContent === 'Copy fleet data' && saved === '{"language":"en"}', 'Cancel should discard the draft language');
    await current.save('zh-CN'); await current.analyze(); await current.click('导入 AEBits 战斗模拟器');
    const chineseUrl = new URL(current.state.opened.at(-1)[0]);
    ensure(chineseUrl.pathname === '/zh/aeBattleCalc' && chineseUrl.search === englishUrl.search, 'Changing language should change only the calculator path');
    ensure(current.child.document.head.innerHTML === current.head, 'Settings CSS must stay in Shadow DOM');
    current.close();

    current = await page('fleet.aspx?fleet=1');
    ensure(!current.dialog.open && current.root.querySelector('.feature-list button').textContent === '分析 BBCode', 'Saved language should load without a prompt');
    current.close();
    for (const invalid of ['{invalid', '{"language":"fr"}']) {
        saved = invalid; current = await page('base.aspx', '');
        ensure(current.dialog.open, 'Invalid settings should reopen the language choice');
        current.dialog.requestClose(); await settle();
        ensure(!current.dialog.open && saved === invalid && current.root.querySelector('.feature-list button').textContent === 'Analyze BBCode',
            'Native cancellation should temporarily use English without saving');
        current.close();
    }
    saved = null;
    current = await page('base.aspx', '', { getItem() { throw new Error('Denied'); }, setItem() { throw new Error('Denied'); } });
    ensure(current.dialog.open, 'Storage access failure should prompt for language');
    current.choose('zh-CN'); await current.click('保存 / Save', current.dialog);
    ensure(current.dialog.open && current.dialog.textContent.includes('无法保存设置') &&
        current.root.querySelector('.feature-list button').textContent === '分析 BBCode' && saved === null, 'Save failure should apply the page language and display a translated warning');
    current.close();

    saved = '{"language":"en"}';
    current = await page('fleet.aspx?fleet=1&view=move', '<span id="server-time">2026-11-19 00:03:53</span><form id="move_fleet_form"><table><tr><td><input id="destination" value="B45:65:09:30"></td><td id="duration">24分钟 12秒</td></tr></table></form>');
    const arrival = current.child.document.getElementById('astro-empires-fleet-arrival').shadowRoot;
    ensure(arrival.textContent.includes('Estimated arrival') && arrival.textContent.includes('Server time'), 'Arrival should use English independently of the game language');
    await current.save('zh-CN');
    ensure(arrival.textContent.includes('预计到达') && arrival.textContent.includes('服务器时间'), 'Existing arrival labels should translate live');
    current.close();

    saved = '{"language":"en"}';
    current = await page('combat.aspx?fleet=1327497&attack=1327637', reportPages.combat[0]);
    const copy = current.child.document.querySelector('.battle-report').nextElementSibling.shadowRoot;
    await current.click('Copy battle report BBCode', copy);
    const bbcode = current.state.copied;
    await current.save('zh-CN');
    ensure(copy.querySelector('[role=status]').textContent.includes('已复制战报'), 'An existing BBCode copy status should translate live');
    await current.click('复制战报 BBCode', copy);
    ensure(current.state.copied === bbcode, 'Changing interface language should preserve the original report language');
    const combat = current.child.document.getElementById('astro-empires-fleet-actions').shadowRoot;
    await current.click('AEBits 战斗计算器', combat);
    ensure(new URL(current.state.opened.at(-1)[0]).pathname === '/zh/aeBattleCalc', 'Combat import should use Chinese when selected');
    await current.save('en');
    ensure(combat.querySelector('[role=status]').textContent.includes('confirm these fields'), 'Existing combat notices should translate live');
    await current.click('AEBits Battle Calculator', combat);
    ensure(new URL(current.state.opened.at(-1)[0]).pathname === '/en/aeBattleCalc', 'Combat import should use English when selected');
    current.close();

    const translations = [
        ['攻击舰队', 'Attack Force'], ['防御舰队', 'Defensive Force'], ['玩家', 'Player'], ['舰队名称', 'Fleet Name'],
        ['初始防御', 'Start Defenses'], ['战后防御', 'End Defenses'], ['指挥中心', 'Command Centers'], ['指挥官', 'Commander'],
        ['建筑精通', 'Construction'], ['科研精通', 'Research'], ['生产精通', 'Production'],
        ['防御精通', 'Defense'], ['战术精通', 'Tactical'], ['后勤精通', 'Logistics'],
        ['战斗机', 'Fighters'], ['轰炸机', 'Bombers'], ['炮艇', 'Corvette'], ['侦察机', 'Scout Ship'],
        ['舰队级母舰', 'Fleet Carrier'], ['无畏舰', 'Dreadnought'], ['离子炮塔', 'Ion Turrets'],
        ['裂解炮塔', 'Disruptor Turrets'], ['行星护盾', 'Planetary Shield'], ['女神的项链', 'Planetary Ring'],
        ['舰船', 'Unit'], ['初始数量', 'Start Quant.'], ['战后数量', 'End Quant.'], ['攻击', 'Attack'], ['装甲', 'Armour'], ['护盾', 'Shield'],
    ];
    const cases = [{ html: combatBase.html, commander: '建筑精通',
        technologies: 'ARM:24,CC:3,DIS:5,ION:12,LAS:23,MIS:22,PHO:10,SLD:15',
        forces: 'FT:2136,BO:300,CV:11,SS:1,FC:4,DN:1,IT:15,DT:15,PS:5,PR:10' }];
    cases.push({ ...cases[0], html: combatBase.html.replace(
        '<tr class="battle-report_subtitle"><th colspan="2">攻击舰队</th></tr>',
        '<tr><th colspan="2">攻击舰队</th></tr>') });
    cases.push({ ...cases[0], html: combatBase.html.replace('攻击舰队</th></tr>',
        '攻击舰队</th></tr><tr><td>指挥中心</td><td>99</td></tr><tr><td>指挥官</td><td>Commander (战术精通 14)</td></tr>') });
    for (const [commander, shipAttack, defenseAttack, defenseArmour, bonus] of [
        ['建筑精通', 4.94, 6.4, 4400, ''], ['科研精通', 4.94, 6.4, 4400, ''],
        ['生产精通', 4.94, 6.4, 4400, ''], ['后勤精通', 4.94, 6.4, 4400, ''],
        ['防御精通', 4.94, 7.3, 5016, 'DfC:14'], ['战术精通', 5.55, 6.4, 4400, 'TaC:14'],
    ]) {
        const minimal = document.createElement('div');
        minimal.innerHTML = combatBase.html.replace('建筑精通', commander);
        for (const row of [...minimal.querySelector('.battle-report_defense').rows]) {
            if (row.cells[0].tagName !== 'TD') continue;
            if (row.cells[0].textContent === '战斗机') row.cells[3].textContent = shipAttack;
            else if (row.cells[0].textContent === '行星护盾') {
                row.cells[3].textContent = defenseAttack; row.cells[4].textContent = defenseArmour;
            } else row.remove();
        }
        cases.push({ html: minimal.innerHTML, commander, forces: 'FT:2136,PS:5',
            technologies: ['ARM:24', 'CC:3', 'ION:12', 'LAS:23', 'SLD:15', bonus].filter(Boolean).sort().join(',') });
    }
    for (const locale of ['zh-CN', 'en']) for (const englishPage of [false, true]) for (const sample of cases) {
        saved = JSON.stringify({ language: locale });
        const html = englishPage ? translations.reduce((text, [from, to]) => text.replaceAll(from, to), sample.html) : sample.html;
        current = await page('combat.aspx?fleet=1329837&attack=base&mission=conquer', html);
        const english = locale === 'en';
        const toolbar = current.child.document.getElementById('astro-empires-fleet-actions').shadowRoot;
        await current.click(english ? 'AEBits Battle Calculator' : 'AEBits 战斗计算器', toolbar);
        const direct = new URL(current.state.opened.at(-1)[0]);
        const sorted = (url, key) => url.searchParams.get(key).split(',').sort().join(',');
        ensure(sorted(direct, 'aT') === 'ARM:25,LAS:23' && sorted(direct, 'dT') === sample.technologies &&
            direct.searchParams.get('aS') === 'SS:1' && direct.searchParams.get('dS') === sample.forces && direct.searchParams.get('gv') === '5',
            'Base combat import should use the correct commander bonuses, rounded statistics and forces: ' + sample.commander);
        const copyRoot = current.child.document.querySelector('.battle-report').nextElementSibling.shadowRoot;
        await current.click(english ? 'Copy battle report BBCode' : '复制战报 BBCode', copyRoot);
        const commander = englishPage ? translations.find(([from]) => from === sample.commander)[1] : sample.commander;
        ensure(current.state.copied.includes(commander + ' 14') &&
            current.state.copied.includes((englishPage ? 'Command Centers' : '指挥中心') + '：3'),
            'Copied BBCode should preserve the source commander text and command centers');
        if (!englishPage && sample === cases[0]) ensure(current.state.copied === combatBase.bbcode, 'Attachment BBCode should preserve its complete table data');
        await current.analyze(current.state.copied);
        const sides = current.root.querySelectorAll('.side');
        const pending = english ? 'Needs confirmation' : '待确认';
        ensure(sides[0].textContent.includes(pending) && sides[0].textContent.includes('(SLD)') && !sides[1].textContent.includes(pending),
            'Only the attacker shield should remain unresolved in the base examples');
        await current.click(english ? 'Import into AEBits Battle Calculator' : '导入 AEBits 战斗模拟器');
        const analyzed = new URL(current.state.opened.at(-1)[0]);
        ensure(analyzed.pathname === (english ? '/en/aeBattleCalc' : '/zh/aeBattleCalc') &&
            ['aS', 'dS', 'aT', 'dT', 'gv'].every(key => analyzed.searchParams.get(key) === direct.searchParams.get(key)),
            'Direct combat import and BBCode import should match independently of page and interface languages');
        current.close();
    }

    const mixedFleet = fleetFractional.replace('</tbody>',
        '<tr><td>战斗机</td><td>0.01</td></tr><tr><td>轰炸机</td><td>1,000.25</td></tr></tbody>');
    const tab = String.fromCharCode(9), newline = String.fromCharCode(10);
    for (const locale of ['zh-CN', 'en']) for (const mixed of [false, true]) {
        saved = JSON.stringify({ language: locale });
        current = await page('fleet.aspx?fleet=1282779', mixed ? mixedFleet : fleetFractional);
        const host = current.child.document.getElementById('astro-empires-fleet-actions');
        ensure(host?.shadowRoot && current.child.document.querySelector('#fleet_overview table.listing').nextElementSibling === host,
            'Fractional fleet attachment should mount its toolbar below the ship table');
        const toolbar = host.shadowRoot;
        current.run(); await settle();
        ensure(current.child.document.querySelectorAll('#astro-empires-fleet-actions').length === 1,
            'Fractional fleet initialization should not duplicate its toolbar');
        const english = locale === 'en';
        const chineseText = ['重型巡洋舰' + tab + '337.9', ...(mixed ? ['战斗机' + tab + '0.01', '轰炸机' + tab + '1000.25'] : [])].join(newline);
        const englishText = ['Heavy Cruiser' + tab + '337.9', ...(mixed ? ['Fighters' + tab + '0.01', 'Bombers' + tab + '1000.25'] : [])].join(newline);
        current.state.blocked = true;
        await current.click(english ? 'Copy fleet data' : '复制舰队资料', toolbar);
        await current.click(english ? 'English' : '英文', toolbar);
        const backup = toolbar.querySelector('textarea');
        ensure(!backup.hidden && backup.value === englishText && toolbar.activeElement === backup && backup.selectionEnd === englishText.length,
            'Clipboard rejection should preserve and select all fractional fleet data');
        current.state.blocked = false;
        for (const [label, expected] of [[english ? 'Simplified Chinese' : '简体中文', chineseText], [english ? 'English' : '英文', englishText]]) {
            await current.click(english ? 'Copy fleet data' : '复制舰队资料', toolbar);
            await current.click(label, toolbar);
            ensure(current.state.copied === expected && backup.hidden, 'Both fleet copy languages should retain fractional counts and row order');
        }
        for (const [label, key, other] of [[english ? 'Attacker' : '攻方', 'aS', 'dS'], [english ? 'Defender' : '守方', 'dS', 'aS']]) {
            await current.click(english ? 'AEBits Battle Calculator' : 'AEBits 战斗计算器', toolbar);
            await current.click(label, toolbar);
            const calculator = new URL(current.state.opened.at(-1)[0]);
            ensure(calculator.searchParams.get(key) === 'HC:337.9' + (mixed ? ',FT:0.01,BO:1000.25' : '') &&
                !calculator.searchParams.has(other) && calculator.searchParams.get('gv') === '5',
                'Fractional ships should import into only the selected side without rounding');
        }
        current.close();
    }
    for (const count of ['0', '-1', '1.234', 'invalid', '9007199254740992']) {
        current = await page('fleet.aspx?fleet=1282779', fleetFractional.replace('337.9', count));
        ensure(!current.child.document.getElementById('astro-empires-fleet-actions'), 'A fleet without valid positive quantities should keep its toolbar hidden');
        current.close();
    }
    for (const path of ['fleet.aspx?fleet=0', 'fleet.aspx?fleet=-1', 'fleet.aspx?fleet=1.5', 'fleet.aspx',
        'fleet.aspx?fleet=1282779&view=move', 'base.aspx?fleet=1282779']) {
        current = await page(path, fleetFractional);
        ensure(!current.child.document.getElementById('astro-empires-fleet-actions'), 'Fractional fleets must obey the existing page and fleet ID guards');
        current.close();
    }
    current = await page('base.aspx', fleetFractional);
    current.child.Function('location', program)(new URL('https://altair.astroempires.com/fleet.aspx?fleet=1282779'));
    ensure(!current.child.document.getElementById('astro-empires-fleet-actions'), 'Fractional fleets must remain restricted to Borealis');
    current.close();

    const baseResponse = (url, html) => ({ ok: true, url, async text() { return html; } });
    for (const [key, id, economy, count, reason] of [
        ['playerZh', '26956', 133, 11, ''], ['playerEn', '26956', 133, 11, ''],
        ['npcZh', '20404', 206, null, 'NPC'], ['npcEn', '20404', 206, null, 'NPC'],
        ['occupiedZh', '21702', 126, null, '100'], ['occupiedEn', '21702', 126, null, '100'],
    ]) {
        for (const locale of ['zh-CN', 'en']) {
            saved = JSON.stringify({ language: locale });
            current = await page('base.aspx?base=' + id, basePages[key]);
            const estimate = current.child.document.getElementById('astro-empires-base-estimate')?.shadowRoot;
            ensure(estimate && estimate.querySelector('span').textContent === (count === null ? (locale === 'en' ? 'Unavailable' : '无法取得') : String(count)),
                'Base page should show the inferred count or an unavailable result: ' + key);
            ensure(!reason || estimate.textContent.includes(reason), 'Base page should explain NPC and recent pillage exclusions');
            current.run(); await settle();
            ensure(current.child.document.querySelectorAll('#astro-empires-base-estimate').length === 1 && current.state.requests.length === 0,
                'Base display should initialize once and only read the current page');
            await current.save(locale === 'en' ? 'zh-CN' : 'en');
            ensure(estimate.querySelector('strong').textContent.includes(locale === 'en' ? '预计所有者基地数量' : "Estimated owner's base count"),
                'Base estimate labels should follow live language changes');
            ensure(current.child.document.head.innerHTML === current.head, 'Base estimate styles must remain in Shadow DOM');
            current.close();

            saved = JSON.stringify({ language: locale });
            const report = combatBase.html.replace('<td>基地</td><td>1</td>', '<td>基地</td><td>' + id + '</td>');
            current = await page('combat.aspx?fleet=1329837&attack=base', report, storage, async url => baseResponse(url, basePages[key]));
            const toolbar = current.child.document.getElementById('astro-empires-fleet-actions').shadowRoot;
            current.run(); await settle();
            ensure(current.state.requests.length === 1, 'Combat base data should be fetched once despite repeated initialization');
            const request = current.state.requests[0];
            ensure(request.url === 'https://borealis.astroempires.com/base.aspx?base=' + id && request.options.credentials === 'same-origin' &&
                !request.options.method && request.options.signal, 'Combat base reads must use a same-origin GET without action parameters and with a timeout');
            await current.click(locale === 'en' ? 'AEBits Battle Calculator' : 'AEBits 战斗计算器', toolbar);
            const calculator = new URL(current.state.opened.at(-1)[0]);
            const importedCount = key.startsWith('npc') ? 8 : count;
            const income = key.startsWith('occupied') ? 89 : economy;
            ensure(calculator.searchParams.get('p') === 'economy:' + economy + ',income:' + income + (importedCount === null ? '' : ',defenderBase:' + importedCount) &&
                calculator.searchParams.get('aS') === 'SS:1' && calculator.searchParams.get('dS').startsWith('FT:2136') &&
                calculator.searchParams.get('dT').includes('CC:3'), 'Base import should preserve fleets and technologies while adding only known economy fields');
            ensure(!reason || [...toolbar.querySelectorAll('[role=status]')].some(status => status.textContent.includes(key.startsWith('npc') ? '8' : reason)),
                'Unknown base counts should remain visible as manual confirmation notices');
            current.close();
        }
    }
    for (const name of ['联合殖民地', 'United Colonies']) {
        const html = basePages.playerEn.replace('[BEX] Drekons Revenge', name);
        current = await page('base.aspx?base=26956', html);
        ensure(current.child.document.getElementById('astro-empires-base-estimate').shadowRoot.textContent.includes('NPC'),
            'United Colonies names should be recognized as NPC without relying on player IDs');
        current.close();
        current = await page('combat.aspx?fleet=1329837&attack=base', combatBase.html, storage, async url => baseResponse(url, html));
        const toolbar = current.child.document.getElementById('astro-empires-fleet-actions').shadowRoot;
        await current.click('AEBits Battle Calculator', toolbar);
        ensure(new URL(current.state.opened.at(-1)[0]).searchParams.get('p') === 'economy:133,income:133',
            'United Colonies should import known income and economy without a base count');
        current.close();
    }
    current = await page('combat.aspx?fleet=1329837&attack=base', combatBase.html, storage,
        async url => baseResponse(url, basePages.playerEn.replace('>133</div>', '>0/133</div>')));
    const zeroIncomeToolbar = current.child.document.getElementById('astro-empires-fleet-actions').shadowRoot;
    await current.click('AEBits Battle Calculator', zeroIncomeToolbar);
    ensure(new URL(current.state.opened.at(-1)[0]).searchParams.get('p') === 'economy:133,income:0',
        'Zero income should be sent explicitly without being replaced by economy');
    current.close();
    let finishBase;
    current = await page('combat.aspx?fleet=1329837&attack=base', combatBase.html, storage,
        url => new Promise(resolve => { finishBase = () => resolve(baseResponse(url, basePages.playerEn)); }));
    const loadingToolbar = current.child.document.getElementById('astro-empires-fleet-actions').shadowRoot;
    const calculatorButton = loadingToolbar.querySelectorAll('.actions > div > button, .actions > button')[1];
    ensure(calculatorButton.disabled, 'AEBits should wait for the bounded base read');
    await current.click('Copy fleet data', loadingToolbar); await current.click('Attacker English', loadingToolbar);
    ensure(current.state.copied === 'Scout Ship' + tab + '1', 'Copying should stay available while base data loads');
    finishBase(); await settle();
    ensure(!calculatorButton.disabled, 'AEBits should become available when the base read finishes');
    current.close();

    for (const fetchBase of [
        async () => { throw new Error('Network failure'); },
        async () => { throw new DOMException('Timeout', 'TimeoutError'); },
        async url => ({ ...baseResponse(url, basePages.playerEn), ok: false }),
        async () => baseResponse('https://borealis.astroempires.com/login.aspx', basePages.playerEn),
        async url => baseResponse(url, '<p>Login required</p>'),
        async url => baseResponse(url, basePages.playerEn.replace('>133</div>', '>89/invalid</div>')),
        async url => baseResponse(url.replace('base=1', 'base=2'), basePages.playerEn),
    ]) {
        saved = '{"language":"en"}';
        current = await page('combat.aspx?fleet=1329837&attack=base', combatBase.html, storage, fetchBase);
        const toolbar = current.child.document.getElementById('astro-empires-fleet-actions').shadowRoot;
        await current.click('AEBits Battle Calculator', toolbar);
        const calculator = new URL(current.state.opened.at(-1)[0]);
        ensure(!calculator.searchParams.has('p') && calculator.searchParams.get('aS') === 'SS:1' && toolbar.textContent.includes('Could not read'),
            'Failed base reads must omit all pillage fields without blocking fleet import');
        current.close();
    }
    current = await page('combat.aspx?fleet=1329837&attack=base', combatBase.html.replace('<tr><td>基地</td><td>1</td></tr>', ''));
    ensure(current.state.requests.length === 0, 'Missing target IDs must not trigger a guessed base request');
    current.close();
    for (const attack of ['fleet', '1327637']) {
        current = await page('combat.aspx?fleet=1329837&attack=' + attack, combatBase.html);
        ensure(current.state.requests.length === 0, 'Fleet attacks must not fetch base data');
        current.close();
    }
}

async function verifyAnalyzer() {
    const execute = new Function('location', 'FontFace', 'document', 'window', program);
    const ensure = (condition, message) => { if (!condition) throw new Error(message); };
    const settle = () => new Promise(resolve => setTimeout(resolve, 0));
    const id = 'astro-empires-report-analyzer';
    const head = document.head.innerHTML;
    let finishFont, fontRequests = 0;
    const registeredFonts = [];
    const opened = [];
    const targetWindow = { open: (...args) => opened.push(args) };
    class DeferredFontFace {
        constructor(family, source) {
            this.family = family;
            ensure(source.includes('https://fonts.gstatic.com/s/materialicons/v145/'), 'Expected the pinned Google Fonts source');
            fontRequests++;
        }
        load() { return new Promise(resolve => { finishFont = () => resolve(this); }); }
    }
    const testDocument = new Proxy(document, { get(target, key) {
        if (key === 'fonts') return { add(font) { registeredFonts.push(font); } };
        const value = Reflect.get(target, key, target);
        return typeof value === 'function' ? value.bind(target) : value;
    } });
    const run = (href, font = DeferredFontFace) => execute(new URL(href), font, testDocument, targetWindow);
    run('https://altair.astroempires.com/base.aspx');
    ensure(!document.getElementById(id), 'Analyzer must be restricted to Borealis');
    run('https://borealis.astroempires.com/base.aspx');
    run('https://borealis.astroempires.com/base.aspx');
    const host = document.getElementById(id);
    const root = host.shadowRoot;
    const panel = root.querySelector('.panel');
    const menu = root.querySelector('.feature-list');
    const analysisButton = menu.querySelector('button');
    ensure(analysisButton.textContent === '分析 BBCode' && panel.querySelector('h2').textContent === 'BBCode 战报分析',
        'Analyzer entry and title should identify BBCode input');
    const trigger = root.querySelector('.trigger');
    const textarea = root.querySelector('textarea');
    const analyze = [...root.querySelectorAll('button')].find(button => button.textContent === '分析');
    const input = text => {
        textarea.value = text;
        textarea.dispatchEvent(new Event('input'));
    };
    const readLevels = () => Object.fromEntries([...root.querySelector('.side').querySelectorAll('dt')]
        .map(element => [element.textContent, element.nextElementSibling.textContent]));
    const importButton = () => [...root.querySelectorAll('button')].find(button => button.textContent === '导入 AEBits 战斗模拟器');
    const importedParams = () => {
        const [href, target, options] = opened.at(-1);
        const calculator = new URL(href);
        ensure(calculator.origin + calculator.pathname === 'https://aebits.win/zh/aeBattleCalc' &&
            calculator.searchParams.get('gv') === '5' && target === '_blank' && options === 'noopener,noreferrer',
            'Analyzer import should open the Chinese calculator safely with game version 5');
        return calculator.searchParams;
    };
    ensure(document.querySelectorAll('#' + id).length === 1 && panel.hidden && menu.hidden && fontRequests === 1,
        'Expected one initially closed feature menu and one font request');
    ensure(getComputedStyle(host).position === 'fixed' && getComputedStyle(host).right === '16px' &&
        getComputedStyle(host).bottom === '16px' && getComputedStyle(trigger).borderRadius === '50%', 'Expected a round fixed bottom-right button');
    ensure(getComputedStyle(trigger).display !== 'none', 'Host button styles must not hide the floating button');
    ensure(trigger.textContent === '↑' && trigger.getAttribute('aria-label') === '打开功能菜单' &&
        trigger.querySelector('span').getAttribute('aria-hidden') === 'true', 'Loading font should show the accessible arrow fallback');
    trigger.click();
    await settle();
    ensure(!menu.hidden && panel.hidden && root.activeElement === analysisButton && trigger.textContent === '×',
        'Opening the feature list should show the close fallback and focus its function button');
    const menuBounds = menu.getBoundingClientRect();
    ensure(menuBounds.left >= 0 && menuBounds.right <= innerWidth, 'Feature menu should fit the viewport');
    finishFont();
    await settle();
    ensure(registeredFonts.length === 1 && registeredFonts[0].family === 'Astro Empires Material Icons' &&
        trigger.querySelector('.material-icons').textContent === 'close', 'Successful font load should register a private family and show the close icon');
    ensure(getComputedStyle(trigger.querySelector('.material-icons')).fontSize === '24px', 'Material icon should use 24px sizing');
    trigger.click();
    await settle();
    ensure(menu.hidden && panel.hidden && root.activeElement === trigger &&
        trigger.querySelector('.material-icons').textContent === 'keyboard_arrow_up', 'Floating close should collapse the menu');
    trigger.click();
    await settle();
    analysisButton.click();
    await settle();
    ensure(!panel.hidden && root.activeElement === textarea, 'Opening analyzer should focus the input');
    ensure(!importButton(), 'AEBits import should appear only after successful analysis');
    ensure(menu.hidden && trigger.querySelector('.material-icons').textContent === 'close', 'Analyzer should replace the list and keep the close icon');
    const bounds = panel.getBoundingClientRect();
    ensure(bounds.left >= 0 && bounds.right <= innerWidth && bounds.top >= 0 && bounds.bottom <= innerHeight,
        'Analyzer should fit the viewport');
    analyze.click();
    await settle();
    ensure(root.querySelector('[role=status]').textContent.includes('请先粘贴'), 'Empty report should show a prompt');
    input(reportFixture.information + reportFixture.tables);
    await settle();
    analyze.click();
    await settle();
    const levels = readLevels();
    ensure(Object.keys(levels).length === 5 && levels['装甲 (ARM)'] === '24' && levels['激光 (LAS)'] === '23' &&
        levels['等离子电浆 (PLA)'] === '16' && levels['离子 (ION)'] === '12' && levels['护盾 (SLD)'] === '15',
        'Full report technology results should match the supplied example');
    ensure(root.querySelectorAll('.side')[1].textContent.includes('指挥中心 (CC)5') &&
        root.querySelectorAll('.side')[1].textContent.includes('防御受损'), 'Defender should show CC and damaged defense limitations');
    importButton().click();
    await settle();
    const fullParams = importedParams();
    ensure(fullParams.get('aS') === 'FT:135878,CV:6601,DE:4629,IF:14272,BS:469,FC:181' &&
        fullParams.get('dS') === 'PS:0.01,PR:0.01', 'Analyzer should import both initial fleets including destroyed fractional defenses');
    ensure(fullParams.get('aT').split(',').sort().join(',') === 'ARM:24,ION:12,LAS:23,PLA:16,SLD:15' &&
        fullParams.get('dT') === 'CC:5', 'Analyzer should import only confirmed technology and explicit modifiers');
    textarea.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    await settle();
    ensure(panel.hidden && !menu.hidden && root.activeElement === analysisButton, 'Esc should return to the function list');
    analysisButton.click();
    await settle();
    ensure(textarea.value === reportFixture.information + reportFixture.tables && readLevels()['装甲 (ARM)'] === '24',
        'Reopening analyzer should preserve report and result');
    trigger.click();
    await settle();
    ensure(menu.hidden && panel.hidden && root.activeElement === trigger, 'Floating close should collapse the analyzer');
    trigger.click();
    await settle();
    analysisButton.click();
    await settle();
    ensure(textarea.value === reportFixture.information + reportFixture.tables && readLevels()['装甲 (ARM)'] === '24',
        'Floating close should preserve input and results');
    const staleImport = importButton();
    const beforeEditing = opened.length;
    input(reportFixture.tables);
    await settle();
    staleImport.click();
    ensure(!importButton() && !root.querySelector('.results') && opened.length === beforeEditing,
        'Editing the input should clear results and prevent stale imports');
    analyze.click();
    await settle();
    ensure(Object.keys(readLevels()).length === 5 && !root.querySelector('.side').textContent.includes('待确认') &&
        root.querySelectorAll('.side')[1].textContent.includes('基地防御受损'),
        'Partial reports should infer attacker weapons without base bonuses while leaving defender limitations unresolved');
    importButton().click();
    await settle();
    const partialParams = importedParams();
    ensure(partialParams.get('aT') === 'LAS:23,ARM:24,PLA:16,ION:12,SLD:15' && !partialParams.has('dT') &&
        partialParams.get('dS') === 'PS:0.01,PR:0.01' && root.querySelectorAll('.side')[1].textContent.includes('基地防御受损'),
        'Partial analysis should still import fleets while keeping unresolved notices');
    const tab = String.fromCharCode(9), newline = String.fromCharCode(10);
    for (const [source, reason] of [
        [reportFixture.tables.replace('炮艇', '未知舰船'), '未识别单位「未知舰船」'],
        [reportFixture.tables.replace('炮艇' + tab + '6601', '炮艇' + tab + 'invalid'), '初始数量无效'],
        [reportFixture.tables.replace(['6601','6601','8.6','11','0'].join(tab), ['6601','6601','8.6','11'].join(tab)), '兵力列不完整'],
    ]) {
        input(source);
        await settle();
        analyze.click();
        await settle();
        const beforeImport = opened.length;
        importButton().click();
        await settle();
        ensure(opened.length === beforeImport && root.querySelector('[role=status]').textContent.includes(reason),
            'Invalid or unknown fleet rows should block import with the affected unit and reason');
    }
    input(['[b]Defensive Force[/b]', '[code]', ['Ships','Start','End','Attack','Armour','Shield'].join(tab),
        ['Leviathan','2','0','15750','15246','68'].join(tab), '[/code]'].join(newline));
    await settle();
    analyze.click();
    await settle();
    importButton().click();
    await settle();
    const singleParams = importedParams();
    ensure(singleParams.get('dS') === 'LE:2' && !singleParams.has('aS') && !singleParams.has('aT'),
        'A single-side report should use LE and preserve initial counts after destruction');
    input('[code]Ships');
    await settle();
    analyze.click();
    await settle();
    ensure(!root.querySelector('.results') && root.querySelector('[role=status]').textContent.includes('缺少结束标签'),
        'Malformed BBCode should clear the previous result and explain the missing closing tag');
    input('<img src=x onerror="window.reportInjected=true"><script>window.reportInjected=true</' + 'script>');
    await settle();
    analyze.click();
    await settle();
    ensure(!root.querySelector('.results') && root.querySelector('[role=status]').textContent.includes('没有可识别') &&
        !window.reportInjected && !root.querySelector('img,script'), 'Invalid text should clear results and remain plain text');
    root.querySelector('[aria-label="关闭战报分析"]').click();
    await settle();
    ensure(panel.hidden && !menu.hidden && root.activeElement === analysisButton, 'Panel close should return to the function list');
    analysisButton.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    await settle();
    ensure(menu.hidden && root.activeElement === trigger && document.head.innerHTML === head,
        'Menu Esc should collapse all content without adding page styles');
    host.remove();
    class FailedFontFace extends DeferredFontFace {
        load() { return Promise.reject(new Error('Font blocked')); }
    }
    run('https://borealis.astroempires.com/base.aspx', FailedFontFace);
    await settle();
    const failedHost = document.getElementById(id);
    const failedRoot = failedHost.shadowRoot;
    const failedTrigger = failedRoot.querySelector('.trigger');
    ensure(failedTrigger.textContent === '↑', 'Font failure should retain the arrow fallback');
    failedTrigger.click();
    await settle();
    ensure(failedTrigger.textContent === '×' && !failedRoot.querySelector('.feature-list').hidden,
        'Feature menu should remain usable when font loading fails');
    failedRoot.querySelector('.feature-list button').click();
    await settle();
    ensure(!failedRoot.querySelector('.panel').hidden, 'Analyzer should open even when font loading fails');
    failedHost.remove();
}

async function verifyReportCopy() {
    const execute = new Function('location', 'navigator', 'window', program);
    const ensure = (condition, message) => { if (!condition) throw new Error(message); };
    const settle = () => new Promise(resolve => setTimeout(resolve, 0));
    const fixture = document.createElement('div');
    document.body.append(fixture);
    let copied, opened, blocked = false;
    const targetWindow = { open: href => { opened = new URL(href); } };
    const navigatorMock = { clipboard: { async writeText(text) {
        if (blocked) throw new Error('Clipboard denied');
        copied = text;
    } } };
    const hostFor = report => report.nextElementSibling;
    const marker = 'data-astro-empires-report-copy';
    const head = document.head.innerHTML;
    const newline = String.fromCharCode(10), tab = String.fromCharCode(9);
    let boardFirst, combatBbcode;
    const pages = [
        ...Object.entries(reportPages).map(([page, reports]) => ({ page, reports, expected: { messages: 14, board: 15, combat: 1 }[page], english: false })),
        ...Object.entries(englishReportPages).map(([page, reports]) => ({ page, reports, expected: { messages: 14, board: 13 }[page], english: true })),
    ];
    for (const { page, reports, expected: count, english } of pages) {
        fixture.innerHTML = reports.join('');
        if (page === 'messages') {
            execute(new URL('https://borealis.astroempires.com/base.aspx'), navigatorMock, targetWindow);
            ensure(!fixture.querySelector('[' + marker + ']'), 'Copy controls should be limited to messages, board and combat pages');
        }
        const url = new URL('https://borealis.astroempires.com/' + page + '.aspx' +
            (page === 'combat' ? '?fleet=1327497&attack=1327637&code=regression-test-code' : ''));
        execute(url, navigatorMock, targetWindow);
        execute(url, navigatorMock, targetWindow);
        await settle();
        const roots = [...fixture.querySelectorAll('.battle-report')];
        ensure(roots.length === count, 'Expected every supplied report fixture');
        ensure(fixture.querySelectorAll('[' + marker + ']').length === roots.length, 'Each report should get exactly one copy control');
        for (const [index, report] of roots.entries()) {
            const original = report.innerHTML;
            const shadow = hostFor(report).shadowRoot;
            ensure(hostFor(report).hasAttribute(marker) && shadow, 'Copy controls should follow each report in Shadow DOM');
            const button = shadow.querySelector('button');
            ensure(button.type === 'button' && getComputedStyle(button).display !== 'none', 'Copy button must work inside forms and hostile page CSS');
            button.click();
            await settle();
            ensure(shadow.querySelector('[role=status]').textContent.includes('已复制'), 'Report copy should show success');
            ensure(report.innerHTML === original, 'Conversion should preserve the source report');
            const tables = [...report.querySelectorAll('.battle-report_attack,.battle-report_defense')];
            const blocks = copied.split('[code]').slice(1).map(block => block.split('[/code]')[0].trim());
            const expected = tables.map(table => [...table.rows].filter(row => row.cells.length === 6)
                .map(row => [...row.cells].map(cell => cell.textContent.trim())));
            ensure(JSON.stringify(blocks.map(block => block.split(newline).map(line => line.split(tab)))) === JSON.stringify(expected),
                'All six columns, decimal counts and destroyed units should survive conversion');
            for (const link of report.querySelectorAll('a')) {
                ensure(copied.includes('[url=' + link.href + ']' + link.textContent + '[/url]'), 'Every report link should survive conversion');
            }
            const plain = copied.split('[b]').join('').split('[/b]').join('');
            for (const summary of report.querySelectorAll(':scope > center')) {
                ensure(plain.includes(summary.textContent.trim()), 'Report outcome text should survive conversion');
            }
            if (english) {
                const analyzer = document.getElementById('astro-empires-report-analyzer').shadowRoot;
                if (analyzer.querySelector('.panel').hidden) {
                    analyzer.querySelector('.trigger').click(); await settle();
                    analyzer.querySelector('.feature-list button').click(); await settle();
                }
                const input = analyzer.querySelector('textarea');
                input.value = copied;
                input.dispatchEvent(new Event('input')); await settle();
                [...analyzer.querySelectorAll('button')].find(button => button.textContent === '分析').click(); await settle();
                ensure(analyzer.querySelector('.results'), 'English page BBCode with a Unit header should produce analysis results');
                const importButton = [...analyzer.querySelectorAll('button')].find(button => button.textContent === '导入 AEBits 战斗模拟器');
                opened = null;
                importButton.click(); await settle();
                ensure(opened, 'Every supplied English report should import into AEBits');
                for (const [side, table] of [['aS', tables[0]], ['dS', tables[1]]]) {
                    const initial = [...table.rows].filter(row => row.cells.length === 6 && row.cells[0].tagName === 'TD')
                        .map(row => Number(row.cells[1].textContent.replaceAll(',', '').trim()));
                    const quantities = (opened.searchParams.get(side) ?? '').split(',').filter(Boolean).map(unit => Number(unit.split(':')[1]));
                    ensure(JSON.stringify(quantities) === JSON.stringify(initial), 'English BBCode import must preserve all initial quantities');
                }
            }
            if (!english && page === 'board' && index === 0) boardFirst = copied;
            if (page === 'combat') {
                combatBbcode = copied;
                const codeRows = blocks.flatMap(block => block.split(newline).slice(1));
                ensure(codeRows.length === 9 && codeRows.every(row => row.split(tab)[2] === '?'),
                    'Combat BBCode should preserve every unknown post-battle count');
                ensure(!copied.includes('复制舰队资料') && !copied.includes('AEBits'), 'BBCode must contain report data without toolbar text');
                const toolbar = document.getElementById('astro-empires-fleet-actions').shadowRoot;
                ensure(toolbar.querySelector('[aria-label="复制舰队资料"]') && toolbar.querySelector('[aria-label="AEBits 战斗计算器"]'),
                    'Existing combat actions should coexist with the BBCode copy control');
            }
        }
        const first = roots[0], shadow = hostFor(first).shadowRoot;
        const name = first.querySelector('.battle-report_info a');
        name.textContent += ' updated';
        blocked = true;
        shadow.querySelector('button').click();
        await settle();
        const backup = shadow.querySelector('textarea');
        ensure(!backup.hidden && backup.value.includes(' updated') && backup.selectionEnd === backup.value.length && shadow.activeElement === backup,
            'Clipboard rejection should expose the current report as selected manual-copy text');
        const manualCopy = backup.value;
        blocked = false;
        shadow.querySelector('button').click();
        await settle();
        ensure(backup.hidden && copied === manualCopy,
            'Retry should copy the current report and hide fallback');
        const newReport = roots[0].cloneNode(true);
        fixture.append(newReport);
        await settle();
        ensure(hostFor(newReport)?.hasAttribute(marker) && fixture.querySelectorAll('[' + marker + ']').length === roots.length + 1,
            'Dynamically added reports should get one copy control');
        fixture.replaceChildren();
    }
    const analyzer = document.getElementById('astro-empires-report-analyzer').shadowRoot;
    if (!analyzer.querySelector('.panel').hidden) { analyzer.querySelector('.trigger').click(); await settle(); }
    analyzer.querySelector('.trigger').click();
    await settle();
    analyzer.querySelector('.feature-list button').click();
    await settle();
    const input = analyzer.querySelector('textarea');
    input.value = boardFirst;
    input.dispatchEvent(new Event('input'));
    await settle();
    [...analyzer.querySelectorAll('button')].find(button => button.textContent === '分析').click();
    await settle();
    const levels = Object.fromEntries([...analyzer.querySelector('.side').querySelectorAll('dt')]
        .map(element => [element.textContent, element.nextElementSibling.textContent]));
    ensure(levels['装甲 (ARM)'] === '24' && levels['激光 (LAS)'] === '23' && levels['等离子电浆 (PLA)'] === '16' &&
        levels['离子 (ION)'] === '12' && levels['护盾 (SLD)'] === '15', 'Generated board BBCode should analyze back to the expected attacker levels');
    ensure(analyzer.querySelectorAll('.side')[1].textContent.includes('指挥中心 (CC)5') &&
        analyzer.querySelectorAll('.side')[1].textContent.includes('防御受损'), 'Generated board BBCode should preserve defender modifiers and damage');
    input.value = combatBbcode;
    input.dispatchEvent(new Event('input'));
    await settle();
    [...analyzer.querySelectorAll('button')].find(button => button.textContent === '分析').click();
    await settle();
    [...analyzer.querySelectorAll('button')].find(button => button.textContent === '导入 AEBits 战斗模拟器').click();
    await settle();
    const params = opened.searchParams;
    ensure(params.get('aS') === 'SS:1' && params.get('dS') === 'FT:135870,BO:4080,CV:6601,RC:23999,DE:4629,IF:14272,BS:769,FC:281',
        'Copied combat BBCode should import initial counts even when post-battle counts are unknown');
    ensure(params.get('aT').split(',').sort().join(',') === 'ARM:25,LAS:23' &&
        params.get('dT').split(',').sort().join(',') === 'ARM:24,ION:12,LAS:23,MIS:22,PLA:16,SLD:15',
        'Copied combat BBCode should recover the screenshot technology levels');
    ensure(document.head.innerHTML === head, 'Report copy controls must not add page styles');
    document.getElementById('astro-empires-report-analyzer').remove();
    fixture.remove();
}

async function verify() {
    const head = document.head.innerHTML;
    const execute = new Function('location', 'navigator', 'window', program);
    const url = new URL('https://borealis.astroempires.com/fleet.aspx?fleet=1');
    let blocked = true, copied = '';
    const opened = [];
    const clipboard = { async writeText(text) { if (blocked) throw new Error('Clipboard denied'); copied = text; } };
    const targetWindow = { open: (...args) => opened.push(args) };
    execute(url, { clipboard }, targetWindow);
    execute(url, { clipboard }, targetWindow);

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
    const click = async label => {
        root.querySelector('button[aria-label="' + label + '"]').click();
        await new Promise(resolve => setTimeout(resolve, 0));
    };
    blocked = false;
    await click('复制舰队资料');
    await click('简体中文');
    ensure(copied === '战斗机\\t500' && backup.hidden, 'Chinese copy should succeed and hide the fallback');
    await click('复制舰队资料');
    await click('英文');
    ensure(copied === 'Fighters\\t500', 'English copy should keep the same counts');
    for (const [label, key, other] of [['攻方', 'aS', 'dS'], ['守方', 'dS', 'aS']]) {
        await click('AEBits 战斗计算器');
        await click(label);
        const [href, target, options] = opened.at(-1);
        const calculator = new URL(href);
        ensure(calculator.searchParams.get(key) === 'FT:500' && !calculator.searchParams.has(other) &&
            calculator.searchParams.get('gv') === '5' && target === '_blank' && options === 'noopener,noreferrer',
            'Fleet calculator should keep the chosen side and counts');
    }
}

async function verifyCombat() {
    const execute = new Function('location', 'navigator', 'window', program);
    const ensure = (condition, message) => { if (!condition) throw new Error(message); };
    const settle = () => new Promise(resolve => setTimeout(resolve, 0));
    const fixture = document.createElement('div');
    document.body.append(fixture);
    for (const labels of [
        ['攻击舰队', '防御舰队', '指挥中心', '指挥官', '初始防御', '防御精通', '炮艇', '战斗机', '行星护盾'],
        ['Attack Force', 'Defensive Force', 'Command Centers', 'Commander', 'Start Defenses', 'Defense', 'Corvette', 'Fighters', 'Planetary Shield'],
    ]) {
        document.getElementById('astro-empires-fleet-actions').remove();
        fixture.innerHTML = '<table class="battle-report_info">' +
            '<tr class="battle-report_subtitle"><th>' + labels[0] + '</th></tr>' +
            '<tr class="battle-report_subtitle"><th>' + labels[1] + '</th></tr>' +
            '<tr><td>' + labels[2] + '</td><td>9</td></tr>' +
            '<tr><td>' + labels[3] + '</td><td>Commander (' + labels[5] + ' 13)</td></tr>' +
            '<tr><td>' + labels[4] + '</td><td>100%</td></tr></table>' +
            '<table class="battle-report_attack"><tr><td>' + labels[6] + '</td><td>1</td><td>1</td><td>8.6</td><td>11.25</td><td>0</td></tr></table>' +
            '<table class="battle-report_defense"><tr><td>' + labels[7] + '</td><td>26400</td><td>1</td><td>6.09</td><td>4.4</td><td>0</td></tr>' +
            '<tr><td>' + labels[8] + '</td><td>0.01</td><td>0</td><td>7.23</td><td>4972</td><td>34</td></tr></table>';
        let copied, opened;
        execute(new URL('https://borealis.astroempires.com/combat.aspx?fleet=1&attack=base'),
            { clipboard: { async writeText(text) { copied = text; } } }, { open: href => { opened = new URL(href); } });
        const root = document.getElementById('astro-empires-fleet-actions').shadowRoot;
        const click = async label => { root.querySelector('button[aria-label="' + label + '"]').click(); await settle(); };
        await click('复制舰队资料');
        await click('守方 简体中文');
        ensure(copied === '战斗机\\t26400\\n行星护盾\\t0.01', 'Combat Chinese copy should use initial fractional counts');
        await click('复制舰队资料');
        await click('守方 英文');
        ensure(copied === 'Fighters\\t26400\\nPlanetary Shield\\t0.01', 'Combat English copy should keep the same initial fractional counts');
        await click('AEBits 战斗计算器');
        const params = opened.searchParams;
        const sorted = key => params.get(key).split(',').sort().join(',');
        ensure(params.get('aS') === 'CV:1' && params.get('dS') === 'FT:26400,PS:0.01' && params.get('gv') === '5',
            'Combat calculator rosters should remain correct');
        ensure(sorted('aT') === 'ARM:25,LAS:23' && sorted('dT') === 'ARM:24,CC:9,DfC:13,ION:12,LAS:22,SLD:14',
            'Combat technology inference should remain correct in both languages');
    }
    fixture.remove();
}

async function verifyCombatTargets() {
    const execute = new Function('location', 'navigator', 'window', program);
    const ensure = (condition, message) => { if (!condition) throw new Error(message); };
    const settle = () => new Promise(resolve => setTimeout(resolve, 0));
    const fixture = document.createElement('div');
    document.body.append(fixture);
    const id = 'astro-empires-fleet-actions';
    document.getElementById(id)?.remove();
    const defenderCounts = 'FT:135870,BO:4080,CV:6601,RC:23999,DE:4629,IF:14272,BS:769,FC:281';
    const defenderData = [
        ['Fighters', '战斗机', 135870, 4.3, 4.4, 0],
        ['Bombers', '轰炸机', 4080, 10.5, 4.4, 0],
        ['Corvette', '炮艇', 6601, 8.6, 11, 0],
        ['Recycler', '回收船', 23999, 4.3, 4.4, 0],
        ['Destroyer', '驱逐舰', 4629, 18, 17.6, 0],
        ['Ion Frigate', '离子驱逐舰', 14272, 22.4, 26.4, 1.75],
        ['Battleship', '战列舰', 769, 256, 281.6, 21],
        ['Fleet Carrier', '舰队级母舰', 281, 102.4, 211.2, 17.5],
    ];
    const tab = String.fromCharCode(9), newline = String.fromCharCode(10);
    for (const chinese of [true, false]) {
        const rows = defenderData.map(unit => '<tr><td>' + unit[chinese ? 1 : 0] + '</td><td>' + unit[2] +
            '</td><td>?</td><td>' + unit[3] + '</td><td>' + unit[4] + '</td><td>' + unit[5] + '</td></tr>').join('');
        fixture.innerHTML = '<table class="battle-report_info">' +
            '<tr class="battle-report_subtitle"><th>' + (chinese ? '攻击舰队' : 'Attack Force') + '</th></tr>' +
            '<tr class="battle-report_subtitle"><th>' + (chinese ? '防御舰队' : 'Defensive Force') + '</th></tr></table>' +
            '<table class="battle-report_attack"><tr><td>' + (chinese ? '侦察机' : 'Scout Ship') +
            '</td><td>1</td><td>?</td><td>2.15</td><td>4.5</td><td>0</td></tr></table>' +
            '<table class="battle-report_defense">' + rows + '</table>';

        for (const attack of ['base', 'fleet', '1327637', '1327637&code=regression-test-code', '1327637&mission=attack']) {
            let copied, opened;
            execute(new URL('https://borealis.astroempires.com/combat.aspx?fleet=1327497&attack=' + attack),
                { clipboard: { async writeText(text) { copied = text; } } }, { open: href => { opened = new URL(href); } });
            const host = document.getElementById(id);
            ensure(host?.shadowRoot && fixture.querySelector('.battle-report_defense').nextElementSibling === host,
                'Combat tools should appear below the defender table for target ' + attack);
            const root = host.shadowRoot;
            const click = async label => { root.querySelector('button[aria-label="' + label + '"]').click(); await settle(); };
            await click('复制舰队资料');
            await click('攻方 简体中文');
            ensure(copied === '侦察机' + tab + '1', 'Screenshot attacker should copy its initial count');
            for (const [language, column] of [['简体中文', 1], ['英文', 0]]) {
                await click('复制舰队资料');
                await click('守方 ' + language);
                ensure(copied === defenderData.map(unit => unit[column] + tab + unit[2]).join(newline),
                    'Screenshot defender copy should preserve order and initial counts despite unknown post-battle counts');
            }
            await click('AEBits 战斗计算器');
            const params = opened.searchParams;
            ensure(params.get('aS') === 'SS:1' && params.get('dS') === defenderCounts && params.get('gv') === '5',
                'Screenshot fleets should be assigned to their correct calculator sides');
            ensure(params.get('aT').split(',').sort().join(',') === 'ARM:25,LAS:23' &&
                params.get('dT').split(',').sort().join(',') === 'ARM:24,ION:12,LAS:23,MIS:22,PLA:16,SLD:15',
                'Screenshot technology should be inferred consistently for all target forms');
            host.remove();
        }
    }
    for (const attack of ['', '0', '-1', '1.5', 'unknown']) {
        execute(new URL('https://borealis.astroempires.com/combat.aspx?fleet=1327497&attack=' + attack), {}, {});
        ensure(!document.getElementById(id), 'Invalid combat target must not mount a toolbar');
    }
    execute(new URL('https://borealis.astroempires.com/combat.aspx?fleet=1327497'), {}, {});
    ensure(!document.getElementById(id), 'Missing combat target must not mount a toolbar');
    fixture.remove();
}

async function verifyArrival() {
    document.getElementById('astro-empires-fleet-actions')?.remove();
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

verifySettings().then(verifyAnalyzer).then(verifyReportCopy).then(verify).then(verifyCombat).then(verifyCombatTargets).then(verifyArrival).then(() => { document.body.dataset.result = 'pass'; }, error => {
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
        '--window-size=390,900',
        '--dump-dom', '--virtual-time-budget=10000', pathToFileURL(page).href,
    ], { encoding: 'utf8', timeout: 30_000, maxBuffer: 4_000_000 });
    if (result.error) throw result.error;
    assert.equal(result.status, 0, result.stderr);
    assert.match(result.stdout.match(/<body[^>]*>/)?.[0] ?? '', /data-result="pass"/);
    console.log('基地數量與經濟讀取、57 份既有戰報、36 組指揮官語言案例、雙語設定及既有功能通過瀏覽器測試。');
} finally {
    rmSync(directory, { recursive: true, force: true });
}
