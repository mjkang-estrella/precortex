import { getTaskDueMeta } from "../state/selectors.js";
import { escapeHtml } from "../utils/text.js";
export function renderTaskModal({ taskModal, task, animate = false }) {
    if (!task) {
        taskModal.className = "hidden fixed inset-0 z-50 items-center justify-center p-6";
        taskModal.innerHTML = "";
        return;
    }
    const doneCount = task.subtasks.filter((subtask) => subtask.done).length;
    const subtaskCountLabel = task.subtasks.length ? `${doneCount}/${task.subtasks.length} done` : "0/0 done";
    const dueMeta = getTaskDueMeta(task);
    const dueLabel = task.dueAt ? dueMeta.longLabel : "unscheduled";
    const backdropAnimationClass = animate ? "animate-backdrop" : "";
    const modalAnimationClass = animate ? "animate-modal" : "";
    taskModal.className = "fixed inset-0 z-50 flex items-center justify-center p-6";
    taskModal.innerHTML = `
        <div class="absolute inset-0 bg-stone-900/40 backdrop-blur-[2px] ${backdropAnimationClass}" data-action="close-modal"></div>
        <div class="bg-white w-full max-w-[800px] max-h-[90vh] rounded-[32px] shadow-modal relative z-10 flex flex-col overflow-hidden border border-white ${modalAnimationClass}">
            <div class="px-6 py-4 border-b border-stone-100 flex items-center justify-between bg-white flex-shrink-0">
                <div class="flex items-center gap-3">
                    <button data-action="modal-toggle-task" data-task-id="${task.id}" class="px-3 py-1.5 rounded-xl text-[13px] font-medium ${task.status === "completed"
        ? "text-stone-500 border border-stone-200"
        : "bg-stone-900 text-white border border-stone-900"} transition-all lowercase flex items-center gap-2">
                        <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                        ${task.status === "completed" ? "mark incomplete" : "mark complete"}
                    </button>
                    <div class="w-px h-4 bg-stone-200"></div>
                    <span class="text-[13px] text-stone-400 lowercase">${escapeHtml(task.projectName || "inbox")}</span>
                </div>
                <div class="flex items-center gap-2">
                    <button class="w-8 h-8 flex items-center justify-center rounded-full text-stone-400 hover:bg-stone-100 hover:text-stone-900 transition-colors" type="button">
                        <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="1"></circle><circle cx="19" cy="12" r="1"></circle><circle cx="5" cy="12" r="1"></circle></svg>
                    </button>
                    <button data-action="close-modal" class="w-8 h-8 flex items-center justify-center rounded-full bg-stone-100 text-stone-500 hover:bg-stone-200 hover:text-stone-900 transition-colors" type="button">
                        <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                    </button>
                </div>
            </div>
            <div class="flex-1 overflow-hidden flex bg-white">
                <div class="flex-1 overflow-y-auto p-8 pr-6 flex flex-col gap-8">
                    <div class="flex gap-4 items-start">
                        <button data-action="modal-toggle-task" data-task-id="${task.id}" class="${task.status === "completed"
        ? "w-[22px] h-[22px] rounded-full border-2 border-stone-900 bg-stone-900 mt-2 flex items-center justify-center flex-shrink-0"
        : "w-[22px] h-[22px] rounded-full border-2 border-stone-300 mt-2 flex-shrink-0 cursor-pointer hover:border-stone-400 transition-colors"}" type="button">
                            ${task.status === "completed"
        ? '<svg class="w-3 h-3 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>'
        : ""}
                        </button>
                        <textarea id="modalTitleInput" data-task-id="${task.id}" class="text-3xl font-medium text-stone-900 w-full outline-none resize-none lowercase bg-transparent placeholder-stone-300 tracking-tight" rows="2" placeholder="task name">${escapeHtml(task.title)}</textarea>
                    </div>
                    <div class="pl-[38px] flex flex-col gap-2">
                        <textarea id="modalDescriptionInput" data-task-id="${task.id}" class="w-full bg-transparent text-[15px] leading-relaxed text-stone-600 outline-none resize-none min-h-[100px] lowercase placeholder-stone-400" placeholder="add a description...">${escapeHtml(task.description || "")}</textarea>
                    </div>
                    <div class="pl-[38px] flex flex-col gap-3">
                        <div class="flex items-center justify-between mb-1">
                            <h3 class="text-[13px] font-semibold text-stone-900 lowercase tracking-wide">subtasks</h3>
                            <span class="text-[12px] text-stone-400 lowercase font-medium">${subtaskCountLabel}</span>
                        </div>
                        <div class="flex flex-col gap-2.5">
                            ${task.subtasks.length
        ? task.subtasks
            .map((subtask) => `
                                    <div class="flex items-center gap-3 ${subtask.done ? "opacity-60" : ""}">
                                        <button data-action="toggle-subtask" data-task-id="${task.id}" data-subtask-id="${subtask.id}" class="${subtask.done
            ? "w-4 h-4 rounded border border-stone-900 bg-stone-900 flex items-center justify-center"
            : "w-4 h-4 rounded border-2 border-stone-300 hover:border-stone-400 transition-colors"}" aria-label="${subtask.done ? "mark subtask incomplete" : "mark subtask complete"}" type="button">
                                            ${subtask.done
            ? '<svg class="w-2.5 h-2.5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>'
            : ""}
                                        </button>
                                        <div class="text-[14px] ${subtask.done ? "text-stone-500 line-through" : "text-stone-800"} lowercase">${escapeHtml(subtask.title)}</div>
                                    </div>
                                `)
            .join("")
        : '<div class="text-[14px] text-stone-400 lowercase">No subtasks yet.</div>'}
                        </div>
                    </div>
                    <div class="h-8"></div>
                </div>
                <div class="w-[240px] border-l border-stone-100 bg-stone-50/30 p-6 flex flex-col gap-6 flex-shrink-0">
                    <div class="flex flex-col gap-5">
                        <div class="flex flex-col gap-2">
                            <span class="text-[11px] font-semibold text-stone-400 lowercase tracking-wider">project</span>
                            <button class="flex items-center justify-between px-3 py-2 rounded-xl bg-white border border-stone-200 text-stone-600 lowercase group" type="button">
                                <div class="flex items-center gap-2">
                                    <svg class="w-4 h-4 text-stone-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
                                    <span class="text-[13px] font-medium text-stone-700">${escapeHtml(task.projectName || "inbox")}</span>
                                </div>
                                <svg class="w-3.5 h-3.5 text-stone-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
                            </button>
                        </div>
                        <div class="flex flex-col gap-2">
                            <span class="text-[11px] font-semibold text-stone-400 lowercase tracking-wider">due date</span>
                            <button class="flex items-center justify-between px-3 py-2 rounded-xl border border-dashed border-stone-300 text-stone-500 lowercase group" type="button">
                                <div class="flex items-center gap-2">
                                    <svg class="w-4 h-4 text-stone-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                                    <span class="text-[13px] font-medium">${escapeHtml(dueLabel)}</span>
                                </div>
                            </button>
                        </div>
                        <div class="flex flex-col gap-2">
                            <span class="text-[11px] font-semibold text-stone-400 lowercase tracking-wider">priority</span>
                            <button class="flex items-center justify-between px-3 py-2 rounded-xl border border-dashed border-stone-300 text-stone-500 lowercase group" type="button">
                                <div class="flex items-center gap-2">
                                    <svg class="w-4 h-4 text-stone-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"></path><line x1="4" y1="22" x2="4" y2="15"></line></svg>
                                    <span class="text-[13px] font-medium">${escapeHtml(task.priority || "none")}</span>
                                </div>
                            </button>
                        </div>
                    </div>
                    <div class="mt-auto pt-6 flex flex-col gap-3 border-t border-stone-200/60">
                        <span class="text-[11px] font-medium text-stone-400 lowercase">${escapeHtml(task.createdLabel || "created recently")}</span>
                    </div>
                </div>
            </div>
        </div>
    `;
}
