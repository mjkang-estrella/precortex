import { formatters } from "../utils/date.js";
import { escapeHtml } from "../utils/text.js";
import { renderTaskCard } from "./task-card.js";

function renderUpcomingSection(sectionKey, title, tasks) {
    if (!tasks.length) return "";

    let lastDate = null;
    const cards = tasks
        .map((task) => {
            const anchorDate = task.dueAt !== lastDate ? task.dueAt : null;
            lastDate = task.dueAt;
            return renderTaskCard(task, { anchorDate });
        })
        .join("");

    return `
        <div class="flex items-center gap-4 mt-6 mb-2 sticky top-0 bg-white/90 backdrop-blur-sm z-20 py-2 scroll-mt-6" data-anchor-section="${sectionKey}">
            <div class="text-xs font-semibold ${
                sectionKey === "tomorrow" ? "text-stone-900" : "text-stone-400"
            } lowercase tracking-wider flex-shrink-0">${title}</div>
            <div class="h-px bg-stone-200 flex-1"></div>
        </div>
        ${cards}
    `;
}

export function renderUpcomingView({ weekDays, groups }) {
    const hasUpcomingTasks = Object.values(groups).some((tasks: unknown) => Array.isArray(tasks) && tasks.length > 0);

    return `
        <div class="h-full flex flex-col min-h-0">
            <header class="px-10 py-8 pb-4 flex flex-col gap-6 flex-shrink-0 z-10 bg-white">
                <div class="flex justify-between items-end">
                    <h1 class="text-4xl font-medium tracking-tighter lowercase">upcoming</h1>
                    <div class="flex gap-2">
                        <button class="flex items-center gap-2 px-4 py-2 rounded-full bg-stone-50 hover:bg-stone-100 text-stone-700 hover:text-stone-900 text-sm font-medium transition-colors border border-stone-200/60 lowercase" type="button">
                            <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon></svg>
                            filter
                        </button>
                        <button class="w-9 h-9 rounded-full bg-stone-50 hover:bg-stone-100 text-stone-700 hover:text-stone-900 flex items-center justify-center transition-colors border border-stone-200/60" type="button">
                            <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="1"></circle><circle cx="19" cy="12" r="1"></circle><circle cx="5" cy="12" r="1"></circle></svg>
                        </button>
                    </div>
                </div>
                <div class="flex items-center justify-between gap-2 px-2 py-1">
                    <button data-action="shift-week" data-direction="-1" class="w-8 h-8 rounded-full flex items-center justify-center text-stone-400 hover:text-stone-900 hover:bg-stone-50 transition-colors" type="button">
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
                                        ${
                                            day.hasTasks && !day.isSelected
                                                ? `<span class="absolute bottom-1 w-1 h-1 rounded-full ${
                                                      day.isToday ? "bg-stone-900" : "bg-stone-400"
                                                  }"></span>`
                                                : ""
                                        }
                                    </button>
                                `;
                            })
                            .join("")}
                    </div>
                    <button data-action="shift-week" data-direction="1" class="w-8 h-8 rounded-full flex items-center justify-center text-stone-400 hover:text-stone-900 hover:bg-stone-50 transition-colors" type="button">
                        <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
                    </button>
                </div>
            </header>
            <div id="upcomingScrollArea" class="flex-1 overflow-y-auto px-10 pb-10 flex flex-col gap-3">
                ${
                    hasUpcomingTasks
                        ? `
                    ${renderUpcomingSection("tomorrow", "tomorrow", groups.tomorrow)}
                    ${renderUpcomingSection("this-week", "this week", groups["this-week"])}
                    ${renderUpcomingSection("later", "later", groups.later)}
                `
                        : `
                    <div class="mt-4 rounded-[24px] border border-dashed border-stone-300 bg-stone-50/70 p-8 text-[14px] text-stone-500 lowercase">
                        No upcoming tasks scheduled yet. Add due dates to see them here.
                    </div>
                `
                }
            </div>
        </div>
    `;
}
