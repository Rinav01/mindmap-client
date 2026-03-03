# 🧠 MindMap Pro — Collaborative Infinite Canvas Engine

[![React](https://img.shields.io/badge/React-19.2-61DAFB?logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178C6?logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.0-38B2AC?logo=tailwind-css)](https://tailwindcss.com/)
[![Zustand](https://img.shields.io/badge/Zustand-5.0-orange)](https://zustand-demo.pmnd.rs/)
[![Socket.io](https://img.shields.io/badge/Socket.io-4.8-black?logo=socket.io)](https://socket.io/)

MindMap Pro is a high-performance, professional-grade collaborative mind mapping application. It is engineered to handle complex node graphs with smooth 60fps interactions, real-time multi-user synchronization, and a custom animation engine.

---

## 📖 Table of Contents
- [🚀 Key Features](#-key-features)
- [🏗️ Technical Architecture](#️-technical-architecture)
- [🎬 Deep Dive: Motion Engine (FLIP)](#-deep-dive-motion-engine-flip)
- [📐 Coordinate System & Transformation](#-coordinate-system--transformation)
- [🤝 Real-Time Collaboration Protocol](#-real-time-collaboration-protocol)
- [📦 State Management & Optimistic UI](#-state-management--optimistic-ui)
- [📂 Project Structure](#-project-structure)
- [🧰 Tech Stack](#-tech-stack)
- [🧪 Development & Setup](#-development--setup)
- [📜 Keyboard Shortcuts](#-keyboard-shortcuts)

---

## 🚀 Key Features

### 🎨 Infinite Canvas & Rendering
-   **SVG-Based Rendering**: Leverages the browser's native SVG engine for declarative, scalable, and performant rendering of thousands of nodes and bezier connections.
-   **Mini-Map Navigator**: A real-time, high-fidelity visualization of the entire canvas. It allows users to jump to any location instantly by clicking or dragging on the navigator.
-   **Lasso Selection**: Support for area-based multi-node selection, enabling batch operations such as dragging, alignment, and deletion.
-   **Snapping & Alignment**: Integrated snapping guides for precise node positioning and professional alignment tools (Left, Center, Right, Top, Middle, Bottom).

### 🤝 Advanced Collaboration
-   **Live Cursors**: High-frequency (20Hz) synchronization of peer cursor positions with smooth interpolation and color-coded labels.
-   **Presence Awareness**: Real-time tracking of active users within a specific map, including editing states and session metadata.
-   **Remote Editing Locks**: Visual indicators that prevent write conflicts by showing when a peer is actively editing a node's text.
-   **Version Snapshots**: Automated and manual "Time Machine" snapshots, allowing users to restore previous states with full animated transitions.

### 🛠️ Intelligent Layouts
-   **Recursive Auto-Layout**: A hierarchical tree arrangement algorithm that calculates depth-first subtree dimensions to optimize space and prevent node overlaps.
-   **Branch Collapse/Expand**: Intelligently toggles visibility of subtrees, automatically adjusting the rest of the map's layout to fill the void or make space.

---

## 🏗️ Technical Architecture

The application is built on a decoupled, multi-layered architecture designed for high maintainability and performance:

1.  **Rendering Layer (SVG)**: The core UI layer. Unlike Canvas API, SVG allows for easy event delegation, CSS styling, and standard accessibility features.
2.  **Interaction Layer (Hooks)**: Managed by `useDragEngine`. This layer abstracts complex mouse and touch interactions (drags, pans, zooms) into atomic state changes.
3.  **Animation Layer (Motion Engine)**: A specialized engine that bridges the gap between React's declarative state and the browser's Imperative Web Animations API.
4.  **State Layer (Zustand)**: A centralized, atomic store that manages the graph structure, history stack, and real-time peer data.
5.  **Synchronization Layer (Socket.io)**: A bidirectional event bus that ensures all clients converge on the same state with minimal latency.

---

## 🎬 Deep Dive: Motion Engine (FLIP)

The `motionEngine.ts` is responsible for "Smoothing" the transitions when the graph structure changes (e.g., during Auto-Layout). It implements a refined version of the **FLIP** technique:

1.  **Capture (First)**: Before the state update, the engine records the viewport positions of all nodes using `getBoundingClientRect()` and converts them to **World Coordinates** using the SVG's inverse CTM (Current Transformation Matrix).
2.  **Commit (Last)**: React performs the state update (e.g., updating node `x` and `y` in the store). The DOM re-renders.
3.  **Invert (Invert)**: The engine calculates the delta (`dx`, `dy`) between the old world-space position and the new DOM position. It then applies a counter-transform to visually "lock" the nodes in their old positions.
4.  **Play (Play)**: Using the **Web Animations API**, the engine animates the `transform` from the delta back to `0, 0` using a custom `cubic-bezier(0.2, 0.8, 0.2, 1)` easing for a professional, snappy feel.

---

## 📐 Coordinate System & Transformation

Managing an infinite canvas requires mapping between different coordinate spaces:

-   **Screen Space**: Pixel coordinates relative to the browser viewport (e.g., `e.clientX`).
-   **SVG Space (World Space)**: The absolute coordinate system of the mind map, independent of zoom or pan.
-   **Group Space**: Coordinates relative to a specific parent node or group.

**Transformation Logic:**
The application uses `getScreenCTM().inverse()` to map screen coordinates to world coordinates. This ensures that features like **Lasso Selection** and **Node Dragging** remain accurate regardless of the current zoom level (0.1x to 3x) or pan offset.

---

## 🤝 Real-Time Collaboration Protocol

Synchronization is handled via a dedicated `SocketService` following an "Event-Sourcing" light pattern:

| Event | Direction | Description |
| :--- | :--- | :--- |
| `join-map` | Client -> Server | Joins a specific map room and announces presence. |
| `node-dragged` | Client -> Server | Emits real-time position updates during a drag operation. |
| `cursor-moved` | Client -> Server | Throttled (50ms) emission of world-space cursor coordinates. |
| `node-editing` | Client -> Server | Signals that a node is being edited, locking it for others. |
| `map-restored` | Client -> Server | Forces all clients to hydrate their state from a specific snapshot. |

---

## 📦 State Management & Optimistic UI

We use **Zustand** with custom middleware for history management:

-   **Optimistic Updates**: When a node is dragged or a color is changed, the local state is updated immediately for zero-latency feedback.
-   **Sync-Back**: The `EditorStore` then asynchronously persists the change to the REST API and emits the corresponding socket event.
-   **Conflict Resolution**: In the event of a network failure, the store can roll back to the last "server-confirmed" state or use the `historyIndex` to restore consistency.

---

## 📂 Project Structure

```text
src/
├── app/              # Main App entry, Router definitions
├── components/       # UI & Domain Components
│   ├── editor/       # Core Canvas components
│   │   ├── Canvas.tsx          # Master SVG & Interaction container
│   │   ├── Node.tsx            # SVG Group representing a node
│   │   ├── EdgeLayer.tsx       # Curved bezier connection renderer
│   │   ├── MiniNavigator.tsx   # Scaling-down canvas visualization
│   │   └── CursorLayer.tsx     # Peer cursor visualization
│   ├── layout/       # Sidebar, Topbar, Dashboard Shell
│   └── ui/           # Atomic components (Toast, Modals, Buttons)
├── engine/           # Pure Logic: Motion Engine, Layout Algorithms
├── hooks/            # Logic Hooks: useDragEngine (interaction logic)
├── services/         # Infrastructure: API (Axios), Socket.io
├── store/            # State: EditorStore (Nodes/History), AuthStore (User/JWT)
└── types/            # Centralized TypeScript interfaces
```

---

## 🧰 Tech Stack

-   **Framework**: [React 19](https://react.dev/) (Leveraging Concurrent Mode & Transitions).
-   **Language**: [TypeScript 5.7+](https://www.typescriptlang.org/).
-   **Build Tool**: [Vite 7](https://vitejs.dev/).
-   **State**: [Zustand 5](https://github.com/pmndrs/zustand).
-   **Styling**: [Tailwind CSS v4](https://tailwindcss.com/) (New high-performance engine).
-   **Real-Time**: [Socket.io-client 4.8](https://socket.io/).
-   **Animations**: [Web Animations API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Animations_API) & [Framer Motion](https://www.framer.com/motion/).

---

## 🧪 Development & Setup

### Prerequisites
-   Node.js 20+
-   MindMap Pro Backend (running on port 5000)

### Getting Started
1.  **Clone the Repository**
    ```bash
    git clone https://github.com/your-username/mindmap-client.git
    cd mindmap-client
    ```
2.  **Install Dependencies**
    ```bash
    npm install
    ```
3.  **Configure Environment**
    Create a `.env` file:
    ```env
    VITE_API_URL=http://localhost:5000/api
    VITE_SOCKET_URL=http://localhost:5000
    ```
4.  **Run Development Server**
    ```bash
    npm run dev
    ```

---

## 📜 Keyboard Shortcuts

| Category | Command | Key |
| :--- | :--- | :--- |
| **Navigation** | Pan Canvas | `Space + Drag` / `Middle Mouse` |
| | Zoom In/Out | `Scroll Wheel` / `Ctrl + +/-` |
| | Fit to Screen | `Ctrl + 0` |
| **Editing** | Create Child | `Tab` |
| | Delete Node | `Delete` / `Backspace` |
| | Undo / Redo | `Ctrl + Z` / `Ctrl + Shift + Z` |
| | Edit Text | `Double Click` / `Enter` |
| **Layout** | Auto-Layout | `Ctrl + L` |
| | Align Nodes | `Ctrl + [Arrows]` |

---

## 🎯 Engineering Highlights
-   **Performance**: Selective re-rendering ensures that dragging a node only re-renders the node and its immediate edges, not the entire graph.
-   **Robustness**: Defensive data normalization handles MongoDB-specific formats (`$oid`) seamlessly.
-   **UX**: Smooth inertia-based panning and spring-based zooming for a "Premium" feel.

---

## 📜 License
This project is licensed under the MIT License.
