import { escapeHtml } from "../utils/text.js";

function renderMessages({ messages, senderLabel, aiMessages }) {
    aiMessages.innerHTML = messages
        .map((message) => {
            if (message.sender === "user") {
                return `
                    <div class="flex flex-col items-end max-w-[90%] self-end">
                        <div class="text-[11px] font-semibold text-stone-400 mb-1.5 lowercase pr-1">you</div>
                        <div class="bg-stone-900 text-white px-5 py-3.5 rounded-[20px] rounded-tr-[4px] text-[14px] leading-relaxed lowercase">
                            ${escapeHtml(message.text)}
                        </div>
                    </div>
                `;
            }

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
                : `<div class="lowercase">${message.text}</div>`;

            return `
                <div class="flex flex-col items-start max-w-[95%]">
                    <div class="text-[11px] font-semibold text-stone-400 mb-1.5 lowercase pl-1">${escapeHtml(senderLabel)}</div>
                    <div class="bg-stone-100 text-stone-800 px-5 py-4 rounded-[24px] rounded-tl-[4px] text-[14px] leading-relaxed border border-stone-200/50 w-full">
                        ${body}
                    </div>
                </div>
            `;
        })
        .join("");

    aiMessages.scrollTop = aiMessages.scrollHeight;
}

export function renderAssistantPanel({
    config,
    messages,
    assistantIcons,
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
    renderMessages({
        messages,
        senderLabel: config.senderLabel,
        aiMessages: dom.aiMessages,
    });
}

export function renderAssistantVisibility({ assistantOpen, assistantPanel, reopenAssistantButton }) {
    assistantPanel.classList.toggle("w-[340px]", assistantOpen);
    assistantPanel.classList.toggle("opacity-100", assistantOpen);
    assistantPanel.classList.toggle("translate-x-0", assistantOpen);
    assistantPanel.classList.toggle("scale-100", assistantOpen);
    assistantPanel.classList.toggle("border-white/60", assistantOpen);

    assistantPanel.classList.toggle("w-0", !assistantOpen);
    assistantPanel.classList.toggle("opacity-0", !assistantOpen);
    assistantPanel.classList.toggle("translate-x-6", !assistantOpen);
    assistantPanel.classList.toggle("scale-[0.98]", !assistantOpen);
    assistantPanel.classList.toggle("pointer-events-none", !assistantOpen);
    assistantPanel.classList.toggle("border-transparent", !assistantOpen);

    reopenAssistantButton.classList.toggle("opacity-0", assistantOpen);
    reopenAssistantButton.classList.toggle("translate-y-4", assistantOpen);
    reopenAssistantButton.classList.toggle("scale-90", assistantOpen);
    reopenAssistantButton.classList.toggle("pointer-events-none", assistantOpen);

    reopenAssistantButton.classList.toggle("opacity-100", !assistantOpen);
    reopenAssistantButton.classList.toggle("translate-y-0", !assistantOpen);
    reopenAssistantButton.classList.toggle("scale-100", !assistantOpen);
    reopenAssistantButton.classList.toggle("pointer-events-auto", !assistantOpen);
}
