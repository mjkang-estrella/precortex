import { assistantIcons } from "./data/assistant.js";
import * as actions from "./state/actions.js";
import { buildAssistantReply } from "./state/assistant-replies.js";
import {
    getCompletedTasks,
    getCurrentAssistantMessages,
    getInboxCount,
    getInboxTasks,
    getProjectCompletedTasks,
    getProjectTasks,
    getProjects,
    getSelectedProject,
    getSelectedTask,
    getTodayTasks,
    getUpcomingGroups,
    getUpcomingSectionKey,
    getWeekDays,
} from "./state/selectors.js";
import { createStore } from "./state/store.js";
import { parseLocalISODate } from "./utils/date.js";
import { renderAssistantPanel } from "./views/assistant-view.js";
import { renderInboxView } from "./views/inbox-view.js";
import { renderTaskModal } from "./views/modal-view.js";
import { renderNavigation } from "./views/navigation-view.js";
import { renderProjectSetupModal } from "./views/project-setup-modal.js";
import { renderProjectView } from "./views/project-view.js";
import { renderTodayView } from "./views/today-view.js";
import { renderUpcomingView } from "./views/upcoming-view.js";

const { state, initialTasks, assistantConfigs } = createStore();
const byId = <T extends HTMLElement>(id: string) => document.getElementById(id) as T;
const mobileViewport = window.matchMedia("(max-width: 1023px)");

const dom = {
    mainView: byId<HTMLElement>("mainView"),
    aiMessages: byId<HTMLElement>("aiMessages"),
    assistantQuickActions: byId<HTMLElement>("assistantQuickActions"),
    assistantTitle: byId<HTMLElement>("assistantTitle"),
    assistantQuickActionsLabel: byId<HTMLElement>("assistantQuickActionsLabel"),
    assistantInputHint: byId<HTMLElement>("assistantInputHint"),
    assistantPanel: byId<HTMLElement>("assistantPanel"),
    navInboxCount: byId<HTMLElement>("navInboxCount"),
    projectNav: byId<HTMLElement>("projectNav"),
    mobileNav: byId<HTMLElement>("mobileNav"),
    mobileDrawerBackdrop: byId<HTMLElement>("mobileDrawerBackdrop"),
    openNavButton: byId<HTMLButtonElement>("openNavButton"),
    reopenAssistantButton: byId<HTMLButtonElement>("reopenAssistantButton"),
    taskModal: byId<HTMLElement>("taskModal"),
    projectSetupModal: byId<HTMLElement>("projectSetupModal"),
    aiInput: byId<HTMLTextAreaElement>("aiInput"),
};

function isMobileViewport() {
    return mobileViewport.matches;
}

if (isMobileViewport()) {
    state.assistantOpen = false;
}

function renderMainView() {
    if (state.currentView === "project") {
        const project = getSelectedProject(state);
        if (!project) {
            state.currentView = "today";
            state.selectedProjectId = null;
            renderMainView();
            return;
        }

        dom.mainView.innerHTML = renderProjectView({
            project,
            todoTasks: getProjectTasks(state, project.id),
            completedTasks: getProjectCompletedTasks(state, project.id),
        });
        return;
    }

    if (state.currentView === "inbox") {
        dom.mainView.innerHTML = renderInboxView({
            inboxTasks: getInboxTasks(state),
        });
        return;
    }

    if (state.currentView === "upcoming") {
        dom.mainView.innerHTML = renderUpcomingView({
            weekDays: getWeekDays(state, state.upcomingWeekStart),
            groups: getUpcomingGroups(state),
        });
        return;
    }

    dom.mainView.innerHTML = renderTodayView({
        todoTasks: getTodayTasks(state),
        completedTasks: getCompletedTasks(state),
    });
}

function updateTaskModal(animate = false) {
    renderTaskModal({
        taskModal: dom.taskModal,
        task: getSelectedTask(state),
        animate,
    });
}

function updateAssistant() {
    const config =
        state.currentView === "project" ? assistantConfigs.project : assistantConfigs[state.currentView];
    renderAssistantPanel({
        config,
        messages: getCurrentAssistantMessages(state),
        assistantIcons,
        dom,
    });
}

