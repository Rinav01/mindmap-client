# 🧠 MindMap Pro — Collaborative Infinite Canvas Engine

A high-performance, professional-grade mind mapping application built with **React 19**, **TypeScript**, **Vite**, **Tailwind CSS v4**, and **Zustand**.

This project serves as a deep-dive into advanced frontend engineering, focusing on custom canvas interaction models, high-performance rendering, complex state synchronization, and **real-time collaboration**.

---

## 🏗️ Technical Architecture

The application is built on a decoupled, six-layer architecture designed for scale and performance:

1.  **State Layer (Zustand)**: A centralized "Source of Truth" managing the node graph, selection sets, and history snapshots.
2.  **Motion Layer (Custom Engine)**: A specialized animation system that bridges the gap between React's state updates and smooth visual transitions using the FLIP technique.
3.  **Interaction Layer**: Manages world-to-screen coordinate transformations for zooming, panning, and lasso selection.
4.  **Rendering Layer (SVG)**: A declarative SVG engine that uses React 19's optimized reconciliation to render thousands of nodes and bezier edges.
5.  **Collaboration Layer (Socket.io)**: A real-time event bus that synchronizes node operations (drag, edit, delete) across multiple connected clients.
6.  **API Layer (Service)**: A robust synchronization layer with JWT-based auth and automated persistence.

---

## 🧩 Deep Dive: Core Features & Implementation

### 🎬 Custom Motion Engine (FLIP Architecture)
The `motionEngine.ts` is the heart of the editor's visual polish. It solves the "staccato" jump problem during layout changes (like auto-layout or branch collapse).

-   **Capture Phase**: Records every node's viewport position and converts it to **World Coordinates** using `getScreenCTM().inverse()`.
-   **Execution Phase**: Performs the React state update (e.g., new coordinates from the layout algorithm).
-   **Inversion Phase**: Calculates the delta (dx, dy) between the old world-space position and the new DOM position.
-   **Play Phase**: Uses the **Web Animations API** to apply a counter-transform and animate it back to `(0, 0)` with a `cubic-bezier(0.2, 0.8, 0.2, 1)` easing.

### 🌐 Real-Time Collaboration
The application supports multi-user sessions via a dedicated `SocketService`:
-   **Optimistic UI**: Local changes are applied immediately while socket events are emitted in the background.
-   **Event Synchronization**: Handles `node-added`, `node-dragged`, `node-updated`, and `node-deleted` events.
-   **Room Management**: Users join specific "maps" (rooms) to ensure updates are scoped to the active document.

### 📐 Recursive Tree Layout Algorithm
The `autoLayout` feature implements a custom hierarchical tree arrangement:
-   **Depth-First Traversal**: Recursively visits subtrees to calculate required vertical space.
-   **Collision Avoidance**: Maintains a global `subtreeYOffset` to ensure independent root nodes do not overlap.
-   **Coordinate Normalization**: A defensive normalization layer ensures data sanity before layout calculation.

### 📜 Persistent Version Snapshots
Beyond standard Undo/Redo, the system features a robust **Snapshot & Restore** system:
-   **Atomic Snapshots**: Captures the entire graph state and persists it to the backend.
-   **Defensive Restoration**: Performs a "Hot Swap" of the state, animating nodes from their current positions to their "historical" positions.

---

## 🎛️ User Interface & Controls

The editor is equipped with professional-grade tools for power users:

### ⌨️ Keyboard Shortcuts
| Key | Action |
| :--- | :--- |
| `Space + Drag` | Pan Canvas |
| `Scroll` | Zoom In / Out |
| `Ctrl + Z` | Undo |
| `Ctrl + Y` | Redo |
| `Delete` | Delete Selected Node |
| `Escape` | Deselect All |
| `Double Click` | Edit Node Text |
| `Enter` | Confirm Text Edit |

### 🛠️ HUD Components
-   **Mini Navigator**: A real-time minimap visualization of the entire canvas for quick navigation.
-   **Floating Toolbar**: Context-aware actions (colors, layout) appearing near the selection.
-   **Version Panel**: Timeline view for restoring previous map states.
-   **Zoom Controls**: Granular zoom management alongside mouse gestures.

---

## 📂 Project Structure

The codebase follows a modular design to separate domain logic from UI presentation:

```text
src/
├── app/              # Application entry point and route definitions
├── components/       # UI Components
│   ├── editor/       # Core canvas components (Canvas, Node, Layers, Navigator)
│   ├── layout/       # App-wide layout components (Sidebar, Topbar)
│   └── ui/           # Reusable atomic UI components (Toast, Button)
├── context/          # React Contexts (DragContext)
├── engine/           # Pure logic engines (MotionEngine, Layout algorithms)
├── hooks/            # Custom React hooks (useDragEngine)
├── pages/            # View-level components (Dashboard, Editor)
├── services/         # API client and Socket.io service integration
├── store/            # Zustand state stores (EditorStore, MapsStore)
├── styles/           # Global design tokens and Tailwind v4 configuration
└── types/            # Centralized TypeScript interfaces
```

---

## 🧰 Tech Stack Detail

-   **React 19**: Leverages improved concurrency and faster reconciliation.
-   **Tailwind CSS v4**: Utilizes the new high-performance engine for styling.
-   **Zustand 5**: Manages complex, nested state with optimized selectors.
-   **Socket.io-client**: Real-time bidirectional event-based communication.
-   **Vite 7**: Next-generation frontend tooling.

---

## 🧪 Development

### Prerequisites
-   Node.js 20+
-   A running instance of the MindMap Backend (with Socket.io support)

### Setup
```bash
# Clone the repository
git clone https://github.com/your-username/mindmap-client.git

# Install dependencies
npm install

# Configure Environment
# Create a .env file with VITE_API_URL pointing to your backend
# Example: VITE_API_URL=http://localhost:5000

# Start development server
npm run dev
```

---

## 🎯 Engineering Highlights
This project demonstrates mastery of:
1.  **Coordinate Geometry**: Handling SVG coordinate spaces and matrix transformations.
2.  **Distributed State**: Managing optimistic updates vs. server authority.
3.  **Performance Optimization**: `requestAnimationFrame` loops and direct DOM manipulation for 60fps interactions.
4.  **System Design**: Clean separation between the engine logic, state management, and UI.

---

## 📜 License
MIT License.
