"use node";

import { action } from "./_generated/server";
import { v } from "convex/values";
import { requireOwnerId } from "./lib/auth";
import { buildExaSearchContext, exaSearch, shouldUseExaSearch } from "./lib/exa.js";
import {
    copilotMessageValue,
    normalizeCopilotResponse,
} from "./lib/projectCopilot.js";

declare const process: {
    env: Record<string, string | undefined>;
};

const ANTHROPIC_URL = "https://api.anthropic.com/v1/messages";
const OPENAI_URL = "https://api.openai.com/v1/chat/completions";

function buildSystemPrompt() {
    return [
        "You are an AI project copilot inside a task management app.",
        "Your job is to align with the user on project goal, current state, success criteria, blockers, and execution shape before the project is created.",
        "You must choose between two plan modes:",
        '- "task_plan": for bounded work that can be turned into concrete next tasks now.',
        '- "routine_system": for ongoing or fuzzy work that first needs a repeatable routine, cadence, or operating system.',
        "Ask exactly one highest-value next question when you still need context.",
        "Only mark status as ready when the user has enough clarity for immediate action.",
        "Every ready response must include 3 to 6 executable starter tasks.",
        "Routine-system responses must also include a routine with cadence, checkpoints, and rules.",
        "Prefer concise, direct language.",
        "Return JSON only with this exact shape:",
        JSON.stringify(
            {
                assistantMessage: "string",
                status: "clarifying | ready",
                recommendedMode: "task_plan | routine_system",
                brief: {
                    name: "string",
                    deadline: "YYYY-MM-DD or empty string",
                    goal: "string",
                    currentProgress: "string",
                    successCriteria: "string",
                    constraints: "string",
                    blockersRisks: "string",
                },
                starterTasks: [
                    {
                        id: "string",
                        title: "string",
                        description: "string",
                        dueAt: "YYYY-MM-DD or empty string",
                        priority: "none | low | medium | high",
                    },
                ],
                routine: {
                    cadence: "string",
                    checkpoints: ["string"],
                    rules: ["string"],
                },
                missingInformation: ["string"],
            },
            null,
            2,
        ),
        "If status is clarifying, starterTasks may be empty and routine may be omitted.",
        "If status is ready and recommendedMode is task_plan, routine should be omitted.",
        "If status is ready and recommendedMode is routine_system, routine is required.",
    ].join("\n");
}

function buildTranscript(messages: Array<{ sender: string; text: string }>) {
    if (!messages.length) {
        return "No prior conversation. Start by asking for the project and the most important thing the user is trying to achieve.";
    }

    return messages
        .map((message) => `${message.sender === "assistant" ? "Assistant" : "User"}: ${message.text}`)
        .join("\n");
}

function buildUserPrompt(messages: Array<{ sender: string; text: string }>, searchContext = "") {
    const todayIso = new Date().toISOString().slice(0, 10);

    return [
        `Today's date: ${todayIso}`,
        "Conversation transcript:",
        buildTranscript(messages),
        "",
        searchContext ? `External research context:\n${searchContext}\n` : "",
        "Generate the next copilot response.",
        "Important guidance:",
        "- Extract and preserve as much structured project state as the user has already revealed.",
        "- If the user is missing operational structure, recommend routine_system.",
        "- If the user already has enough clarity for direct execution, recommend task_plan.",
        "- Missing information should only list the truly important gaps.",
        "- Starter tasks must be specific and immediately executable.",
    ].join("\n");
}

async function maybeLoadSearchContext(messages: Array<{ sender: string; text: string }>) {
    const exaApiKey = process.env.EXA_API_KEY;
    const latestUserMessage = [...messages].reverse().find((message) => message.sender === "user")?.text || "";
    if (!exaApiKey || !shouldUseExaSearch(latestUserMessage)) {
        return "";
    }

    try {
        const results = await exaSearch(buildTranscript(messages), {
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

async function callAnthropic(messages: Array<{ sender: string; text: string }>, searchContext = "") {
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
            max_tokens: 1400,
            system: buildSystemPrompt(),
            messages: [
                {
                    role: "user",
                    content: buildUserPrompt(messages, searchContext),
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

async function callOpenAi(messages: Array<{ sender: string; text: string }>, searchContext = "") {
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
                    content: buildUserPrompt(messages, searchContext),
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

function createInitialResponse() {
    return {
        assistantMessage:
            "What project are you trying to make real, and what would success look like if this worked?",
        status: "clarifying",
        recommendedMode: "task_plan",
        brief: {
            name: "",
            deadline: "",
            goal: "",
            currentProgress: "",
            successCriteria: "",
            constraints: "",
            blockersRisks: "",
        },
        starterTasks: [],
        routine: null,
        missingInformation: ["project name", "goal", "success criteria"],
    };
}

export const reply = action({
    args: {
        messages: v.array(copilotMessageValue),
    },
    handler: async (ctx, args) => {
        await requireOwnerId(ctx);

        const messages = args.messages.map((message) => ({
            sender: message.sender,
            text: message.text.trim(),
        })).filter((message) => message.text);

        if (!messages.length) {
            return normalizeCopilotResponse(createInitialResponse());
        }

        const searchContext = await maybeLoadSearchContext(messages);

        try {
            return normalizeCopilotResponse(await callAnthropic(messages, searchContext));
        } catch (anthropicError) {
            try {
                return normalizeCopilotResponse(await callOpenAi(messages, searchContext));
            } catch (openAiError) {
                const anthroMessage =
                    anthropicError instanceof Error ? anthropicError.message : "Anthropic request failed.";
                const openAiMessage =
                    openAiError instanceof Error ? openAiError.message : "OpenAI fallback request failed.";
                throw new Error(`Project copilot is unavailable. ${anthroMessage} ${openAiMessage}`);
            }
        }
    },
});
