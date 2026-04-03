# Boolean Synth - Design & UX Guidelines

This document establishes the design, user experience, and architectural rules for the **Boolean Synth** project. These guidelines must be strictly followed to maintain visual and developmental consistency.

## 🧠 Design Philosophy

- **Dark-first UI:** The interface must be designed primarily and foremost for dark mode.
- **Inspiration:**
  - Electronic circuits.
  - Simulation interfaces.
  - "Engineering tool" focused aesthetics.
- **Core Priorities:**
  - Clarity over decoration.
  - Immediate visual feedback.
  - Low cognitive noise.
- **Product Mental Model:** 
  - *This is NOT a simple editor. It is an "interactive logic laboratory".*

---

## 🎨 Design Tokens & Color Palette

### Main Colors

| Category | CSS Variable | HEX/RGBA Value | Description & Usage |
|-----------|--------------|----------------|-------------------|
| 🔵 **Primary (Neon Tech Blue)** | `--color-primary` | `#22D3EE` | Primary buttons (Simulate, Simplify), selected gates. |
| | `--color-primary-hover` | `#06B6D4` | Hover state for primary elements. |
| | `--color-primary-glow` | `rgba(34, 211, 238, 0.4)` | Glow effect for active states and focus. |
| 🌌 **Background** | `--color-bg-main` | `#0B1220` | Main canvas. |
| | `--color-bg-panel` | `#111827` | Side panels. |
| | `--color-bg-elevated` | `#1F2937` | Cards, modals, floating elements. |
| | `--color-bg-grid` | `#0F172A` | Base for the grid pattern. |
| ⚪ **Text** | `--color-text-primary` | `#E5E7EB` | Titles, inputs (high priority). |
| | `--color-text-secondary`| `#9CA3AF` | Labels, normal text (medium priority). |
| | `--color-text-muted` | `#6B7280` | Hints, references (low priority). |
| 🟢 **States (Truth Table)** | `--color-success` | `#22C55E` | True state (`1`), success. |
| | `--color-error` | `#EF4444` | False state (`0`), error. |
| 🟣 **Accent (Optional)** | `--color-accent` | `#8B5CF6` | Advanced features (Student Mode, AI hints). |

### 🧱 Borders and Surfaces

```css
:root {
  --radius-sm: 6px;
  --radius-md: 10px;
  --radius-lg: 16px;
  --border-color: rgba(255, 255, 255, 0.08); /* Soft, almost invisible borders */
  --border-focus: var(--color-primary);      /* Glow on focus */
}
```

### ✨ Effects (Glow & Patterns)

- **Glow (Key Visual Identity Component):**
  - Variable: `--glow-primary: 0 0 10px rgba(34, 211, 238, 0.5);`
  - Usage: Selected gates, active buttons, and text inputs in focus state.
- **Grid Pattern (Canvas):** Used in the main workspace area.
  ```css
  background-image: 
    linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px);
  background-size: 20px 20px;
  ```

### 🔤 Typography

- **Font Family:** `Inter, system-ui, sans-serif`
- **Scale:**
  - `--text-sm`: `12px`
  - `--text-md`: `14px`
  - `--text-lg`: `18px`
  - `--text-xl`: `24px`

---

## 🧩 Base Components

### 🔘 Buttons

**Primary Button**
- Background: `var(--color-primary)`
- Text Color: `#001018`
- Border-radius: `var(--radius-md)`
- **Hover/Active:** Background changes to `var(--color-primary-hover)` and adds `box-shadow: var(--glow-primary)`

**Secondary Button**
- Background: `transparent`
- Border: `1px solid var(--border-color)`
- Text Color: `var(--color-text-primary)`

### 📝 Inputs (Logic Editor)
- Background: `var(--color-bg-elevated)`
- Border: `1px solid var(--border-color)`
- Text Color: `var(--color-text-primary)`
- **Focus:** `border-color: var(--color-primary)` with `box-shadow: var(--glow-primary)`

### 🖥️ UI Structure

**Side Panel**
- Background: `bg-panel`
- Padding: Ample padding for breathing room.
- Behavior: Vertical scroll, grouped and collapsible sections.

**Gates (Logic Gates)**
- Stroke/Border: Primary (`var(--color-primary)`).
- Thickness: Consistent across all SVG/Nodes.
- **Hover/Active:** Add Glow.

**Wires / Connections**
- Inactive Color: `#38BDF8`
- **Active State (current flowing):** Color changes to `#22D3EE` + Glow effect.

**Truth Table**
- Layout: Elevated dark background (`bg-elevated`). Soft borders.
- Logic States: `1` => Green text/background (`var(--color-success)`), `0` => Red text/background (`var(--color-error)`).

---

## 🧭 UX Guidelines

1. **Real-Time Reaction:** Any change in input syntax or layout should be reflected in real-time without page reloads.
2. **Inline Feedback > Modals:** Avoid excessive use of modals. Prioritize banners, tooltips, and inline validation.
3. **Interactions:**
   - Fluid drag & drop for gates.
   - Hover must always provide useful information on what that element does.

---

## 🤖 AI Development Instructions

> [!IMPORTANT]
> STRICT DEVELOPMENT RULES FOR AI ASSISTANTS:

1. **Reusability:** Always work with the mindset of reusing components and styles using Tailwind or existing CSS classes.
2. **Componentization:** Create modular React components for any visual element that repeats or groups logic (e.g., cards, inputs).
3. **Directory Structure:** Manage folders and subfolders (`components/`, `hooks/`, `utils/`) semantically according to the modules you are working on.
4. **Dependencies:** **Under no circumstances** should you make structural configurations or install third-party libraries (via pnpm) without first consulting and getting explicit confirmation from the user.
