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

interface ToastState {
  message: string;
  onUndo?: () => void;
}

export default function EditorPage() {
  const { id } = useParams();

  const loadNodes = useEditorStore((s) => s.loadNodes);
  const createNode = useEditorStore((s) => s.createNode);
  const deleteNode = useEditorStore((s) => s.deleteNode);
  const selectNode = useEditorStore((s) => s.selectNode);
  const undo = useEditorStore((s) => s.undo);
  const redo = useEditorStore((s) => s.redo);
  const selectedNodeId = useEditorStore((s) => s.selectedNodeId);
  const editingNodeId = useEditorStore((s) => s.editingNodeId);

  const [toast, setToast] = useState<ToastState | null>(null);
  const dismissToast = useCallback(() => setToast(null), []);

  // Load nodes + map title
  useEffect(() => {
    if (id) loadNodes(id);
  }, [id, loadNodes]);

  // Node interaction shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const { selectedNodeId, editingNodeId, nodes } =
        useEditorStore.getState();

      if (editingNodeId) return;
      if (!selectedNodeId) return;

      const selectedNode = nodes.find((n) => n._id === selectedNodeId);
      if (!selectedNode) return;

      if (e.key === "Delete") {
        e.preventDefault();
        deleteNode(selectedNodeId).then(() => {
          setToast({
            message: "Node deleted",
            onUndo: undo,
          });
        });
      } else if (e.key === "Escape") {
        selectNode("");
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [deleteNode, selectNode, undo]);

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
    const { selectedNodeId, nodes } = useEditorStore.getState();
    const selectedNode = nodes.find((n) => n._id === selectedNodeId);
    if (!selectedNode || !id) return;
    if (selectedNode.parentId) {
      const parent = nodes.find((n) => n._id === selectedNode.parentId);
      if (parent) createNode(id, parent);
    } else {
      createNode(id, selectedNode);
    }
  };

  const handleDelete = useCallback(() => {
    const { selectedNodeId } = useEditorStore.getState();
    if (!selectedNodeId) return;
    deleteNode(selectedNodeId).then(() => {
      setToast({ message: "Node deleted", onUndo: undo });
    });
  }, [deleteNode, undo]);

  const panelOpen = !!selectedNodeId;

  return (
    <div style={{ height: "100vh", background: "#0f172a", overflow: "hidden", position: "relative", fontFamily: "Inter, sans-serif" }}>

      {/* Header */}
      <EditorHeader onAddNode={handleAddNode} />

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
