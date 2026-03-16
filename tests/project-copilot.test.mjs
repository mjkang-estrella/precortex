import test from "node:test";
import assert from "node:assert/strict";

import {
    buildProjectNextStep,
    buildProjectSummary,
    normalizeCopilotResponse,
    validateProjectCreateFromCopilot,
} from "../convex/lib/projectCopilot.js";

test("normalizeCopilotResponse downgrades incomplete ready responses", () => {
    const response = normalizeCopilotResponse({
        assistantMessage: "I think this is ready.",
        status: "ready",
        recommendedMode: "routine_system",
        brief: {
            name: "Launch outbound system",
            goal: "Create a repeatable outbound engine",
            currentProgress: "The offer is still rough",
            successCriteria: "Weekly qualified meetings",
            constraints: "",
            blockersRisks: "",
        },
        starterTasks: [],
        routine: null,
        missingInformation: ["cadence"],
    });

    assert.equal(response.status, "clarifying");
    assert.equal(response.recommendedMode, "routine_system");
});

test("validateProjectCreateFromCopilot enforces minimum actionable payload", () => {
    assert.throws(
        () =>
            validateProjectCreateFromCopilot({
                planType: "task_plan",
                brief: {
                    name: "   ",
                    deadline: "2026-03-30",
                    goal: "",
                    currentProgress: "",
                    successCriteria: "",
                    constraints: "",
                    blockersRisks: "",
                },
                starterTasks: [],
            }),
        /Project name is required/,
    );
});

test("validateProjectCreateFromCopilot normalizes routine-system payloads", () => {
    const normalized = validateProjectCreateFromCopilot({
        planType: "routine_system",
        brief: {
            name: "Weekly content engine",
            deadline: "2026-04-10",
            goal: "Ship one strong content asset every week",
            currentProgress: "Publishing is inconsistent",
            successCriteria: "One publish and one distribution cycle per week",
            constraints: "Small team",
            blockersRisks: "Context switching",
        },
        routine: {
            cadence: "monday planning, wednesday draft, friday distribution",
            checkpoints: ["pick topic", "draft asset", "distribute asset"],
            rules: ["no skipping monday planning", "publish before polishing forever"],
        },
        starterTasks: [
            {
                id: "task-1",
                title: "Write the first four-week content calendar",
                description: "Choose topics and owners",
                dueAt: "2026-03-20",
                priority: "high",
            },
        ],
    });

    assert.equal(normalized.planType, "routine_system");
    assert.equal(normalized.routine.cadence, "monday planning, wednesday draft, friday distribution");
    assert.equal(normalized.starterTasks.length, 1);
});

test("project summary and next step derive from structured copilot data", () => {
    const brief = {
        name: "Ops review",
        deadline: "2026-03-28",
        goal: "Build a weekly operating rhythm for team reviews",
        currentProgress: "Meetings happen irregularly",
        successCriteria: "Weekly review runs every friday with follow-ups captured",
        constraints: "Leaders have limited time",
        blockersRisks: "The meeting slips when there is no owner",
    };

    const summary = buildProjectSummary(brief);
    const nextStep = buildProjectNextStep(
        "task_plan",
        [{ title: "Draft the first review agenda" }],
        null,
        brief,
    );

    assert.match(summary, /Goal:/);
    assert.equal(nextStep, "Draft the first review agenda");
});
