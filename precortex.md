# Precortex

## Overview

Precortex is a domain-agnostic, goal-achieving assistant that helps individuals accomplish any personal or professional goal. Users can maintain a portfolio of active goals simultaneously. For each goal, the user and AI co-create a plan through collaborative back-and-forth conversation, breaking it into atomic, actionable tasks. The AI can execute certain tasks autonomously or guide the user through them, reducing cognitive and execution burden. The user provides ongoing feedback by checking off tasks or discussing progress with the AI, which continuously surfaces plan adjustments for the user to approve.

### Main Flow

**Onboarding**
- User joins and provides one or more goals to achieve.
- For each goal, the AI asks clarifying questions to understand it in depth.
- The AI and user co-create a concrete plan through back-and-forth conversation — the user shapes each step collaboratively rather than receiving a fully formed plan to approve. The output is either a sequential task list or a system designed to help the user reach the goal.

**Main Loop**
- Users manage a portfolio of active goals simultaneously; each goal has its own plan, task list, and dedicated workspace.
- A unified dashboard provides an overview of all active goals and surfaces priority tasks across them. Each goal also has its own dedicated workspace for deep focus and conversation.
- If a task is AI-executable, the AI automatically executes it and surfaces the result.
- If a task requires the user, the user executes it and marks it complete via a checkmark.
- At any point, the user can discuss blockers, progress, or completed work with the AI for any active goal.
- The AI proactively detects signals — such as missed deadlines, slowing progress, or repeated task deferrals — and surfaces suggested plan adjustments to the user.
- The AI never auto-adjusts the plan; all plan changes require explicit user approval.
- The boundary of what is AI-executable vs. user-executable is expected to evolve as the product and AI capabilities mature.

**Proactive Signal Delivery**
- **Urgent signals** (e.g., a missed deadline) trigger a real-time, per-goal in-app nudge that surfaces the issue and links the user into a conversation to address it.
- **Slower trends** (e.g., gradual slowing of progress, repeated task deferrals over time) are bundled and delivered as a single periodic check-in that consolidates all active goals into one portfolio review session, rather than individual per-goal interruptions.
- In both cases, the AI presents suggested adjustments but takes no action until the user explicitly approves.

## Problem

_To be defined through clarification._

## Users

Any individual with one or more personal or professional goals they want to accomplish. The product is domain-agnostic and does not target a specific user demographic or goal type.

## Goals

- Enable users to achieve any personal or professional goal by co-creating a plan broken into atomic, manageable tasks.
- Support a portfolio of simultaneous active goals within a single product experience.
- Reduce the user's cognitive and execution burden through AI assistance and guidance.
- Keep the user on track via regular feedback loops (task check-ins and AI conversations).
- Proactively surface plan adjustment suggestions based on detected progress signals, while keeping the user in control of all plan changes.
- Support all plan structures — the AI should infer the best format (linear sequence, recurring routine, milestone-based roadmap, or a hybrid) based on the goal type and adapt through conversation
- User chooses at the moment of rejection — option to provide feedback for an AI revision, redo it themselves, or skip/reassign the task
- Move to a 'paused' state — suppresses nudges and check-ins but keeps the full plan intact for easy resumption at any time

## Non-Goals

_To be defined through clarification._

## Constraints

- The scope of AI-executable tasks must be defined and will shift over time as AI capabilities evolve; the product must accommodate this changing boundary.
- **At launch, AI-executable tasks are limited to information and content work only:** researching topics, drafting emails or messages, and generating templates or outlines.
- **At launch, all real-world actions are user-executable only:** sending emails, making purchases, attending meetings, and any other action that has an effect outside the product.
- The product must not attempt to autonomously perform real-world actions on the user's behalf in the initial version.
- **The AI must never auto-adjust a user's plan.** The AI may proactively detect signals (e.g., missed deadlines, slowing progress, repeated task deferrals) and surface suggested adjustments, but all plan changes require explicit user approval before taking effect.
- **Proactive signal delivery must follow a hybrid model:** urgent signals trigger real-time, per-goal in-app nudges; slower trends are bundled into a single periodic check-in that covers all active goals together. The system must not surface every minor signal as an immediate interruption.
- Web only — desktop and mobile browser experience.
- Present as a completed deliverable the user can accept, reject, or edit inline — no auto-completion, user always has final say before it's marked done

