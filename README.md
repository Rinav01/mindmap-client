# 🧠 MindMap Pro — Collaborative Infinite Canvas Engine

[![React](https://img.shields.io/badge/React-19.2-61DAFB?logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178C6?logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.0-38B2AC?logo=tailwind-css)](https://tailwindcss.com/)
[![Zustand](https://img.shields.io/badge/Zustand-5.0-orange)](https://zustand-demo.pmnd.rs/)
[![Socket.io](https://img.shields.io/badge/Socket.io-4.8-black?logo=socket.io)](https://socket.io/)

MindMap Pro is a high-performance, professional-grade collaborative mind mapping application. It is engineered to handle complex node graphs with smooth 60fps interactions, real-time multi-user synchronization, and a custom motion engine.

---

## 📖 Table of Contents
- [🚀 Key Features](#-key-features)
- [🛠️ Editor Functionality](#️-editor-functionality)
- [🤝 Real-Time Collaboration](#-real-time-collaboration)
- [🏗️ Technical Architecture](#️-technical-architecture)
- [🎬 Deep Dive: Motion Engine (FLIP)](#-deep-dive-motion-engine-flip)
- [📐 Coordinate System & Transformation](#-coordinate-system--transformation)
- [📦 State Management & Optimistic UI](#-state-management--optimistic-ui)
- [📂 Project Structure](#-project-structure)
- [🧰 Tech Stack](#-tech-stack)
- [🧪 Development & Setup](#-development--setup)
- [📜 Keyboard Shortcuts](#-keyboard-shortcuts)

---

## 🚀 Key Features

### 🎨 Infinite Canvas & Rendering
- **SVG-Based Rendering**: Leverages the browser's native SVG engine for declarative, scalable, and performant rendering of thousands of nodes and bezier connections.
- **Mini-Map Navigator**: A real-time, high-fidelity visualization of the entire canvas. It allows users to jump to any location instantly by clicking or dragging on the navigator.
- **Lasso Selection**: Support for area-based multi-node selection, enabling batch operations such as dragging, alignment, and deletion.
- **Snapping & Alignment**: Integrated snapping guides for precise node positioning and professional alignment tools.

### ⚡ Intelligence & Automation
- **Recursive Auto-Layout**: A hierarchical tree arrangement algorithm that calculates depth-first subtree dimensions to optimize space and prevent node overlaps.
- **Branch Collapse/Expand**: Intelligently toggles visibility of subtrees, automatically adjusting the rest of the map's layout to fill the void or make space.
- **Fit to Screen**: Intelligent viewport calculation to center and scale the entire mind map within the visible area.

---

## 🛠️ Editor Functionality

### 📝 Node Management
- **Rich Node Properties**: Each node supports titles, detailed notes, and attachments.
- **Visual Customization**: Toggle between various professional background colors (Coral, Orange, Green, Blue, Purple) and adjust font sizes for hierarchical emphasis.
- **Floating Toolbar**: Context-aware toolbar for quick actions like adding children/siblings, editing text, or deleting nodes.
- **Advanced Alignment & Distribution**: Precise tools to align multiple nodes (Left, Center, Right, Top, Middle, Bottom) and distribute them evenly across horizontal or vertical axes.

### 📜 History & Versions
- **Infinite Undo/Redo**: Full history stack with animated transitions between states, allowing for seamless correction of mistakes.
- **Version Snapshots**: Create manual "Time Machine" snapshots of your mind map. Restore previous versions with a single click, synchronized across all active collaborators.
- **Activity Log**: A real-time audit trail of all changes made to the map, including who moved what, when text was edited, and color changes.

---

## 🤝 Real-Time Collaboration

MindMap Pro is built for teams, featuring a low-latency synchronization protocol:

- **Live Cursors**: High-frequency (20Hz) synchronization of peer cursor positions with smooth interpolation and color-coded labels.
- **Presence Awareness**: Real-time tracking of active users within a specific map, complete with user avatars and identity synchronization.
- **Remote Editing Locks**: Visual "Locked" indicators and input disabling that prevent write conflicts by showing when a peer is actively editing a node's text or properties.
- **Selection Visualization**: See what your teammates are focusing on with real-time remote selection highlights.

---

## 🏗️ Technical Architecture

The application is built on a decoupled, multi-layered architecture:

1. **Rendering Layer (SVG)**: The core UI layer. Unlike Canvas API, SVG allows for easy event delegation, CSS styling, and standard accessibility features.
2. **Interaction Layer (Hooks)**: Managed by `useDragEngine`. This layer abstracts complex mouse and touch interactions (drags, pans, zooms) into atomic state changes.
3. **Animation Layer (Motion Engine)**: A specialized engine that bridges the gap between React's declarative state and the browser's Imperative Web Animations API.
4. **State Layer (Zustand)**: A centralized, atomic store that manages the graph structure, history stack, and real-time peer data.
5. **Synchronization Layer (Socket.io)**: A bidirectional event bus that ensures all clients converge on the same state with minimal latency.

---

## 🎬 Deep Dive: Motion Engine (FLIP)

The `motionEngine.ts` is responsible for "Smoothing" the transitions when the graph structure changes (e.g., during Auto-Layout). It implements a refined version of the **FLIP** technique:

1. **Capture (First)**: Before the state update, the engine records the viewport positions of all nodes using `getBoundingClientRect()` and converts them to **World Coordinates** using the SVG's inverse CTM (Current Transformation Matrix).
2. **Commit (Last)**: React performs the state update (e.g., updating node `x` and `y` in the store). The DOM re-renders.
3. **Invert (Invert)**: The engine calculates the delta (`dx`, `dy`) between the old world-space position and the new DOM position. It then applies a counter-transform to visually "lock" the nodes in their old positions.
4. **Play (Play)**: Using the **Web Animations API**, the engine animates the `transform` from the delta back to `0, 0` using a custom `cubic-bezier(0.2, 0.8, 0.2, 1)` easing.

---

## 📐 Coordinate System & Transformation

Managing an infinite canvas requires mapping between different coordinate spaces:

- **Screen Space**: Pixel coordinates relative to the browser viewport (e.g., `e.clientX`).
- **SVG Space (World Space)**: The absolute coordinate system of the mind map, independent of zoom or pan.
- **Group Space**: Coordinates relative to a specific parent node or group.

The application uses `getScreenCTM().inverse()` to map screen coordinates to world coordinates, ensuring that features like **Lasso Selection** and **Node Dragging** remain accurate regardless of zoom level (0.1x to 3x) or pan offset.

---

## 📦 State Management & Optimistic UI

We use **Zustand** with custom middleware for history management:

- **Optimistic Updates**: Local state is updated immediately for zero-latency feedback during drags or edits.
- **Sync-Back**: The `EditorStore` asynchronously persists changes to the REST API and emits the corresponding socket event.
- **Conflict Resolution**: In the event of a network failure, the store can roll back to the last "server-confirmed" state or use the `historyIndex` to restore consistency.

---

## 📂 Project Structure

```text
src/
├── app/              # Main App entry, Router definitions
├── components/       # UI & Domain Components
│   ├── editor/       # Core Canvas components (Canvas, Node, EdgeLayer)
│   │   ├── FloatingToolbar.tsx   # Contextual action menu
│   │   ├── NodeProperties.tsx    # Sidebar for node details
│   │   ├── ActivityPanel.tsx     # Real-time audit log
│   │   └── MiniNavigator.tsx     # Scaling-down canvas visualization
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

- **Framework**: [React 19](https://react.dev/)
- **Language**: [TypeScript 5.7+](https://www.typescriptlang.org/)
- **Build Tool**: [Vite 7](https://vitejs.dev/)
- **State**: [Zustand 5](https://github.com/pmndrs/zustand)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Real-Time**: [Socket.io-client 4.8](https://socket.io/)
- **Animations**: [Web Animations API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Animations_API)

---

## 🧪 Development & Setup

### Prerequisites
- Node.js 20+
- MindMap Pro Backend (running on port 5000)

### Getting Started
1. **Clone & Install**
   ```bash
   git clone https://github.com/your-username/mindmap-client.git
   cd mindmap-client
   npm install
   ```
2. **Configure Environment**
   Create a `.env` file:
   ```env
   VITE_API_URL=http://localhost:5000/api
   VITE_SOCKET_URL=http://localhost:5000
   ```
3. **Run Development Server**
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

---

## 📜 License
This project is licensed under the MIT License.
