import { mutation, query } from "./_generated/server";
import { internal } from "./_generated/api.js";
import { v } from "convex/values";
import type { Doc, Id } from "./_generated/dataModel";
import { requireOwnerId } from "./lib/auth";
import { assertTaskMatchesList, normalizeOptionalIsoDate, requireTrimmedText } from "./lib/domain.js";
import {
    createIdleAiAgent,
    createQueuedAiAgent,
    shouldRequeueTaskUpdate,
} from "./lib/taskAgent.js";

const priorityValue = v.union(
    v.literal("none"),
    v.literal("low"),
    v.literal("medium"),
    v.literal("high"),
);

const subtaskValue = v.object({
    id: v.string(),
    title: v.string(),
    done: v.boolean(),
});

const SORT_STEP = 1024;

function toTaskResponse(task: Doc<"tasks"> & { _id: Id<"tasks"> }) {
    return {
        id: task._id,
        title: task.title,
        description: task.description,
        status: task.status,
        dueAt: task.dueAt ?? null,
        projectId: task.projectId ?? null,
        priority: task.priority,
        tags: task.tags.map((tag) => ({
            label: tag.label,
            color: tag.color ?? null,
        })),
        sourceLabel: task.sourceLabel ?? null,
        isStale: task.isStale,
        subtasks: task.subtasks.map((subtask) => ({
            id: subtask.id,
            title: subtask.title,
            done: subtask.done,
        })),
        aiAgent: {
            status: task.aiAgent?.status ?? "idle",
            solvableType: task.aiAgent?.solvableType ?? null,
            highlighted: Boolean(task.aiAgent?.highlighted),
            resultMarkdown: task.aiAgent?.resultMarkdown ?? null,
            resultSummary: task.aiAgent?.resultSummary ?? null,
            sources: (task.aiAgent?.sources ?? []).map((source) => ({
                title: source.title,
                url: source.url,
            })),
            lastEvaluatedAt: task.aiAgent?.lastEvaluatedAt ?? null,
            solvedAt: task.aiAgent?.solvedAt ?? null,
            jobToken: task.aiAgent?.jobToken ?? 0,
        },
        sortKey: task.sortKey,
        createdAt: task.createdAt,
        updatedAt: task.updatedAt,
        completedAt: task.completedAt ?? null,
    };
}

async function queueTaskEvaluation(ctx: any, taskId: Id<"tasks">, jobToken: number) {
    await ctx.scheduler.runAfter(0, internal.taskAgent.evaluateAndSolve, {
        taskId,
        jobToken,
    });
}

async function listOwnerTasks(ctx: any, ownerId: string) {
    return ctx.db
        .query("tasks")
        .withIndex("by_owner_sort", (q: any) => q.eq("ownerId", ownerId))
        .collect();
}

async function ensureTaskOwner(ctx: any, ownerId: string, taskId: Id<"tasks">) {
    const task = await ctx.db.get(taskId);
    if (!task || task.ownerId !== ownerId) {
        throw new Error("Task not found.");
    }

    return task;
}

async function ensureProjectOwner(ctx: any, ownerId: string, projectId: Id<"projects"> | undefined) {
    if (!projectId) return null;

    const project = await ctx.db.get(projectId);
    if (!project || project.ownerId !== ownerId || project.archivedAt) {
        throw new Error("Project not found.");
    }

    return project;
}

function getTopSortKey(tasks: Array<Doc<"tasks">>) {
    return tasks[0]?.sortKey ?? 0;
}

function getBottomSortKey(tasks: Array<Doc<"tasks">>) {
    return tasks[tasks.length - 1]?.sortKey ?? 0;
}

async function rebalanceSortKeys(ctx: any, ownerId: string) {
    const tasks = await listOwnerTasks(ctx, ownerId);

    for (const [index, task] of tasks.entries()) {
        await ctx.db.patch(task._id, {
            sortKey: (index + 1) * SORT_STEP,
        });
    }

    return listOwnerTasks(ctx, ownerId);
}

