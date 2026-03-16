import { useEffect, useRef } from "react";
import { driver, type DriveStep } from "driver.js";
import { useAuthStore } from "../../store/authStore";
import { useEditorStore } from "../../store/editorStore";

export default function AdvancedFeatureHighlight({ isMapLoaded }: { isMapLoaded: boolean }) {
    const { user, completeAdvancedTutorial } = useAuthStore();
    const hasRun = useRef(false);
    const driverRef = useRef<ReturnType<typeof driver> | null>(null);

    useEffect(() => {
        // Wait until map is fully loaded and user data exists
        if (!isMapLoaded || !user) return;
        
        // Only run once per session, and only for users who haven't completed it
        if (hasRun.current || user.hasCompletedAdvancedTutorial) return;

        let isMounted = true;
        
        const steps: DriveStep[] = [
            {
                element: "#btn-focus-subtree",
                popover: {
                    title: "🔍 Focus Mode",
                    description: "Map getting cluttered? Select a node and click here to focus entirely on its subtree.",
                    side: "top",
                    align: "center",
                }
            },
            {
                element: "#btn-ai-generate",
                popover: {
                    title: "✨ Instant Brainstorming",
                    description: "Need more ideas? The AI can instantly generate 5 more branches for any selected node.",
                    side: "bottom",
                    align: "end",
                }
            }
        ];

        // --- ZUSTAND INTERACTIVE SUBSCRIPTION ---
        // We listen to the store to detect when the map gets complex enough
        const unsubscribe = useEditorStore.subscribe((state) => {
            if (hasRun.current || !isMounted || user.hasCompletedAdvancedTutorial) return;

            const totalNodes = state.nodes.length;
            
            // Find root node (node with no parentId)
            const rootNode = state.nodes.find(n => !n.parentId);
            if (!rootNode) return;

            const childCount = state.nodes.filter(n => n.parentId === rootNode._id).length;

            // Trigger condition: >= 10 total nodes AND >= 5 children on the root
            if (totalNodes >= 10 && childCount >= 5) {
                hasRun.current = true;
                
                driverRef.current = driver({
                    showProgress: true,
                    animate: true,
                    steps,
                    onDestroyed: () => {
                        completeAdvancedTutorial().catch(err => console.error("Failed to mark advanced tutorial complete", err));
                    }
                });
                
                // Small delay to ensure they are done clicking whatever triggered the state change
                setTimeout(() => {
                    if (isMounted) driverRef.current?.drive();
                }, 800);
            }
        });

        return () => {
            isMounted = false;
            unsubscribe();
            // If component unmounts mid-tour, destroy it forcefully
            if (driverRef.current?.isActive()) {
                driverRef.current.destroy();
            }
        };
    }, [isMapLoaded, user, completeAdvancedTutorial]);

    return null;
}
