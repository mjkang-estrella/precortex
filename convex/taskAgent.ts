"use node";

import { internalAction } from "./_generated/server";
import { internal } from "./_generated/api.js";
import { v } from "convex/values";
import { buildExaSearchContext, exaSearch } from "./lib/exa.js";
import {
    evaluateResearchQaEligibility,
    normalizeSolvedResearchResult,
} from "./lib/taskAgent.js";

declare const process: {
    env: Record<string, string | undefined>;
};

const OPENAI_CHAT_URL = "https://api.openai.com/v1/chat/completions";

function extractJsonObject(text: string) {
    const trimmed = text.trim();
    if (trimmed.startsWith("{") && trimmed.endsWith("}")) {
        return trimmed;
    }

    const match = trimmed.match(/\{[\s\S]*\}/);
    if (!match) {
        throw new Error("Model response did not include valid JSON.");
    }

    return match[0];
}

async function parseJsonResponse(response: Response) {
    const text = await response.text();
    let data: any = null;

    try {
        data = JSON.parse(text);
    } catch {
        throw new Error(`Provider returned non-JSON response: ${text.slice(0, 280)}`);
    }

    if (!response.ok) {
        throw new Error(data?.error?.message || data?.message || `Provider request failed with ${response.status}.`);
    }

    return data;
}

async function callOpenAi(model: string, messages: Array<{ role: string; content: string }>) {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
        throw new Error("OpenAI is not configured.");
    }

    const response = await fetch(OPENAI_CHAT_URL, {
        method: "POST",
        headers: {
            "content-type": "application/json",
            authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
            model,
            messages,
        }),
    });

    const data = await parseJsonResponse(response);
    const text = data?.choices?.[0]?.message?.content;
    if (!text) {
        throw new Error("OpenAI response did not contain text.");
    }

    return JSON.parse(extractJsonObject(text));
}

async function classifyTask(task: { title: string; description: string }) {
    const heuristic = evaluateResearchQaEligibility(task);
    if (!heuristic.eligible) {
        return heuristic;
    }

    const data = await callOpenAi(process.env.OPENAI_CLASSIFIER_MODEL || "gpt-4.1-mini", [
        {
            role: "system",
            content: [
                "You are a strict task classifier for an AI auto-solving agent.",
                "Only classify a task as solvable when it is narrow research or Q&A work with a clear deliverable.",
                "Reject tasks that require external side effects, coding, design, file editing, outreach, or open-ended strategy.",
                "Return JSON only: { solvable: boolean, solvableType: 'research_qa' | null, reason: string }",
            ].join("\n"),
        },
        {
            role: "user",
            content: `Task title: ${task.title}\nTask description: ${task.description || "(empty)"}`,
        },
    ]);

    return {
        eligible: Boolean(data?.solvable) && data?.solvableType === "research_qa",
        solvableType: data?.solvableType === "research_qa" ? "research_qa" : null,
        reason: typeof data?.reason === "string" ? data.reason.trim() : heuristic.reason,
    };
}

async function solveResearchTask(task: { title: string; description: string }) {
    const exaApiKey = process.env.EXA_API_KEY;
    if (!exaApiKey) {
        throw new Error("Exa is not configured.");
    }

    const searchQuery = [task.title, task.description].filter(Boolean).join(". ").trim();
    const searchResults = await exaSearch(searchQuery, {
        apiKey: exaApiKey,
        numResults: 5,
        maxCharacters: 1400,
    });

    if (!searchResults.length) {
        throw new Error("Exa did not return any search results.");
    }

    const data = await callOpenAi(process.env.OPENAI_RESEARCH_MODEL || "gpt-4o-search-preview", [
        {
            role: "system",
            content: [
                "You solve narrow research and question-answer tasks using provided Exa search results.",
                "Return JSON only.",
                "Use this exact shape:",
                JSON.stringify(
                    {
                        resultSummary: "string",
                        resultMarkdown: "## AI Result\n### Answer\n...\n### Key findings\n- ...\n### Sources\n- [Title](https://example.com)",
                        sources: [{ title: "string", url: "https://example.com" }],
                    },
                    null,
                    2,
                ),
                "Requirements:",
                "- Write a concise answer.",
                "- Include 2 to 6 sources.",
                "- Only include valid http or https URLs.",
                "- Only use the provided Exa search context as factual grounding.",
            ].join("\n"),
        },
        {
            role: "user",
            content: [
                "Solve this task using the Exa search context below.",
                `Title: ${task.title}`,
                `Description: ${task.description || "(empty)"}`,
                "",
                "Exa search context:",
                buildExaSearchContext(searchResults),
            ].join("\n"),
        },
    ]);

    return normalizeSolvedResearchResult(data);
}

export const evaluateAndSolve = internalAction({
    args: {
        taskId: v.id("tasks"),
        jobToken: v.number(),
    },
    handler: async (ctx, args) => {
        const task = await ctx.runQuery(internal.tasksInternal.getTaskForAgent, {
            taskId: args.taskId,
        });
        if (!task || task.status === "completed" || task.aiAgent.jobToken !== args.jobToken) {
            return { ok: false, stale: true };
        }

        const processing = await ctx.runMutation(internal.tasksInternal.markProcessing, {
            taskId: args.taskId,
            jobToken: args.jobToken,
        });
        if (!processing?.ok) {
            return { ok: false, stale: true };
        }

        let classification;
        try {
            classification = await classifyTask(task);
        } catch {
            await ctx.runMutation(internal.tasksInternal.applySolveResult, {
                taskId: args.taskId,
                jobToken: args.jobToken,
                outcome: "unsolved",
            });
            return { ok: true, outcome: "unsolved" };
        }

        if (!classification.eligible) {
            await ctx.runMutation(internal.tasksInternal.applySolveResult, {
                taskId: args.taskId,
                jobToken: args.jobToken,
                outcome: "unsolved",
            });
            return { ok: true, outcome: "unsolved" };
        }

        let solved = null;
        try {
            solved = await solveResearchTask(task);
        } catch {
            solved = null;
        }

        if (!solved) {
            await ctx.runMutation(internal.tasksInternal.applySolveResult, {
                taskId: args.taskId,
                jobToken: args.jobToken,
                outcome: "unsolved",
            });
            return { ok: true, outcome: "unsolved" };
        }

        await ctx.runMutation(internal.tasksInternal.applySolveResult, {
            taskId: args.taskId,
            jobToken: args.jobToken,
            outcome: "solved",
            resultSummary: solved.resultSummary,
            resultMarkdown: solved.resultMarkdown,
            sources: solved.sources,
        });

        return { ok: true, outcome: "solved" };
    },
});