function scrollUpcomingTargetIntoView(dateIso) {
    const scrollArea = document.getElementById("upcomingScrollArea");
    if (!scrollArea) return;

    const dateAnchor = scrollArea.querySelector(`[data-anchor-date="${dateIso}"]`);
    if (dateAnchor) {
        dateAnchor.scrollIntoView({ behavior: "smooth", block: "start" });
        return;
    }

    const sectionKey = getUpcomingSectionKey(parseLocalISODate(dateIso));
    const sectionAnchor = scrollArea.querySelector(`[data-anchor-section="${sectionKey}"]`);
    if (sectionAnchor) {
        sectionAnchor.scrollIntoView({ behavior: "smooth", block: "start" });
        return;
    }

    scrollArea.scrollTo({ top: 0, behavior: "smooth" });
}

function closeMobileChrome() {
    if (!isMobileViewport()) return;
    state.mobileNavOpen = false;
    state.assistantOpen = false;
}

function renderChrome() {
    const mobile = isMobileViewport();
    const drawersOpen = mobile && (state.mobileNavOpen || state.assistantOpen);
    const blockingSurfaceOpen = Boolean(getSelectedTask(state) || state.projectSetup.open);

    dom.mobileNav.classList.toggle("translate-x-0", mobile && state.mobileNavOpen);
    dom.mobileNav.classList.toggle("-translate-x-full", mobile && !state.mobileNavOpen);
    dom.mobileNav.classList.toggle("pointer-events-none", mobile && !state.mobileNavOpen);
    dom.mobileNav.classList.toggle("pointer-events-auto", !mobile || state.mobileNavOpen);

    dom.mobileDrawerBackdrop.classList.toggle("opacity-100", drawersOpen);
    dom.mobileDrawerBackdrop.classList.toggle("pointer-events-auto", drawersOpen);
    dom.mobileDrawerBackdrop.classList.toggle("opacity-0", !drawersOpen);
    dom.mobileDrawerBackdrop.classList.toggle("pointer-events-none", !drawersOpen);

    dom.assistantPanel.classList.toggle("translate-x-0", mobile && state.assistantOpen);
    dom.assistantPanel.classList.toggle("translate-x-full", mobile && !state.assistantOpen);
    dom.assistantPanel.classList.toggle("pointer-events-none", mobile && !state.assistantOpen);
    dom.assistantPanel.classList.toggle("pointer-events-auto", !mobile || state.assistantOpen);

    dom.assistantPanel.classList.toggle("lg:w-[340px]", state.assistantOpen);
    dom.assistantPanel.classList.toggle("lg:opacity-100", state.assistantOpen);
    dom.assistantPanel.classList.toggle("lg:scale-100", state.assistantOpen);

    dom.assistantPanel.classList.toggle("lg:w-0", !state.assistantOpen);
    dom.assistantPanel.classList.toggle("lg:opacity-0", !state.assistantOpen);
    dom.assistantPanel.classList.toggle("lg:translate-x-6", !state.assistantOpen);
    dom.assistantPanel.classList.toggle("lg:scale-[0.98]", !state.assistantOpen);
    dom.assistantPanel.classList.toggle("lg:pointer-events-none", !state.assistantOpen);

    const showNavButton = mobile && !state.mobileNavOpen && !blockingSurfaceOpen;
    dom.openNavButton.classList.toggle("opacity-100", showNavButton);
    dom.openNavButton.classList.toggle("translate-y-0", showNavButton);
    dom.openNavButton.classList.toggle("scale-100", showNavButton);
    dom.openNavButton.classList.toggle("pointer-events-auto", showNavButton);
    dom.openNavButton.classList.toggle("opacity-0", !showNavButton);
    dom.openNavButton.classList.toggle("translate-y-4", !showNavButton);
    dom.openNavButton.classList.toggle("scale-90", !showNavButton);
    dom.openNavButton.classList.toggle("pointer-events-none", !showNavButton);

    const showAssistantButton = !state.assistantOpen && !blockingSurfaceOpen;
    dom.reopenAssistantButton.classList.toggle("opacity-100", showAssistantButton);
    dom.reopenAssistantButton.classList.toggle("translate-y-0", showAssistantButton);
    dom.reopenAssistantButton.classList.toggle("scale-100", showAssistantButton);
    dom.reopenAssistantButton.classList.toggle("pointer-events-auto", showAssistantButton);
    dom.reopenAssistantButton.classList.toggle("opacity-0", !showAssistantButton);
    dom.reopenAssistantButton.classList.toggle("translate-y-4", !showAssistantButton);
    dom.reopenAssistantButton.classList.toggle("scale-90", !showAssistantButton);
    dom.reopenAssistantButton.classList.toggle("pointer-events-none", !showAssistantButton);
}

