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

function getCreatedLabel(createdAt) {
    if (!createdAt) return "added recently";

    const diffMs = TODAY.getTime() - new Date(createdAt).getTime();
    const hours = Math.round(diffMs / (60 * 60 * 1000));

    if (hours <= 0) return "added just now";
    if (hours === 1) return "added 1 hour ago";
    if (hours < 24) return `added ${hours} hours ago`;

    const days = Math.round(hours / 24);
    if (days === 1) return "added yesterday";
    if (days < 7) return `added ${days} days ago`;

    return "added recently";
}

function decorateTask(state, task) {
    const project = task.projectId ? getProject(state, task.projectId) : null;
    return {
        ...task,
        projectName: project?.name || "inbox",
        createdLabel: getCreatedLabel(task.createdAt),
    };
}

export function getInboxTasks(state) {
    return state.tasks
        .filter((task) => task.status === "todo" && !task.dueAt && !task.projectId)
        .map((task) => decorateTask(state, task));
}

export function getTask(state, taskId) {
    const task = state.tasks.find((task) => task.id === taskId);
    return task ? decorateTask(state, task) : null;
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
    return state.tasks
        .filter((task) => task.status === "todo" && task.dueAt && getTaskDueMeta(task).diff <= 0)
        .map((task) => decorateTask(state, task));
}

export function getCompletedTasks(state) {
    return [...state.tasks]
        .filter((task) => task.status === "completed")
        .map((task) => decorateTask(state, task));
}

export function getInboxCount(state) {
    return getInboxTasks(state).length;
}

export function getFutureTodoTasks(state) {
    return state.tasks
        .filter((task) => task.status === "todo" && task.dueAt && getTaskDueMeta(task).diff > 0)
        .map((task) => decorateTask(state, task));
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

export function getProjects(state) {
    return [...state.projects];
}

export function getProject(state, projectId) {
    return state.projects.find((project) => project.id === projectId) || null;
}

export function getSelectedProject(state) {
    return state.selectedProjectId ? getProject(state, state.selectedProjectId) : null;
}

export function getProjectTasks(state, projectId) {
    return state.tasks
        .filter((task) => task.projectId === projectId && task.status === "todo")
        .map((task) => decorateTask(state, task));
}

export function getProjectCompletedTasks(state, projectId) {
    return state.tasks
        .filter((task) => task.projectId === projectId && task.status === "completed")
        .map((task) => decorateTask(state, task));
}

export function getCurrentAssistantMessages(state) {
    if (state.currentView === "project") {
        return state.selectedProjectId
            ? state.projectMessagesByProjectId[state.selectedProjectId] || []
            : [];
    }

    return state.messagesByView[state.currentView] || [];
}