## Success Criteria

- Success at launch is measured by **user retention and engagement**, reflecting whether users are actively maintaining a meaningful relationship with the product and making progress on their goals over time:
- **Primary metric:** 4-week retention rate — the percentage of users who are weekly active 4 weeks after joining.
- **Definition of weekly active:** A user is considered active in a given week if they have **at least one meaningful AI conversation** (e.g., a check-in, planning session, or progress discussion) during that week.
- **Proxy for goal progress:** Sustained meaningful AI conversations over time, indicating users are continuing to engage with and advance their goals rather than abandoning them.
- These metrics are preferred over one-time goal completion rates because they capture ongoing engagement and incremental progress, which are more meaningful signals that the product is delivering sustained value.
- Both combined — show quantitative metrics (completion %, streaks, deadlines) alongside a qualitative AI narrative that interprets the numbers and highlights what needs attention

## Open Questions

- Problem still needs detail.
- Non-Goals still needs detail.

## Decisions

- The product is domain-agnostic and must support any kind of personal or professional goal without being scoped to a specific domain.
- Users can work on multiple goals simultaneously; the product supports a portfolio of active goals.
- The portfolio navigation uses a blended approach: a unified dashboard provides an overview of all active goals and surfaces priority tasks across them, while each goal has its own dedicated workspace for deep focus and conversation.
- During onboarding, the AI co-creates the plan with the user through back-and-forth conversation; the user shapes each step collaboratively rather than receiving a fully formed plan to approve or edit.
- The AI-executable vs. user-executable task boundary is intentionally flexible and will be adjusted as the product and AI capabilities progress.
- In the initial version, AI-executable tasks are scoped to: researching topics, drafting emails/messages, and generating templates or outlines.
- In the initial version, real-world actions (sending emails, making purchases, attending meetings, etc.) are always user-executable and are never performed autonomously by the AI.
- The AI proactively detects signals of slowing progress or blockers (e.g., missed deadlines, repeated deferrals) and surfaces suggested plan adjustments, but never applies changes automatically — all plan modifications require explicit user approval.
- Proactive signal delivery uses a hybrid model: urgent signals (e.g., missed deadlines) trigger real-time, per-goal in-app nudges; slower trends (e.g., gradual progress decline) are bundled into a single periodic check-in that consolidates all active goals into one portfolio review session.
- A user is considered weekly active if they have at least one meaningful AI conversation (check-in, planning, or progress discussion) within the week.
- Launch success is defined by 4-week retention rate based on the weekly active definition above, not by one-time goal completion rate.
---

---

# Agent Handoff

## Project Snapshot
- Title: Precortex
- Clarification score: 86%
- Ambiguity: Low
- Clarification round: 16
- Last updated: 2026-03-13T05:34:20.941+00:00

## Goal
Precortex is a domain-agnostic, goal-achieving assistant that helps individuals accomplish any personal or professional goal. Users can maintain a portfolio of active goals simultaneously. For each goal, the user and AI co-create a plan through collaborative back-and-forth conversation, breaking it into atomic, actionable tasks. The AI can execute certain tasks autonomously or guide the user through them, reducing cognitive and execution burden. The user provides ongoing feedback by checking off tasks or discussing progress with the AI, which continuously surfaces plan adjustments for the user to approve.

### Main Flow

**Onboarding**
- User joins and provides one or more goals to achieve.
- For each goal, the AI asks clarifying questions to understand it in depth.
- The AI and user co-create a concrete plan through back-and-forth conversation — the user shapes each step collaboratively rather than receiving a fully formed plan to approve. The output is either a sequential task list or a system designed to help the user reach the goal.

**Main Loop**
- Users manage a portfolio of active goals simultaneously; each goal has its own plan, task list, and dedicated workspace.
- A unified dashboard provides an overview of all active goals and surfaces priority tasks across them. Each goal also has its own dedicated workspace for deep focus and conversation.
- If a task is AI-executable, the AI automatically executes it and surfaces the result.
- If a task requires the user, the user executes it and marks it complete via a checkmark.
- At any point, the user can discuss blockers, progress, or completed work with the AI for any active goal.
- The AI proactively detects signals — such as missed deadlines, slowing progress, or repeated task deferrals — and surfaces suggested plan adjustments to the user.
- The AI never auto-adjusts the plan; all plan changes require explicit user approval.
- The boundary of what is AI-executable vs. user-executable is expected to evolve as the product and AI capabilities mature.

