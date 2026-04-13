import { internalMutation, internalQuery } from "./_generated/server";
import { v } from "convex/values";
import {
    createProcessingAiAgent,
    createQueuedAiAgent,
    createSolvedAiAgent,
    createUnsolvedAiAgent,
} from "./lib/taskAgent.js";

export const getTaskForAgent = internalQuery({
    args: {
        taskId: v.id("tasks"),
    },
    handler: async (ctx, args) => {
        const task = await ctx.db.get(args.taskId);
        if (!task) return null;

        return {
            id: task._id,
            ownerId: task.ownerId,
            title: task.title,
            description: task.description,
            status: task.status,
            aiAgent: task.aiAgent,
        };
    },
});

export const markQueued = internalMutation({
    args: {
        taskId: v.id("tasks"),
        jobToken: v.number(),
    },
    handler: async (ctx, args) => {
        const task = await ctx.db.get(args.taskId);
        if (!task) return { ok: false, reason: "missing" };

        await ctx.db.patch(args.taskId, {
            aiAgent: createQueuedAiAgent(args.jobToken),
            updatedAt: Date.now(),
        });

        return { ok: true };
    },
});

export const markProcessing = internalMutation({
    args: {
        taskId: v.id("tasks"),
        jobToken: v.number(),
    },
    handler: async (ctx, args) => {
        const task = await ctx.db.get(args.taskId);
        if (!task) return { ok: false, stale: true };
        if (task.aiAgent.jobToken !== args.jobToken) {
            return { ok: false, stale: true };
        }
        if (task.status === "completed") {
            return { ok: false, stale: true };
        }

        await ctx.db.patch(args.taskId, {
            aiAgent: createProcessingAiAgent(args.jobToken, task.aiAgent),
            updatedAt: Date.now(),
        });

        return { ok: true, stale: false };
    },
});

export const applySolveResult = internalMutation({
    args: {
        taskId: v.id("tasks"),
        jobToken: v.number(),
        outcome: v.union(v.literal("solved"), v.literal("unsolved")),
        resultSummary: v.optional(v.union(v.string(), v.null())),
        resultMarkdown: v.optional(v.union(v.string(), v.null())),
        sources: v.optional(
            v.array(
                v.object({
                    title: v.string(),
                    url: v.string(),
                }),
            ),
        ),
    },
    handler: async (ctx, args) => {
        const task = await ctx.db.get(args.taskId);
        if (!task) return { ok: false, stale: true };
        if (task.aiAgent.jobToken !== args.jobToken) {
            return { ok: false, stale: true };
        }

        const now = Date.now();
        const aiAgent =
            args.outcome === "solved"
                ? createSolvedAiAgent(
                      args.jobToken,
                      {
                          resultSummary: args.resultSummary,
                          resultMarkdown: args.resultMarkdown,
                          sources: args.sources ?? [],
                      },
                      now,
                  )
                : createUnsolvedAiAgent(args.jobToken, now);

        await ctx.db.patch(args.taskId, {
            aiAgent,
            updatedAt: now,
        });

        return { ok: true, stale: false };
    },
});
