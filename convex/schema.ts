import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { planTypeValue, projectBriefValue, routineValue } from "./lib/projectCopilot.js";
import { aiAgentValue } from "./lib/taskAgent.js";

const priorityValue = v.union(
    v.literal("none"),
    v.literal("low"),
    v.literal("medium"),
    v.literal("high"),
);

const statusValue = v.union(v.literal("todo"), v.literal("completed"));

const tagValue = v.object({
    label: v.string(),
    color: v.optional(v.string()),
});

const subtaskValue = v.object({
    id: v.string(),
    title: v.string(),
    done: v.boolean(),
});

export default defineSchema({
    projects: defineTable({
        ownerId: v.string(),
        name: v.string(),
        deadline: v.optional(v.string()),
        summary: v.string(),
        nextStep: v.string(),
        planType: v.optional(planTypeValue),
        brief: v.optional(projectBriefValue),
        routine: v.optional(routineValue),
        source: v.optional(v.union(v.literal("seed"), v.literal("user"))),
        archivedAt: v.optional(v.number()),
        createdAt: v.number(),
        updatedAt: v.number(),
    }).index("by_owner", ["ownerId"]),
    tasks: defineTable({
        ownerId: v.string(),
        title: v.string(),
        description: v.string(),
        status: statusValue,
        dueAt: v.optional(v.string()),
        projectId: v.optional(v.id("projects")),
        priority: priorityValue,
        tags: v.array(tagValue),
        sourceLabel: v.optional(v.string()),
        isStale: v.boolean(),
        subtasks: v.array(subtaskValue),
        aiAgent: v.optional(aiAgentValue),
        sortKey: v.number(),
        createdAt: v.number(),
        updatedAt: v.number(),
        completedAt: v.optional(v.number()),
    }).index("by_owner_sort", ["ownerId", "sortKey"]),
});
