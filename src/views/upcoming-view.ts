import { formatters } from "../utils/date.js";
import { escapeHtml } from "../utils/text.js";
import { renderTaskCard } from "./task-card.js";

function renderUpcomingSection(sectionKey, title, tasks, editingTaskId, editingTaskDraft) {
    if (!tasks.length) return "";

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
            <h2 class="${
                sectionKey === "tomorrow" ? "font-display text-lg text-stone-900" : "text-[11px] font-medium text-stone-500 tracking-widest"
            } lowercase flex-shrink-0">${title}</h2>
            <div class="h-px bg-stone-100 flex-1"></div>
        </div>
        <div class="flex flex-col gap-2">
            ${cards}
        </div>
    `;
}

export function renderUpcomingView({ weekDays, groups, editingTaskId, editingTaskDraft }) {
    const hasUpcomingTasks = Object.values(groups).some((tasks: unknown) => Array.isArray(tasks) && tasks.length > 0);

    return `
        <div class="h-full flex flex-col min-h-0">
            <header class="px-4 py-4 pb-3 sm:px-6 sm:py-6 lg:px-10 lg:py-8 lg:pb-4 flex flex-col gap-4 sm:gap-6 flex-shrink-0 z-10 bg-white">
                <h1 class="font-display text-4xl sm:text-5xl tracking-tight lowercase">upcoming</h1>
                <div class="flex items-center gap-1 sm:gap-1.5">
                    <button data-action="shift-week" data-direction="-1" aria-label="previous week" class="w-8 h-8 rounded-full flex items-center justify-center text-stone-400 hover:text-stone-900 hover:bg-stone-50 transition-colors flex-shrink-0" type="button">
                        <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
                    </button>
                    <div class="flex-1 flex gap-1">
                        ${weekDays
                            .map((day) => {
                                const dayLabel = formatters.weekdayShort.format(day.date).toLowerCase();
                                const numberLabel = day.date.getDate();
                                const baseClasses = day.isSelected
                                    ? "flex-1 flex flex-col items-center py-1.5 rounded-xl bg-stone-900 text-white cursor-pointer transition-colors"
                                    : day.isToday
                                      ? "flex-1 flex flex-col items-center py-1.5 rounded-xl bg-stone-100 text-stone-700 cursor-pointer transition-colors relative"
                                      : "flex-1 flex flex-col items-center py-1.5 rounded-xl hover:bg-stone-50 text-stone-500 cursor-pointer transition-colors relative";
                                const metaLabelClasses = day.isSelected
                                    ? "text-stone-400"
                                    : "text-stone-400";

                                return `
                                    <button data-action="select-upcoming-date" data-date="${day.iso}" class="${baseClasses}" type="button">
                                        <span class="text-[10px] font-medium uppercase tracking-wider ${metaLabelClasses}">${escapeHtml(dayLabel)}</span>
                                        <span class="text-[15px] font-semibold">${numberLabel}</span>
                                        ${
                                            day.hasTasks && !day.isSelected
                                                ? `<span class="absolute bottom-0.5 w-1 h-1 rounded-full ${
                                                      day.isToday ? "bg-stone-900" : "bg-stone-400"
                                                  }"></span>`
                                                : ""
                                        }
                                    </button>
                                `;
                            })
                            .join("")}
                    </div>
                    <button data-action="shift-week" data-direction="1" aria-label="next week" class="w-8 h-8 rounded-full flex items-center justify-center text-stone-400 hover:text-stone-900 hover:bg-stone-50 transition-colors flex-shrink-0" type="button">
                        <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
                    </button>
                </div>
            </header>
            <div id="upcomingScrollArea" class="flex-1 overflow-y-auto px-4 pb-24 sm:px-6 sm:pb-10 lg:px-10 flex flex-col">
                ${
                    hasUpcomingTasks
                        ? `
                    ${renderUpcomingSection("tomorrow", "tomorrow", groups.tomorrow, editingTaskId, editingTaskDraft)}
                    ${renderUpcomingSection("this-week", "this week", groups["this-week"], editingTaskId, editingTaskDraft)}
                    ${renderUpcomingSection("later", "later", groups.later, editingTaskId, editingTaskDraft)}
                `
                        : `
                    <div class="mt-4 rounded-3xl border border-dashed border-stone-300 bg-stone-50/70 p-8 text-[14px] text-stone-500 lowercase">
                        No upcoming tasks scheduled yet. Add due dates to see them here.
                    </div>
                `
                }
            </div>
        </div>
    `;
}
