"use node";

import { action } from "./_generated/server";
import { v } from "convex/values";
import { requireOwnerId } from "./lib/auth";
import { buildExaSearchContext, exaSearch, shouldUseExaSearch } from "./lib/exa.js";
import {
    normalizeWorkspaceAssistantResponse,
    workspaceAssistantMessageValue,
    workspaceAssistantViewValue,
    workspaceAssistantWorkspaceValue,
} from "./lib/workspaceAssistant.js";

declare const process: {
    env: Record<string, string | undefined>;
};

const ANTHROPIC_URL = "https://api.anthropic.com/v1/messages";
const OPENAI_URL = "https://api.openai.com/v1/chat/completions";

function buildSystemPrompt() {
    return [
        "You are an AI workspace assistant inside a task planning app.",
        "You help the user refine tasks, understand the current workspace status, and start work.",
        "You are confirm-first. Never assume any draft change is applied automatically.",
        "Use the whole workspace for context, but anchor each reply on one primary focus task whenever possible.",
        "Status replies should summarize the workspace and recommend a focus task.",
        "Refinement replies should propose explicit task edits, not vague advice.",
        "Start-task replies must include a short kickoff brief and 3 to 5 concrete first steps.",
        "Keep proposals small and executable. Avoid broad rewrites across many tasks.",
        "If the user is clearly asking for workspace triage, you may return up to 3 proposals. Otherwise stay tied to one task.",
        "Return JSON only with this exact shape:",
        JSON.stringify(
            {
                assistantMessage: "string",
                summary: {
                    headline: "string",
                    focusTaskId: "string",
                    focusLabel: "string",
                    overdueCount: 0,
                    dueTodayCount: 0,
                    inboxCount: 0,
                    activeProjectCount: 0,
                },
                proposals: [
                    {
                        kind: "task_refine | schedule_change | project_move | starter_subtasks | start_task",
                        taskId: "string",
                        title: "string",
                        description: "string",
                        dueAt: "YYYY-MM-DD or null",
                        priority: "none | low | medium | high",
                        projectId: "string or null",
                        subtasks: ["string"],
                        brief: "string",
                        firstSteps: ["string"],
                        timeboxMinutes: 30,
                        reason: "string",
                    },
                ],
            },
            null,
            2,
        ),
    ].join("\n");
}

function buildTranscript(messages: Array<{ sender: string; text: string }>) {
    if (!messages.length) {
        return "No prior assistant conversation for this view.";
    }

    return messages
        .map((message) => `${message.sender === "assistant" ? "Assistant" : "User"}: ${message.text}`)
        .join("\n");
}

function buildUserPrompt(args: {
    view: string;
    selectedProjectId?: string | null;
    selectedTaskId?: string | null;
    message: string;
    conversation: Array<{ sender: string; text: string }>;
    workspace: {
        projects: Array<Record<string, unknown>>;
        tasks: Array<Record<string, unknown>>;
        counts: Record<string, unknown>;
    };
    searchContext?: string;
}) {
    const todayIso = new Date().toISOString().slice(0, 10);

    return [
        `Today's date: ${todayIso}`,
        `Current view: ${args.view}`,
        `Selected project id: ${args.selectedProjectId || "none"}`,
        `Selected task id: ${args.selectedTaskId || "none"}`,
        `User message: ${args.message}`,
        "",
        "Conversation transcript:",
        buildTranscript(args.conversation),
        "",
        "Workspace snapshot:",
        JSON.stringify(args.workspace, null, 2),
        "",
        args.searchContext ? `External research context:\n${args.searchContext}\n` : "",
        "Generate the next assistant response.",
        "Important guidance:",
        "- Use summary.headline to explain the current state in one sentence.",
        "- Use summary.focusTaskId for the best task to move now.",
        "- Return proposals only when they clearly help the user act.",
        "- start_task proposals should be guidance only, not edits.",
    ].join("\n");
}

async function maybeLoadSearchContext(args: {
    message: string;
    workspace: { tasks: Array<Record<string, unknown>> };
    selectedTaskId?: string | null;
}) {
    const exaApiKey = process.env.EXA_API_KEY;
    if (!exaApiKey || !shouldUseExaSearch(args.message)) {
        return "";
    }

    const selectedTask = args.selectedTaskId
        ? args.workspace.tasks.find((task) => task.id === args.selectedTaskId)
        : null;
    const query = [
        args.message,
        selectedTask?.title ? `Current task: ${selectedTask.title}` : "",
        selectedTask?.description ? `Task details: ${selectedTask.description}` : "",
    ]
        .filter(Boolean)
        .join(". ");

    try {
        const results = await exaSearch(query, {
            apiKey: exaApiKey,
            numResults: 4,
            maxCharacters: 1000,
        });
        return buildExaSearchContext(results);
    } catch {
        return "";
    }
}

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

