import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import packageInfo from '../package.json' with { type: 'json' };
import lock from '../package-lock.json' with { type: 'json' };

const read = path => readFileSync(new URL(path, import.meta.url), 'utf8');
const comment = text => text.trimEnd().split(/\r?\n/).map(line => line ? `// ${line}` : '//').join('\n');

test('授權識別一致，安裝檔附帶完整 GPL 及第三方聲明', () => {
    const source = read('../dist/astroempires.user.js');
    assert.equal(packageInfo.license, 'GPL-3.0-or-later');
    assert.equal(lock.packages[''].license, packageInfo.license);
    assert.equal(lock.packages[''].version, packageInfo.version);
    assert.match(source, /^\/\/ @license\s+GPL-3\.0-or-later$/m);
    assert.ok(source.includes(comment(read('../LICENSE'))), '缺少完整 GPL 授權');
    assert.ok(source.includes('Copyright (C) 2026 simonkq1'));
    assert.ok(source.includes('(at your option) any later version.'));
    assert.ok(source.includes('but WITHOUT ANY WARRANTY;'));
    assert.ok(source.includes(`Source code (version ${packageInfo.version}): https://github.com/simonkq1/AstroEmpires-Enhance`));
    for (const name of ['@primevue/core', '@primevue/icons', 'primevue']) {
        assert.ok(source.includes(`// ## ${name} - 4.5.5 (MIT)`));
    }
    for (const name of ['styled', 'styles', 'utils']) {
        assert.ok(source.includes(comment(read(`../vendor/primeuix/${name}/LICENSE`))), `缺少 ${name} 授權`);
    }
});
