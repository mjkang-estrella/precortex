import { DAY_MS, TODAY, TODAY_ISO, diffInDays, parseLocalISODate } from "../utils/date.js";
import { getTaskDueMeta } from "./selectors.js";

export type WorkspaceAssistantSummary = {
    headline: string;
    focusTaskId: string | null;
    focusLabel: string;
    overdueCount: number;
    dueTodayCount: number;
    inboxCount: number;
    activeProjectCount: number;
};

type BaseProposal = {
    id: string;
    kind: string;
    taskId: string;
    reason: string;
    status?: "pending" | "applied" | "dismissed";
};

export type TaskRefineProposal = BaseProposal & {
    kind: "task_refine";
    title: string;
    description: string;
};

export type ScheduleChangeProposal = BaseProposal & {
    kind: "schedule_change";
    dueAt: string | null;
    priority: "none" | "low" | "medium" | "high";
};

export type ProjectMoveProposal = BaseProposal & {
    kind: "project_move";
    projectId: string | null;
};

export type StarterSubtasksProposal = BaseProposal & {
    kind: "starter_subtasks";
    subtasks: string[];
};

export type StartTaskProposal = BaseProposal & {
    kind: "start_task";
    brief: string;
    firstSteps: string[];
    timeboxMinutes: number;
};

export type WorkspaceAssistantProposal =
    | TaskRefineProposal
    | ScheduleChangeProposal
    | ProjectMoveProposal
    | StarterSubtasksProposal
    | StartTaskProposal;

export type AssistantThreadMessage = {
    id: string;
    sender: "assistant" | "user";
    text: string;
    rich: boolean;
    tasks: Array<{ order?: string; text: string }>;
    summary?: WorkspaceAssistantSummary | null;
    proposals?: WorkspaceAssistantProposal[];
};

const PRIORITY_ORDER = {
    high: 0,
    medium: 1,
    low: 2,
    none: 3,
};

function createId(prefix = "assistant") {
    if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
        return `${prefix}-${crypto.randomUUID()}`;
    }

    return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function compareFocusTasks(left, right) {
    const leftPriority = PRIORITY_ORDER[left.priority] ?? PRIORITY_ORDER.none;
    const rightPriority = PRIORITY_ORDER[right.priority] ?? PRIORITY_ORDER.none;
    if (leftPriority !== rightPriority) {
        return leftPriority - rightPriority;
    }

    if (left.dueAt && right.dueAt) {
        const dueCompare = parseLocalISODate(left.dueAt).getTime() - parseLocalISODate(right.dueAt).getTime();
        if (dueCompare !== 0) return dueCompare;
    } else if (left.dueAt) {
        return -1;
    } else if (right.dueAt) {
        return 1;
    }

    return (left.updatedAt || 0) - (right.updatedAt || 0) || (left.createdAt || 0) - (right.createdAt || 0);
}

function findBestTask(tasks) {
    return [...tasks].sort(compareFocusTasks)[0] || null;
}

function taskNeedsRefinement(task) {
    return !String(task.description || "").trim() || !Array.isArray(task.subtasks) || task.subtasks.length === 0;
}

export function createAssistantMessage(
    input: Partial<AssistantThreadMessage> & { sender: "assistant" | "user"; text: string },
): AssistantThreadMessage {
    return {
        id: input.id || createId("assistant-message"),
        sender: input.sender,
        text: input.text,
        rich: Boolean(input.rich),
        tasks: input.tasks || [],
        summary: input.summary || null,
        proposals: (input.proposals || []).map((proposal) => ({
            ...proposal,
            status: proposal.status || "pending",
        })),
    };
}

export function isMutatingAssistantProposal(proposal: WorkspaceAssistantProposal) {
    return proposal.kind !== "start_task";
}

