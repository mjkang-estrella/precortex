import { escapeHtml } from "../utils/text.js";

function getVoiceButtonMarkup(status) {
    if (status === "recording") {
        return `
            <svg class="w-4 h-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <rect x="7" y="7" width="10" height="10" rx="2"></rect>
            </svg>
        `;
    }

    if (status === "transcribing") {
        return `
            <svg class="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="2.2" opacity="0.25"></circle>
                <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"></path>
            </svg>
        `;
    }

    return `
        <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M12 3a3 3 0 0 1 3 3v6a3 3 0 1 1-6 0V6a3 3 0 0 1 3-3"></path>
            <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
            <line x1="12" y1="19" x2="12" y2="22"></line>
            <line x1="8" y1="22" x2="16" y2="22"></line>
        </svg>
    `;
}

function getVoiceStatusCopy(status) {
    if (status === "recording") return "listening...";
    if (status === "transcribing") return "transcribing voice note...";
    return "";
}

function isMutatingProposal(proposal) {
    return proposal.kind !== "start_task";
}

function renderSummaryCard(summary) {
    if (!summary) return "";

    return `
        <section class="rounded-[26px] border border-stone-200/80 bg-white px-4 py-4 shadow-sm">
            <div class="text-[11px] font-semibold uppercase tracking-[0.18em] text-stone-500">workspace brief</div>
            <div class="mt-2 text-[14px] leading-relaxed text-stone-800 lowercase">${escapeHtml(summary.headline)}</div>
            ${
                summary.focusLabel
                    ? `
                        <div class="mt-3 inline-flex items-center gap-2 rounded-full border border-stone-200 bg-stone-50 px-3 py-1.5 text-[12px] font-medium text-stone-700 lowercase">
                            <span class="w-1.5 h-1.5 rounded-full bg-stone-900"></span>
                            focus: ${escapeHtml(summary.focusLabel)}
                        </div>
                    `
                    : ""
            }
            <div class="mt-4 grid grid-cols-2 gap-2">
                <div class="rounded-2xl border border-stone-200 bg-stone-50 px-3 py-3">
                    <div class="text-[10px] font-semibold uppercase tracking-[0.16em] text-stone-400">overdue</div>
                    <div class="mt-1 text-[18px] font-semibold text-stone-900">${summary.overdueCount}</div>
                </div>
                <div class="rounded-2xl border border-stone-200 bg-stone-50 px-3 py-3">
                    <div class="text-[10px] font-semibold uppercase tracking-[0.16em] text-stone-400">due today</div>
                    <div class="mt-1 text-[18px] font-semibold text-stone-900">${summary.dueTodayCount}</div>
                </div>
                <div class="rounded-2xl border border-stone-200 bg-stone-50 px-3 py-3">
                    <div class="text-[10px] font-semibold uppercase tracking-[0.16em] text-stone-400">inbox</div>
                    <div class="mt-1 text-[18px] font-semibold text-stone-900">${summary.inboxCount}</div>
                </div>
                <div class="rounded-2xl border border-stone-200 bg-stone-50 px-3 py-3">
                    <div class="text-[10px] font-semibold uppercase tracking-[0.16em] text-stone-400">projects</div>
                    <div class="mt-1 text-[18px] font-semibold text-stone-900">${summary.activeProjectCount}</div>
                </div>
            </div>
            <div class="mt-4 flex flex-wrap gap-2">
                <button data-action="assistant-suggestion" data-suggestion="status brief" class="rounded-full border border-stone-200 bg-white px-3 py-1.5 text-[12px] font-medium text-stone-700 lowercase hover:border-stone-400 hover:text-stone-900 transition-colors" type="button">status brief</button>
                <button data-action="assistant-suggestion" data-suggestion="refine this task" class="rounded-full border border-stone-200 bg-white px-3 py-1.5 text-[12px] font-medium text-stone-700 lowercase hover:border-stone-400 hover:text-stone-900 transition-colors" type="button">refine this task</button>
                <button data-action="assistant-suggestion" data-suggestion="help me start" class="rounded-full border border-stone-200 bg-white px-3 py-1.5 text-[12px] font-medium text-stone-700 lowercase hover:border-stone-400 hover:text-stone-900 transition-colors" type="button">help me start</button>
            </div>
        </section>
    `;
}

