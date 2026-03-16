import { escapeHtml } from "../utils/text.js";

const quickStarters = [
    "launch a small b2b outbound system",
    "ship the website redesign before q2",
    "set up a weekly content engine",
    "plan the fall community fundraiser",
];

const stepCopy = [
    "align on the goal",
    "understand progress and blockers",
    "choose tasks or a routine",
    "review the actionable output",
];

function renderSetupMessages(messages) {
    return messages
        .map((message, index) => {
            const isUser = message.sender === "user";
            return `
                <div class="flex ${isUser ? "justify-end" : "justify-start"} animate-reveal" style="animation-delay: ${Math.min(index * 50, 240)}ms">
                    <div class="max-w-[92%] sm:max-w-[82%]">
                        <div class="mb-1.5 flex items-center gap-2 px-1 text-[11px] font-semibold tracking-[0.16em] lowercase ${isUser ? "justify-end text-stone-400" : "text-stone-500"}">
                            ${isUser ? "you" : "project copilot"}
                        </div>
                        <div class="${
                            isUser
                                ? "rounded-[28px] rounded-tr-[10px] bg-stone-900 text-white shadow-soft"
                                : "rounded-[28px] rounded-tl-[10px] border border-stone-200/80 bg-white text-stone-800 shadow-sm"
                        } px-5 py-4 text-[15px] leading-relaxed">
                            ${escapeHtml(message.text)}
                        </div>
                    </div>
                </div>
            `;
        })
        .join("");
}

