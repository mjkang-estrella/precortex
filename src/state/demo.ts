import { TODAY, TODAY_ISO, addDays, toLocalISODate } from "../utils/date.js";
import { normalizeOptionalIsoDate, requireTrimmedText } from "../../convex/lib/domain.js";

export function createDemoWorkspace() {
    const projects = [{
        id: "demo-project", name: "Community workshop", summary: "A fictional Saturday workshop for twelve neighbors.",
        nextStep: "Confirm the venue before preparing invitations.", deadline: toLocalISODate(addDays(TODAY, 3)),
        mode: "deadline", status: "active", createdAt: Date.now(),
    }];
    const tasks = [
        { id: "demo-venue", title: "Confirm the workshop venue", description: "The room hold expires tomorrow. Ask the coordinator to confirm the booking before sending invitations." },
        { id: "demo-invites", title: "Prepare workshop invitations", description: "Draft a short invitation once the venue is confirmed. The workshop is in three days." },
        { id: "demo-reading", title: "Read the facilitation notes", description: "Optional ideas for a future session. No deadline this week." },
        { id: "demo-supplies", title: "List supplies for the workshop", description: "Check what is already available before buying anything.", projectId: "demo-project", dueAt: toLocalISODate(addDays(TODAY, 1)) },
    ].map((task, index) => ({
        priority: "none", status: "todo", dueAt: null, projectId: null,
        tags: [], subtasks: [], sourceLabel: "sample task", isStale: false,
        sortKey: (index + 1) * 1024, createdAt: Date.now(), ...task,
    }));
    return { tasks, projects };
}

// No storage, auth, network client, or account IDs are accepted by this adapter.
// Work on a clone so a rejected edit cannot partially change the workspace.
export function mutateDemo(workspace, operation: string, args) {
    const next = structuredClone(workspace);
    let task = next.tasks.find((item) => item.id === args.taskId);
    const subtask = task?.subtasks.find((item) => item.id === args.subtaskId);
    const validateProject = (id) => {
        if (id && !next.projects.some((project) => project.id === id)) throw new Error("Unknown sample project.");
    };
    if (operation !== "tasks:create" && operation !== "projects:archive" && !task) throw new Error("Unknown sample task.");
    switch (operation) {
        case "tasks:create":
            validateProject(args.projectId);
            next.tasks.push({ id: `demo-${crypto.randomUUID()}`, title: requireTrimmedText(args.title, "Task title"),
                description: args.description?.trim() || "", priority: "none", status: "todo", tags: [], subtasks: [],
                dueAt: normalizeOptionalIsoDate(args.dueAt, "due date") || null, projectId: args.projectId || null,
                sourceLabel: "sample task", isStale: false, createdAt: Date.now(), sortKey: (next.tasks.length + 1) * 1024 });
            break;
        case "tasks:update":
            if (args.title !== undefined) task.title = requireTrimmedText(args.title, "Task title");
            if (args.description !== undefined) task.description = args.description.trim();
            if (args.dueAt !== undefined) task.dueAt = normalizeOptionalIsoDate(args.dueAt || undefined, "due date") || null;
            if (args.priority !== undefined) {
                if (!["none", "low", "medium", "high"].includes(args.priority)) throw new Error("Invalid priority.");
                task.priority = args.priority;
            }
            if (args.projectId !== undefined) { validateProject(args.projectId); task.projectId = args.projectId || null; }
            break;
        case "tasks:setStatus":
            if (!["todo", "completed"].includes(args.status)) throw new Error("Invalid status.");
            task.status = args.status;
            break;
        case "tasks:remove": next.tasks = next.tasks.filter((item) => item.id !== task.id); break;
        case "tasks:addSubtask": task.subtasks.push({ id: `demo-sub-${crypto.randomUUID()}`, title: requireTrimmedText(args.title, "Subtask title"), done: false }); break;
        case "tasks:toggleSubtask":
        case "tasks:updateSubtask":
        case "tasks:removeSubtask":
            if (!subtask) throw new Error("Unknown sample subtask.");
            if (operation === "tasks:toggleSubtask") subtask.done = !subtask.done;
            if (operation === "tasks:updateSubtask") subtask.title = requireTrimmedText(args.title, "Subtask title");
            if (operation === "tasks:removeSubtask") task.subtasks = task.subtasks.filter((item) => item.id !== subtask.id);
            break;
        case "tasks:reorder": {
            const before = next.tasks.find((item) => item.id === args.beforeTaskId);
            const after = next.tasks.find((item) => item.id === args.afterTaskId);
            task.sortKey = before && after ? (before.sortKey + after.sortKey) / 2 : before ? before.sortKey + 1024 : after ? after.sortKey - 1024 : task.sortKey;
            next.tasks.sort((a, b) => a.sortKey - b.sortKey);
            break;
        }
        case "projects:archive":
            validateProject(args.projectId);
            next.projects = next.projects.filter((project) => project.id !== args.projectId);
            next.tasks.forEach((item) => { if (item.projectId === args.projectId) item.projectId = null; });
            break;
        default: throw new Error("This action is available in an account workspace.");
    }
    return next;
}

export function applyDemoSuggestion(workspace) {
    return mutateDemo(workspace, "tasks:update", { taskId: "demo-venue", priority: "high", dueAt: TODAY_ISO });
}

export function applyDemoBreakdown(workspace) {
    let next = workspace;
    for (const title of ["Check the room capacity and available time", "Ask the coordinator to confirm the booking"]) {
        if (!next.tasks.find((task) => task.id === "demo-venue")?.subtasks.some((subtask) => subtask.title === title)) {
            next = mutateDemo(next, "tasks:addSubtask", { taskId: "demo-venue", title });
        }
    }
    return next;
}