**Proactive Signal Delivery**
- **Urgent signals** (e.g., a missed deadline) trigger a real-time, per-goal in-app nudge that surfaces the issue and links the user into a conversation to address it.
- **Slower trends** (e.g., gradual slowing of progress, repeated task deferrals over time) are bundled and delivered as a single periodic check-in that consolidates all active goals into one portfolio review session, rather than individual per-goal interruptions.
- In both cases, the AI presents suggested adjustments but takes no action until the user explicitly approves.

## Problem
_None specified._

## Users
Any individual with one or more personal or professional goals they want to accomplish. The product is domain-agnostic and does not target a specific user demographic or goal type.

## In Scope
- Enable users to achieve any personal or professional goal by co-creating a plan broken into atomic, manageable tasks.
- Support a portfolio of simultaneous active goals within a single product experience.
- Reduce the user's cognitive and execution burden through AI assistance and guidance.
- Keep the user on track via regular feedback loops (task check-ins and AI conversations).
- Proactively surface plan adjustment suggestions based on detected progress signals, while keeping the user in control of all plan changes.
- Support all plan structures — the AI should infer the best format (linear sequence, recurring routine, milestone-based roadmap, or a hybrid) based on the goal type and adapt through conversation
- User chooses at the moment of rejection — option to provide feedback for an AI revision, redo it themselves, or skip/reassign the task
- Move to a 'paused' state — suppresses nudges and check-ins but keeps the full plan intact for easy resumption at any time

## Out Of Scope
- None specified.

## Constraints
- The scope of AI-executable tasks must be defined and will shift over time as AI capabilities evolve; the product must accommodate this changing boundary.
- **At launch, AI-executable tasks are limited to information and content work only:** researching topics, drafting emails or messages, and generating templates or outlines.
- **At launch, all real-world actions are user-executable only:** sending emails, making purchases, attending meetings, and any other action that has an effect outside the product.
- The product must not attempt to autonomously perform real-world actions on the user's behalf in the initial version.
- **The AI must never auto-adjust a user's plan.** The AI may proactively detect signals (e.g., missed deadlines, slowing progress, repeated task deferrals) and surface suggested adjustments, but all plan changes require explicit user approval before taking effect.
- **Proactive signal delivery must follow a hybrid model:** urgent signals trigger real-time, per-goal in-app nudges; slower trends are bundled into a single periodic check-in that covers all active goals together. The system must not surface every minor signal as an immediate interruption.
- Web only — desktop and mobile browser experience.
- Present as a completed deliverable the user can accept, reject, or edit inline — no auto-completion, user always has final say before it's marked done

## Acceptance Criteria
- Success at launch is measured by **user retention and engagement**, reflecting whether users are actively maintaining a meaningful relationship with the product and making progress on their goals over time:
- **Primary metric:** 4-week retention rate — the percentage of users who are weekly active 4 weeks after joining.
- **Definition of weekly active:** A user is considered active in a given week if they have **at least one meaningful AI conversation** (e.g., a check-in, planning session, or progress discussion) during that week.
- **Proxy for goal progress:** Sustained meaningful AI conversations over time, indicating users are continuing to engage with and advance their goals rather than abandoning them.
- These metrics are preferred over one-time goal completion rates because they capture ongoing engagement and incremental progress, which are more meaningful signals that the product is delivering sustained value.
- Both combined — show quantitative metrics (completion %, streaks, deadlines) alongside a qualitative AI narrative that interprets the numbers and highlights what needs attention

