function cleanText(value: string | null | undefined) {
    return typeof value === "string" ? value : "";
}

function cleanList(values: Array<string | null | undefined> = []) {
    return values
        .map((value) => cleanText(value).trim())
        .filter(Boolean);
}

export function createEmptyProjectBrief() {
    return {
        name: "",
        deadline: "",
        goal: "",
        currentProgress: "",
        successCriteria: "",
        constraints: "",
        blockersRisks: "",
    };
}

export function createEmptyRoutine() {
    return {
        cadence: "",
        checkpoints: [],
        rules: [],
    };
}

export function createEmptyStarterTask(index = 0) {
    return {
        id: `starter-task-${Date.now()}-${index}`,
        title: "",
        description: "",
        dueAt: "",
        priority: index === 0 ? "high" : "medium",
    };
}

function createMessage(sender: "user" | "assistant", text: string) {
    return {
        sender,
        text,
        rich: false,
        tasks: [],
    };
}

export function createProjectSetupState(open = false, previousView = "today") {
    return {
        open,
        previousView,
        initialized: false,
        busy: false,
        error: null,
        phase: "chat",
        status: "clarifying",
        recommendedMode: "task_plan",
        modeOverride: null,
        messages: [],
        brief: createEmptyProjectBrief(),
        starterTasks: [],
        routine: createEmptyRoutine(),
        missingInformation: [],
    };
}

export function cloneProjectSetupState(projectSetup) {
    return {
        ...projectSetup,
        messages: projectSetup.messages.map((message) => ({ ...message })),
        brief: { ...projectSetup.brief },
        starterTasks: projectSetup.starterTasks.map((task) => ({ ...task })),
        routine: {
            cadence: projectSetup.routine?.cadence || "",
            checkpoints: [...(projectSetup.routine?.checkpoints || [])],
            rules: [...(projectSetup.routine?.rules || [])],
        },
        missingInformation: [...projectSetup.missingInformation],
    };
}

function normalizeBrief(brief) {
    return {
        name: cleanText(brief?.name),
        deadline: cleanText(brief?.deadline),
        goal: cleanText(brief?.goal),
        currentProgress: cleanText(brief?.currentProgress),
        successCriteria: cleanText(brief?.successCriteria),
        constraints: cleanText(brief?.constraints),
        blockersRisks: cleanText(brief?.blockersRisks),
    };
}

function normalizeStarterTasks(tasks) {
    return (Array.isArray(tasks) ? tasks : [])
        .map((task, index) => ({
            id: cleanText(task?.id) || `starter-task-${index + 1}`,
            title: cleanText(task?.title),
            description: cleanText(task?.description),
            dueAt: cleanText(task?.dueAt),
            priority:
                task?.priority === "none" ||
                task?.priority === "low" ||
                task?.priority === "medium" ||
                task?.priority === "high"
                    ? task.priority
                    : index === 0
                      ? "high"
                      : "medium",
        }))
        .filter((task) => task.title.trim());
}

function normalizeRoutine(routine) {
    return {
        cadence: cleanText(routine?.cadence),
        checkpoints: cleanList(routine?.checkpoints),
        rules: cleanList(routine?.rules),
    };
}

export function getProjectSetupSelectedMode(projectSetup) {
    return projectSetup.modeOverride || projectSetup.recommendedMode || "task_plan";
}

export function beginProjectSetupRequest(projectSetup, userText = "") {
    const nextState = cloneProjectSetupState(projectSetup);
    nextState.initialized = true;
    nextState.busy = true;
    nextState.error = null;

    const text = userText.trim();
    if (text) {
        nextState.messages.push(createMessage("user", text));
    }

    return nextState;
}

export function applyProjectSetupReply(projectSetup, reply) {
    const nextState = cloneProjectSetupState(projectSetup);
    nextState.initialized = true;
    nextState.busy = false;
    nextState.error = null;

    if (reply.assistantMessage) {
        nextState.messages.push(createMessage("assistant", reply.assistantMessage));
    }

    nextState.status = reply.status === "ready" ? "ready" : "clarifying";
    nextState.phase = nextState.status === "ready" ? "review" : "chat";
    nextState.recommendedMode =
        reply.recommendedMode === "routine_system" ? "routine_system" : "task_plan";
    nextState.brief = normalizeBrief(reply.brief);
    nextState.starterTasks = normalizeStarterTasks(reply.starterTasks);
    nextState.routine = normalizeRoutine(reply.routine);
    nextState.missingInformation = cleanList(reply.missingInformation);

    return nextState;
}

export function failProjectSetupRequest(projectSetup, message) {
    const nextState = cloneProjectSetupState(projectSetup);
    nextState.initialized = true;
    nextState.busy = false;
    nextState.error = message;
    return nextState;
}

export function updateProjectSetupBriefField(projectSetup, field, value) {
    const nextState = cloneProjectSetupState(projectSetup);
    nextState.brief = {
        ...nextState.brief,
        [field]: value,
    };
    return nextState;
}

export function setProjectSetupModeOverride(projectSetup, mode) {
    const nextState = cloneProjectSetupState(projectSetup);
    nextState.modeOverride = mode === nextState.recommendedMode ? null : mode;
    return nextState;
}

export function updateProjectSetupTaskField(projectSetup, taskId, field, value) {
    const nextState = cloneProjectSetupState(projectSetup);
    nextState.starterTasks = nextState.starterTasks.map((task) =>
        task.id === taskId
            ? {
                  ...task,
                  [field]: value,
              }
            : task,
    );
    return nextState;
}

export function addProjectSetupTask(projectSetup) {
    const nextState = cloneProjectSetupState(projectSetup);
    nextState.starterTasks = [
        ...nextState.starterTasks,
        createEmptyStarterTask(nextState.starterTasks.length),
    ];
    return nextState;
}

export function removeProjectSetupTask(projectSetup, taskId) {
    const nextState = cloneProjectSetupState(projectSetup);
    nextState.starterTasks = nextState.starterTasks.filter((task) => task.id !== taskId);
    return nextState;
}

export function updateProjectSetupRoutineField(projectSetup, field, value) {
    const nextState = cloneProjectSetupState(projectSetup);
    nextState.routine = {
        ...nextState.routine,
        [field]: value,
    };
    return nextState;
}

export function updateProjectSetupRoutineItem(projectSetup, listKey, index, value) {
    const nextState = cloneProjectSetupState(projectSetup);
    const items = [...nextState.routine[listKey]];
    items[index] = value;
    nextState.routine = {
        ...nextState.routine,
        [listKey]: items,
    };
    return nextState;
}

export function addProjectSetupRoutineItem(projectSetup, listKey) {
    const nextState = cloneProjectSetupState(projectSetup);
    nextState.routine = {
        ...nextState.routine,
        [listKey]: [...nextState.routine[listKey], ""],
    };
    return nextState;
}

export function removeProjectSetupRoutineItem(projectSetup, listKey, index) {
    const nextState = cloneProjectSetupState(projectSetup);
    nextState.routine = {
        ...nextState.routine,
        [listKey]: nextState.routine[listKey].filter((_, itemIndex) => itemIndex !== index),
    };
    return nextState;
}
