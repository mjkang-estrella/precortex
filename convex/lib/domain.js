const DAY_MS = 24 * 60 * 60 * 1000;

function startOfLocalDay(value = new Date()) {
    const date = value instanceof Date ? new Date(value) : new Date(value);
    date.setHours(0, 0, 0, 0);
    return date;
}

function parseLocalISODate(isoDate) {
    const [year, month, day] = isoDate.split("-").map(Number);
    return new Date(year, month - 1, day);
}

function addDays(value, days) {
    const date = startOfLocalDay(value);
    date.setDate(date.getDate() + days);
    return date;
}

function diffInDays(dateA, dateB) {
    return Math.round(
        (startOfLocalDay(dateA).getTime() - startOfLocalDay(dateB).getTime()) / DAY_MS,
    );
}

function startOfWeekMonday(value) {
    const date = startOfLocalDay(value);
    const day = date.getDay();
    const offset = day === 0 ? -6 : 1 - day;
    return addDays(date, offset);
}

function endOfWeekSunday(value) {
    return addDays(startOfWeekMonday(value), 6);
}

const TODAY_ISO = (() => {
    const date = startOfLocalDay(new Date());
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
})();

export function requireTrimmedText(value, fieldName) {
    const text = typeof value === "string" ? value.trim() : "";
    if (!text) {
        throw new Error(`${fieldName} is required.`);
    }

    return text;
}

export function normalizeOptionalIsoDate(value, fieldName = "date") {
    if (value === undefined || value === null || value === "") {
        return undefined;
    }

    const text = String(value).trim();
    if (!/^\d{4}-\d{2}-\d{2}$/.test(text)) {
        throw new Error(`${fieldName} must use YYYY-MM-DD.`);
    }

    return text;
}

export function getTaskListKey(task, todayIso = TODAY_ISO) {
    const today = parseLocalISODate(todayIso);

    if (task.status === "completed") {
        return task.projectId ? `project-completed:${task.projectId}` : "today-completed";
    }

    if (!task.dueAt && !task.projectId) {
        return "inbox";
    }

    if (task.projectId && !task.dueAt) {
        return `project-todo:${task.projectId}`;
    }

    if (!task.dueAt) {
        return task.projectId ? `project-todo:${task.projectId}` : "inbox";
    }

    const dueDate = parseLocalISODate(task.dueAt);
    const diff = diffInDays(dueDate, today);

    if (diff <= 0) {
        return "today-todo";
    }

    if (diff === 1) {
        return "upcoming-tomorrow";
    }

    if (dueDate <= endOfWeekSunday(today)) {
        return "upcoming-this-week";
    }

    return "upcoming-later";
}

export function assertTaskMatchesList(task, listKey, todayIso = TODAY_ISO) {
    const taskListKey = getTaskListKey(task, todayIso);
    if (taskListKey !== listKey) {
        throw new Error("Invalid reorder target for this task list.");
    }
}
