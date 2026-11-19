const serverOffset = 60 * 60 * 1000;
const englishMonths = 'Jan Feb Mar Apr May Jun Jul Aug Sep Oct Nov Dec'.split(' ');
const chineseMonths = '一 二 三 四 五 六 七 八 九 十 十一 十二'.split(' ').map(month => month + '月');

export function parseTravelDuration(text: string): number | null {
    const match = text.trim().match(/^(?:(\d+)\s*(?:h|小时)\s*)?(?:(\d+)\s*(?:m|分钟)\s*)?(?:(\d+)\s*(?:s|秒))?$/i);
    if (!match) return null;
    const [, hours = '0', minutes = '0', seconds = '0'] = match;
    const duration = Number(hours) * 3600 + Number(minutes) * 60 + Number(seconds);
    return Number(minutes) < 60 && Number(seconds) < 60 && Number.isSafeInteger(duration) && duration > 0 ? duration : null;
}

export function parseServerTime(text: string): number | null {
    const numeric = text.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})\s+(\d{2}):(\d{2}):(\d{2})$/);
    const named = numeric ? null : text.match(/^(?:(\d{1,2})\s+(\S+)|(\S+)\s+(\d{1,2}))\s+(\d{4}),\s+(\d{2}):(\d{2}):(\d{2})$/);
    const parts = numeric?.slice(1) ?? (named && [
        named[5], findMonth(named[2] ?? named[3]), named[1] ?? named[4], ...named.slice(6),
    ]);
    if (!parts) return null;
    const [year, month, day, hours, minutes, seconds] = parts.map(Number);
    const date = new Date(Date.UTC(year, month - 1, day, hours, minutes, seconds));
    if (date.getUTCFullYear() !== year || date.getUTCMonth() + 1 !== month || date.getUTCDate() !== day
        || date.getUTCHours() !== hours || date.getUTCMinutes() !== minutes || date.getUTCSeconds() !== seconds) return null;
    return date.getTime() - serverOffset;
}

function findMonth(text: string): number {
    const months = text.endsWith('月') ? chineseMonths : englishMonths;
    return months.indexOf(text) + 1;
}

export function formatServerTime(timestamp: number): string | null {
    return formatClockTime(timestamp + serverOffset);
}

export function formatLocalTime(timestamp: number): string | null {
    const offset = new Date(timestamp).getTimezoneOffset() * 60 * 1000;
    return formatClockTime(timestamp - offset);
}

function formatClockTime(timestamp: number): string | null {
    const date = new Date(timestamp);
    return Number.isFinite(date.getTime()) ? date.toISOString().split('.')[0].replace('T', ' ') : null;
}
