import { inferCombatTechnology, readCommander, readLevel, readNumber, type CombatModifiers, type CombatObservation } from './combat.ts';
import { buildCalculatorUrl, identifyFleetUnit, type FleetUnit } from './fleet.ts';

type Side = 'attacker' | 'defender';

interface ReportSide {
    observations: CombatObservation[];
    modifiers: CombatModifiers;
    hasInformation: boolean;
    warnings: string[];
    units: FleetUnit[];
    importErrors: string[];
}

export function analyzeReport(text: string) {
    const createSide = (): ReportSide => ({
        observations: [],
        modifiers: { CC: null, TaC: null, DfC: null, fullDefenses: false },
        hasInformation: false,
        warnings: [],
        units: [],
        importErrors: [],
    });
    const sides = { attacker: createSide(), defender: createSide() };
    let side: Side | undefined;
    let inUnits = false;
    const parsed = readBbcodeRows(text);

    for (const { cells, inCode } of parsed.rows) {
        if (!inCode) inUnits = false;
        const label = cells[0].toLowerCase();
        if (/^(?:攻击舰队|attack force)$/.test(label) || /^(?:防御舰队|defensive force)$/.test(label)) {
            side = /^(?:攻击舰队|attack force)$/.test(label) ? 'attacker' : 'defender';
            inUnits = false;
            continue;
        }
        if (!side) continue;
        const report = sides[side];
        if (inCode && /^(?:舰船|ships?)$/.test(label)) {
            inUnits = true;
            continue;
        }
        if (inUnits) {
            const quantity = readNumber(cells[1]);
            if (cells.length !== 6 || quantity === undefined || quantity <= 0) {
                const reason = cells.length !== 6 ? '兵力列不完整' : '初始數量無效';
                const warning = `單位「${cells[0] || '未命名單位'}」的${reason}。`;
                report.warnings.push(warning);
                report.importErrors.push(warning);
                continue;
            }
            const unit = { ...identifyFleetUnit(cells[0]), quantity };
            const { code } = unit;
            report.units.push(unit);
            if (!code) {
                const warning = `未識別單位「${cells[0]}」，其數值未用於推算。`;
                report.warnings.push(warning);
                report.importErrors.push(warning);
            }
            const observation = { code, attack: readNumber(cells[3]), armour: readNumber(cells[4]), shield: readNumber(cells[5]) };
            if ([observation.attack, observation.armour, observation.shield].some(value => value === undefined)) {
                report.warnings.push(`單位「${cells[0]}」的攻擊、裝甲或護盾資料不完整。`);
            }
            report.observations.push(observation);
            continue;
        }
        if (!/^(?:玩家|player|舰队名称|fleet name|基地|base|初始防御|start defenses|战后防御|end defenses|指挥中心|command centers|指挥官|commander)$/.test(label)) continue;
        if (!report.hasInformation) {
            Object.assign(report.modifiers, { CC: 0, TaC: 0, DfC: 0 });
            report.hasInformation = true;
        }
        const value = cells[1] ?? '';
        switch (label) {
            case '指挥中心':
            case 'command centers':
                report.modifiers.CC = readLevel(value);
                break;
            case '指挥官':
            case 'commander':
                Object.assign(report.modifiers, readCommander(value));
                break;
            case '初始防御':
            case 'start defenses':
                report.modifiers.fullDefenses = readNumber(value.replace(/[%％]$/, '')) === 100;
                break;
        }
    }

    const result = (side: ReportSide) => ({
        ...inferCombatTechnology(side.observations, side.modifiers),
        count: side.observations.filter(observation => observation.code).length,
        warnings: [...new Set(side.warnings)],
        units: side.units,
        importErrors: [...new Set(side.importErrors)],
    });
    return { attacker: result(sides.attacker), defender: result(sides.defender), error: parsed.error };
}

export function buildReportCalculatorUrl(report: ReturnType<typeof analyzeReport>): { url: URL } | { error: string } {
    if (report.error) return { error: report.error };
    const errors = [
        ...report.attacker.importErrors.map(error => `攻方${error}`),
        ...report.defender.importErrors.map(error => `守方${error}`),
    ];
    if (errors.length) return { error: `無法匯入，${errors.join(' ')}` };
    if (!report.attacker.units.length && !report.defender.units.length) return { error: '沒有可匯入的初始兵力。' };
    const result = buildCalculatorUrl({ aS: report.attacker.units, dS: report.defender.units }, {
        aT: report.attacker.units.length ? report.attacker.levels : {},
        dT: report.defender.units.length ? report.defender.levels : {},
    });
    return 'unknownNames' in result ? { error: `無法匯入，未識別單位為 ${result.unknownNames.join('、')}。` } : result;
}

function readBbcodeRows(text: string) {
    const rows: { cells: string[]; inCode: boolean }[] = [];
    let inCode = false;
    let error: string | null = null;
    for (const part of text.split(/(\[\/?code\])/i)) {
        if (/^\[code\]$/i.test(part)) {
            if (inCode) error = 'BBCode 的 [code] 區塊巢狀或未正確結束。';
            inCode = true;
        } else if (/^\[\/code\]$/i.test(part)) {
            if (!inCode) error = 'BBCode 的 [code] 區塊缺少起始標籤。';
            inCode = false;
        } else {
            for (const sourceLine of part.split(/\r?\n/)) {
                const line = cleanCell(sourceLine);
                if (!line) continue;
                const cells = inCode ? sourceLine.trim().split(sourceLine.includes('\t') ? '\t' : / {2,}/).map(cleanCell)
                    : line.split(/[:：](.*)/s).slice(0, 2).map(value => value.trim());
                rows.push({ cells, inCode });
            }
        }
    }
    if (inCode) error = 'BBCode 的 [code] 區塊缺少結束標籤。';
    return { rows, error };
}

function cleanCell(text: string): string {
    return text.replace(/\[\/?(?:b|i|u|s|color|size|url|center|left|right)(?:=[^\]\r\n]*)?\]/gi, '')
        .replace(/&(?:nbsp|#x20|#32|#160);/gi, ' ')
        .replace(/&#91;/g, '[').replace(/&#93;/g, ']')
        .replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&')
        .replace(/\s+/g, ' ').trim();
}
