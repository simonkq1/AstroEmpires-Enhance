import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { build } from 'vite';
import packageInfo from '../package.json' with { type: 'json' };

const root = fileURLToPath(new URL('../', import.meta.url));
const dist = join(root, 'dist');
const check = process.argv[2] === '--check';
const outDir = check ? await mkdtemp(join(tmpdir(), 'astroempires-build-')) : dist;
const primeuixSource = 'https://github.com/primefaces/primeuix/tree/b9467bc448d35738d4f651dbc3caa4d4cb9a6a96/packages';

try {
    await build({ root, build: { outDir, emptyOutDir: !check } });
    const bundle = join(outDir, 'astroempires.user.js');
    const source = await readFile(bundle, 'utf8');
    const licenses = await readFile(join(outDir, 'licenses.md'), 'utf8');
    const projectLicense = await readFile(join(root, 'LICENSE'), 'utf8');
    const projectNotice = [
        'Project license: ' + packageInfo.license,
        'Astro Empires Enhance',
        'Copyright (C) 2026 simonkq1',
        `Source code (version ${packageInfo.version}): https://github.com/simonkq1/AstroEmpires-Enhance`,
        'Original code and documentation are licensed under GPL-3.0-or-later.',
        'Third-party material retains its own copyright and license notices.',
        '',
        'This program is free software: you can redistribute it and/or modify',
        'it under the terms of the GNU General Public License as published by',
        'the Free Software Foundation, either version 3 of the License, or',
        '(at your option) any later version.',
        '',
        'This program is distributed in the hope that it will be useful,',
        'but WITHOUT ANY WARRANTY; without even the implied warranty of',
        'MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the',
        'GNU General Public License for more details.',
        '',
        'You should have received a copy of the GNU General Public License',
        'along with this program. If not, see <https://www.gnu.org/licenses/>.',
        '',
        projectLicense.trimEnd(),
    ].join('\n').split(/\r?\n/).map(line => line ? `// ${line}` : '//').join('\n');
    const notices = [
        'PrimeVue source: https://github.com/primefaces/primevue/tree/4.5.5',
        'PrimeVue is bundled so the userscript can redirect its style loader into the toolbar Shadow Root.',
        licenses.trimEnd(),
    ];
    for (const name of ['styled', 'styles', 'utils']) {
        const directory = join(root, 'vendor', 'primeuix', name);
        const info = JSON.parse(await readFile(join(directory, 'package.json'), 'utf8'));
        const license = await readFile(join(directory, 'LICENSE'), 'utf8');
        notices.push(`## ${info.name} - ${info.version} (${info.license})\n${primeuixSource}/${name}\n\n${license.trimEnd()}`);
    }
    const licenseComment = notices.join('\n\n').split(/\r?\n/).map(line => line ? `// ${line}` : '//').join('\n');
    const complete = `${source.trimEnd()}\n\n${projectNotice}\n\n// Third-party licenses\n${licenseComment}\n`;

    if (check) {
        const current = await readFile(join(dist, 'astroempires.user.js')).catch(error => {
            if (error.code !== 'ENOENT') throw error;
        });
        if (!current?.equals(Buffer.from(complete))) {
            console.error('dist/astroempires.user.js 缺失或與建置產物不同步，請執行 npm run build。');
            process.exitCode = 1;
        }
    } else {
        await writeFile(bundle, complete);
    }
} finally {
    if (check) await rm(outDir, { recursive: true, force: true });
}
