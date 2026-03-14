import {
    TODAY,
    TODAY_ISO,
    addDays,
    diffInDays,
    endOfWeekSunday,
    formatters,
    parseLocalISODate,
    startOfWeekMonday,
    toLocalISODate,
} from "../utils/date.js";

export function cloneTask(task) {
    return {
        ...task,
        tags: task.tags.map((tag) => ({ ...tag })),
        subtasks: task.subtasks.map((subtask) => ({ ...subtask })),
    };
}

export function sortTasksByDueDate(tasks) {
    return [...tasks].sort((left, right) => {
        const leftValue = left.dueAt
            ? parseLocalISODate(left.dueAt).getTime()
            : Number.POSITIVE_INFINITY;
        const rightValue = right.dueAt
            ? parseLocalISODate(right.dueAt).getTime()
            : Number.POSITIVE_INFINITY;
        return leftValue - rightValue || left.title.localeCompare(right.title);
    });
}

export function getInboxTasks(state) {
    return state.tasks.filter((task) => task.status === "todo" && !task.dueAt);
}

export function getTask(state, taskId) {
    return state.tasks.find((task) => task.id === taskId) || null;
}

export function getSelectedTask(state) {
    return state.modalTaskId ? getTask(state, state.modalTaskId) : null;
}

export function getTaskDueMeta(task) {
    if (!task.dueAt) {
        return {
            label: null,
            longLabel: "unscheduled",
            tone: "none",
            diff: null,
            date: null,
        };
    }

    const date = parseLocalISODate(task.dueAt);
    const diff = diffInDays(date, TODAY);
    let label = formatters.monthDay.format(date);
    let longLabel = formatters.modalDate.format(date);
    let tone = "upcoming";

    if (diff === 0) {
        label = "Today";
        longLabel = "today";
        tone = "today";
    } else if (diff === 1) {
        label = "Tomorrow";
        longLabel = "tomorrow";
    } else if (diff === -1) {
        label = "Yesterday";
        longLabel = "yesterday";
        tone = "overdue";
    } else if (diff < -1) {
        tone = "overdue";
    } else if (diff > 1 && diff <= 6) {
        label = formatters.weekdayLong.format(date);
    }

    return { label, longLabel, tone, diff, date };
}

export function getTodayTasks(state) {
    return sortTasksByDueDate(
        state.tasks.filter(
            (task) => task.status === "todo" && task.dueAt && getTaskDueMeta(task).diff <= 0,
        ),
    );
}

export function getCompletedTasks(state) {
    return [...state.tasks].filter((task) => task.status === "completed");
}

export function getInboxCount(state) {
    return getInboxTasks(state).length;
}

export function getFutureTodoTasks(state) {
    return sortTasksByDueDate(
        state.tasks.filter(
            (task) => task.status === "todo" && task.dueAt && getTaskDueMeta(task).diff > 0,
        ),
    );
}

export function getUpcomingSectionKey(date) {
    const diff = diffInDays(date, TODAY);
    if (diff === 1) return "tomorrow";
    if (date <= endOfWeekSunday(TODAY)) return "this-week";
    return "later";
}

export function getUpcomingGroups(state) {
    const groups = {
        tomorrow: [],
        "this-week": [],
        later: [],
    };

    getFutureTodoTasks(state).forEach((task) => {
        groups[getUpcomingSectionKey(parseLocalISODate(task.dueAt))].push(task);
    });

    return groups;
}

export function getWeekDays(state, weekStartIso) {
    const weekStart = parseLocalISODate(weekStartIso);
    const futureTasks = getFutureTodoTasks(state);

    return Array.from({ length: 7 }, (_, index) => {
        const date = addDays(weekStart, index);
        const iso = toLocalISODate(date);

        return {
            date,
            iso,
            hasTasks: futureTasks.some((task) => task.dueAt === iso),
            isToday: iso === TODAY_ISO,
            isSelected: iso === state.selectedUpcomingDate,
        };
    });
}

export function getDateFromInboxDestination(destination) {
    if (destination === "today") return TODAY_ISO;
    if (destination === "tomorrow") return toLocalISODate(addDays(TODAY, 1));
    if (destination === "next-week") return toLocalISODate(addDays(startOfWeekMonday(TODAY), 7));
    return toLocalISODate(addDays(TODAY, 30));
}

export function getInboxSeedTasks(initialTasks) {
    return initialTasks
        .filter((task) => task.status === "todo" && !task.dueAt)
        .map(cloneTask);
}
