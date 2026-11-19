# Astro Empires Tampermonkey 腳本

這個腳本在 Borealis 的艦隊詳情與戰鬥頁提供雙語複製和 AEBits 戰鬥計算器匯入，並在艦隊移動頁顯示預計抵達時間。

[Borealis 遊戲名稱中英對照總表](./docs/borealis-glossary.md)

## 架構

- [`dist/astroempires.user.js`](./dist/astroempires.user.js) 是 Vite 產生、納入 Git 的單檔安裝成品。使用者可直接安裝，開發時請編輯 `src/` 內的 TypeScript 原始碼。
- 檔頭的 `@match` 將執行範圍限定為 Borealis 的 `fleet.aspx` 與 `combat.aspx`。`@run-at document-idle` 讓腳本在 `DOMContentLoaded` 之後執行，`@noframes` 將執行限制在頂層頁面，`@grant none` 表示腳本不申請額外的 Tampermonkey API 權限。
- `src/main.ts` 負責頁面判斷與資料讀取，`src/fleet.ts` 負責艦種辨識、數量解析、TSV 與計算器網址。`src/combat.ts` 依戰報反推科技。
- `src/ui/` 的工具列使用 Vue 3 與 PrimeVue 4 Unstyled Button。工具列、狀態訊息與樣式都掛載在同一個 Shadow Root。
- Tampermonkey 透過 `@require` 從 jsDelivr 載入固定版本的 Vue 3.5.45。PrimeVue 與 [PrimeUIX 上游原始碼](./vendor/primeuix/README.md) 以可讀格式內嵌，讓腳本能在建置時將 PrimeVue 樣式載入器導向 Shadow Root。
- `vite.config.ts` 集中管理安裝 metadata 與樣式載入位置，腳本版本取自 `package.json`。建置停用 JS 和 CSS 壓縮，並將內嵌依賴的來源、版本與授權附在成品末尾。

[Tampermonkey 官方文件](https://www.tampermonkey.net/documentation.php?locale=en)

## 艦隊詳情

在 Borealis 的 `/fleet.aspx?fleet=<艦隊編號>` 開啟有艦船資料的艦隊詳情。艦船表下方會出現兩個按鈕。

- **複製艦隊資料**可選「簡體中文」或「英文」。每列複製艦種與數量，中間以 Tab 分隔。若瀏覽器拒絕存取剪貼簿，畫面會顯示可手動複製的文字。
- **AEBits战斗计算器**可選「攻方」或「守方」。選定後在新分頁開啟 AEBits，帶入艦種、數量及遊戲版本 5。科技等級可在計算器內填寫。

## 艦隊移動

在 Borealis 開啟 `/fleet.aspx?fleet=<艦隊編號>&view=move`，選擇目的地並設定出航艦船。遊戲算出航行時間後，表格下方會顯示如果現在出發的預計抵達日期與時間，每秒更新。

伺服器預測從遊戲頁首的伺服器時鐘（GMT+1）起算。讀不到有效時鐘時，該欄會顯示無法取得。本地預測每次更新都從裝置目前時間起算，並依裝置時區顯示。

## 戰鬥頁

在 Borealis 的 `/combat.aspx` 戰鬥頁，`fleet` 須為正整數，`attack` 可為 `base` 或 `fleet`，`mission` 為選填。戰鬥表下方提供兩個按鈕，皆使用初始數量。

- **複製艦隊資料**可選攻方或守方，以及簡體中文或英文。守方資料包含頁面列出的基地防禦。
- **AEBits战斗计算器**會在新分頁帶入攻守雙方、守方防禦、可確認的科技等級與報表列出的加成，遊戲版本為 5。腳本先扣除指揮中心、指揮官和大型艦加成，再逐筆核對科技等級。需要手動確認的欄位會顯示在戰鬥頁按鈕下方。

點擊匯入選項時，腳本會將上述資料放入 AEBits 新分頁網址的查詢參數。

## 安裝與驗證

1. 在 Tampermonkey 選擇「新增腳本」，以 [`dist/astroempires.user.js`](./dist/astroempires.user.js) 的完整內容取代預設範本，再儲存並確認腳本已啟用。
2. 重新整理 Borealis 的艦隊詳情、戰鬥頁或移動頁，確認表格下方出現工具列或抵達時間預測。

## 開發與建置

在專案根目錄以 Node.js 24.12 以上版本及 npm 執行以下指令。

```sh
npm ci
npm run build
npm run check
```

`npm run build` 會先檢查型別，再更新 `dist/astroempires.user.js`。`npm run check` 會檢查型別、執行測試，並將暫存目錄的建置結果與安裝檔逐位元組比對。

建置後可用 `npm run test:browser` 測試 Shadow DOM 樣式隔離、剪貼簿備援與抵達時間預測。預設使用 macOS 的 Google Chrome 或命令列的 `chromium`，可用 `CHROME_BIN` 指定執行檔。
