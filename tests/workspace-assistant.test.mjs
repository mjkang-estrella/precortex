import test from "node:test";
import assert from "node:assert/strict";

import {
    normalizeWorkspaceAssistantResponse,
    pickDefaultFocusTask,
} from "../convex/lib/workspaceAssistant.js";

function createWorkspace(overrides = {}) {
    return {
        projects: [
            {
                id: "project-alpha",
                name: "Alpha",
                deadline: "2026-04-01",
                summary: "Alpha summary",
                nextStep: "Ship alpha",
            },
        ],
        tasks: [
            {
                id: "task-overdue",
                title: "Fix overdue issue",
                description: "Needs attention",
                dueAt: "2026-03-20",
                priority: "medium",
                projectId: undefined,
                subtasks: [{ id: "s1", title: "Check logs", done: false }],
                createdAt: 10,
                updatedAt: 20,
            },
            {
                id: "task-project",
                title: "Project next step",
                description: "Important project task",
                dueAt: "2026-03-25",
                priority: "high",
                projectId: "project-alpha",
                subtasks: [{ id: "s2", title: "Draft brief", done: false }],
                createdAt: 30,
                updatedAt: 40,
            },
            {
                id: "task-inbox",
                title: "Inbox idea",
                description: "",
                dueAt: undefined,
                priority: "low",
                projectId: undefined,
                subtasks: [],
                createdAt: 50,
                updatedAt: 60,
            },
            {
                id: "task-nearest",
                title: "Tomorrow follow-up",
                description: "Soon",
                dueAt: "2026-03-22",
                priority: "none",
                projectId: undefined,
                subtasks: [{ id: "s3", title: "Ping", done: false }],
                createdAt: 70,
                updatedAt: 80,
            },
        ],
        counts: {
            inbox: 1,
            overdue: 1,
            dueToday: 0,
            upcoming: 2,
            completedRecently: 1,
        },
        ...overrides,
    };
}

test("pickDefaultFocusTask prefers selected task first", () => {
    const workspace = createWorkspace();

    const focusTask = pickDefaultFocusTask(workspace, {
        selectedTaskId: "task-inbox",
        selectedProjectId: "project-alpha",
    });

    assert.equal(focusTask.id, "task-inbox");
});

test("pickDefaultFocusTask prefers selected project task before overdue work", () => {
    const workspace = createWorkspace();

    const focusTask = pickDefaultFocusTask(workspace, {
        selectedProjectId: "project-alpha",
    });

    assert.equal(focusTask.id, "task-project");
});

test("pickDefaultFocusTask falls back to overdue and then inbox refinement", () => {
    const workspace = createWorkspace({
        tasks: createWorkspace().tasks.filter((task) => task.id !== "task-project"),
    });

    const overdueFocus = pickDefaultFocusTask(workspace, {});
    assert.equal(overdueFocus.id, "task-overdue");

    const noOverdue = createWorkspace({
        tasks: createWorkspace().tasks
            .filter((task) => task.id !== "task-project" && task.id !== "task-overdue")
            .map((task) => ({ ...task, dueAt: undefined })),
        counts: {
            inbox: 1,
            overdue: 0,
            dueToday: 0,
            upcoming: 0,
            completedRecently: 0,
        },
    });
    const inboxFocus = pickDefaultFocusTask(noOverdue, {});
    assert.equal(inboxFocus.id, "task-inbox");
});

test("normalizeWorkspaceAssistantResponse drops invalid proposals and normalizes valid ones", () => {
    const workspace = createWorkspace();

    const normalized = normalizeWorkspaceAssistantResponse(
        {
            assistantMessage: "Status is clear.",
            summary: {
                headline: "One overdue task needs attention.",
                focusTaskId: "missing-task",
            },
            proposals: [
                {
                    kind: "task_refine",
                    taskId: "task-overdue",
                    title: "  Clarify overdue issue  ",
                    description: "  Capture the real blocker  ",
                    reason: "  More specific title  ",
                },
                {
                    kind: "schedule_change",
                    taskId: "task-project",
                    dueAt: "bad-date",
                    priority: "medium",
                    reason: "invalid date should drop",
                },
                {
                    kind: "project_move",
                    taskId: "task-inbox",
                    projectId: "project-alpha",
                    reason: "belongs with alpha",
                },
                {
                    kind: "starter_subtasks",
                    taskId: "task-inbox",
                    subtasks: ["Draft outline", "Draft outline", "Review constraints"],
                    reason: "break it down",
                },
                {
                    kind: "start_task",
                    taskId: "task-project",
                    brief: "Open the project by drafting the first pass.",
                    firstSteps: ["Open notes", "Write the first three bullets", "Send for review"],
                    timeboxMinutes: 45,
                    reason: "reduce startup friction",
                },
            ],
        },
        workspace,
        {},
    );

    assert.equal(normalized.summary.focusTaskId, "task-overdue");
    assert.equal(normalized.proposals.length, 3);
    assert.deepEqual(
        normalized.proposals.map((proposal) => proposal.kind),
        ["task_refine", "project_move", "starter_subtasks"],
    );
    assert.equal(normalized.proposals[0].title, "Clarify overdue issue");
    assert.deepEqual(normalized.proposals[2].subtasks, ["Draft outline", "Review constraints"]);
});

test("normalizeWorkspaceAssistantResponse preserves start task proposal when it is valid", () => {
    const workspace = createWorkspace({
        tasks: [createWorkspace().tasks.find((task) => task.id === "task-project")],
        counts: {
            inbox: 0,
            overdue: 0,
            dueToday: 0,
            upcoming: 1,
            completedRecently: 0,
        },
    });

    const normalized = normalizeWorkspaceAssistantResponse(
        {
            assistantMessage: "",
            summary: {},
            proposals: [
                {
                    kind: "start_task",
                    taskId: "task-project",
                    brief: "Start by drafting the first pass.",
                    firstSteps: ["Open the doc", "Write the outline", "Commit to one pass"],
                    timeboxMinutes: 25,
                    reason: "get into motion quickly",
                },
            ],
        },
        workspace,
        {
            selectedProjectId: "project-alpha",
        },
    );

    assert.equal(normalized.assistantMessage, normalized.summary.headline);
    assert.equal(normalized.proposals.length, 1);
    assert.equal(normalized.proposals[0].kind, "start_task");
    assert.equal(normalized.proposals[0].timeboxMinutes, 25);
    assert.equal(normalized.summary.focusTaskId, "task-project");
});
