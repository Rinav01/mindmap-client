import { toPng } from "html-to-image";
import jsPDF from "jspdf";
import { api } from "./api";

const downloadBlob = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
};

export const exportMapJson = async (mapId: string) => {
    const res = await api.get(`/mindmaps/${mapId}/export/json`, { responseType: "blob" });
    downloadBlob(res.data, `Mindmap-Export.json`);
};

export const exportMapMarkdown = async (mapId: string) => {
    const res = await api.get(`/mindmaps/${mapId}/export/md`, { responseType: "blob" });
    downloadBlob(res.data, `Mindmap-Export.md`);
};

export const exportMapPng = async (mapTitle: string) => {
    // Find the SVG canvas to snapshot
    const container = document.getElementById("mindmap-canvas") as HTMLElement;
    if (!container) return;

    try {
        const dataUrl = await toPng(container, {
            filter: (node) => {
                // Ignore floating UI elements overlaid if necessary
                if (node.classList?.contains('react-flow__panel')) return false;
                return true;
            },
            backgroundColor: "#0f172a",
        });

        const link = document.createElement("a");
        link.download = `${mapTitle || "Mindmap"}.png`;
        link.href = dataUrl;
        link.click();
    } catch (err) {
        console.error("Failed to export PNG:", err);
    }
};

export const exportMapPdf = async (mapTitle: string) => {
    const container = document.getElementById("mindmap-canvas") as HTMLElement;
    if (!container) return;

    try {
        const dataUrl = await toPng(container, {
            backgroundColor: "#0f172a",
            pixelRatio: 2, // High resolution for PDF
        });

        // Calculate aspect ratio for scaling into A4
        const img = new Image();
        img.src = dataUrl;
        img.onload = () => {
            const pdf = new jsPDF({ orientation: img.width > img.height ? "landscape" : "portrait", unit: "px", format: [img.width, img.height] });
            pdf.addImage(dataUrl, "PNG", 0, 0, img.width, img.height);
            pdf.save(`${mapTitle || "Mindmap"}.pdf`);
        };
    } catch (err) {
        console.error("Failed to export PDF:", err);
    }
};
