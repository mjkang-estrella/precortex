import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import type { Id } from "./_generated/dataModel";
import { requireOwnerId } from "./lib/auth";
import { normalizeOptionalIsoDate, requireTrimmedText } from "./lib/domain.js";
import {
    planTypeValue,
    projectBriefValue,
    routineValue,
    starterTaskValue,
    validateProjectCreateFromCopilot,
} from "./lib/projectCopilot.js";

function toProjectResponse(project: {
    _id: Id<"projects">;
    name: string;
    deadline?: string;
    summary: string;
    nextStep: string;
    planType?: "task_plan" | "routine_system";
    brief?: {
        name: string;
        deadline?: string;
        goal: string;
        currentProgress: string;
        successCriteria: string;
        constraints: string;
        blockersRisks: string;
    };
    routine?: {
        cadence: string;
        checkpoints: string[];
        rules: string[];
    };
    source?: "seed" | "user";
    createdAt: number;
    updatedAt: number;
}) {
    return {
        id: project._id,
        name: project.name,
        deadline: project.deadline ?? null,
        summary: project.summary,
        nextStep: project.nextStep,
        planType: project.planType ?? null,
        brief: project.brief
            ? {
                  name: project.brief.name,
                  deadline: project.brief.deadline ?? null,
                  goal: project.brief.goal,
                  currentProgress: project.brief.currentProgress,
                  successCriteria: project.brief.successCriteria,
                  constraints: project.brief.constraints,
                  blockersRisks: project.brief.blockersRisks,
              }
            : null,
        routine: project.routine
            ? {
                  cadence: project.routine.cadence,
                  checkpoints: [...project.routine.checkpoints],
                  rules: [...project.routine.rules],
              }
            : null,
        source: project.source ?? "user",
        createdAt: project.createdAt,
        updatedAt: project.updatedAt,
    };
}

async function ensureProjectOwner(ctx: any, ownerId: string, projectId: Id<"projects">) {
    const project = await ctx.db.get(projectId);
    if (!project || project.ownerId !== ownerId) {
        throw new Error("Project not found.");
    }

    return project;
}

export const list = query({
    args: {},
    handler: async (ctx) => {
        const ownerId = await requireOwnerId(ctx);
        const projects = await ctx.db
            .query("projects")
            .withIndex("by_owner", (q) => q.eq("ownerId", ownerId))
            .collect();

        return projects
            .filter((project) => !project.archivedAt)
            .sort((left, right) => right.createdAt - left.createdAt || left.name.localeCompare(right.name))
            .map((project) => toProjectResponse(project as any));
    },
});

export const create = mutation({
    args: {
        name: v.string(),
        deadline: v.optional(v.string()),
        summary: v.string(),
        nextStep: v.string(),
        starterTasks: v.optional(
            v.array(
                v.object({
                    title: v.string(),
                    description: v.optional(v.string()),
                    dueAt: v.optional(v.string()),
                    priority: v.optional(
                        v.union(
                            v.literal("none"),
                            v.literal("low"),
                            v.literal("medium"),
                            v.literal("high"),
                        ),
                    ),
                }),
            ),
        ),
    },
    handler: async (ctx, args) => {
        const ownerId = await requireOwnerId(ctx);
        const now = Date.now();

        const projectId = await ctx.db.insert("projects", {
            ownerId,
            name: requireTrimmedText(args.name, "Project name"),
            deadline: normalizeOptionalIsoDate(args.deadline, "deadline"),
            summary: requireTrimmedText(args.summary, "Project summary"),
            nextStep: requireTrimmedText(args.nextStep, "Project next step"),
            planType: undefined,
            brief: undefined,
            routine: undefined,
            source: "user",
            archivedAt: undefined,
            createdAt: now,
            updatedAt: now,
        });

        const existingTasks = await ctx.db
            .query("tasks")
            .withIndex("by_owner_sort", (q) => q.eq("ownerId", ownerId))
            .collect();
        const firstSortKey = existingTasks[0]?.sortKey ?? 0;
        const starterTasks = args.starterTasks ?? [];

        for (const [index, task] of starterTasks.entries()) {
            await ctx.db.insert("tasks", {
                ownerId,
                title: task.title.trim(),
                description: task.description?.trim() ?? "",
                status: "todo",
                dueAt: task.dueAt,
                projectId,
                priority: task.priority ?? (index === 0 ? "high" : "medium"),
                tags: [],
                sourceLabel: undefined,
                isStale: false,
                subtasks: [],
                sortKey: firstSortKey - (starterTasks.length - index) * 1024,
                createdAt: now,
                updatedAt: now,
                completedAt: undefined,
            });
        }

        const project = await ensureProjectOwner(ctx, ownerId, projectId);
        return toProjectResponse({ _id: projectId, ...project });
    },
});

