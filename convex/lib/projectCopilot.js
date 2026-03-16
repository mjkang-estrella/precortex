import { v } from "convex/values";

import { normalizeOptionalIsoDate, requireTrimmedText } from "./domain.js";

export const planTypeValue = v.union(v.literal("task_plan"), v.literal("routine_system"));

export const copilotMessageValue = v.object({
    sender: v.union(v.literal("user"), v.literal("assistant")),
    text: v.string(),
});

export const projectBriefValue = v.object({
    name: v.string(),
    deadline: v.optional(v.string()),
    goal: v.string(),
    currentProgress: v.string(),
    successCriteria: v.string(),
    constraints: v.string(),
    blockersRisks: v.string(),
});

export const routineValue = v.object({
    cadence: v.string(),
    checkpoints: v.array(v.string()),
    rules: v.array(v.string()),
});

export const starterTaskValue = v.object({
    id: v.string(),
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
});

export function createEmptyProjectBrief() {
    return {
        name: "",
        deadline: undefined,
        goal: "",
        currentProgress: "",
        successCriteria: "",
        constraints: "",
        blockersRisks: "",
    };
}

export function createEmptyRoutine() {
    return {
        cadence: "",
        checkpoints: [],
        rules: [],
    };
}

function cleanString(value) {
    return typeof value === "string" ? value.trim() : "";
}

function uniqueStrings(values) {
    const seen = new Set();
    const result = [];

    for (const value of values) {
        const text = cleanString(value);
        if (!text) continue;
        if (seen.has(text.toLowerCase())) continue;
        seen.add(text.toLowerCase());
        result.push(text);
    }

    return result;
}

function normalizePriority(value, fallback = "medium") {
    if (value === "none" || value === "low" || value === "medium" || value === "high") {
        return value;
    }

    return fallback;
}

export function normalizeProjectBrief(input = {}) {
    const brief = createEmptyProjectBrief();

    brief.name = cleanString(input.name);
    brief.deadline = normalizeOptionalIsoDate(input.deadline, "deadline");
    brief.goal = cleanString(input.goal);
    brief.currentProgress = cleanString(input.currentProgress);
    brief.successCriteria = cleanString(input.successCriteria);
    brief.constraints = cleanString(input.constraints);
    brief.blockersRisks = cleanString(input.blockersRisks);

    return brief;
}

export function normalizeRoutine(input) {
    if (!input) return null;

    const cadence = cleanString(input.cadence);
    const checkpoints = uniqueStrings(Array.isArray(input.checkpoints) ? input.checkpoints : []);
    const rules = uniqueStrings(Array.isArray(input.rules) ? input.rules : []);

    if (!cadence && !checkpoints.length && !rules.length) {
        return null;
    }

    return {
        cadence,
        checkpoints,
        rules,
    };
}

export function normalizeStarterTasks(tasks = []) {
    return tasks
        .map((task, index) => {
            const title = cleanString(task.title);
            if (!title) return null;

            return {
                id: cleanString(task.id) || `starter-task-${index + 1}`,
                title,
                description: cleanString(task.description),
                dueAt: normalizeOptionalIsoDate(task.dueAt, "due date"),
                priority: normalizePriority(task.priority, index === 0 ? "high" : "medium"),
            };
        })
        .filter(Boolean);
}

export function buildProjectSummary(brief) {
    const sentences = [];

    if (brief.goal) {
        sentences.push(`Goal: ${brief.goal}.`);
    }
    if (brief.currentProgress) {
        sentences.push(`Current progress: ${brief.currentProgress}.`);
    }
    if (brief.successCriteria) {
        sentences.push(`Success criteria: ${brief.successCriteria}.`);
    }
    if (brief.constraints) {
        sentences.push(`Constraints: ${brief.constraints}.`);
    }
    if (brief.blockersRisks) {
        sentences.push(`Blockers and risks: ${brief.blockersRisks}.`);
    }
    if (brief.deadline) {
        sentences.push(`Target deadline: ${brief.deadline}.`);
    }

    return sentences.join(" ").trim() || "Project created from AI copilot planning.";
}

export function buildProjectNextStep(planType, starterTasks, routine, brief) {
    if (starterTasks[0]?.title) {
        return starterTasks[0].title;
    }

    if (planType === "routine_system" && routine?.checkpoints?.[0]) {
        return routine.checkpoints[0];
    }

    if (brief.goal) {
        return `Define the first executable move toward ${brief.goal}`;
    }

    return "Define the first executable move";
}

export function validateProjectCreateFromCopilot(input) {
    const brief = normalizeProjectBrief(input.brief);
    const planType = input.planType === "routine_system" ? "routine_system" : "task_plan";
    const starterTasks = normalizeStarterTasks(input.starterTasks);
    const routine = planType === "routine_system" ? normalizeRoutine(input.routine) : null;

    requireTrimmedText(brief.name, "Project name");
    requireTrimmedText(brief.goal, "Project goal");

    if (!starterTasks.length) {
        throw new Error("At least one starter task is required.");
    }

    if (planType === "routine_system" && !routine) {
        throw new Error("Routine details are required for routine-based projects.");
    }

    return {
        planType,
        brief,
        starterTasks,
        routine,
        summary: buildProjectSummary(brief),
        nextStep: buildProjectNextStep(planType, starterTasks, routine, brief),
    };
}

export function normalizeCopilotResponse(input = {}) {
    const brief = normalizeProjectBrief(input.brief);
    const recommendedMode = input.recommendedMode === "routine_system" ? "routine_system" : "task_plan";
    const routine = normalizeRoutine(input.routine);
    const starterTasks = normalizeStarterTasks(Array.isArray(input.starterTasks) ? input.starterTasks : []);
    const missingInformation = uniqueStrings(
        Array.isArray(input.missingInformation) ? input.missingInformation : [],
    );

    let status = input.status === "ready" ? "ready" : "clarifying";
    if (status === "ready" && starterTasks.length === 0) {
        status = "clarifying";
    }
    if (status === "ready" && recommendedMode === "routine_system" && !routine) {
        status = "clarifying";
    }

    return {
        assistantMessage: cleanString(input.assistantMessage),
        status,
        recommendedMode,
        brief,
        starterTasks,
        routine,
        missingInformation,
    };
}
