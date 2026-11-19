import { readCombatTechnologies, type FleetUnitRow } from './combat.ts';
import { parseFleetUnit } from './fleet.ts';
import { mountFleetArrival } from './ui/fleet-arrival.ts';
import { calculatorLabel, mountFleetActions, panelId } from './ui/fleet-toolbar.ts';

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
        mountFleetActions(table, [{ units }], [['攻方', { aS: units }], ['守方', { dS: units }]]);
        return;
    }

    const attack = params.get('attack');
    if (location.pathname !== '/combat.aspx' || (attack !== 'base' && attack !== 'fleet')) return;

    const attackTable = document.querySelector<HTMLTableElement>('table.battle-report_attack');
    const defenseTable = document.querySelector<HTMLTableElement>('table.battle-report_defense');
    const lastTable = defenseTable ?? attackTable;
    if (!lastTable) return;

    const attackRows = readUnitRows(attackTable);
    const defenseRows = readUnitRows(defenseTable, true);
    const attacker = attackRows.map(({ unit }) => unit);
    const defender = defenseRows.map(({ unit }) => unit);
    mountFleetActions(lastTable, [
        { units: attacker, side: '攻方' },
        { units: defender, side: '守方' },
    ], [[calculatorLabel, { aS: attacker, dS: defender }]], () => readCombatTechnologies(
        document.querySelector<HTMLTableElement>('table.battle-report_info'), attackRows, defenseRows));
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

initializeFleetActions();
