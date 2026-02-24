# 🧠 MindMap Pro — Advanced Canvas-Based Mind Mapping Engine

A high-performance, professional-grade mind mapping application built with **React 19**, **TypeScript**, **Vite**, **Tailwind CSS v4**, and **Zustand**.

This project serves as a deep-dive into advanced frontend engineering, focusing on custom canvas interaction models, high-performance rendering, and complex state synchronization.

---

## 🏗️ Technical Architecture

The application is built on a decoupled, five-layer architecture designed for scale and performance:

1.  **State Layer (Zustand)**: A centralized "Source of Truth" managing the node graph, selection sets, and history snapshots.
2.  **Motion Layer (Custom Engine)**: A specialized animation system that bridges the gap between React's state updates and smooth visual transitions using the FLIP technique.
3.  **Interaction Layer**: Manages world-to-screen coordinate transformations for zooming, panning, and lasso selection.
4.  **Rendering Layer (SVG)**: A declarative SVG engine that uses React 19's optimized reconciliation to render thousands of nodes and bezier edges.
5.  **API Layer (Service)**: A robust synchronization layer with JWT-based auth and automated persistence.

---

## 🧩 Deep Dive: Core Features & Implementation

### 🎬 Custom Motion Engine (FLIP Architecture)
The `motionEngine.ts` is the heart of the editor's visual polish. It solves the "staccato" jump problem during layout changes (like auto-layout or branch collapse).

-   **Capture Phase**: Records every node's viewport position and converts it to **World Coordinates** using `getScreenCTM().inverse()`. This ensures animations remain stable even if the user zooms or pans during the transition.
-   **Execution Phase**: Performs the React state update (e.g., new coordinates from the layout algorithm).
-   **Inversion Phase**: Calculates the delta (dx, dy) between the old world-space position and the new DOM position.
-   **Play Phase**: Uses the **Web Animations API** to apply a counter-transform and animate it back to `(0, 0)` with a `cubic-bezier(0.2, 0.8, 0.2, 1)` easing.
-   **Double-Frame Buffering**: Utilizes nested `requestAnimationFrame` calls to ensure the browser has painted the React update before measuring the "final" state.

### 📐 Recursive Tree Layout Algorithm
The `autoLayout` feature implements a custom hierarchical tree arrangement:
-   **Depth-First Traversal**: Recursively visits subtrees to calculate required vertical space.
-   **Subtree Height Aggregation**: Nodes are positioned at `x = depth * spacing`, while `y` is centered based on the total height of their children.
-   **Collision Avoidance**: Maintains a global `subtreeYOffset` to ensure independent root nodes (multiple trees on one canvas) do not overlap.
-   **Coordinate Normalization**: A defensive normalization layer ensures that MongoDB ObjectIDs and raw coordinate data are sanitized into a strict TypeScript `NodeType` interface before layout calculation.

### 📜 Persistent Version Snapshots
Beyond standard Undo/Redo, the system features a robust **Snapshot & Restore** system:
-   **Atomic Snapshots**: Captures the entire graph state (nodes, coordinates, styles) and persists it to the backend with a custom name.
-   **Defensive Restoration**: When restoring, the system performs a "Hot Swap" of the state. It uses the **Motion Engine** to animate nodes from their current positions to their "historical" positions, providing visual continuity.
-   **Integrity Checks**: Validates parent-child relationships during restoration to prevent orphaned nodes or circular references.

### 🧲 Professional Layout Tools
-   **Alignment Suite**: Multi-node alignment (Left, Center, Right, Top, Middle, Bottom) calculating the bounding box of the selection set.
-   **Distribution Logic**: Calculates the total span of the selection and distributes nodes with equal gutter spacing.
-   **Reparenting Engine**: Allows batch-moving subtrees. When a parent changes, the system recursively updates the coordinates of all descendants to maintain the relative visual structure.

---

## ⚡ Performance Engineering

-   **GPU Acceleration**: Drag operations manipulate DOM transforms directly via refs, bypassing React's reconciliation during high-frequency mouse events.
-   **Render Isolation**: Extensive use of `React.memo` and stable function references to ensure that moving one node doesn't trigger a re-render of the entire graph.
-   **O(1) Lookups**: Uses `Set<string>` for selection management, ensuring performance remains constant regardless of the number of selected nodes.
-   **Debounced Sync**: Backend persistence is batched and debounced to minimize network overhead during rapid manipulations.

---

## 📂 Project Structure

The codebase follows a modular design to separate domain logic from UI presentation:

```text
src/
├── app/              # Application entry point and route definitions
├── components/       # UI Components
│   ├── editor/       # Core canvas components (Canvas, Node, Edge, Layers)
│   ├── layout/       # App-wide layout components (Sidebar, Topbar)
│   └── ui/           # Reusable atomic UI components (Toasts, Buttons)
├── context/          # React Contexts for cross-cutting concerns (e.g., DragContext)
├── engine/           # Pure logic engines (MotionEngine, Layout algorithms)
├── hooks/            # Custom React hooks (useDragEngine, useKeyboard)
├── pages/            # View-level components (Dashboard, Editor)
├── services/         # API client and backend service integration
├── store/            # Zustand state stores (EditorStore, MapsStore)
├── styles/           # Global design tokens and Tailwind v4 configuration
└── types/            # Centralized TypeScript interfaces and enums
```

---

## 🧰 Tech Stack Detail

-   **React 19**: Leverages improved concurrency and faster reconciliation for SVG elements.
-   **Tailwind CSS v4**: Utilizes the new high-performance engine for styling the UI overlay and property panels.
-   **Zustand 5**: Manages the complex, nested state of the mind map with minimal boilerplate and optimized selector-based re-renders.
-   **Vite 7**: Provides a near-instant development experience and optimized production builds.

---

## 🧪 Development

### Prerequisites
-   Node.js 20+
-   A running instance of the [MindMap Backend](https://github.com/your-username/mindmap-backend)

### Setup
```bash
# Clone the repository
git clone https://github.com/your-username/mindmap-client.git

# Install dependencies
npm install

# Configure Environment
# Create a .env file with VITE_API_URL pointing to your backend

# Start development server
npm run dev
```

---

## 🎯 What This Project Demonstrates
This is a portfolio-ready engineering project that showcases:
1.  **Coordinate Geometry**: Proficient handling of SVG coordinate spaces and matrix transformations.
2.  **State Complexity**: Management of non-linear, hierarchical data structures.
3.  **Visual Polish**: Implementation of professional-grade micro-interactions and animations.
4.  **System Design**: Clean separation between the engine logic and the UI presentation.

---

## 📜 License
MIT License.
