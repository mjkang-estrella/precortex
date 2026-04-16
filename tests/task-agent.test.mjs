import test from "node:test";
import assert from "node:assert/strict";

import {
    createSolvedAiAgent,
    evaluateResearchQaEligibility,
    isStaleAgentJob,
    normalizeSolvedResearchResult,
    shouldRequeueTaskUpdate,
} from "../convex/lib/taskAgent.js";
import {
    getAiResultSummary,
    hasAiResult,
    isAiSolvedVisible,
} from "../src/utils/task-ai.js";

test("evaluateResearchQaEligibility accepts narrow compare research tasks", () => {
    const result = evaluateResearchQaEligibility({
        title: "compare top 3 note apps for offline markdown use",
        description: "Return a short comparison and recommendation.",
    });

    assert.equal(result.eligible, true);
    assert.equal(result.solvableType, "research_qa");
});

test("evaluateResearchQaEligibility accepts broad research-about tasks with implied brief deliverable", () => {
    const result = evaluateResearchQaEligibility({
        title: "Research about SEO algorithms",
        description: "",
    });

    assert.equal(result.eligible, true);
    assert.equal(result.solvableType, "research_qa");
    assert.match(result.reason, /overview brief|research request/i);
});

test("evaluateResearchQaEligibility rejects side-effectful tasks", () => {
    const result = evaluateResearchQaEligibility({
        title: "email Sam about the vendor contract",
        description: "Send a follow-up and ask for confirmation.",
    });

    assert.equal(result.eligible, false);
    assert.match(result.reason, /external action|non-research/i);
});

test("shouldRequeueTaskUpdate only reacts to title and description changes", () => {
    const task = {
        title: "Original title",
        description: "Original description",
    };

    assert.equal(shouldRequeueTaskUpdate(task, { priority: "high" }), false);
    assert.equal(shouldRequeueTaskUpdate(task, { title: "New title" }), true);
    assert.equal(shouldRequeueTaskUpdate(task, { description: "New description" }), true);
    assert.equal(shouldRequeueTaskUpdate(task, { title: " Original title " }), false);
});

test("normalizeSolvedResearchResult requires summary markdown and at least two sources", () => {
    assert.equal(
        normalizeSolvedResearchResult({
            resultSummary: "Short answer",
            resultMarkdown: "## AI Result",
            sources: [{ title: "One", url: "https://one.example" }],
        }),
        null,
    );

    const normalized = normalizeSolvedResearchResult({
        resultSummary: "Short answer",
        resultMarkdown: "## AI Result\n### Answer\nUse app A.",
        sources: [
            { title: "One", url: "https://one.example" },
            { title: "Two", url: "https://two.example" },
            { title: "Two duplicate", url: "https://two.example" },
        ],
    });

    assert.equal(normalized.resultSummary, "Short answer");
    assert.equal(normalized.sources.length, 2);
  });

test("isStaleAgentJob detects outdated tokens", () => {
    const task = {
        aiAgent: {
            jobToken: 42,
        },
    };

    assert.equal(isStaleAgentJob(task, 41), true);
    assert.equal(isStaleAgentJob(task, 42), false);
});

test("task ai visibility helpers only highlight active solved tasks", () => {
    const solvedTask = {
        status: "todo",
        aiAgent: createSolvedAiAgent(
            10,
            {
                resultSummary: "Solved summary",
                resultMarkdown: "## AI Result",
                sources: [
                    { title: "One", url: "https://one.example" },
                    { title: "Two", url: "https://two.example" },
                ],
            },
            100,
        ),
    };

    assert.equal(isAiSolvedVisible(solvedTask), true);
    assert.equal(getAiResultSummary(solvedTask), "Solved summary");
    assert.equal(hasAiResult(solvedTask), true);

    const completedTask = {
        ...solvedTask,
        status: "completed",
    };

    assert.equal(isAiSolvedVisible(completedTask), false);
    assert.equal(getAiResultSummary(completedTask), "");
    assert.equal(hasAiResult(completedTask), true);
});
