## 2025-05-30 - Added tooltips and improved focus states
**Learning:** Icon-only buttons (like the theme toggle) lack visual context for sighted users without a tooltip. The keyboard focus rings were inconsistent between `Button`, `Input`, and `Select`.
**Action:** Always wrap icon-only buttons in tooltips to provide context, and ensure focus rings have consistent visual weight (e.g., `ring-2` and `ring-offset-2`) across all interactive elements for accessible keyboard navigation.
