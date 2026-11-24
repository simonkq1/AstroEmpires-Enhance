# Astro Empires Tampermonkey 腳本

這個腳本在 Borealis 提供戰報 BBCode 轉換與分析，在艦隊詳情與戰鬥頁提供雙語複製和 AEBits 戰鬥計算器匯入，並顯示艦隊預計抵達時間及基地數量估計。

[Borealis 遊戲名稱中英對照總表](./docs/borealis-glossary.md)

Greasy Fork 說明文件：[簡體中文](./docs/greasyfork.zh-CN.md) · [English](./docs/greasyfork.en.md)。可分別貼入對應語言的腳本說明欄。

## 架構

- [`dist/astroempires.user.js`](./dist/astroempires.user.js) 是 Vite 產生、納入 Git 的單檔安裝成品。使用者可直接安裝，開發時請編輯 `src/` 內的 TypeScript 原始碼。
- 檔頭的 `@match` 將執行範圍限定為 Borealis。`@run-at document-idle` 讓腳本在 `DOMContentLoaded` 之後執行，`@noframes` 將執行限制在頂層頁面，`@grant none` 表示腳本不申請額外的 Tampermonkey API 權限。
- `src/main.ts` 負責頁面判斷與資料讀取，`src/fleet.ts` 負責艦種辨識、數量解析、TSV 與計算器網址。`src/combat.ts` 依戰報反推科技。
- `src/ui/` 的工具列使用 Vue 3 與 PrimeVue 4 Unstyled Button。工具列、狀態訊息與樣式都掛載在同一個 Shadow Root。
- Tampermonkey 透過 `@require` 從 jsDelivr 載入固定版本的 Vue 3.5.45。PrimeVue 與 [PrimeUIX 上游原始碼](./vendor/primeuix/README.md) 以可讀格式內嵌，讓腳本能在建置時將 PrimeVue 樣式載入器導向 Shadow Root。
- `vite.config.ts` 集中管理安裝 metadata 與樣式載入位置，腳本版本取自 `package.json`。建置停用 JS 和 CSS 壓縮，並將內嵌依賴的來源、版本與授權附在成品末尾。

