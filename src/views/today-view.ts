import { renderTaskCard } from "./task-card.js";

export function renderTodayView({ todoTasks, completedTasks }) {
    return `
        <div class="h-full flex flex-col min-h-0">
            <header class="px-4 py-4 sm:px-6 sm:py-6 lg:px-10 lg:py-8 flex-shrink-0 z-10 bg-white">
                <h1 class="text-3xl sm:text-4xl font-medium tracking-tighter lowercase">today</h1>
            </header>
            <div class="px-4 pb-4 sm:px-6 sm:pb-5 lg:px-10 lg:pb-6 flex-shrink-0 z-10 bg-white">
                <div class="group flex items-center gap-3 bg-stone-50 rounded-2xl px-5 py-4 border border-stone-200/60 focus-within:border-stone-400 focus-within:bg-white focus-within:shadow-sm transition-all">
                    <svg class="w-5 h-5 text-stone-400 group-focus-within:text-stone-900 transition-colors" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                    <input id="taskInput" type="text" aria-label="add task for today" class="flex-1 bg-transparent border-none outline-none text-[15px] placeholder-stone-400 text-stone-900 lowercase" placeholder="what needs to be done?">
                </div>
            </div>
            <div class="flex-1 overflow-y-auto px-4 pb-24 sm:px-6 sm:pb-10 lg:px-10 flex flex-col gap-3">
                <div class="flex flex-col gap-3">
                    ${
                        todoTasks.length
                            ? todoTasks.map((task, i) => renderTaskCard(task, { index: i })).join("")
                            : '<div class="rounded-[24px] border border-dashed border-stone-300 bg-stone-50/70 p-6 text-[14px] text-stone-500 lowercase">No overdue or due-today tasks right now.</div>'
                    }
                </div>
                <div class="flex items-center gap-4 mt-6 mb-2">
                    <div class="text-xs font-semibold text-stone-400 lowercase tracking-wider flex-shrink-0">completed (${completedTasks.length})</div>
                    <div class="h-px bg-stone-200 flex-1"></div>
                </div>
                <div class="flex flex-col gap-3">
                    ${
                        completedTasks.length
                            ? completedTasks.map((task, i) => renderTaskCard(task, { index: i })).join("")
                            : '<div class="text-[13px] text-stone-400 lowercase">No completed tasks yet.</div>'
                    }
                </div>
            </div>
        </div>
    `;
}
