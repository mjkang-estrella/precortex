import { tagColorMap } from "../data/tag-colors.js";
import { escapeHtml } from "../utils/text.js";
import { getAiResultSummary, isAiSolvedVisible } from "../utils/task-ai.js";

function renderInboxMetadata(task) {
    const items = [];

    if (task.sourceLabel) {
        items.push(`
            <span class="text-stone-500 flex items-center gap-1.5">
                <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"></rect><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path></svg>
                ${escapeHtml(task.sourceLabel)}
            </span>
        `);
    } else if (task.createdLabel) {
        items.push(
            `<span class="text-stone-500">${escapeHtml(task.createdLabel.replace(/^created\s+/i, "added "))}</span>`,
        );
    }

    if (task.tags.length) {
        if (items.length) items.push('<span class="w-1 h-1 rounded-full bg-stone-300"></span>');
        items.push(
            ...task.tags.map(
                (tag) => `
                <span class="inline-flex items-center gap-1 bg-stone-100 text-stone-600 px-2 py-0.5 rounded-md border border-stone-200/50 lowercase">
                    ${
                        tag.color && tagColorMap[tag.color]
                            ? `<span class="w-1.5 h-1.5 rounded-full" style="background-color: ${tagColorMap[tag.color]}"></span>`
                            : ""
                    }
                    ${escapeHtml(tag.label)}
                </span>
            `,
            ),
        );
    }

    if (task.isStale) {
        if (items.length) items.push('<span class="w-1 h-1 rounded-full bg-stone-300"></span>');
        items.push(`
            <span class="inline-flex items-center gap-1 text-orange-600 bg-orange-50 px-2 py-0.5 rounded-md font-medium lowercase">
                <svg class="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
                stale
            </span>
        `);
    }

    if (isAiSolvedVisible(task)) {
        if (items.length) items.push('<span class="w-1 h-1 rounded-full bg-stone-300"></span>');
        items.push(`
            <span class="inline-flex items-center gap-1 text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md font-medium lowercase border border-emerald-200">
                <span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                ai solved
            </span>
        `);
    }

    return items.join("");
}

function renderInboxTaskRow(task, index = 0, editingDraft = null) {
    const staggerDelay = Math.min(index * 40, 300);
    const aiSolvedVisible = isAiSolvedVisible(task);

    if (editingDraft) {
        return `
            <div class="task-row task-row-editing bg-white border border-stone-900/15 rounded-2xl p-5 flex flex-col gap-4 shadow-sm" data-task-id="${task.id}" data-task-list="inbox" style="animation-delay: ${staggerDelay}ms">
                <div class="flex items-start gap-4">
                    <button data-action="toggle" data-task-id="${task.id}" class="checkbox-wrapper pt-1 flex-shrink-0" aria-label="mark task complete" type="button">
                        <div class="w-[22px] h-[22px] rounded-full border-2 border-stone-300 flex items-center justify-center transition-all bg-white">
                            <svg class="w-3 h-3 text-white check-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                        </div>
                    </button>
                    <div class="flex-1 flex flex-col gap-3 min-w-0">
                        <input data-action="edit-task-title" data-task-id="${task.id}" aria-label="edit task title" class="task-card-title-input w-full bg-transparent text-[16px] font-medium text-stone-900 outline-none" value="${escapeHtml(editingDraft.title)}">
                        <textarea data-action="edit-task-description" data-task-id="${task.id}" aria-label="edit task description" class="task-card-description-input w-full bg-transparent text-[13px] leading-relaxed text-stone-600 outline-none resize-none" rows="${editingDraft.description ? 2 : 1}" placeholder="Add a description...">${escapeHtml(editingDraft.description)}</textarea>
                        <div class="flex flex-wrap items-center gap-2 text-xs">
                            ${renderInboxMetadata(task)}
                        </div>
                    </div>
                </div>
                <div class="pl-[38px] flex items-center justify-between gap-3 flex-wrap">
                    <div class="text-[11px] font-medium text-stone-400 lowercase">editing task card</div>
                    <div class="flex items-center gap-2">
                        <button data-action="cancel-task-edit" class="px-3 py-1.5 rounded-xl border border-stone-200 text-[13px] font-medium text-stone-600 hover:border-stone-300 hover:text-stone-900 transition-colors lowercase" type="button">cancel</button>
                        <button data-action="save-task-edit" class="px-3 py-1.5 rounded-xl bg-stone-900 text-white text-[13px] font-medium hover:bg-stone-700 transition-colors lowercase" type="button">save</button>
                    </div>
                </div>
            </div>
        `;
    }

    return `
        <div class="task-row group rounded-2xl p-5 flex flex-col xl:flex-row gap-4 cursor-pointer transition-colors ${aiSolvedVisible ? "bg-emerald-50/45 border border-emerald-200 hover:border-emerald-300 hover:bg-emerald-50/70" : "bg-white border border-stone-200 hover:border-stone-400 hover:bg-stone-50/50"}" data-action="open-task" data-task-id="${task.id}" data-task-list="inbox" draggable="true" style="animation-delay: ${staggerDelay}ms">
            <div class="flex flex-1 items-start gap-4">
                <button data-action="toggle" data-task-id="${task.id}" class="checkbox-wrapper pt-1 flex-shrink-0" aria-label="mark task complete" type="button">
                    <div class="w-[22px] h-[22px] rounded-full border-2 border-stone-300 flex items-center justify-center transition-all bg-white group-hover:border-stone-400">
                        <svg class="w-3 h-3 text-white check-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                    </div>
                </button>
                <div class="flex-1 flex flex-col justify-center gap-1.5 min-w-0">
                    <div class="text-[16px] text-stone-900 font-medium transition-colors duration-200 task-title">${escapeHtml(task.title)}</div>
                    ${
                        getAiResultSummary(task)
                            ? `<p class="text-[13px] text-emerald-700 leading-relaxed line-clamp-1 lowercase">${escapeHtml(getAiResultSummary(task))}</p>`
                            : ""
                    }
                    <div class="flex flex-wrap items-center gap-2 text-xs">
                        ${renderInboxMetadata(task)}
                    </div>
                </div>
            </div>
            <div class="xl:ml-auto flex items-center gap-1.5 opacity-100 xl:opacity-0 group-hover:opacity-100 transition-opacity xl:w-auto w-full pl-[38px] xl:pl-0 pt-2 xl:pt-0 border-t border-stone-100 xl:border-none mt-2 xl:mt-0">
                <button data-action="schedule-task" data-task-id="${task.id}" data-destination="today" class="flex-1 xl:flex-none px-3 py-2 xl:py-1.5 text-[12px] font-medium rounded-xl bg-stone-900 text-white hover:bg-stone-700 shadow-sm flex items-center justify-center gap-1.5 transition-all lowercase active:scale-95" type="button">
                    <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>
                    today
                </button>
                <button data-action="schedule-task" data-task-id="${task.id}" data-destination="tomorrow" class="flex-1 xl:flex-none px-3 py-2 xl:py-1.5 text-[12px] font-medium rounded-xl border border-stone-200 bg-white text-stone-500 hover:text-stone-900 hover:border-stone-400 hover:shadow-sm flex items-center justify-center gap-1.5 transition-all lowercase active:scale-95" type="button">
                    tmrw
                </button>
                <button data-action="schedule-task" data-task-id="${task.id}" data-destination="next-week" class="flex-1 xl:flex-none px-3 py-2 xl:py-1.5 text-[12px] font-medium rounded-xl border border-stone-200 bg-white text-stone-500 hover:text-stone-900 hover:border-stone-400 hover:shadow-sm flex items-center justify-center gap-1.5 transition-all lowercase active:scale-95" type="button">
                    next wk
                </button>
                <button data-action="schedule-task" data-task-id="${task.id}" data-destination="later" class="flex-1 xl:flex-none px-3 py-2 xl:py-1.5 text-[12px] font-medium rounded-xl border border-stone-200 bg-white text-stone-500 hover:text-stone-900 hover:border-stone-400 hover:shadow-sm flex items-center justify-center gap-1.5 transition-all lowercase active:scale-95" type="button">
                    later
                </button>
            </div>
        </div>
    `;
}

