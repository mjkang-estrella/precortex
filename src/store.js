const STORAGE_KEY = "precortex.v1";
const clone =
  globalThis.structuredClone ??
  ((value) => JSON.parse(JSON.stringify(value)));

/**
 * @typedef {"active" | "paused"} GoalStatus
 * @typedef {"ai" | "user"} TaskType
 * @typedef {"todo" | "in_progress" | "needs_approval" | "done" | "rejected"} TaskStatus
 * @typedef {"pending" | "accepted" | "rejected" | "edited"} DeliverableStatus
 * @typedef {"urgent" | "trend"} SignalUrgency
 *
 * @typedef {Object} Goal
 * @property {string} id
 * @property {string} title
 * @property {GoalStatus} status
 * @property {string} summary
 * @property {number} progress
 * @property {string} createdAt
 *
 * @typedef {Object} Task
 * @property {string} id
 * @property {string} goalId
 * @property {string} title
 * @property {TaskType} type
 * @property {TaskStatus} status
 * @property {string | null} dueAt
 * @property {string[]} tags
 * @property {string | null} deliverableId
 *
 * @typedef {Object} Message
 * @property {string} id
 * @property {string} scope
 * @property {string | null} goalId
 * @property {"assistant" | "user"} role
 * @property {string} kind
 * @property {string} body
 * @property {string} createdAt
 *
 * @typedef {Object} Deliverable
 * @property {string} id
 * @property {string} taskId
 * @property {string} title
 * @property {string} body
 * @property {DeliverableStatus} status
 *
 * @typedef {Object} Signal
 * @property {string} id
 * @property {string} goalId
 * @property {SignalUrgency} urgency
 * @property {string} title
 * @property {string} recommendation
 * @property {string} status
 */

function now() {
  return new Date().toISOString();
}

function daysFromNow(offset) {
  const date = new Date();
  date.setHours(10, 0, 0, 0);
  date.setDate(date.getDate() + offset);
  return date.toISOString();
}

function createInitialState() {
  return {
    version: 1,
    meta: {
      nextId: 1,
      createdAt: now(),
      updatedAt: now(),
    },
    onboarding: {
      drafts: [],
    },
    goals: [],
    tasks: [],
    messages: [
      {
        id: "message-welcome",
        scope: "portfolio",
        goalId: null,
        role: "assistant",
        kind: "welcome",
        body:
          "I keep your goals moving. Add a goal, answer a few clarifying prompts, and I will queue a first-pass plan for approval.",
        createdAt: now(),
      },
    ],
    deliverables: [],
    signals: [],
    ui: {
      mobileNavOpen: false,
      aiOpen: false,
      editingDeliverableId: null,
    },
  };
}

export function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return createInitialState();
    }

    const parsed = JSON.parse(raw);
    return migrateState(parsed);
  } catch (error) {
    console.warn("Failed to load state, resetting demo.", error);
    return createInitialState();
  }
}

function migrateState(state) {
  const base = createInitialState();
  return {
    ...base,
    ...state,
    meta: {
      ...base.meta,
      ...(state.meta ?? {}),
      updatedAt: now(),
    },
    onboarding: {
      ...base.onboarding,
      ...(state.onboarding ?? {}),
    },
    ui: {
      ...base.ui,
      ...(state.ui ?? {}),
      mobileNavOpen: false,
      aiOpen: false,
    },
  };
}

export function persistState(state) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function resetState() {
  const initial = createInitialState();
  persistState(initial);
  return initial;
}

function createId(state, prefix) {
  const id = `${prefix}-${state.meta.nextId}`;
  state.meta.nextId += 1;
  return id;
}

function mutate(state, recipe) {
  const next = clone(state);
  recipe(next);
  next.meta.updatedAt = now();
  persistState(next);
  return next;
}

function refreshGoalProgress(state, goalId) {
  const goal = state.goals.find((item) => item.id === goalId);
  if (!goal) {
    return;
  }

  const relevant = state.tasks.filter(
    (task) => task.goalId === goalId && task.status !== "rejected",
  );

  if (!relevant.length) {
    goal.progress = 0;
    return;
  }

  const completed = relevant.filter((task) => task.status === "done").length;
  goal.progress = Math.round((completed / relevant.length) * 100);
}

function setSignalStatus(state, goalId, urgency, status) {
  state.signals
    .filter((signal) => signal.goalId === goalId && signal.urgency === urgency)
    .forEach((signal) => {
      signal.status = status;
    });
}

