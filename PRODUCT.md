# Precortex

Precortex is a task planner with an assistant. Its public experience helps someone turn an unscheduled inbox into a deliberate plan for today before deciding whether to use an account workspace.

## Public experience

- The landing page leads with “Try the demo” and keeps login available separately. Its product preview uses the planner's actual task-card renderer and links to the interactive workspace.
- `/?demo=1` opens without login. It reuses the planner's Inbox, Today, Upcoming, project view, task cards, and task modal.
- The starting workspace contains one fictional Community workshop project and four sample tasks. Three begin in the inbox; the supplies task is assigned to the project and scheduled for tomorrow.
- The walkthrough asks visitors to review the inbox, decide priorities, and inspect Today. Visitors can schedule, edit, complete, create, remove, and reorder sample tasks and work with subtasks through the existing controls.

## Planning example

The demo assistant is explicitly labeled “Prewritten example · No live AI call.” It recommends confirming the venue today at high priority because the room hold expires tomorrow and confirmation unblocks invitations. Applying the example changes that task; editing opens its task modal. A separate action adds two example subtasks.

The visitor keeps control through editable priorities and dates, “Undo last change,” and “Reset demo.” The example is an illustration of a planning decision, not a generated response or proof of AI performance.

## Data and account boundaries

Sample tasks, projects, and undo history live in tab memory. Reload recreates the initial sample workspace; reset also clears the demo's undo history. Up to 50 previous workspace snapshots are retained for undo during a session. Sample edits route through the local demo adapter instead of account mutations, and the demo does not bootstrap account authentication or call live AI actions.

“Use my own workspace” starts the separate login flow. Demo data is not transferred into an account. Voice capture and new-project AI setup are outside this demo. Live planning suggestions in the account workspace depend on its AI provider configuration.

## Durable constraints

Keep the public demo useful without login, clearly fictional, reversible, and isolated from account data. Keep explanations adjacent to suggested actions and disclose prewritten examples. Reuse real planner components so the public preview and interactive experience represent the product. Preserve the existing quiet stone palette and DM Serif Display typography; visual rules are recorded in DESIGN.md.
