import { ref } from 'vue';

export type Locale = 'zh-CN' | 'en';

const en = {
    settings: 'Settings', display: 'Display', language: 'Language', save: 'Save', cancel: 'Cancel',
    saveFailed: 'Settings could not be saved. The selected language is applied for this page.',
    menu: 'Features', openMenu: 'Open feature menu', closeMenu: 'Close feature menu',
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