export function addDraft(state, title = "") {
  return mutate(state, (next) => {
    next.onboarding.drafts.unshift({
      id: createId(next, "draft"),
      title,
      outcome: "",
      horizon: "90 days",
      cadence: "steady",
      blockers: "",
      createdAt: now(),
    });
  });
}

export function updateDraft(state, draftId, field, value) {
  return mutate(state, (next) => {
    const draft = next.onboarding.drafts.find((item) => item.id === draftId);
    if (!draft) {
      return;
    }

    draft[field] = value;
  });
}

export function removeDraft(state, draftId) {
  return mutate(state, (next) => {
    next.onboarding.drafts = next.onboarding.drafts.filter(
      (draft) => draft.id !== draftId,
    );
  });
}

export function createGoalPlan(state, payload) {
  return mutate(state, (next) => {
    const goalId = createId(next, "goal");
    const firstGoal = next.goals.length === 0;
    const createdAt = now();
    const summary = `${payload.outcome || payload.title} with a ${payload.cadence} weekly pace over ${payload.horizon.toLowerCase()}.`;

    /** @type {Goal} */
    const goal = {
      id: goalId,
      title: payload.title,
      status: "active",
      summary,
      progress: 0,
      createdAt,
      horizon: payload.horizon,
      cadence: payload.cadence,
      blockers: payload.blockers,
      outcome: payload.outcome,
    };

    next.goals.push(goal);

    const planTaskId = createId(next, "task");
    const planDeliverableId = createId(next, "deliverable");
    const kickoffTaskId = createId(next, "task");
    const followUpTaskId = createId(next, "task");
    const templateTaskId = createId(next, "task");
    const templateDeliverableId = createId(next, "deliverable");

    /** @type {Task[]} */
    const tasks = [
      {
        id: planTaskId,
        goalId,
        title: `Review the first-pass plan for ${payload.title}`,
        type: "ai",
        status: "needs_approval",
        dueAt: daysFromNow(firstGoal ? -1 : 1),
        tags: ["Planning", "AI draft"],
        deliverableId: planDeliverableId,
        resolution: null,
      },
      {
        id: kickoffTaskId,
        goalId,
        title: `Start the first execution block for ${payload.title}`,
        type: "user",
        status: "todo",
        dueAt: daysFromNow(1),
        tags: ["Focus block"],
        deliverableId: null,
      },
      {
        id: followUpTaskId,
        goalId,
        title: `Confirm next milestone for ${payload.title}`,
        type: "user",
        status: "todo",
        dueAt: daysFromNow(4),
        tags: ["Milestone"],
        deliverableId: null,
      },
      {
        id: templateTaskId,
        goalId,
        title: `Approve the starter template for ${payload.title}`,
        type: "ai",
        status: "needs_approval",
        dueAt: daysFromNow(2),
        tags: ["Template", "AI draft"],
        deliverableId: templateDeliverableId,
        resolution: null,
      },
    ];

    /** @type {Deliverable[]} */
    const deliverables = [
      {
        id: planDeliverableId,
        taskId: planTaskId,
        title: `${payload.title} roadmap`,
        body: [
          `Outcome: ${payload.outcome || `Make measurable progress on ${payload.title}.`}`,
          `Cadence: ${payload.cadence} check-ins with one visible task completed each week.`,
          `First milestone: ship a first concrete win inside ${payload.horizon.toLowerCase()}.`,
          `Risk watch: ${payload.blockers || "Keep scope narrow and protect focus blocks."}`,
        ].join("\n"),
        status: "pending",
      },
      {
        id: templateDeliverableId,
        taskId: templateTaskId,
        title: `${payload.title} starter template`,
        body: [
          `1. Working definition of success for ${payload.title}`,
          "2. Weekly operating rhythm and review questions",
          "3. A reusable template for notes, updates, or outreach",
        ].join("\n"),
        status: "pending",
      },
    ];

    /** @type {Signal[]} */
    const signals = [
      {
        id: createId(next, "signal"),
        goalId,
        urgency: "trend",
        title: `${payload.title} needs a weekly review rhythm`,
        recommendation:
          "Bundle this goal into the next portfolio check-in and confirm the first milestone still fits your current bandwidth.",
        status: "open",
      },
    ];

    if (firstGoal) {
      signals.push({
        id: createId(next, "signal"),
        goalId,
        urgency: "urgent",
        title: `${payload.title} has an overdue approval`,
        recommendation:
          "Approve, revise, or reassign the first-pass plan before adding more work. The task is already past due.",
        status: "open",
      });
    }

    /** @type {Message[]} */
    const messages = [
      {
        id: createId(next, "message"),
        scope: "goal",
        goalId,
        role: "assistant",
        kind: "plan",
        body: `I turned ${payload.title} into a first-pass plan and queued it in Inbox for approval. Nothing will move forward until you accept, revise, do it yourself, or skip/reassign the draft work.`,
        createdAt: createdAt,
      },
      {
        id: createId(next, "message"),
        scope: "portfolio",
        goalId: null,
        role: "assistant",
        kind: "signal",
        body: `Added ${payload.title} to your active portfolio. I also scheduled a portfolio trend review so it shows up in the next check-in instead of interrupting you goal-by-goal.`,
        createdAt: createdAt,
      },
    ];

    next.tasks.push(...tasks);
    next.deliverables.push(...deliverables);
    next.signals.push(...signals);
    next.messages.push(...messages);
    next.onboarding.drafts = next.onboarding.drafts.filter(
      (draft) => draft.id !== payload.draftId,
    );

    refreshGoalProgress(next, goalId);
  });
}