function renderProposalDetails(proposal, context) {
    const task = context.taskMap.get(proposal.taskId);
    const project = proposal.kind === "project_move" && proposal.projectId
        ? context.projectMap.get(proposal.projectId)
        : null;

    if (proposal.kind === "task_refine") {
        return `
            <div class="flex flex-col gap-2">
                <div><span class="font-semibold text-stone-900">title</span> ${escapeHtml(proposal.title)}</div>
                <div><span class="font-semibold text-stone-900">description</span> ${escapeHtml(proposal.description || "no description")}</div>
            </div>
        `;
    }

    if (proposal.kind === "schedule_change") {
        return `
            <div class="flex flex-col gap-2">
                <div><span class="font-semibold text-stone-900">due</span> ${escapeHtml(proposal.dueAt || "unscheduled")}</div>
                <div><span class="font-semibold text-stone-900">priority</span> ${escapeHtml(proposal.priority)}</div>
            </div>
        `;
    }

    if (proposal.kind === "project_move") {
        return `<div><span class="font-semibold text-stone-900">destination</span> ${escapeHtml(project?.name || "inbox")}</div>`;
    }

    if (proposal.kind === "starter_subtasks") {
        return `
            <div class="flex flex-col gap-2">
                ${proposal.subtasks
                    .map(
                        (subtask, index) => `
                            <div class="rounded-xl border border-stone-200 bg-white px-3 py-2">
                                <span class="font-semibold text-stone-900">${index + 1}.</span> ${escapeHtml(subtask)}
                            </div>
                        `,
                    )
                    .join("")}
            </div>
        `;
    }

    return `
        <div class="flex flex-col gap-2">
            <div>${escapeHtml(proposal.brief)}</div>
            <div class="flex flex-col gap-2">
                ${proposal.firstSteps
                    .map(
                        (step, index) => `
                            <div class="rounded-xl border border-stone-200 bg-white px-3 py-2">
                                <span class="font-semibold text-stone-900">${index + 1}.</span> ${escapeHtml(step)}
                            </div>
                        `,
                    )
                    .join("")}
            </div>
            <div class="text-[12px] text-stone-500 lowercase">timebox: ${proposal.timeboxMinutes} minutes</div>
        </div>
    `;
}

function renderProposalCard(message, proposal, context) {
    if (proposal.status === "dismissed") return "";

    const task = context.taskMap.get(proposal.taskId);
    const targetLabel = task?.title || "task";
    const applied = proposal.status === "applied";

    return `
        <div class="rounded-[22px] border ${applied ? "border-emerald-200 bg-emerald-50/70" : "border-stone-200 bg-stone-50"} px-4 py-4">
            <div class="flex items-start justify-between gap-3">
                <div>
                    <div class="text-[10px] font-semibold uppercase tracking-[0.18em] text-stone-500">${escapeHtml(proposal.kind.replace(/_/g, " "))}</div>
                    <div class="mt-1 text-[14px] font-semibold text-stone-900">${escapeHtml(targetLabel)}</div>
                </div>
                ${
                    applied
                        ? '<span class="rounded-full bg-emerald-100 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-emerald-700">applied</span>'
                        : ""
                }
            </div>
            <div class="mt-3 text-[13px] leading-relaxed text-stone-700">${renderProposalDetails(proposal, context)}</div>
            <div class="mt-3 text-[12px] leading-relaxed text-stone-500 lowercase">${escapeHtml(proposal.reason)}</div>
            ${
                applied
                    ? ""
                    : `
                        <div class="mt-4 flex flex-wrap gap-2">
                            ${
                                isMutatingProposal(proposal)
                                    ? `
                                        <button data-action="assistant-apply-proposal" data-message-id="${message.id}" data-proposal-id="${proposal.id}" class="rounded-full bg-stone-900 px-3 py-1.5 text-[12px] font-medium text-white lowercase hover:bg-stone-700 transition-colors" type="button">
                                            apply
                                        </button>
                                    `
                                    : ""
                            }
                            <button data-action="assistant-dismiss-proposal" data-message-id="${message.id}" data-proposal-id="${proposal.id}" class="rounded-full border border-stone-200 bg-white px-3 py-1.5 text-[12px] font-medium text-stone-700 lowercase hover:border-stone-400 hover:text-stone-900 transition-colors" type="button">
                                dismiss
                            </button>
                        </div>
                    `
            }
        </div>
    `;
}

