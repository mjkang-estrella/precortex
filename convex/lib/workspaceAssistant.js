import { v } from "convex/values";

import { normalizeOptionalIsoDate } from "./domain.js";

export const workspaceAssistantViewValue = v.union(
    v.literal("inbox"),
    v.literal("today"),
    v.literal("upcoming"),
    v.literal("project"),
);

export const workspaceAssistantMessageValue = v.object({
    sender: v.union(v.literal("user"), v.literal("assistant")),
    text: v.string(),
});

export const workspaceAssistantProjectValue = v.object({
    id: v.string(),
    name: v.string(),
    deadline: v.optional(v.string()),
    summary: v.string(),
    nextStep: v.string(),
});

export const workspaceAssistantSubtaskValue = v.object({
    id: v.string(),
    title: v.string(),
    done: v.boolean(),
});

export const workspaceAssistantTaskValue = v.object({
    id: v.string(),
    title: v.string(),
    description: v.string(),
    dueAt: v.optional(v.string()),
    priority: v.union(
        v.literal("none"),
        v.literal("low"),
        v.literal("medium"),
        v.literal("high"),
    ),
    projectId: v.optional(v.string()),
    subtasks: v.array(workspaceAssistantSubtaskValue),
    createdAt: v.number(),
    updatedAt: v.number(),
});

export const workspaceAssistantCountsValue = v.object({
    inbox: v.number(),
    overdue: v.number(),
    dueToday: v.number(),
    upcoming: v.number(),
    completedRecently: v.number(),
});

export const workspaceAssistantWorkspaceValue = v.object({
    projects: v.array(workspaceAssistantProjectValue),
    tasks: v.array(workspaceAssistantTaskValue),
    counts: workspaceAssistantCountsValue,
});

const PRIORITY_ORDER = {
    high: 0,
    medium: 1,
    low: 2,
    none: 3,
};

function cleanString(value) {
    return typeof value === "string" ? value.trim() : "";
}

function parseLocalISODate(isoDate) {
    const [year, month, day] = String(isoDate).split("-").map(Number);
    return new Date(year, month - 1, day);
}

function startOfLocalDay(value = new Date()) {
    const date = value instanceof Date ? new Date(value) : new Date(value);
    date.setHours(0, 0, 0, 0);
    return date;
}

function toLocalISODate(value) {
    const date = startOfLocalDay(value);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
}

function diffInDays(dateA, dateB) {
    const dayMs = 24 * 60 * 60 * 1000;
    return Math.round(
        (startOfLocalDay(dateA).getTime() - startOfLocalDay(dateB).getTime()) / dayMs,
    );
}

function normalizePriority(value, fallback = "medium") {
    return Object.prototype.hasOwnProperty.call(PRIORITY_ORDER, value) ? value : fallback;
}

