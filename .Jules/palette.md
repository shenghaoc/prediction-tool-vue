## 2024-05-29 - Added Tooltip to Theme Toggle Button
**Learning:** Found a common UX oversight: icon-only buttons with `aria-label` are accessible to screen readers, but sighted users still have to guess what the icon means. Adding a tooltip bridges this gap, providing visual context for all users.
**Action:** Always wrap icon-only buttons in tooltips to provide visual context alongside `aria-label` for screen readers.

## 2024-05-29 - Added Aria Label to Price Trend Chart
**Learning:** Data visualizations like line charts rendered inside `div` elements are completely invisible to screen readers unless explicitly marked with `role="img"` and given a descriptive `aria-label`.
**Action:** Always add `role="img"` and `aria-label` to custom chart components to ensure screen reader users understand the purpose of the visualization.
