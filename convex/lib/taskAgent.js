import { v } from "convex/values";

export const aiAgentStatusValue = v.union(
    v.literal("idle"),
    v.literal("queued"),
    v.literal("processing"),
    v.literal("solved"),
    v.literal("unsolved"),
);

export const aiAgentSolvableTypeValue = v.union(v.literal("research_qa"), v.null());

export const aiAgentSourceValue = v.object({
    title: v.string(),
    url: v.string(),
});

export const aiAgentValue = v.object({
    status: aiAgentStatusValue,
    solvableType: aiAgentSolvableTypeValue,
    highlighted: v.boolean(),
    resultMarkdown: v.union(v.string(), v.null()),
    resultSummary: v.union(v.string(), v.null()),
    sources: v.array(aiAgentSourceValue),
    lastEvaluatedAt: v.union(v.number(), v.null()),
    solvedAt: v.union(v.number(), v.null()),
    jobToken: v.number(),
});

function cleanString(value) {
    return typeof value === "string" ? value.trim() : "";
}

function uniqueSources(sources = []) {
    const result = [];
    const seen = new Set();

    for (const source of sources) {
        const title = cleanString(source?.title);
        const url = cleanString(source?.url);
        if (!title || !/^https?:\/\//i.test(url)) continue;

        const key = url.toLowerCase();
        if (seen.has(key)) continue;
        seen.add(key);
        result.push({ title, url });
        if (result.length >= 6) break;
    }

    return result;
}

export function createIdleAiAgent(jobToken = 0) {
    return {
        status: "idle",
        solvableType: null,
        highlighted: false,
        resultMarkdown: null,
        resultSummary: null,
        sources: [],
        lastEvaluatedAt: null,
        solvedAt: null,
        jobToken,
    };
}

export function createQueuedAiAgent(jobToken) {
    return {
        ...createIdleAiAgent(jobToken),
        status: "queued",
    };
}

export function createProcessingAiAgent(jobToken, currentState = {}) {
    return {
        ...createIdleAiAgent(jobToken),
        ...currentState,
        status: "processing",
        jobToken,
    };
}

export function createSolvedAiAgent(jobToken, result, now) {
    return {
        status: "solved",
        solvableType: "research_qa",
        highlighted: true,
        resultMarkdown: cleanString(result?.resultMarkdown) || null,
        resultSummary: cleanString(result?.resultSummary) || null,
        sources: uniqueSources(result?.sources),
        lastEvaluatedAt: now,
        solvedAt: now,
        jobToken,
    };
}

export function createUnsolvedAiAgent(jobToken, now) {
    return {
        ...createIdleAiAgent(jobToken),
        status: "unsolved",
        lastEvaluatedAt: now,
    };
}

export function isStaleAgentJob(task, jobToken) {
    return !task || task.aiAgent?.jobToken !== jobToken;
}

export function shouldRequeueTaskUpdate(task, args) {
    const nextTitle = args.title !== undefined ? cleanString(args.title) : cleanString(task.title);
    const nextDescription =
        args.description !== undefined ? cleanString(args.description) : cleanString(task.description);

    return nextTitle !== cleanString(task.title) || nextDescription !== cleanString(task.description);
}

const POSITIVE_PATTERNS = [
    /\b(compare|comparison|research|find|lookup|look up|what is|which is|summarize|summary|brief|explain|answer|list|top \d+|best)\b/i,
];

const DELIVERABLE_PATTERNS = [
    /\b(summary|brief|answer|comparison|options|list|recommendation|findings|overview|pros and cons)\b/i,
    /\bcompare\b/i,
    /\bwhat\b.+\?/i,
];

const DISALLOWED_PATTERNS = [
    /\b(email|call|text|message|dm|book|schedule|pay|purchase|ship|deploy|implement|code|build|design|draw|fix|edit file|upload|post|tweet|reply)\b/i,
];

export function evaluateResearchQaEligibility(task) {
    const title = cleanString(task?.title);
    const description = cleanString(task?.description);
    const content = `${title}\n${description}`.trim();

    if (!content) {
        return {
            eligible: false,
            reason: "Task does not contain enough detail to solve.",
        };
    }

    if (DISALLOWED_PATTERNS.some((pattern) => pattern.test(content))) {
        return {
            eligible: false,
            reason: "Task requires external action or non-research work.",
        };
    }

    if (!POSITIVE_PATTERNS.some((pattern) => pattern.test(content))) {
        return {
            eligible: false,
            reason: "Task does not clearly ask for research or question answering.",
        };
    }

    if (!DELIVERABLE_PATTERNS.some((pattern) => pattern.test(content))) {
        return {
            eligible: false,
            reason: "Task does not specify a concrete research deliverable.",
        };
    }

    return {
        eligible: true,
        solvableType: "research_qa",
        reason: "Task is a narrow research or question-answer request with a clear output.",
    };
}

function normalizeMarkdown(value) {
    return cleanString(value).replace(/\r\n/g, "\n");
}

export function normalizeSolvedResearchResult(input = {}) {
    const resultSummary = cleanString(input.resultSummary);
    const resultMarkdown = normalizeMarkdown(input.resultMarkdown);
    const sources = uniqueSources(input.sources);

    if (!resultSummary || !resultMarkdown || sources.length < 2) {
        return null;
    }

    return {
        resultSummary,
        resultMarkdown,
        sources,
    };
}