function compareTasksForFocus(left, right) {
    const leftPriority = PRIORITY_ORDER[normalizePriority(left.priority, "none")];
    const rightPriority = PRIORITY_ORDER[normalizePriority(right.priority, "none")];
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

function getTaskMap(workspace) {
    return new Map((workspace?.tasks || []).map((task) => [task.id, task]));
}

function getTodayIso() {
    return toLocalISODate(new Date());
}

function isOverdueTask(task, todayIso = getTodayIso()) {
    if (!task?.dueAt) return false;
    return diffInDays(parseLocalISODate(task.dueAt), parseLocalISODate(todayIso)) < 0;
}

function isDueTodayTask(task, todayIso = getTodayIso()) {
    return Boolean(task?.dueAt) && task.dueAt === todayIso;
}

function taskNeedsRefinement(task) {
    if (!task) return false;
    return !cleanString(task.description) || !Array.isArray(task.subtasks) || task.subtasks.length === 0;
}

function findBestTask(tasks) {
    return [...tasks].sort(compareTasksForFocus)[0] || null;
}

export function pickDefaultFocusTask(workspace, context = {}) {
    const tasks = workspace?.tasks || [];
    const taskMap = getTaskMap(workspace);
    const todayIso = getTodayIso();

    if (context.selectedTaskId && taskMap.has(context.selectedTaskId)) {
        return taskMap.get(context.selectedTaskId);
    }

    if (context.selectedProjectId) {
        const projectTask = findBestTask(tasks.filter((task) => task.projectId === context.selectedProjectId));
        if (projectTask) return projectTask;
    }

    const overdueTask = findBestTask(tasks.filter((task) => isOverdueTask(task, todayIso)));
    if (overdueTask) return overdueTask;

    const dueTodayTask = findBestTask(tasks.filter((task) => isDueTodayTask(task, todayIso)));
    if (dueTodayTask) return dueTodayTask;

    const inboxRefineTask = findBestTask(
        tasks.filter((task) => !task.projectId && !task.dueAt && taskNeedsRefinement(task)),
    );
    if (inboxRefineTask) return inboxRefineTask;

    const nearestDueTask = findBestTask(tasks.filter((task) => task.dueAt));
    if (nearestDueTask) return nearestDueTask;

    return findBestTask(tasks);
}

function buildDefaultHeadline(counts, focusTask) {
    if (counts.overdue > 0) {
        return `${counts.overdue} overdue ${counts.overdue === 1 ? "task needs" : "tasks need"} attention.`;
    }

    if (counts.dueToday > 0) {
        return `${counts.dueToday} ${counts.dueToday === 1 ? "task is" : "tasks are"} due today.`;
    }

    if (counts.inbox > 0) {
        return `${counts.inbox} ${counts.inbox === 1 ? "item is" : "items are"} waiting in inbox.`;
    }

    if (focusTask?.title) {
        return `Best next focus: ${focusTask.title}.`;
    }

    return "Workspace looks calm. Pick the next meaningful move and start.";
}

function buildSummary(inputSummary, workspace, context = {}) {
    const counts = workspace?.counts || {
        inbox: 0,
        overdue: 0,
        dueToday: 0,
        upcoming: 0,
        completedRecently: 0,
    };
    const taskMap = getTaskMap(workspace);
    const fallbackFocusTask = pickDefaultFocusTask(workspace, context);
    const requestedFocusTask =
        cleanString(inputSummary?.focusTaskId) && taskMap.has(cleanString(inputSummary.focusTaskId))
            ? taskMap.get(cleanString(inputSummary.focusTaskId))
            : null;
    const focusTask = requestedFocusTask || fallbackFocusTask;

    return {
        headline: cleanString(inputSummary?.headline) || buildDefaultHeadline(counts, focusTask),
        focusTaskId: focusTask?.id || null,
        focusLabel: cleanString(inputSummary?.focusLabel) || focusTask?.title || "",
        overdueCount: Number.isFinite(inputSummary?.overdueCount) ? inputSummary.overdueCount : counts.overdue,
        dueTodayCount: Number.isFinite(inputSummary?.dueTodayCount) ? inputSummary.dueTodayCount : counts.dueToday,
        inboxCount: Number.isFinite(inputSummary?.inboxCount) ? inputSummary.inboxCount : counts.inbox,
        activeProjectCount: Number.isFinite(inputSummary?.activeProjectCount)
            ? inputSummary.activeProjectCount
            : (workspace?.projects || []).length,
    };
}

function uniqueStrings(values, limit = 5) {
    const result = [];
    const seen = new Set();

    for (const value of values || []) {
        const text = cleanString(value);
        if (!text) continue;
        const key = text.toLowerCase();
        if (seen.has(key)) continue;
        seen.add(key);
        result.push(text);
        if (result.length >= limit) break;
    }

    return result;
}

function normalizeDueAt(value) {
    if (value === null || value === "") return null;

    try {
        return normalizeOptionalIsoDate(value, "due date");
    } catch {
        return "__invalid_due_at__";
    }
}

function createProposalId(index) {
    return `proposal-${index + 1}`;
}

function normalizeTaskRefineProposal(task, proposal, index) {
    const title = cleanString(proposal.title) || cleanString(task.title);
    const description = cleanString(proposal.description) || cleanString(task.description);

    if (!title && !description) return null;

    return {
        id: cleanString(proposal.id) || createProposalId(index),
        kind: "task_refine",
        taskId: task.id,
        title,
        description,
        reason: cleanString(proposal.reason) || "Clarify the task before you start it.",
    };
}

function normalizeScheduleProposal(task, proposal, index) {
    const dueAt = proposal.dueAt === undefined ? task.dueAt ?? null : normalizeDueAt(proposal.dueAt);
    const priority = normalizePriority(proposal.priority, task.priority || "none");

    if (dueAt === "__invalid_due_at__") {
        return null;
    }

    if (dueAt === (task.dueAt ?? null) && priority === normalizePriority(task.priority, "none")) {
        return null;
    }

    return {
        id: cleanString(proposal.id) || createProposalId(index),
        kind: "schedule_change",
        taskId: task.id,
        dueAt,
        priority,
        reason: cleanString(proposal.reason) || "Make the timing and urgency explicit.",
    };
}

function normalizeProjectMoveProposal(task, proposal, index, workspace) {
    const projectId = proposal.projectId === null || proposal.projectId === "" ? null : cleanString(proposal.projectId);
    const hasProject = projectId === null || workspace.projects.some((project) => project.id === projectId);
    if (!hasProject || projectId === (task.projectId ?? null)) {
        return null;
    }

    return {
        id: cleanString(proposal.id) || createProposalId(index),
        kind: "project_move",
        taskId: task.id,
        projectId,
        reason: cleanString(proposal.reason) || "Put the task in the right execution context.",
    };
}

function normalizeStarterSubtasksProposal(task, proposal, index) {
    const subtasks = uniqueStrings(proposal.subtasks, 5);
    if (!subtasks.length) return null;

    return {
        id: cleanString(proposal.id) || createProposalId(index),
        kind: "starter_subtasks",
        taskId: task.id,
        subtasks,
        reason: cleanString(proposal.reason) || "Break the task into an easier starting sequence.",
    };
}

function normalizeStartTaskProposal(task, proposal, index) {
    const brief = cleanString(proposal.brief);
    const firstSteps = uniqueStrings(proposal.firstSteps, 5);
    if (!brief || firstSteps.length === 0) return null;

    const timeboxMinutes = Math.min(
        Math.max(Number.isFinite(Number(proposal.timeboxMinutes)) ? Number(proposal.timeboxMinutes) : 30, 10),
        120,
    );

    return {
        id: cleanString(proposal.id) || createProposalId(index),
        kind: "start_task",
        taskId: task.id,
        brief,
        firstSteps,
        timeboxMinutes,
        reason: cleanString(proposal.reason) || "Reduce friction and make the first move obvious.",
    };
}

function normalizeProposal(proposal, index, workspace) {
    const kind = cleanString(proposal?.kind || proposal?.type);
    const taskId = cleanString(proposal?.taskId);
    const task = workspace?.tasks?.find((candidate) => candidate.id === taskId);
    if (!kind || !task) return null;

    if (kind === "task_refine") return normalizeTaskRefineProposal(task, proposal, index);
    if (kind === "schedule_change") return normalizeScheduleProposal(task, proposal, index);
    if (kind === "project_move") return normalizeProjectMoveProposal(task, proposal, index, workspace);
    if (kind === "starter_subtasks") return normalizeStarterSubtasksProposal(task, proposal, index);
    if (kind === "start_task") return normalizeStartTaskProposal(task, proposal, index);

    return null;
}

export function normalizeWorkspaceAssistantResponse(input = {}, workspace, context = {}) {
    const proposals = (Array.isArray(input.proposals) ? input.proposals : [])
        .map((proposal, index) => normalizeProposal(proposal, index, workspace))
        .filter(Boolean)
        .slice(0, 3);
    const summary = buildSummary(input.summary, workspace, context);

    return {
        assistantMessage: cleanString(input.assistantMessage) || summary.headline,
        summary,
        proposals,
    };
}