export function renderInboxView({ inboxTasks, editingTaskId, editingTaskDraft }) {
    const count = inboxTasks.length;
    const countLabel = `${count} item${count === 1 ? "" : "s"}`;

    return `
        <div class="h-full flex flex-col min-h-0">
            <header class="px-4 py-4 sm:px-6 sm:py-6 lg:px-10 lg:py-8 flex-shrink-0 z-10 bg-white">
                <h1 class="font-display text-4xl sm:text-5xl tracking-tight lowercase flex items-baseline gap-4">
                    inbox
                    <span class="text-sm text-stone-500 font-sans font-medium tracking-wider">${countLabel}</span>
                </h1>
            </header>
            <div class="px-4 pb-4 sm:px-6 sm:pb-5 lg:px-10 lg:pb-6 flex-shrink-0 z-10 bg-white">
                <div class="group flex items-center gap-3 bg-stone-50 rounded-2xl px-5 py-4 border border-stone-200/60 focus-within:border-stone-400 focus-within:bg-white focus-within:shadow-sm transition-all">
                    <svg class="w-5 h-5 text-stone-400 group-focus-within:text-stone-900 transition-colors" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                    <input id="taskInput" type="text" aria-label="add task to inbox" class="flex-1 bg-transparent border-none outline-none text-[15px] placeholder-stone-400 text-stone-900" placeholder="add to inbox to sort later...">
                </div>
            </div>
            <div class="flex-1 overflow-y-auto px-4 pb-24 sm:px-6 sm:pb-10 lg:px-10 flex flex-col relative">
                ${
                    count
                        ? `
                    <div class="flex flex-col gap-2">
                        ${inboxTasks
                            .map((task, i) =>
                                renderInboxTaskRow(
                                    task,
                                    i,
                                    editingTaskId === task.id ? editingTaskDraft : null,
                                ),
                            )
                            .join("")}
                    </div>
                `
                        : `
                    <div class="flex flex-1 flex-col items-center justify-center text-center p-10">
                        <div class="w-24 h-24 mb-6 text-stone-200 bg-stone-50 rounded-full flex items-center justify-center border border-stone-100 empty-icon shadow-soft">
                            <svg class="w-10 h-10 text-stone-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                        </div>
                        <h2 class="font-display text-3xl text-stone-900 mb-2 lowercase tracking-tight">inbox zero. nice work.</h2>
                        <p class="text-stone-500 text-sm max-w-[280px] lowercase leading-relaxed">you've triaged all your unscheduled tasks. enjoy the peace of mind.</p>
                    </div>
                `
                }
            </div>
        </div>
    `;
}
