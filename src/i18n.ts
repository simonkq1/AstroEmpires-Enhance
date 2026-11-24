import { ref } from 'vue';

export type Locale = 'zh-CN' | 'en';

const en = {
    settings: 'Settings', display: 'Display', language: 'Language', save: 'Save', cancel: 'Cancel',
    saveFailed: 'Settings could not be saved. The selected language is applied for this page.',
    menu: 'Features', openMenu: 'Open feature menu', closeMenu: 'Close feature menu',
    baseCountLabel: "Estimated owner's base count",
    baseNpc: 'NPC base: player base count does not apply.',
    baseDrekonsImport: 'Drekons: the AEBits base count is set to 8. Check the other pillage settings manually.',
    baseRecentlyPillaged: 'Occupied or pillaged within 100 hours: the pillage value does not reveal the base count.',
    baseMissingPillage: 'The pillage value is unavailable.',
    baseCountMismatch: 'The economy and pillage value do not identify a positive integer base count.',
    baseLevelUnknown: 'The player-level adjustment cannot be confirmed.',
    baseLoading: 'Reading target base income and economy…',
    baseIdUnavailable: 'Target base ID is unavailable. Income, economy and base count were omitted.',
    baseFetchFailed: 'Could not read the target base. Income, economy and base count were omitted.',
    baseManualCount: 'Income and economy were imported; base count was omitted. {reason} Check the base count and other pillage settings manually in AEBits.',
    baseTools: 'Base economy and base count',
    helpBaseEstimate: 'On base.aspx, look below the pillage value for the estimated number of bases owned by the player. NPC bases, occupations, recent pillages and unconfirmed data show an explanation instead of a count.',
    helpBaseFetch: 'When attacking a base, the combat page reads the target base once before enabling AEBits. X/Y means income X and economy Y; a single Y supplies both. It imports these values and a confirmed base count. Drekons uses a fixed count of 8; United Colonies omits the count. A failed read omits all three. Check hours since the last pillage and any unknown base count manually in AEBits.',
    help: 'Help', helpTitle: 'Features and usage',
    licenseTitle: 'License', licenseTerms: 'Full GPLv3 terms', sourceCode: 'Source code',
    licenseSummary: 'Original code and documentation are licensed under GPL-3.0-or-later. Use, modification, commercial use and redistribution are permitted under its terms. Distributed modifications must remain under the GPL and provide corresponding source code. This software comes WITHOUT ANY WARRANTY.',
    thirdPartyRights: 'Third-party libraries and fonts retain their own licenses. Game content and report material remain subject to their respective rights.',
    helpIntro: 'These features are available on Borealis. Open the bottom-right arrow to access BBCode analysis, Settings and Help. Close this window or press Esc to return to the menu.',
    helpReportPages: 'On messages.aspx, board.aspx and combat.aspx, find a battle report and click “Copy battle report BBCode” below it. Each button copies only its own report, keeping the original language.',
    helpReportCopy: 'If clipboard access fails, select and copy the text in the fallback box manually. Use this BBCode for analysis instead of copying the game table directly.',
    helpAnalyzePaste: 'Open “Analyze BBCode” from the feature menu, paste the copied BBCode, then click “Analyze”. Simplified Chinese and English reports are supported. Keep the side headings and all six columns of each [code] unit table.',
    helpAnalyzeResults: 'Results show confirmed technology levels for each side and explain fields that need confirmation. Command Center and commander bonuses apply only to the defender; a complete report helps identify them. Editing the input clears the old result; click “Analyze” again. Closing the panel keeps your input and results until you leave the page.',
    helpImport: 'After a successful analysis, click “Import into AEBits Battle Calculator”. A new tab opens with initial forces, confirmed technologies and explicit bonuses. Fractional forces and units destroyed in battle are included. Only the available side is imported for a one-sided report.',
    helpImportErrors: 'Check unresolved technologies manually in AEBits. Unknown units, invalid initial quantities or incomplete unit rows block import; correct the reported issue and analyze again. The calculator language follows your script language.',
    helpFleetCombat: 'Fleet details and combat pages',
    helpFleet: 'On fleet.aspx?fleet=<fleet ID>, click “Copy fleet data” below the ship table and choose Simplified Chinese or English. Each line contains a unit name and quantity separated by a Tab. For AEBits, choose Attacker or Defender; fleet details import ships only, so enter technologies in the calculator.',
    helpCombat: 'On combat.aspx, “Copy fleet data” lets you choose the side and output language. “AEBits Battle Calculator” imports both sides’ initial forces, including listed defenses, and confirmed technologies and bonuses. Check any confirmation notices below the toolbar.',
    helpArrival: 'On fleet.aspx?fleet=<fleet ID>&view=move, choose a destination and set ships and speed. Once the game calculates travel time, “Estimated arrival” below the travel table updates every second as if you departed now.',
    helpClocks: 'Server time uses the game’s header clock (GMT+1); it shows “Unavailable” if that clock cannot be read. Local time independently uses your device’s current clock and time zone. An invalid travel time clears both estimates. These estimates do not launch the fleet.',
    helpLanguageFirst: 'On first use, select 简体中文 or English and save. “Later” or Esc uses English for this page and asks again on the next page load.',
    helpLanguageSettings: 'Open “Settings” from the feature menu, choose a language under “Display” and save. The interface updates immediately while keeping your report and results. “Cancel” discards the selection. Fleet copy language is chosen separately.',
    analyzeBbcode: 'Analyze BBCode', analysisTitle: 'BBCode Battle Report Analysis', closeAnalysis: 'Close battle report analysis',
    close: 'Close', reportInput: 'Battle report BBCode', analyze: 'Analyze',
    reportPlaceholder: 'Paste BBCode containing a complete report or attacker and defender unit tables',
    pasteFirst: 'Please paste battle report BBCode first.',
    noRecognized: 'No recognized units. Paste BBCode with side headings and [code] unit tables. {details}',
    noUnits: 'No recognized unit data.', noLevels: 'No technology levels could be confirmed.',
    pending: 'Needs confirmation', unlisted: 'Unlisted technologies have no usable data.',
    importCalculator: 'Import into AEBits Battle Calculator', calculator: 'AEBits Battle Calculator',
    attacker: 'Attacker', defender: 'Defender', chinese: 'Simplified Chinese', english: 'English',
    copyFleet: 'Copy fleet data', fleetData: 'Fleet data', copyChoice: '{side} {language}',
    copiedFleet: 'Copied {choice} fleet data.', clipboardFleet: 'Clipboard access failed. Copy the fleet data below manually.',
    unknownImport: 'Cannot import unrecognized units: {names}.',
    copyReport: 'Copy battle report BBCode', copiedReport: 'Battle report BBCode copied.',
    clipboardReport: 'Clipboard access failed. Copy the BBCode below manually.',
    incompleteReport: 'The battle report is incomplete and cannot be converted.',
    estimatedArrival: 'Estimated arrival', serverTime: 'Server time', localTime: 'Local time', unavailable: 'Unavailable',
    waitingTravel: 'Waiting for the game to calculate travel time.',
    damagedDefense: 'Base defenses are damaged or their initial condition is unknown, and no usable ship data is available.',
    missingModifier: 'The report does not specify this bonus.',
    missingObservation: 'No usable observation with a nonzero base value is available.',
    missingAttackBonus: 'Command Center or commander bonuses are missing. Provide the complete report.',
    conflictingValues: 'Values do not match an integer technology level or conflict with other units.',
    manualConfirm: 'Please confirm these fields manually in AEBits: {sides}.',
    sideFields: '{side} ({fields})', fieldReason: '{field} — {reason}',
    incompleteRow: 'Unit "{name}" has an incomplete unit row.', invalidQuantity: 'Unit "{name}" has an invalid initial quantity.',
    unnamedUnit: 'Unnamed unit', unknownUnit: 'Unit "{name}" is unrecognized and its statistics were excluded.',
    incompleteStats: 'Attack, armour or shield data for "{name}" is incomplete.',
    sideIssue: '{side}: {issue}', importBlocked: 'Cannot import. {issues}', noImportUnits: 'No initial units to import.',
    codeNested: 'The BBCode [code] blocks are nested or improperly closed.',
    codeMissingStart: 'A BBCode [code] opening tag is missing.', codeMissingEnd: 'A BBCode [code] closing tag is missing.',
    ARM: 'Armour', LAS: 'Laser', MIS: 'Missiles', PLA: 'Plasma', SLD: 'Shielding', ION: 'Ion', PHO: 'Photon', DIS: 'Disruptor',
    CC: 'Command Centers', DfC: 'Defense Mastery', TaC: 'Tactical Mastery',
} as const;