function renderTypingState() {
    return `
        <div class="flex justify-start animate-reveal">
            <div class="max-w-[82%]">
                <div class="mb-1.5 flex items-center gap-2 px-1 text-[11px] font-semibold tracking-[0.16em] lowercase text-stone-500">project copilot</div>
                <div class="rounded-[28px] rounded-tl-[10px] border border-stone-200/80 bg-white px-5 py-4 shadow-sm">
                    <div class="flex items-center gap-1.5">
                        <span class="typing-dot h-1.5 w-1.5 rounded-full bg-stone-400"></span>
                        <span class="typing-dot h-1.5 w-1.5 rounded-full bg-stone-400"></span>
                        <span class="typing-dot h-1.5 w-1.5 rounded-full bg-stone-400"></span>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function renderQuickStarters(projectSetup) {
    if (projectSetup.messages.length > 1) return "";

    return `
        <section class="animate-reveal rounded-[32px] border border-stone-200/80 bg-white/90 p-5 shadow-soft sm:p-6">
            <div class="grid gap-4 lg:grid-cols-[minmax(0,1fr)_240px] lg:items-end">
                <div>
                    <div class="text-[11px] font-semibold uppercase tracking-[0.2em] text-stone-500">how this works</div>
                    <p class="mt-3 text-[15px] leading-relaxed text-stone-600 lowercase">
                        the copilot should leave you with something executable, not vague ambition. it will either shape a concrete task plan or recommend a working routine with startup tasks.
                    </p>
                </div>
                <div class="rounded-[24px] bg-stone-50 p-4">
                    <div class="text-[11px] font-semibold uppercase tracking-[0.16em] text-stone-500">current state</div>
                    <div class="mt-2 text-[14px] font-medium lowercase text-stone-900">
                        ${projectSetup.busy ? "starting the discussion" : "ready to clarify the project"}
                    </div>
                </div>
            </div>
            <div class="mt-5 border-t border-stone-100 pt-5">
                <div class="text-[11px] font-semibold uppercase tracking-[0.2em] text-stone-500">quick starters</div>
                <div class="mt-3 flex flex-wrap gap-2">
                    ${quickStarters
                        .map(
                            (starter) => `
                                <button
                                    data-action="project-setup-suggestion"
                                    data-suggestion="${escapeHtml(starter)}"
                                    class="rounded-full border border-stone-200 bg-white px-4 py-2 text-[13px] font-medium lowercase text-stone-600 transition-all hover:border-stone-400 hover:text-stone-900 hover:shadow-sm ${projectSetup.busy ? "pointer-events-none opacity-60" : ""}"
                                    type="button"
                                >
                                    ${escapeHtml(starter)}
                                </button>
                            `,
                        )
                        .join("")}
                </div>
            </div>
        </section>
    `;
}

function renderTaskEditors(tasks) {
    const rows = tasks.length ? tasks : [];

    return `
        <div class="flex flex-col gap-3">
            ${rows
                .map(
                    (task, index) => `
                        <div class="rounded-[24px] border border-stone-200 bg-white p-4 shadow-sm">
                            <div class="mb-3 flex items-center justify-between gap-3">
                                <div class="text-[11px] font-semibold uppercase tracking-[0.16em] text-stone-400">
                                    ${index === 0 ? "first move" : `starter task ${index + 1}`}
                                </div>
                                <button
                                    data-action="remove-project-task"
                                    data-task-id="${task.id}"
                                    class="rounded-full border border-stone-200 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-stone-500 transition-colors hover:border-stone-400 hover:text-stone-900"
                                    type="button"
                                >
                                    remove
                                </button>
                            </div>
                            <div class="flex flex-col gap-3">
                                <input
                                    data-action="edit-project-task-title"
                                    data-task-id="${task.id}"
                                    class="rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 text-[14px] font-medium text-stone-900 outline-none transition-colors focus:border-stone-400 focus:bg-white"
                                    value="${escapeHtml(task.title)}"
                                    placeholder="task title"
                                >
                                <textarea
                                    data-action="edit-project-task-description"
                                    data-task-id="${task.id}"
                                    class="min-h-[88px] rounded-[22px] border border-stone-200 bg-stone-50 px-4 py-3 text-[14px] leading-relaxed text-stone-900 outline-none transition-colors focus:border-stone-400 focus:bg-white resize-none"
                                    placeholder="what does done look like?"
                                >${escapeHtml(task.description || "")}</textarea>
                                <div class="grid gap-3 md:grid-cols-2">
                                    <label class="flex flex-col gap-2">
                                        <span class="text-[11px] font-semibold uppercase tracking-[0.16em] text-stone-400">due date</span>
                                        <input
                                            type="date"
                                            data-action="edit-project-task-due-at"
                                            data-task-id="${task.id}"
                                            class="rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 text-[14px] text-stone-900 outline-none transition-colors focus:border-stone-400 focus:bg-white"
                                            value="${escapeHtml(task.dueAt || "")}"
                                        >
                                    </label>
                                    <label class="flex flex-col gap-2">
                                        <span class="text-[11px] font-semibold uppercase tracking-[0.16em] text-stone-400">priority</span>
                                        <select
                                            data-action="edit-project-task-priority"
                                            data-task-id="${task.id}"
                                            class="rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 text-[14px] text-stone-900 outline-none transition-colors focus:border-stone-400 focus:bg-white"
                                        >
                                            ${["none", "low", "medium", "high"]
                                                .map(
                                                    (priority) => `
                                                        <option value="${priority}" ${task.priority === priority ? "selected" : ""}>
                                                            ${priority}
                                                        </option>
                                                    `,
                                                )
                                                .join("")}
                                        </select>
                                    </label>
                                </div>
                            </div>
                        </div>
                    `,
                )
                .join("")}
            <button
                data-action="add-project-task"
                class="rounded-[20px] border border-dashed border-stone-300 bg-stone-50 px-4 py-3 text-[13px] font-medium lowercase text-stone-600 transition-colors hover:border-stone-400 hover:text-stone-900"
                type="button"
            >
                add starter task
            </button>
        </div>
    `;
}

function renderRoutineItems(items, listKey, label, actionLabel) {
    return `
        <div class="flex flex-col gap-3">
            ${items
                .map(
                    (item, index) => `
                        <div class="flex items-start gap-3">
                            <input
                                data-action="edit-project-routine-item"
                                data-list-key="${listKey}"
                                data-index="${index}"
                                class="flex-1 rounded-2xl border border-stone-200 bg-white px-4 py-3 text-[14px] text-stone-900 outline-none transition-colors focus:border-stone-400"
                                value="${escapeHtml(item)}"
                                placeholder="${escapeHtml(label)}"
                            >
                            <button
                                data-action="remove-project-routine-item"
                                data-list-key="${listKey}"
                                data-index="${index}"
                                class="rounded-full border border-stone-200 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-stone-500 transition-colors hover:border-stone-400 hover:text-stone-900"
                                type="button"
                            >
                                remove
                            </button>
                        </div>
                    `,
                )
                .join("")}
            <button
                data-action="add-project-routine-item"
                data-list-key="${listKey}"
                class="rounded-[18px] border border-dashed border-stone-300 bg-stone-50 px-4 py-3 text-[13px] font-medium lowercase text-stone-600 transition-colors hover:border-stone-400 hover:text-stone-900"
                type="button"
            >
                ${escapeHtml(actionLabel)}
            </button>
        </div>
    `;
}

function renderRoutineEditor(projectSetup) {
    const routine = projectSetup.routine;

    return `
        <div class="rounded-[28px] border border-stone-200 bg-stone-50/80 p-5">
            <div class="text-[11px] font-semibold uppercase tracking-[0.16em] text-stone-500">routine or operating system</div>
            <div class="mt-4 flex flex-col gap-5">
                <label class="flex flex-col gap-2">
                    <span class="text-[11px] font-semibold uppercase tracking-[0.16em] text-stone-400">cadence</span>
                    <input
                        id="projectRoutineCadence"
                        class="rounded-2xl border border-stone-200 bg-white px-4 py-3 text-[14px] text-stone-900 outline-none transition-colors focus:border-stone-400"
                        value="${escapeHtml(routine.cadence)}"
                        placeholder="for example: monday planning, daily 30 minute execution block, friday review"
                    >
                </label>
                <div>
                    <div class="mb-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-stone-400">checkpoints</div>
                    ${renderRoutineItems(
                        routine.checkpoints,
                        "checkpoints",
                        "checkpoint",
                        "add checkpoint",
                    )}
                </div>
                <div>
                    <div class="mb-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-stone-400">rules</div>
                    ${renderRoutineItems(routine.rules, "rules", "rule", "add rule")}
                </div>
            </div>
        </div>
    `;
}

function getSelectedMode(projectSetup) {
    return projectSetup.modeOverride || projectSetup.recommendedMode;
}

function renderReview(projectSetup) {
    const brief = projectSetup.brief;
    const selectedMode = getSelectedMode(projectSetup);

    return `
        <section class="animate-reveal rounded-[32px] border border-stone-200/80 bg-white p-5 shadow-float sm:p-7">
            <div class="flex flex-col gap-4 border-b border-stone-100 pb-6">
                <div class="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div>
                        <div class="text-[11px] font-semibold uppercase tracking-[0.2em] text-stone-500">actionable review</div>
                        <h2 class="mt-2 font-display text-3xl lowercase tracking-tight text-stone-900">the copilot thinks this is ready</h2>
                        <p class="mt-2 max-w-2xl text-[14px] leading-relaxed text-stone-500 lowercase">
                            review the structured brief, then keep the recommended mode or switch it before creating the project.
                        </p>
                    </div>
                    <div class="flex flex-wrap items-center gap-2">
                        <span class="rounded-full border border-stone-200 bg-stone-50 px-3 py-2 text-[12px] font-medium lowercase text-stone-600">
                            recommended: ${escapeHtml(projectSetup.recommendedMode.replace("_", " "))}
                        </span>
                        ${projectSetup.missingInformation.length
                            ? `<span class="rounded-full border border-amber-200 bg-amber-50 px-3 py-2 text-[12px] font-medium lowercase text-amber-700">
                                    still watch: ${escapeHtml(projectSetup.missingInformation.join(", "))}
                               </span>`
                            : ""}
                    </div>
                </div>
                <div class="flex flex-wrap gap-2">
                    ${["task_plan", "routine_system"]
                        .map(
                            (mode) => `
                                <button
                                    data-action="select-project-setup-mode"
                                    data-mode="${mode}"
                                    class="rounded-full px-4 py-2 text-[13px] font-medium lowercase transition-all ${
                                        selectedMode === mode
                                            ? "bg-stone-900 text-white shadow-sm"
                                            : "border border-stone-200 bg-white text-stone-600 hover:border-stone-400 hover:text-stone-900"
                                    }"
                                    type="button"
                                >
                                    ${mode === "task_plan" ? "task plan" : "routine / system"}
                                </button>
                            `,
                        )
                        .join("")}
                </div>
            </div>

            <div class="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_minmax(320px,0.9fr)]">
                <div class="flex flex-col gap-4">
                    <div class="grid gap-4 md:grid-cols-2">
                        <label class="flex flex-col gap-2">
                            <span class="text-[11px] font-semibold uppercase tracking-[0.16em] text-stone-500">project name</span>
                            <input id="projectBriefName" class="rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 text-[14px] text-stone-900 outline-none transition-colors focus:border-stone-400 focus:bg-white" value="${escapeHtml(brief.name)}">
                        </label>
                        <label class="flex flex-col gap-2">
                            <span class="text-[11px] font-semibold uppercase tracking-[0.16em] text-stone-500">deadline</span>
                            <input id="projectBriefDeadline" type="date" class="rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 text-[14px] text-stone-900 outline-none transition-colors focus:border-stone-400 focus:bg-white" value="${escapeHtml(brief.deadline)}">
                        </label>
                    </div>
                    <label class="flex flex-col gap-2">
                        <span class="text-[11px] font-semibold uppercase tracking-[0.16em] text-stone-500">goal</span>
                        <textarea id="projectBriefGoal" class="min-h-[110px] rounded-[26px] border border-stone-200 bg-stone-50 px-4 py-3 text-[14px] leading-relaxed text-stone-900 outline-none transition-colors focus:border-stone-400 focus:bg-white resize-none">${escapeHtml(brief.goal)}</textarea>
                    </label>
                    <label class="flex flex-col gap-2">
                        <span class="text-[11px] font-semibold uppercase tracking-[0.16em] text-stone-500">current progress</span>
                        <textarea id="projectBriefCurrentProgress" class="min-h-[96px] rounded-[24px] border border-stone-200 bg-stone-50 px-4 py-3 text-[14px] leading-relaxed text-stone-900 outline-none transition-colors focus:border-stone-400 focus:bg-white resize-none">${escapeHtml(brief.currentProgress)}</textarea>
                    </label>
                    <label class="flex flex-col gap-2">
                        <span class="text-[11px] font-semibold uppercase tracking-[0.16em] text-stone-500">success criteria</span>
                        <textarea id="projectBriefSuccessCriteria" class="min-h-[96px] rounded-[24px] border border-stone-200 bg-stone-50 px-4 py-3 text-[14px] leading-relaxed text-stone-900 outline-none transition-colors focus:border-stone-400 focus:bg-white resize-none">${escapeHtml(brief.successCriteria)}</textarea>
                    </label>
                    <div class="grid gap-4 lg:grid-cols-2">
                        <label class="flex flex-col gap-2">
                            <span class="text-[11px] font-semibold uppercase tracking-[0.16em] text-stone-500">constraints</span>
                            <textarea id="projectBriefConstraints" class="min-h-[110px] rounded-[24px] border border-stone-200 bg-stone-50 px-4 py-3 text-[14px] leading-relaxed text-stone-900 outline-none transition-colors focus:border-stone-400 focus:bg-white resize-none">${escapeHtml(brief.constraints)}</textarea>
                        </label>
                        <label class="flex flex-col gap-2">
                            <span class="text-[11px] font-semibold uppercase tracking-[0.16em] text-stone-500">blockers and risks</span>
                            <textarea id="projectBriefBlockersRisks" class="min-h-[110px] rounded-[24px] border border-stone-200 bg-stone-50 px-4 py-3 text-[14px] leading-relaxed text-stone-900 outline-none transition-colors focus:border-stone-400 focus:bg-white resize-none">${escapeHtml(brief.blockersRisks)}</textarea>
                        </label>
                    </div>
                </div>

                <div class="flex flex-col gap-5">
                    <div class="rounded-[28px] border border-stone-200 bg-stone-50/80 p-5">
                        <div class="mb-4 flex items-center justify-between gap-3">
                            <div>
                                <div class="text-[11px] font-semibold uppercase tracking-[0.16em] text-stone-500">starter tasks</div>
                                <div class="mt-1 text-[13px] text-stone-500 lowercase">these should be immediately executable</div>
                            </div>
                        </div>
                        ${renderTaskEditors(projectSetup.starterTasks)}
                    </div>
                    ${selectedMode === "routine_system" ? renderRoutineEditor(projectSetup) : ""}
                </div>
            </div>
        </section>
    `;
}

function renderSidebar(projectSetup) {
    const selectedMode = getSelectedMode(projectSetup);
    const stepCount = projectSetup.phase === "review" ? stepCopy.length : Math.min(projectSetup.messages.length + 1, stepCopy.length);

    return `
        <aside class="hidden xl:flex xl:min-h-0 xl:flex-col xl:border-l xl:border-stone-100 xl:bg-stone-50/65">
            <div class="border-b border-stone-100 px-6 py-6">
                <div class="text-[11px] font-semibold uppercase tracking-[0.2em] text-stone-500">copilot state</div>
                <h2 class="mt-3 font-display text-3xl lowercase tracking-tight text-stone-900">project signal</h2>
                <p class="mt-2 text-[14px] leading-relaxed text-stone-500 lowercase">
                    this panel tracks whether the copilot is still clarifying or has enough signal to turn the project into execution.
                </p>
            </div>
            <div class="flex-1 overflow-y-auto px-6 py-6">
                <div class="rounded-[28px] border border-stone-200 bg-white p-5 shadow-sm">
                    <div class="text-[11px] font-semibold uppercase tracking-[0.16em] text-stone-500">progress</div>
                    <div class="mt-4 flex flex-col gap-3">
                        ${stepCopy
                            .map(
                                (step, index) => `
                                    <div class="flex items-center gap-3 text-[13px] lowercase ${index < stepCount ? "text-stone-900" : "text-stone-400"}">
                                        <span class="flex h-7 w-7 items-center justify-center rounded-full border ${index < stepCount ? "border-stone-900 bg-stone-900 text-white" : "border-stone-300 bg-white text-stone-400"}">
                                            ${index < stepCount ? "✓" : index + 1}
                                        </span>
                                        <span>${escapeHtml(step)}</span>
                                    </div>
                                `,
                            )
                            .join("")}
                    </div>
                </div>

                <div class="mt-5 rounded-[28px] border border-stone-200 bg-white p-5 shadow-sm">
                    <div class="flex items-center justify-between gap-3">
                        <div>
                            <div class="text-[11px] font-semibold uppercase tracking-[0.16em] text-stone-500">current recommendation</div>
                            <div class="mt-1 text-[14px] font-medium lowercase text-stone-900">${escapeHtml(selectedMode.replace("_", " "))}</div>
                        </div>
                        <div class="rounded-full border border-stone-200 bg-stone-50 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-stone-500">
                            ${escapeHtml(projectSetup.status)}
                        </div>
                    </div>

                    <div class="mt-5 space-y-4">
                        <div class="rounded-2xl bg-stone-50 px-4 py-3">
                            <div class="text-[11px] font-semibold uppercase tracking-[0.16em] text-stone-400">goal</div>
                            <div class="mt-1 text-[13px] leading-relaxed lowercase text-stone-700">
                                ${escapeHtml(projectSetup.brief.goal || "the copilot is still clarifying the outcome")}
                            </div>
                        </div>
                        <div class="rounded-2xl bg-stone-50 px-4 py-3">
                            <div class="text-[11px] font-semibold uppercase tracking-[0.16em] text-stone-400">progress</div>
                            <div class="mt-1 text-[13px] leading-relaxed lowercase text-stone-700">
                                ${escapeHtml(projectSetup.brief.currentProgress || "no clear progress signal yet")}
                            </div>
                        </div>
                        <div class="rounded-2xl bg-stone-50 px-4 py-3">
                            <div class="text-[11px] font-semibold uppercase tracking-[0.16em] text-stone-400">first actions</div>
                            <div class="mt-3 flex flex-col gap-2">
                                ${(projectSetup.starterTasks.length ? projectSetup.starterTasks : [{ title: "starter tasks will appear once the project becomes actionable" }])
                                    .slice(0, 4)
                                    .map(
                                        (task) => `
                                            <div class="flex items-start gap-2 text-[13px] lowercase text-stone-700">
                                                <span class="mt-1 h-2 w-2 rounded-full bg-stone-300"></span>
                                                <span>${escapeHtml(task.title)}</span>
                                            </div>
                                        `,
                                    )
                                    .join("")}
                            </div>
                        </div>
                        ${selectedMode === "routine_system"
                            ? `
                                <div class="rounded-2xl bg-stone-50 px-4 py-3">
                                    <div class="text-[11px] font-semibold uppercase tracking-[0.16em] text-stone-400">routine cadence</div>
                                    <div class="mt-1 text-[13px] leading-relaxed lowercase text-stone-700">
                                        ${escapeHtml(projectSetup.routine.cadence || "cadence will appear when the routine is shaped")}
                                    </div>
                                </div>
                              `
                            : ""}
                    </div>
                </div>
            </div>
        </aside>
    `;
}

function renderComposer(projectSetup) {
    return `
        <div class="border-t border-stone-100 bg-white/95 px-4 py-4 backdrop-blur sm:px-6 lg:px-8">
            <div class="mx-auto max-w-4xl">
                ${projectSetup.error
                    ? `
                        <div class="mb-3 rounded-[22px] border border-red-200 bg-red-50 px-4 py-3 text-[13px] leading-relaxed text-red-700 lowercase">
                            ${escapeHtml(projectSetup.error)}
                        </div>
                      `
                    : ""}
                <div class="group relative rounded-[30px] border border-stone-200 bg-stone-50 p-2 transition-all focus-within:border-stone-400 focus-within:bg-white focus-within:shadow-float">
                    <textarea
                        id="projectSetupInput"
                        aria-label="describe the project"
                        class="min-h-[56px] max-h-[180px] w-full resize-none bg-transparent px-4 py-3 pr-16 text-[15px] leading-relaxed text-stone-900 outline-none placeholder:text-stone-400 disabled:cursor-not-allowed disabled:opacity-60"
                        rows="1"
                        placeholder="describe the project, what is blocked, or what success looks like..."
                        ${projectSetup.busy ? "disabled" : ""}
                    ></textarea>
                    <button
                        data-action="send-project-setup"
                        aria-label="send project setup message"
                        class="absolute bottom-3 right-3 flex h-11 w-11 items-center justify-center rounded-full bg-stone-900 text-white shadow-sm transition-all hover:scale-[1.03] hover:bg-stone-800 disabled:cursor-not-allowed disabled:opacity-60"
                        type="button"
                        ${projectSetup.busy ? "disabled" : ""}
                    >
                        <svg class="w-4 h-4 ml-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
                    </button>
                </div>
                <div class="mt-3 flex items-center justify-between gap-4 px-1 text-[11px] font-medium lowercase tracking-[0.14em] text-stone-400">
                    <span>${projectSetup.busy ? "copilot is thinking" : "enter to send"}</span>
                    <span>shift + enter for a new line</span>
                </div>
            </div>
        </div>
    `;
}

export function renderProjectSetupView({ projectSetup, projectCount }) {
    const hasProjects = projectCount > 0;

    return `
        <div class="flex h-full min-h-0 flex-col bg-[radial-gradient(circle_at_top_right,_rgba(17,17,17,0.05),_transparent_26%),linear-gradient(180deg,_rgba(246,246,245,0.7)_0%,_rgba(255,255,255,1)_28%)]">
            <header class="border-b border-stone-100 bg-white/85 px-4 py-4 backdrop-blur sm:px-6 lg:px-8">
                <div class="flex flex-wrap items-center justify-between gap-4">
                    <div class="flex items-center gap-4">
                        <div class="flex h-11 w-11 items-center justify-center rounded-2xl bg-stone-900 text-white shadow-sm">
                            <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2a10 10 0 1 0 10 10"></path><path d="M12 8v4l3 3"></path><circle cx="19" cy="5" r="3" fill="currentColor" stroke="none"></circle></svg>
                        </div>
                        <div>
                            <div class="text-[11px] font-semibold uppercase tracking-[0.2em] text-stone-500">add project</div>
                            <h1 class="mt-1 font-display text-3xl lowercase tracking-tight text-stone-900 sm:text-4xl">ai project copilot</h1>
                            <p class="mt-1 text-[14px] leading-relaxed text-stone-500 lowercase">
                                the goal is not just naming the project. the goal is leaving this page with something you can actually execute.
                            </p>
                        </div>
                    </div>
                    <div class="flex items-center gap-2">
                        <button
                            data-action="restart-project-setup"
                            class="rounded-2xl border border-stone-200 px-4 py-2.5 text-[12px] font-semibold uppercase tracking-[0.16em] text-stone-500 transition-colors hover:border-stone-400 hover:text-stone-900"
                            type="button"
                        >
                            restart
                        </button>
                        <button
                            data-action="close-project-setup"
                            class="rounded-2xl border border-stone-200 px-4 py-2.5 text-[12px] font-semibold uppercase tracking-[0.16em] text-stone-500 transition-colors hover:border-stone-400 hover:text-stone-900"
                            type="button"
                        >
                            ${hasProjects ? "close" : "skip"}
                        </button>
                    </div>
                </div>
            </header>

            <div class="min-h-0 flex-1 xl:grid xl:grid-cols-[minmax(0,1fr)_360px]">
                <section class="min-h-0 flex flex-col">
                    <div class="min-h-0 flex-1 overflow-y-auto px-4 py-5 sm:px-6 lg:px-8 lg:py-8">
                        <div class="mx-auto flex max-w-5xl flex-col gap-4 pb-10">
                            ${renderQuickStarters(projectSetup)}
                            <section class="flex flex-col gap-4">
                                ${renderSetupMessages(projectSetup.messages)}
                                ${projectSetup.busy ? renderTypingState() : ""}
                            </section>
                            ${projectSetup.phase === "review" ? renderReview(projectSetup) : ""}
                        </div>
                    </div>

                    ${
                        projectSetup.phase === "review"
                            ? `
                                <div class="border-t border-stone-100 bg-white/95 px-4 py-4 backdrop-blur sm:px-6 lg:px-8">
                                    <div class="mx-auto flex max-w-5xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                        <div class="text-[14px] leading-relaxed text-stone-500 lowercase">
                                            create the project when the brief and execution shape feel right.
                                        </div>
                                        <button
                                            data-action="confirm-project-draft"
                                            class="inline-flex items-center justify-center gap-2 rounded-[18px] bg-stone-900 px-6 py-3 text-[14px] font-medium lowercase text-white shadow-sm transition-all hover:bg-stone-800 hover:shadow-md"
                                            type="button"
                                        >
                                            create project
                                            <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
                                        </button>
                                    </div>
                                </div>
                              `
                            : renderComposer(projectSetup)
                    }
                </section>

                ${renderSidebar(projectSetup)}
            </div>
        </div>
    `;
}
