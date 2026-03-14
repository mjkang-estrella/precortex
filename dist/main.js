import { assistantIcons } from "./data/assistant.js";
import * as actions from "./state/actions.js";
import { buildAssistantReply } from "./state/assistant-replies.js";
import { getCompletedTasks, getCurrentAssistantMessages, getInboxCount, getInboxTasks, getProjectCompletedTasks, getProjectTasks, getProjects, getSelectedProject, getSelectedTask, getTodayTasks, getUpcomingGroups, getUpcomingSectionKey, getWeekDays, } from "./state/selectors.js";
import { createStore } from "./state/store.js";
import { parseLocalISODate } from "./utils/date.js";
import { renderAssistantPanel, renderAssistantVisibility } from "./views/assistant-view.js";
import { renderInboxView } from "./views/inbox-view.js";
import { renderTaskModal } from "./views/modal-view.js";
import { renderNavigation } from "./views/navigation-view.js";
import { renderProjectSetupModal } from "./views/project-setup-modal.js";
import { renderProjectView } from "./views/project-view.js";
import { renderTodayView } from "./views/today-view.js";
import { renderUpcomingView } from "./views/upcoming-view.js";
const { state, initialTasks, assistantConfigs } = createStore();
const byId = (id) => document.getElementById(id);
const dom = {
    mainView: byId("mainView"),
    aiMessages: byId("aiMessages"),
    assistantQuickActions: byId("assistantQuickActions"),
    assistantTitle: byId("assistantTitle"),
    assistantQuickActionsLabel: byId("assistantQuickActionsLabel"),
    assistantInputHint: byId("assistantInputHint"),
    assistantPanel: byId("assistantPanel"),
    navInboxCount: byId("navInboxCount"),
    projectNav: byId("projectNav"),
    reopenAssistantButton: byId("reopenAssistantButton"),
    taskModal: byId("taskModal"),
    projectSetupModal: byId("projectSetupModal"),
    aiInput: byId("aiInput"),
};
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
    const config = state.currentView === "project" ? assistantConfigs.project : assistantConfigs[state.currentView];
    renderAssistantPanel({
        config,
        messages: getCurrentAssistantMessages(state),
        assistantIcons,
        dom,
    });
}
function scrollUpcomingTargetIntoView(dateIso) {
    const scrollArea = document.getElementById("upcomingScrollArea");
    if (!scrollArea)
        return;
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
        projectNav: dom.projectNav,
        projects: getProjects(state),
        selectedProjectId: state.selectedProjectId,
    });
    renderMainView();
    updateAssistant();
    renderAssistantVisibility({
        assistantOpen: state.assistantOpen,
        assistantPanel: dom.assistantPanel,
        reopenAssistantButton: dom.reopenAssistantButton,
    });
    updateTaskModal();
    renderProjectSetupModal({
        projectSetupModal: dom.projectSetupModal,
        projectSetup: state.projectSetup,
    });
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
    if (!text)
        return;
    if (view === "project") {
        const project = getSelectedProject(state);
        if (!project)
            return;
        project.bayMessages.push({ sender: "user", text, rich: false, tasks: [] });
    }
    else {
        state.messagesByView[view].push({ sender: "user", text, rich: false, tasks: [] });
    }
    updateAssistant();
    dom.aiInput.value = "";
    dom.aiInput.style.height = "auto";
    const reply = buildAssistantReply({ view, text, state, assistantConfigs });
    setTimeout(() => {
        const targetMessages = view === "project"
            ? getSelectedProject(state)?.bayMessages
            : state.messagesByView[view];
        if (!targetMessages)
            return;
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
    const input = document.getElementById("projectSetupInput");
    if (!input)
        return;
    const text = input.value.trim();
    if (!text)
        return;
    actions.submitProjectSetupInput(state, text);
    input.value = "";
    input.style.height = "auto";
    render();
}
document.addEventListener("keydown", (event) => {
    const target = event.target;
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
        if (!value)
            return;
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
    const target = event.target;
    if (!target)
        return;
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
    const target = event.target;
    const actionElement = target?.closest("[data-action]");
    if (!actionElement)
        return;
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
    if (action === "open-project") {
        actions.openProject(state, actionElement.dataset.projectId);
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
    if (action === "open-project-setup") {
        actions.openProjectSetup(state);
        render();
        requestAnimationFrame(() => {
            document.getElementById("projectSetupInput")?.focus();
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
            document.getElementById("projectSetupInput")?.focus();
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
        return;
    }
});
render();