export const createFromCopilot = mutation({
    args: {
        planType: planTypeValue,
        brief: projectBriefValue,
        routine: v.optional(v.union(routineValue, v.null())),
        starterTasks: v.array(starterTaskValue),
    },
    handler: async (ctx, args) => {
        const ownerId = await requireOwnerId(ctx);
        const now = Date.now();
        const normalized = validateProjectCreateFromCopilot(args);

        const projectId = await ctx.db.insert("projects", {
            ownerId,
            name: normalized.brief.name,
            deadline: normalized.brief.deadline,
            summary: normalized.summary,
            nextStep: normalized.nextStep,
            planType: normalized.planType,
            brief: normalized.brief,
            routine: normalized.routine ?? undefined,
            source: "user",
            archivedAt: undefined,
            createdAt: now,
            updatedAt: now,
        });

        const existingTasks = await ctx.db
            .query("tasks")
            .withIndex("by_owner_sort", (q) => q.eq("ownerId", ownerId))
            .collect();
        const firstSortKey = existingTasks[0]?.sortKey ?? 0;

        for (const [index, task] of normalized.starterTasks.entries()) {
            await ctx.db.insert("tasks", {
                ownerId,
                title: task.title,
                description: task.description ?? "",
                status: "todo",
                dueAt: task.dueAt,
                projectId,
                priority: task.priority ?? (index === 0 ? "high" : "medium"),
                tags: [],
                sourceLabel: undefined,
                isStale: false,
                subtasks: [],
                sortKey: firstSortKey - (normalized.starterTasks.length - index) * 1024,
                createdAt: now,
                updatedAt: now,
                completedAt: undefined,
            });
        }

        const project = await ensureProjectOwner(ctx, ownerId, projectId);
        return toProjectResponse({ _id: projectId, ...project });
    },
});

export const update = mutation({
    args: {
        projectId: v.id("projects"),
        name: v.optional(v.string()),
        deadline: v.optional(v.union(v.string(), v.null())),
        summary: v.optional(v.string()),
        nextStep: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const ownerId = await requireOwnerId(ctx);
        await ensureProjectOwner(ctx, ownerId, args.projectId);

        const patch: Record<string, unknown> = {
            updatedAt: Date.now(),
        };

        if (args.name !== undefined) {
            patch.name = requireTrimmedText(args.name, "Project name");
        }

        if (args.deadline !== undefined) {
            patch.deadline = normalizeOptionalIsoDate(args.deadline ?? undefined, "deadline");
        }

        if (args.summary !== undefined) {
            patch.summary = requireTrimmedText(args.summary, "Project summary");
        }

        if (args.nextStep !== undefined) {
            patch.nextStep = requireTrimmedText(args.nextStep, "Project next step");
        }

        await ctx.db.patch(args.projectId, patch);

        const project = await ensureProjectOwner(ctx, ownerId, args.projectId);
        return toProjectResponse({ _id: args.projectId, ...project });
    },
});

export const archive = mutation({
    args: {
        projectId: v.id("projects"),
    },
    handler: async (ctx, args) => {
        const ownerId = await requireOwnerId(ctx);
        await ensureProjectOwner(ctx, ownerId, args.projectId);

        const now = Date.now();
        await ctx.db.patch(args.projectId, {
            archivedAt: now,
            updatedAt: now,
        });

        const tasks = await ctx.db
            .query("tasks")
            .withIndex("by_owner_sort", (q) => q.eq("ownerId", ownerId))
            .collect();

        for (const task of tasks) {
            if (task.projectId !== args.projectId) continue;

            await ctx.db.patch(task._id, {
                projectId: undefined,
                updatedAt: now,
            });
        }

        return { archived: true, projectId: args.projectId };
    },
});

export const remove = mutation({
    args: {
        projectId: v.id("projects"),
    },
    handler: async (ctx, args) => {
        const ownerId = await requireOwnerId(ctx);
        await ensureProjectOwner(ctx, ownerId, args.projectId);

        const now = Date.now();
        const tasks = await ctx.db
            .query("tasks")
            .withIndex("by_owner_sort", (q) => q.eq("ownerId", ownerId))
            .collect();

        for (const task of tasks) {
            if (task.projectId !== args.projectId) continue;

            await ctx.db.patch(task._id, {
                projectId: undefined,
                updatedAt: now,
            });
        }

        await ctx.db.delete(args.projectId);
        return { removed: true, projectId: args.projectId };
    },
});