export function createAiDeliverable(state, goalId, prompt) {
  return mutate(state, (next) => {
    const goal = next.goals.find((item) => item.id === goalId);
    if (!goal) {
      return;
    }

    const taskId = createId(next, "task");
    const deliverableId = createId(next, "deliverable");
    const createdAt = now();

    next.tasks.unshift({
      id: taskId,
      goalId,
      title: prompt || `Review a fresh AI draft for ${goal.title}`,
      type: "ai",
      status: "needs_approval",
      dueAt: daysFromNow(1),
      tags: ["AI draft", "Fresh"],
      deliverableId,
      resolution: null,
    });

    next.deliverables.push({
      id: deliverableId,
      taskId,
      title: `${goal.title} working draft`,
      body: [
        `Prompt: ${prompt || `Advance ${goal.title} with a concrete next step.`}`,
        `Next move: protect one focused block this week for the highest leverage step.`,
        `Support asset: use this draft as the starting point, then edit inline before accepting it.`,
      ].join("\n"),
      status: "pending",
    });

    next.messages.push({
      id: createId(next, "message"),
      scope: "goal",
      goalId,
      role: "assistant",
      kind: "deliverable",
      body: `I created a new draft for ${goal.title} and routed it to Inbox. Review it before it touches your active plan.`,
      createdAt,
    });

    refreshGoalProgress(next, goalId);
  });
}

export function toggleTaskCompletion(state, taskId) {
  return mutate(state, (next) => {
    const task = next.tasks.find((item) => item.id === taskId);
    if (!task || task.type !== "user") {
      return;
    }

    task.status = task.status === "done" ? "todo" : "done";
    refreshGoalProgress(next, task.goalId);
  });
}

export function updateTaskStatus(state, taskId, status) {
  return mutate(state, (next) => {
    const task = next.tasks.find((item) => item.id === taskId);
    if (!task) {
      return;
    }

    task.status = status;
    refreshGoalProgress(next, task.goalId);
  });
}

export function applyApprovalAction(state, taskId, action, payload = {}) {
  return mutate(state, (next) => {
    const task = next.tasks.find((item) => item.id === taskId);
    if (!task) {
      return;
    }

    const goal = next.goals.find((item) => item.id === task.goalId);
    const deliverable = next.deliverables.find(
      (item) => item.id === task.deliverableId,
    );

    if (!goal) {
      return;
    }

    if (action === "accept") {
      task.status = "done";
      if (deliverable) {
        deliverable.status = "accepted";
      }
    }

    if (action === "revise") {
      if (deliverable) {
        deliverable.body = payload.body?.trim() || deliverable.body;
        deliverable.status = "edited";
      }
      task.status = "needs_approval";
      task.resolution = "revised";
    }

    if (action === "do-it-myself") {
      if (deliverable) {
        deliverable.status = "rejected";
      }
      task.type = "user";
      task.deliverableId = null;
      task.status = "todo";
      task.tags = [...task.tags.filter((tag) => tag !== "AI draft"), "Manual"];
      task.resolution = "manual";
    }

    if (action === "skip") {
      if (deliverable) {
        deliverable.status = "rejected";
      }
      task.status = "rejected";
      task.resolution = "skipped";
    }

    next.ui.editingDeliverableId = null;

    if (task.status === "done") {
      setSignalStatus(next, goal.id, "urgent", "dismissed");
    }

    next.messages.push({
      id: createId(next, "message"),
      scope: "goal",
      goalId: goal.id,
      role: "assistant",
      kind: "approval",
      body:
        action === "accept"
          ? `Locked ${task.title}. I marked the AI draft done because you approved the final deliverable.`
          : action === "revise"
            ? `Stored your edits for ${task.title}. The revised draft is still waiting for final approval.`
            : action === "do-it-myself"
              ? `Converted ${task.title} into manual work. It is back in your active queue as a user task.`
              : `Removed ${task.title} from the active queue. It stays visible as rejected for history.`,
      createdAt: now(),
    });

    refreshGoalProgress(next, goal.id);
  });
}

