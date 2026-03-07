# 🧠 MindMap Pro — Collaborative Infinite Canvas Engine

[![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178C6?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-7-646CFF?style=flat-square&logo=vite)](https://vitejs.dev/)
[![Zustand](https://img.shields.io/badge/Zustand-5-orange?style=flat-square)](https://zustand-demo.pmnd.rs/)\
[![Socket.io](https://img.shields.io/badge/Socket.io-4.8-black?style=flat-square&logo=socket.io)](https://socket.io/)
[![Groq](https://img.shields.io/badge/Groq-Llama_3_70B-F55036?style=flat-square)](https://groq.com/)

MindMap Pro is a professional-grade, real-time collaborative mind mapping application. It features a custom SVG infinite canvas engine, a FLIP-based motion system, multi-user WebSocket synchronization, role-based permissions, AI-powered map generation, and a rich suite of productivity features.

---

## 📖 Table of Contents

- [🚀 Features at a Glance](#-features-at-a-glance)
- [🛠️ Editor](#️-editor)
- [🤖 AI Mindmap Generation](#-ai-mindmap-generation)
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
| **Nodes** | Rich properties · Color coding · Font size · Notes · Collapse/expand |
| **Layout** | Recursive Auto-Layout (FLIP animated) · Align · Distribute · Fit to Screen |
| **AI** | One-prompt mindmap generation via Groq Llama 3 70B |
| **Collaboration** | Live Cursors · Presence Avatars · Edit Locking · Remote Selection |
| **Sharing** | Role-Based Permissions (Owner / Editor / Viewer) · Invite by Email |
| **Comments** | Threaded per-node discussion panels · Real-time via WebSocket |
| **History** | Infinite Undo/Redo · Version Snapshots · Activity Log |
| **Focus Mode** | Subtree isolation with fade-out · One-click exit pill |
| **Exports** | PNG · PDF · JSON · Markdown |
| **Templates** | Pre-built map blueprints (Startup, Project, Study, Brainstorm) |
| **Auth** | JWT Authentication · Persistent sessions · Protected routes |

---

## 🛠️ Editor

### Infinite Canvas
Rendered entirely in **SVG** for full control over transformations, animations, and event delegation. A custom pan/zoom layer applies a `transform` matrix using `getScreenCTM().inverse()` to map screen coordinates into world coordinates — accurate at any zoom level (0.1x–3x).

### Node Management
- **Create**: Click ⊕ on any node, press `Tab`, or use the floating toolbar.
- **Edit**: Double-click or press `Enter` for inline text editing.
- **Rich Properties Panel**: Slide-in sidebar with title, multi-line notes, color palette, and font-size controls.
- **Color Coding**: Six curated colors (Coral, Orange, Green, Blue, Purple, Teal).
- **Collapse/Expand**: Toggle subtree visibility with animated entrances/exits.

### Auto-Layout & Alignment
- **Recursive Auto-Layout**: Depth-first tree algorithm calculates subtree heights and assigns `x/y` positions to prevent overlap.
- **FLIP Animation**: Web Animations API with `cubic-bezier(0.2, 0.8, 0.2, 1)` easing for smooth layout transitions.
- **Align Tools**: Align multiple selected nodes by Left, Center, Right, Top, Middle, or Bottom edge.
- **Distribute Tools**: Evenly space selected nodes along horizontal or vertical axes.

### Floating Toolbar
Context-sensitive bottom action bar when nodes are selected:
- Add sibling / child node · Edit text · **✨ Focus on subtree** · Delete · Align / Distribute

---

## 🤖 AI Mindmap Generation

Click the glowing **✨ AI Generate** button in the editor header toolbar to generate a complete mindmap from a single topic.

### How it works
1. A modal prompts: *"Enter a topic for your mindmap"*
2. The request is sent to the backend which calls **Groq `llama3-70b-8192`** with a strict system prompt that forces a structured JSON tree.
3. The backend runs a **two-pass DFS** to compute subtree-centered `x,y` positions (no client-side layout pass needed).
4. All existing nodes in the map are replaced with the new AI-generated tree.
5. The frontend silently reloads the node state **without unmounting the Canvas**, so all drag refs and edge connections stay intact.

### Implementation detail — `replaceNodes`
A dedicated `replaceNodes(mindMapId)` store action fetches fresh nodes from the API and patches the store **without setting `isLoadingMap: true`**. This prevents the Canvas from unmounting (which would break the DragContext edge ref map and cause disconnected edges). This is distinct from `loadNodes`, which shows the skeleton loader and is intended for initial page load only.

---

## 🤝 Real-Time Collaboration

All editor events are synchronized via Socket.io with a room per `mapId`.

### Live Cursors
Mouse positions broadcast at ~20 Hz, smoothed on each client using a **requestAnimationFrame lerp loop** (`ease = 0.25`), producing buttery 60fps cursor movement for all peers.

### Presence Awareness
A dynamic presence bar in the editor header shows overlapping color-coded avatar circles. Each user is assigned a unique color from a 16-color palette stored in their database profile.

### Edit Locking
When a user edits a node:
- Peers see a colored glow border and a name badge (e.g., "✏️ Alex editing").
- The node is soft-locked — other users' double-clicks are silently blocked.
- Lock auto-releases when editing finishes or is cancelled.
- Works for both the canvas inline editor and the properties panel fields.

### Selection Highlights
`selection-update` WebSocket events sync selected node IDs. Other users see a dashed colored bounding box with stacking name badges.

---

## 👥 Sharing & Permissions

Maps support three roles enforced at both the API and UI levels:

| Role | Capabilities |
|---|---|
| **Owner** | Full control — edit, invite, remove members, delete map |
| **Editor** | Create, move, edit, delete nodes |
| **Viewer** | Read-only — canvas is non-interactive |

The **Share** modal (editor header) lets owners invite by email, update roles, revoke access, and copy a shareable link. Viewer enforcement disables all interactive canvas elements via `currentUserRole` state.

---

## 💬 Node Comments

Every node supports a threaded comment panel in the Node Properties sidebar.

- Stored in the `NodeComment` collection with `userId` populated for name + color.
- Real-time sync via `comment-added` and `comment-deleted` WebSocket events.
- Authors and map Owners can delete comments.

---

## ⏳ Version History & Activity

### Snapshots
- Create named snapshots of the entire node layout.
- Restore any snapshot — broadcast via `map-restored` to all live collaborators.

### Activity Log
Right-side panel showing a timeline of `NODE_CREATED`, `NODE_DELETED`, `NODE_EDITED`, `NODE_MOVED`, `NODE_COLOR_CHANGED` with user avatar, relative timestamp, and contextual metadata.

### Undo / Redo
Full in-memory history stack — covers node creation, deletion, text edits, moves, color changes, and notes. `Ctrl+Z` / `Ctrl+Y`.

---

## 🔍 Focus Mode

Isolate any subtree of a large mind map:

1. Select a node → click **⊙ Focus** in the floating toolbar.
2. All nodes/edges **outside the subtree** fade to 15% opacity and become non-interactive.
3. A blue **"Viewing Subtree · Exit Focus"** pill appears at the top center.
4. Click **Exit Focus** to restore the full map.

**Implementation note**: The focused subtree is computed by `useMemo` BFS keyed on `[nodes, focusNodeId]`, producing a stable `Set<string>` reference so Zustand's `useSyncExternalStore` doesn't trigger an infinite render loop.

---

## 📦 Export System

Available via the **Export** dropdown in the editor header:

| Format | Method |
|---|---|
| **PNG** | `html-to-image` captures the SVG viewport |
| **PDF** | Same capture piped into `jsPDF` |
| **JSON** | `GET /api/mindmaps/:id/export/json` — full AST |
| **Markdown** | `GET /api/mindmaps/:id/export/md` — depth-mapped `#` hierarchy |

---

## 🗂️ Templates

A **Template Gallery** on the Dashboard lets users start from 4 pre-built blueprints:

- 🚀 **Startup Planning** — Funding, Market, Team, Product
- 📋 **Project Breakdown** — Goals, Milestones, Resources, Risks
- 📚 **Study Notes** — Topic outline with sub-sections
- 💡 **Brainstorm** — Open-ended idea clustering

Selecting a template calls `POST /api/templates/from-template`, which re-allocates fresh MongoDB ObjectIDs, rewires all parent-child relationships, creates the map, and navigates directly into the editor.

---

## 🏗️ Architecture

### Frontend Layers

```
┌────────────────────────────────────────────────┐
│  React Pages  (Auth, Dashboard, Editor)         │
├────────────────────────────────────────────────┤
│  Zustand Stores  (EditorStore, AuthStore)       │
│  – graph, history, presence, focus, AI nodes   │
├────────────────────────────────────────────────┤
│  Motion Engine  (FLIP via Web Animations API)  │
│  Drag Engine   (rAF-based — zero re-renders)   │
├────────────────────────────────────────────────┤
│  SVG Canvas                                    │
│  NodeLayer → Node.tsx  (isFaded, isFocused)    │
│  EdgeLayer → Bezier paths (isFaded)            │
│  CursorLayer → rAF-interpolated peer cursors   │
├────────────────────────────────────────────────┤
│  Services  (Axios REST · Socket.io WS)         │
└────────────────────────────────────────────────┘
```

### Drag-Without-Re-render
The drag engine mutates the SVG `transform` attribute directly via a `ref`, bypassing React entirely during drag. Only on `mouseup` are final positions written to the Zustand store and persisted via API.

### `replaceNodes` vs `loadNodes`
| Action | Sets `isLoadingMap` | Canvas unmounts | Use case |
|---|:---:|:---:|---|
| `loadNodes` | ✅ Yes | ✅ Yes | Initial page load |
| `replaceNodes` | ❌ No | ❌ No | AI generation, silent refresh |

---

## 📂 Project Structure

```
src/
├── app/
│   └── Router.tsx                  # Route definitions + PrivateRoute guard
├── components/
│   ├── editor/
│   │   ├── Canvas.tsx              # SVG viewport — pan, zoom, mouse events
│   │   ├── Node.tsx                # Individual node render + drag/click/edit
│   │   ├── NodeLayer.tsx           # Recursive renderer + Focus Mode isFaded
│   │   ├── EdgeLayer.tsx           # Bezier paths + Focus Mode fade
│   │   ├── CursorLayer.tsx         # Live peer cursors with rAF lerp
│   │   ├── FloatingToolbar.tsx     # Bottom action bar (add/focus/align/delete)
│   │   ├── NodePropertiesPanel.tsx # Slide-in properties, notes, color, comments
│   │   ├── EditorHeader.tsx        # Title, Export, Share, ✨ AI Generate, Presence
│   │   ├── AiGenerateModal.tsx     # AI topic input modal + Groq API integration
│   │   ├── MiniNavigator.tsx       # Thumbnail overview + drag-to-jump
│   │   ├── VersionPanel.tsx        # Snapshot list + restore
│   │   ├── ActivityPanel.tsx       # Timestamped real-time audit log
│   │   ├── ShareModal.tsx          # Invite collaborators, manage roles
│   │   ├── SkeletonEditor.tsx      # Pulsing skeleton for initial load
│   │   └── KeyboardShortcuts.tsx   # Shortcut reference overlay
│   ├── dashboard/
│   │   └── TemplateGallery.tsx     # Browse and create from templates
│   └── ui/
│       └── Toast.tsx               # Dismissible notifications with undo action
├── context/
│   └── DragContext.tsx             # Ref-based drag engine context
├── engine/
│   └── motionEngine.ts             # FLIP animation (capturePositions + animateTransitions)
├── hooks/
│   └── useDragEngine.ts            # Mouse/touch interaction abstraction
├── pages/
│   ├── Auth/                       # Login + Register (animated SVG background)
│   ├── Dashboard/                  # Map list, create, trash, templates
│   └── Editor/
│       └── EditorPage.tsx          # Root editor: socket lifecycle, keyboard shortcuts
├── services/
│   ├── api.ts                      # Axios instance (baseURL + JWT interceptor)
│   ├── socket.ts                   # Socket.io client wrapper
│   ├── aiService.ts                # POST /api/ai/generate-mindmap
│   ├── exportService.ts            # PNG, PDF, JSON, Markdown export helpers
│   └── templateService.ts          # Template API calls
└── store/
    ├── editorStore.ts              # Main store: nodes, history, presence, focus, replaceNodes
    └── authStore.ts                # User session, JWT, login/logout
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
| [Axios](https://axios-http.com/) | HTTP client with JWT interceptor |
| [html-to-image](https://github.com/bubkoo/html-to-image) | PNG/PDF export |
| [jsPDF](https://github.com/parallax/jsPDF) | PDF generation |
| [Web Animations API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Animations_API) | FLIP layout animations |

### Backend (required)
| Technology | Purpose |
|---|---|
| Node.js + Express 5 | REST API + Socket.io server |
| MongoDB + Mongoose | Database |
| JWT + bcryptjs | Auth |
| Groq SDK (`llama3-70b-8192`) | AI map generation |

---

## 🚦 Getting Started

### Prerequisites
- Node.js 20+
- [MindMap Pro Backend](https://github.com/your-username/mindmap-server) running on port 5000

### 1. Clone & Install
```bash
git clone https://github.com/your-username/mindmap-client.git
cd mindmap-client
npm install
```

### 2. Configure Environment
Create a `.env` file:
```env
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```

### 3. Run
```bash
npm run dev       # Development server → http://localhost:5173
npm run build     # Production build
```

---

## ⌨️ Keyboard Shortcuts

| Category | Action | Shortcut |
|---|---|---|
| **Navigation** | Pan Canvas | `Space + Drag` or `Middle Mouse Drag` |
| | Zoom | `Scroll Wheel` |
| | Fit to Screen | `Ctrl + 0` |
| **Editing** | Add Child Node | `Tab` |
| | Edit Selected | `Enter` or `Double Click` |
| | Delete Node(s) | `Delete` or `Backspace` |
| | Undo | `Ctrl + Z` |
| | Redo | `Ctrl + Y` |
| | Deselect All | `Escape` |
| **Layout** | Auto-Layout | `Ctrl + L` |

---

## 📜 License

MIT
