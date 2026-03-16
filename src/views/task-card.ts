import { tagColorMap } from "../data/tag-colors.js";
import { getTaskDueMeta } from "../state/selectors.js";
import { escapeHtml } from "../utils/text.js";

export function renderTaskBadges(task) {
    const dueMeta = getTaskDueMeta(task);
    const badges = [];
    const dueBadgeClass =
        "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-stone-200 bg-white text-stone-600 lowercase text-xs font-medium shadow-sm";

    if (dueMeta.label) {
        badges.push(`
            <span class="${dueBadgeClass}">
                <svg class="w-3.5 h-3.5 ${
                    dueMeta.tone === "overdue" ? "text-red-500" : "text-stone-500"
                }" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                ${escapeHtml(dueMeta.label)}
            </span>
        `);
    }

    if (task.projectId && task.projectName) {
        badges.push(`
            <span class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-stone-200 bg-stone-50 text-stone-500 lowercase text-xs font-medium">
                <span class="w-1.5 h-1.5 rounded-full bg-stone-400"></span>
                ${escapeHtml(task.projectName)}
            </span>
        `);
    }

    task.tags.forEach((tag) => {
        badges.push(`
            <span class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-dashed border-stone-300 bg-white text-stone-500 lowercase text-xs font-medium">
                ${
                    tag.color && tagColorMap[tag.color]
                        ? `<span class="w-1.5 h-1.5 rounded-full" style="background-color: ${tagColorMap[tag.color]}"></span>`
                        : ""
                }
                ${escapeHtml(tag.label)}
            </span>
        `);
    });

    return badges.join("");
}

export function renderTaskCard(
    task,
    options: {
        anchorDate?: string | null;
        index?: number;
        editingDraft?: { title: string; description: string } | null;
        listId?: string;
    } = {},
) {
    const { anchorDate = null, index = 0, listId = "" } = options;
    const staggerDelay = Math.min(index * 40, 300);
    const isCompleted = task.status === "completed";
    const isEditing = Boolean(options.editingDraft);
    const editDraft = options.editingDraft;
    const badges = renderTaskBadges(task);
    const anchorAttribute = anchorDate ? `data-anchor-date="${anchorDate}"` : "";

    const rowClasses = isCompleted
        ? "task-row completed group bg-stone-50/60 rounded-xl px-4 py-3 flex items-center gap-3 transition-colors cursor-pointer scroll-mt-6 focus-visible:outline focus-visible:outline-2 focus-visible:outline-stone-900 focus-visible:outline-offset-2"
        : "task-row group bg-white border border-stone-200 rounded-2xl p-5 flex flex-col gap-3 hover:border-stone-400 hover:bg-stone-50/50 transition-colors cursor-pointer scroll-mt-6 focus-visible:outline focus-visible:outline-2 focus-visible:outline-stone-900 focus-visible:outline-offset-2";
    const titleClasses = isCompleted
        ? "text-[14px] text-stone-400 font-medium line-through task-title"
        : "text-[15px] text-stone-900 font-semibold transition-colors duration-200 task-title";
    const checkboxClasses = isCompleted
        ? "w-[22px] h-[22px] rounded-full border-2 border-stone-900 bg-stone-900 flex items-center justify-center transition-all"
        : "w-[22px] h-[22px] rounded-full border-2 border-stone-300 flex items-center justify-center transition-all bg-white group-hover:border-stone-400";

    if (isEditing && editDraft) {
        return `
            <div class="task-row task-row-editing bg-white border border-stone-900/15 rounded-2xl p-5 flex flex-col gap-4 scroll-mt-6 shadow-sm" data-task-id="${task.id}" data-task-list="${listId}" ${anchorAttribute} style="animation-delay: ${staggerDelay}ms">
                <div class="flex items-start gap-4">
                    <button data-action="toggle" data-task-id="${task.id}" class="checkbox-wrapper pt-1 flex-shrink-0" aria-label="${
                        isCompleted ? "mark task incomplete" : "mark task complete"
                    }" type="button">
                        <div class="${checkboxClasses}">
                            <svg class="w-3 h-3 text-white check-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                        </div>
                    </button>
                    <div class="flex-1 flex flex-col gap-3 min-w-0">
                        <input data-action="edit-task-title" data-task-id="${task.id}" aria-label="edit task title" class="task-card-title-input w-full bg-transparent text-[15px] font-semibold text-stone-900 outline-none" value="${escapeHtml(editDraft.title)}">
                        <textarea data-action="edit-task-description" data-task-id="${task.id}" aria-label="edit task description" class="task-card-description-input w-full bg-transparent text-[13px] leading-relaxed text-stone-600 outline-none resize-none" rows="${editDraft.description ? 2 : 1}" placeholder="Add a description...">${escapeHtml(editDraft.description)}</textarea>
                    </div>
                </div>
                ${
                    badges
                        ? `
                    <div class="pl-[38px] flex flex-wrap items-center gap-2">
                        ${badges}
                    </div>
                `
                        : ""
                }
                <div class="pl-[38px] flex items-center justify-between gap-3 flex-wrap">
                    <div class="text-[11px] font-medium text-stone-500 lowercase">editing task card</div>
                    <div class="flex items-center gap-2">
                        <button data-action="cancel-task-edit" class="px-3 py-1.5 rounded-xl border border-stone-200 text-[13px] font-medium text-stone-600 hover:border-stone-300 hover:text-stone-900 transition-colors lowercase" type="button">cancel</button>
                        <button data-action="save-task-edit" class="px-3 py-1.5 rounded-xl bg-stone-900 text-white text-[13px] font-medium hover:bg-stone-700 transition-colors lowercase" type="button">save</button>
                    </div>
                </div>
            </div>
        `;
    }

    if (isCompleted) {
        return `
            <div class="${rowClasses}" data-action="open-task" data-task-id="${task.id}" data-task-list="${listId}" tabindex="0" role="button" aria-label="${escapeHtml(task.title)}" ${anchorAttribute} style="animation-delay: ${staggerDelay}ms">
                <button data-action="toggle" data-task-id="${task.id}" class="checkbox-wrapper flex-shrink-0" aria-label="mark task incomplete" type="button">
                    <div class="${checkboxClasses}">
                        <svg class="w-3 h-3 text-white check-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                    </div>
                </button>
                <div class="${titleClasses} truncate">${escapeHtml(task.title)}</div>
            </div>
        `;
    }

    return `
        <div class="${rowClasses}" data-action="open-task" data-task-id="${task.id}" data-task-list="${listId}" draggable="true" tabindex="0" role="button" aria-label="${escapeHtml(task.title)}" ${anchorAttribute} style="animation-delay: ${staggerDelay}ms">
            <div class="flex items-start gap-4">
                <button data-action="toggle" data-task-id="${task.id}" class="checkbox-wrapper pt-0.5 flex-shrink-0" aria-label="mark task complete" type="button">
                    <div class="${checkboxClasses}">
                        <svg class="w-3 h-3 text-white check-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                    </div>
                </button>
                <div class="flex-1 flex flex-col justify-center gap-1.5 pt-0.5">
                    <div class="${titleClasses}">${escapeHtml(task.title)}</div>
                    ${
                        task.description
                            ? `<p class="text-[13px] text-stone-500 leading-relaxed line-clamp-1">${escapeHtml(task.description)}</p>`
                            : ""
                    }
                </div>
            </div>
            ${
                badges
                    ? `
                <div class="pl-[38px] flex flex-wrap items-center gap-2">
                    ${badges}
                </div>
            `
                    : ""
            }
        </div>
    `;
}
