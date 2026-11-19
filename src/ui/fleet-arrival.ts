import { createApp, h, ref } from 'vue';
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

    const chinese = document.getElementById('translation_h')?.textContent.trim() === '小时';
    const labels = chinese
        ? { title: '预计到达', server: '服务器时间', local: '本地时间', unavailable: '无法取得', waiting: '等待游戏计算航行时间。' }
        : { title: 'Estimated arrival', server: 'Server time', local: 'Local time', unavailable: 'Unavailable', waiting: 'Waiting for the game to calculate travel time.' };
    const host = document.createElement('div');
    host.id = arrivalPanelId;
    const shadow = host.attachShadow({ mode: 'open' });
    const style = document.createElement('style');
    style.textContent = styles;
    const container = document.createElement('div');
    container.className = 'arrival';
    shadow.append(style, container);
    table.after(host);

    const arrival = ref<{ server: string; local: string } | null>(null);
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
        arrival.value = local === null ? null : { server: server ?? labels.unavailable, local };
    };

    createApp({
        render: () => [
            h('strong', labels.title),
            arrival.value ? h('dl', [
                h('dt', labels.server), h('dd', arrival.value.server),
                h('dt', labels.local), h('dd', arrival.value.local),
            ]) : h('div', labels.waiting),
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
