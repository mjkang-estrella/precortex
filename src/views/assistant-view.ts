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

function renderMessages({ messages, senderLabel, aiMessages }) {
    aiMessages.innerHTML = messages
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
                    <div class="text-[11px] font-semibold text-stone-500 mb-1.5 lowercase pl-1">${escapeHtml(senderLabel)}</div>
                    <div class="bg-stone-100 text-stone-800 px-5 py-4 rounded-3xl rounded-tl-[4px] text-[14px] leading-relaxed border border-stone-200/50 w-full">
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
    });
}