## Decisions Already Made
- The product is domain-agnostic and must support any kind of personal or professional goal without being scoped to a specific domain.
- Users can work on multiple goals simultaneously; the product supports a portfolio of active goals.
- The portfolio navigation uses a blended approach: a unified dashboard provides an overview of all active goals and surfaces priority tasks across them, while each goal has its own dedicated workspace for deep focus and conversation.
- During onboarding, the AI co-creates the plan with the user through back-and-forth conversation; the user shapes each step collaboratively rather than receiving a fully formed plan to approve or edit.
- The AI-executable vs. user-executable task boundary is intentionally flexible and will be adjusted as the product and AI capabilities progress.
- In the initial version, AI-executable tasks are scoped to: researching topics, drafting emails/messages, and generating templates or outlines.
- In the initial version, real-world actions (sending emails, making purchases, attending meetings, etc.) are always user-executable and are never performed autonomously by the AI.
- The AI proactively detects signals of slowing progress or blockers (e.g., missed deadlines, repeated deferrals) and surfaces suggested plan adjustments, but never applies changes automatically — all plan modifications require explicit user approval.
- Proactive signal delivery uses a hybrid model: urgent signals (e.g., missed deadlines) trigger real-time, per-goal in-app nudges; slower trends (e.g., gradual progress decline) are bundled into a single periodic check-in that consolidates all active goals into one portfolio review session.
- A user is considered weekly active if they have at least one meaningful AI conversation (check-in, planning, or progress discussion) within the week.
- Launch success is defined by 4-week retention rate based on the weekly active definition above, not by one-time goal completion rate.
---

## Open Questions
- Problem still needs detail.
- Non-Goals still needs detail.

## Handoff Guidance
- Treat the source spec above as the source of truth.
- If a detail conflicts with an assumption, follow the source spec and decisions section.
- Resolve remaining open questions before implementation if they block core behavior.

---

# Codex / Claude Code Prompt

