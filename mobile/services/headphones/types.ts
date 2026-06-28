export enum AncMode {
  NORMAL = 0x00,
  ANC_ON = 0x01,
  TRANSPARENCY = 0x02,
}

export interface IHeadphoneIntegration {
  /**
   * Returns the user-facing name of the headphone device.
   */
  getDeviceName(): string;

  /**
   * Scans for the device among bonded (paired) Bluetooth devices.
   * Connects temporarily to verify if it is available or returns true if found.
   * Depending on the integration, it might return true just if it's bonded.
   */
  findDevice(): Promise<boolean>;

  /**
   * Sets the ANC mode on the device.
   *
   * @param mode The desired ANC mode
   */
  setAncMode(mode: AncMode): Promise<void>;
}
