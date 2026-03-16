import { ConvexClient } from "convex/browser";
import { createAuthClient, formatAuthError } from "./auth/client.js";
import { api } from "../convex/_generated/api.js";
import { createAssistantConfigs } from "./data/assistant.js";
import { assistantIcons } from "./data/assistant.js";
import { getAppConfig } from "./config.js";
import * as actions from "./state/actions.js";
import { getProjectSetupSelectedMode } from "./state/project-bay.js";
import { buildAssistantReply } from "./state/assistant-replies.js";
import {
    getCompletedTasks,
    getDateFromInboxDestination,
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
import { TODAY_ISO, parseLocalISODate } from "./utils/date.js";
import { renderAssistantPanel } from "./views/assistant-view.js";
import { renderAuthError, renderAuthLoading, renderAuthScreen } from "./views/auth-view.js";
import { renderInboxView } from "./views/inbox-view.js";
import { renderTaskModal } from "./views/modal-view.js";
import { renderNavigation } from "./views/navigation-view.js";
import { renderProjectSetupView } from "./views/project-setup-view.js";
import { renderProjectView } from "./views/project-view.js";
import { renderTodayView } from "./views/today-view.js";
import { renderUpcomingView } from "./views/upcoming-view.js";

const AUTH_HINT_STORAGE_KEY = "precortex.authHint";
const store = createStore();
const state = store.state;
let assistantConfigs = store.assistantConfigs;
let authClient = null;
let convexClient = null;
let projectSubscription = null;
let taskSubscription = null;
let hasStoredAuthHint = false;
let hasSeenProjectList = false;
let lastProjectCount = 0;
const byId = <T extends HTMLElement>(id: string) => document.getElementById(id) as T;
const mobileViewport = window.matchMedia("(max-width: 1023px)");
let suppressNextTaskListAnimation = false;
const dragState = {
    taskId: null,
    listId: null,
    justDragged: false,
};

const dom = {
    authRoot: byId<HTMLElement>("authRoot"),
    appShell: byId<HTMLElement>("appShell"),
    mainView: byId<HTMLElement>("mainView"),
    aiMessages: byId<HTMLElement>("aiMessages"),
    assistantQuickActions: byId<HTMLElement>("assistantQuickActions"),
    assistantTitle: byId<HTMLElement>("assistantTitle"),
    assistantQuickActionsLabel: byId<HTMLElement>("assistantQuickActionsLabel"),
    assistantInputHint: byId<HTMLElement>("assistantInputHint"),
    assistantPanel: byId<HTMLElement>("assistantPanel"),
    navInboxCount: byId<HTMLElement>("navInboxCount"),
    projectNav: byId<HTMLElement>("projectNav"),
    workspaceCard: byId<HTMLElement>("workspaceCard"),
    mobileNav: byId<HTMLElement>("mobileNav"),
    mobileDrawerBackdrop: byId<HTMLElement>("mobileDrawerBackdrop"),
    openNavButton: byId<HTMLButtonElement>("openNavButton"),
    reopenAssistantButton: byId<HTMLButtonElement>("reopenAssistantButton"),
    taskModal: byId<HTMLElement>("taskModal"),
    aiInput: byId<HTMLTextAreaElement>("aiInput"),
    toastContainer: byId<HTMLElement>("toastContainer"),
};

const destinationLabels = {
    today: "today",
    tomorrow: "tomorrow",
    "next-week": "next week",
    later: "later",
};

let activeToastTimer: ReturnType<typeof setTimeout> | null = null;

function refreshAssistantConfigs() {
    assistantConfigs = createAssistantConfigs(getInboxCount(state));
}

function createProjectBayMessages(project) {
    return [
        {
            sender: "assistant",
            text: `i'm tracking ${project.name}. the clearest next move is still: ${project.nextStep.toLowerCase()}.`,
            rich: false,
            tasks: [],
        },
    ];
}

function maybeAutoOpenProjectSetup(projectCount, previousProjectCount = 0) {
    if (
        state.auth.status === "authenticated" &&
        projectCount === 0 &&
        !state.projectSetup.open &&
        (!hasSeenProjectList || previousProjectCount > 0)
    ) {
        actions.openProjectSetup(state);
    }
}

function syncProjects(projects) {
    const previousProjectCount = lastProjectCount;
    const nextMessages = {};
    for (const project of projects) {
        nextMessages[project.id] =
            state.projectMessagesByProjectId[project.id] || createProjectBayMessages(project);
    }

    state.projectMessagesByProjectId = nextMessages;
    state.projects = projects;
    lastProjectCount = projects.length;

    if (
        state.currentView === "project" &&
        state.selectedProjectId &&
        !state.projects.some((project) => project.id === state.selectedProjectId)
    ) {
        state.currentView = "today";
        state.selectedProjectId = null;
    }

    hasSeenProjectList = true;
    maybeAutoOpenProjectSetup(projects.length, previousProjectCount);
}

function syncTasks(tasks) {
    state.tasks = tasks;

    if (state.modalTaskId && !state.tasks.some((task) => task.id === state.modalTaskId)) {
        actions.closeTaskModal(state);
    }

    if (state.editingTaskId && !state.tasks.some((task) => task.id === state.editingTaskId)) {
        actions.cancelTaskCardEdit(state);
    }

    refreshAssistantConfigs();
}

function readStoredAuthHint() {
    try {
        const raw = window.localStorage.getItem(AUTH_HINT_STORAGE_KEY);
        if (!raw) return null;

        const parsed = JSON.parse(raw);
        if (!parsed || typeof parsed !== "object") return null;

        return {
            name: typeof parsed.name === "string" ? parsed.name : undefined,
            email: typeof parsed.email === "string" ? parsed.email : undefined,
            picture: typeof parsed.picture === "string" ? parsed.picture : undefined,
        };
    } catch {
        return null;
    }
}

function persistAuthHint(user) {
    try {
        window.localStorage.setItem(AUTH_HINT_STORAGE_KEY, JSON.stringify(user || {}));
    } catch {
        // Ignore localStorage failures and fall back to normal auth boot behavior.
    }
    hasStoredAuthHint = true;
}

function clearAuthHint() {
    try {
        window.localStorage.removeItem(AUTH_HINT_STORAGE_KEY);
    } catch {
        // Ignore localStorage failures.
    }
    hasStoredAuthHint = false;
}

const storedAuthHint = readStoredAuthHint();
if (storedAuthHint) {
    state.auth.user = storedAuthHint;
    hasStoredAuthHint = true;
}

function showToast(message: string, undoCallback?: () => void) {
    if (activeToastTimer) clearTimeout(activeToastTimer);
    dom.toastContainer.innerHTML = "";

    const toast = document.createElement("div");
    toast.className = "toast flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-stone-900 text-white text-[13px] font-medium shadow-float";
    toast.innerHTML = `<span>${message}</span>${
        undoCallback ? '<button data-action="toast-undo" class="text-stone-300 hover:text-white transition-colors lowercase" type="button">undo</button>' : ""
    }`;

    if (undoCallback) {
        toast.querySelector('[data-action="toast-undo"]')?.addEventListener("click", () => {
            undoCallback();
            dismissToast();
        });
    }

    dom.toastContainer.appendChild(toast);
    activeToastTimer = setTimeout(dismissToast, 3000);
}

function dismissToast() {
    if (activeToastTimer) { clearTimeout(activeToastTimer); activeToastTimer = null; }
    const toast = dom.toastContainer.querySelector(".toast");
    if (!toast) return;
    toast.classList.add("toast-leaving");
    setTimeout(() => { dom.toastContainer.innerHTML = ""; }, 200);
}

function isMobileViewport() {
    return mobileViewport.matches;
}

if (isMobileViewport()) {
    state.assistantOpen = false;
}

function renderMainView(suppressAnimation = false) {
    const editingTaskId = state.editingTaskId;
    const editingTaskDraft = state.editingTaskDraft;

    dom.mainView.classList.toggle("task-list-static", suppressAnimation);

    if (state.currentView === "project-setup") {
        dom.mainView.innerHTML = renderProjectSetupView({
            projectSetup: state.projectSetup,
            projectCount: state.projects.length,
        });
        return;
    }

    if (state.currentView === "project") {
        const project = getSelectedProject(state);
        if (!project) {
            dom.mainView.innerHTML = `
                <div class="h-full flex items-center justify-center px-6">
                    <div class="rounded-3xl border border-dashed border-stone-300 bg-stone-50/70 p-8 text-[14px] text-stone-500 lowercase">
                        Loading project…
                    </div>
                </div>
            `;
            return;
        }

        dom.mainView.innerHTML = renderProjectView({
            project,
            todoTasks: getProjectTasks(state, project.id),
            completedTasks: getProjectCompletedTasks(state, project.id),
            editingTaskId,
            editingTaskDraft,
        });
        return;
    }

    if (state.currentView === "inbox") {
        dom.mainView.innerHTML = renderInboxView({
            inboxTasks: getInboxTasks(state),
            editingTaskId,
            editingTaskDraft,
        });
        return;
    }

    if (state.currentView === "upcoming") {
        dom.mainView.innerHTML = renderUpcomingView({
            weekDays: getWeekDays(state, state.upcomingWeekStart),
            groups: getUpcomingGroups(state),
            editingTaskId,
            editingTaskDraft,
        });
        return;
    }

    dom.mainView.innerHTML = renderTodayView({
        todoTasks: getTodayTasks(state),
        completedTasks: getCompletedTasks(state),
        editingTaskId,
        editingTaskDraft,
    });
}

let lastModalTrigger: HTMLElement | null = null;

function updateTaskModal(animate = false) {
    const hadTask = Boolean(dom.taskModal.querySelector('[role="dialog"]'));
    renderTaskModal({
        taskModal: dom.taskModal,
        task: getSelectedTask(state),
        projects: getProjects(state),
        subtaskComposerOpen: state.modalSubtaskComposerOpen,
        subtaskDraft: state.modalSubtaskDraft,
        animate,
    });
    const dialog = dom.taskModal.querySelector('[role="dialog"]') as HTMLElement | null;
    if (dialog && !hadTask) {
        requestAnimationFrame(() => {
            const firstFocusable = dialog.querySelector<HTMLElement>(
                'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
            );
            if (firstFocusable) firstFocusable.focus();
        });
    }
    if (!dialog && lastModalTrigger) {
        lastModalTrigger.focus();
        lastModalTrigger = null;
    }
}

function updateAssistant() {
    const config =
        state.currentView === "project"
            ? assistantConfigs.project
            : assistantConfigs[state.currentView] || assistantConfigs.today;
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
    const hideAssistantSurface = state.currentView === "project-setup";
    const drawersOpen = mobile && (state.mobileNavOpen || (state.assistantOpen && !hideAssistantSurface));
    const blockingSurfaceOpen = Boolean(getSelectedTask(state));

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

    dom.assistantPanel.classList.toggle("hidden", hideAssistantSurface);

    const showAssistantButton = !hideAssistantSurface && !state.assistantOpen && !blockingSurfaceOpen;
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
    const shouldKeepShellVisible = state.auth.status === "authenticated" || (state.auth.status === "loading" && hasStoredAuthHint);

    if (!shouldKeepShellVisible) {
        dom.appShell.classList.add("hidden");
        dom.appShell.classList.remove("flex");
        dom.authRoot.classList.remove("hidden");

        if (state.auth.status === "loading") {
            dom.authRoot.innerHTML = renderAuthLoading();
            return;
        }

        if (state.auth.status === "error") {
            dom.authRoot.innerHTML = renderAuthError(state.auth.errorMessage || "Authentication failed.");
            return;
        }

        dom.authRoot.innerHTML = renderAuthScreen();
        return;
    }

    dom.authRoot.classList.add("hidden");
    dom.appShell.classList.remove("hidden");
    dom.appShell.classList.add("flex");

    const suppressAnimation = suppressNextTaskListAnimation;
    suppressNextTaskListAnimation = false;

    renderNavigation({
        currentView: state.currentView,
        inboxCount: getInboxCount(state),
        navInboxCount: dom.navInboxCount,
        projectNav: dom.projectNav,
        projects: getProjects(state),
        selectedProjectId: state.selectedProjectId,
        workspaceCard: dom.workspaceCard,
        authUser: state.auth.user,
    });
    renderMainView(suppressAnimation);
    updateAssistant();
    updateTaskModal();
    renderChrome();

    if (state.currentView === "upcoming" && state.pendingUpcomingScrollTarget) {
        const target = state.pendingUpcomingScrollTarget;
        state.pendingUpcomingScrollTarget = null;
        requestAnimationFrame(() => scrollUpcomingTargetIntoView(target));
    }

    if (state.currentView === "project-setup") {
        void maybeBootstrapProjectSetup();
    }
}

function isModalInputFocused() {
    const active = document.activeElement;
    if (!active) return false;
    const id = (active as HTMLElement).id;
    return id === "modalTitleInput" || id === "modalDescriptionInput" || id === "modalNewSubtaskInput";
}

function renderAfterDataSync() {
    const shouldKeepShellVisible = state.auth.status === "authenticated" || (state.auth.status === "loading" && hasStoredAuthHint);
    if (!shouldKeepShellVisible) {
        render();
        return;
    }

    dom.authRoot.classList.add("hidden");
    dom.appShell.classList.remove("hidden");
    dom.appShell.classList.add("flex");

    renderNavigation({
        currentView: state.currentView,
        inboxCount: getInboxCount(state),
        navInboxCount: dom.navInboxCount,
        projectNav: dom.projectNav,
        projects: getProjects(state),
        selectedProjectId: state.selectedProjectId,
        workspaceCard: dom.workspaceCard,
        authUser: state.auth.user,
    });

    if (!state.editingTaskId) {
        renderMainView(true);
    }

    updateAssistant();

    if (!isModalInputFocused()) {
        updateTaskModal();
    }

    renderChrome();

    if (state.currentView === "project-setup") {
        void maybeBootstrapProjectSetup();
    }
}

function closeConvexClient() {
    projectSubscription?.unsubscribe?.();
    taskSubscription?.unsubscribe?.();
    projectSubscription = null;
    taskSubscription = null;

    if (!convexClient) return;
    void convexClient.close();
    convexClient = null;
}

function resetAppState() {
    const freshStore = createStore();

    Object.assign(state, freshStore.state);
    assistantConfigs = freshStore.assistantConfigs;
    hasSeenProjectList = false;
    lastProjectCount = 0;

    if (isMobileViewport()) {
        state.assistantOpen = false;
    }
}

function handleDataError(error: Error) {
    console.error(error);
    showToast("Could not sync latest changes.");
}

function subscribeToAppData() {
    if (!convexClient) return;

    projectSubscription?.unsubscribe?.();
    taskSubscription?.unsubscribe?.();

    projectSubscription = convexClient.onUpdate(
        api.projects.list,
        {},
        (projects) => {
            syncProjects(projects);
            renderAfterDataSync();
        },
        handleDataError,
    );

    taskSubscription = convexClient.onUpdate(
        api.tasks.list,
        {},
        (tasks) => {
            syncTasks(tasks);
            renderAfterDataSync();
        },
        handleDataError,
    );
}

async function bootstrapAuth() {
    state.auth.status = "loading";
    state.auth.errorMessage = null;
    render();

    try {
        const config = getAppConfig();
        authClient = await createAuthClient(config);

        const session = await authClient.initialize();
        if (!session.isAuthenticated) {
            closeConvexClient();
            clearAuthHint();
            state.auth.status = "unauthenticated";
            state.auth.user = null;
            render();
            return;
        }

        closeConvexClient();
        convexClient = new ConvexClient(config.convexUrl, { expectAuth: true });
        convexClient.setAuth(async () => {
            if (!authClient) return null;
            return authClient.getToken({ forceRefreshToken: false });
        });

        const viewer = await convexClient.query(api.auth.viewer, {});
        if (!viewer) {
            clearAuthHint();
            state.auth.status = "unauthenticated";
            state.auth.user = null;
            render();
            return;
        }

        subscribeToAppData();
        await convexClient.mutation(api.debug.removeSeededProjects, {});

        state.auth.status = "authenticated";
        state.auth.user = {
            name: viewer.name,
            email: viewer.email,
            picture: viewer.picture,
        };
        persistAuthHint(state.auth.user);
        state.auth.errorMessage = null;
        maybeAutoOpenProjectSetup(lastProjectCount);
        render();
    } catch (error) {
        closeConvexClient();
        state.auth.status = "error";
        state.auth.errorMessage = formatAuthError(error);
        render();
    }
}

async function startLogin() {
    try {
        if (!authClient) {
            await bootstrapAuth();
            if (state.auth.status !== "unauthenticated") return;
        }

        await authClient.login();
    } catch (error) {
        state.auth.status = "error";
        state.auth.errorMessage = formatAuthError(error);
        render();
    }
}

async function startLogout() {
    try {
        clearAuthHint();
        resetAppState();
        state.auth.status = "loading";
        render();
        closeConvexClient();

        if (!authClient) {
            state.auth.status = "unauthenticated";
            render();
            return;
        }

        await authClient.logout();
    } catch (error) {
        state.auth.status = "error";
        state.auth.errorMessage = formatAuthError(error);
        render();
    }
}

function autoResize(textarea: HTMLInputElement | HTMLTextAreaElement) {
    textarea.style.height = "auto";
    textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`;
}

function focusTaskCardTitle(taskId) {
    requestAnimationFrame(() => {
        const input = document.querySelector(
            `[data-action="edit-task-title"][data-task-id="${taskId}"]`,
        ) as HTMLInputElement | HTMLTextAreaElement | null;
        if (!input) return;
        input.focus();
        if ("setSelectionRange" in input) {
            input.setSelectionRange(input.value.length, input.value.length);
        }
    });
}

function sendMessage(textOverride?: string) {
    const view = state.currentView;
    const text = (textOverride ?? dom.aiInput.value).trim();
    if (!text) return;

    if (view === "project") {
        const project = getSelectedProject(state);
        if (!project) return;
        const messages = state.projectMessagesByProjectId[project.id] || createProjectBayMessages(project);
        messages.push({ sender: "user", text, rich: false, tasks: [] });
        state.projectMessagesByProjectId[project.id] = messages;
    } else {
        state.messagesByView[view].push({ sender: "user", text, rich: false, tasks: [] });
    }
    updateAssistant();

    dom.aiInput.value = "";
    dom.aiInput.style.height = "auto";

    const typingIndicator = document.createElement("div");
    typingIndicator.className = "flex items-start gap-3";
    typingIndicator.innerHTML = `
        <div class="w-7 h-7 rounded-full bg-stone-900 flex items-center justify-center text-white flex-shrink-0">
            <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2a10 10 0 1 0 10 10"></path><path d="M12 8v4l3 3"></path><circle cx="19" cy="5" r="3" fill="currentColor" stroke="none"></circle></svg>
        </div>
        <div class="bg-stone-100 rounded-2xl px-4 py-3 flex items-center gap-1.5">
            <span class="typing-dot w-1.5 h-1.5 rounded-full bg-stone-400"></span>
            <span class="typing-dot w-1.5 h-1.5 rounded-full bg-stone-400"></span>
            <span class="typing-dot w-1.5 h-1.5 rounded-full bg-stone-400"></span>
        </div>
    `;
    dom.aiMessages.appendChild(typingIndicator);
    dom.aiMessages.scrollTop = dom.aiMessages.scrollHeight;

    const reply = buildAssistantReply({ view, text, state, assistantConfigs });
    setTimeout(() => {
        typingIndicator.remove();
        const targetMessages =
            view === "project"
                ? state.selectedProjectId
                    ? state.projectMessagesByProjectId[state.selectedProjectId]
                    : null
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

async function runMutation(mutation, args, fallbackMessage = "Could not save change.") {
    if (!convexClient) return null;

    try {
        return await convexClient.mutation(mutation, args);
    } catch (error) {
        console.error(error);
        showToast(fallbackMessage);
        return null;
    }
}

async function runAction(action, args, fallbackMessage = "Could not complete action.") {
    if (!convexClient) return null;

    try {
        return await convexClient.action(action, args);
    } catch (error) {
        console.error(error);
        showToast(fallbackMessage);
        return null;
    }
}

function getProjectSetupConversation() {
    return state.projectSetup.messages.map((message) => ({
        sender: message.sender,
        text: message.text,
    }));
}

async function requestProjectCopilotReply(userText = "") {
    if (state.projectSetup.busy) return;

    actions.beginProjectSetupInput(state, userText);
    render();

    const reply = await runAction(
        api.projectCopilot.reply,
        {
            messages: getProjectSetupConversation(),
        },
        "Could not reach the project copilot.",
    );

    if (reply === null) {
        actions.failProjectSetupReply(state, "Project copilot is unavailable right now.");
        render();
        return;
    }

    actions.receiveProjectSetupReply(state, reply);
    render();
}

async function maybeBootstrapProjectSetup() {
    if (
        !convexClient ||
        !state.projectSetup.open ||
        state.currentView !== "project-setup" ||
        state.projectSetup.initialized ||
        state.projectSetup.busy
    ) {
        return;
    }

    await requestProjectCopilotReply();
}

async function sendProjectSetupMessage(textOverride?: string) {
    const input = document.getElementById("projectSetupInput") as HTMLTextAreaElement | null;
    if (!input) return;

    const text = (textOverride ?? input.value).trim();
    if (!text) return;

    input.value = "";
    input.style.height = "auto";
    await requestProjectCopilotReply(text);
}

async function createTask(title: string) {
    const resolvedDueAt =
        state.currentView === "today"
            ? TODAY_ISO
            : null;
    const projectId = state.currentView === "project" ? state.selectedProjectId : null;

    await runMutation(
        api.tasks.create,
        {
            title,
            description:
                state.currentView === "project"
                    ? "New project task added from the project view."
                    : state.currentView === "inbox"
                      ? "New inbox item waiting to be triaged."
                      : "New task added from the quick entry field. Open it to add more detail.",
            dueAt: resolvedDueAt ?? undefined,
            projectId: projectId ?? undefined,
        },
        "Could not create task.",
    );
}

async function saveTaskEdit() {
    if (!state.editingTaskId || !state.editingTaskDraft) return;

    const trimmedTitle = state.editingTaskDraft.title.trim();
    if (!trimmedTitle) return;

    const didSave = await runMutation(
        api.tasks.update,
        {
            taskId: state.editingTaskId,
            title: trimmedTitle,
            description: state.editingTaskDraft.description.trim(),
        },
        "Could not save task.",
    );

    if (didSave !== null) {
        actions.cancelTaskCardEdit(state);
        renderMainView();
    }
}

async function addModalSubtask(taskId) {
    const value = state.modalSubtaskDraft.trim();
    if (!value) return;

    const didAdd = await runMutation(
        api.tasks.addSubtask,
        {
            taskId,
            title: value,
        },
        "Could not add subtask.",
    );

    if (didAdd !== null) {
        actions.closeModalSubtaskComposer(state);
        updateTaskModal();
    }
}

async function createProjectFromDraft() {
    const selectedMode = getProjectSetupSelectedMode(state.projectSetup);

    const createdProject = await runMutation(
        api.projects.createFromCopilot,
        {
            planType: selectedMode,
            brief: {
                name: state.projectSetup.brief.name.trim(),
                deadline: state.projectSetup.brief.deadline || undefined,
                goal: state.projectSetup.brief.goal.trim(),
                currentProgress: state.projectSetup.brief.currentProgress.trim(),
                successCriteria: state.projectSetup.brief.successCriteria.trim(),
                constraints: state.projectSetup.brief.constraints.trim(),
                blockersRisks: state.projectSetup.brief.blockersRisks.trim(),
            },
            routine:
                selectedMode === "routine_system"
                    ? {
                          cadence: state.projectSetup.routine.cadence.trim(),
                          checkpoints: state.projectSetup.routine.checkpoints.map((value) => value.trim()),
                          rules: state.projectSetup.routine.rules.map((value) => value.trim()),
                      }
                    : null,
            starterTasks: state.projectSetup.starterTasks.map((task) => ({
                id: task.id,
                title: task.title.trim(),
                description: task.description?.trim() || "",
                dueAt: task.dueAt || undefined,
                priority: task.priority || "medium",
            })),
        },
        "Could not create project.",
    );

    if (!createdProject) return;

    actions.closeProjectSetup(state);
    state.currentView = "project";
    state.selectedProjectId = createdProject.id;
    state.assistantOpen = true;
    render();
}

function getVisibleTaskIds(listId) {
    if (listId === "inbox") {
        return getInboxTasks(state).map((task) => task.id);
    }

    if (listId === "today-todo") {
        return getTodayTasks(state).map((task) => task.id);
    }

    if (listId === "today-completed") {
        return getCompletedTasks(state).map((task) => task.id);
    }

    if (listId === "project-todo") {
        return state.selectedProjectId ? getProjectTasks(state, state.selectedProjectId).map((task) => task.id) : [];
    }

    if (listId === "project-completed") {
        return state.selectedProjectId
            ? getProjectCompletedTasks(state, state.selectedProjectId).map((task) => task.id)
            : [];
    }

    const upcomingGroups = getUpcomingGroups(state);
    if (listId === "upcoming-tomorrow") {
        return upcomingGroups.tomorrow.map((task) => task.id);
    }
    if (listId === "upcoming-this-week") {
        return upcomingGroups["this-week"].map((task) => task.id);
    }
    if (listId === "upcoming-later") {
        return upcomingGroups.later.map((task) => task.id);
    }

    return [];
}

function getReorderNeighbors(listId, draggedTaskId, targetTaskId, placement) {
    const visibleIds = getVisibleTaskIds(listId).filter((taskId) => taskId !== draggedTaskId);
    const targetIndex = visibleIds.indexOf(targetTaskId);
    if (targetIndex === -1) {
        return { beforeTaskId: undefined, afterTaskId: undefined };
    }

    const insertIndex = placement === "after" ? targetIndex + 1 : targetIndex;
    visibleIds.splice(insertIndex, 0, draggedTaskId);

    const movedIndex = visibleIds.indexOf(draggedTaskId);
    return {
        beforeTaskId: movedIndex > 0 ? visibleIds[movedIndex - 1] : undefined,
        afterTaskId: movedIndex < visibleIds.length - 1 ? visibleIds[movedIndex + 1] : undefined,
    };
}

function focusModalSubtaskInput() {
    requestAnimationFrame(() => {
        const input = document.getElementById("modalNewSubtaskInput") as HTMLInputElement | null;
        if (!input) return;
        input.focus();
        input.setSelectionRange(input.value.length, input.value.length);
    });
}

function closeTaskModalAndRender() {
    actions.closeTaskModal(state);
    suppressNextTaskListAnimation = true;
    render();
}

function clearTaskDropIndicators() {
    document.querySelectorAll(".task-drop-before, .task-drop-after, .task-dragging").forEach((node) => {
        node.classList.remove("task-drop-before", "task-drop-after", "task-dragging");
    });
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
    if (state.auth.status !== "authenticated") return;

    const target = event.target as HTMLInputElement | HTMLTextAreaElement | null;

    if (event.key === "Tab") {
        const dialog = dom.taskModal.querySelector('[role="dialog"]') as HTMLElement | null;
        if (dialog) { trapFocus(dialog, event); return; }
    }

    if ((event.key === "Enter" || event.key === " ") && (target as HTMLElement)?.dataset?.action === "open-task") {
        event.preventDefault();
        const taskId = (target as HTMLElement).dataset.taskId;
        if (taskId) {
            lastModalTrigger = target as HTMLElement;
            actions.openTaskModal(state, taskId);
            closeMobileChrome();
            updateTaskModal(true);
            renderChrome();
        }
        return;
    }

    if (event.key === "Escape" && getSelectedTask(state)) {
        if (state.modalSubtaskComposerOpen) {
            actions.closeModalSubtaskComposer(state);
            updateTaskModal();
            return;
        }
        closeTaskModalAndRender();
        return;
    }

    if (event.key === "Escape" && state.editingTaskId) {
        actions.cancelTaskCardEdit(state);
        renderMainView();
        return;
    }

    if (event.key === "Escape" && state.projectSetup.open) {
        actions.closeProjectSetup(state);
        render();
        return;
    }

    if ((event.key === "ArrowUp" || event.key === "ArrowDown") && (event.ctrlKey || event.metaKey)) {
        const row = (target as HTMLElement)?.closest?.(".task-row[draggable='true']") as HTMLElement | null;
        if (row && row.dataset.taskId && row.dataset.taskList) {
            event.preventDefault();
            const listId = row.dataset.taskList;
            const taskId = row.dataset.taskId;
            const visibleIds = getVisibleTaskIds(listId);
            const currentIndex = visibleIds.indexOf(taskId);
            if (currentIndex === -1) return;

            const direction = event.key === "ArrowUp" ? -1 : 1;
            const neighborIndex = currentIndex + direction;
            if (neighborIndex < 0 || neighborIndex >= visibleIds.length) return;

            const neighborId = visibleIds[neighborIndex];
            const placement = direction === -1 ? "before" : "after";
            const { beforeTaskId, afterTaskId } = getReorderNeighbors(listId, taskId, neighborId, placement);

            suppressNextTaskListAnimation = true;
            void runMutation(
                api.tasks.reorder,
                {
                    taskId,
                    beforeTaskId,
                    afterTaskId,
                    listKey: listId,
                    todayIso: TODAY_ISO,
                },
                "Could not reorder task.",
            ).then(() => {
                requestAnimationFrame(() => {
                    const movedRow = document.querySelector(`.task-row[data-task-id="${taskId}"]`) as HTMLElement | null;
                    movedRow?.focus();
                });
            });
            return;
        }
    }

    if (target?.id === "taskInput" && event.key === "Enter") {
        event.preventDefault();
        const value = target.value.trim();
        if (!value) return;
        void createTask(value);
        target.value = "";
        return;
    }

    if (target?.dataset.action === "edit-task-title" && event.key === "Enter") {
        event.preventDefault();
        void saveTaskEdit();
        return;
    }

    if (
        target?.dataset.action === "edit-task-description" &&
        event.key === "Enter" &&
        (event.metaKey || event.ctrlKey)
    ) {
        event.preventDefault();
        void saveTaskEdit();
        return;
    }

    if (target?.id === "aiInput" && event.key === "Enter" && !event.shiftKey) {
        event.preventDefault();
        sendMessage();
    }

    if (target?.id === "projectSetupInput" && event.key === "Enter" && !event.shiftKey) {
        event.preventDefault();
        void sendProjectSetupMessage();
    }

    if (target?.id === "modalNewSubtaskInput" && event.key === "Enter") {
        event.preventDefault();
        addModalSubtask(target.dataset.taskId);
    }
});

document.addEventListener("input", (event) => {
    if (state.auth.status !== "authenticated") return;

    const target = event.target as HTMLInputElement | HTMLTextAreaElement | null;
    if (!target) return;

    if (target.id === "modalDescriptionInput") {
        autoResize(target);
        return;
    }

    if (target.dataset.action === "edit-task-title") {
        actions.updateTaskCardDraftField(state, "title", target.value);
        return;
    }

    if (target.dataset.action === "edit-task-description") {
        actions.updateTaskCardDraftField(state, "description", target.value);
        autoResize(target);
        return;
    }

    if (target.id === "modalNewSubtaskInput") {
        actions.updateModalSubtaskDraft(state, target.value);
        return;
    }

    if (target.id === "aiInput" || target.id === "projectSetupInput") {
        autoResize(target);
        return;
    }

    if (target.id === "projectBriefName") {
        actions.updateProjectBriefField(state, "name", target.value);
        return;
    }

    if (target.id === "projectBriefDeadline") {
        actions.updateProjectBriefField(state, "deadline", target.value);
        return;
    }

    if (target.id === "projectBriefGoal") {
        actions.updateProjectBriefField(state, "goal", target.value);
        autoResize(target);
        return;
    }

    if (target.id === "projectBriefCurrentProgress") {
        actions.updateProjectBriefField(state, "currentProgress", target.value);
        autoResize(target);
        return;
    }

    if (target.id === "projectBriefSuccessCriteria") {
        actions.updateProjectBriefField(state, "successCriteria", target.value);
        autoResize(target);
        return;
    }

    if (target.id === "projectBriefConstraints") {
        actions.updateProjectBriefField(state, "constraints", target.value);
        autoResize(target);
        return;
    }

    if (target.id === "projectBriefBlockersRisks") {
        actions.updateProjectBriefField(state, "blockersRisks", target.value);
        autoResize(target);
        return;
    }

    if (target.id === "projectRoutineCadence") {
        actions.updateProjectRoutineField(state, "cadence", target.value);
        return;
    }

    if (target.dataset.action === "edit-project-task-title") {
        actions.updateProjectSetupTaskFieldValue(state, target.dataset.taskId, "title", target.value);
        return;
    }

    if (target.dataset.action === "edit-project-task-description") {
        actions.updateProjectSetupTaskFieldValue(state, target.dataset.taskId, "description", target.value);
        autoResize(target);
        return;
    }

    if (target.dataset.action === "edit-project-task-due-at") {
        actions.updateProjectSetupTaskFieldValue(state, target.dataset.taskId, "dueAt", target.value);
        return;
    }

    if (target.dataset.action === "edit-project-routine-item") {
        actions.updateProjectRoutineItem(
            state,
            target.dataset.listKey,
            Number(target.dataset.index),
            target.value,
        );
    }
});

document.addEventListener("change", (event) => {
    if (state.auth.status !== "authenticated") return;

    const target = event.target as HTMLInputElement | HTMLSelectElement | null;
    if (!target) return;

    if (target.id === "modalTitleInput") {
        const title = target.value.trim();
        if (!title) {
            showToast("Task title cannot be empty.");
            return;
        }

        void runMutation(
            api.tasks.update,
            {
                taskId: target.dataset.taskId,
                title,
            },
            "Could not update task title.",
        );
        return;
    }

    if (target.id === "modalDescriptionInput") {
        void runMutation(
            api.tasks.update,
            {
                taskId: target.dataset.taskId,
                description: target.value,
            },
            "Could not update task description.",
        );
        return;
    }

    if (target.dataset.action === "edit-subtask-title") {
        const title = target.value.trim();
        if (!title) {
            showToast("Subtask title cannot be empty.");
            return;
        }

        void runMutation(
            api.tasks.updateSubtask,
            {
                taskId: target.dataset.taskId,
                subtaskId: target.dataset.subtaskId,
                title,
            },
            "Could not update subtask.",
        );
        return;
    }

    if (target.dataset.action === "change-task-project") {
        void runMutation(
            api.tasks.update,
            {
                taskId: target.dataset.taskId,
                projectId: target.value || null,
            },
            "Could not move task.",
        );
        return;
    }

    if (target.dataset.action === "change-task-due-date") {
        void runMutation(
            api.tasks.update,
            {
                taskId: target.dataset.taskId,
                dueAt: target.value || null,
            },
            "Could not update due date.",
        );
        return;
    }

    if (target.dataset.action === "change-task-priority") {
        void runMutation(
            api.tasks.update,
            {
                taskId: target.dataset.taskId,
                priority: target.value || "none",
            },
            "Could not update priority.",
        );
        return;
    }

    if (target.dataset.action === "edit-project-task-priority") {
        actions.updateProjectSetupTaskFieldValue(state, target.dataset.taskId, "priority", target.value);
    }
});

document.addEventListener("click", (event) => {
    const target = event.target as HTMLElement | null;
    const actionElement = target?.closest("[data-action]") as (HTMLElement & { dataset: DOMStringMap }) | null;
    if (!actionElement) return;

    const { action, taskId, suggestion, view, direction, date, destination } = actionElement.dataset;

    if (action === "login") {
        void startLogin();
        return;
    }

    if (action === "logout") {
        void startLogout();
        return;
    }

    if (state.auth.status !== "authenticated") return;

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
        const label = destinationLabels[destination] || destination;
        const row = actionElement.closest(".task-row") as HTMLElement | null;
        const doSchedule = async () => {
            const prevDueAt = state.tasks.find((t) => t.id === taskId)?.dueAt || null;
            const resolvedDueAt = getDateFromInboxDestination(destination);

            const didSchedule = await runMutation(
                api.tasks.update,
                {
                    taskId,
                    dueAt: resolvedDueAt,
                },
                "Could not schedule task.",
            );

            if (didSchedule === null) return;

            showToast(`scheduled for ${label}`, () => {
                void runMutation(
                    api.tasks.update,
                    {
                        taskId,
                        dueAt: prevDueAt,
                    },
                    "Could not undo scheduling.",
                );
            });
        };
        if (row) {
            row.classList.add("task-removing");
            setTimeout(() => {
                void doSchedule();
            }, 250);
        } else {
            void doSchedule();
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
        const task = state.tasks.find((item) => item.id === taskId);
        if (!task) return;
        void runMutation(
            api.tasks.setStatus,
            {
                taskId,
                status: task.status === "todo" ? "completed" : "todo",
            },
            "Could not update task status.",
        );
        return;
    }

    if (action === "toggle-subtask") {
        void runMutation(
            api.tasks.toggleSubtask,
            {
                taskId,
                subtaskId: actionElement.dataset.subtaskId,
            },
            "Could not update subtask.",
        );
        return;
    }

    if (action === "add-subtask") {
        void addModalSubtask(taskId);
        return;
    }

    if (action === "open-subtask-composer") {
        actions.openModalSubtaskComposer(state);
        updateTaskModal();
        focusModalSubtaskInput();
        return;
    }

    if (action === "cancel-subtask-composer") {
        actions.closeModalSubtaskComposer(state);
        updateTaskModal();
        return;
    }

    if (action === "remove-subtask") {
        void runMutation(
            api.tasks.removeSubtask,
            {
                taskId,
                subtaskId: actionElement.dataset.subtaskId,
            },
            "Could not remove subtask.",
        );
        return;
    }

    if (action === "delete-task") {
        if (!window.confirm("Delete this task?")) return;

        void runMutation(
            api.tasks.remove,
            {
                taskId,
            },
            "Could not delete task.",
        ).then((result) => {
            if (result === null) return;
            actions.closeTaskModal(state);
            render();
        });
        return;
    }

    if (action === "edit-task-card") {
        actions.startTaskCardEdit(state, taskId);
        renderMainView();
        focusTaskCardTitle(taskId);
        return;
    }

    if (action === "save-task-edit") {
        void saveTaskEdit();
        return;
    }

    if (action === "cancel-task-edit") {
        actions.cancelTaskCardEdit(state);
        renderMainView();
        return;
    }

    if (action === "open-task") {
        if (dragState.justDragged) return;
        lastModalTrigger = actionElement;
        actions.openTaskModal(state, taskId);
        closeMobileChrome();
        updateTaskModal(true);
        renderChrome();
        return;
    }

    if (action === "close-modal") {
        closeTaskModalAndRender();
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
        void sendProjectSetupMessage();
        return;
    }

    if (action === "project-setup-suggestion") {
        void sendProjectSetupMessage(suggestion);
        return;
    }

    if (action === "confirm-project-draft") {
        void createProjectFromDraft();
        return;
    }

    if (action === "select-project-setup-mode") {
        actions.setProjectSetupMode(state, actionElement.dataset.mode);
        render();
        return;
    }

    if (action === "add-project-task") {
        actions.addProjectSetupStarterTask(state);
        render();
        return;
    }

    if (action === "remove-project-task") {
        actions.removeProjectSetupStarterTask(state, actionElement.dataset.taskId);
        render();
        return;
    }

    if (action === "add-project-routine-item") {
        actions.addProjectRoutineItem(state, actionElement.dataset.listKey);
        render();
        return;
    }

    if (action === "remove-project-routine-item") {
        actions.removeProjectRoutineItem(
            state,
            actionElement.dataset.listKey,
            Number(actionElement.dataset.index),
        );
        render();
        return;
    }

    if (action === "archive-project") {
        const projectId = actionElement.dataset.projectId;
        if (!projectId) return;
        if (!window.confirm("Archive this project and move its tasks back to inbox/projectless lists?")) return;

        void runMutation(
            api.projects.archive,
            {
                projectId,
            },
            "Could not archive project.",
        );
        return;
    }

    if (action === "send-message") {
        sendMessage();
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

document.addEventListener("dragstart", (event) => {
    if (state.auth.status !== "authenticated") return;

    const target = event.target as HTMLElement | null;
    const row = target?.closest(".task-row[draggable='true']") as HTMLElement | null;
    if (!row) return;

    dragState.taskId = row.dataset.taskId;
    dragState.listId = row.dataset.taskList;
    dragState.justDragged = false;
    row.classList.add("task-dragging");

    if (event.dataTransfer) {
        event.dataTransfer.effectAllowed = "move";
        event.dataTransfer.setData("text/plain", row.dataset.taskId || "");
    }
});

document.addEventListener("dragover", (event) => {
    if (state.auth.status !== "authenticated") return;

    const target = event.target as HTMLElement | null;
    const row = target?.closest(".task-row[draggable='true']") as HTMLElement | null;
    if (!row) return;
    if (!dragState.taskId || row.dataset.taskId === dragState.taskId) return;
    if (row.dataset.taskList !== dragState.listId) return;

    event.preventDefault();
    clearTaskDropIndicators();

    const rect = row.getBoundingClientRect();
    const isAfter = event.clientY > rect.top + rect.height / 2;
    row.classList.add(isAfter ? "task-drop-after" : "task-drop-before");
});

document.addEventListener("drop", (event) => {
    if (state.auth.status !== "authenticated") return;

    const target = event.target as HTMLElement | null;
    const row = target?.closest(".task-row[draggable='true']") as HTMLElement | null;
    if (!row || !dragState.taskId) return;
    if (row.dataset.taskId === dragState.taskId) return;
    if (row.dataset.taskList !== dragState.listId) return;

    event.preventDefault();

    const rect = row.getBoundingClientRect();
    const placement = event.clientY > rect.top + rect.height / 2 ? "after" : "before";
    const { beforeTaskId, afterTaskId } = getReorderNeighbors(
        row.dataset.taskList,
        dragState.taskId,
        row.dataset.taskId,
        placement,
    );

    suppressNextTaskListAnimation = true;
    dragState.justDragged = true;
    clearTaskDropIndicators();
    void runMutation(
        api.tasks.reorder,
        {
            taskId: dragState.taskId,
            beforeTaskId,
            afterTaskId,
            listKey: row.dataset.taskList,
            todayIso: TODAY_ISO,
        },
        "Could not reorder task.",
    );
});

document.addEventListener("dragend", () => {
    if (state.auth.status !== "authenticated") return;

    clearTaskDropIndicators();
    dragState.taskId = null;
    dragState.listId = null;
    setTimeout(() => {
        dragState.justDragged = false;
    }, 0);
});

mobileViewport.addEventListener("change", (event) => {
    state.mobileNavOpen = false;
    if (event.matches) {
        state.assistantOpen = false;
    }
    render();
});

render();
void bootstrapAuth();
