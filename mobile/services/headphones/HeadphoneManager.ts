import { IHeadphoneIntegration, AncMode } from "./types";
import { SoundpeatsIntegration } from "./SoundpeatsIntegration";

export class HeadphoneManager {
  private static instance: HeadphoneManager;

  private integrations: IHeadphoneIntegration[] = [];

  private activeIntegration: IHeadphoneIntegration | null = null;

  private constructor() {
    this.integrations.push(new SoundpeatsIntegration());
  }

  public static getInstance(): HeadphoneManager {
    if (!HeadphoneManager.instance) {
      HeadphoneManager.instance = new HeadphoneManager();
    }
    return HeadphoneManager.instance;
  }

  /**
   * Scans through registered integrations and connects to the first available bonded device.
   * Returns the active integration if successful, or null if no supported devices are found.
   */
  public async scanAndConnect(): Promise<IHeadphoneIntegration | null> {
    for (const integration of this.integrations) {
      const isFound = await integration.findDevice();
      if (isFound) {
        this.activeIntegration = integration;
        return this.activeIntegration;
      }
    }

    this.activeIntegration = null;
    return null;
  }

  /**
   * Gets the currently active integration if one has been connected.
   */
  public getActiveIntegration(): IHeadphoneIntegration | null {
    return this.activeIntegration;
  }

  /**
   * Disconnects the current active integration.
   */
  public disconnect(): void {
    this.activeIntegration = null;
  }

  /**
   * Sets the ANC mode on the active integration.
   * @param mode The desired ANC mode
   */
  public async setAncMode(mode: AncMode): Promise<void> {
    if (!this.activeIntegration) {
      console.warn(
        "[HeadphoneManager] Cannot set ANC mode: no active integration.",
      );
      return;
    }
    await this.activeIntegration.setAncMode(mode);
  }
}
