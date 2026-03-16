import {
    addDays,
    parseLocalISODate,
    startOfWeekMonday,
    toLocalISODate,
} from "../utils/date.js";
import {
    addProjectSetupRoutineItem,
    addProjectSetupTask,
    applyProjectSetupReply,
    beginProjectSetupRequest,
    createProjectSetupState,
    failProjectSetupRequest,
    removeProjectSetupRoutineItem,
    removeProjectSetupTask,
    setProjectSetupModeOverride,
    updateProjectSetupBriefField,
    updateProjectSetupRoutineField,
    updateProjectSetupRoutineItem,
    updateProjectSetupTaskField,
} from "./project-bay.js";

export function openTaskModal(state, taskId) {
    cancelTaskCardEdit(state);
    state.modalTaskId = taskId;
    state.modalSubtaskComposerOpen = false;
    state.modalSubtaskDraft = "";
}

export function closeTaskModal(state) {
    state.modalTaskId = null;
    state.modalSubtaskComposerOpen = false;
    state.modalSubtaskDraft = "";
}

export function startTaskCardEdit(state, taskId) {
    const task = state.tasks.find((item) => item.id === taskId);
    if (!task) return;

    state.editingTaskId = taskId;
    state.editingTaskDraft = {
        title: task.title,
        description: task.description || "",
    };
}

export function updateTaskCardDraftField(state, field, value) {
    if (!state.editingTaskDraft) return;

    state.editingTaskDraft = {
        ...state.editingTaskDraft,
        [field]: value,
    };
}

export function cancelTaskCardEdit(state) {
    state.editingTaskId = null;
    state.editingTaskDraft = null;
}

export function openModalSubtaskComposer(state) {
    state.modalSubtaskComposerOpen = true;
    state.modalSubtaskDraft = "";
}

export function closeModalSubtaskComposer(state) {
    state.modalSubtaskComposerOpen = false;
    state.modalSubtaskDraft = "";
}

export function updateModalSubtaskDraft(state, value) {
    state.modalSubtaskDraft = value;
}

export function setView(state, view) {
    if (view === state.currentView) return false;
    cancelTaskCardEdit(state);
    state.currentView = view;
    if (view !== "project") {
        state.selectedProjectId = null;
    }
    return true;
}

export function shiftUpcomingWeek(state, direction) {
    cancelTaskCardEdit(state);
    const currentSelected = parseLocalISODate(state.selectedUpcomingDate);
    const nextSelected = addDays(currentSelected, direction * 7);
    state.selectedUpcomingDate = toLocalISODate(nextSelected);
    state.upcomingWeekStart = toLocalISODate(startOfWeekMonday(nextSelected));
    state.pendingUpcomingScrollTarget = state.selectedUpcomingDate;
}

export function selectUpcomingDate(state, dateIso) {
    cancelTaskCardEdit(state);
    const selectedDate = parseLocalISODate(dateIso);
    state.selectedUpcomingDate = dateIso;
    state.upcomingWeekStart = toLocalISODate(startOfWeekMonday(selectedDate));
    state.pendingUpcomingScrollTarget = dateIso;
}

export function openProject(state, projectId) {
    cancelTaskCardEdit(state);
    state.currentView = "project";
    state.selectedProjectId = projectId;
}

export function openProjectSetup(state) {
    cancelTaskCardEdit(state);
    const previousView =
        state.currentView === "project-setup"
            ? state.projectSetup.previousView || "today"
            : state.currentView;

    if (state.projectSetup.open) {
        state.projectSetup = {
            ...state.projectSetup,
            open: true,
            previousView,
        };
    } else {
        state.projectSetup = createProjectSetupState(true, previousView);
    }

    state.currentView = "project-setup";
}

export function closeProjectSetup(state) {
    const previousView = state.projectSetup.previousView || "today";
    state.projectSetup = createProjectSetupState(false, previousView);

    if (state.currentView === "project-setup") {
        if (previousView === "project" && state.selectedProjectId) {
            state.currentView = "project";
        } else {
            state.currentView = previousView === "project-setup" ? "today" : previousView;
        }
    }
}

export function restartProjectSetup(state) {
    const previousView = state.projectSetup.previousView || "today";
    state.projectSetup = createProjectSetupState(true, previousView);
    state.currentView = "project-setup";
}

export function beginProjectSetupInput(state, text = "") {
    state.projectSetup = beginProjectSetupRequest(state.projectSetup, text);
}

export function receiveProjectSetupReply(state, reply) {
    state.projectSetup = applyProjectSetupReply(state.projectSetup, reply);
}

export function failProjectSetupReply(state, message) {
    state.projectSetup = failProjectSetupRequest(state.projectSetup, message);
}

export function updateProjectBriefField(state, field, value) {
    state.projectSetup = updateProjectSetupBriefField(state.projectSetup, field, value);
}

export function setProjectSetupMode(state, mode) {
    state.projectSetup = setProjectSetupModeOverride(state.projectSetup, mode);
}

export function updateProjectSetupTaskFieldValue(state, taskId, field, value) {
    state.projectSetup = updateProjectSetupTaskField(state.projectSetup, taskId, field, value);
}

export function addProjectSetupStarterTask(state) {
    state.projectSetup = addProjectSetupTask(state.projectSetup);
}

export function removeProjectSetupStarterTask(state, taskId) {
    state.projectSetup = removeProjectSetupTask(state.projectSetup, taskId);
}

export function updateProjectRoutineField(state, field, value) {
    state.projectSetup = updateProjectSetupRoutineField(state.projectSetup, field, value);
}

export function updateProjectRoutineItem(state, listKey, index, value) {
    state.projectSetup = updateProjectSetupRoutineItem(state.projectSetup, listKey, index, value);
}

export function addProjectRoutineItem(state, listKey) {
    state.projectSetup = addProjectSetupRoutineItem(state.projectSetup, listKey);
}

export function removeProjectRoutineItem(state, listKey, index) {
    state.projectSetup = removeProjectSetupRoutineItem(state.projectSetup, listKey, index);
}
