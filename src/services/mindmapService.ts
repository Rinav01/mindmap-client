import { api } from "./api";

export const fetchMaps = async () => {
  const res = await api.get("/mindmaps");
  return res.data;
};

export const createMap = async () => {
  const res = await api.post("/mindmaps", {
    title: "Untitled Map",
  });
  return res.data;
};

export const toggleStar = async (id: string) => {
  const res = await api.patch(`/mindmaps/${id}/star`);
  return res.data;
};

export const deleteMap = async (id: string) => {
  await api.delete(`/mindmaps/${id}`);
};
