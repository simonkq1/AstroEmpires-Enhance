import { createApp, h, ref } from 'vue';
import { t } from '../i18n.ts';
import { formatLocalTime, formatServerTime, parseServerTime, parseTravelDuration } from '../arrival.ts';

const arrivalPanelId = 'astro-empires-fleet-arrival';
const styles = `
:host {
    all: initial !important;
    display: block !important;
    margin-block-start: 8px !important;
}
.arrival {
    font: 14px/1.45 system-ui, sans-serif;
    color: #e7f1f6;
    direction: ltr;
    text-align: start;
}
dl {
    display: grid;
    grid-template-columns: max-content 1fr;
    gap: 2px 8px;
    margin: 4px 0 0;
}
dd {
    margin: 0;
    font-variant-numeric: tabular-nums;
}
`;

export function mountFleetArrival(): void {
    if (document.getElementById(arrivalPanelId)) return;
    const form = document.getElementById('move_fleet_form');
    const duration = form?.querySelector('#duration');
    const destination = form?.querySelector<HTMLInputElement>('#destination');
    const table = duration?.closest('table');
    if (!duration || !destination || !table) return;

    const host = document.createElement('div');
    host.id = arrivalPanelId;
    const shadow = host.attachShadow({ mode: 'open' });
    const style = document.createElement('style');
    style.textContent = styles;
    const container = document.createElement('div');
    container.className = 'arrival';
    shadow.append(style, container);
    table.after(host);

    const arrival = ref<{ server: string | null; local: string } | null>(null);
    let serverClock = '';
    let serverSample: { timestamp: number; sampledAt: number } | null = null;
    let calculatedDestination = destination.value;

    const refresh = (): void => {
        const clock = document.getElementById('server-time')?.textContent.trim() ?? '';
        const now = performance.now();
        if (clock !== serverClock) {
            serverClock = clock;
            const timestamp = parseServerTime(clock);
            serverSample = timestamp === null ? null : { timestamp, sampledAt: now };
        }

        const seconds = parseTravelDuration(duration.textContent);
        const target = destination.value;
        if (seconds === null || target !== calculatedDestination || !/^[a-z]\d{2}(?::\d{2}){3}$/i.test(target)) {
            arrival.value = null;
            return;
        }
        const durationMs = seconds * 1000;
        const local = formatLocalTime(Date.now() + durationMs);
        const server = serverSample && formatServerTime(serverSample.timestamp + (now - serverSample.sampledAt) + durationMs);
        arrival.value = local === null ? null : { server, local };
    };

    createApp({
        render: () => [
            h('strong', t('estimatedArrival')),
            arrival.value ? h('dl', [
                h('dt', t('serverTime')), h('dd', arrival.value.server ?? t('unavailable')),
                h('dt', t('localTime')), h('dd', arrival.value.local),
            ]) : h('div', t('waitingTravel')),
        ],
    }).mount(container);

    const observer = new MutationObserver(() => {
        calculatedDestination = destination.value;
        refresh();
    });
    observer.observe(duration, { childList: true, characterData: true, subtree: true });
    destination.addEventListener('input', refresh);
    refresh();
    window.setInterval(refresh, 1000);
}