async function resolveSortKeyBetween(
    ctx: any,
    ownerId: string,
    beforeTaskId: Id<"tasks"> | undefined,
    afterTaskId: Id<"tasks"> | undefined,
) {
    const tasks = await listOwnerTasks(ctx, ownerId);

    if (!beforeTaskId && !afterTaskId) {
        return getTopSortKey(tasks) - SORT_STEP;
    }

    if (!beforeTaskId) {
        const afterTask = tasks.find((task) => task._id === afterTaskId);
        if (!afterTask) throw new Error("Task not found.");
        return afterTask.sortKey - SORT_STEP;
    }

    if (!afterTaskId) {
        const beforeTask = tasks.find((task) => task._id === beforeTaskId);
        if (!beforeTask) throw new Error("Task not found.");
        return beforeTask.sortKey + SORT_STEP;
    }

    const beforeTask = tasks.find((task) => task._id === beforeTaskId);
    const afterTask = tasks.find((task) => task._id === afterTaskId);
    if (!beforeTask || !afterTask) throw new Error("Task not found.");

    if (afterTask.sortKey - beforeTask.sortKey <= 1) {
        const rebalanced = await rebalanceSortKeys(ctx, ownerId);
        const rebalancedBefore = rebalanced.find((task) => task._id === beforeTaskId);
        const rebalancedAfter = rebalanced.find((task) => task._id === afterTaskId);
        if (!rebalancedBefore || !rebalancedAfter) throw new Error("Task not found.");
        return (rebalancedBefore.sortKey + rebalancedAfter.sortKey) / 2;
    }

    return (beforeTask.sortKey + afterTask.sortKey) / 2;
}

export const list = query({
    args: {},
    handler: async (ctx) => {
        const ownerId = await requireOwnerId(ctx);
        const tasks = await listOwnerTasks(ctx, ownerId);
        return tasks.map(toTaskResponse);
    },
});

export const create = mutation({
    args: {
        title: v.string(),
        description: v.optional(v.string()),
        dueAt: v.optional(v.string()),
        projectId: v.optional(v.id("projects")),
        priority: v.optional(priorityValue),
        tags: v.optional(
            v.array(
                v.object({
                    label: v.string(),
                    color: v.optional(v.string()),
                }),
            ),
        ),
        sourceLabel: v.optional(v.string()),
        isStale: v.optional(v.boolean()),
        subtasks: v.optional(v.array(subtaskValue)),
    },
    handler: async (ctx, args) => {
        const ownerId = await requireOwnerId(ctx);
        await ensureProjectOwner(ctx, ownerId, args.projectId);

        const tasks = await listOwnerTasks(ctx, ownerId);
        const now = Date.now();
        const jobToken = now;
        const taskId = await ctx.db.insert("tasks", {
            ownerId,
            title: requireTrimmedText(args.title, "Task title"),
            description: args.description?.trim() ?? "",
            status: "todo",
            dueAt: normalizeOptionalIsoDate(args.dueAt, "due date"),
            projectId: args.projectId,
            priority: args.priority ?? "none",
            tags: args.tags ?? [],
            sourceLabel: args.sourceLabel,
            isStale: args.isStale ?? false,
            subtasks: (args.subtasks ?? []).map((subtask) => ({
                ...subtask,
                title: requireTrimmedText(subtask.title, "Subtask title"),
            })),
            aiAgent: createQueuedAiAgent(jobToken),
            sortKey: getTopSortKey(tasks) - SORT_STEP,
            createdAt: now,
            updatedAt: now,
            completedAt: undefined,
        });

        await queueTaskEvaluation(ctx, taskId, jobToken);

        const task = await ensureTaskOwner(ctx, ownerId, taskId);
        return toTaskResponse({ _id: taskId, ...task });
    },
});

export const update = mutation({
    args: {
        taskId: v.id("tasks"),
        title: v.optional(v.string()),
        description: v.optional(v.string()),
        dueAt: v.optional(v.union(v.string(), v.null())),
        projectId: v.optional(v.union(v.id("projects"), v.null())),
        priority: v.optional(priorityValue),
    },
    handler: async (ctx, args) => {
        const ownerId = await requireOwnerId(ctx);
        const task = await ensureTaskOwner(ctx, ownerId, args.taskId);

        const nextProjectId = args.projectId ?? undefined;
        if (nextProjectId) {
            await ensureProjectOwner(ctx, ownerId, nextProjectId);
        }

        const now = Date.now();
        const patch: Record<string, unknown> = { updatedAt: now };
        const shouldRequeue = shouldRequeueTaskUpdate(task, args);

        if (args.title !== undefined) patch.title = requireTrimmedText(args.title, "Task title");
        if (args.description !== undefined) patch.description = args.description.trim();
        if (args.priority !== undefined) patch.priority = args.priority;
        if (args.projectId !== undefined) patch.projectId = args.projectId ?? undefined;
        if (args.dueAt !== undefined) patch.dueAt = normalizeOptionalIsoDate(args.dueAt ?? undefined, "due date");

        if (shouldRequeue) {
            patch.aiAgent = createQueuedAiAgent(now);
        }

        await ctx.db.patch(args.taskId, patch);

        if (shouldRequeue) {
            await queueTaskEvaluation(ctx, args.taskId, now);
        }
    },
});

