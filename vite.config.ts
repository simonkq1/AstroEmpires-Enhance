import { fileURLToPath } from 'node:url';
import { defineConfig, normalizePath } from 'vite';
import monkey, { cdn } from 'vite-plugin-monkey';

const styleAdapter = normalizePath(fileURLToPath(new URL('./src/ui/primevue-style.ts', import.meta.url)));
const primeuixSource = normalizePath(fileURLToPath(new URL('./vendor/primeuix', import.meta.url)));

export default defineConfig({
    build: {
        target: 'es2021',
        minify: false,
        cssMinify: false,
        license: { fileName: 'licenses.md' },
    },
    resolve: {
        alias: [
            { find: /^@primeuix\/styled$/, replacement: `${primeuixSource}/styled/src/index.ts` },
            { find: /^@primeuix\/utils$/, replacement: `${primeuixSource}/utils/src/index.ts` },
            { find: /^@primeuix\/(styles|utils)\/(.+)$/, replacement: `${primeuixSource}/$1/src/$2/index.ts` },
        ],
    },
    plugins: [{
        name: 'astroempires-primevue-shadow-styles',
        enforce: 'pre',
        resolveId(id, importer) {
            if (id === '@primevue/core/usestyle' && importer !== styleAdapter) return styleAdapter;
        },
    }, {
        name: 'astroempires-readable-primeuix',
        apply: 'build',
        load(id) {
            if (normalizePath(id).includes('/node_modules/@primeuix/')) {
                this.error(`請從 vendor/primeuix 解析原始碼，避免內嵌已壓縮的檔案。${id}`);
            }
        },
    }, monkey({
        entry: 'src/main.ts',
        userscript: {
            name: 'Astro Empires 工具腳本',
            namespace: 'astroempires-tools',
            description: '在 Borealis 的艦隊詳情與戰鬥頁複製資料並匯入 AEBits，並在移動頁預測抵達時間',
            match: ['https://borealis.astroempires.com/fleet.aspx*', 'https://borealis.astroempires.com/combat.aspx*'],
            'run-at': 'document-idle',
            noframes: true,
            grant: 'none',
        },
        build: {
            fileName: 'astroempires.user.js',
            autoGrant: false,
            externalGlobals: { vue: cdn.jsdelivr('Vue', 'dist/vue.runtime.global.prod.js') },
        },
    })],
});