function render() {
    renderNavigation({
        currentView: state.currentView,
        inboxCount: getInboxCount(state),
        navInboxCount: dom.navInboxCount,
        projectNav: dom.projectNav,
        projects: getProjects(state),
        selectedProjectId: state.selectedProjectId,
    });
    renderMainView();
    updateAssistant();
    updateTaskModal();
    renderProjectSetupModal({
        projectSetupModal: dom.projectSetupModal,
        projectSetup: state.projectSetup,
    });
    renderChrome();

    if (state.currentView === "upcoming" && state.pendingUpcomingScrollTarget) {
        const target = state.pendingUpcomingScrollTarget;
        state.pendingUpcomingScrollTarget = null;
        requestAnimationFrame(() => scrollUpcomingTargetIntoView(target));
    }
}

function autoResize(textarea: HTMLInputElement | HTMLTextAreaElement) {
    textarea.style.height = "auto";
    textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`;
}

function sendMessage(textOverride?: string) {
    const view = state.currentView;
    const text = (textOverride ?? dom.aiInput.value).trim();
    if (!text) return;

    if (view === "project") {
        const project = getSelectedProject(state);
        if (!project) return;
        project.bayMessages.push({ sender: "user", text, rich: false, tasks: [] });
    } else {
        state.messagesByView[view].push({ sender: "user", text, rich: false, tasks: [] });
    }
    updateAssistant();

    dom.aiInput.value = "";
    dom.aiInput.style.height = "auto";

    const reply = buildAssistantReply({ view, text, state, assistantConfigs });
    setTimeout(() => {
        const targetMessages =
            view === "project"
                ? getSelectedProject(state)?.bayMessages
                : state.messagesByView[view];
        if (!targetMessages) return;

        targetMessages.push({
            sender: "assistant",
            text: reply.text,
            tasks: reply.tasks,
            rich: reply.tasks.length > 0,
        });
        if (state.currentView === view) {
            updateAssistant();
        }
    }, 500);
}

function sendProjectSetupMessage() {
    const input = document.getElementById("projectSetupInput") as HTMLTextAreaElement | null;
    if (!input) return;

    const text = input.value.trim();
    if (!text) return;

    actions.submitProjectSetupInput(state, text);
    input.value = "";
    input.style.height = "auto";
    render();
}

function trapFocus(container: HTMLElement, event: KeyboardEvent) {
    const focusable = container.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
    );
    if (!focusable.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
    }
}

document.addEventListener("keydown", (event) => {
    const target = event.target as HTMLInputElement | HTMLTextAreaElement | null;

    if (event.key === "Tab") {
        const dialog = dom.taskModal.querySelector('[role="dialog"]') as HTMLElement | null;
        if (dialog) { trapFocus(dialog, event); return; }
        const setupDialog = dom.projectSetupModal.querySelector('[role="dialog"]') as HTMLElement | null;
        if (setupDialog) { trapFocus(setupDialog, event); return; }
    }

    if (event.key === "Escape" && getSelectedTask(state)) {
        actions.closeTaskModal(state);
        updateTaskModal();
        return;
    }

    if (event.key === "Escape" && state.projectSetup.open) {
        actions.closeProjectSetup(state);
        render();
        return;
    }

    if (target?.id === "taskInput" && event.key === "Enter") {
        event.preventDefault();
        const value = target.value.trim();
        if (!value) return;
        actions.addTask(state, value);
        target.value = "";
        render();
        return;
    }

    if (target?.id === "aiInput" && event.key === "Enter" && !event.shiftKey) {
        event.preventDefault();
        sendMessage();
    }

    if (target?.id === "projectSetupInput" && event.key === "Enter" && !event.shiftKey) {
        event.preventDefault();
        sendProjectSetupMessage();
    }
});

document.addEventListener("input", (event) => {
    const target = event.target as HTMLInputElement | HTMLTextAreaElement | null;
    if (!target) return;

    if (target.id === "modalTitleInput") {
        actions.updateTaskField(state, target.dataset.taskId, "title", target.value);
        renderMainView();
        return;
    }

    if (target.id === "modalDescriptionInput") {
        actions.updateTaskField(state, target.dataset.taskId, "description", target.value);
        renderMainView();
        return;
    }

    if (target.id === "aiInput" || target.id === "projectSetupInput") {
        autoResize(target);
        return;
    }

    if (target.id === "projectDraftName") {
        actions.updateProjectDraftField(state, "name", target.value);
        return;
    }

    if (target.id === "projectDraftDeadline") {
        actions.updateProjectDraftField(state, "deadline", target.value);
        return;
    }

    if (target.id === "projectDraftSummary") {
        actions.updateProjectDraftField(state, "summary", target.value);
        autoResize(target);
        return;
    }

    if (target.id === "projectDraftNextStep") {
        actions.updateProjectDraftField(state, "nextStep", target.value);
        return;
    }

    if (target.dataset.action === "edit-project-draft-task") {
        actions.updateProjectDraftTask(state, target.dataset.taskId, target.value);
    }
});

document.addEventListener("click", (event) => {
    const target = event.target as HTMLElement | null;
    const actionElement = target?.closest("[data-action]") as (HTMLElement & { dataset: DOMStringMap }) | null;
    if (!actionElement) return;

    const { action, taskId, suggestion, view, direction, date, destination } = actionElement.dataset;

    if (action === "switch-view") {
        if (actions.setView(state, view)) {
            state.mobileNavOpen = false;
            render();
        }
        return;
    }

    if (action === "shift-week") {
        actions.shiftUpcomingWeek(state, Number(direction));
        render();
        return;
    }

    if (action === "select-upcoming-date") {
        actions.selectUpcomingDate(state, date);
        render();
        return;
    }

    if (action === "open-project") {
        actions.openProject(state, actionElement.dataset.projectId);
        state.mobileNavOpen = false;
        render();
        return;
    }

    if (action === "schedule-task") {
        const row = actionElement.closest(".task-row") as HTMLElement | null;
        if (row) {
            row.classList.add("task-removing");
            setTimeout(() => {
                actions.scheduleInboxTask(state, taskId, destination);
                render();
            }, 250);
        } else {
            actions.scheduleInboxTask(state, taskId, destination);
            render();
        }
        return;
    }

    if (action === "toggle" || action === "modal-toggle-task") {
        const row = action === "toggle"
            ? (actionElement.closest(".task-row") as HTMLElement | null)
            : null;
        if (row) {
            row.classList.add("task-completing");
        }
        actions.toggleTask(state, taskId);
        render();
        return;
    }

    if (action === "toggle-subtask") {
        actions.toggleSubtask(state, taskId, actionElement.dataset.subtaskId);
        updateTaskModal();
        return;
    }

    if (action === "open-task") {
        actions.openTaskModal(state, taskId);
        closeMobileChrome();
        updateTaskModal(true);
        renderChrome();
        return;
    }

    if (action === "close-modal") {
        actions.closeTaskModal(state);
        updateTaskModal();
        return;
    }

    if (action === "assistant-suggestion") {
        sendMessage(suggestion);
        return;
    }

    if (action === "open-project-setup") {
        actions.openProjectSetup(state);
        closeMobileChrome();
        render();
        requestAnimationFrame(() => {
            (document.getElementById("projectSetupInput") as HTMLTextAreaElement | null)?.focus();
        });
        return;
    }

    if (action === "close-project-setup") {
        actions.closeProjectSetup(state);
        render();
        return;
    }

    if (action === "restart-project-setup") {
        actions.restartProjectSetup(state);
        render();
        requestAnimationFrame(() => {
            (document.getElementById("projectSetupInput") as HTMLTextAreaElement | null)?.focus();
        });
        return;
    }

    if (action === "send-project-setup") {
        sendProjectSetupMessage();
        return;
    }

    if (action === "confirm-project-draft") {
        actions.confirmProjectDraft(state);
        render();
        return;
    }

    if (action === "send-message") {
        sendMessage();
        return;
    }

    if (action === "reset-inbox") {
        actions.resetInbox(state, initialTasks);
        render();
        return;
    }

    if (action === "close-assistant") {
        state.assistantOpen = false;
        renderChrome();
        return;
    }

    if (action === "open-nav") {
        state.mobileNavOpen = true;
        if (isMobileViewport()) {
            state.assistantOpen = false;
        }
        renderChrome();
        return;
    }

    if (action === "close-drawers") {
        closeMobileChrome();
        renderChrome();
        return;
    }

    if (action === "reopen-assistant") {
        state.assistantOpen = true;
        if (isMobileViewport()) {
            state.mobileNavOpen = false;
        }
        renderChrome();
        return;
    }
});

mobileViewport.addEventListener("change", (event) => {
    state.mobileNavOpen = false;
    if (event.matches) {
        state.assistantOpen = false;
    }
    render();
});

render();
