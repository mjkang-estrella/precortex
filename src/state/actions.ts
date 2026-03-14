import {
    TODAY_ISO,
    addDays,
    parseLocalISODate,
    startOfWeekMonday,
    toLocalISODate,
} from "../utils/date.js";
import { getDateFromInboxDestination, getInboxSeedTasks } from "./selectors.js";
import {
    buildProjectId,
    cloneProjectDraft,
    createProjectSetupState,
    parseProjectDeadlineInput,
    submitProjectSetupMessage,
} from "./project-bay.js";

export function addTask(state, title) {
    const isInbox = state.currentView === "inbox";
    const isProject = state.currentView === "project" && state.selectedProjectId;
    state.tasks.unshift({
        id: `task-${state.nextTaskId++}`,
        title,
        status: "todo",
        dueAt: isInbox || isProject ? null : TODAY_ISO,
        projectId: isProject ? state.selectedProjectId : null,
        tags: [{ label: "new", color: "emerald" }],
        description: isInbox
            ? "New inbox item waiting to be triaged."
            : isProject
              ? "New project task added from the project view."
            : "New task added from the quick entry field. Open it to add more detail.",
        sourceLabel: null,
        isStale: false,
        project: isProject ? "project" : "inbox",
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
    if (view !== "project") {
        state.selectedProjectId = null;
    }
    return true;
}

export function resetInbox(state, initialTasks) {
    const preservedTasks = state.tasks.filter(
        (task) => task.status !== "todo" || task.dueAt || task.projectId,
    );
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

export function openProject(state, projectId) {
    state.currentView = "project";
    state.selectedProjectId = projectId;
}

export function openProjectSetup(state) {
    state.projectSetup = createProjectSetupState(true);
}

export function closeProjectSetup(state) {
    state.projectSetup = createProjectSetupState(false);
}

export function restartProjectSetup(state) {
    state.projectSetup = createProjectSetupState(true);
}

export function submitProjectSetupInput(state, text) {
    state.projectSetup = submitProjectSetupMessage(state.projectSetup, text);
}

export function updateProjectDraftField(state, field, value) {
    if (!state.projectSetup.draft) return;

    const draft = cloneProjectDraft(state.projectSetup.draft);
    draft[field] = value;

    if (field === "nextStep" && draft.tasks.length) {
        draft.tasks[0] = { ...draft.tasks[0], title: value };
    }

    if (field === "name") {
        draft.tasks = draft.tasks.map((task, index) => {
            if (index === 1) {
                return {
                    ...task,
                    title: `Define the success criteria for ${value}`,
                };
            }

            return task;
        });
    }

    state.projectSetup.draft = draft;
}

export function updateProjectDraftTask(state, taskId, value) {
    if (!state.projectSetup.draft) return;

    const draft = cloneProjectDraft(state.projectSetup.draft);
    draft.tasks = draft.tasks.map((task) => (task.id === taskId ? { ...task, title: value } : task));

    if (draft.tasks[0]?.id === taskId) {
        draft.nextStep = value;
    }

    state.projectSetup.draft = draft;
}

export function confirmProjectDraft(state) {
    const draft = state.projectSetup.draft;
    if (!draft) return;
    const resolvedDeadline = parseProjectDeadlineInput(draft.deadline) || draft.deadline;

    const projectId = buildProjectId(draft.name, state.nextProjectId++);
    const bayMessages = state.projectSetup.messages.map((message) => ({
        ...message,
        tasks: message.tasks.map((task) => ({ ...task })),
    }));

    bayMessages.push({
        sender: "assistant",
        text: `project created. start with: ${draft.nextStep.toLowerCase()}.`,
        rich: false,
        tasks: [],
    });

    state.projects.unshift({
        id: projectId,
        name: draft.name,
        deadline: resolvedDeadline,
        summary: draft.summary,
        nextStep: draft.nextStep,
        bayMessages,
        createdLabel: "created just now",
    });

    const createdTasks = draft.tasks.map((task, index) => ({
        id: `task-${state.nextTaskId++}`,
        title: task.title,
        status: "todo",
        dueAt: index === 0 ? TODAY_ISO : null,
        projectId,
        tags: [],
        description: task.description || "",
        sourceLabel: null,
        isStale: false,
        project: draft.name,
        priority: index === 0 ? "high" : "medium",
        createdLabel: "created just now",
        subtasks: [],
    }));

    state.tasks = [...createdTasks, ...state.tasks];
    state.projectSetup = createProjectSetupState(false);
    state.currentView = "project";
    state.selectedProjectId = projectId;
    state.assistantOpen = true;
}