function renderMessages({ messages, senderLabel, aiMessages, summary, tasks, projects }) {
    const context = {
        taskMap: new Map((tasks || []).map((task) => [task.id, task])),
        projectMap: new Map((projects || []).map((project) => [project.id, project])),
    };

    aiMessages.innerHTML = `
        <div class="flex flex-col gap-4">
            ${renderSummaryCard(summary)}
            ${messages
                .map((message) => {
                    if (message.sender === "user") {
                        return `
                            <div class="flex flex-col items-end max-w-[90%] self-end">
                                <div class="text-[11px] font-semibold text-stone-500 mb-1.5 lowercase pr-1">you</div>
                                <div class="bg-stone-900 text-white px-5 py-3.5 rounded-[20px] rounded-tr-[4px] text-[14px] leading-relaxed">
                                    ${escapeHtml(message.text)}
                                </div>
                            </div>
                        `;
                    }

                    const visibleProposals = (message.proposals || []).filter((proposal) => proposal.status !== "dismissed");
                    const pendingMutatingProposals = visibleProposals.filter(
                        (proposal) => proposal.status !== "applied" && isMutatingProposal(proposal),
                    );
                    const body = message.rich
                        ? `
                            <div class="lowercase mb-3">${escapeHtml(message.text)}</div>
                            <div class="flex flex-col gap-2 mt-3">
                                ${message.tasks
                                    .map(
                                        (task) => `
                                            <div class="bg-white border border-stone-200/80 rounded-2xl p-3 flex items-center justify-between gap-3 shadow-sm">
                                                <span class="text-[13px] text-stone-700 font-medium">
                                                    ${
                                                        task.order
                                                            ? `<span class="text-stone-900 font-semibold">${escapeHtml(task.order)}</span> — `
                                                            : ""
                                                    }${escapeHtml(task.text)}
                                                </span>
                                                <div class="w-7 h-7 rounded-full bg-stone-50 flex items-center justify-center flex-shrink-0 text-stone-400 border border-stone-200/50">
                                                    <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                                                </div>
                                            </div>
                                        `,
                                    )
                                    .join("")}
                            </div>
                        `
                        : `<div class="lowercase">${escapeHtml(message.text)}</div>`;

                    return `
                        <div class="flex flex-col items-start max-w-[95%]">
                            <div class="text-[11px] font-semibold text-stone-500 mb-1.5 lowercase pl-1">${escapeHtml(senderLabel)}</div>
                            <div class="bg-stone-100 text-stone-800 px-5 py-4 rounded-3xl rounded-tl-[4px] text-[14px] leading-relaxed border border-stone-200/50 w-full">
                                ${
                                    message.summary?.headline
                                        ? `<div class="mb-3 inline-flex items-center rounded-full bg-white px-3 py-1 text-[11px] font-medium text-stone-600 lowercase border border-stone-200">${escapeHtml(message.summary.headline)}</div>`
                                        : ""
                                }
                                ${body}
                                ${
                                    visibleProposals.length
                                        ? `
                                            <div class="mt-4 flex flex-col gap-3">
                                                ${
                                                    pendingMutatingProposals.length > 1
                                                        ? `
                                                            <div class="flex justify-end">
                                                                <button data-action="assistant-apply-all-proposals" data-message-id="${message.id}" class="rounded-full border border-stone-300 bg-white px-3 py-1.5 text-[12px] font-medium text-stone-700 lowercase hover:border-stone-500 hover:text-stone-900 transition-colors" type="button">
                                                                    apply all drafts
                                                                </button>
                                                            </div>
                                                        `
                                                        : ""
                                                }
                                                ${visibleProposals
                                                    .map((proposal) => renderProposalCard(message, proposal, context))
                                                    .join("")}
                                            </div>
                                        `
                                        : ""
                                }
                            </div>
                        </div>
                    `;
                })
                .join("")}
        </div>
    `;

    aiMessages.scrollTop = aiMessages.scrollHeight;
}

export function renderAssistantPanel({
    config,
    messages,
    summary,
    tasks,
    projects,
    assistantIcons,
    voiceState,
    dom,
}) {
    dom.assistantTitle.textContent = config.title;
    dom.assistantQuickActionsLabel.textContent = config.quickActionsLabel;
    dom.assistantInputHint.textContent = config.inputHint;
    dom.assistantQuickActions.innerHTML = config.quickActions
        .map(
            (action) => `
            <button data-action="assistant-suggestion" data-suggestion="${escapeHtml(action.suggestion)}" class="w-full bg-white text-left px-4 py-3 rounded-2xl border border-stone-200 text-[13px] font-medium text-stone-700 hover:border-stone-400 hover:shadow-sm hover:text-stone-900 flex items-center gap-3 transition-all lowercase group" type="button">
                ${assistantIcons[action.icon]}
                ${escapeHtml(action.suggestion)}
            </button>
        `,
        )
        .join("");

    dom.aiInput.placeholder = config.placeholder;
    dom.aiInput.disabled = voiceState.status === "transcribing";
    dom.assistantSendButton.disabled = voiceState.status === "transcribing";
    dom.assistantVoiceButton.disabled = voiceState.status === "transcribing";
    dom.assistantVoiceButton.setAttribute(
        "aria-label",
        voiceState.status === "recording" ? "stop voice recording" : "start voice recording",
    );
    dom.assistantVoiceButton.setAttribute(
        "aria-pressed",
        voiceState.status === "recording" ? "true" : "false",
    );
    dom.assistantVoiceButton.className =
        voiceState.status === "recording"
            ? "w-9 h-9 flex-shrink-0 rounded-full bg-red-500 text-white flex items-center justify-center transition-all shadow-sm mb-0.5 scale-105"
            : "w-9 h-9 flex-shrink-0 rounded-full border border-stone-200 bg-stone-50 text-stone-500 flex items-center justify-center transition-all hover:border-stone-400 hover:text-stone-900 mb-0.5 disabled:cursor-not-allowed disabled:opacity-60";
    dom.assistantVoiceButton.innerHTML = getVoiceButtonMarkup(voiceState.status);
    dom.assistantVoiceStatus.textContent = getVoiceStatusCopy(voiceState.status);
    renderMessages({
        messages,
        senderLabel: config.senderLabel,
        aiMessages: dom.aiMessages,
        summary,
        tasks,
        projects,
    });
}
