import { TODAY, TODAY_ISO, addDays, formatters, parseLocalISODate, toLocalISODate } from "../utils/date.js";

const QUESTION_COPY = {
    outcome: "what needs to be true for this project to feel successful?",
    motivation: "why does this project matter right now?",
    success: "how will you judge whether this project worked?",
    constraints: "what constraints do we need to respect?",
    risks: "what could derail this if we do the obvious thing too fast?",
    milestone: "what feels like the first meaningful milestone?",
    unknowns: "what still feels fuzzy or undecided?",
};

const FOLLOW_UP_ORDER = ["outcome", "motivation", "success", "constraints", "risks", "milestone", "unknowns"];

function createMessage(sender, text) {
    return { sender, text, rich: false, tasks: [] };
}

function cloneMessage(message) {
    return {
        ...message,
        tasks: message.tasks.map((task) => ({ ...task })),
    };
}

function countFilledAnswers(answers) {
    return FOLLOW_UP_ORDER.filter((key) => answers[key]).length;
}

function isPastDate(value) {
    return parseLocalISODate(value).getTime() < TODAY.getTime();
}

export function createProjectSetupState(open = false, previousView = "today") {
    return {
        open,
        previousView,
        phase: "chat",
        promptKey: "name",
        messages: open
            ? [createMessage("assistant", "let's turn this into a real plan. what's the project name?")]
            : [],
        answers: {
            name: "",
            deadline: "",
            outcome: "",
            motivation: "",
            success: "",
            constraints: "",
            risks: "",
            milestone: "",
            unknowns: "",
        },
        draft: null,
    };
}

export function cloneProjectSetupState(projectSetup) {
    return {
        ...projectSetup,
        messages: projectSetup.messages.map(cloneMessage),
        answers: { ...projectSetup.answers },
        draft: projectSetup.draft ? cloneProjectDraft(projectSetup.draft) : null,
    };
}

export function cloneProjectDraft(draft) {
    return {
        ...draft,
        tasks: draft.tasks.map((task) => ({ ...task })),
    };
}

function slugifyProjectName(value) {
    return value
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "")
        .slice(0, 48);
}

export function buildProjectId(name, nextProjectId) {
    const slug = slugifyProjectName(name) || `project-${nextProjectId}`;
    return `project-${slug}-${nextProjectId}`;
}

export function parseProjectDeadlineInput(value) {
    const text = value.trim().toLowerCase();
    if (!text) return null;
    if (text === "today") return TODAY_ISO;
    if (text === "tomorrow") return toLocalISODate(addDays(TODAY, 1));
    if (text === "next week") return toLocalISODate(addDays(TODAY, 7));

    const relativeMatch = text.match(/^in\s+(\d+)\s+days?$/);
    if (relativeMatch) {
        return toLocalISODate(addDays(TODAY, Number(relativeMatch[1])));
    }

    if (/^\d{4}-\d{2}-\d{2}$/.test(text)) {
        return text;
    }

    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return null;
    return toLocalISODate(parsed);
}

function getNextFollowUpKey(answers) {
    return FOLLOW_UP_ORDER.find((key) => !answers[key]) || null;
}

function hasDraftInputs(answers) {
    return Boolean(
        answers.name &&
            answers.deadline &&
            answers.outcome &&
            (answers.success || answers.constraints || answers.risks),
    );
}

function ensureSentence(value, fallback) {
    const text = value?.trim();
    if (!text) return fallback;
    return text.endsWith(".") ? text : `${text}.`;
}

function normalizeOutcome(value) {
    const text = value.trim().replace(/\.$/, "");
    const stripped = text
        .replace(/^we need\s+/i, "")
        .replace(/^need to\s+/i, "")
        .replace(/^to\s+/i, "");

    return stripped.charAt(0).toLowerCase() + stripped.slice(1);
}

function buildNextStep(answers) {
    if (answers.milestone) {
        return `Turn "${answers.milestone}" into a concrete execution checklist`;
    }

    if (answers.success) {
        return `Write the project brief and success criteria for ${answers.name}`;
    }

    return `Draft the first-pass plan for ${answers.name}`;
}

