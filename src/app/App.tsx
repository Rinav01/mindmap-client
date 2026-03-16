import { useEffect } from "react";
import AppRoutes from "./routes";
import { useAuthStore } from "../store/authStore";
import { useSyncStore } from "../store/useSyncStore";
import "../styles/global.css";

export default function App() {
  const checkAuth = useAuthStore((state) => state.checkAuth);
  const setNetworkStatus = useSyncStore((state) => state.setNetworkStatus);

  useEffect(() => {
    checkAuth();

    const handleOnline = () => {
      setNetworkStatus("idle");
      import("../store/operationDispatcher").then(m => m.syncOperationQueue());
    };
    const handleOffline = () => setNetworkStatus("offline");

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    // Initial check just in case
    if (!navigator.onLine) setNetworkStatus("offline");

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [checkAuth, setNetworkStatus]);

  return <AppRoutes />;
}
