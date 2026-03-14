import { renderTaskCard } from "./task-card.js";

export function renderTodayView({ todoTasks, completedTasks }) {
    return `
        <div class="h-full flex flex-col min-h-0">
            <header class="px-10 py-8 flex justify-between items-end flex-shrink-0 z-10 bg-white">
                <h1 class="text-4xl font-medium tracking-tighter lowercase">today</h1>
                <div class="flex gap-2">
                    <button class="flex items-center gap-2 px-4 py-2 rounded-full bg-stone-50 hover:bg-stone-100 text-stone-700 hover:text-stone-900 text-sm font-medium transition-colors border border-stone-200/60 lowercase" type="button">
                        <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
                        share
                    </button>
                    <button class="w-9 h-9 rounded-full bg-stone-50 hover:bg-stone-100 text-stone-700 hover:text-stone-900 flex items-center justify-center transition-colors border border-stone-200/60" type="button">
                        <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="4" y1="21" x2="4" y2="14"></line><line x1="4" y1="10" x2="4" y2="3"></line><line x1="12" y1="21" x2="12" y2="12"></line><line x1="12" y1="8" x2="12" y2="3"></line><line x1="20" y1="21" x2="20" y2="16"></line><line x1="20" y1="12" x2="20" y2="3"></line><line x1="1" y1="14" x2="7" y2="14"></line><line x1="9" y1="8" x2="15" y2="8"></line><line x1="17" y1="16" x2="23" y2="16"></line></svg>
                    </button>
                    <button class="w-9 h-9 rounded-full bg-stone-50 hover:bg-stone-100 text-stone-700 hover:text-stone-900 flex items-center justify-center transition-colors border border-stone-200/60" type="button">
                        <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="1"></circle><circle cx="19" cy="12" r="1"></circle><circle cx="5" cy="12" r="1"></circle></svg>
                    </button>
                </div>
            </header>
            <div class="px-10 pb-6 flex-shrink-0 z-10 bg-white">
                <div class="group flex items-center gap-3 bg-stone-50 rounded-2xl px-5 py-4 border border-stone-200/60 focus-within:border-stone-400 focus-within:bg-white focus-within:shadow-sm transition-all">
                    <svg class="w-5 h-5 text-stone-400 group-focus-within:text-stone-900 transition-colors" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                    <input id="taskInput" type="text" class="flex-1 bg-transparent border-none outline-none text-[15px] placeholder-stone-400 text-stone-900 lowercase" placeholder="what needs to be done?">
                </div>
            </div>
            <div class="flex-1 overflow-y-auto px-10 pb-10 flex flex-col gap-3">
                <div class="flex flex-col gap-3">
                    ${
                        todoTasks.length
                            ? todoTasks.map((task) => renderTaskCard(task)).join("")
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
                            ? completedTasks.map((task) => renderTaskCard(task)).join("")
                            : '<div class="text-[13px] text-stone-400 lowercase">No completed tasks yet.</div>'
                    }
                </div>
            </div>
        </div>
    `;
}