export function generateProjectDraft(answers) {
    const deadlineDate = parseLocalISODate(answers.deadline);
    const deadlineLabel = formatters.modalDate.format(deadlineDate).toLowerCase();
    const nextStep = buildNextStep(answers);
    const summary = [
        `The project aims to ${normalizeOutcome(answers.outcome)}.`,
        ensureSentence(
            answers.motivation,
            "It needs a sharper plan before execution starts.",
        ),
        ensureSentence(
            answers.success
                ? `Success looks like ${answers.success}`
                : "Success needs to be defined early so execution does not drift",
            "Success needs to be defined early so execution does not drift.",
        ),
        ensureSentence(
            answers.constraints
                ? `Constraints to respect: ${answers.constraints}`
                : answers.risks
                  ? `Main risk to watch: ${answers.risks}`
                  : "The first pass should surface the main blockers early",
            "The first pass should surface the main blockers early.",
        ),
        `Target deadline: ${deadlineLabel}.`,
    ].join(" ");

    const supportingTasks = [
        {
            id: "draft-task-1",
            title: nextStep,
            description: "Make the first concrete move so the project stops living as an idea.",
            dueAt: TODAY_ISO,
        },
        {
            id: "draft-task-2",
            title: `Define the success criteria for ${answers.name}`,
            description: answers.success
                ? answers.success
                : "Translate the desired outcome into a small set of checkable outcomes.",
            dueAt: null,
        },
        {
            id: "draft-task-3",
            title: `Document the scope, constraints, and risks`,
            description:
                answers.constraints || answers.risks || "Capture the limits and blockers before execution expands.",
            dueAt: null,
        },
        {
            id: "draft-task-4",
            title: `Break the first milestone into smaller tasks`,
            description:
                answers.milestone || "Pick the first milestone and split it into concrete chunks.",
            dueAt: null,
        },
        {
            id: "draft-task-5",
            title: `Schedule a project review before the deadline`,
            description: `Create a review point before ${deadlineLabel} so the project can still change course in time.`,
            dueAt: null,
        },
    ];

    if (answers.unknowns) {
        supportingTasks.push({
            id: "draft-task-6",
            title: "Resolve the key open questions",
            description: answers.unknowns,
            dueAt: null,
        });
    }

    return {
        name: answers.name,
        deadline: answers.deadline,
        summary,
        nextStep,
        tasks: supportingTasks.slice(0, 6),
    };
}

export function submitProjectSetupMessage(projectSetup, rawText) {
    const text = rawText.trim();
    if (!text) return projectSetup;

    const nextState = cloneProjectSetupState(projectSetup);
    nextState.messages.push(createMessage("user", text));

    if (nextState.promptKey === "name") {
        if (text.length < 3) {
            nextState.messages.push(
                createMessage("assistant", "give me a slightly clearer project name so i can anchor the plan."),
            );
            return nextState;
        }

        nextState.answers.name = text;
        nextState.promptKey = "deadline";
        nextState.messages.push(
            createMessage(
                "assistant",
                `good. when is ${text.toLowerCase()} due? you can say something like "2026-04-30", "tomorrow", or "in 10 days".`,
            ),
        );
        return nextState;
    }

    if (nextState.promptKey === "deadline") {
        const deadline = parseProjectDeadlineInput(text);
        if (!deadline || isPastDate(deadline)) {
            nextState.messages.push(
                createMessage(
                    "assistant",
                    "i need a real future deadline to shape the plan. try a date like 2026-04-30 or a phrase like tomorrow.",
                ),
            );
            return nextState;
        }

        nextState.answers.deadline = deadline;
        nextState.promptKey = "outcome";
        nextState.messages.push(
            createMessage("assistant", QUESTION_COPY.outcome),
        );
        return nextState;
    }

    nextState.answers[nextState.promptKey] = text;

    if (hasDraftInputs(nextState.answers) && countFilledAnswers(nextState.answers) >= 3) {
        nextState.phase = "review";
        nextState.promptKey = null;
        nextState.draft = generateProjectDraft(nextState.answers);
        nextState.messages.push(
            createMessage(
                "assistant",
                "i have enough to draft the plan. review it, edit anything that feels off, then create the project.",
            ),
        );
        return nextState;
    }

    const nextKey = getNextFollowUpKey(nextState.answers);
    nextState.promptKey = nextKey;
    nextState.messages.push(createMessage("assistant", QUESTION_COPY[nextKey]));
    return nextState;
}
