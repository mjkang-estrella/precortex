import test from "node:test";
import assert from "node:assert/strict";
import { build } from "esbuild";

const bundle = await build({ entryPoints: ["src/state/demo.ts"], bundle: true, format: "esm", platform: "node", write: false });
const { createDemoWorkspace, mutateDemo, applyDemoSuggestion, applyDemoBreakdown } = await import(`data:text/javascript;base64,${Buffer.from(bundle.outputFiles[0].text).toString("base64")}`);
const selectors = await build({ entryPoints: ["src/state/selectors.ts"], bundle: true, format: "esm", platform: "node", write: false });
const { getInboxTasks, getTodayTasks } = await import(`data:text/javascript;base64,${Buffer.from(selectors.outputFiles[0].text).toString("base64")}`);

test("demo seeds are independent and use only fictional IDs", () => {
    const a = createDemoWorkspace();
    const b = createDemoWorkspace();
    a.tasks[0].title = "changed";
    assert.notEqual(a.tasks[0].title, b.tasks[0].title);
    assert.equal(getInboxTasks(b).length, 3);
    assert.ok(b.tasks.every(task => task.id.startsWith("demo-")));
    assert.equal(getTodayTasks(b).length, 0);
});

test("example plans move the real selectors from inbox to today and can be restored", () => {
    const original = createDemoWorkspace();
    let next = applyDemoSuggestion(original);
    assert.equal(getInboxTasks(next).length, 2);
    assert.equal(getTodayTasks(next)[0].priority, "high");
    assert.equal(getInboxTasks(original).length, 3);
    next = mutateDemo(next, "tasks:update", { taskId: "demo-venue", dueAt: null, priority: "low" });
    assert.equal(getTodayTasks(next).length, 0);
    assert.equal(getInboxTasks(next).length, 3);
});

test("sample task editing, project moves, completion, and subtasks preserve semantics", () => {
    let state = createDemoWorkspace();
    state = applyDemoBreakdown(state);
    assert.equal(state.tasks[0].subtasks.length, 2);
    state = applyDemoBreakdown(state);
    assert.equal(state.tasks[0].subtasks.length, 2);
    state = mutateDemo(state, "tasks:toggleSubtask", { taskId: "demo-venue", subtaskId: state.tasks[0].subtasks[0].id });
    assert.equal(state.tasks[0].subtasks[0].done, true);
    state = mutateDemo(state, "tasks:update", { taskId: "demo-venue", title: "  Book room  ", projectId: "demo-project" });
    assert.equal(state.tasks[0].title, "Book room");
    assert.equal(getInboxTasks(state).length, 2);
    state = mutateDemo(state, "tasks:setStatus", { taskId: "demo-venue", status: "completed" });
    assert.equal(state.tasks[0].status, "completed");
});

test("unsupported operations and foreign IDs fail closed without partial writes", () => {
    const original = createDemoWorkspace();
    assert.throws(() => mutateDemo(original, "tasks:update", { taskId: "account-task", title: "overwrite" }));
    assert.throws(() => mutateDemo(original, "tasks:update", { taskId: "demo-venue", title: "overwrite", projectId: "account-project" }));
    assert.throws(() => mutateDemo(original, "tasks:update", { taskId: "demo-venue", priority: "urgent" }));
    assert.throws(() => mutateDemo(original, "tasks:update", { taskId: "demo-venue", dueAt: "not-a-date" }));
    assert.throws(() => mutateDemo(original, "arbitrary:mutation", { taskId: "demo-venue" }));
    assert.equal(original.tasks[0].title, "Confirm the workshop venue");
});

test("quick entry, reorder, removal, and archive stay in the sample workspace", () => {
    const original = createDemoWorkspace();
    let state = mutateDemo(original, "tasks:create", { title: "New idea" });
    const id = state.tasks.at(-1).id;
    assert.equal(getInboxTasks(state).length, 4);
    state = mutateDemo(state, "tasks:reorder", { taskId: id, afterTaskId: "demo-venue" });
    assert.equal(state.tasks[0].id, id);
    state = mutateDemo(state, "tasks:remove", { taskId: id });
    state = mutateDemo(state, "projects:archive", { projectId: "demo-project" });
    assert.equal(state.projects.length, 0);
    assert.ok(state.tasks.every(task => !task.projectId));
    assert.equal(original.projects.length, 1);
});
