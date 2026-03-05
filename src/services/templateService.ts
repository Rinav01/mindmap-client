import { api } from "./api";

export interface TemplateType {
    _id: string;
    title: string;
    description: string;
    category: string;
    nodes: any[];
}

export const fetchTemplates = async (): Promise<TemplateType[]> => {
    const res = await api.get("/templates");
    return res.data;
};

export const createMapFromTemplate = async (templateId: string): Promise<{ mapId: string }> => {
    const res = await api.post("/templates/from-template", { templateId });
    return res.data;
};
