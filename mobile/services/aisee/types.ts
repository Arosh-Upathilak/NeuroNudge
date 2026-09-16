/**
 * Type definitions for the AiSee Glasses integration service.
 */

/** Bluetooth connection states reported by the native module. */
export type AiSeeConnectionState =
  | "IDLE"
  | "SCANNING"
  | "CONNECTING"
  | "CONNECTED"
  | "INITIALIZING"
  | "READY"
  | "DISCONNECTED"
  | "ERROR";

/** Pipeline stages for the capture flow. */
export type AiSeePipelineState =
  | "IDLE"
  | "CAPTURING"
  | "LISTENING"
  | "TRANSCRIBING"
  | "SAVING";

/** Configuration object passed to the native foreground service. */
export interface AiSeeServiceConfig {
  macAddress: string;
  apiKey: string;
  authToken: string;
  baseUrl: string;
}

/** Listener signature for connection state changes. */
export type AiSeeStateListener = (state: AiSeeConnectionState) => void;

/** Listener signature for memory saved events. */
export type AiSeeMemorySavedListener = (reply: string) => void;

/** Default MAC address for the AiSee glasses. */
export const DEFAULT_MAC_ADDRESS = "33:EE:AD:00:01:70";

/** AsyncStorage key for the saved MAC address. */
export const AISEE_MAC_STORAGE_KEY = "aisee_mac_address";