const chinese: Record<keyof typeof en, string> = {
    settings: '设置', display: '显示', language: '语言', save: '保存', cancel: '取消',
    saveFailed: '无法保存设置，所选语言已应用于本页。',
    menu: '功能菜单', openMenu: '打开功能菜单', closeMenu: '收起功能菜单',
    baseCountLabel: '预计所有者基地数量',
    baseNpc: 'NPC 基地，不适用玩家基地数量。',
    baseDrekonsImport: 'Drekons / 不明生物的 AEBits 基地数量固定设为 8，其他掠夺设置请手动确认。',
    baseRecentlyPillaged: '基地被占领或最近 100 小时内被掠夺，无法从掠夺价值推算基地数量。',
    baseMissingPillage: '无法取得掠夺价值。',
    baseCountMismatch: '经济与掠夺价值无法对应正整数基地数量。',
    baseLevelUnknown: '无法确认玩家等级修正。',
    baseLoading: '正在读取目标基地收入与经济…',
    baseIdUnavailable: '无法取得目标基地编号，未导入收入、经济与基地数量。',
    baseFetchFailed: '无法读取目标基地，未导入收入、经济与基地数量。',
    baseManualCount: '已导入收入与经济，未导入基地数量。{reason}请在 AEBits 手动确认基地数量及其他掠夺设置。',
    baseTools: '基地经济与基地数量',
    helpBaseEstimate: '在 base.aspx 的掠夺价值下方查看预计所有者基地数量。NPC 基地、占领中、近期掠夺或资料无法确认时，会显示原因。',
    helpBaseFetch: '攻击基地的战斗页会先读取一次目标基地，再启用 AEBits。X/Y 表示收入 X、经济 Y，单一 Y 则两项均为 Y；导入这两项及可确认的基地数量。Drekons 固定为 8，联合殖民地不导入数量。读取失败时三项都省略。上次掠夺时间及未知基地数量请在 AEBits 手动确认。',
    help: '说明', helpTitle: '功能与使用说明',
    licenseTitle: '许可证', licenseTerms: 'GPLv3 完整条款', sourceCode: '源代码',
    licenseSummary: '原创代码与文档采用 GPL-3.0-or-later，允许依条款使用、修改、商用与再分发。分发修改版时须维持 GPL 授权并提供对应源代码。本软件不提供任何担保。',
    thirdPartyRights: '第三方库与字体保留各自许可证。游戏内容及战报资料的权利归相应权利人所有。',
    helpIntro: '以下功能适用于 Borealis。点击右下角箭头，可打开分析 BBCode、设置和说明。关闭本窗口或按 Esc 可返回功能菜单。',
    helpReportPages: '在消息页 messages.aspx、公会面板 board.aspx 或战斗页 combat.aspx，找到战报并点击下方的“复制战报 BBCode”。每个按钮只复制对应的战报，保留原文语言。',
    helpReportCopy: '如果无法访问剪贴板，请选中备用文本框中的内容并手动复制。分析时请使用这份 BBCode，避免直接复制游戏表格造成格式缺失。',
    helpAnalyzePaste: '从功能菜单打开“分析 BBCode”，粘贴复制的内容后点击“分析”。支持简体中文和英文战报。请保留攻守方标题，以及 [code] 兵力表格的全部六栏。',
    helpAnalyzeResults: '结果分别列出攻守方已确认的科技等级，以及待确认字段的原因。指挥中心和指挥官加成仅适用于守方，完整战报有助于识别这些加成。修改输入后会清除旧结果，请再次点击“分析”。关闭面板会保留输入和结果，直到离开页面。',
    helpImport: '分析成功后，点击“导入 AEBits 战斗模拟器”，即可在新标签页带入初始兵力、已确认科技与明列加成。小数兵力及战后全灭单位也会保留。仅有一方资料时只导入该方。',
    helpImportErrors: '请在 AEBits 手动确认尚未确定的科技。遇到未识别单位、初始数量无效或兵力列不完整时，会停止导入；请按提示修正后重新分析。模拟器语言跟随脚本语言设置。',
    helpFleetCombat: '舰队详情与战斗页',
    helpFleet: '在 fleet.aspx?fleet=<舰队编号> 的舰船表下方，点击“复制舰队资料”并选择简体中文或英文。每行包含舰种与数量，以 Tab 分隔。打开 AEBits 时可选择攻方或守方；舰队详情只导入舰船，科技需在模拟器中填写。',
    helpCombat: '在 combat.aspx，“复制舰队资料”可选择攻守方与输出语言。“AEBits 战斗计算器”会导入双方初始兵力、列出的防御设施，以及已确认的科技和加成。请检查工具栏下方的待确认提示。',
    helpArrival: '在 fleet.aspx?fleet=<舰队编号>&view=move，选择目的地并设置舰船和速度。游戏算出航行时间后，航行表下方的“预计到达”会每秒更新，表示如果现在出发的抵达时间。',
    helpClocks: '服务器时间从游戏页首时钟（GMT+1）起算，无法读取时显示“无法取得”。本地时间独立使用设备当前时钟与时区计算。航行时间无效时会清除两项预测。预测功能不会派遣舰队。',
    helpLanguageFirst: '首次使用时，选择简体中文或 English 并保存。“稍后”或 Esc 会在本页使用英文，下次载入页面时再次询问。',
    helpLanguageSettings: '从功能菜单打开“设置”，在“显示”中选择语言并保存。界面立即更新，战报输入和结果会保留。“取消”会放弃本次选择。复制舰队资料的输出语言可独立选择。',
    analyzeBbcode: '分析 BBCode', analysisTitle: 'BBCode 战报分析', closeAnalysis: '关闭战报分析',
    close: '关闭', reportInput: '战报 BBCode', analyze: '分析',
    reportPlaceholder: '粘贴包含完整战报或攻守方兵力表格的 BBCode', pasteFirst: '请先粘贴战报 BBCode。',
    noRecognized: '没有可识别的单位，请粘贴包含攻守方标题与 [code] 兵力表格的 BBCode。{details}',
    noUnits: '没有可识别的单位资料。', noLevels: '目前没有可确认的科技等级。',
    pending: '待确认', unlisted: '未列出的科技缺少可用资料。',
    importCalculator: '导入 AEBits 战斗模拟器', calculator: 'AEBits 战斗计算器',
    attacker: '攻方', defender: '守方', chinese: '简体中文', english: '英文',
    copyFleet: '复制舰队资料', fleetData: '舰队资料', copyChoice: '{side} {language}',
    copiedFleet: '已复制{choice}舰队资料。', clipboardFleet: '无法访问剪贴板，请手动复制下方的舰队资料。',
    unknownImport: '无法导入，未识别的单位为 {names}。',
    copyReport: '复制战报 BBCode', copiedReport: '已复制战报 BBCode。',
    clipboardReport: '无法访问剪贴板，请手动复制下方的 BBCode。', incompleteReport: '战报资料不完整，无法转换。',
    estimatedArrival: '预计到达', serverTime: '服务器时间', localTime: '本地时间', unavailable: '无法取得',
    waitingTravel: '等待游戏计算航行时间。',
    damagedDefense: '基地防御受损或初始防御状态不明，缺少可用的舰船数值。',
    missingModifier: '战报缺少此项加成资料。', missingObservation: '缺少可用的非零基础数值或有效观测。',
    missingAttackBonus: '缺少指挥中心或指挥官加成资料，请提供完整战报。',
    conflictingValues: '数值无法回算为整数科技等级，或与其他单位的数值矛盾。',
    manualConfirm: '请在 AEBits 手动确认这些字段：{sides}。', sideFields: '{side}（{fields}）', fieldReason: '{field} — {reason}',
    incompleteRow: '单位「{name}」的兵力列不完整。', invalidQuantity: '单位「{name}」的初始数量无效。',
    unnamedUnit: '未命名单位', unknownUnit: '未识别单位「{name}」，其数值未用于推算。',
    incompleteStats: '单位「{name}」的攻击、装甲或护盾资料不完整。',
    sideIssue: '{side}：{issue}', importBlocked: '无法导入，{issues}', noImportUnits: '没有可导入的初始兵力。',
    codeNested: 'BBCode 的 [code] 区块嵌套或未正确结束。', codeMissingStart: 'BBCode 的 [code] 区块缺少起始标签。',
    codeMissingEnd: 'BBCode 的 [code] 区块缺少结束标签。',
    ARM: '装甲', LAS: '激光', MIS: '导弹', PLA: '等离子电浆', SLD: '护盾', ION: '离子', PHO: '光子', DIS: '物质裂解',
    CC: '指挥中心', DfC: '防御精通', TaC: '战术精通',
};

export type MessageKey = keyof typeof en;
type MessageValue = string | number | Message | readonly MessageValue[];
export interface Message {
    key: MessageKey;
    params?: Record<string, MessageValue>;
}

export const language = ref<Locale>('en');

export function msg(key: MessageKey, params?: Message['params']): Message {
    return { key, params };
}

export function t(value: Message | MessageKey | null, locale: Locale = language.value): string {
    if (value === null) return '';
    const message = typeof value === 'string' ? msg(value) : value;
    const template = (locale === 'zh-CN' ? chinese : en)[message.key];
    const format = (param: MessageValue): string => {
        if (Array.isArray(param)) return param.map(format).join(locale === 'zh-CN' ? '、' : ', ');
        return typeof param === 'object' ? t(param as Message, locale) : String(param);
    };
    return template.replace(/\{(\w+)\}/g, (_, key: string) => format(message.params?.[key] ?? ''));
}
