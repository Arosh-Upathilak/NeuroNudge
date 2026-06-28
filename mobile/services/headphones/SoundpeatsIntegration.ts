import RNBluetoothClassic, {
  BluetoothDevice,
} from "react-native-bluetooth-classic";
import { Buffer } from "buffer";
import { IHeadphoneIntegration, AncMode } from "./types";

export class SoundpeatsIntegration implements IHeadphoneIntegration {
  private getAncPayloadBuffer(mode: AncMode): Buffer {
    return Buffer.from([0xff, 0x04, 0x00, 0x01, 0x00, 0x0a, 0x03, 0x11, mode]);
  }

  private async getBondedDevice(): Promise<BluetoothDevice | null> {
    try {
      const bondedDevices = await RNBluetoothClassic.getBondedDevices();

      const spDevice = bondedDevices.find(
        (device) =>
          device.name.includes("Mini Pro HS") ||
          device.name.toUpperCase().includes("SOUNDPEATS"),
      );

      return spDevice || null;
    } catch {
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
        return;
      }

      const isConnected = await device.connect();

      if (isConnected) {
        const payload = this.getAncPayloadBuffer(mode);
        const base64Payload = payload.toString("base64");

        await device.write(base64Payload, "base64");

        await device.disconnect();
      } else {
      }
    } catch {}
  }
}
