import { escapeHtml, ordinalLabel } from "../utils/text.js";
import {
    getFutureTodoTasks,
    getInboxTasks,
    getProject,
    getProjectTasks,
    getTaskDueMeta,
    getTodayTasks,
} from "./selectors.js";

function buildTodayReply(text, state, assistantConfigs) {
    const key = text.toLowerCase();
    const todayTasks = getTodayTasks(state);

    if (key.includes("prioritize")) {
        return {
            text: "based on your tasks, here's how i'd order your day:",
            tasks: todayTasks.slice(0, 3).map((task, index) => ({
                order: ordinalLabel(index),
                text: `${task.title} ${
                    getTaskDueMeta(task).tone === "overdue" ? "— already overdue" : "— due today"
                }`,
            })),
        };
    }

    if (key.includes("suggest")) {
        return {
            text: "looking at your projects, here are a few tasks you might want to add:",
            tasks: [
                { text: "Schedule follow-up after the agency pitch review" },
                { text: "Share the Q3 content draft for feedback" },
                { text: "Set a hard deadline for the brand voice update" },
            ],
        };
    }

    if (key.includes("break down")) {
        const task = todayTasks[0];
        return {
            text: task
                ? `here's how to break down <strong>${escapeHtml(task.title)}</strong>:`
                : "there isn't an overdue task right now, so i'd break down the next due item instead:",
            tasks: task
                ? [
                      { text: "Capture the core objective and deadline" },
                      { text: "List the 2 or 3 decisions blocking progress" },
                      { text: "Draft the first pass before editing for polish" },
                      { text: "Schedule a quick review checkpoint" },
                  ]
                : [
                      { text: "Pick the next due task" },
                      { text: "Write the first obvious substep" },
                      { text: "Set a 30-minute start block on the calendar" },
                  ],
        };
    }

    return {
        text: assistantConfigs.today.defaultReply,
        tasks: [],
    };
}

function buildInboxReply(text, state, assistantConfigs) {
    const key = text.toLowerCase();
    const inboxTasks = getInboxTasks(state);

    if (key.includes("batch")) {
        return {
            text: "i can auto-schedule these based on your habits. here's a proposal:",
            tasks: inboxTasks.slice(0, 3).map((task, index) => ({
                order: ["Today", "Tomorrow", "Next Week"][index] || "Later",
                text: task.title,
            })),
        };
    }

    if (key.includes("folder") || key.includes("suggest")) {
        return {
            text: "here are some suggested projects for these unsorted items:",
            tasks: inboxTasks.slice(0, 3).map((task) => ({
                order: task.tags[0]
                    ? task.tags[0].label.replace(/\b\w/g, (char) => char.toUpperCase())
                    : "General",
                text: task.title,
            })),
        };
    }

    if (key.includes("summarize") || key.includes("missed")) {
        return {
            text: `you've got ${inboxTasks.length} items needing triage. two look like quick reviews, one feels like deeper planning work, and at least one has been sitting long enough to schedule today.`,
            tasks: [],
        };
    }

    return {
        text: assistantConfigs.inbox.defaultReply,
        tasks: [],
    };
}

function buildUpcomingReply(text, state, assistantConfigs) {
    const key = text.toLowerCase();
    const futureTasks = getFutureTodoTasks(state);
    const overdueTasks = getTodayTasks(state).filter(
        (task) => getTaskDueMeta(task).tone === "overdue",
    );

    if (key.includes("balance") || key.includes("workload")) {
        return {
            text: "here's a lighter way to spread the rest of your week:",
            tasks: futureTasks.slice(0, 3).map((task, index) => ({
                order: ordinalLabel(index),
                text: `${task.title} — ${getTaskDueMeta(task).label}`,
            })),
        };
    }

    if (key.includes("reschedule") || key.includes("overdue")) {
        return overdueTasks.length
            ? {
                  text: "these overdue tasks should move first before the later work piles up:",
                  tasks: overdueTasks.map((task) => ({
                      text: `${task.title} — reschedule for the next open block`,
                  })),
              }
            : {
                  text: "good news: nothing is overdue right now. i'd keep the earliest upcoming work where it is.",
                  tasks: futureTasks
                      .slice(0, 2)
                      .map((task) => ({ text: `${task.title} — ${getTaskDueMeta(task).label}` })),
              };
    }

    return {
        text: assistantConfigs.upcoming.defaultReply,
        tasks: [],
    };
}

function buildProjectReply(text, state, assistantConfigs) {
    const key = text.toLowerCase();
    const project = getProject(state, state.selectedProjectId);
    const projectTasks = project ? getProjectTasks(state, project.id) : [];

    if (!project) {
        return {
            text: assistantConfigs.project.defaultReply,
            tasks: [],
        };
    }

    if (key.includes("next")) {
        return {
            text: `the best next move is still <strong>${escapeHtml(project.nextStep)}</strong>. after that, i'd keep momentum with these tasks:`,
            tasks: projectTasks.slice(0, 3).map((task, index) => ({
                order: ordinalLabel(index),
                text: task.title,
            })),
        };
    }

    if (key.includes("risk")) {
        return {
            text: "the plan looks fine structurally, but these are the spots i'd watch before execution speeds up:",
            tasks: [
                { text: "Scope creep if the outcome is not rechecked against the deadline" },
                { text: "Decision debt if constraints stay implicit instead of written down" },
                {
                    text: projectTasks[0]
                        ? `Losing momentum if "${projectTasks[0].title}" does not start soon`
                        : "No immediate task has been started yet",
                },
            ],
        };
    }

    if (key.includes("break down")) {
        return {
            text: `here's how i'd break down <strong>${escapeHtml(project.nextStep)}</strong>:`,
            tasks: [
                { text: "Write the smallest possible first draft" },
                { text: "List the open decisions and unknowns" },
                { text: "Choose an owner or review checkpoint" },
                { text: "Set the next concrete action right after the draft exists" },
            ],
        };
    }

    return {
        text: `i'm keeping ${project.name} pointed at the deadline. ask for the next step, risks, or a breakdown of the immediate work.`,
        tasks: [],
    };
}

export function buildAssistantReply({ view, text, state, assistantConfigs }) {
    if (view === "project") return buildProjectReply(text, state, assistantConfigs);
    if (view === "inbox") return buildInboxReply(text, state, assistantConfigs);
    if (view === "upcoming") return buildUpcomingReply(text, state, assistantConfigs);
    return buildTodayReply(text, state, assistantConfigs);
}
