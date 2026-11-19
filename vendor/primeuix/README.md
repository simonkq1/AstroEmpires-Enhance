# PrimeUIX 上游原始碼

來源為 [PrimeUIX 固定修訂 `b9467bc448d35738d4f651dbc3caa4d4cb9a6a96`](https://github.com/primefaces/primeuix/commit/b9467bc448d35738d4f651dbc3caa4d4cb9a6a96)。此目錄保留未修改的上游 TypeScript 原始碼及各套件的 `package.json` 與 `LICENSE`。

- `styled` 0.7.4 與 `utils` 0.6.4 保留 `src/`，供套件內互相匯入及 Vite 移除未使用的程式碼。
- `styles` 2.0.3 保留 `base`、`badge`、`button` 與 `ripple` 四個由 PrimeVue 按鈕引用的樣式入口。

Vite 從此目錄打包 PrimeUIX 原始碼，讓 Greasy Fork 安裝檔保有可審閱的程式碼。PrimeVue 必須與腳本一起打包，才能在建置時將其樣式載入器導向腳本的 Shadow Root。
