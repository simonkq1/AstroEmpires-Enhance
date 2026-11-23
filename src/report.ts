import { inferCombatTechnology, readCommander, readLevel, readNumber, type CombatModifiers, type CombatObservation } from './combat.ts';
import { buildCalculatorUrl, identifyFleetUnit, type FleetUnit } from './fleet.ts';
import { msg, type Message, type Locale } from './i18n.ts';

type Side = 'attacker' | 'defender';

interface ReportSide {
    observations: CombatObservation[];
    modifiers: CombatModifiers;
    hasInformation: boolean;
    warnings: Message[];
    units: FleetUnit[];
    importErrors: Message[];
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
        if (inCode && /^(?:舰船|ships?|units?)$/.test(label)) {
            inUnits = true;
            continue;
        }
        if (inUnits) {
            const quantity = readNumber(cells[1]);
            if (cells.length !== 6 || quantity === undefined || quantity <= 0) {
                const reason = cells.length !== 6 ? 'incompleteRow' : 'invalidQuantity';
                const warning = msg(reason, { name: cells[0] || msg('unnamedUnit') });
                report.warnings.push(warning);
                report.importErrors.push(warning);
                continue;
            }
            const unit = { ...identifyFleetUnit(cells[0]), quantity };
            const { code } = unit;
            report.units.push(unit);
            if (!code) {
                const warning = msg('unknownUnit', { name: cells[0] });
                report.warnings.push(warning);
                report.importErrors.push(warning);
            }
            const observation = { code, attack: readNumber(cells[3]), armour: readNumber(cells[4]), shield: readNumber(cells[5]) };
            if ([observation.attack, observation.armour, observation.shield].some(value => value === undefined)) {
                report.warnings.push(msg('incompleteStats', { name: cells[0] }));
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
        warnings: uniqueMessages(side.warnings),
        units: side.units,
        importErrors: uniqueMessages(side.importErrors),
    });
    return { attacker: result(sides.attacker), defender: result(sides.defender), error: parsed.error };
}

export function buildReportCalculatorUrl(report: ReturnType<typeof analyzeReport>, locale: Locale = 'zh-CN'): { url: URL } | { error: Message } {
    if (report.error) return { error: report.error };
    const errors = [
        ...report.attacker.importErrors.map(error => msg('sideIssue', { side: msg('attacker'), issue: error })),
        ...report.defender.importErrors.map(error => msg('sideIssue', { side: msg('defender'), issue: error })),
    ];
    if (errors.length) return { error: msg('importBlocked', { issues: errors }) };
    if (!report.attacker.units.length && !report.defender.units.length) return { error: msg('noImportUnits') };
    const result = buildCalculatorUrl({ aS: report.attacker.units, dS: report.defender.units }, {
        aT: report.attacker.units.length ? report.attacker.levels : {},
        dT: report.defender.units.length ? report.defender.levels : {},
    }, locale);
    return 'unknownNames' in result ? { error: msg('unknownImport', { names: result.unknownNames }) } : result;
}

function readBbcodeRows(text: string) {
    const rows: { cells: string[]; inCode: boolean }[] = [];
    let inCode = false;
    let error: Message | null = null;
    for (const part of text.split(/(\[\/?code\])/i)) {
        if (/^\[code\]$/i.test(part)) {
            if (inCode) error = msg('codeNested');
            inCode = true;
        } else if (/^\[\/code\]$/i.test(part)) {
            if (!inCode) error = msg('codeMissingStart');
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
    if (inCode) error = msg('codeMissingEnd');
    return { rows, error };
}

function cleanCell(text: string): string {
    return text.replace(/\[\/?(?:b|i|u|s|color|size|url|center|left|right)(?:=[^\]\r\n]*)?\]/gi, '')
        .replace(/&(?:nbsp|#x20|#32|#160);/gi, ' ')
        .replace(/&#91;/g, '[').replace(/&#93;/g, ']')
        .replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&')
        .replace(/\s+/g, ' ').trim();
}

function uniqueMessages(messages: Message[]): Message[] {
    return [...new Map(messages.map(message => [JSON.stringify(message), message])).values()];
}
