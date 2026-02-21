# 🧠 MindMap Pro — Advanced Canvas-Based Mind Mapping Engine

A high-performance, canvas-based mind mapping application built with React, TypeScript, Vite, Tailwind CSS, and Zustand.

This project focuses on advanced frontend engineering concepts, including:

- Custom SVG rendering engine
- World-coordinate transformation system
- Optimized drag architecture
- Multi-selection & lasso geometry
- Undo/redo snapshot system
- Tree layout algorithms
- Viewport-based interaction modeling
- Interaction layering (drag, pan, lasso, edit)
- Recursive subtree collapse
- Alignment & snapping systems

## 🚀 Live Demo

🔗 [[Add your deployed link here]]

## 📌 Project Overview

This project is not just a CRUD-based mind map tool. It is a custom-built canvas engine that demonstrates:

- Complex UI state management
- Geometry-based interaction systems
- Performance-conscious rendering
- Multi-layer architecture separation
- Scalable design for large node graphs

It was built as a portfolio project to explore advanced frontend engineering patterns similar to tools like **Figma**, **Miro**, **Whimsical**, and **Obsidian Canvas**.

## 🏗️ Architecture Overview

The editor is structured into four conceptual layers:

- **UI Layer**: Header, Toolbar, Panels
- **Interaction Layer**: Drag, Pan, Lasso, Snap, Keyboard
- **Rendering Layer**: SVG Node & Edge Rendering
- **State Layer**: Zustand Store (Editor Engine)

This separation allows clean scaling and feature expansion.

## 🧩 Core Features

### 🗺️ SVG-Based Rendering Engine
- Nodes and edges are rendered using raw SVG.
- World coordinate system with translate + scale transform.
- Decoupled screen coordinates from world coordinates.
- Supports zoom & pan without breaking layout.

### 🟦 Node System
Each node supports:
- Drag & drop (GPU-optimized transform updates)
- Multi-selection
- Inline text editing
- Customizable color
- Customizable font size
- Resize behavior
- Selection highlighting
- Collapse / expand children

**Nodes store:**
```json
{
  "id": "uuid",
  "x": 0,
  "y": 0,
  "text": "New Node",
  "color": "#ffffff",
  "fontSize": 14,
  "collapsed": false
}
```

### 🔗 Edge Rendering
- Parent → child cubic Bezier curves
- Dynamic edge recalculation
- Visibility filtering for collapsed branches
- Render isolation via `React.memo`

### 🔄 Undo / Redo System
Custom snapshot-based history engine built in Zustand:
- Stores up to 50 state snapshots
- Pushes history on: Node creation, Deletion, Drag commit, Text update, Auto-layout.
- Supports: `Ctrl + Z`, `Ctrl + Y`, `Ctrl + Shift + Z`
- Undo also synchronizes state back to backend.

### 🧲 Multi-Selection & Lasso Tool
Professional selection system:
- Shift-click multi-select
- Drag rectangle lasso selection
- Axis-aligned bounding box (AABB) intersection detection
- Zoom-aware world-space geometry
- Batch operations support

### 🗂️ Subtree Collapse / Expand
- Recursive visibility filtering
- Non-destructive render hiding
- Edge recalculation
- Layout preservation
- Efficient descendant detection via parent chain traversal

### 📐 Auto-Layout Algorithm
Custom tree layout system:
- Recursive depth-first traversal
- Left-to-right hierarchical arrangement
- Vertical subtree height aggregation
- Parent vertical centering
- Collision-free spacing
- Implements structural layout decoupled from pixel spacing.

### 🧲 Alignment & Snapping System
While dragging:
- Snap to nearby node edges
- Snap to center alignment
- Snap threshold detection
- Visual guide rendering
- World-space snapping calculations

### 🗺️ Mini Navigator (Minimap)
- Shows full graph bounding box
- Displays viewport position
- Updates dynamically with pan & zoom
- Enables spatial awareness in large maps

### 🖱️ Drag & Performance Optimization
Drag engine optimized to avoid excessive re-renders:
- Mutable refs for in-progress drag
- DOM transform updates during drag
- Zustand commit only on mouseup
- `React.memo` render isolation
- Stable function references
- Reduced reconciliation overhead