[Tampermonkey 官方文件](https://www.tampermonkey.net/documentation.php?locale=en)

## 語言與設定

介面支援簡體中文與英文。首次使用或讀不到有效語言紀錄時，畫面中央會顯示「选择语言 / Choose language」，預選英文。選擇後按「保存 / Save」，或按「稍后 / Later」、Esc 暫用英文，下次載入時再次選擇。

日後可從右下角功能清單開啟「设置 / Settings」，在「显示 / Display」內選擇語言並儲存。當頁工具列、分析結果、提示與抵達時間標籤會立即切換，戰報輸入及數值會保留。取消會捨棄未儲存的選擇。

設定保存在目前瀏覽器的 Borealis 網站儲存空間，使用 `astro-empires-settings` 鍵。無法儲存時會顯示提示，所選語言仍套用於本頁。

介面語言與複製艦隊名稱的語言可分別選擇，戰報 BBCode 保留來源頁面的文字。AEBits 匯入依設定開啟中文或英文模擬器。

## 功能使用說明

點擊右下角浮動按鈕，在功能清單選擇「说明 / Help」，即可開啟置中的使用說明。內容涵蓋戰報 BBCode 複製與分析、AEBits 匯入、艦隊詳情與戰鬥頁工具、抵達時間及語言設定，跟隨目前的簡體中文或英文介面。

視窗內容可捲動，支援窄螢幕。點擊「关闭 / Close」或按 Esc，會返回功能清單並將焦點移回說明按鈕。開關說明視窗不會清除已貼上的戰報或分析結果。

## 戰報 BBCode 轉換與分析

在 Borealis 的訊息頁（`messages.aspx`）、公會面板（`board.aspx`）與戰鬥頁（`combat.aspx`），每份戰報下方提供「複製戰報 BBCode」。點擊可複製該份戰報的資訊、連結、兵力及戰果，剪貼簿失敗時會顯示可手動複製的文字框。確認攻擊頁的戰後數量 `?` 會原樣保留，分析與匯入使用初始數量。

在 Borealis 任一頁面點擊右下角的上箭頭圓形按鈕，從功能清單選擇「分析 BBCode」，貼上轉出的 BBCode 後按「分析」。面板分別列出攻守雙方已確認的科技名稱、縮寫與等級，以及待確認欄位的原因。

分析成功後可按「導入 AEBits 戰鬥模擬器」，在新分頁帶入雙方初始兵力、已確認科技與明列加成，遊戲版本為 5。小數兵力與戰後全滅單位會保留。未知單位、初始數量無效或兵力列不完整時，畫面會提示原因並停止匯入。修改輸入後需重新分析。

清單或面板開啟時，浮動按鈕改為關閉圖示，點擊即可全部收合。分析面板的關閉按鈕或 Esc 返回功能清單，在清單按 Esc 可收合。輸入與結果會保留至離開頁面。

浮動按鈕透過 Google Fonts 載入 Material Icons v145 字型，收合時顯示 `keyboard_arrow_up`，展開時顯示 `close`。字型載入期間或失敗時使用 `↑`、`×` 備援圖示。字型以專用名稱註冊，圖示與介面樣式放在 Shadow Root。 [Material Icons 官方文件](https://developers.google.com/fonts/docs/material_icons)

輸出使用遊戲支援的 `[b]`、`[url]` 與 `[code]` 格式。支援完整戰報及只有攻守方標題與 `[code]` 兵力表格的 BBCode，中英文標題與單位名稱皆可辨識。兵力表格請保留艦船、初始數量、戰後數量、攻擊、裝甲、護盾六欄，以 Tab 或連續空白分隔。

攻方沒有指揮中心與指揮官加成，僅有兵力表格也可使用有效數值推算武器科技；守方缺少資訊區塊時，加成仍標為未知。基地防禦受損或狀態不明時，使用艦船的有效數值推算。數值矛盾、未知單位及資料不足會顯示提示。貼上內容保留在目前頁面記憶體中。

## 艦隊詳情

在 Borealis 的 `/fleet.aspx?fleet=<艦隊編號>` 開啟有艦船資料的艦隊詳情。艦船表下方會出現兩個按鈕。

- **複製艦隊資料**可選「簡體中文」或「英文」。每列複製艦種與數量，中間以 Tab 分隔。若瀏覽器拒絕存取剪貼簿，畫面會顯示可手動複製的文字。
- **AEBits战斗计算器**可選「攻方」或「守方」。選定後在新分頁開啟 AEBits，帶入艦種、數量及遊戲版本 5。科技等級可在計算器內填寫。

艦隊詳情與戰鬥頁的兵力讀取支援正整數與最多兩位小數，例如 `337.9`、`0.01`，也可包含千分位逗號。複製與 AEBits 匯入會保留小數數量，並移除千分位逗號。

## 艦隊移動

在 Borealis 開啟 `/fleet.aspx?fleet=<艦隊編號>&view=move`，選擇目的地並設定出航艦船。遊戲算出航行時間後，表格下方會顯示如果現在出發的預計抵達日期與時間，每秒更新。

伺服器預測從遊戲頁首的伺服器時鐘（GMT+1）起算。讀不到有效時鐘時，該欄會顯示無法取得。本地預測每次更新都從裝置目前時間起算，並依裝置時區顯示。

## 基地經濟與基地數量

在 `/base.aspx?base=<基地編號>`，掠奪價值下方顯示預計所有者基地數量。支援中英文基地頁，標籤跟隨腳本介面語言。未被占領、最近 100 小時未被掠奪且等級修正可確認時，按 Borealis v5 的公式推算：`基地數量 = (掠奪價值 − 5 × (收入 − ceil(經濟 × 0.7))²) ÷ (2 × 經濟)`。只接受能對回數值的正整數結果。[官方掠奪說明](https://cosmos.astroempires.com/help.aspx?show=attacks)

例如經濟與收入均為 `133`、掠奪價值 `10,531` 時，額外收入損失獎勵為 `7,605`，得到 `11` 座基地。占領中、近期掠奪、缺少資料或等級修正無法確認時會顯示原因。

「不明生物 / Drekons」與「联合殖民地 / United Colonies」是 NPC，不推算玩家基地數量；透過所有者的完整名稱或 NPC 標記辨識，不會把名稱包含 Drekons 的一般玩家誤判為 NPC。

## 戰鬥頁

在 Borealis 的 `/combat.aspx` 戰鬥頁，`fleet` 須為正整數，`attack` 可為 `base`、`fleet` 或正整數目標艦隊編號。`code` 與 `mission` 為選填。戰鬥表下方提供兩個按鈕，皆使用初始數量。

- **複製艦隊資料**可選攻方或守方，以及簡體中文或英文。守方資料包含頁面列出的基地防禦。
- **AEBits战斗计算器**會在新分頁帶入攻守雙方、守方防禦、可確認的科技等級與報表列出的加成，遊戲版本為 5。腳本先扣除指揮中心、指揮官和大型艦加成，再逐筆核對科技等級。需要手動確認的欄位會顯示在戰鬥頁按鈕下方。

點擊匯入選項時，腳本會將上述資料放入 AEBits 新分頁網址的查詢參數。

當 `attack=base` 時，腳本從戰鬥資訊取得守方基地編號，以目前登入狀態向同一伺服器讀取一次基地頁。讀取期間 AEBits 按鈕暫停使用，最多等待 5 秒，艦隊複製仍可使用。成功時以 `p=economy:<經濟>,income:<收入>,defenderBase:<基地數量>` 匯入。基地頁的數值對應如下。

| 基地頁格式 | 收入 `income` | 經濟 `economy` |
| --- | --- | --- |
| `X/Y` | X | Y |
| `Y` | Y | Y |

例如 `89/126` 會帶入 `economy:126,income:89`，單一 `133` 會帶入 `economy:133,income:133`。Drekons／不明生物固定帶入 `defenderBase:8`，United Colonies／联合殖民地省略基地數量、保留收入與經濟。其他數量無法推算的情況也保留已知收入與經濟，並提示手動確認。若讀取失敗、逾時或無有效基地編號，收入、經濟與基地數量皆省略，仍可匯入兵力和科技。`attack=fleet` 或數字目標不讀取基地資料。

基地讀取僅取得頁面資料，不觸發攻擊或掠奪。AEBits 的距上次掠奪時間及未匯入的基地數量會保留計算器預設值，請手動確認；[AEBits 參數讀取程式](https://aebits.win/_app/immutable/nodes/26.BsoPmg3M.js)使用 `p` 傳遞這組資料。

戰鬥頁與 BBCode 分析使用相同的指揮官分類，支援六種類型的簡中與英文名稱。指揮中心及指揮官加成僅適用於守方。只有「防御精通 / Defense」及「战术精通 / Tactical」計入戰鬥加成；「建筑精通 / Construction」、「科研精通 / Research」、「生产精通 / Production」與「后勤精通 / Logistics」不提供戰鬥加成。無法辨識的守方指揮官仍列為待確認。科技核對容許報表兩位小數的半單位捨入邊界，數值矛盾時仍省略該科技。

## 安裝與驗證

1. 在 Tampermonkey 選擇「新增腳本」，以 [`dist/astroempires.user.js`](./dist/astroempires.user.js) 的完整內容取代預設範本，再儲存並確認腳本已啟用。
2. 重新整理 Borealis 的艦隊詳情、戰鬥頁或移動頁，確認表格下方出現工具列或抵達時間預測。

`@updateURL` 與 `@downloadURL` 指向 GitHub `master` 分支的 `dist/astroempires.user.js` 原始檔。新版建置成品發布到該分支後，Tampermonkey 可依版本號檢查及下載更新。

## 開發與建置

在專案根目錄以 Node.js 24.12 以上版本及 npm 執行以下指令。

```sh
npm ci
npm run build
npm run check
```

`npm run build` 會先檢查型別，再更新 `dist/astroempires.user.js`。`npm run check` 會檢查型別、執行測試，並將暫存目錄的建置結果與安裝檔逐位元組比對。

建置後可用 `npm run test:browser` 測試首次語言選擇、設定與即時語言切換、雙語使用說明視窗、浮動戰報分析、Shadow DOM 樣式隔離、雙語複製、AEBits 匯入與抵達時間預測。預設使用 macOS 的 Google Chrome 或命令列的 `chromium`，可用 `CHROME_BIN` 指定執行檔。

## 授權

Copyright (C) 2026 simonkq1

本專案原創程式碼與文件採 **GPL-3.0-or-later**，可選用 GPL 第 3 版或自由軟體基金會發布的後續版本。完整英文條款收錄於 [LICENSE](./LICENSE)，並隨安裝檔附上。右下角「说明 / Help」也提供授權摘要與條款連結。

- 允許依授權條款使用、修改、商用、收費及再散布。私下修改而未散布時，不必公開修改內容。
- 散布時須保留版權、授權與無擔保聲明，並提供 GPL 條款。散布修改版須明確標示修改內容及日期，整體衍生作品依 GPL 授權，並讓收件者取得對應原始碼。
- 不另加禁止商用或禁止轉載的限制。本軟體不提供任何擔保，包括適售性或特定用途適用性的默示擔保；責任限制依 GPL 條款。

發布安裝檔時，須持續提供該版本的完整對應原始碼，包括 TypeScript、必要的內嵌第三方來源、建置腳本與設定、`package.json` 及鎖定檔，讓使用者能修改並重建。請在發布紀錄標明對應的 Git 提交或版本標籤；維護者須保留並提供這些版本，不能僅以持續變動的分支取代。原始碼儲存庫為 [Astro Empires Enhance](https://github.com/simonkq1/AstroEmpires-Enhance)。

Vue、PrimeVue 與 PrimeUIX 採 MIT，保留上游授權及版權聲明；內嵌元件的聲明仍附於安裝檔末尾，`vendor/primeuix` 保留各套件的 `LICENSE`。外部載入的 Material Icons 依其 [Apache 2.0 授權](https://developers.google.com/fonts/docs/material_icons#licensing)使用。遊戲名稱、遊戲頁面、戰報範例及其他第三方內容的權利仍歸相應權利人，本專案不以 GPL 重新授權這些內容。
