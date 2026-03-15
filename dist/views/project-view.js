import { formatters, parseLocalISODate } from "../utils/date.js";
import { escapeHtml } from "../utils/text.js";
import { renderTaskCard } from "./task-card.js";
function renderDeadline(deadline) {
    if (!deadline)
        return "no deadline";
    if (!/^\d{4}-\d{2}-\d{2}$/.test(deadline))
        return deadline.toLowerCase();
    return formatters.modalDate.format(parseLocalISODate(deadline)).toLowerCase();
}
export function renderProjectView({ project, todoTasks, completedTasks }) {
    return `
        <div class="h-full flex flex-col min-h-0">
            <header class="px-4 py-4 sm:px-6 sm:py-6 lg:px-10 lg:py-8 flex flex-col gap-4 lg:flex-row lg:justify-between lg:items-start lg:gap-6 flex-shrink-0 z-10 bg-white">
                <div class="flex flex-col gap-3 max-w-3xl">
                    <div class="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-stone-400">
                        <span class="w-2 h-2 rounded-full bg-stone-900"></span>
                        bay project
                    </div>
                    <h1 class="text-3xl sm:text-4xl font-medium tracking-tighter lowercase">${escapeHtml(project.name)}</h1>
                    <p class="text-[15px] leading-relaxed text-stone-500 lowercase max-w-3xl">${escapeHtml(project.summary)}</p>
                </div>
                <div class="flex flex-col items-start lg:items-end gap-2">
                    <span class="text-[11px] font-semibold uppercase tracking-[0.18em] text-stone-400">deadline</span>
                    <span class="px-4 py-2 rounded-full bg-stone-900 text-white text-[13px] font-medium lowercase shadow-sm">
                        ${escapeHtml(renderDeadline(project.deadline))}
                    </span>
                </div>
            </header>
            <div class="px-4 pb-4 sm:px-6 sm:pb-5 lg:px-10 lg:pb-6 flex-shrink-0 z-10 bg-white">
                <div class="grid grid-cols-1 xl:grid-cols-[minmax(0,1.1fr)_minmax(280px,0.9fr)] gap-4">
                    <div class="rounded-[28px] border border-stone-200 bg-stone-50/70 p-6 flex flex-col gap-3">
                        <div class="text-[11px] font-semibold uppercase tracking-[0.18em] text-stone-400">next step</div>
                        <div class="text-[22px] font-medium tracking-tight lowercase text-stone-900">${escapeHtml(project.nextStep)}</div>
                        <p class="text-[14px] leading-relaxed text-stone-500 lowercase">
                            Bay pulled this forward so there is one obvious action to start with instead of a vague project shell.
                        </p>
                    </div>
                    <div class="group flex items-center gap-3 bg-stone-50 rounded-2xl px-5 py-4 border border-stone-200/60 focus-within:border-stone-400 focus-within:bg-white focus-within:shadow-sm transition-all">
                        <svg class="w-5 h-5 text-stone-400 group-focus-within:text-stone-900 transition-colors" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                        <input id="taskInput" type="text" aria-label="add task to project" class="flex-1 bg-transparent border-none outline-none text-[15px] placeholder-stone-400 text-stone-900 lowercase" placeholder="add another task to this project...">
                    </div>
                </div>
            </div>
            <div class="flex-1 overflow-y-auto px-4 pb-24 sm:px-6 sm:pb-10 lg:px-10 flex flex-col gap-3">
                <div class="flex flex-col gap-3">
                    ${todoTasks.length
        ? todoTasks.map((task) => renderTaskCard(task)).join("")
        : '<div class="rounded-[24px] border border-dashed border-stone-300 bg-stone-50/70 p-6 text-[14px] text-stone-500 lowercase">No active project tasks yet.</div>'}
                </div>
                <div class="flex items-center gap-4 mt-6 mb-2">
                    <div class="text-xs font-semibold text-stone-400 lowercase tracking-wider flex-shrink-0">completed (${completedTasks.length})</div>
                    <div class="h-px bg-stone-200 flex-1"></div>
                </div>
                <div class="flex flex-col gap-3">
                    ${completedTasks.length
        ? completedTasks.map((task) => renderTaskCard(task)).join("")
        : '<div class="text-[13px] text-stone-400 lowercase">No completed project tasks yet.</div>'}
                </div>
            </div>
        </div>
    `;
}
