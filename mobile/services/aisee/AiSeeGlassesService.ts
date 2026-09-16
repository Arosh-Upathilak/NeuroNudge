/**
 * Singleton service that manages the AiSee glasses foreground service lifecycle.
 *
 * This service:
 * - Starts/stops the native Android foreground service
 * - Listens for native events and emits state updates
 * - Periodically refreshes the Firebase auth token
 */

import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getCurrentIdToken } from "../firebase";
import type {
  AiSeeConnectionState,
  AiSeeStateListener,
  AiSeeMemorySavedListener,
  AiSeeServiceConfig,
} from "./types";
import { DEFAULT_MAC_ADDRESS, AISEE_MAC_STORAGE_KEY } from "./types";

// Conditional import: the module only exists on Android
let AISeeGlasses: typeof import("expo-aisee-glasses") | null = null;
if (Platform.OS === "android") {
  try {
    AISeeGlasses = require("expo-aisee-glasses");
  } catch {
    console.warn("[AiSeeService] expo-aisee-glasses module not available");
  }
}

export class AiSeeGlassesService {
  private static instance: AiSeeGlassesService;

  private connectionState: AiSeeConnectionState = "DISCONNECTED";
  private stateListeners: Set<AiSeeStateListener> = new Set();
  private memorySavedListeners: Set<AiSeeMemorySavedListener> = new Set();
  private tokenRefreshInterval: ReturnType<typeof setInterval> | null = null;
  private eventSubscriptions: Array<{ remove: () => void }> = [];

  private constructor() {}

  public static getInstance(): AiSeeGlassesService {
    if (!AiSeeGlassesService.instance) {
      AiSeeGlassesService.instance = new AiSeeGlassesService();
    }
    return AiSeeGlassesService.instance;
  }

  /**
   * Initializes the service: subscribes to native events, starts the foreground
   * service, and sets up auth token refresh.
   */
  public async start(): Promise<void> {
    if (Platform.OS !== "android" || !AISeeGlasses) {
      return;
    }

    // Set up native event listeners
    this.setupEventListeners();

    // Read saved MAC address
    const savedMac = await AsyncStorage.getItem(AISEE_MAC_STORAGE_KEY);
    const macAddress = savedMac || DEFAULT_MAC_ADDRESS;

    // Get config values
    const apiKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY || "";
    const baseUrl = process.env.EXPO_PUBLIC_API_URL || "";

    let authToken = "";
    try {
      authToken = await getCurrentIdToken();
    } catch {
      console.warn("[AiSeeService] Failed to get initial auth token");
    }

    // Start the native foreground service
    AISeeGlasses.startService(macAddress, apiKey, authToken, baseUrl);

    // Refresh the auth token every 30 minutes
    this.tokenRefreshInterval = setInterval(async () => {
      try {
        const token = await getCurrentIdToken();
        AISeeGlasses?.updateAuthToken(token);
      } catch {
        console.warn("[AiSeeService] Failed to refresh auth token");
      }
    }, 30 * 60 * 1000);
  }

  /**
   * Stops the foreground service and cleans up listeners.
   */
  public stop(): void {
    if (!AISeeGlasses) return;

    AISeeGlasses.stopService();

    if (this.tokenRefreshInterval) {
      clearInterval(this.tokenRefreshInterval);
      this.tokenRefreshInterval = null;
    }

    this.removeEventListeners();
    this.connectionState = "DISCONNECTED";
    this.notifyStateListeners();
  }

  /**
   * Reconnects to glasses with a new MAC address.
   */
  public async reconnect(macAddress: string): Promise<void> {
    if (!AISeeGlasses) return;

    // Save the new MAC address
    await AsyncStorage.setItem(AISEE_MAC_STORAGE_KEY, macAddress);

    // Stop and restart with new config
    this.stop();
    await this.start();
  }

  // ─── State Access ───────────────────────────────────────────────────────

  public getConnectionState(): AiSeeConnectionState {
    if (!AISeeGlasses) return "DISCONNECTED";

    // Read from the native service if available
    try {
      const nativeState = AISeeGlasses.getServiceConnectionState();
      this.connectionState = nativeState as AiSeeConnectionState;
    } catch {
      // Fall back to cached state
    }

    return this.connectionState;
  }

  public isConnected(): boolean {
    const state = this.getConnectionState();
    return state === "CONNECTED" || state === "READY";
  }

  public isServiceRunning(): boolean {
    if (!AISeeGlasses) return false;
    try {
      return AISeeGlasses.isServiceRunning();
    } catch {
      return false;
    }
  }

  // ─── Listeners ──────────────────────────────────────────────────────────

  public addStateListener(listener: AiSeeStateListener): () => void {
    this.stateListeners.add(listener);
    return () => this.stateListeners.delete(listener);
  }

  public addMemorySavedListener(listener: AiSeeMemorySavedListener): () => void {
    this.memorySavedListeners.add(listener);
    return () => this.memorySavedListeners.delete(listener);
  }

  private notifyStateListeners(): void {
    for (const listener of this.stateListeners) {
      listener(this.connectionState);
    }
  }

  private notifyMemorySavedListeners(reply: string): void {
    for (const listener of this.memorySavedListeners) {
      listener(reply);
    }
  }

  // ─── Native Event Handling ──────────────────────────────────────────────

  private setupEventListeners(): void {
    if (!AISeeGlasses) return;

    this.eventSubscriptions.push(
      AISeeGlasses.addListener("onConnectionStateChanged", (event: { state: string }) => {
        this.connectionState = event.state as AiSeeConnectionState;
        this.notifyStateListeners();
      }),
    );

    this.eventSubscriptions.push(
      AISeeGlasses.addListener("onMemorySaved", (event: { reply: string }) => {
        this.notifyMemorySavedListeners(event.reply);
      }),
    );
  }

  private removeEventListeners(): void {
    for (const sub of this.eventSubscriptions) {
      sub.remove();
    }
    this.eventSubscriptions = [];
  }
}
