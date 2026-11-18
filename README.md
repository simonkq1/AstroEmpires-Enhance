# Astro Empires Tampermonkey 腳本

這是 Astro Empires 頁面工具的初始骨架。腳本啟動時只在瀏覽器主控台輸出一則載入訊息。

[Borealis 遊戲名稱中英對照總表](./docs/borealis-glossary.md)

## 架構

- [`astroempires.user.js`](./astroempires.user.js) 是可直接安裝的單檔入口，使用原生 JavaScript，無需安裝相依套件或建置。
- 檔頭的 `@match` 與 `@exclude` 將執行範圍限定為 `astroempires.com` 的 HTTPS 子網域。`@run-at document-idle` 讓腳本在 `DOMContentLoaded` 之後執行，`@noframes` 將執行限制在頂層頁面，`@grant none` 表示腳本不申請額外的 Tampermonkey API 權限。
- 腳本本體使用立即執行函式維持區域作用域。新增第一個頁面功能時，可在函式內依實際網址或頁面元素判斷是否適用，再呼叫該功能的初始化函式。等多個功能出現共用邏輯後，再抽出共用函式。

[Tampermonkey 官方文件](https://www.tampermonkey.net/documentation.php?locale=en)

## 安裝與驗證

1. 在 Tampermonkey 選擇「新增腳本」，以 [`astroempires.user.js`](./astroempires.user.js) 的完整內容取代預設範本，再儲存並確認腳本已啟用。
2. 重新整理任一 Astro Empires HTTPS 子網域的頁面，開啟開發者工具的主控台並顯示除錯層級，確認出現 `[Astro Empires] 腳本已載入`。
3. 在 `https://astroempires.com/` 或其他網域的頁面重新載入後，確認主控台沒有新的腳本載入訊息。若網址發生轉址，以瀏覽器最後顯示的網址判斷匹配結果。

在專案根目錄可用 Node.js 檢查腳本語法。

```sh
node --check astroempires.user.js
```
