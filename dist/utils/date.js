export const DAY_MS = 24 * 60 * 60 * 1000;
export function startOfLocalDay(value = new Date()) {
    const date = value instanceof Date ? new Date(value) : new Date(value);
    date.setHours(0, 0, 0, 0);
    return date;
}
export function parseLocalISODate(isoDate) {
    const [year, month, day] = isoDate.split("-").map(Number);
    return new Date(year, month - 1, day);
}
export function toLocalISODate(value) {
    const date = startOfLocalDay(value);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
}
export function addDays(value, days) {
    const date = startOfLocalDay(value);
    date.setDate(date.getDate() + days);
    return date;
}
export function diffInDays(dateA, dateB) {
    return Math.round((startOfLocalDay(dateA).getTime() - startOfLocalDay(dateB).getTime()) / DAY_MS);
}
export function startOfWeekMonday(value) {
    const date = startOfLocalDay(value);
    const day = date.getDay();
    const offset = day === 0 ? -6 : 1 - day;
    return addDays(date, offset);
}
export function endOfWeekSunday(value) {
    return addDays(startOfWeekMonday(value), 6);
}
export const TODAY = startOfLocalDay(new Date());
export const TODAY_ISO = toLocalISODate(TODAY);
export const formatters = {
    weekdayShort: new Intl.DateTimeFormat(undefined, { weekday: "short" }),
    weekdayLong: new Intl.DateTimeFormat(undefined, { weekday: "long" }),
    monthDay: new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric" }),
    modalDate: new Intl.DateTimeFormat(undefined, {
        weekday: "long",
        month: "short",
        day: "numeric",
    }),
};
