/**
 * React context that provides AiSee glasses connection state
 * and controls to the entire component tree.
 *
 * Wraps the AiSeeGlassesService singleton and auto-starts the
 * foreground service when the authenticated user is available.
 */

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useRef,
} from "react";
import { Platform, ToastAndroid } from "react-native";
import { AiSeeGlassesService } from "../services/aisee/AiSeeGlassesService";
import type { AiSeeConnectionState } from "../services/aisee/types";
import { useAuth } from "./AuthContext";

interface AiSeeGlassesContextType {
  /** Current Bluetooth connection state. */
  connectionState: AiSeeConnectionState;
  /** Whether the glasses are connected and ready. */
  isConnected: boolean;
  /** Whether the native foreground service is running. */
  isServiceRunning: boolean;
  /** Connect to glasses with a specific MAC address. */
  connect: (macAddress: string) => Promise<void>;
  /** Disconnect and stop the service. */
  disconnect: () => void;
}

const AiSeeGlassesContext = createContext<AiSeeGlassesContextType>({
  connectionState: "DISCONNECTED",
  isConnected: false,
  isServiceRunning: false,
  connect: async () => {},
  disconnect: () => {},
});

export function useAiSeeGlasses(): AiSeeGlassesContextType {
  return useContext(AiSeeGlassesContext);
}

export function AiSeeGlassesProvider({
  children,
}: {
  children: React.ReactNode;
}): React.JSX.Element {
  const { user } = useAuth();
  const [connectionState, setConnectionState] =
    useState<AiSeeConnectionState>("DISCONNECTED");
  const [isServiceRunning, setIsServiceRunning] = useState(false);
  const serviceRef = useRef<AiSeeGlassesService | null>(null);
  const startedRef = useRef(false);

  // Initialize service and auto-connect after auth is ready
  useEffect(() => {
    if (Platform.OS !== "android") return;
    if (!user || !user.emailVerified) return;
    if (startedRef.current) return;

    const service = AiSeeGlassesService.getInstance();
    serviceRef.current = service;

    // Listen for state changes
    const removeStateListener = service.addStateListener((state) => {
      setConnectionState(state);
      setIsServiceRunning(service.isServiceRunning());
    });

    // Listen for memory saved events
    const removeMemoryListener = service.addMemorySavedListener((reply) => {
      if (Platform.OS === "android") {
        ToastAndroid.show("Memory saved via Glasses", ToastAndroid.SHORT);
      }
    });

    // Start the service
    startedRef.current = true;
    service.start().then(() => {
      setIsServiceRunning(service.isServiceRunning());
      setConnectionState(service.getConnectionState());
    });

    return () => {
      removeStateListener();
      removeMemoryListener();
    };
  }, [user]);

  const connect = useCallback(async (macAddress: string) => {
    const service = serviceRef.current;
    if (!service) return;
    await service.reconnect(macAddress);
  }, []);

  const disconnect = useCallback(() => {
    const service = serviceRef.current;
    if (!service) return;
    service.stop();
    setConnectionState("DISCONNECTED");
    setIsServiceRunning(false);
    startedRef.current = false;
  }, []);

  const isConnected =
    connectionState === "CONNECTED" || connectionState === "READY";

  return (
    <AiSeeGlassesContext.Provider
      value={{
        connectionState,
        isConnected,
        isServiceRunning,
        connect,
        disconnect,
      }}
    >
      {children}
    </AiSeeGlassesContext.Provider>
  );
}
