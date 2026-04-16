# Boolean Synth ⚡️

[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?style=flat&logo=vercel)](https://boolean-synth.vercel.app/)
[![Run Tests](https://github.com/luismarrer/boolean-synth/actions/workflows/test.yml/badge.svg)](https://github.com/luismarrer/boolean-synth/actions/workflows/test.yml)
[**Live Demo →**](https://boolean-synth.vercel.app/)

Boolean Synth is a high-performance, interactive tool for designing, simplifying, and visualizing Boolean logic circuits. It bridges the gap between algebraic expressions and physical logic gate diagrams with real-time bidirectional synchronization.

<!-- ![Boolean Synth UI](https://raw.githubusercontent.com/your-username/boolean-synth/main/public/preview.png)  -->
<!-- TODO: Add screenshot of the app -->

## ✨ Features

- **Real-time Synthesis**: Instantly convert complex Boolean expressions into clean, auto-layout logic diagrams.
- **Bidirectional Sync**: Modify the algebraic expression to update the graph, or manipulate the graph to update the expression.
- **Advanced Parsing**: Supports implicit multiplication (`ab`), common operators (`+`, `'`, `^`), and functions like `NAND(a,b)`.
- **Expression Simplification**: One-click simplification of Boolean expressions using algebraic reduction.
- **Interactive Circuit Board**: Powered by React Flow, offering a smooth, zoomable, and draggable interface for exploring logic structures.
- **Modern Aesthetics**: A premium glassmorphism UI built with Tailwind CSS 4 and Framer Motion, optimized for dark mode.

## 🛠 Tech Stack

- **Framework**: [React 19](https://react.dev/)
- **Build Tool**: [Vite](https://vitejs.dev/)
- **Diagram Engine**: [React Flow](https://reactflow.dev/)
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Package Manager**: [pnpm](https://pnpm.io/)

## 🚀 Getting Started

### Prerequisites

Ensure you have [Node.js](https://nodejs.org/) installed and [pnpm](https://pnpm.io/installation) configured.

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/boolean-synth.git
   cd boolean-synth
   ```

2. Install dependencies:
   ```bash
   pnpm install
   ```

3. Start the development server:
   ```bash
   pnpm dev
   ```

## 📖 Usage & Syntax

| Operation | Syntax | Example |
| :--- | :--- | :--- |
| **AND** | `ab` or `a*b` | `abc` |
| **OR** | `a+b` | `a+b+c` |
| **NOT** | `a'` | `(a+b)'` |
| **XOR** | `a^b` | `a^b` |
| **NAND** | `NAND(a,b)` | `NAND(a, b)` |

### Examples

- **Standard**: `(a+b)c'`
- **Complex**: `(ab)(a'b+ab')+(ab)'(a'b+ab')'`
- **Implicit**: `abc + def'`

## 🧬 Logic Module

The core logic is divided into:
- `parser.ts`: Tokenizes and parses strings into an Abstract Syntax Tree (AST).
- `simplifier.ts`: Applies Boolean algebra rules to reduce expression complexity.
- `layout.ts`: Computes node positions and edge connections for the logic gates.
- `generator.ts`: Reconstructs algebraic expressions from the graph state.

## 🧪 Testing & CI/CD

### Running Tests Locally

| Command | Description |
| :--- | :--- |
| `pnpm test` | Watch mode — re-runs on file changes |
| `pnpm test:run` | One-shot run — exits with code 0/1 |
| `pnpm test:coverage` | One-shot run + coverage report |
| `pnpm test:ui` | Open the Vitest browser UI |

Tests live colocated with the source they cover (e.g. `src/logic/parser.test.ts`, `src/components/TruthTable.test.tsx`).

---

### ⚙️ GitHub Actions CI

The workflow at `.github/workflows/test.yml` **automatically runs tests** on every push and pull request that touches:
- `src/**` or `tests/**`
- `package.json` or `pnpm-lock.yaml`
- `vite.config.ts` or any `tsconfig*.json`

The job is named **"Run Tests"** — this is the status check name you'll reference in branch protection.

**What it does:**
1. Checks out the code
2. Sets up Node 20 + pnpm 10 with a warm store cache
3. Runs `pnpm install --frozen-lockfile`
4. Runs the full test suite (`pnpm test:run`)
5. Generates a coverage report (`pnpm test:coverage`)

**A failing test fails the entire workflow and blocks merges.**

---

### 🔒 Enabling Branch Protection (GitHub)

To enforce that CI passes before any merge into `main`:

1. Go to **Settings → Branches** in your GitHub repo
2. Click **Add branch protection rule** for `main`
3. Enable **"Require status checks to pass before merging"**
4. Search for and select: **`Run Tests`**
5. Enable **"Require branches to be up to date before merging"**
6. Save

Once set, GitHub will block any PR merge if the **Run Tests** job fails.

---

### 🪝 Pre-push Hook (Husky)

A Husky `pre-push` hook runs `pnpm test:run` locally **before every `git push`**. If tests fail, the push is aborted automatically — no broken code reaches the remote.

The hook is installed automatically when you run `pnpm install` (via the `prepare` script).

> **Note for CI environments:** Husky skips itself when `CI=true` is set, so it won't interfere with GitHub Actions.

---

## 💡 About the Project

This project is inspired by my first Computer Science class in college and is currently serving as a test of the capabilities of the Google Antigravity editor.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

Built with ❤️ for logic enthusiasts.
