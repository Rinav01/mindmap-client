import { create } from "zustand";
import * as service from "../services/mindmapService";
import { api } from "../services/api";

export interface Map {
  _id: string;
  title: string;
  isStarred: boolean;
}

interface MapsState {
  maps: Map[];
  loadMaps: () => Promise<void>;
  createMap: () => Promise<Map>;
  addMap: (map: Map) => void;
}

export const useMapsStore = create<MapsState>((set) => ({
  maps: [],

  loadMaps: async () => {
    try {
      const response = await api.get("/mindmaps");
      set({ maps: response.data });
    } catch (error) {
      console.error("Failed to load maps:", error);
    }
  },

  createMap: async () => {
    try {
      const response = await api.post("/mindmaps", {
        title: "Untitled Mind Map",
        isStarred: false,
      });
      const newMap = response.data;
      set((state) => ({
        maps: [...state.maps, newMap],
      }));
      return newMap;
    } catch (error) {
      console.error("Failed to create map:", error);
      throw error;
    }
  },

  addMap: (map) =>
    set((state) => ({
      maps: [...state.maps, map],
    })),
}));