async function callAnthropic(args: any) {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
        throw new Error("Anthropic is not configured.");
    }

    const response = await fetch(ANTHROPIC_URL, {
        method: "POST",
        headers: {
            "content-type": "application/json",
            "x-api-key": apiKey,
            "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
            model: process.env.ANTHROPIC_MODEL || "claude-sonnet-4-6",
            max_tokens: 1800,
            system: buildSystemPrompt(),
            messages: [
                {
                    role: "user",
                    content: buildUserPrompt(args),
                },
            ],
        }),
    });

    const data = await parseJsonResponse(response);
    const text = data?.content?.find?.((entry: any) => entry.type === "text")?.text;
    if (!text) {
        throw new Error("Anthropic response did not contain text.");
    }

    return JSON.parse(extractJsonObject(text));
}

async function callOpenAi(args: any) {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
        throw new Error("OpenAI fallback is not configured.");
    }

    const response = await fetch(OPENAI_URL, {
        method: "POST",
        headers: {
            "content-type": "application/json",
            authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
            model: process.env.OPENAI_MODEL || "gpt-4.1-mini",
            response_format: { type: "json_object" },
            messages: [
                {
                    role: "system",
                    content: buildSystemPrompt(),
                },
                {
                    role: "user",
                    content: buildUserPrompt(args),
                },
            ],
        }),
    });

    const data = await parseJsonResponse(response);
    const text = data?.choices?.[0]?.message?.content;
    if (!text) {
        throw new Error("OpenAI response did not contain text.");
    }

    return JSON.parse(extractJsonObject(text));
}

function createFallbackResponse(args: {
    workspace: {
        counts: {
            overdue: number;
            dueToday: number;
            inbox: number;
        };
    };
}) {
    return normalizeWorkspaceAssistantResponse(
        {
            assistantMessage: "",
            summary: {
                headline:
                    args.workspace.counts.overdue > 0
                        ? `${args.workspace.counts.overdue} overdue tasks need attention.`
                        : "Ask for a status brief, a task refinement, or a starting plan.",
            },
            proposals: [],
        },
        args.workspace,
        {},
    );
}

export const reply = action({
    args: {
        view: workspaceAssistantViewValue,
        selectedProjectId: v.optional(v.union(v.string(), v.null())),
        selectedTaskId: v.optional(v.union(v.string(), v.null())),
        message: v.string(),
        conversation: v.array(workspaceAssistantMessageValue),
        workspace: workspaceAssistantWorkspaceValue,
    },
    handler: async (ctx, args) => {
        await requireOwnerId(ctx);

        const payload = {
            view: args.view,
            workspace: args.workspace,
            selectedProjectId: args.selectedProjectId ?? null,
            selectedTaskId: args.selectedTaskId ?? null,
            message: args.message.trim(),
            conversation: args.conversation
                .map((message) => ({
                    sender: message.sender,
                    text: message.text.trim(),
                }))
                .filter((message) => message.text),
            searchContext: "",
        };

        if (!payload.message) {
            return createFallbackResponse(payload);
        }

        payload.searchContext = await maybeLoadSearchContext(payload);

        try {
            return normalizeWorkspaceAssistantResponse(
                await callAnthropic(payload),
                payload.workspace,
                {
                    selectedProjectId: payload.selectedProjectId,
                    selectedTaskId: payload.selectedTaskId,
                },
            );
        } catch (anthropicError) {
            try {
                return normalizeWorkspaceAssistantResponse(
                    await callOpenAi(payload),
                    payload.workspace,
                    {
                        selectedProjectId: payload.selectedProjectId,
                        selectedTaskId: payload.selectedTaskId,
                    },
                );
            } catch (openAiError) {
                const anthroMessage =
                    anthropicError instanceof Error ? anthropicError.message : "Anthropic request failed.";
                const openAiMessage =
                    openAiError instanceof Error ? openAiError.message : "OpenAI fallback request failed.";
                throw new Error(`Workspace assistant is unavailable. ${anthroMessage} ${openAiMessage}`);
            }
        }
    },
});
