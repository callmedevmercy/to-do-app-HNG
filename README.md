# Mercy's Tasks - Todo Application (Stage 1a)

A beautifully constructed, accessible, and interactive Todo Web application built using HTML, CSS, and Vanilla JavaScript.

## What Changed from Stage 0
Building upon the foundation of Stage 0 (which introduced the core CRUD operations and semantic card layout), Stage 1a adds advanced state synchronization and real-time updates:
* **"In Progress" Status:** Added a new state between "Pending" and "Done," manageable via a dedicated dropdown selector per task. 
* **Real-time Overdue Tracking:** Implemented a continuous check (`setInterval`) to update the "Time Remaining" calculation dynamically without needing to refresh the page.
* **Overdue UI Enhancements:** Tasks automatically change their appearance when overdue—showing red time indicators, an "Overdue!" badge, and grayscaled flower decorations with restless animations.
* **Focus Management:** Finalized the automated focus management. Escaping or saving the modal now automatically restores the keyboard focus logically.

## New Design Decisions
* **Dynamic Styling based on State:** 
    * "In Progress" tasks exhibit a unique blue aura (border and linear gradient adjustments) to differentiate them clearly at a glance.
    * The flower decorations have dynamic animations: blooming on hover, but turning into "ghostly" floating grayscale flowers when a task goes overdue.
* **Glassmorphism Theme:** Maintained and polished the frosted glass effects over the pastel sky-blue gradient (`bg-gradient: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)`) for a light, airy, and modern aesthetic.
* **Responsive Layout:** The grid structure gracefully falls back from complex multi-column layouts into a single stack for mobile users (`max-width: 480px`).

## Known Limitations
* **Volatility (No Persistence):** Currently, state and task data exist strictly in memory. Refreshing the browser will reset the to-do list back to the default hardcoded tasks. There is no `localStorage` or backend API connected yet.
* **No Advanced Filtering:** There are currently no UI controls to filter out completed tasks or sort tasks strictly by priority/due date.
* **Time Resolution:** The relative remaining time updates once every 60 seconds. While performant, it doesn't provide down-to-the-second countdowns for ultra-urgent tasks.

## Accessibility Notes
* **Screen Reader Optimizations:** Decorative elements (like the font-awesome icons and floating flowers) are explicitly hidden using `aria-hidden="true"`. Essential info uses semantic HTML like `<time>` with accurate `datetime` properties.
* **Aria Live Regions:** The time remaining dynamically updates itself without reloading the page. It utilizes `aria-live="polite"` to gently notify screen readers if an update occurs.
* **Full Keyboard Navigability:** 
    * Interactive elements possess strong visual focus indicators (`box-shadow` halos).
    * The 'Add/Edit' modal employs strict Focus Trapping. You cannot tab out of the modal into the dimmed background, and pressing `Escape` quickly closes it.
* **Accessible Collapsibles:** Description toggles make use of `aria-expanded` and `aria-controls` to programmatically expose whether the extra details are visible.
