import { useEffect, useRef } from "react";
import { driver, type DriveStep } from "driver.js";
import { useAuthStore } from "../../store/authStore";
import { useEditorStore } from "../../store/editorStore";

export default function OnboardingTour({ isMapLoaded }: { isMapLoaded: boolean }) {
    const { user, completeOnboarding } = useAuthStore();
    const hasRun = useRef(false);
    const driverRef = useRef<ReturnType<typeof driver> | null>(null);

    // State tracking refs to detect when exactly an action was performed
    const initialNodeCount = useRef<number>(0);

    useEffect(() => {
        // Wait until map is fully loaded and user data exists
        if (!isMapLoaded || !user) return;
        
        // Only run once per session, and only for users who haven't completed it
        if (hasRun.current || user.hasCompletedOnboarding) return;

        let isMounted = true;
        
        // Initial state capture
        const currentState = useEditorStore.getState();
        initialNodeCount.current = currentState.nodes.length;
        
        const steps: DriveStep[] = [
            {
                popover: {
                    title: "👋 Welcome to MindFlow",
                    description: "Let's take a quick interactive tour to build your first map.",
                    side: "over",
                    align: "center",
                }
            },
            {
                element: ".tutorial-node",
                popover: {
                    title: "🧩 Creating Nodes",
                    description: "Select the root node and press <kbd>Tab</kbd> to add your first child idea.",
                    side: "bottom",
                    align: "center",
                    popoverClass: "hide-next-btn", // Custom CSS to hide the Next button
                }
            },
            {
                element: ".tutorial-node",
                popover: {
                    title: "✋ Drag to Organize",
                    description: "Excellent! Now grab the node and drag it somewhere else on the canvas.",
                    side: "right",
                    align: "center",
                    popoverClass: "hide-next-btn", // Custom CSS to hide the Next button
                }
            },
            {
                element: "#mini-navigator",
                popover: {
                    title: "🗺️ Navigation",
                    description: "As your map grows, use this minimap to instantly pan around the canvas.",
                    side: "top",
                    align: "start",
                }
            },
            {
                element: "#btn-ai-generate",
                popover: {
                    title: "✨ AI Brainstorming",
                    description: "Stuck on ideas? Click here to have AI generate an entire mind map for you in seconds.",
                    side: "bottom",
                    align: "end",
                }
            },
            {
                element: "#btn-history",
                popover: {
                    title: "⏪ Time Machine",
                    description: "Mistakes happen. Access your entire visual version history here.",
                    side: "bottom",
                    align: "center",
                }
            },
            {
                element: "#btn-share",
                popover: {
                    title: "🤝 Real-time Collaboration",
                    description: "Invite your team with one click. See live cursors from everyone — simultaneously.",
                    side: "bottom",
                    align: "center",
                }
            }
        ];

        driverRef.current = driver({
            showProgress: true,
            animate: true,
            allowClose: false, // Prevent clicking outside to close
            steps,
            onDestroyed: () => {
                completeOnboarding().catch(err => console.error("Failed to mark onboarding complete", err));
            }
        });

        const timer = setTimeout(() => {
            if (!isMounted) return;
            hasRun.current = true;
            driverRef.current?.drive();
        }, 1000);

        // --- ZUSTAND INTERACTIVE SUBSCRIPTION ---
        // We listen to the store to detect when the user performs the requested actions
        const unsubscribe = useEditorStore.subscribe((state, prevState) => {
            if (!driverRef.current) return;
            const currentStepIndex = driverRef.current.getActiveIndex();
            
            // Step 1 check (Index 1): Waiting for a node to be created
            if (currentStepIndex === 1) {
                if (state.nodes.length > prevState.nodes.length) {
                    // Node created! Move to the next step
                    driverRef.current.moveNext();
                }
            }
            
            // Step 2 check (Index 2): Waiting for a node to be dragged
            if (currentStepIndex === 2) {
                // Check if any node's coordinate changed
                if (state.nodes.length === prevState.nodes.length) {
                    const hasMoved = state.nodes.some((node, i) => {
                        const prevNode = prevState.nodes[i];
                        if (!prevNode) return false;
                        const dx = Math.abs(node.x - prevNode.x);
                        const dy = Math.abs(node.y - prevNode.y);
                        return dx > 50 || dy > 50;
                    });
                    if (hasMoved) {
                        driverRef.current.moveNext();
                    }
                }
            }
        });

        return () => {
            isMounted = false;
            clearTimeout(timer);
            unsubscribe();
            // If component unmounts mid-tour, destroy it forcefully
            if (driverRef.current?.isActive()) {
                driverRef.current.destroy();
            }
        };
    }, [isMapLoaded, user, completeOnboarding]);

    return null;
}
