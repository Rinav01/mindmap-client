import { useParams } from "react-router-dom";
import { useEffect, useState, useCallback } from "react";
import Canvas from "../../components/editor/Canvas";
import EditorHeader from "../../components/editor/EditorHeader";
import FloatingToolbar from "../../components/editor/FloatingToolbar";
import ZoomControls from "../../components/editor/ZoomControls";
import MiniNavigator from "../../components/editor/MiniNavigator";
import { useEditorStore } from "../../store/editorStore";
import NodePropertiesPanel from "../../components/editor/NodePropertiesPanel";
import Toast from "../../components/ui/Toast";
import KeyboardShortcuts from "../../components/editor/KeyboardShortcuts";
import VersionPanel from "../../components/editor/VersionPanel";
import { socketService } from "../../services/socket";
import type { NodeType, LiveCursor } from "../../store/editorStore";

interface ToastState {
  message: string;
  onUndo?: () => void;
}

export default function EditorPage() {
  const { id } = useParams();

  const loadNodes = useEditorStore((s) => s.loadNodes);
  const createNode = useEditorStore((s) => s.createNode);
  const deselectAll = useEditorStore((s) => s.deselectAll);
  const undo = useEditorStore((s) => s.undo);
  const redo = useEditorStore((s) => s.redo);
  const selectedNodeIds = useEditorStore((s) => s.selectedNodeIds);
  const editingNodeId = useEditorStore((s) => s.editingNodeId);
  const deleteSelectedNodes = useEditorStore((s) => s.deleteSelectedNodes);

  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [toast, setToast] = useState<ToastState | null>(null);
  const dismissToast = useCallback(() => setToast(null), []);


  // Load nodes + map title, and manage socket lifecycle
  useEffect(() => {
    if (id) {
      loadNodes(id);
      socketService.connect(id);

      const handleNodeAdded = (node: NodeType) => {
        console.log("[Socket Rx] node-added:", JSON.stringify(node));
        useEditorStore.getState().applyRemoteNodeCreated(node);
      };
      const handleNodeDragged = (data: { nodeId: string, position: { x: number, y: number } }) => {
        console.log("[Socket Rx] node-dragged:", JSON.stringify(data));
        useEditorStore.getState().applyRemoteNodeUpdated(data.nodeId, data.position);
      };
      const handleNodeUpdated = (node: NodeType) => {
        console.log("[Socket Rx] node-updated:", JSON.stringify(node));
        useEditorStore.getState().applyRemoteNodeUpdated(node._id, node);
      };
      const handleNodeDeleted = (nodeId: string) => {
        console.log("[Socket Rx] node-deleted:", nodeId);
        useEditorStore.getState().applyRemoteNodeDeleted(nodeId);
      };

      const handleCursorMoved = (cursor: LiveCursor & { id: string }) => {
        useEditorStore.getState().updateLiveCursor(cursor.id, {
          x: cursor.x,
          y: cursor.y,
          name: cursor.name,
          color: cursor.color
        });
      };

      const handleUserDisconnected = (socketId: string) => {
        useEditorStore.getState().removeLiveCursor(socketId);
      };

      socketService.on("node-added", handleNodeAdded);
      socketService.on("node-dragged", handleNodeDragged);
      socketService.on("node-updated", handleNodeUpdated);
      socketService.on("node-deleted", handleNodeDeleted);
      socketService.on("cursor-moved", handleCursorMoved);
      socketService.on("user-disconnected", handleUserDisconnected);

      return () => {
        socketService.off("node-added", handleNodeAdded);
        socketService.off("node-dragged", handleNodeDragged);
        socketService.off("node-updated", handleNodeUpdated);
        socketService.off("node-deleted", handleNodeDeleted);
        socketService.off("cursor-moved", handleCursorMoved);
        socketService.off("user-disconnected", handleUserDisconnected);
        socketService.disconnect();
      };
    }
  }, [id, loadNodes]);

  // Node interaction shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const { selectedNodeIds, editingNodeId } =
        useEditorStore.getState();

      if (editingNodeId) return;

      if (e.key === "Delete" || e.key === "Backspace") {
        if (selectedNodeIds.size > 0) {
          e.preventDefault();
          deleteSelectedNodes().then(() => {
            setToast({
              message: `${selectedNodeIds.size} node(s) deleted`,
              onUndo: undo,
            });
          });
        }
      } else if (e.key === "Escape") {
        deselectAll();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [deleteSelectedNodes, deselectAll, undo]);

  // Undo / Redo shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === "z") {
        e.preventDefault();
        undo();
      } else if (e.ctrlKey && e.key === "y") {
        e.preventDefault();
        redo();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [undo, redo]);

  const handleAddNode = () => {
    const { selectedNodeIds, nodes } = useEditorStore.getState();
    if (selectedNodeIds.size !== 1) return; // Only allow adding to single parent for now

    // Get the single ID
    const parentId = selectedNodeIds.values().next().value;
    const selectedNode = nodes.find((n) => n._id === parentId);

    if (!selectedNode || !id) return;

    // Add logic (same as before)
    // If we want to add a sibling if parent has one? 
    // Original logic: if (selectedNode.parentId) add sibling? 
    // Actually the original logic was:
    // if parentId exists, createNode(id, parent). Else createNode(id, selectedNode) -> child of root.
    // Wait, original logic:
    // if (selectedNode.parentId) { const parent = ...; createNode(id, parent); } else { createNode(id, selectedNode); }
    // This implies "Add Node" adds a SIBLING if not root, and CHILD if root? 
    // Typically "Add Node" on a selected node adds a CHILD.
    // "Enter" often adds a sibling.
    // Let's stick to the exact logic from before for safety.

    if (selectedNode.parentId) {
      const parent = nodes.find((n) => n._id === selectedNode.parentId);
      if (parent) createNode(id, parent);
    } else {
      createNode(id, selectedNode);
    }
  };

  const handleDelete = useCallback(() => {
    const { selectedNodeIds } = useEditorStore.getState();
    if (selectedNodeIds.size === 0) return;
    deleteSelectedNodes().then(() => {
      setToast({ message: "Nodes deleted", onUndo: undo });
    });
  }, [deleteSelectedNodes, undo]);

  const panelOpen = selectedNodeIds.size === 1;

  return (
    <div style={{ height: "100vh", background: "#0f172a", overflow: "hidden", position: "relative", fontFamily: "Inter, sans-serif" }}>

      {/* Header */}
      <EditorHeader
        onAddNode={handleAddNode}
        onToggleHistory={() => setIsHistoryOpen(!isHistoryOpen)}
        isHistoryOpen={isHistoryOpen}
      />

      {/* Canvas Area — offset by 52px header */}
      <div style={{ paddingTop: "52px", height: "100%" }}>
        <Canvas />
      </div>

      {/* Floating Controls */}
      <FloatingToolbar onDelete={handleDelete} />
      <ZoomControls panelOpen={panelOpen} />

      {/* Mini Navigator */}
      <MiniNavigator />
      <KeyboardShortcuts />

      {/* Editing Mode Active pill — only shown while editing a node's text */}
      {editingNodeId && (
        <div style={{
          position: "fixed", bottom: "16px", right: "60px",
          display: "flex", alignItems: "center", gap: "6px",
          background: "rgba(30,41,59,0.9)", border: "1px solid #334155",
          borderRadius: "20px", padding: "5px 12px",
          color: "#9ca3af", fontSize: "12px", fontWeight: 500,
          backdropFilter: "blur(8px)", zIndex: 35,
          pointerEvents: "none",
        }}>
          <span style={{ width: "7px", height: "7px", borderRadius: "50%", background: "#22c55e", display: "inline-block" }} />
          Editing Mode Active
        </div>
      )}

      {/* Properties Panel */}
      <NodePropertiesPanel />

      {/* Version Panel */}
      {isHistoryOpen && (
        <VersionPanel onClose={() => setIsHistoryOpen(false)} />
      )}

      {/* Toast notification */}
      {toast && (
        <Toast
          message={toast.message}
          onUndo={toast.onUndo}
          onDismiss={dismissToast}
        />
      )}

    </div>
  );
}
