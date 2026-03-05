# 🧠 MindMap Pro — Collaborative Infinite Canvas Engine

[![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178C6?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-7-646CFF?style=flat-square&logo=vite)](https://vitejs.dev/)
[![Zustand](https://img.shields.io/badge/Zustand-5-orange?style=flat-square)](https://zustand-demo.pmnd.rs/)
[![Socket.io](https://img.shields.io/badge/Socket.io-4.8-black?style=flat-square&logo=socket.io)](https://socket.io/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=flat-square&logo=mongodb)](https://www.mongodb.com/)
[![Express](https://img.shields.io/badge/Express-4.x-000000?style=flat-square&logo=express)](https://expressjs.com/)

MindMap Pro is a professional-grade, real-time collaborative mind mapping application. It features a custom SVG infinite canvas engine, a FLIP-based motion system, multi-user WebSocket synchronization, role-based permissions, and a rich suite of productivity features.

---

## 📖 Table of Contents

- [🚀 Features at a Glance](#-features-at-a-glance)
- [🛠️ Editor](#️-editor)
- [🤝 Real-Time Collaboration](#-real-time-collaboration)
- [👥 Sharing & Permissions](#-sharing--permissions)
- [💬 Node Comments](#-node-comments)
- [⏳ Version History & Activity](#-version-history--activity)
- [🔍 Focus Mode](#-focus-mode)
- [📦 Export System](#-export-system)
- [🗂️ Templates](#️-templates)
- [🏗️ Architecture](#️-architecture)
- [📂 Project Structure](#-project-structure)
- [🧰 Tech Stack](#-tech-stack)
- [🚦 Getting Started](#-getting-started)
- [⌨️ Keyboard Shortcuts](#️-keyboard-shortcuts)

---

## 🚀 Features at a Glance

| Category | Features |
|---|---|
| **Canvas** | SVG Infinite Canvas · Pan · Zoom · Mini Navigator · Lasso Selection |
| **Nodes** | Rich properties · Color coding · Font size · Notes/descriptions · Collapse/expand |
| **Layout** | Recursive Auto-Layout (FLIP animated) · Align · Distribute · Fit to Screen |
| **Collaboration** | Live Cursors · Presence Avatars · Edit Locking · Remote Selection Highlights |
| **Sharing** | Role-Based Permissions (Owner / Editor / Viewer) · Invite by Email · Share Link |
| **Comments** | Threaded per-node discussion panels · Real-time via WebSocket |
| **History** | Infinite Undo/Redo · Version Snapshots · Activity Log |
| **Focus Mode** | Subtree Isolation with fade-out · Exit pill overlay |
| **Exports** | PNG · PDF · JSON · Markdown |
| **Templates** | Pre-built map blueprints (Startup, Project, Study, Brainstorm) |
| **Auth** | JWT Authentication · Persistent sessions · Protected routes |

---

## 🛠️ Editor

### Infinite Canvas
The canvas is rendered entirely in **SVG**, giving the engine full control over transformations, animations, and event delegation while maintaining browser-native accessibility. A custom pan/zoom layer applies a `transform` matrix using `getScreenCTM().inverse()` to map screen coordinates into world coordinates, staying accurate at any zoom level (0.1x–3x).

### Node Management
- **Create**: Click ⊕ on any node, press `Tab`, or use the floating toolbar to add children/siblings.
- **Edit**: Double-click or press `Enter` to enter inline text editing mode.
- **Rich Properties Panel**: A slide-in sidebar exposes title editing, multi-line notes, color palette, and font-size controls.
- **Color Coding**: Six curated colors (Coral, Orange, Green, Blue, Purple, Teal) plus the default theme.
- **Collapse/Expand**: Toggle visibility of entire subtrees with animated entrances/exits.

### Auto-Layout & Alignment
- **Recursive Auto-Layout**: A depth-first tree algorithm calculates subtree heights and assigns `x/y` positions to prevent any node overlap.
- **FLIP Animation**: Uses the **Web Animations API** with a `cubic-bezier(0.2, 0.8, 0.2, 1)` easing to smoothly transition from the old layout to the new one without any perceived jank.
- **Align Tools**: Align multiple selected nodes by Left, Center, Right, Top, Middle, or Bottom edge.
- **Distribute Tools**: Evenly space selected nodes along horizontal or vertical axes.

### Floating Toolbar
A context-sensitive toolbar appears at the bottom center of the screen when nodes are selected. It provides:
- Add sibling / child node
- Edit text
- **Focus (subtree isolation)**
- Delete (with particle-burst animation)
- Alignment & distribution tools (multi-select)

---

## 🤝 Real-Time Collaboration

All editor events are synchronized across clients via a Socket.io connection with a room per `mapId`.

### Live Cursors
Mouse positions are broadcast at ~20 Hz and smoothed on each client using a **requestAnimationFrame lerp loop** (`currentPos += (targetPos - currentPos) × 0.25`), producing buttery 60fps cursor movement for all peers.

### Presence Awareness
- A **dynamic presence bar** in the editor header shows overlapping color-coded avatar circles (up to 5 visible, then `+N`).
- Each user is assigned a unique color from a 16-color palette stored in their database profile.

### Edit Locking
When a user double-clicks a node to edit it:
- All peers see a **colored glow border** and a **name badge** (e.g., "✏️ Alex editing").
- The node is **soft-locked**: other users' double-clicks are silently blocked.
- The lock is automatically released when editing finishes or is cancelled.
- Works for both the canvas inline editor **and** the properties panel title/notes inputs.

### Selection Highlights
A `selection-update` WebSocket event syncs each user's selected node IDs. Other users see a **dashed colored bounding box** around those nodes, with stacking name badges for simultaneous multi-user selection.

---

## 👥 Sharing & Permissions

Maps support three roles enforced both on the backend and the frontend UI:

| Role | Capabilities |
|---|---|
| **Owner** | Full control — edit, invite, remove members, delete map |
| **Editor** | Create, move, edit, delete nodes |
| **Viewer** | Read-only — canvas is non-interactive |

### Share Modal
- Owners open the Share modal from the editor header.
- Invite collaborators by email and assign a role.
- Dynamically update or revoke existing member roles.
- Copy a shareable link to the clipboard.

Viewer enforcement: The entire canvas UI (dragging, double-click, toolbar) is disabled for `VIEWER` role users via `currentUserRole` state.

---

## 💬 Node Comments

Every node supports a threaded comment panel, accessible from the Node Properties sidebar when exactly one node is selected.

- **Backend**: `NodeComment` collection stores `content`, `nodeId`, `mapId`, and a `userId` reference (populated with `username` and `color`).
- **Real-time**: `comment-added` and `comment-deleted` WebSocket events sync comments live across all active users.
- **Authorship**: Comments display the user's **name** and their **color-coded avatar**.
- **Deletion**: Authors and map Owners can delete comments; others cannot.

---

## ⏳ Version History & Activity

### Snapshots (Version History)
- Create named snapshots of the entire node layout.
- Each snapshot records **who** saved it (with avatar).
- Restore any snapshot with one click — the restoration is broadcast via `map-restored` WebSocket event and animates smoothly for all clients.
- Collaborators and Owners can both manage snapshots.

### Activity Log
A persistent right-side panel showing a timeline of major map events:
- `NODE_CREATED`, `NODE_DELETED`, `NODE_EDITED`, `NODE_MOVED`, `NODE_COLOR_CHANGED`
- Each entry shows the **user's name**, their **color-coded dot**, and a relative timestamp (e.g., "2m ago").
- New events are streamed live via `activity-log-added` socket events.

### Undo / Redo
- Full in-memory history stack with `historyIndex` pointer.
- Works for: node creation, deletion, text edits, moves, color changes, and notes.
- Dirty-checking prevents storing duplicate states for no-op edits.

---

## 🔍 Focus Mode

For navigating **large, complex mind maps**, Focus Mode lets you isolate any subtree:

1. **Select a node** → click the **⊙ Focus** button in the floating toolbar.
2. All nodes and edges **outside the selected subtree** fade to 15% opacity and become non-interactive (`pointer-events: none`).
3. A **"Viewing Subtree · Exit Focus"** pill appears at the top-center of the canvas.
4. Click **Exit Focus** or the button again to restore the full map.

**Implementation**: A BFS traversal builds a `Set<string>` of all descendant node IDs. This is computed via `useMemo([nodes, focusNodeId])` to produce a stable reference and avoid React's `useSyncExternalStore` infinite loop trap. Both `NodeLayer` and `EdgeLayer` consume the set to independently derive `isFaded`.

---

## 📦 Export System

Available via the **Export** dropdown in the editor header:

| Format | How |
|---|---|
| **PNG** | `html-to-image` captures the `.react-flow` SVG viewport into a Data URI |
| **PDF** | Same capture piped into a `jsPDF` document |
| **JSON** | Backend endpoint `GET /api/mindmaps/:id/export/json` — full AST payload |
| **Markdown** | Backend endpoint `GET /api/mindmaps/:id/export/md` — depth-mapped `# → ## → ###` hierarchy |

---

## 🗂️ Templates

The **Template Gallery** appears on the Dashboard above your map list and provides 4 pre-built blueprints:

- 🚀 **Startup Planning** — Funding, Market, Team, Product
- 📋 **Project Breakdown** — Goals, Milestones, Resources, Risks
- 📚 **Study Notes** — Topic outline with sub-sections
- 💡 **Brainstorm** — Open-ended idea clustering

Clicking a template card calls `POST /api/templates/from-template`, which:
1. Allocates fresh MongoDB ObjectIDs for every node.
2. Re-wires all parent-child relationships using an internal ID map.
3. Creates a new `MindMap` document owned by the requesting user.
4. Navigates directly into the new map's editor.

The backend auto-seeds these 4 templates if the `templates` collection is empty on server start.

---

## 🏗️ Architecture

### Frontend Layers

```
┌─────────────────────────────────────────┐
│  React Pages  (Auth, Dashboard, Editor) │
├─────────────────────────────────────────┤
│  Zustand Stores  (EditorStore, AuthStore)│
│  – graph state, history, presence, role │
├─────────────────────────────────────────┤
│  Motion Engine  (FLIP via Web Anim API) │
│  Drag Engine   (rAF-based, no re-render)│
├─────────────────────────────────────────┤
│  SVG Render Layer                       │
│  NodeLayer → Node.tsx                   │
│  EdgeLayer → bezier paths               │
│  CursorLayer → interpolated peers       │
├─────────────────────────────────────────┤
│  Services  (Axios REST · Socket.io WS)  │
└─────────────────────────────────────────┘
```

### Drag-Without-Re-render
The drag engine runs entirely outside of React's render cycle. It mutates the `transform` attribute on each `<g>` SVG element directly via a `ref`, then only writes final positions to the Zustand store on `mouseup`. This gives silky smooth dragging with zero React re-renders during the drag.

### Optimistic UI
Edits are applied to local state immediately and persisted to the REST API asynchronously. On network failure the store can roll back via the `historyIndex` pointer.

---

## 📂 Project Structure

```
src/
├── app/
│   └── Router.tsx              # Route definitions + PrivateRoute guard
├── components/
│   ├── editor/
│   │   ├── Canvas.tsx          # SVG viewport (pan, zoom, mouse events)
│   │   ├── Node.tsx            # Individual node render + drag/click/edit
│   │   ├── NodeLayer.tsx       # Recursive node tree renderer + Focus Mode
│   │   ├── EdgeLayer.tsx       # Bezier connection paths + Focus Mode fade
│   │   ├── CursorLayer.tsx     # Live peer cursor interpolation (rAF lerp)
│   │   ├── FloatingToolbar.tsx # Bottom action bar (add/edit/focus/delete/align)
│   │   ├── NodePropertiesPanel.tsx # Slide-in properties, notes, color, comments
│   │   ├── EditorHeader.tsx    # Title, export menu, share, presence avatars
│   │   ├── MiniNavigator.tsx   # Thumbnail overview + drag-to-jump navigation
│   │   ├── VersionPanel.tsx    # Snapshot list + restore
│   │   ├── ActivityPanel.tsx   # Timestamped real-time audit log
│   │   ├── SkeletonEditor.tsx  # Loading skeleton (pulse animation)
│   │   └── KeyboardShortcuts.tsx # Shortcut reference overlay
│   ├── dashboard/
│   │   ├── TemplateGallery.tsx # Browse and create from templates
│   │   └── ShareModal.tsx      # Invite collaborators, manage roles
│   └── ui/
│       └── Toast.tsx           # Dismissible notifications with undo action
├── context/
│   └── DragContext.tsx         # Ref-based drag engine (no re-renders)
├── engine/
│   └── motionEngine.ts         # FLIP animation for layout transitions
├── hooks/
│   └── useDragEngine.ts        # Mouse/touch interaction abstraction
├── pages/
│   ├── Auth/                   # Login + Register pages (animated SVG background)
│   ├── Dashboard/              # Map list, create, trash, share controls
│   └── Editor/
│       └── EditorPage.tsx      # Root editor: socket lifecycle, keyboard shortcuts
├── services/
│   ├── api.ts                  # Axios instance (baseURL + JWT interceptor)
│   ├── socket.ts               # Socket.io client wrapper (connect/emit/off)
│   ├── templateService.ts      # Template API calls
│   └── mapService.ts           # Map CRUD API calls
├── store/
│   ├── editorStore.ts          # Main store: nodes, history, presence, focus
│   └── authStore.ts            # User session, JWT, login/logout
└── types/
    └── user.ts                 # Shared TypeScript interfaces
```

---

## 🧰 Tech Stack

### Frontend
| Technology | Purpose |
|---|---|
| [React 19](https://react.dev/) | UI framework |
| [TypeScript 5.7](https://www.typescriptlang.org/) | Type safety |
| [Vite 7](https://vitejs.dev/) | Build tool & dev server |
| [Zustand 5](https://github.com/pmndrs/zustand) | Global state management |
| [React Router 7](https://reactrouter.com/) | Client-side routing |
| [Socket.io-client](https://socket.io/) | Real-time WebSocket layer |
| [Axios](https://axios-http.com/) | HTTP client |
| [html-to-image](https://github.com/bubkoo/html-to-image) | PNG/PDF export |
| [jsPDF](https://github.com/parallax/jsPDF) | PDF generation |
| [Web Animations API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Animations_API) | FLIP layout animations |

### Backend
| Technology | Purpose |
|---|---|
| [Node.js + Express 4](https://expressjs.com/) | REST API server |
| [Socket.io 4](https://socket.io/) | WebSocket server |
| [MongoDB + Mongoose](https://mongoosejs.com/) | Database + ODM |
| [JWT](https://jwt.io/) | Stateless authentication |
| [bcryptjs](https://github.com/dcodeIO/bcrypt.js) | Password hashing |

---

## 🚦 Getting Started

### Prerequisites
- Node.js 20+
- A running instance of the [MindMap Pro Backend](https://github.com/your-username/mindmap-server)

### 1. Clone & Install
```bash
git clone https://github.com/your-username/mindmap-client.git
cd mindmap-client
npm install
```

### 2. Configure Environment
Create a `.env` file in the project root:
```env
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```

### 3. Run Development Server
```bash
npm run dev
```

The app will be available at `http://localhost:5173`.

### 4. Build for Production
```bash
npm run build
```

---

## ⌨️ Keyboard Shortcuts

| Category | Action | Shortcut |
|---|---|---|
| **Navigation** | Pan Canvas | `Space + Drag` or `Middle Mouse Drag` |
| | Zoom In/Out | `Scroll Wheel` |
| | Fit to Screen | `Ctrl + 0` |
| **Editing** | Add Child Node | `Tab` |
| | Edit Selected Node | `Enter` or `Double Click` |
| | Delete Node(s) | `Delete` or `Backspace` |
| | Undo | `Ctrl + Z` |
| | Redo | `Ctrl + Y` |
| | Deselect All | `Escape` |
| **Layout** | Auto-Layout | `Ctrl + L` |

---

## 📜 License

This project is licensed under the **MIT License**. See [LICENSE](LICENSE) for details.
