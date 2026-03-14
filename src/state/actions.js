import {
    TODAY_ISO,
    addDays,
    parseLocalISODate,
    startOfWeekMonday,
    toLocalISODate,
} from "../utils/date.js";
import { getDateFromInboxDestination, getInboxSeedTasks } from "./selectors.js";

export function addTask(state, title) {
    const isInbox = state.currentView === "inbox";
    state.tasks.unshift({
        id: `task-${state.nextTaskId++}`,
        title,
        status: "todo",
        dueAt: isInbox ? null : TODAY_ISO,
        tags: [{ label: "new", color: "emerald" }],
        description: isInbox
            ? "New inbox item waiting to be triaged."
            : "New task added from the quick entry field. Open it to add more detail.",
        sourceLabel: null,
        isStale: false,
        project: "inbox",
        priority: "none",
        createdLabel: "created just now",
        subtasks: [],
    });
}

export function scheduleInboxTask(state, taskId, destination) {
    const dueAt = getDateFromInboxDestination(destination);
    state.tasks = state.tasks.map((task) => {
        if (task.id !== taskId) return task;
        return {
            ...task,
            dueAt,
            sourceLabel: null,
            isStale: false,
        };
    });
}

export function toggleTask(state, taskId) {
    const index = state.tasks.findIndex((task) => task.id === taskId);
    if (index === -1) return;

    const task = { ...state.tasks[index] };
    state.tasks.splice(index, 1);

    if (task.status === "todo") {
        task.status = "completed";
        state.tasks.push(task);
    } else {
        task.status = "todo";
        state.tasks.unshift(task);
    }
}

export function openTaskModal(state, taskId) {
    state.modalTaskId = taskId;
}

export function closeTaskModal(state) {
    state.modalTaskId = null;
}

export function updateTaskField(state, taskId, field, value) {
    state.tasks = state.tasks.map((task) =>
        task.id === taskId ? { ...task, [field]: value } : task,
    );
}

export function toggleSubtask(state, taskId, subtaskId) {
    state.tasks = state.tasks.map((task) => {
        if (task.id !== taskId) return task;

        return {
            ...task,
            subtasks: task.subtasks.map((subtask) =>
                subtask.id === subtaskId ? { ...subtask, done: !subtask.done } : subtask,
            ),
        };
    });
}

export function setView(state, view) {
    if (view === state.currentView) return false;
    state.currentView = view;
    return true;
}

export function resetInbox(state, initialTasks) {
    const preservedTasks = state.tasks.filter((task) => task.status !== "todo" || task.dueAt);
    state.tasks = [...getInboxSeedTasks(initialTasks), ...preservedTasks];
}

export function shiftUpcomingWeek(state, direction) {
    const currentSelected = parseLocalISODate(state.selectedUpcomingDate);
    const nextSelected = addDays(currentSelected, direction * 7);
    state.selectedUpcomingDate = toLocalISODate(nextSelected);
    state.upcomingWeekStart = toLocalISODate(startOfWeekMonday(nextSelected));
    state.pendingUpcomingScrollTarget = state.selectedUpcomingDate;
}

export function selectUpcomingDate(state, dateIso) {
    const selectedDate = parseLocalISODate(dateIso);
    state.selectedUpcomingDate = dateIso;
    state.upcomingWeekStart = toLocalISODate(startOfWeekMonday(selectedDate));
    state.pendingUpcomingScrollTarget = dateIso;
}
