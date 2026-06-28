import RNBluetoothClassic, { BluetoothDevice } from 'react-native-bluetooth-classic';
import { Buffer } from 'buffer';
import { IHeadphoneIntegration, AncMode } from './types';

export class SoundpeatsIntegration implements IHeadphoneIntegration {
  private getAncPayloadBuffer(mode: AncMode): Buffer {
    return Buffer.from([0xff, 0x04, 0x00, 0x01, 0x00, 0x0a, 0x03, 0x11, mode]);
  }

  private async getBondedDevice(): Promise<BluetoothDevice | null> {
    try {
      const bondedDevices = await RNBluetoothClassic.getBondedDevices();
      
      const spDevice = bondedDevices.find(
        (device) => device.name.includes("Mini Pro HS") || device.name.toUpperCase().includes("SOUNDPEATS")
      );
      
      return spDevice || null;
    } catch (err) {
      console.error("[SoundpeatsIntegration] Error finding bonded devices:", err);
      return null;
    }
  }

  getDeviceName(): string {
    return "SoundPeats Mini Pro HS";
  }

  async findDevice(): Promise<boolean> {
    const device = await this.getBondedDevice();
    return device !== null;
  }

  async setAncMode(mode: AncMode): Promise<void> {
    try {
      const device = await this.getBondedDevice();
      
      if (!device) {
        console.warn("[SoundpeatsIntegration] No SoundPeats device found among bonded devices.");
        return;
      }

      // Connect to the device (RFCOMM / SPP)
      const isConnected = await device.connect();
      
      if (isConnected) {
        const payload = this.getAncPayloadBuffer(mode);
        const base64Payload = payload.toString('base64');
        
        await device.write(base64Payload, 'base64');
        console.log(`[SoundpeatsIntegration] Sent ANC mode ${mode} to ${device.name}`);
        
        // Immediately disconnect
        await device.disconnect();
      } else {
        console.warn(`[SoundpeatsIntegration] Failed to connect to ${device.name}`);
      }
    } catch (error) {
      console.error("[SoundpeatsIntegration] Failed to set ANC mode:", error);
    }
  }
}
