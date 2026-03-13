import { suggestionsForRoute } from "./mock-ai.js";
import { routeToHash } from "./router.js";
import {
  getGoalTasks,
  getPendingApprovals,
  getRouteMessages,
  getTodayTasks,
  getUpcomingTasks,
  getVisibleSignals,
} from "./store.js";

function escapeHtml(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function nl2br(value = "") {
  return escapeHtml(value).replaceAll("\n", "<br />");
}

function formatShortDate(value) {
  if (!value) {
    return "No date";
  }

  const now = new Date();
  now.setHours(0, 0, 0, 0);

  const date = new Date(value);
  date.setHours(0, 0, 0, 0);

  const diff = Math.round((date.getTime() - now.getTime()) / 86400000);

  if (diff === 0) {
    return "Today";
  }

  if (diff === 1) {
    return "Tomorrow";
  }

  if (diff === -1) {
    return "Yesterday";
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
  }).format(date);
}

function isOverdue(value) {
  if (!value) {
    return false;
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const date = new Date(value);
  date.setHours(0, 0, 0, 0);
  return date.getTime() < today.getTime();
}

function icon(name) {
  const icons = {
    menu:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>',
    spark:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>',
    inbox:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 12h-6l-2 3h-4l-2-3H2"></path><path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11Z"></path></svg>',
    calendar:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 2v4"></path><path d="M16 2v4"></path><rect x="3" y="4" width="18" height="18" rx="2"></rect><path d="M3 10h18"></path></svg>',
    clock:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M12 6v6l4 2"></path></svg>',
    folder:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg>',
    plus:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>',
    check:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"></path></svg>',
    pause:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><line x1="9" y1="5" x2="9" y2="19"></line><line x1="15" y1="5" x2="15" y2="19"></line></svg>',
    play:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polygon points="6 3 20 12 6 21 6 3"></polygon></svg>',
    message:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>',
    send:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>',
    chevron:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"></path></svg>',
    close:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>',
    alert:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>',
    wand:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m3 21 9-9"></path><path d="M14.5 4.5 19.5 9.5"></path><path d="m12 6 1-3 3-1-1 3-3 1Z"></path><path d="m3 12 3-1 1-3-3 1-1 3Z"></path><path d="m18 15 1-3 3-1-1 3-3 1Z"></path></svg>',
    review:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 11 3 3L22 4"></path><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path></svg>',
  };

  return icons[name] || "";
}

function renderBadge(count) {
  if (!count) {
    return "";
  }

  return `<span class="nav-badge">${count}</span>`;
}

function renderPill(label, tone = "default") {
  return `<span class="pill pill-${tone}">${escapeHtml(label)}</span>`;
}

function renderNavLink({ route, label, iconName, active, count }) {
  return `
    <a href="${routeToHash(route)}" class="nav-item ${active ? "active" : ""}">
      ${icon(iconName)}
      <span>${escapeHtml(label)}</span>
      ${renderBadge(count)}
    </a>
  `;
}

function renderSidebar(state, route) {
  const pendingApprovals = getPendingApprovals(state).length;
  const todayTasks = getTodayTasks(state).length;
  const upcomingTasks = getUpcomingTasks(state).length;
  const goals = [...state.goals].sort((left, right) => {
    if (left.status === right.status) {
      return new Date(left.createdAt) - new Date(right.createdAt);
    }

    return left.status === "active" ? -1 : 1;
  });

  return `
    <aside class="sidebar">
      <div class="sidebar-header">
        <div class="avatar">P</div>
        <div class="workspace-stack">
          <div class="workspace-name">Precortex</div>
          <div class="workspace-subtitle">Goal portfolio workspace</div>
        </div>
        <button class="icon-ghost mobile-only" data-action="toggle-mobile-nav" aria-label="Close navigation">
          ${icon("close")}
        </button>
      </div>

      <nav class="nav-section">
        ${renderNavLink({
          route: { name: "inbox" },
          label: "Inbox",
          iconName: "inbox",
          active: route.name === "inbox",
          count: pendingApprovals,
        })}
        ${renderNavLink({
          route: { name: "today" },
          label: "Today",
          iconName: "calendar",
          active: route.name === "today",
          count: todayTasks,
        })}
        ${renderNavLink({
          route: { name: "upcoming" },
          label: "Upcoming",
          iconName: "clock",
          active: route.name === "upcoming",
          count: upcomingTasks,
        })}
        ${renderNavLink({
          route: { name: "checkin" },
          label: "Check-in",
          iconName: "spark",
          active: route.name === "checkin",
          count: getVisibleSignals(state, "trend").length,
        })}
      </nav>

      <div class="nav-section">
        <div class="section-title">Goals</div>
        ${
          goals.length
            ? goals
                .map(
                  (goal) => `
                    <a href="${routeToHash({ name: "goal", goalId: goal.id })}" class="goal-link ${route.name === "goal" && route.goalId === goal.id ? "active" : ""}">
                      <div class="goal-link-head">
                        ${icon("folder")}
                        <span>${escapeHtml(goal.title)}</span>
                      </div>
                      <div class="goal-link-meta">
                        ${renderPill(`${goal.progress}%`, "subtle")}
                        ${goal.status === "paused" ? renderPill("Paused", "warning") : ""}
                      </div>
                    </a>
                  `,
                )
                .join("")
            : '<div class="empty-inline">No goals yet. Start from onboarding.</div>'
        }
        <a href="#/onboarding" class="nav-item nav-item-muted">
          ${icon("plus")}
          <span>Add a goal</span>
        </a>
      </div>
    </aside>
  `;
}

function renderViewHeader({ eyebrow, title, subtitle, actions = "" }) {
  return `
    <header class="view-header">
      <div class="view-title-group">
        <button class="btn-icon-only mobile-toggle" data-action="toggle-mobile-nav" aria-label="Open navigation">
          ${icon("menu")}
        </button>
        <div>
          ${eyebrow ? `<div class="eyebrow">${escapeHtml(eyebrow)}</div>` : ""}
          <h1 class="view-title">${escapeHtml(title)}</h1>
          ${subtitle ? `<p class="view-subtitle">${escapeHtml(subtitle)}</p>` : ""}
        </div>
      </div>
      <div class="header-actions">
        ${actions}
        <button class="btn-icon-only mobile-toggle" data-action="toggle-ai-panel" aria-label="Open AI panel">
          ${icon("message")}
        </button>
      </div>
    </header>
  `;
}

function renderMetrics(state) {
  const activeGoals = state.goals.filter((goal) => goal.status === "active").length;
  const approvals = getPendingApprovals(state).length;
  const activeTasks = getTodayTasks(state).length;

  return `
    <div class="metrics-grid">
      <div class="surface-card metric-card">
        <div class="metric-label">Active goals</div>
        <div class="metric-value">${activeGoals}</div>
        <div class="metric-note">Visible across the portfolio dashboard</div>
      </div>
      <div class="surface-card metric-card">
        <div class="metric-label">Pending approvals</div>
        <div class="metric-value">${approvals}</div>
        <div class="metric-note">AI drafts waiting for your decision</div>
      </div>
      <div class="surface-card metric-card">
        <div class="metric-label">Active tasks</div>
        <div class="metric-value">${activeTasks}</div>
        <div class="metric-note">Manual work currently visible in Today</div>
      </div>
    </div>
  `;
}

function renderSignalCard(signal, goal) {
  return `
    <article class="surface-card signal-card ${signal.urgency === "urgent" ? "signal-urgent" : "signal-trend"}">
      <div class="signal-card-head">
        <div>
          <div class="eyebrow">${signal.urgency === "urgent" ? "Urgent signal" : "Trend signal"}</div>
          <h3>${escapeHtml(signal.title)}</h3>
        </div>
        ${renderPill(goal?.title || "Portfolio", signal.urgency === "urgent" ? "warning" : "subtle")}
      </div>
      <p>${escapeHtml(signal.recommendation)}</p>
      <div class="surface-actions">
        ${
          signal.urgency === "urgent"
            ? `<a class="btn-surface" href="${routeToHash({ name: "goal", goalId: signal.goalId })}">${icon("review")}Open goal</a>`
            : `<a class="btn-surface" href="#/checkin">${icon("spark")}Review in check-in</a>`
        }
        <button class="btn-ghost" data-action="dismiss-signal" data-signal-id="${signal.id}">Dismiss</button>
      </div>
    </article>
  `;
}

function renderTaskRow(task, goal, options = {}) {
  const showGoal = options.showGoal ?? false;
  const showReview = task.status === "needs_approval";
  const isCompleted = task.status === "done";
  const overdue = isOverdue(task.dueAt) && !isCompleted;

  return `
    <div class="task-row ${isCompleted ? "completed" : ""}">
      <div class="checkbox-wrapper">
        ${
          task.type === "user"
            ? `
              <button
                class="checkbox ${isCompleted ? "checked" : ""}"
                data-action="toggle-task"
                data-task-id="${task.id}"
                aria-label="${isCompleted ? "Mark task as todo" : "Mark task as done"}"
              >
                <span class="checkbox-inner">${isCompleted ? icon("check") : ""}</span>
              </button>
            `
            : `<div class="task-ai-glyph">${icon("spark")}</div>`
        }
      </div>
      <div class="task-content">
        <div class="task-title">${escapeHtml(task.title)}</div>
        <div class="task-details">
          ${
            showGoal && goal
              ? `<span class="task-date">${icon("folder")} ${escapeHtml(goal.title)}</span>`
              : ""
          }
          ${
            task.dueAt
              ? `<span class="task-date ${overdue ? "overdue" : ""}">${icon("calendar")} ${escapeHtml(formatShortDate(task.dueAt))}</span>`
              : ""
          }
          ${task.tags.map((tag) => renderPill(tag, "subtle")).join("")}
          ${task.type === "ai" ? renderPill("AI work", "highlight") : ""}
          ${goal?.status === "paused" ? renderPill("Paused goal", "warning") : ""}
        </div>
      </div>
      <div class="task-actions">
        ${
          showReview
            ? `<a class="btn-action-text" href="#/inbox">Review</a>`
            : task.status === "done"
              ? renderPill("Done", "success")
              : renderPill(task.status.replaceAll("_", " "), "subtle")
        }
      </div>
    </div>
  `;
}

function renderEmptyState(title, body, actionLabel, actionRoute) {
  return `
    <div class="surface-card empty-state">
      <div class="empty-icon">${icon("spark")}</div>
      <h3>${escapeHtml(title)}</h3>
      <p>${escapeHtml(body)}</p>
      ${
        actionLabel && actionRoute
          ? `<a class="btn-surface" href="${actionRoute}">${icon("plus")}${escapeHtml(actionLabel)}</a>`
          : ""
      }
    </div>
  `;
}

function renderOnboarding(state) {
  const drafts = state.onboarding.drafts;
  const actions = state.goals.length
    ? `<a class="btn-surface" href="#/today">${icon("calendar")}Go to Today</a>`
    : "";

  return `
    ${renderViewHeader({
      eyebrow: "Onboarding",
      title: "Build your first goal portfolio",
      subtitle:
        "Add a goal, answer a few clarifying questions, and I will queue a first-pass plan for approval without changing the existing visual language.",
      actions,
    })}
    <section class="surface-card hero-card">
      <div class="hero-copy">
        <div class="eyebrow">Collaborative planning</div>
        <h2>One goal at a time. Approval stays with you.</h2>
        <p>
          Each goal becomes a dedicated workspace, a set of atomic tasks, and a
          review queue for AI-generated work. Nothing moves to done until you
          approve it.
        </p>
      </div>
      <form class="hero-form" data-form="new-goal">
        <label class="form-label" for="goal-title">Add a goal</label>
        <div class="input-container input-container-tight">
          ${icon("plus")}
          <input id="goal-title" name="title" class="task-input" placeholder="Ship a portfolio site, train for a half marathon, plan a launch..." />
        </div>
        <button class="btn-surface" type="submit">${icon("spark")}Start clarifying</button>
      </form>
    </section>

    <section class="split-grid">
      <div class="stack-lg">
        ${
          drafts.length
            ? drafts
                .map(
                  (draft) => `
                    <form class="surface-card draft-card" data-form="generate-plan" data-draft-id="${draft.id}">
                      <div class="draft-card-head">
                        <div>
                          <div class="eyebrow">Draft goal brief</div>
                          <h3>${escapeHtml(draft.title || "Untitled goal")}</h3>
                        </div>
                        <button class="btn-ghost" type="button" data-action="remove-draft" data-draft-id="${draft.id}">Remove</button>
                      </div>
                      <div class="field-grid">
                        <label class="field-block">
                          <span>What outcome matters most?</span>
                          <textarea
                            name="outcome"
                            data-draft-id="${draft.id}"
                            data-field="outcome"
                            rows="3"
                            class="surface-input"
                            placeholder="Describe the concrete result you want."
                          >${escapeHtml(draft.outcome || "")}</textarea>
                        </label>
                        <label class="field-block">
                          <span>What could slow this down?</span>
                          <textarea
                            name="blockers"
                            data-draft-id="${draft.id}"
                            data-field="blockers"
                            rows="3"
                            class="surface-input"
                            placeholder="Time limits, uncertainty, competing priorities..."
                          >${escapeHtml(draft.blockers || "")}</textarea>
                        </label>
                        <label class="field-block">
                          <span>Planning horizon</span>
                          <select name="horizon" data-draft-id="${draft.id}" data-field="horizon" class="surface-input">
                            ${["30 days", "60 days", "90 days", "6 months"].map(
                              (option) =>
                                `<option value="${option}" ${draft.horizon === option ? "selected" : ""}>${option}</option>`,
                            )}
                          </select>
                        </label>
                        <label class="field-block">
                          <span>Preferred pace</span>
                          <select name="cadence" data-draft-id="${draft.id}" data-field="cadence" class="surface-input">
                            ${["steady", "aggressive", "light-touch"].map(
                              (option) =>
                                `<option value="${option}" ${draft.cadence === option ? "selected" : ""}>${option}</option>`,
                            )}
                          </select>
                        </label>
                      </div>
                      <div class="surface-actions">
                        <button class="btn-surface" type="submit">${icon("wand")}Generate AI plan</button>
                        <div class="support-note">This creates a goal workspace and sends the draft tasks to Inbox for approval.</div>
                      </div>
                    </form>
                  `,
                )
                .join("")
            : renderEmptyState(
                "No draft goals yet",
                "Use the add goal input above to start a goal brief. The clarifying prompts live here in the main workspace while the AI panel keeps context.",
                null,
                null,
              )
        }
      </div>
      <div class="stack-lg">
        <div class="surface-card checklist-card">
          <div class="eyebrow">What happens next</div>
          <ol class="simple-list">
            <li>You define the goal and the outcome.</li>
            <li>The AI turns that into atomic tasks and starter deliverables.</li>
            <li>Those AI drafts land in Inbox for approval, revision, manual takeover, or reassignment.</li>
          </ol>
        </div>
        ${
          state.goals.length
            ? `
              <div class="surface-card">
                <div class="eyebrow">Active portfolio</div>
                <div class="goal-summary-list">
                  ${state.goals
                    .map(
                      (goal) => `
                        <a class="goal-summary-row" href="${routeToHash({ name: "goal", goalId: goal.id })}">
                          <div>
                            <strong>${escapeHtml(goal.title)}</strong>
                            <p>${escapeHtml(goal.summary)}</p>
                          </div>
                          ${renderPill(`${goal.progress}%`, "subtle")}
                        </a>
                      `,
                    )
                    .join("")}
                </div>
              </div>
            `
            : ""
        }
      </div>
    </section>
  `;
}

function renderToday(state) {
  const todayTasks = getTodayTasks(state);

  return `
    ${renderViewHeader({
      eyebrow: "Portfolio dashboard",
      title: "Today",
      subtitle:
        "See the execution work that matters across active goals. AI approvals and urgent notifications stay in Inbox so this view stays focused on doing.",
      actions: `<a class="btn-surface" href="#/inbox">${icon("inbox")}Review Inbox</a>`,
    })}
    ${renderMetrics(state)}
    <section class="stack-lg">
      <div class="section-row">
        <div>
          <div class="section-title-large">Priority tasks</div>
          <p class="section-copy">Only active manual work appears here. AI drafts and urgent notifications stay in Inbox until you resolve them.</p>
        </div>
      </div>
      ${
        todayTasks.length
          ? todayTasks
              .map((task) =>
                renderTaskRow(
                  task,
                  state.goals.find((goal) => goal.id === task.goalId),
                  { showGoal: true },
                ),
              )
              .join("")
          : renderEmptyState(
              "No active execution tasks",
              "Approve an AI draft or add a new goal to populate Today.",
              "Add goal",
              "#/onboarding",
            )
      }
    </section>
  `;
}

function renderGoalWorkspace(state, route) {
  const goal = state.goals.find((item) => item.id === route.goalId);
  if (!goal) {
    return renderEmptyState(
      "Goal not found",
      "The requested goal workspace does not exist.",
      "Return to Today",
      "#/today",
    );
  }

  const tasks = getGoalTasks(state, goal.id);
  const pending = tasks.filter((task) => task.status === "needs_approval");
  const active = tasks.filter(
    (task) =>
      task.status !== "needs_approval" &&
      task.status !== "done" &&
      task.status !== "rejected",
  );
  const completed = tasks.filter((task) => task.status === "done");
  const archived = tasks.filter((task) => task.status === "rejected");
  const recentMessages = getRouteMessages(state, route)
    .filter((message) => message.goalId === goal.id)
    .slice(-4)
    .reverse();

  return `
    ${renderViewHeader({
      eyebrow: goal.status === "paused" ? "Paused goal" : "Goal workspace",
      title: goal.title,
      subtitle: goal.summary,
      actions: `
        <button class="btn-surface" data-action="request-goal-draft" data-goal-id="${goal.id}">
          ${icon("wand")}Request AI draft
        </button>
        <button class="btn-surface" data-action="toggle-goal-status" data-goal-id="${goal.id}" data-status="${goal.status === "active" ? "paused" : "active"}">
          ${goal.status === "active" ? icon("pause") : icon("play")}
          ${goal.status === "active" ? "Pause goal" : "Resume goal"}
        </button>
      `,
    })}
    <section class="split-grid split-grid-tight">
      <div class="surface-card goal-focus-card">
        <div class="eyebrow">Progress</div>
        <div class="progress-row">
          <div class="progress-value">${goal.progress}%</div>
          <div class="progress-copy">
            <p><strong>Outcome:</strong> ${escapeHtml(goal.outcome || goal.title)}</p>
            <p><strong>Pace:</strong> ${escapeHtml(goal.cadence)} cadence over ${escapeHtml(goal.horizon)}</p>
            <p><strong>Blockers:</strong> ${escapeHtml(goal.blockers || "No blocker recorded yet.")}</p>
          </div>
        </div>
      </div>
      <div class="surface-card goal-focus-card">
        <div class="eyebrow">Current state</div>
        <div class="stack-sm">
          <div class="mini-stat-row"><span>Pending approvals</span> ${renderPill(String(pending.length), "highlight")}</div>
          <div class="mini-stat-row"><span>Active tasks</span> ${renderPill(String(active.length), "subtle")}</div>
          <div class="mini-stat-row"><span>Completed tasks</span> ${renderPill(String(completed.length), "success")}</div>
        </div>
      </div>
    </section>
    <section class="content-grid">
      <div class="stack-lg">
        <div class="section-row">
          <div>
            <div class="section-title-large">Needs approval</div>
            <p class="section-copy">AI work waits here until you resolve it in Inbox.</p>
          </div>
          <a class="btn-ghost" href="#/inbox">Open Inbox</a>
        </div>
        ${
          pending.length
            ? pending.map((task) => renderTaskRow(task, goal)).join("")
            : renderEmptyState(
                "No pending approvals",
                "Use the AI draft button above if you want fresh support on this goal.",
                null,
                null,
              )
        }

        <div class="section-row">
          <div>
            <div class="section-title-large">Active tasks</div>
            <p class="section-copy">This is the execution lane for manual work or approved AI drafts.</p>
          </div>
        </div>
        ${
          active.length
            ? active.map((task) => renderTaskRow(task, goal)).join("")
            : renderEmptyState(
                "No active execution tasks",
                "Accept an AI draft or request manual work to move this goal forward.",
                null,
                null,
              )
        }
      </div>
      <div class="stack-lg">
        <div class="surface-card">
          <div class="section-title-large">Recent goal context</div>
          <div class="message-summary-list">
            ${
              recentMessages.length
                ? recentMessages
                    .map(
                      (message) => `
                        <div class="message-summary-item">
                          <div class="message-role">${escapeHtml(message.role)}</div>
                          <p>${escapeHtml(message.body)}</p>
                        </div>
                      `,
                    )
                    .join("")
                : '<p class="section-copy">Goal-specific conversation will show up here as you work with the assistant.</p>'
            }
          </div>
        </div>
        <div class="surface-card">
          <div class="section-title-large">Completed</div>
          ${
            completed.length
              ? `<div class="stack-sm">${completed
                  .map((task) => renderTaskRow(task, goal))
                  .join("")}</div>`
              : '<p class="section-copy">Nothing completed yet.</p>'
          }
        </div>
        ${
          archived.length
            ? `
              <div class="surface-card">
                <div class="section-title-large">Rejected or reassigned</div>
                <div class="stack-sm">
                  ${archived.map((task) => renderTaskRow(task, goal)).join("")}
                </div>
              </div>
            `
            : ""
        }
      </div>
    </section>
  `;
}

function renderInbox(state) {
  const approvals = getPendingApprovals(state);
  const urgentSignals = getVisibleSignals(state, "urgent");

  return `
    ${renderViewHeader({
      eyebrow: "Review queue",
      title: "Inbox",
      subtitle:
        "Resolve AI-generated work here. Accept marks it done, revise keeps it in review, do it yourself converts it to manual work, and skip/reassign removes it from the active queue.",
      actions: `<a class="btn-surface" href="#/today">${icon("calendar")}Back to Today</a>`,
    })}
    <section class="content-grid">
      <div class="stack-lg">
        <div class="section-row">
          <div>
            <div class="section-title-large">Pending approvals</div>
            <p class="section-copy">Every AI draft lands here first.</p>
          </div>
        </div>
        ${
          approvals.length
            ? approvals
                .map((task) => {
                  const goal = state.goals.find((item) => item.id === task.goalId);
                  const deliverable = state.deliverables.find(
                    (item) => item.id === task.deliverableId,
                  );
                  const isEditing =
                    state.ui.editingDeliverableId &&
                    state.ui.editingDeliverableId === deliverable?.id;

                  return `
                    <article class="surface-card approval-card">
                      <div class="approval-head">
                        <div>
                          <div class="eyebrow">Needs approval</div>
                          <h3>${escapeHtml(task.title)}</h3>
                        </div>
                        <div class="approval-meta">
                          ${goal ? renderPill(goal.title, "subtle") : ""}
                          ${renderPill(formatShortDate(task.dueAt), isOverdue(task.dueAt) ? "warning" : "subtle")}
                        </div>
                      </div>
                      <div class="deliverable-preview">
                        <div class="deliverable-title">${escapeHtml(deliverable?.title || "Draft")}</div>
                        ${
                          isEditing
                            ? `
                              <form data-form="revise-deliverable" data-task-id="${task.id}">
                                <textarea name="body" class="surface-input editor-area" rows="8">${escapeHtml(deliverable?.body || "")}</textarea>
                                <div class="surface-actions">
                                  <button type="submit" class="btn-surface">${icon("wand")}Save revision</button>
                                  <button type="button" class="btn-ghost" data-action="cancel-revision">Cancel</button>
                                </div>
                              </form>
                            `
                            : `<p>${nl2br(deliverable?.body || "")}</p>`
                        }
                      </div>
                      ${
                        !isEditing
                          ? `
                            <div class="surface-actions">
                              <button class="btn-surface" data-action="approve-task" data-task-id="${task.id}">${icon("check")}Accept</button>
                              <button class="btn-ghost" data-action="start-revision" data-deliverable-id="${deliverable?.id || ""}">Revise</button>
                              <button class="btn-ghost" data-action="manual-task" data-task-id="${task.id}">Do it myself</button>
                              <button class="btn-ghost" data-action="skip-task" data-task-id="${task.id}">Skip / Reassign</button>
                            </div>
                          `
                          : ""
                      }
                    </article>
                  `;
                })
                .join("")
            : renderEmptyState(
                "Inbox is clear",
                "There are no pending AI approvals right now.",
                "Request AI draft",
                "#/today",
              )
        }
      </div>
      <div class="stack-lg">
        <div class="section-row">
          <div>
            <div class="section-title-large">Urgent signals</div>
            <p class="section-copy">Immediate nudges stay visible here alongside approvals.</p>
          </div>
        </div>
        ${
          urgentSignals.length
            ? urgentSignals
                .map((signal) =>
                  renderSignalCard(
                    signal,
                    state.goals.find((goal) => goal.id === signal.goalId),
                  ),
                )
                .join("")
            : renderEmptyState(
                "No urgent signals",
                "Urgent nudges will appear here when a goal needs immediate intervention.",
                null,
                null,
              )
        }
      </div>
    </section>
  `;
}

function renderUpcoming(state) {
  const upcomingTasks = getUpcomingTasks(state);

  return `
    ${renderViewHeader({
      eyebrow: "Calendar horizon",
      title: "Upcoming",
      subtitle:
        "Future-dated work and scheduled portfolio reviews live here so Today stays focused on what already needs action.",
      actions: `<a class="btn-surface" href="#/checkin">${icon("spark")}Open check-in</a>`,
    })}
    <section class="split-grid split-grid-tight">
      <div class="surface-card">
        <div class="section-title-large">Next portfolio review</div>
        <p class="section-copy">
          Slow-burn signals are bundled into a single review instead of interrupting you goal by goal.
        </p>
        <div class="timeline-callout">
          ${icon("spark")}
          <div>
            <strong>Next bundled review</strong>
            <p>Ready now in Check-in. Use it when you want a portfolio-level reset.</p>
          </div>
        </div>
      </div>
      <div class="surface-card">
        <div class="section-title-large">Planning rule</div>
        <p class="section-copy">
          Future work can stay scheduled, but AI drafts still require Inbox review before they count as done.
        </p>
      </div>
    </section>
    <section class="stack-lg">
      <div class="section-row">
        <div>
          <div class="section-title-large">Future tasks</div>
          <p class="section-copy">Sorted by date across all active goals.</p>
        </div>
      </div>
      ${
        upcomingTasks.length
          ? upcomingTasks
              .map((task) =>
                renderTaskRow(
                  task,
                  state.goals.find((goal) => goal.id === task.goalId),
                  { showGoal: true },
                ),
              )
              .join("")
          : renderEmptyState(
              "No future-dated tasks",
              "Once goals have scheduled work, it will appear here.",
              "Add goal",
              "#/onboarding",
            )
      }
    </section>
  `;
}

function renderCheckIn(state) {
  const trendSignals = getVisibleSignals(state, "trend");
  const summary = trendSignals.length
    ? `You have ${trendSignals.length} slow-burn signals across ${
        new Set(trendSignals.map((signal) => signal.goalId)).size
      } active goals. Review them together before changing anything.`
    : "Your portfolio has no open trend signals right now.";

  return `
    ${renderViewHeader({
      eyebrow: "Portfolio review",
      title: "Check-in",
      subtitle:
        "This is the bundled review surface for slower trends like repeated deferrals or slowing progress. Nothing changes without explicit approval.",
      actions: `<a class="btn-surface" href="#/today">${icon("calendar")}Back to Today</a>`,
    })}
    <section class="surface-card ai-summary-card">
      <div class="ai-summary-head">
        <div class="ai-icon">${icon("spark")}</div>
        <div>
          <div class="eyebrow">AI narrative</div>
          <h2>Portfolio pulse</h2>
        </div>
      </div>
      <p>${escapeHtml(summary)}</p>
    </section>
    <section class="stack-lg">
      <div class="section-row">
        <div>
          <div class="section-title-large">Bundled trend signals</div>
          <p class="section-copy">These are intentionally grouped into one review instead of separate interruptions.</p>
        </div>
      </div>
      ${
        trendSignals.length
          ? trendSignals
              .map((signal) =>
                renderSignalCard(
                  signal,
                  state.goals.find((goal) => goal.id === signal.goalId),
                ),
              )
              .join("")
          : renderEmptyState(
              "No trend signals",
              "Your active goals do not need a portfolio-level review yet.",
              null,
              null,
            )
      }
    </section>
  `;
}

function renderMainView(state, route) {
  let content = "";

  if (route.name === "onboarding") {
    content = renderOnboarding(state);
  }

  if (route.name === "today") {
    content = renderToday(state);
  }

  if (route.name === "goal") {
    content = renderGoalWorkspace(state, route);
  }

  if (route.name === "inbox") {
    content = renderInbox(state);
  }

  if (route.name === "upcoming") {
    content = renderUpcoming(state);
  }

  if (route.name === "checkin") {
    content = renderCheckIn(state);
  }

  return `
    <main class="main-view">
      <div class="content-wrapper">
        ${content}
      </div>
    </main>
  `;
}

function renderAiPanel(state, route) {
  const goal = route.goalId
    ? state.goals.find((item) => item.id === route.goalId)
    : null;
  const title =
    route.name === "onboarding"
      ? "Planning Studio"
      : route.name === "checkin"
        ? "Portfolio Coach"
        : goal?.title || "AI Assistant";
  const messages = getRouteMessages(state, route).slice(-8);
  const suggestions = suggestionsForRoute(route);

  return `
    <aside class="ai-panel">
      <div class="ai-panel-header">
        <div class="ai-panel-title">
          <div class="ai-icon">${icon("spark")}</div>
          <div class="ai-panel-stack">
            <span>${escapeHtml(title)}</span>
            <small>Mocked deterministic assistant</small>
          </div>
          <div class="ai-badge">BETA</div>
        </div>
        <button class="ai-btn-close" data-action="toggle-ai-panel" aria-label="Close AI panel">
          ${icon("close")}
        </button>
      </div>

      <div class="ai-suggestions">
        <div class="ai-suggestions-label">Quick actions</div>
        ${suggestions
          .map(
            (suggestion) => `
              <button class="ai-chip" data-action="ai-suggestion" data-text="${escapeHtml(suggestion)}">
                ${icon("spark")}
                ${escapeHtml(suggestion)}
              </button>
            `,
          )
          .join("")}
      </div>

      <div class="ai-messages" id="aiMessages">
        ${
          messages.length
            ? messages
                .map(
                  (message) => `
                    <div class="ai-msg ${message.role === "user" ? "user" : "assistant"}">
                      <div class="ai-msg-sender">${message.role === "user" ? "You" : "AI Assistant"}</div>
                      <div class="ai-msg-bubble">${nl2br(message.body)}</div>
                    </div>
                  `,
                )
                .join("")
            : `
              <div class="ai-msg assistant">
                <div class="ai-msg-sender">AI Assistant</div>
                <div class="ai-msg-bubble">Ask for priorities, draft work, or a review summary.</div>
              </div>
            `
        }
      </div>

      <div class="ai-input-area">
        <form class="ai-input-box" data-form="ai-chat">
          <textarea class="ai-textarea" name="message" placeholder="Ask anything about your goals…" rows="1"></textarea>
          <button class="ai-send-btn" type="submit" aria-label="Send message">
            ${icon("send")}
          </button>
        </form>
        <div class="ai-input-hint">Deterministic local demo · No backend required</div>
      </div>
    </aside>
  `;
}

export function renderApp(state, route) {
  return `
    <div class="app-container ${state.ui.mobileNavOpen ? "nav-open" : ""} ${state.ui.aiOpen ? "ai-open" : ""}">
      <button class="app-overlay" data-action="close-chrome" aria-label="Close panels"></button>
      ${renderSidebar(state, route)}
      ${renderMainView(state, route)}
      ${renderAiPanel(state, route)}
    </div>
  `;
}