### 🔍 Zoom & Pan System
- Mouse wheel zoom (clamped 0.1× – 3×)
- Space + drag pan gesture
- World coordinate transformation math
- Fit-to-screen algorithm
- Viewport transform: `translate(panX, panY) scale(zoom)`

### ⌨️ Keyboard Shortcuts
- `Ctrl + Z` → Undo
- `Ctrl + Y` → Redo
- `Delete` → Delete selected nodes
- `Tab` → Add child node
- `Enter` → Add sibling node
- `F` → Fit to screen
- `Escape` → Deselect
- `Space + Drag` → Pan
- `Shift + Click` → Multi-select

### 🎨 Node Properties Panel
Side panel allows:
- Node title editing
- Color customization
- Font size control
- Deletion
- Live updates synced to backend
- Animated slide-in UI.

### 📦 Dashboard
- Lists all user mind maps
- Starred state
- Create / delete maps
- Navigation to editor
- Type-safe API integration

## 🧠 Performance Considerations

The project includes:
- `React.memo` for render isolation
- Derived visible-node filtering
- Viewport-based transform handling
- Optimized drag updates
- Batched history commits
- Set-based selection model for O(1) lookups

**Future scalability path:**
- Viewport-based node culling
- Virtualized edge rendering
- Large graph stress testing

## 🧰 Tech Stack

- **Frontend**: React, TypeScript, Vite, Tailwind CSS
- **State Management**: Zustand
- **Routing**: React Router DOM
- **API Layer**: Axios, JWT authentication
- **Utilities**: UUID

## 🗂️ Folder Structure

```
.
├── public
│   └── vite.svg
├── src
│   ├── app
│   │   ├── App.tsx
│   │   └── routes.tsx
│   ├── assets
│   │   └── react.svg
│   ├── components
│   │   ├── editor
│   │   │   ├── Canvas.tsx
│   │   │   ├── EdgeLayer.tsx
│   │   │   ├── EditorHeader.tsx
│   │   │   ├── FloatingToolbar.tsx
│   │   │   ├── KeyboardShortcuts.tsx
│   │   │   ├── MiniNavigator.tsx
│   │   │   ├── Node.tsx
│   │   │   ├── NodeLayer.tsx
│   │   │   ├── NodePropertiesPanel.tsx
│   │   │   └── ZoomControls.tsx
│   │   ├── layout
│   │   │   ├── Sidebar.tsx
│   │   │   └── Topbar.tsx
│   │   └── ui
│   │       └── Toast.tsx
│   ├── context
│   │   └── DragContext.tsx
│   ├── hooks
│   │   └── useDragEngine.ts
│   ├── pages
│   │   ├── Dashboard
│   │   │   └── DashboardPage.tsx
│   │   └── Editor
│   │       └── EditorPage.tsx
│   ├── services
│   │   ├── api.ts
│   │   └── mindmapService.ts
│   ├── store
│   │   ├── editorStore.ts
│   │   └── mapsStore.ts
│   ├── styles
│   │   └── global.css
│   ├── types
│   │   └── mindmap.ts
│   ├── App.css
│   ├── App.tsx
│   ├── index.css
│   └── main.tsx
├── .gitignore
├── eslint.config.js
├── index.html
├── package.json
├── postcss.config.js
├── README.md
├── tailwind.config.js
├── tsconfig.app.json
├── tsconfig.json
├── tsconfig.node.json
└── vite.config.ts
```

## 🧪 Running Locally

```bash
git clone https://github.com/your-username/mindmap-client.git
cd mindmap-client
npm install
npm run dev
```

Runs on: `http://localhost:5173`

## 📈 Future Enhancements

- Real-time collaboration (CRDT-based)
- Branch animation transitions
- Grid snapping toggle
- Grouping & alignment tools
- Export to PNG / PDF
- Dark / Light theme
- Viewport-based render culling
- Stress test mode (1000+ nodes)

## 🎯 What This Project Demonstrates

This project showcases:
- Advanced React architecture
- Complex UI state modeling
- Geometry-based interaction design
- Performance-conscious rendering
- Scalable canvas systems
- Clean separation of concerns
- Professional interaction patterns

It is designed to demonstrate engineering depth beyond standard CRUD applications.

## 📜 License

MIT License.
