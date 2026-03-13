import { runAssistant } from "./mock-ai.js";
import { getDefaultRoute, navigate, parseHash, routeToHash } from "./router.js";
import {
  addDraft,
  applyApprovalAction,
  closeMobileChrome,
  createAiDeliverable,
  createGoalPlan,
  dismissSignal,
  loadState,
  removeDraft,
  resetState,
  setEditingDeliverable,
  setGoalStatus,
  setUiFlag,
  toggleTaskCompletion,
  updateDraft,
} from "./store.js";
import { renderApp } from "./views.js";

let state = loadState();
let route = parseHash(window.location.hash, state);

const app = document.querySelector("#app");

function ensureHash() {
  const target = routeToHash(parseHash(window.location.hash, state));
  if (!window.location.hash) {
    navigate(getDefaultRoute(state));
    return;
  }

  if (window.location.hash !== target) {
    window.location.replace(target);
  }
}

function autoResize(textarea) {
  if (!textarea) {
    return;
  }

  textarea.style.height = "auto";
  textarea.style.height = `${textarea.scrollHeight}px`;
}

function afterRender() {
  app.querySelectorAll("textarea").forEach((element) => autoResize(element));

  const messages = app.querySelector("#aiMessages");
  if (messages) {
    messages.scrollTop = messages.scrollHeight;
  }
}

function render() {
  route = parseHash(window.location.hash, state);
  app.innerHTML = renderApp(state, route);
  afterRender();
}

function commit(nextState, options = {}) {
  state = nextState;
  if (options.navigate) {
    navigate(options.navigate);
    return;
  }

  render();
}

function onHashChange() {
  state = closeMobileChrome(state);
  render();
}

function handleAction(element) {
  const { action } = element.dataset;

  if (!action) {
    return;
  }

  if (action === "toggle-mobile-nav") {
    commit(setUiFlag(state, "mobileNavOpen", !state.ui.mobileNavOpen));
    return;
  }

  if (action === "toggle-ai-panel") {
    commit(setUiFlag(state, "aiOpen", !state.ui.aiOpen));
    return;
  }

  if (action === "close-chrome") {
    commit(closeMobileChrome(state));
    return;
  }

  if (action === "remove-draft") {
    commit(removeDraft(state, element.dataset.draftId));
    return;
  }

  if (action === "toggle-task") {
    commit(toggleTaskCompletion(state, element.dataset.taskId));
    return;
  }

  if (action === "request-goal-draft") {
    const goalId = element.dataset.goalId;
    commit(
      createAiDeliverable(state, goalId, `Draft the next best asset for this goal.`),
      { navigate: { name: "inbox" } },
    );
    return;
  }

  if (action === "toggle-goal-status") {
    commit(setGoalStatus(state, element.dataset.goalId, element.dataset.status));
    return;
  }

  if (action === "dismiss-signal") {
    commit(dismissSignal(state, element.dataset.signalId));
    return;
  }

  if (action === "approve-task") {
    commit(applyApprovalAction(state, element.dataset.taskId, "accept"));
    return;
  }

  if (action === "manual-task") {
    commit(applyApprovalAction(state, element.dataset.taskId, "do-it-myself"));
    return;
  }

  if (action === "skip-task") {
    commit(applyApprovalAction(state, element.dataset.taskId, "skip"));
    return;
  }

  if (action === "start-revision") {
    commit(setEditingDeliverable(state, element.dataset.deliverableId || null));
    return;
  }

  if (action === "cancel-revision") {
    commit(setEditingDeliverable(state, null));
    return;
  }

  if (action === "ai-suggestion") {
    commit(runAssistant(state, route, element.dataset.text || ""));
    return;
  }
}

function handleSubmit(form) {
  const formType = form.dataset.form;
  const data = new FormData(form);

  if (formType === "new-goal") {
    const title = String(data.get("title") || "").trim();
    if (!title) {
      return;
    }

    commit(addDraft(state, title));
    form.reset();
    return;
  }

  if (formType === "generate-plan") {
    const draftId = form.dataset.draftId;
    const draft = state.onboarding.drafts.find((item) => item.id === draftId);
    if (!draft) {
      return;
    }

    const title = draft.title?.trim();
    if (!title) {
      return;
    }

    commit(
      createGoalPlan(state, {
        draftId,
        title,
        outcome: String(data.get("outcome") || "").trim(),
        blockers: String(data.get("blockers") || "").trim(),
        horizon: String(data.get("horizon") || "90 days"),
        cadence: String(data.get("cadence") || "steady"),
      }),
      { navigate: { name: "inbox" } },
    );
    return;
  }

  if (formType === "revise-deliverable") {
    const taskId = form.dataset.taskId;
    const body = String(data.get("body") || "").trim();
    commit(applyApprovalAction(state, taskId, "revise", { body }));
    return;
  }

  if (formType === "ai-chat") {
    const message = String(data.get("message") || "").trim();
    if (!message) {
      return;
    }

    commit(runAssistant(state, route, message));
    return;
  }
}

app.addEventListener("click", (event) => {
  const element = event.target.closest("[data-action]");
  if (!element) {
    return;
  }

  event.preventDefault();
  handleAction(element);
});

app.addEventListener("submit", (event) => {
  const form = event.target.closest("form[data-form]");
  if (!form) {
    return;
  }

  event.preventDefault();
  handleSubmit(form);
});

app.addEventListener("input", (event) => {
  const target = event.target;

  if (target.matches("textarea")) {
    autoResize(target);
  }

  if (target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement || target instanceof HTMLSelectElement) {
    const draftId = target.dataset.draftId;
    const field = target.dataset.field;
    if (draftId && field) {
      state = updateDraft(state, draftId, field, target.value);
    }
  }
});

window.addEventListener("hashchange", onHashChange);

window.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && (state.ui.mobileNavOpen || state.ui.aiOpen)) {
    commit(closeMobileChrome(state));
  }
});

window.precortexResetDemo = () => {
  state = resetState();
  navigate(getDefaultRoute(state));
};

ensureHash();
render();
