import { getInboxCount, getTodayTasks } from "../state/selectors.js";
import { TODAY_ISO } from "../utils/date.js";

export function renderDemoGuide(state, canUndo) {
    const remaining = getInboxCount(state);
    const planned = getTodayTasks(state).length;
    return `<div class="demo-guide">
        <div class="demo-guide-top"><strong>Demo workspace</strong><a href="/">Exit demo</a></div>
        <p>Fictional tasks. Changes stay in this tab's memory and disappear on reload. Nothing is saved to an account.</p>
        <nav class="demo-steps" aria-label="Demo walkthrough">
            <button data-action="demo-view" data-view="inbox" aria-current="${state.currentView === "inbox" ? "step" : "false"}">1. Review inbox <span>${remaining}</span></button>
            <button data-action="demo-review">2. Decide priorities</button>
            <button data-action="demo-view" data-view="today" aria-current="${state.currentView === "today" ? "step" : "false"}">3. See today <span>${planned}</span></button>
        </nav>
        <div class="demo-guide-actions"><button data-action="demo-undo" ${canUndo ? "" : "disabled"}>Undo last change</button><button data-action="demo-reset">Reset demo</button><a href="/?login=1">Use my own workspace</a></div>
        ${!remaining ? `<p class="demo-progress">Inbox reviewed. Check Today to see what you chose to work on.</p>` : ""}
    </div>`;
}

export function renderDemoAssistant(state) {
    const task = state.tasks.find((item) => item.id === "demo-venue");
    const applied = task?.priority === "high" && task?.dueAt === TODAY_ISO;
    const hasBreakdown = task?.subtasks.length > 0;
    return `<div class="demo-assistant">
        <h2 class="font-display text-2xl">A plan you can question.</h2>
        <p class="demo-example-label">Prewritten example · No live AI call</p>
        <p>For the fictional workshop, start with <strong>Confirm the workshop venue</strong>.</p>
        <dl><dt>Suggested priority</dt><dd>High · Today</dd><dt>Why this comes first</dt><dd>The room hold expires tomorrow. Confirming it unblocks the invitations, while the reading can wait.</dd></dl>
        <p>You decide. Apply this example, open the task to change its priority or date, or keep your own plan.</p>
        <button class="demo-primary" data-action="demo-apply" ${!task || applied ? "disabled" : ""}>${applied ? "Example applied" : "Apply example plan"}</button>
        <button data-action="demo-edit" ${task ? "" : "disabled"}>Edit priority and date</button>
        <div class="demo-breakdown"><h3>Make the first step smaller</h3><p>Example subtasks: check room capacity and time, then ask the coordinator to confirm.</p><button data-action="demo-breakdown" ${!task || hasBreakdown ? "disabled" : ""}>${hasBreakdown ? "Subtasks already added" : "Add example subtasks"}</button></div>
        <p class="demo-limit">The account assistant supports live planning suggestions when its AI provider is configured. Voice and new-project AI setup are outside this demo.</p>
    </div>`;
}