export function setEditingDeliverable(state, deliverableId) {
  return mutate(state, (next) => {
    next.ui.editingDeliverableId = deliverableId;
  });
}

export function setGoalStatus(state, goalId, status) {
  return mutate(state, (next) => {
    const goal = next.goals.find((item) => item.id === goalId);
    if (!goal) {
      return;
    }

    goal.status = status;

    next.messages.push({
      id: createId(next, "message"),
      scope: "goal",
      goalId,
      role: "assistant",
      kind: "status",
      body:
        status === "paused"
          ? `${goal.title} is paused. I will keep the plan intact but suppress Today priorities and proactive signals until you resume it.`
          : `${goal.title} is active again. I restored its tasks and signals to the portfolio surfaces.`,
      createdAt: now(),
    });
  });
}

export function dismissSignal(state, signalId) {
  return mutate(state, (next) => {
    const signal = next.signals.find((item) => item.id === signalId);
    if (!signal) {
      return;
    }

    signal.status = "dismissed";
  });
}

export function appendMessage(state, message) {
  return mutate(state, (next) => {
    next.messages.push({
      id: createId(next, "message"),
      createdAt: now(),
      ...message,
    });
  });
}

export function setUiFlag(state, key, value) {
  return mutate(state, (next) => {
    next.ui[key] = value;
  });
}

export function closeMobileChrome(state) {
  return mutate(state, (next) => {
    next.ui.mobileNavOpen = false;
    next.ui.aiOpen = false;
  });
}

export function selectVisibleGoal(state, goalId) {
  const goal = state.goals.find((item) => item.id === goalId);
  if (!goal) {
    return null;
  }

  return goal;
}

export function getGoalTasks(state, goalId) {
  return state.tasks
    .filter((task) => task.goalId === goalId)
    .sort((left, right) => {
      const leftTime = left.dueAt ? new Date(left.dueAt).getTime() : Infinity;
      const rightTime = right.dueAt ? new Date(right.dueAt).getTime() : Infinity;
      return leftTime - rightTime;
    });
}

export function getPendingApprovals(state) {
  return state.tasks.filter((task) => task.status === "needs_approval");
}

export function getVisibleSignals(state, urgency) {
  return state.signals.filter((signal) => {
    const goal = state.goals.find((item) => item.id === signal.goalId);
    return (
      signal.urgency === urgency &&
      signal.status === "open" &&
      goal &&
      goal.status === "active"
    );
  });
}

export function getTodayTasks(state) {
  return state.tasks
    .filter((task) => {
      const goal = state.goals.find((item) => item.id === task.goalId);
      return (
        goal &&
        goal.status === "active" &&
        task.status !== "done" &&
        task.status !== "rejected" &&
        task.status !== "needs_approval"
      );
    })
    .sort((left, right) => {
      const leftTime = left.dueAt ? new Date(left.dueAt).getTime() : Infinity;
      const rightTime = right.dueAt ? new Date(right.dueAt).getTime() : Infinity;
      return leftTime - rightTime;
    });
}

export function getUpcomingTasks(state) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return state.tasks
    .filter((task) => {
      if (!task.dueAt || task.status === "done" || task.status === "rejected") {
        return false;
      }

      const goal = state.goals.find((item) => item.id === task.goalId);
      if (!goal || goal.status !== "active") {
        return false;
      }

      const due = new Date(task.dueAt);
      due.setHours(0, 0, 0, 0);
      return due.getTime() > today.getTime();
    })
    .sort((left, right) => new Date(left.dueAt) - new Date(right.dueAt));
}

export function getRouteMessages(state, route) {
  if (route.name === "goal" && route.goalId) {
    return state.messages.filter(
      (message) =>
        message.scope === "portfolio" ||
        message.goalId === route.goalId ||
        (message.scope === "goal" && message.goalId === route.goalId),
    );
  }

  if (route.name === "onboarding") {
    return state.messages.filter(
      (message) =>
        message.scope === "portfolio" ||
        message.scope === "onboarding" ||
        message.kind === "welcome",
    );
  }

  return state.messages.filter(
    (message) =>
      message.scope === "portfolio" ||
      message.scope === route.name ||
      message.kind === "welcome",
  );
}
