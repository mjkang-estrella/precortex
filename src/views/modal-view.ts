import { getTaskDueMeta } from "../state/selectors.js";
import { escapeHtml } from "../utils/text.js";

function renderProjectOptions(task, projects) {
    const options = [
        `<option value="" ${!task.projectId ? "selected" : ""}>inbox</option>`,
        ...projects.map(
            (project) =>
                `<option value="${project.id}" ${task.projectId === project.id ? "selected" : ""}>${escapeHtml(
                    project.name,
                )}</option>`,
        ),
    ];

    return options.join("");
}

function renderPriorityOptions(task) {
    const priorities = ["none", "low", "medium", "high"];

    return priorities
        .map(
            (priority) =>
                `<option value="${priority}" ${task.priority === priority ? "selected" : ""}>${priority}</option>`,
        )
        .join("");
}

export function renderTaskModal({
    taskModal,
    task,
    projects,
    subtaskComposerOpen = false,
    subtaskDraft = "",
    animate = false,
}) {
    if (!task) {
        taskModal.className = "hidden fixed inset-0 z-50 items-center justify-center p-6";
        taskModal.innerHTML = "";
        return;
    }

    const doneCount = task.subtasks.filter((subtask) => subtask.done).length;
    const dueMeta = getTaskDueMeta(task);
    const dueLabel = task.dueAt ? dueMeta.longLabel : "unscheduled";

    const backdropAnimationClass = animate ? "animate-backdrop" : "";
    const modalAnimationClass = animate ? "animate-modal" : "";

    taskModal.className = "fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6";
    taskModal.innerHTML = `
        <div class="absolute inset-0 bg-stone-900/40 backdrop-blur-[2px] ${backdropAnimationClass}" data-action="close-modal"></div>
        <div role="dialog" aria-modal="true" aria-label="task details" class="bg-white w-full max-w-[800px] max-h-[90vh] rounded-[28px] sm:rounded-[32px] shadow-modal relative z-10 flex flex-col overflow-hidden border border-white ${modalAnimationClass}">
            <div class="px-4 py-4 sm:px-6 border-b border-stone-100 flex flex-wrap items-center justify-between gap-3 bg-white flex-shrink-0">
                <div class="flex items-center gap-3 min-w-0">
                    <button data-action="modal-toggle-task" data-task-id="${task.id}" class="px-3 py-1.5 rounded-xl text-[13px] font-medium ${
                        task.status === "completed"
                            ? "text-stone-500 border border-stone-200"
                            : "bg-stone-900 text-white border border-stone-900"
                    } transition-all lowercase flex items-center gap-2" type="button">
                        <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                        ${task.status === "completed" ? "mark incomplete" : "mark complete"}
                    </button>
                    <div class="w-px h-4 bg-stone-200"></div>
                    <span class="text-[13px] text-stone-400 lowercase">${escapeHtml(task.projectName || "inbox")}</span>
                </div>
                <div class="flex items-center gap-2">
                    <button data-action="close-modal" aria-label="close task details" class="w-8 h-8 flex items-center justify-center rounded-full bg-stone-100 text-stone-500 hover:bg-stone-200 hover:text-stone-900 transition-colors" type="button">
                        <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                    </button>
                </div>
            </div>
            <div class="flex-1 overflow-hidden flex flex-col lg:flex-row bg-white">
                <div class="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 lg:pr-6 flex flex-col gap-6 sm:gap-8 min-w-0">
                    <div class="flex gap-4 items-start">
                        <button data-action="modal-toggle-task" data-task-id="${task.id}" class="${
                            task.status === "completed"
                                ? "w-[22px] h-[22px] rounded-full border-2 border-stone-900 bg-stone-900 mt-2 flex items-center justify-center flex-shrink-0"
                                : "w-[22px] h-[22px] rounded-full border-2 border-stone-300 mt-2 flex-shrink-0 cursor-pointer hover:border-stone-400 transition-colors"
                        }" type="button">
                            ${
                                task.status === "completed"
                                    ? '<svg class="w-3 h-3 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>'
                                    : ""
                            }
                        </button>
                        <textarea id="modalTitleInput" data-task-id="${task.id}" aria-label="task title" class="font-display text-3xl text-stone-900 w-full outline-none resize-none bg-transparent placeholder-stone-300 tracking-tight" rows="2" placeholder="task name">${escapeHtml(task.title)}</textarea>
                    </div>
                    <div class="pl-[38px] flex flex-col gap-2">
                        <textarea id="modalDescriptionInput" data-task-id="${task.id}" aria-label="task description" class="w-full bg-transparent text-[15px] leading-relaxed text-stone-600 outline-none resize-none min-h-[100px] placeholder-stone-400" placeholder="add a description...">${escapeHtml(task.description || "")}</textarea>
                    </div>
                    <div class="pl-[38px] flex flex-col gap-3">
                        <div class="flex items-center justify-between mb-1 gap-3 flex-wrap">
                            <h3 class="text-[13px] font-semibold text-stone-900 lowercase tracking-wide">subtasks</h3>
                            <button data-action="open-subtask-composer" data-task-id="${task.id}" class="w-7 h-7 rounded-full border border-stone-200 bg-white text-stone-400 hover:text-stone-900 hover:border-stone-400 transition-colors flex items-center justify-center" aria-label="add subtask" type="button">
                                <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                            </button>
                        </div>
                        <div class="flex flex-col gap-2.5">
                            ${
                                subtaskComposerOpen
                                    ? `
                                <div class="flex items-start gap-3">
                                    <div class="w-4 h-4 rounded border-2 border-stone-300 mt-2 flex-shrink-0"></div>
                                    <input id="modalNewSubtaskInput" data-task-id="${task.id}" aria-label="new subtask" class="flex-1 min-w-0 bg-transparent border-none outline-none p-0 pt-1.5 text-[14px] text-stone-800 placeholder-stone-400" value="${escapeHtml(
                                        subtaskDraft,
                                    )}" placeholder="new subtask...">
                                    <button data-action="cancel-subtask-composer" class="opacity-100 w-8 h-8 rounded-full flex items-center justify-center text-stone-400 hover:bg-stone-100 hover:text-stone-900 transition-all flex-shrink-0" aria-label="cancel new subtask" type="button">
                                        <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.25" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"></path><path d="M8 6V4h8v2"></path><path d="M19 6l-1 14H6L5 6"></path></svg>
                                    </button>
                                </div>
                            `
                                    : ""
                            }
                            ${
                                task.subtasks.length
                                    ? task.subtasks
                                          .map(
                                              (subtask) => `
                                    <div class="group/subtask flex items-start gap-3 ${subtask.done ? "opacity-60" : ""}">
                                        <button data-action="toggle-subtask" data-task-id="${task.id}" data-subtask-id="${subtask.id}" class="${
                                            subtask.done
                                                ? "w-4 h-4 rounded border border-stone-900 bg-stone-900 flex items-center justify-center mt-2"
                                                : "w-4 h-4 rounded border-2 border-stone-300 hover:border-stone-400 transition-colors mt-2"
                                        }" aria-label="${
                                            subtask.done ? "mark subtask incomplete" : "mark subtask complete"
                                        }" type="button">
                                            ${
                                                subtask.done
                                                    ? '<svg class="w-2.5 h-2.5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>'
                                                    : ""
                                            }
                                        </button>
                                        <input data-action="edit-subtask-title" data-task-id="${task.id}" data-subtask-id="${subtask.id}" aria-label="subtask title" class="flex-1 min-w-0 bg-transparent border-none outline-none p-0 pt-1.5 text-[14px] ${
                                            subtask.done ? "text-stone-500 line-through" : "text-stone-800"
                                        }" value="${escapeHtml(subtask.title)}">
                                        <button data-action="remove-subtask" data-task-id="${task.id}" data-subtask-id="${subtask.id}" class="opacity-0 pointer-events-none group-hover/subtask:opacity-100 group-hover/subtask:pointer-events-auto w-8 h-8 rounded-full flex items-center justify-center text-stone-400 hover:bg-stone-100 hover:text-stone-900 transition-all flex-shrink-0" aria-label="remove subtask" type="button">
                                            <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.25" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"></path><path d="M8 6V4h8v2"></path><path d="M19 6l-1 14H6L5 6"></path></svg>
                                        </button>
                                    </div>
                                `,
                                          )
                                          .join("")
                                    : '<div class="text-[14px] text-stone-400 lowercase">No subtasks yet.</div>'
                            }
                        </div>
                    </div>
                    <div class="h-8"></div>
                </div>
                <div class="w-full lg:w-[260px] border-t lg:border-t-0 lg:border-l border-stone-100 bg-stone-50/30 p-4 sm:p-6 flex flex-col gap-6 flex-shrink-0">
                    <div class="flex flex-col gap-5">
                        <div class="flex flex-col gap-2">
                            <label for="modalProjectSelect" class="text-[11px] font-semibold text-stone-400 lowercase tracking-wider">project</label>
                            <select id="modalProjectSelect" data-action="change-task-project" data-task-id="${task.id}" class="px-3 py-2 rounded-xl bg-white border border-stone-200 text-[13px] font-medium text-stone-700 outline-none focus:border-stone-400 lowercase">
                                ${renderProjectOptions(task, projects)}
                            </select>
                        </div>
                        <div class="flex flex-col gap-2">
                            <label for="modalDueDateInput" class="text-[11px] font-semibold text-stone-400 lowercase tracking-wider">due date</label>
                            <input id="modalDueDateInput" data-action="change-task-due-date" data-task-id="${task.id}" type="date" value="${task.dueAt || ""}" class="px-3 py-2 rounded-xl bg-white border border-dashed border-stone-300 text-[13px] font-medium text-stone-700 outline-none focus:border-stone-400">
                            <span class="text-[12px] text-stone-400 lowercase">${escapeHtml(dueLabel)}</span>
                        </div>
                        <div class="flex flex-col gap-2">
                            <label for="modalPrioritySelect" class="text-[11px] font-semibold text-stone-400 lowercase tracking-wider">priority</label>
                            <select id="modalPrioritySelect" data-action="change-task-priority" data-task-id="${task.id}" class="px-3 py-2 rounded-xl bg-white border border-dashed border-stone-300 text-[13px] font-medium text-stone-700 outline-none focus:border-stone-400 lowercase">
                                ${renderPriorityOptions(task)}
                            </select>
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
