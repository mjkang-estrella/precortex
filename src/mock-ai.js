import {
  appendMessage,
  createAiDeliverable,
  getGoalTasks,
  getTodayTasks,
  getVisibleSignals,
} from "./store.js";

function makePrioritySummary(state) {
  const tasks = getTodayTasks(state).slice(0, 3);
  if (!tasks.length) {
    return "You have no active execution tasks yet. Approve a draft in Inbox or add a new goal from onboarding.";
  }

  return tasks
    .map((task, index) => `${index + 1}. ${task.title}`)
    .join("\n");
}

function makeCheckInSummary(state) {
  const trendSignals = getVisibleSignals(state, "trend");
  if (!trendSignals.length) {
    return "Portfolio trend check-in is clear. No slow-burn signals need attention right now.";
  }

  return trendSignals
    .map((signal) => `- ${signal.title}: ${signal.recommendation}`)
    .join("\n");
}

function makeGoalBreakdown(state, route) {
  if (route.name !== "goal" || !route.goalId) {
    return null;
  }

  const tasks = getGoalTasks(state, route.goalId)
    .filter((task) => task.status !== "done" && task.status !== "rejected")
    .slice(0, 3);

  if (!tasks.length) {
    return "This goal is clear for now. The next useful move is to request a fresh AI draft or resume manual work.";
  }

  return tasks.map((task) => `- ${task.title}`).join("\n");
}

export function suggestionsForRoute(route) {
  if (route.name === "goal") {
    return [
      "Draft the next deliverable",
      "Break this goal into smaller steps",
      "What is blocking progress here?",
    ];
  }

  if (route.name === "onboarding") {
    return [
      "What makes a strong goal brief?",
      "How should I pace this goal?",
      "What happens after I generate a plan?",
    ];
  }

  if (route.name === "checkin") {
    return [
      "Summarize my portfolio risks",
      "What should I pause?",
      "What needs a deeper review?",
    ];
  }

  return [
    "Prioritize my active work",
    "What needs approval first?",
    "Summarize my portfolio risks",
  ];
}

export function runAssistant(state, route, text) {
  const normalized = text.trim().toLowerCase();
  let nextState = appendMessage(state, {
    scope: route.name === "goal" ? "goal" : route.name,
    goalId: route.goalId ?? null,
    role: "user",
    kind: "chat",
    body: text.trim(),
  });

  let reply = "I can help prioritize, draft, or surface blockers. Try asking for a draft, a breakdown, or a portfolio summary.";

  if (normalized.includes("priorit")) {
    reply = `Today, I would focus on:\n${makePrioritySummary(nextState)}`;
  } else if (normalized.includes("approval")) {
    const approvals = nextState.tasks.filter(
      (task) => task.status === "needs_approval",
    );
    reply = approvals.length
      ? approvals
          .slice(0, 3)
          .map((task, index) => `${index + 1}. ${task.title}`)
          .join("\n")
      : "Inbox is clear. There are no pending AI approvals right now.";
  } else if (
    normalized.includes("risk") ||
    normalized.includes("check-in") ||
    normalized.includes("check in")
  ) {
    reply = makeCheckInSummary(nextState);
  } else if (
    route.name === "goal" &&
    (normalized.includes("draft") ||
      normalized.includes("write") ||
      normalized.includes("deliverable"))
  ) {
    nextState = createAiDeliverable(
      nextState,
      route.goalId,
      `Draft requested in chat: ${text.trim()}`,
    );
    reply =
      "I created a fresh AI draft and routed it to Inbox. Review it there before it enters the plan.";
  } else if (
    normalized.includes("break") ||
    normalized.includes("smaller steps") ||
    normalized.includes("block")
  ) {
    reply =
      makeGoalBreakdown(nextState, route) ??
      "Pick a goal workspace first and I will break the work into smaller steps.";
  }

  nextState = appendMessage(nextState, {
    scope: route.name === "goal" ? "goal" : route.name,
    goalId: route.goalId ?? null,
    role: "assistant",
    kind: "chat",
    body: reply,
  });

  return nextState;
}
