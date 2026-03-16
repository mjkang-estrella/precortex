import {
    addDays,
    parseLocalISODate,
    startOfWeekMonday,
    toLocalISODate,
} from "../utils/date.js";
import {
    cloneProjectDraft,
    createProjectSetupState,
    submitProjectSetupMessage,
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
