import { create } from "zustand";
import { api } from "../services/api";

export interface Map {
  _id: string;
  title: string;
  isStarred: boolean;
  updatedAt: string;
  createdAt: string;
  deletedAt?: string | null;
  nodeCount: number;
}

interface MapsState {
  maps: Map[];
  trashedMaps: Map[];
  loadMaps: () => Promise<void>;
  loadTrash: () => Promise<void>;
  createMap: () => Promise<Map>;
  addMap: (map: Map) => void;
  deleteMap: (id: string) => Promise<void>;
  toggleStar: (id: string) => Promise<void>;
  restoreMap: (id: string) => Promise<void>;
  permanentlyDeleteMap: (id: string) => Promise<void>;
}

export const useMapsStore = create<MapsState>((set) => ({
  maps: [],
  trashedMaps: [],

  loadMaps: async () => {
    try {
      const response = await api.get("/mindmaps");
      set({ maps: response.data });
    } catch (error) {
      console.error("Failed to load maps:", error);
    }
  },

  loadTrash: async () => {
    try {
      const response = await api.get("/mindmaps/trash");
      set({ trashedMaps: response.data });
    } catch (error) {
      console.error("Failed to load trash:", error);
    }
  },

  createMap: async () => {
    try {
      const response = await api.post("/mindmaps", {
        title: "Untitled Mind Map",
        isStarred: false,
      });
      const newMap = response.data;
      set((state) => ({ maps: [newMap, ...state.maps] }));
      return newMap;
    } catch (error) {
      console.error("Failed to create map:", error);
      throw error;
    }
  },

  addMap: (map) =>
    set((state) => ({ maps: [map, ...state.maps] })),

  deleteMap: async (id) => {
    try {
      await api.delete(`/mindmaps/${id}`);
      set((state) => ({
        maps: state.maps.filter((m) => m._id !== id),
      }));
    } catch (error) {
      console.error("Failed to delete map:", error);
    }
  },

  toggleStar: async (id) => {
    try {
      const response = await api.patch(`/mindmaps/${id}/star`);
      const updated = response.data;
      set((state) => ({
        maps: state.maps.map((m) => (m._id === id ? updated : m)),
      }));
    } catch (error) {
      console.error("Failed to toggle star:", error);
    }
  },

  restoreMap: async (id) => {
    try {
      const response = await api.patch(`/mindmaps/${id}/restore`);
      const restored = response.data;
      set((state) => ({
        trashedMaps: state.trashedMaps.filter((m) => m._id !== id),
        maps: [restored, ...state.maps],
      }));
    } catch (error) {
      console.error("Failed to restore map:", error);
    }
  },

  permanentlyDeleteMap: async (id) => {
    try {
      await api.delete(`/mindmaps/${id}/permanent`);
      set((state) => ({
        trashedMaps: state.trashedMaps.filter((m) => m._id !== id),
      }));
    } catch (error) {
      console.error("Failed to permanently delete map:", error);
    }
  },
}));