export function getAssistantFocusTask(state) {
    const tasks = state.tasks.filter((task) => task.status === "todo");

    if (state.modalTaskId) {
        const modalTask = tasks.find((task) => task.id === state.modalTaskId);
        if (modalTask) return modalTask;
    }

    if (state.selectedProjectId) {
        const projectTask = findBestTask(tasks.filter((task) => task.projectId === state.selectedProjectId));
        if (projectTask) return projectTask;
    }

    const overdueTask = findBestTask(tasks.filter((task) => getTaskDueMeta(task).tone === "overdue"));
    if (overdueTask) return overdueTask;

    const dueTodayTask = findBestTask(tasks.filter((task) => task.dueAt && getTaskDueMeta(task).diff === 0));
    if (dueTodayTask) return dueTodayTask;

    const inboxRefineTask = findBestTask(
        tasks.filter((task) => !task.projectId && !task.dueAt && taskNeedsRefinement(task)),
    );
    if (inboxRefineTask) return inboxRefineTask;

    const nearestDueTask = findBestTask(tasks.filter((task) => task.dueAt));
    if (nearestDueTask) return nearestDueTask;

    return findBestTask(tasks);
}

export function buildWorkspaceAssistantSummary(state): WorkspaceAssistantSummary {
    const todoTasks = state.tasks.filter((task) => task.status === "todo");
    const overdueCount = todoTasks.filter((task) => getTaskDueMeta(task).tone === "overdue").length;
    const dueTodayCount = todoTasks.filter((task) => task.dueAt && getTaskDueMeta(task).diff === 0).length;
    const inboxCount = todoTasks.filter((task) => !task.projectId && !task.dueAt).length;
    const focusTask = getAssistantFocusTask(state);

    let headline = "Workspace looks calm. Keep momentum on the next meaningful task.";
    if (overdueCount > 0) {
        headline = `${overdueCount} overdue ${overdueCount === 1 ? "task needs" : "tasks need"} attention.`;
    } else if (dueTodayCount > 0) {
        headline = `${dueTodayCount} ${dueTodayCount === 1 ? "task is" : "tasks are"} due today.`;
    } else if (inboxCount > 0) {
        headline = `${inboxCount} ${inboxCount === 1 ? "item is" : "items are"} waiting in inbox.`;
    } else if (focusTask?.title) {
        headline = `Best next focus: ${focusTask.title}.`;
    }

    return {
        headline,
        focusTaskId: focusTask?.id || null,
        focusLabel: focusTask?.title || "",
        overdueCount,
        dueTodayCount,
        inboxCount,
        activeProjectCount: state.projects.length,
    };
}

export function buildWorkspaceAssistantRequest(state) {
    const todoTasks = state.tasks.filter((task) => task.status === "todo");
    const completedRecently = state.tasks.filter(
        (task) => task.status === "completed" && task.completedAt && TODAY.getTime() - task.completedAt <= 7 * DAY_MS,
    ).length;

    return {
        view: state.currentView === "project" ? "project" : state.currentView,
        selectedProjectId: state.selectedProjectId || null,
        selectedTaskId: state.modalTaskId || null,
        workspace: {
            projects: state.projects.map((project) => ({
                id: project.id,
                name: project.name,
                deadline: project.deadline || undefined,
                summary: project.summary,
                nextStep: project.nextStep,
            })),
            tasks: todoTasks.map((task) => ({
                id: task.id,
                title: task.title,
                description: task.description || "",
                dueAt: task.dueAt || undefined,
                priority: task.priority || "none",
                projectId: task.projectId || undefined,
                subtasks: task.subtasks || [],
                createdAt: task.createdAt,
                updatedAt: task.updatedAt,
            })),
            counts: {
                inbox: todoTasks.filter((task) => !task.projectId && !task.dueAt).length,
                overdue: todoTasks.filter((task) => task.dueAt && diffInDays(parseLocalISODate(task.dueAt), TODAY) < 0)
                    .length,
                dueToday: todoTasks.filter((task) => task.dueAt === TODAY_ISO).length,
                upcoming: todoTasks.filter((task) => task.dueAt && diffInDays(parseLocalISODate(task.dueAt), TODAY) > 0)
                    .length,
                completedRecently,
            },
        },
    };
}
