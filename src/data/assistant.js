export const assistantIcons = {
    calendar:
        '<svg class="w-4 h-4 text-stone-400 group-hover:text-stone-900 transition-colors" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>',
    folder:
        '<svg class="w-4 h-4 text-stone-400 group-hover:text-stone-900 transition-colors" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg>',
    summary:
        '<svg class="w-4 h-4 text-stone-400 group-hover:text-stone-900 transition-colors" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>',
    prioritize:
        '<svg class="w-4 h-4 text-stone-400 group-hover:text-stone-900 transition-colors" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>',
    suggest:
        '<svg class="w-4 h-4 text-stone-400 group-hover:text-stone-900 transition-colors" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>',
    breakdown:
        '<svg class="w-4 h-4 text-stone-400 group-hover:text-stone-900 transition-colors" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="8" y1="6" x2="21" y2="6"></line><line x1="8" y1="12" x2="21" y2="12"></line><line x1="8" y1="18" x2="21" y2="18"></line><line x1="3" y1="6" x2="3.01" y2="6"></line><line x1="3" y1="12" x2="3.01" y2="12"></line><line x1="3" y1="18" x2="3.01" y2="18"></line></svg>',
    balance:
        '<svg class="w-4 h-4 text-stone-400 group-hover:text-stone-900 transition-colors" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>',
    reschedule:
        '<svg class="w-4 h-4 text-stone-400 group-hover:text-stone-900 transition-colors" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>',
};

export function createAssistantConfigs(initialInboxCount) {
    return {
        inbox: {
            title: "ai triage",
            senderLabel: "ai triage",
            quickActionsLabel: "quick triage actions",
            placeholder: "ask ai to help sort...",
            inputHint: "enter to send · shift+enter for new line",
            initialMessage: `You have ${initialInboxCount} items sitting in your inbox. Want me to draft some quick replies or suggest dates for them based on your calendar?`,
            quickActions: [
                { icon: "calendar", suggestion: "Batch schedule my inbox" },
                { icon: "folder", suggestion: "Suggest folders for these items" },
                { icon: "summary", suggestion: "Summarize what I missed" },
            ],
            defaultReply:
                "i'm ready to help you clear this out. ask me to batch schedule the inbox or suggest where each item belongs.",
        },
        today: {
            title: "ai assistant",
            senderLabel: "ai assistant",
            quickActionsLabel: "quick actions",
            inputHint: "enter to send · shift+enter for new line",
            placeholder: "ask anything about your tasks...",
            initialMessage:
                "Hi! I can help you manage your tasks, prioritize your day, or suggest what to tackle next. What would you like help with?",
            quickActions: [
                { icon: "prioritize", suggestion: "Prioritize my tasks for today" },
                { icon: "suggest", suggestion: "Suggest tasks I might be missing" },
                { icon: "breakdown", suggestion: "Break down my overdue task into steps" },
            ],
            defaultReply:
                "happy to help! try one of the quick actions above, or ask me to prioritize, suggest, or break down your tasks.",
        },
        upcoming: {
            title: "ai assistant",
            senderLabel: "ai assistant",
            quickActionsLabel: "quick actions",
            inputHint: "enter to send · shift+enter for new line",
            placeholder: "ask anything about your future tasks...",
            initialMessage:
                "Let's look ahead! I can help you balance your workload for the rest of the week or break down larger upcoming projects. What do you need?",
            quickActions: [
                { icon: "balance", suggestion: "Balance my workload for this week" },
                { icon: "reschedule", suggestion: "Reschedule overdue tasks" },
            ],
            defaultReply:
                "i can help balance the week, suggest a lighter task order, or flag what should move first.",
        },
    };
}

export function createInitialMessages(assistantConfigs) {
    return {
        inbox: [
            {
                sender: "assistant",
                text: assistantConfigs.inbox.initialMessage,
                rich: false,
                tasks: [],
            },
        ],
        today: [
            {
                sender: "assistant",
                text: assistantConfigs.today.initialMessage,
                rich: false,
                tasks: [],
            },
        ],
        upcoming: [
            {
                sender: "assistant",
                text: assistantConfigs.upcoming.initialMessage,
                rich: false,
                tasks: [],
            },
        ],
    };
}
