import { formatters, parseLocalISODate } from "../utils/date.js";
import { escapeHtml } from "../utils/text.js";

const quickStarters = [
    "website redesign",
    "marketing campaign",
    "event planning",
    "product launch",
];

const setupSteps = [
    "Name the project",
    "Set a real deadline",
    "Clarify success",
    "Review the starter tasks",
];

function formatDraftDeadline(deadline) {
    if (!deadline) return "add a deadline to shape the starter plan";
    if (!/^\d{4}-\d{2}-\d{2}$/.test(deadline)) return "use a date like 2026-04-30";
    return formatters.modalDate.format(parseLocalISODate(deadline)).toLowerCase();
}

function renderSetupMessages(messages) {
    return messages
        .map((message, index) => {
            const isUser = message.sender === "user";
            return `
                <div class="flex ${isUser ? "justify-end" : "justify-start"} animate-reveal" style="animation-delay: ${Math.min(index * 60, 320)}ms">
                    <div class="max-w-[92%] sm:max-w-[80%]">
                        <div class="mb-1.5 flex items-center gap-2 px-1 text-[11px] font-semibold lowercase tracking-[0.16em] ${isUser ? "justify-end text-stone-400" : "text-stone-500"}">
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

function renderHowItWorks(projectSetup) {
    if (projectSetup.messages.length > 1) return "";

    return `
        <section class="animate-reveal rounded-[32px] border border-stone-200/80 bg-white/90 p-5 shadow-soft sm:p-6">
            <div class="grid gap-4 lg:grid-cols-[minmax(0,1fr)_220px] lg:items-end">
                <div>
                    <div class="text-[11px] font-semibold uppercase tracking-[0.2em] text-stone-500">how it works</div>
                    <p class="mt-3 text-[15px] leading-relaxed text-stone-600 lowercase">
                        answer a few prompts in plain language. the system turns that into a clean project draft with editable starter tasks before anything is saved.
                    </p>
                </div>
                <div class="rounded-[24px] bg-stone-50 p-4">
                    <div class="text-[11px] font-semibold uppercase tracking-[0.16em] text-stone-500">status</div>
                    <div class="mt-2 text-[14px] font-medium lowercase text-stone-900">
                        ${projectSetup.phase === "review" ? "ready for review" : "collecting project context"}
                    </div>
                </div>
            </div>
            ${projectSetup.phase === "chat" && projectSetup.messages.length <= 1 ? `
                <div class="mt-5 pt-5 border-t border-stone-100">
                    <div class="text-[11px] font-semibold uppercase tracking-[0.2em] text-stone-500">quick starters</div>
                    <div class="mt-3 flex flex-wrap gap-2">
                        ${quickStarters
                            .map(
                                (starter) => `
                                    <button
                                        data-action="project-setup-suggestion"
                                        data-suggestion="${escapeHtml(starter)}"
                                        class="rounded-full border border-stone-200 bg-white px-4 py-2 text-[13px] font-medium lowercase text-stone-600 transition-all hover:border-stone-400 hover:text-stone-900 hover:shadow-sm"
                                        type="button"
                                    >
                                        ${escapeHtml(starter)}
                                    </button>
                                `,
                            )
                            .join("")}
                    </div>
                </div>
            ` : ""}
        </section>
    `;
}

function renderTaskInputs(tasks) {
    return tasks
        .map(
            (task, index) => `
                <label class="flex items-start gap-3 rounded-[22px] border border-stone-200 bg-white px-4 py-3 shadow-sm">
                    <span class="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-[7px] border-2 border-stone-900 bg-stone-900 text-white">
                        <svg class="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                    </span>
                    <span class="min-w-0 flex-1">
                        <span class="mb-2 block text-[11px] font-semibold uppercase tracking-[0.16em] text-stone-400">
                            ${index === 0 ? "next move" : `starter task ${index + 1}`}
                        </span>
                        <input
                            data-action="edit-project-draft-task"
                            data-task-id="${task.id}"
                            class="w-full bg-transparent text-[14px] font-medium text-stone-900 outline-none"
                            value="${escapeHtml(task.title)}"
                        >
                    </span>
                </label>
            `,
        )
        .join("");
}

function renderReviewCard(draft) {
    const selectedCount = draft.tasks.filter((task) => task.title.trim()).length;

    return `
        <section class="animate-reveal mt-8 rounded-[32px] border border-stone-200/80 bg-white p-5 shadow-float sm:p-7" style="animation-delay: 180ms">
            <div class="flex flex-col gap-4 border-b border-stone-100 pb-6 lg:flex-row lg:items-start lg:justify-between">
                <div>
                    <div class="text-[11px] font-semibold uppercase tracking-[0.2em] text-stone-500">starter plan</div>
                    <h2 class="mt-2 font-display text-3xl lowercase tracking-tight text-stone-900">review before creating</h2>
                    <p class="mt-2 max-w-2xl text-[14px] leading-relaxed text-stone-500 lowercase">
                        this is the wireframe for the new project. edit the fields directly, then create it when the structure feels right.
                    </p>
                </div>
                <div class="inline-flex items-center gap-2 self-start rounded-full border border-stone-200 bg-stone-50 px-3 py-2 text-[12px] font-medium lowercase text-stone-600">
                    <span class="h-2 w-2 rounded-full bg-stone-900"></span>
                    ${selectedCount} starter tasks ready
                </div>
            </div>

            <div class="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.8fr)]">
                <div class="flex flex-col gap-4">
                    <div class="grid gap-4 md:grid-cols-2">
                        <label class="flex flex-col gap-2">
                            <span class="text-[11px] font-semibold uppercase tracking-[0.16em] text-stone-500">project name</span>
                            <input id="projectDraftName" class="rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 text-[14px] text-stone-900 outline-none transition-colors focus:border-stone-400 focus:bg-white" value="${escapeHtml(draft.name)}">
                        </label>
                        <label class="flex flex-col gap-2">
                            <span class="text-[11px] font-semibold uppercase tracking-[0.16em] text-stone-500">deadline</span>
                            <input id="projectDraftDeadline" class="rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 text-[14px] text-stone-900 outline-none transition-colors focus:border-stone-400 focus:bg-white" value="${escapeHtml(draft.deadline)}">
                            <span class="text-[12px] text-stone-500 lowercase">${escapeHtml(formatDraftDeadline(draft.deadline))}</span>
                        </label>
                    </div>

                    <label class="flex flex-col gap-2">
                        <span class="text-[11px] font-semibold uppercase tracking-[0.16em] text-stone-500">summary</span>
                        <textarea id="projectDraftSummary" class="min-h-[132px] rounded-[28px] border border-stone-200 bg-stone-50 px-4 py-3 text-[14px] leading-relaxed text-stone-900 outline-none transition-colors focus:border-stone-400 focus:bg-white resize-none">${escapeHtml(draft.summary)}</textarea>
                    </label>

                    <label class="flex flex-col gap-2">
                        <span class="text-[11px] font-semibold uppercase tracking-[0.16em] text-stone-500">next step</span>
                        <input id="projectDraftNextStep" class="rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 text-[14px] text-stone-900 outline-none transition-colors focus:border-stone-400 focus:bg-white" value="${escapeHtml(draft.nextStep)}">
                    </label>
                </div>

                <div class="rounded-[28px] border border-stone-200 bg-stone-50/80 p-5">
                    <div class="flex items-center justify-between gap-3">
                        <div>
                            <div class="text-[11px] font-semibold uppercase tracking-[0.16em] text-stone-500">starter tasks</div>
                            <div class="mt-1 text-[13px] text-stone-500 lowercase">adjust the first pass before it becomes real tasks</div>
                        </div>
                    </div>
                    <div class="mt-4 flex flex-col gap-3">
                        ${renderTaskInputs(draft.tasks)}
                    </div>
                </div>
            </div>
        </section>
    `;
}

function renderComposer() {
    return `
        <div class="border-t border-stone-100 bg-white/95 px-4 py-4 backdrop-blur sm:px-6 lg:px-8">
            <div class="mx-auto max-w-4xl">
                <div class="group relative rounded-[30px] border border-stone-200 bg-stone-50 p-2 transition-all focus-within:border-stone-400 focus-within:bg-white focus-within:shadow-float">
                    <textarea
                        id="projectSetupInput"
                        aria-label="describe the project"
                        class="min-h-[56px] max-h-[180px] w-full resize-none bg-transparent px-4 py-3 pr-16 text-[15px] leading-relaxed text-stone-900 outline-none placeholder:text-stone-400"
                        rows="1"
                        placeholder="describe the project, deadline, or what success looks like..."
                    ></textarea>
                    <button
                        data-action="send-project-setup"
                        aria-label="send project setup message"
                        class="absolute bottom-3 right-3 flex h-11 w-11 items-center justify-center rounded-full bg-stone-900 text-white shadow-sm transition-all hover:scale-[1.03] hover:bg-stone-800"
                        type="button"
                    >
                        <svg class="w-4 h-4 ml-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
                    </button>
                </div>
                <div class="mt-3 flex items-center justify-between gap-4 px-1 text-[11px] font-medium lowercase tracking-[0.14em] text-stone-400">
                    <span>enter to send</span>
                    <span>shift + enter for a new line</span>
                </div>
            </div>
        </div>
    `;
}

function renderSidebar(projectSetup) {
    const draft = projectSetup.draft;
    const stepCount = draft ? setupSteps.length : Math.min(projectSetup.messages.length + 1, setupSteps.length);

    return `
        <aside class="hidden xl:flex xl:min-h-0 xl:flex-col xl:border-l xl:border-stone-100 xl:bg-stone-50/65">
            <div class="border-b border-stone-100 px-6 py-6">
                <div class="text-[11px] font-semibold uppercase tracking-[0.2em] text-stone-500">wireframe</div>
                <h2 class="mt-3 font-display text-3xl lowercase tracking-tight text-stone-900">new project surface</h2>
                <p class="mt-2 text-[14px] leading-relaxed text-stone-500 lowercase">
                    this page replaces the modal. it should feel like a drafting studio, not a blocking dialog.
                </p>
            </div>
            <div class="flex-1 overflow-y-auto px-6 py-6">
                <div class="rounded-[28px] border border-stone-200 bg-white p-5 shadow-sm">
                    <div class="text-[11px] font-semibold uppercase tracking-[0.16em] text-stone-500">progress</div>
                    <div class="mt-4 flex flex-col gap-3">
                        ${setupSteps
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
                            <div class="text-[11px] font-semibold uppercase tracking-[0.16em] text-stone-500">project preview</div>
                            <div class="mt-1 text-[14px] font-medium lowercase text-stone-900">
                                ${escapeHtml(draft?.name || projectSetup.answers.name || "untitled project")}
                            </div>
                        </div>
                        <div class="flex h-11 w-11 items-center justify-center rounded-2xl bg-stone-900 text-white shadow-sm">
                            <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2a10 10 0 1 0 10 10"></path><path d="M12 8v4l3 3"></path><circle cx="19" cy="5" r="3" fill="currentColor" stroke="none"></circle></svg>
                        </div>
                    </div>

                    <div class="mt-5 space-y-4">
                        <div class="rounded-2xl bg-stone-50 px-4 py-3">
                            <div class="text-[11px] font-semibold uppercase tracking-[0.16em] text-stone-400">deadline</div>
                            <div class="mt-1 text-[13px] lowercase text-stone-700">${escapeHtml(draft?.deadline || projectSetup.answers.deadline || "not set yet")}</div>
                        </div>
                        <div class="rounded-2xl bg-stone-50 px-4 py-3">
                            <div class="text-[11px] font-semibold uppercase tracking-[0.16em] text-stone-400">next step</div>
                            <div class="mt-1 text-[13px] leading-relaxed lowercase text-stone-700">
                                ${escapeHtml(draft?.nextStep || "we will generate the first concrete move once the project shape is clear")}
                            </div>
                        </div>
                        <div class="rounded-2xl bg-stone-50 px-4 py-3">
                            <div class="text-[11px] font-semibold uppercase tracking-[0.16em] text-stone-400">starter tasks</div>
                            <div class="mt-3 flex flex-col gap-2">
                                ${(draft?.tasks || [{ id: "placeholder-1", title: "starter tasks will appear here" }, { id: "placeholder-2", title: "they will stay editable before creation" }])
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
                    </div>
                </div>
            </div>
        </aside>
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
                            <h1 class="mt-1 font-display text-3xl lowercase tracking-tight text-stone-900 sm:text-4xl">project drafting studio</h1>
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

            <section class="min-h-0 flex-1 flex flex-col">
                <div class="min-h-0 flex-1 overflow-y-auto px-4 py-5 sm:px-6 lg:px-8 lg:py-8">
                    <div class="mx-auto flex max-w-4xl flex-col gap-4 pb-10">
                        ${renderHowItWorks(projectSetup)}

                        <section class="flex flex-col gap-4">
                            ${renderSetupMessages(projectSetup.messages)}
                        </section>

                        ${projectSetup.phase === "review" && projectSetup.draft ? renderReviewCard(projectSetup.draft) : ""}
                    </div>
                </div>

                ${
                    projectSetup.phase === "review" && projectSetup.draft
                        ? `
                            <div class="border-t border-stone-100 bg-white/95 px-4 py-4 backdrop-blur sm:px-6 lg:px-8">
                                <div class="mx-auto flex max-w-4xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                    <div class="text-[14px] leading-relaxed text-stone-500 lowercase">
                                        create the project once the summary, next step, and starter tasks look right.
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
                        : renderComposer()
                }
            </section>
        </div>
    `;
}
