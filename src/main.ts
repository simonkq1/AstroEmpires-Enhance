import { readCombatTechnologies, type FleetUnitRow } from './combat.ts';
import { parseFleetUnit } from './fleet.ts';
import { mountFleetArrival } from './ui/fleet-arrival.ts';
import { mountFleetActions, panelId } from './ui/fleet-toolbar.ts';
import { mountReportAnalyzer } from './ui/report-analyzer.ts';
import { initializeReportCopy } from './ui/report-copy.ts';
import { initializeSettings } from './settings.ts';
import { mountBaseEstimate } from './ui/base-estimate.ts';
import { loadCombatBase } from './combat-base.ts';

function initializeFleetActions(): void {
    console.debug('[Astro Empires] 腳本已載入');

    if (location.hostname !== 'borealis.astroempires.com' || document.getElementById(panelId)) return;
    const params = new URLSearchParams(location.search);
    if (!/^[1-9]\d*$/.test(params.get('fleet') ?? '')) return;

    if (location.pathname === '/fleet.aspx') {
        if (params.get('view') === 'move') {
            mountFleetArrival();
            return;
        }
        const table = document.querySelector<HTMLTableElement>('#fleet_overview table.listing');
        if (!table) return;
        const units = readUnitRows(table).map(({ unit }) => unit);
        mountFleetActions(table, [{ units }], [['attacker', { aS: units }], ['defender', { dS: units }]]);
        return;
    }

    const attack = params.get('attack');
    const validAttack = attack === 'base' || attack === 'fleet' || /^[1-9]\d*$/.test(attack ?? '');
    if (location.pathname !== '/combat.aspx' || !validAttack) return;

    const attackTable = document.querySelector<HTMLTableElement>('table.battle-report_attack');
    const defenseTable = document.querySelector<HTMLTableElement>('table.battle-report_defense');
    const lastTable = defenseTable ?? attackTable;
    if (!lastTable) return;

    const attackRows = readUnitRows(attackTable);
    const defenseRows = readUnitRows(defenseTable, true);
    const attacker = attackRows.map(({ unit }) => unit);
    const defender = defenseRows.map(({ unit }) => unit);
    const report = document.querySelector<HTMLTableElement>('table.battle-report_info');
    const baseImport = attack === 'base' && (attacker.length || defender.length) ? loadCombatBase(report, location.origin) : undefined;
    mountFleetActions(lastTable, [
        { units: attacker, side: 'attacker' },
        { units: defender, side: 'defender' },
    ], [['calculator', { aS: attacker, dS: defender }]], () => readCombatTechnologies(
        report, attackRows, defenseRows), baseImport);
}

function readUnitRows(table: HTMLTableElement | null, includeDefenses = false): FleetUnitRow[] {
    const unitRows: FleetUnitRow[] = [];
    for (const row of table?.rows ?? []) {
        const [nameCell, quantityCell] = row.cells;
        if (nameCell?.tagName !== 'TD' || quantityCell?.tagName !== 'TD') continue;

        const unit = parseFleetUnit(nameCell.textContent, quantityCell.textContent, includeDefenses);
        if (unit) unitRows.push({ unit, row });
    }
    return unitRows;
}

if (location.hostname === 'borealis.astroempires.com') {
    initializeSettings();
    mountReportAnalyzer();
    initializeFleetActions();
    if (location.pathname === '/base.aspx' && /^[1-9]\d*$/.test(new URLSearchParams(location.search).get('base') ?? '')) mountBaseEstimate();
    if (['/messages.aspx', '/board.aspx', '/combat.aspx'].includes(location.pathname)) initializeReportCopy();
}
