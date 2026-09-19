import { NativeModule, requireNativeModule } from 'expo';

export type AISeeGlassesEvents = {
  onConnectionStateChanged: (event: { state: string }) => void;
  onImageCaptured: (event: { path: string }) => void;
  onTranscript: (event: { text: string; isFinal: boolean }) => void;
  onAudioSaved: (event: { path: string }) => void;
  onButtonPressed: (event: {}) => void;
  onMemorySaved: (event: { reply: string }) => void;
};

declare class AISeeGlassesModule extends NativeModule<AISeeGlassesEvents> {
  init(apiKey: string): void;
  connect(macAddress: string): void;
  disconnect(): void;
  startVoiceInput(): void;
  stopVoiceInput(): void;
  snapPicture(): void;
  setGlassesLed(on: boolean): void;

  // Foreground Service methods
  startService(macAddress: string, apiKey: string, authToken: string, baseUrl: string): void;
  stopService(): void;
  updateAuthToken(token: string): void;
  isServiceRunning(): boolean;
  getServiceConnectionState(): string;
}

export default requireNativeModule<AISeeGlassesModule>('AISeeGlasses');