export const setStatus = mutation({
    args: {
        taskId: v.id("tasks"),
        status: v.union(v.literal("todo"), v.literal("completed")),
    },
    handler: async (ctx, args) => {
        const ownerId = await requireOwnerId(ctx);
        const task = await ensureTaskOwner(ctx, ownerId, args.taskId);
        const tasks = await listOwnerTasks(ctx, ownerId);
        const now = Date.now();

        await ctx.db.patch(args.taskId, {
            status: args.status,
            sortKey:
                args.status === "completed"
                    ? getBottomSortKey(tasks) + SORT_STEP
                    : getTopSortKey(tasks) - SORT_STEP,
            completedAt: args.status === "completed" ? now : undefined,
            updatedAt: now,
            dueAt: task.dueAt,
            aiAgent: task.aiAgent ?? createIdleAiAgent(),
        });
    },
});

export const reorder = mutation({
    args: {
        taskId: v.id("tasks"),
        beforeTaskId: v.optional(v.id("tasks")),
        afterTaskId: v.optional(v.id("tasks")),
        listKey: v.string(),
        todayIso: v.string(),
    },
    handler: async (ctx, args) => {
        const ownerId = await requireOwnerId(ctx);
        const movedTask = await ensureTaskOwner(ctx, ownerId, args.taskId);
        assertTaskMatchesList(movedTask, args.listKey, args.todayIso);

        if (args.beforeTaskId) {
            const beforeTask = await ensureTaskOwner(ctx, ownerId, args.beforeTaskId);
            assertTaskMatchesList(beforeTask, args.listKey, args.todayIso);
        }
        if (args.afterTaskId) {
            const afterTask = await ensureTaskOwner(ctx, ownerId, args.afterTaskId);
            assertTaskMatchesList(afterTask, args.listKey, args.todayIso);
        }

        const sortKey = await resolveSortKeyBetween(ctx, ownerId, args.beforeTaskId, args.afterTaskId);
        await ctx.db.patch(args.taskId, {
            sortKey,
            updatedAt: Date.now(),
        });
    },
});

export const addSubtask = mutation({
    args: {
        taskId: v.id("tasks"),
        title: v.string(),
    },
    handler: async (ctx, args) => {
        const ownerId = await requireOwnerId(ctx);
        const task = await ensureTaskOwner(ctx, ownerId, args.taskId);
        const nextSubtask = {
            id: crypto.randomUUID(),
            title: requireTrimmedText(args.title, "Subtask title"),
            done: false,
        };

        await ctx.db.patch(args.taskId, {
            subtasks: [...task.subtasks, nextSubtask],
            updatedAt: Date.now(),
        });
    },
});

export const updateSubtask = mutation({
    args: {
        taskId: v.id("tasks"),
        subtaskId: v.string(),
        title: v.string(),
    },
    handler: async (ctx, args) => {
        const ownerId = await requireOwnerId(ctx);
        const task = await ensureTaskOwner(ctx, ownerId, args.taskId);

        await ctx.db.patch(args.taskId, {
            subtasks: task.subtasks.map((subtask) =>
                subtask.id === args.subtaskId
                    ? { ...subtask, title: requireTrimmedText(args.title, "Subtask title") }
                    : subtask,
            ),
            updatedAt: Date.now(),
        });
    },
});

export const toggleSubtask = mutation({
    args: {
        taskId: v.id("tasks"),
        subtaskId: v.string(),
    },
    handler: async (ctx, args) => {
        const ownerId = await requireOwnerId(ctx);
        const task = await ensureTaskOwner(ctx, ownerId, args.taskId);

        await ctx.db.patch(args.taskId, {
            subtasks: task.subtasks.map((subtask) =>
                subtask.id === args.subtaskId ? { ...subtask, done: !subtask.done } : subtask,
            ),
            updatedAt: Date.now(),
        });
    },
});

export const removeSubtask = mutation({
    args: {
        taskId: v.id("tasks"),
        subtaskId: v.string(),
    },
    handler: async (ctx, args) => {
        const ownerId = await requireOwnerId(ctx);
        const task = await ensureTaskOwner(ctx, ownerId, args.taskId);

        await ctx.db.patch(args.taskId, {
            subtasks: task.subtasks.filter((subtask) => subtask.id !== args.subtaskId),
            updatedAt: Date.now(),
        });
    },
});

export const remove = mutation({
    args: {
        taskId: v.id("tasks"),
    },
    handler: async (ctx, args) => {
        const ownerId = await requireOwnerId(ctx);
        await ensureTaskOwner(ctx, ownerId, args.taskId);
        await ctx.db.delete(args.taskId);
        return { removed: true, taskId: args.taskId };
    },
});
