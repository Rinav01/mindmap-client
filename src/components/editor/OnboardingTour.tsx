import { useEffect, useRef } from "react";
import { driver, type DriveStep } from "driver.js";
import { useAuthStore } from "../../store/authStore";
import { useEditorStore } from "../../store/editorStore";

export default function OnboardingTour({ isMapLoaded }: { isMapLoaded: boolean }) {
    const { user, completeOnboarding } = useAuthStore();
    const hasRun = useRef(false);
    const driverRef = useRef<ReturnType<typeof driver> | null>(null);

    // State tracking refs to detect when exactly an action was performed
    useEffect(() => {
        // Wait until map is fully loaded and user data exists
        if (!isMapLoaded || !user) return;
        
        // Only run once per session, and only for users who haven't completed it
        if (hasRun.current || user.hasCompletedOnboarding) return;

        let isMounted = true;
        
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
                }
            },
            {
                element: ".tutorial-node",
                popover: {
                    title: "✋ Drag to Organize",
                    description: "Excellent! Now grab the node and drag it somewhere else on the canvas.",
                    side: "right",
                    align: "center",
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
            showProgress: false,
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

        return () => {
            isMounted = false;
            clearTimeout(timer);
            // If component unmounts mid-tour, destroy it forcefully
            if (driverRef.current?.isActive()) {
                driverRef.current.destroy();
            }
        };
    }, [isMapLoaded, user, completeOnboarding]);

    return null;
}
