# 3x-haust-todo-list-react Design System

## Design References
- Cursor (AI IDE) from https://github.com/VoltAgent/awesome-design-md: Sleek dark AI editor style with focused sidebars, gradient accents, and task-oriented composition. Traits to reinterpret: dark editor chrome, AI assistant panel, file tree rhythm, gradient accents, focused workbench. Raw reference: https://raw.githubusercontent.com/VoltAgent/awesome-design-md/main/design-md/cursor/DESIGN.md
- VoltAgent (AI agent systems) from https://github.com/VoltAgent/awesome-design-md: Void-black agent framework aesthetic with emerald accents, terminal-native surfaces, and explicit workflow topology. Traits to reinterpret: dark command center, agent graph, terminal panels, status telemetry, emerald highlights. Raw reference: https://raw.githubusercontent.com/VoltAgent/awesome-design-md/main/design-md/voltagent/DESIGN.md
- Linear (Productivity SaaS) from https://github.com/VoltAgent/awesome-design-md: Ultra-minimal engineering product UI with precise hierarchy, issue streams, and restrained purple accent. Traits to reinterpret: dense lists, precise hierarchy, minimal chrome, command palette feel, status chips. Raw reference: https://raw.githubusercontent.com/VoltAgent/awesome-design-md/main/design-md/linear.app/DESIGN.md

These references are used as design-system inspiration only. Do not copy brand assets, logos, proprietary copy, or exact visual identity. Reinterpret layout density, component rhythm, status language, and interaction patterns for this project.

## Visual Theme
Use Cursor as the primary product feel and VoltAgent as the secondary restraint. The first screen must show the actual usable product, not a placeholder or generic landing page. The user should immediately see what can be controlled, what state the system is in, and what result will be produced.

## Color Palette
- Primary ink: #162033 for important text and control labels.
- Surface: #ffffff, #f7fafc, and #eef2f6 for layered application areas.
- Border: #d7e0eb for precise dashboard separation.
- Accent: #1f7668 for active AI/automation decisions.
- Warning: #b44942 for errors, missing configuration, or risky publish actions.

## Typography
Use a fast system sans-serif stack. Keep Korean and English labels readable in dense cards. Letter spacing must stay at 0. Do not scale font size with viewport width.

## Components
- Primary command area with clear inputs and one main action.
- Repeated result cards for generated artifacts.
- Status chips for loading, success, blocked, and error states.
- Empty state copy that tells the user what data is missing.
- Error state that shows a useful recovery path.
- Copy/export or publish-check controls where generated content appears.

## Layout
Use full-width page bands or unframed application areas with constrained inner content. Cards are for repeated artifacts and tool panels only. The top viewport should expose the main workflow and at least one live state/result area.

## Responsive Behavior
Desktop layouts may use two or three columns. Tablet and mobile must collapse to a single column with stable input, button, and card dimensions. Text must not overflow controls or overlap adjacent sections.

## Quality Checklist
- Actual app experience appears in the first viewport.
- At least three controls are operable unless the user explicitly requested a static page.
- Loading, empty, error, and success states are represented.
- Responsive layout evidence exists in CSS or utility classes.
- Build passes.
- Secrets and tokens stay in environment variables or deployment env, not committed source.
