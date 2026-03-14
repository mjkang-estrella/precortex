import { assistantIcons } from "./data/assistant.js";
import * as actions from "./state/actions.js";
import { buildAssistantReply } from "./state/assistant-replies.js";
import {
    getCompletedTasks,
    getInboxCount,
    getInboxTasks,
    getSelectedTask,
    getTodayTasks,
    getUpcomingGroups,
    getUpcomingSectionKey,
    getWeekDays,
} from "./state/selectors.js";
import { createStore } from "./state/store.js";
import { parseLocalISODate } from "./utils/date.js";
import { renderAssistantPanel, renderAssistantVisibility } from "./views/assistant-view.js";
import { renderInboxView } from "./views/inbox-view.js";
import { renderTaskModal } from "./views/modal-view.js";
import { renderNavigation } from "./views/navigation-view.js";
import { renderTodayView } from "./views/today-view.js";
import { renderUpcomingView } from "./views/upcoming-view.js";

const { state, initialTasks, assistantConfigs } = createStore();

const dom = {
    mainView: document.getElementById("mainView"),
    aiMessages: document.getElementById("aiMessages"),
    assistantQuickActions: document.getElementById("assistantQuickActions"),
    assistantTitle: document.getElementById("assistantTitle"),
    assistantQuickActionsLabel: document.getElementById("assistantQuickActionsLabel"),
    assistantInputHint: document.getElementById("assistantInputHint"),
    assistantPanel: document.getElementById("assistantPanel"),
    navInboxCount: document.getElementById("navInboxCount"),
    reopenAssistantButton: document.getElementById("reopenAssistantButton"),
    taskModal: document.getElementById("taskModal"),
    aiInput: document.getElementById("aiInput"),
};

function renderMainView() {
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
    renderAssistantPanel({
        currentView: state.currentView,
        messagesByView: state.messagesByView,
        assistantConfigs,
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

function render() {
    renderNavigation({
        currentView: state.currentView,
        inboxCount: getInboxCount(state),
        navInboxCount: dom.navInboxCount,
    });
    renderMainView();
    updateAssistant();
    renderAssistantVisibility({
        assistantOpen: state.assistantOpen,
        assistantPanel: dom.assistantPanel,
        reopenAssistantButton: dom.reopenAssistantButton,
    });
    updateTaskModal();

    if (state.currentView === "upcoming" && state.pendingUpcomingScrollTarget) {
        const target = state.pendingUpcomingScrollTarget;
        state.pendingUpcomingScrollTarget = null;
        requestAnimationFrame(() => scrollUpcomingTargetIntoView(target));
    }
}

function autoResize(textarea) {
    textarea.style.height = "auto";
    textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`;
}

function sendMessage(textOverride) {
    const view = state.currentView;
    const text = (textOverride ?? dom.aiInput.value).trim();
    if (!text) return;

    state.messagesByView[view].push({ sender: "user", text, rich: false, tasks: [] });
    updateAssistant();

    dom.aiInput.value = "";
    dom.aiInput.style.height = "auto";

    const reply = buildAssistantReply({ view, text, state, assistantConfigs });
    setTimeout(() => {
        state.messagesByView[view].push({
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

document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && getSelectedTask(state)) {
        actions.closeTaskModal(state);
        updateTaskModal();
        return;
    }

    if (event.target.id === "taskInput" && event.key === "Enter") {
        event.preventDefault();
        const value = event.target.value.trim();
        if (!value) return;
        actions.addTask(state, value);
        event.target.value = "";
        render();
        return;
    }

    if (event.target.id === "aiInput" && event.key === "Enter" && !event.shiftKey) {
        event.preventDefault();
        sendMessage();
    }
});

document.addEventListener("input", (event) => {
    if (event.target.id === "modalTitleInput") {
        actions.updateTaskField(state, event.target.dataset.taskId, "title", event.target.value);
        renderMainView();
        return;
    }

    if (event.target.id === "modalDescriptionInput") {
        actions.updateTaskField(state, event.target.dataset.taskId, "description", event.target.value);
        renderMainView();
        return;
    }

    if (event.target.id === "aiInput") {
        autoResize(event.target);
    }
});

document.addEventListener("click", (event) => {
    const actionElement = event.target.closest("[data-action]");
    if (!actionElement) return;

    if (actionElement.tagName === "A") {
        event.preventDefault();
    }

    const { action, taskId, suggestion, view, direction, date, destination } = actionElement.dataset;

    if (action === "switch-view") {
        if (actions.setView(state, view)) {
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

    if (action === "schedule-task") {
        actions.scheduleInboxTask(state, taskId, destination);
        render();
        return;
    }

    if (action === "toggle" || action === "modal-toggle-task") {
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
        updateTaskModal(true);
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
        renderAssistantVisibility({
            assistantOpen: state.assistantOpen,
            assistantPanel: dom.assistantPanel,
            reopenAssistantButton: dom.reopenAssistantButton,
        });
        return;
    }

    if (action === "reopen-assistant") {
        state.assistantOpen = true;
        renderAssistantVisibility({
            assistantOpen: state.assistantOpen,
            assistantPanel: dom.assistantPanel,
            reopenAssistantButton: dom.reopenAssistantButton,
        });
    }
});

render();
