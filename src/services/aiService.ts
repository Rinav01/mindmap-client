import { api } from "./api";
import type { NodeType } from "../store/editorStore";

/**
 * Calls the backend AI endpoint to generate mindmap nodes from a topic string.
 * The backend calls Groq, converts the tree, saves nodes, and returns them.
 */
export const generateMindmapFromAI = async (
    topic: string,
    mindMapId: string
): Promise<NodeType[]> => {
    const res = await api.post("/ai/generate-mindmap", { topic, mindMapId });
    return res.data;
};

/**
 * Calls the backend AI endpoint to expand a specific node with generated children.
 */
export const expandNodeWithAI = async (
    mindMapId: string,
    nodeId: string,
    text: string
): Promise<NodeType[]> => {
    const res = await api.post("/ai/expand-node", { mindMapId, nodeId, text });
    return res.data;
};
