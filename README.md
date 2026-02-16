# Boolean Synth ⚡️

[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?style=flat&logo=vercel)](https://boolean-synth.vercel.app/)
[**Live Demo →**](https://boolean-synth.vercel.app/)

Boolean Synth is a high-performance, interactive tool for designing, simplifying, and visualizing Boolean logic circuits. It bridges the gap between algebraic expressions and physical logic gate diagrams with real-time bidirectional synchronization.

![Boolean Synth UI](https://raw.githubusercontent.com/your-username/boolean-synth/main/public/preview.png) *(Note: Placeholder for actual screenshot)*

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

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

Built with ❤️ for logic enthusiasts.