```text
Implement the project described below.

Use the specification and handoff notes as the source of truth.

Project title: Precortex

Goal:
Precortex is a domain-agnostic, goal-achieving assistant that helps individuals accomplish any personal or professional goal. Users can maintain a portfolio of active goals simultaneously. For each goal, the user and AI co-create a plan through collaborative back-and-forth conversation, breaking it into atomic, actionable tasks. The AI can execute certain tasks autonomously or guide the user through them, reducing cognitive and execution burden. The user provides ongoing feedback by checking off tasks or discussing progress with the AI, which continuously surfaces plan adjustments for the user to approve.

### Main Flow

**Onboarding**
- User joins and provides one or more goals to achieve.
- For each goal, the AI asks clarifying questions to understand it in depth.
- The AI and user co-create a concrete plan through back-and-forth conversation — the user shapes each step collaboratively rather than receiving a fully formed plan to approve. The output is either a sequential task list or a system designed to help the user reach the goal.

**Main Loop**
- Users manage a portfolio of active goals simultaneously; each goal has its own plan, task list, and dedicated workspace.
- A unified dashboard provides an overview of all active goals and surfaces priority tasks across them. Each goal also has its own dedicated workspace for deep focus and conversation.
- If a task is AI-executable, the AI automatically executes it and surfaces the result.
- If a task requires the user, the user executes it and marks it complete via a checkmark.
- At any point, the user can discuss blockers, progress, or completed work with the AI for any active goal.
- The AI proactively detects signals — such as missed deadlines, slowing progress, or repeated task deferrals — and surfaces suggested plan adjustments to the user.
- The AI never auto-adjusts the plan; all plan changes require explicit user approval.
- The boundary of what is AI-executable vs. user-executable is expected to evolve as the product and AI capabilities mature.

**Proactive Signal Delivery**
- **Urgent signals** (e.g., a missed deadline) trigger a real-time, per-goal in-app nudge that surfaces the issue and links the user into a conversation to address it.
- **Slower trends** (e.g., gradual slowing of progress, repeated task deferrals over time) are bundled and delivered as a single periodic check-in that consolidates all active goals into one portfolio review session, rather than individual per-goal interruptions.
- In both cases, the AI presents suggested adjustments but takes no action until the user explicitly approves.

Problem:
No explicit problem statement provided.

Target users:
Any individual with one or more personal or professional goals they want to accomplish. The product is domain-agnostic and does not target a specific user demographic or goal type.

In scope:
- Enable users to achieve any personal or professional goal by co-creating a plan broken into atomic, manageable tasks.
- Support a portfolio of simultaneous active goals within a single product experience.
- Reduce the user's cognitive and execution burden through AI assistance and guidance.
- Keep the user on track via regular feedback loops (task check-ins and AI conversations).
- Proactively surface plan adjustment suggestions based on detected progress signals, while keeping the user in control of all plan changes.
- Support all plan structures — the AI should infer the best format (linear sequence, recurring routine, milestone-based roadmap, or a hybrid) based on the goal type and adapt through conversation
- User chooses at the moment of rejection — option to provide feedback for an AI revision, redo it themselves, or skip/reassign the task
- Move to a 'paused' state — suppresses nudges and check-ins but keeps the full plan intact for easy resumption at any time

Out of scope:
- None specified.

Constraints:
- The scope of AI-executable tasks must be defined and will shift over time as AI capabilities evolve; the product must accommodate this changing boundary.
- **At launch, AI-executable tasks are limited to information and content work only:** researching topics, drafting emails or messages, and generating templates or outlines.
- **At launch, all real-world actions are user-executable only:** sending emails, making purchases, attending meetings, and any other action that has an effect outside the product.
- The product must not attempt to autonomously perform real-world actions on the user's behalf in the initial version.
- **The AI must never auto-adjust a user's plan.** The AI may proactively detect signals (e.g., missed deadlines, slowing progress, repeated task deferrals) and surface suggested adjustments, but all plan changes require explicit user approval before taking effect.
- **Proactive signal delivery must follow a hybrid model:** urgent signals trigger real-time, per-goal in-app nudges; slower trends are bundled into a single periodic check-in that covers all active goals together. The system must not surface every minor signal as an immediate interruption.
- Web only — desktop and mobile browser experience.
- Present as a completed deliverable the user can accept, reject, or edit inline — no auto-completion, user always has final say before it's marked done

Acceptance criteria:
- Success at launch is measured by **user retention and engagement**, reflecting whether users are actively maintaining a meaningful relationship with the product and making progress on their goals over time:
- **Primary metric:** 4-week retention rate — the percentage of users who are weekly active 4 weeks after joining.
- **Definition of weekly active:** A user is considered active in a given week if they have **at least one meaningful AI conversation** (e.g., a check-in, planning session, or progress discussion) during that week.
- **Proxy for goal progress:** Sustained meaningful AI conversations over time, indicating users are continuing to engage with and advance their goals rather than abandoning them.
- These metrics are preferred over one-time goal completion rates because they capture ongoing engagement and incremental progress, which are more meaningful signals that the product is delivering sustained value.
- Both combined — show quantitative metrics (completion %, streaks, deadlines) alongside a qualitative AI narrative that interprets the numbers and highlights what needs attention

Decisions already made:
- The product is domain-agnostic and must support any kind of personal or professional goal without being scoped to a specific domain.
- Users can work on multiple goals simultaneously; the product supports a portfolio of active goals.
- The portfolio navigation uses a blended approach: a unified dashboard provides an overview of all active goals and surfaces priority tasks across them, while each goal has its own dedicated workspace for deep focus and conversation.
- During onboarding, the AI co-creates the plan with the user through back-and-forth conversation; the user shapes each step collaboratively rather than receiving a fully formed plan to approve or edit.
- The AI-executable vs. user-executable task boundary is intentionally flexible and will be adjusted as the product and AI capabilities progress.
- In the initial version, AI-executable tasks are scoped to: researching topics, drafting emails/messages, and generating templates or outlines.
- In the initial version, real-world actions (sending emails, making purchases, attending meetings, etc.) are always user-executable and are never performed autonomously by the AI.
- The AI proactively detects signals of slowing progress or blockers (e.g., missed deadlines, repeated deferrals) and surfaces suggested plan adjustments, but never applies changes automatically — all plan modifications require explicit user approval.
- Proactive signal delivery uses a hybrid model: urgent signals (e.g., missed deadlines) trigger real-time, per-goal in-app nudges; slower trends (e.g., gradual progress decline) are bundled into a single periodic check-in that consolidates all active goals into one portfolio review session.
- A user is considered weekly active if they have at least one meaningful AI conversation (check-in, planning, or progress discussion) within the week.
- Launch success is defined by 4-week retention rate based on the weekly active definition above, not by one-time goal completion rate.
---

Open questions:
- Problem still needs detail.
- Non-Goals still needs detail.

Execution requirements:
- Start by inspecting the existing codebase and identifying the smallest coherent implementation path.
- Preserve established patterns unless the spec explicitly requires a change.
- Implement the feature end-to-end, including tests and verification.
- If a remaining open question blocks implementation, surface it explicitly before proceeding.
- Return a concise summary of what changed, what was verified, and any residual risks.
```
