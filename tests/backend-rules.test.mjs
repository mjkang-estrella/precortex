import test from "node:test";
import assert from "node:assert/strict";

import {
    assertTaskMatchesList,
    getTaskListKey,
    normalizeOptionalIsoDate,
    requireTrimmedText,
} from "../convex/lib/domain.js";

test("requireTrimmedText rejects empty values", () => {
    assert.throws(() => requireTrimmedText("   ", "Task title"), /Task title is required/);
    assert.equal(requireTrimmedText("  Ship feature  ", "Task title"), "Ship feature");
});

test("normalizeOptionalIsoDate accepts valid dates and clears nullish input", () => {
    assert.equal(normalizeOptionalIsoDate("2026-03-20", "due date"), "2026-03-20");
    assert.equal(normalizeOptionalIsoDate(null, "due date"), undefined);
    assert.throws(() => normalizeOptionalIsoDate("03/20/2026", "due date"), /YYYY-MM-DD/);
});

test("getTaskListKey classifies inbox, today, upcoming, and project buckets", () => {
    assert.equal(
        getTaskListKey({ status: "todo", dueAt: null, projectId: null }, "2026-03-15"),
        "inbox",
    );
    assert.equal(
        getTaskListKey({ status: "todo", dueAt: "2026-03-15", projectId: null }, "2026-03-15"),
        "today-todo",
    );
    assert.equal(
        getTaskListKey({ status: "todo", dueAt: "2026-03-16", projectId: null }, "2026-03-15"),
        "upcoming-tomorrow",
    );
    assert.equal(
        getTaskListKey({ status: "todo", dueAt: null, projectId: "project_123" }, "2026-03-15"),
        "project-todo:project_123",
    );
    assert.equal(
        getTaskListKey({ status: "completed", dueAt: null, projectId: "project_123" }, "2026-03-15"),
        "project-completed:project_123",
    );
});

test("assertTaskMatchesList rejects invalid reorder targets", () => {
    const task = { status: "todo", dueAt: null, projectId: null };
    assert.doesNotThrow(() => assertTaskMatchesList(task, "inbox", "2026-03-15"));
    assert.throws(
        () => assertTaskMatchesList(task, "today-todo", "2026-03-15"),
        /Invalid reorder target/,
    );
});
