import { formatters, parseLocalISODate } from "../utils/date.js";
import { escapeHtml } from "../utils/text.js";
function renderSetupMessages(messages) {
    return messages
        .map((message) => {
        if (message.sender === "user") {
            return `
                    <div class="flex justify-end">
                        <div class="max-w-[80%] rounded-[20px] rounded-tr-[6px] bg-stone-900 text-white px-4 py-3 text-[14px] leading-relaxed">
                            ${escapeHtml(message.text)}
                        </div>
                    </div>
                `;
        }
        return `
                <div class="flex justify-start">
                    <div class="max-w-[88%] rounded-[24px] rounded-tl-[6px] bg-stone-100 border border-stone-200/60 text-stone-800 px-4 py-3 text-[14px] leading-relaxed">
                        ${escapeHtml(message.text)}
                    </div>
                </div>
            `;
    })
        .join("");
}
function formatDraftDeadline(deadline) {
    if (!deadline)
        return "";
    if (!/^\d{4}-\d{2}-\d{2}$/.test(deadline))
        return "use a date like 2026-04-30";
    return formatters.modalDate.format(parseLocalISODate(deadline)).toLowerCase();
}
function renderReview(draft) {
    return `
        <div class="flex-1 overflow-y-auto p-8 flex flex-col gap-6">
            <div class="rounded-[24px] border border-stone-200 bg-stone-50/60 p-5">
                <div class="text-[11px] font-semibold uppercase tracking-[0.18em] text-stone-400 mb-2">bay draft</div>
                <p class="text-[14px] leading-relaxed text-stone-500 lowercase">
                    edit anything that feels wrong. Bay will create exactly what you confirm here.
                </p>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <label class="flex flex-col gap-2">
                    <span class="text-[11px] font-semibold uppercase tracking-[0.18em] text-stone-400">project name</span>
                    <input id="projectDraftName" class="rounded-2xl border border-stone-200 bg-white px-4 py-3 text-[14px] text-stone-900 outline-none focus:border-stone-400" value="${escapeHtml(draft.name)}">
                </label>
                <label class="flex flex-col gap-2">
                    <span class="text-[11px] font-semibold uppercase tracking-[0.18em] text-stone-400">deadline</span>
                    <input id="projectDraftDeadline" class="rounded-2xl border border-stone-200 bg-white px-4 py-3 text-[14px] text-stone-900 outline-none focus:border-stone-400" value="${escapeHtml(draft.deadline)}">
                    <span class="text-[12px] text-stone-400 lowercase">${escapeHtml(formatDraftDeadline(draft.deadline))}</span>
                </label>
            </div>
            <label class="flex flex-col gap-2">
                <span class="text-[11px] font-semibold uppercase tracking-[0.18em] text-stone-400">summary</span>
                <textarea id="projectDraftSummary" class="min-h-[120px] rounded-[24px] border border-stone-200 bg-white px-4 py-3 text-[14px] leading-relaxed text-stone-900 outline-none resize-none focus:border-stone-400">${escapeHtml(draft.summary)}</textarea>
            </label>
            <label class="flex flex-col gap-2">
                <span class="text-[11px] font-semibold uppercase tracking-[0.18em] text-stone-400">next step</span>
                <input id="projectDraftNextStep" class="rounded-2xl border border-stone-200 bg-white px-4 py-3 text-[14px] text-stone-900 outline-none focus:border-stone-400" value="${escapeHtml(draft.nextStep)}">
            </label>
            <div class="flex flex-col gap-3">
                <div class="text-[11px] font-semibold uppercase tracking-[0.18em] text-stone-400">starter tasks</div>
                ${draft.tasks
        .map((task, index) => `
                            <div class="rounded-[22px] border border-stone-200 bg-white px-4 py-3">
                                <div class="text-[11px] font-semibold uppercase tracking-[0.18em] text-stone-400 mb-2">${index === 0 ? "next step task" : `task ${index + 1}`}</div>
                                <input
                                    data-action="edit-project-draft-task"
                                    data-task-id="${task.id}"
                                    class="w-full bg-transparent border-none outline-none text-[14px] text-stone-900"
                                    value="${escapeHtml(task.title)}"
                                >
                            </div>
                        `)
        .join("")}
            </div>
        </div>
    `;
}
export function renderProjectSetupModal({ projectSetupModal, projectSetup }) {
    if (!projectSetup.open) {
        projectSetupModal.className = "hidden fixed inset-0 z-50 items-center justify-center p-6";
        projectSetupModal.innerHTML = "";
        return;
    }
    projectSetupModal.className = "fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6";
    projectSetupModal.innerHTML = `
        <div class="absolute inset-0 bg-stone-900/45 backdrop-blur-[2px] animate-backdrop" data-action="close-project-setup"></div>
        <div role="dialog" aria-modal="true" aria-label="project setup" class="relative z-10 w-full max-w-[920px] max-h-[90vh] overflow-hidden rounded-[28px] sm:rounded-[32px] border border-white bg-white shadow-modal animate-modal flex flex-col">
            <div class="px-4 py-4 sm:px-6 sm:py-5 border-b border-stone-100 flex flex-wrap items-center justify-between gap-3 bg-white">
                <div class="flex items-center gap-3 min-w-0">
                    <div class="w-9 h-9 rounded-full bg-stone-900 text-white flex items-center justify-center shadow-sm">
                        <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2a10 10 0 1 0 10 10"></path><path d="M12 8v4l3 3"></path><circle cx="19" cy="5" r="3" fill="currentColor" stroke="none"></circle></svg>
                    </div>
                    <div>
                        <div class="text-[15px] font-medium lowercase">bay project setup</div>
                        <div class="text-[12px] text-stone-400 lowercase">shape the project before it turns into tasks</div>
                    </div>
                </div>
                <div class="flex items-center gap-2">
                    <button data-action="restart-project-setup" class="px-3 py-2 rounded-xl text-[12px] font-medium border border-stone-200 text-stone-500 hover:text-stone-900 hover:border-stone-400 transition-colors lowercase" type="button">restart</button>
                    <button data-action="close-project-setup" aria-label="close project setup" class="w-8 h-8 flex items-center justify-center rounded-full bg-stone-100 text-stone-500 hover:bg-stone-200 hover:text-stone-900 transition-colors" type="button">
                        <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                    </button>
                </div>
            </div>
            ${projectSetup.phase === "review" && projectSetup.draft
        ? renderReview(projectSetup.draft)
        : `
                        <div class="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-stone-50/20">
                            <div class="flex flex-col gap-4">
                                ${renderSetupMessages(projectSetup.messages)}
                            </div>
                        </div>
                        <div class="border-t border-stone-100 p-4 bg-white">
                            <div class="group border border-stone-200 bg-white rounded-[24px] flex items-end p-1.5 focus-within:border-stone-500 focus-within:shadow-sm transition-all">
                                <textarea id="projectSetupInput" aria-label="reply to bay" class="flex-1 bg-transparent border-none outline-none text-[14px] placeholder-stone-400 text-stone-900 py-2.5 pl-4 pr-2 resize-none max-h-[120px] overflow-y-auto" rows="1" placeholder="answer bay..."></textarea>
                                <button data-action="send-project-setup" aria-label="send message" class="w-9 h-9 flex-shrink-0 rounded-full bg-stone-900 text-white flex items-center justify-center hover:scale-105 transition-transform shadow-sm mb-0.5 mr-0.5" type="button">
                                    <svg class="w-4 h-4 ml-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
                                </button>
                            </div>
                        </div>
                    `}
            ${projectSetup.phase === "review" && projectSetup.draft
        ? `
                        <div class="border-t border-stone-100 p-4 bg-white flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                            <button data-action="close-project-setup" class="px-4 py-3 rounded-2xl border border-stone-200 text-stone-500 hover:text-stone-900 hover:border-stone-400 transition-colors lowercase" type="button">
                                cancel
                            </button>
                            <div class="flex flex-col sm:flex-row sm:items-center gap-3 w-full sm:w-auto">
                                <button data-action="restart-project-setup" class="px-4 py-3 rounded-2xl border border-stone-200 text-stone-500 hover:text-stone-900 hover:border-stone-400 transition-colors lowercase" type="button">
                                    restart
                                </button>
                                <button data-action="confirm-project-draft" class="px-5 py-3 rounded-2xl bg-stone-900 text-white font-medium shadow-sm hover:bg-stone-800 transition-colors lowercase" type="button">
                                    create project
                                </button>
                            </div>
                        </div>
                    `
        : ""}
        </div>
    `;
}
