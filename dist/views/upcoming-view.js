import { formatters } from "../utils/date.js";
import { escapeHtml } from "../utils/text.js";
import { renderTaskCard } from "./task-card.js";
function renderUpcomingSection(sectionKey, title, tasks, editingTaskId, editingTaskDraft) {
    if (!tasks.length)
        return "";
    let lastDate = null;
    const cards = tasks
        .map((task, i) => {
        const anchorDate = task.dueAt !== lastDate ? task.dueAt : null;
        lastDate = task.dueAt;
        return renderTaskCard(task, {
            anchorDate,
            index: i,
            listId: `upcoming-${sectionKey}`,
            editingDraft: editingTaskId === task.id ? editingTaskDraft : null,
        });
    })
        .join("");
    return `
        <div class="flex items-center gap-4 mt-10 mb-3 sticky top-0 bg-white/90 backdrop-blur-sm z-20 py-2 scroll-mt-6" data-anchor-section="${sectionKey}">
            <div class="${sectionKey === "tomorrow" ? "font-display text-lg text-stone-900" : "text-[11px] font-medium text-stone-300 tracking-widest"} lowercase flex-shrink-0">${title}</div>
            <div class="h-px bg-stone-100 flex-1"></div>
        </div>
        <div class="flex flex-col gap-2">
            ${cards}
        </div>
    `;
}
export function renderUpcomingView({ weekDays, groups, editingTaskId, editingTaskDraft }) {
    const hasUpcomingTasks = Object.values(groups).some((tasks) => Array.isArray(tasks) && tasks.length > 0);
    return `
        <div class="h-full flex flex-col min-h-0">
            <header class="px-4 py-4 pb-3 sm:px-6 sm:py-6 lg:px-10 lg:py-8 lg:pb-4 flex flex-col gap-4 sm:gap-6 flex-shrink-0 z-10 bg-white">
                <h1 class="font-display text-4xl sm:text-5xl tracking-tight lowercase">upcoming</h1>
                <div class="flex items-center justify-between gap-1 sm:gap-2 px-0 sm:px-2 py-1">
                    <button data-action="shift-week" data-direction="-1" aria-label="previous week" class="w-8 h-8 rounded-full flex items-center justify-center text-stone-400 hover:text-stone-900 hover:bg-stone-50 transition-colors" type="button">
                        <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
                    </button>
                    <div class="flex-1 flex justify-between gap-2">
                        ${weekDays
        .map((day) => {
        const dayLabel = formatters.weekdayShort.format(day.date).toLowerCase();
        const numberLabel = day.date.getDate();
        const baseClasses = day.isSelected
            ? "flex-1 flex flex-col items-center justify-center p-2 rounded-2xl bg-stone-900 text-white shadow-md cursor-pointer transition-colors"
            : day.isToday
                ? "flex-1 flex flex-col items-center justify-center p-2 rounded-2xl bg-stone-50 border border-stone-200/60 text-stone-700 cursor-pointer transition-colors relative"
                : "flex-1 flex flex-col items-center justify-center p-2 rounded-2xl hover:bg-stone-50 text-stone-600 cursor-pointer transition-colors relative";
        const metaLabelClasses = day.isSelected
            ? "text-stone-300"
            : day.isToday
                ? "text-stone-500"
                : "text-stone-400";
        return `
                                    <button data-action="select-upcoming-date" data-date="${day.iso}" class="${baseClasses}" type="button">
                                        <span class="text-[10px] font-semibold uppercase tracking-wider mb-1 ${metaLabelClasses}">${escapeHtml(dayLabel)}</span>
                                        <span class="text-lg font-medium">${numberLabel}</span>
                                        ${day.hasTasks && !day.isSelected
            ? `<span class="absolute bottom-1 w-1 h-1 rounded-full ${day.isToday ? "bg-stone-900" : "bg-stone-400"}"></span>`
            : ""}
                                    </button>
                                `;
    })
        .join("")}
                    </div>
                    <button data-action="shift-week" data-direction="1" aria-label="next week" class="w-8 h-8 rounded-full flex items-center justify-center text-stone-400 hover:text-stone-900 hover:bg-stone-50 transition-colors" type="button">
                        <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
                    </button>
                </div>
            </header>
            <div id="upcomingScrollArea" class="flex-1 overflow-y-auto px-4 pb-24 sm:px-6 sm:pb-10 lg:px-10 flex flex-col">
                ${hasUpcomingTasks
        ? `
                    ${renderUpcomingSection("tomorrow", "tomorrow", groups.tomorrow, editingTaskId, editingTaskDraft)}
                    ${renderUpcomingSection("this-week", "this week", groups["this-week"], editingTaskId, editingTaskDraft)}
                    ${renderUpcomingSection("later", "later", groups.later, editingTaskId, editingTaskDraft)}
                `
        : `
                    <div class="mt-4 rounded-[24px] border border-dashed border-stone-300 bg-stone-50/70 p-8 text-[14px] text-stone-500 lowercase">
                        No upcoming tasks scheduled yet. Add due dates to see them here.
                    </div>
                `}
            </div>
        </div>
    `;
}
