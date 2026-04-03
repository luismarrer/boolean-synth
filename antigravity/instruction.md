# Boolean Synth — Instruction Guide for Antigravity

## 🧠 Project Vision

**Boolean Synth** is an interactive web application that allows users to:
- Build logic circuits visually
- Convert circuits into Boolean expressions
- Convert Boolean expressions into circuits
- Simplify expressions
- Learn step-by-step (Student Mode)

The goal is to create a **clean, minimal, and powerful educational + engineering tool** — something between:
- Logic.ly (visual)
- Symbolab (step-by-step solving)
- Desmos (interactive feedback)

## 🏗️ Project Architecture

### Tech Stack

| Layer | Technology |
|---|---|
| UI Framework | React 19 + TypeScript |
| Bundler | Vite |
| Styling | Tailwind CSS v4 |
| Graph / Canvas | ReactFlow |
| Animations | Framer Motion |
| Icons | Lucide React |
| Package Manager | pnpm |

### Application Layers

#### 1. UI Layer (`src/components/`)
React components that render the interface. They communicate with the global state defined in `App.tsx`. They do not contain direct Boolean logic.

- **`CircuitBoard`**: The interactive canvas where the user builds the circuit by dragging gates. Uses ReactFlow.
- **`ComponentLibrary`**: Drag-and-drop panel with available logic gates (AND, OR, NOT, etc.).
- **`TruthTable`**: Evaluates the current circuit and generates the truth table on the fly.
- **`Nodes`**: Defines the visual appearance of each node type (Input, Output, Gate).
- **`LogicGateSymbols`**: SVGs of logic gates used within the nodes.

#### 2. Logic Layer (`src/logic/`)
Pure TypeScript modules (no React or UI dependencies). Contains all the Boolean reasoning of the project.

- **`ast.ts`**: Types and interfaces representing the Abstract Syntax Tree (AST) of a Boolean expression.
- **`parser.ts`**: Converts a text string like `"A AND (B OR NOT C)"` into an AST.
- **`simplifier.ts`**: Applies algebraic Boolean rules (absorption, De Morgan, etc.) to the AST.
- **`generator.ts`**: Takes an AST and produces the nodes and edges to render in ReactFlow.
- **`layout.ts`**: Calculates X/Y positions of the nodes for a clean and readable layout.

#### 3. Global State (`App.tsx`)
`App.tsx` acts as the central controller: it maintains the state of ReactFlow nodes/edges and orchestrates the transformations between the UI layer and the Logic layer.

---

## 🎯 Core Philosophy

- Minimal UI, maximum clarity
- Real-time feedback
- Bidirectional transformation (circuit ⇄ expression)
- Educational depth without overwhelming the user
- Deterministic and explainable logic (no "black box")

## 🧠 UX Principles

- Instant feedback (no "submit" button)
- Visual + symbolic synchronization
- Errors should be visible and understandable
- No clutter

## ✅ Definition of Done

A user can:
- Build a circuit
- Instantly see its Boolean expression
- Input an expression and see the circuit
- Simplify expressions
- Understand *why* simplifications happen

## 🧠 Guiding Principle

> "Make Boolean logic feel alive."

Not just correct — **interactive, visual, and intuitive**.

---