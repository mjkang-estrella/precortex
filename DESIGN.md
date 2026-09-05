---
name: Precortex
description: A quiet task planner with stone surfaces and serif headings.
colors:
  stone-50: "#f6f6f5"
  stone-100: "#efefec"
  stone-200: "#e3e3df"
  stone-300: "#cfcfc8"
  stone-400: "#b3b3a9"
  stone-500: "#9b9b8f"
  stone-600: "#828276"
  stone-700: "#6b6b61"
  stone-800: "#585850"
  stone-900: "#111111"
  white: "#ffffff"
  demo-surface: "#fafaf9"
  demo-border: "#d6d3d1"
  demo-divider: "#e7e5e4"
  demo-muted: "#57534e"
  demo-text: "#44403c"
  demo-strong: "#1c1917"
  demo-primary: "#292524"
typography:
  display:
    fontFamily: '"DM Serif Display", Georgia, serif'
  body:
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif'
rounded:
  step: "8px"
  control: "12px"
  card: "16px"
  panel: "32px"
components:
  demo-primary:
    backgroundColor: "{colors.demo-primary}"
    textColor: "{colors.white}"
    rounded: "{rounded.control}"
    padding: "11px 14px"
    width: "100%"
  demo-secondary:
    rounded: "{rounded.control}"
    padding: "11px 14px"
    width: "100%"
---

# Design System: Precortex

## Overview

Preserve the inherited quiet stone surfaces, generous spacing, rounded planner panels, and DM Serif Display headings. The public landing and demo extend this system. Task content and planning decisions carry the emphasis; controls remain restrained and recognizable.

This is a scan of the implemented styles and components, not a new visual identity. Source values come from `tailwind.config.js`, `styles/app.css`, the landing and demo views, and the shared planner shell.

## Colors

Stone neutrals organize backgrounds, borders, text, and primary actions. White panels sit against pale stone surroundings; near-black calls to action provide emphasis. The landing's dark feature section reverses that relationship.

The custom Tailwind stone scale and the demo's explicit warm-gray CSS values coexist in the implementation. Preserve their distinct tokens rather than assuming that identically numbered Tailwind defaults match the project's custom scale. Demo and preview explanatory text use the darker demo-muted token. Priority is also written as text rather than communicated by color alone.

## Typography

DM Serif Display with Georgia fallback gives major headings their character. System sans-serif handles task titles, body copy, navigation, labels, and controls.

The landing hero uses fluid display text (`clamp(2.8rem, 7vw, 5.5rem)`) with tight line height (1.05). The demo assistant heading uses a smaller display size (24px); its body uses sans-serif (14px, line height 1.65). Disclosure and guide text are compact (typically 12px). Keep the prewritten-example disclosure legible beside the suggestion.

## Layout

The desktop workspace retains left navigation, a central task panel, and a right assistant panel. Below the desktop breakpoint (1024px), navigation and assistant use drawers. The demo guide sits above the real main view and wraps its utility actions.

The landing uses a centered container (maximum 80rem). Its hero pairs copy with a product preview in two columns (1.1fr / 1fr, 60px gap); below 1024px it stacks them with a 36px gap. The preview's interior uses 24px padding. Preserve the task modal's scroll access to date and priority controls on smaller screens.

## Elevation & Depth

Most separation comes from pale fills and thin borders. Existing shadows remain subtle: soft panels use `0 4px 24px -6px rgba(0, 0, 0, 0.03)`, floating controls use `0 8px 32px -8px rgba(0, 0, 0, 0.08)`, and modal elevation uses `0 24px 48px -12px rgba(0, 0, 0, 0.15)`. The landing preview and demo guide rely on borders rather than decorative depth.

## Shapes

Rounded task cards and preview frames share gently curved corners. Larger desktop panels use broader corners; compact step controls use smaller ones. Circular completion controls and pill-shaped login/navigation details remain part of the existing vocabulary.

## Components

- **Task cards and modal:** reuse the shared planner renderers for the demo. The landing preview uses the same card renderer inside an inert preview, with a separate link into the live demo.
- **Demo guide:** identify the fictional workspace, explain reset/reload behavior, show three walkthrough steps, and keep undo, reset, exit, and account links accessible. The current step uses a dark fill and `aria-current`.
- **Example assistant:** pair the suggestion with its reason and prewritten label, then offer explicit apply, edit, and subtask actions. Disabled actions use reduced opacity.
- **Interactive states:** demo controls and task rows show a visible focus outline (2px with 3px offset); task scheduling controls become visible on keyboard focus within the row. Underlined utility links remain distinguishable.
- **Motion:** existing short reveals and transitions support navigation and task changes. Reduced-motion preferences disable landing/demo animations and transitions while keeping landing content visible.

## Do's and Don'ts

- Keep the stone palette, serif/sans pairing, and real planner components consistent across public and account surfaces.
- Keep disclosures, decision reasons, and reversible controls visible in the demo.
- Preserve keyboard focus and access to controls inside mobile dialogs.
- Do not present a static preview as an interactive control or prewritten text as a live AI result.
- Do not introduce a separate visual identity for the demo.
