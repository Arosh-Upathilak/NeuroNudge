import AISeeGlassesModule from './AISeeGlassesModule';

export function init(apiKey: string): void {
  return AISeeGlassesModule.init(apiKey);
}

export function connect(macAddress: string): void {
  return AISeeGlassesModule.connect(macAddress);
}

export function disconnect(): void {
  return AISeeGlassesModule.disconnect();
}

export function startVoiceInput(): void {
  return AISeeGlassesModule.startVoiceInput();
}

export function stopVoiceInput(): void {
  return AISeeGlassesModule.stopVoiceInput();
}

export function snapPicture(): void {
  return AISeeGlassesModule.snapPicture();
}

export function setGlassesLed(on: boolean): void {
  return AISeeGlassesModule.setGlassesLed(on);
}

// ─── Foreground Service ─────────────────────────────────────────────────

export function startService(
  macAddress: string,
  apiKey: string,
  authToken: string,
  baseUrl: string,
): void {
  return AISeeGlassesModule.startService(macAddress, apiKey, authToken, baseUrl);
}

export function stopService(): void {
  return AISeeGlassesModule.stopService();
}

export function updateAuthToken(token: string): void {
  return AISeeGlassesModule.updateAuthToken(token);
}

export function isServiceRunning(): boolean {
  return AISeeGlassesModule.isServiceRunning();
}

export function getServiceConnectionState(): string {
  return AISeeGlassesModule.getServiceConnectionState();
}

// ─── Event Listeners ────────────────────────────────────────────────────

export function addListener(
  eventName: 'onConnectionStateChanged' | 'onImageCaptured' | 'onTranscript' | 'onAudioSaved' | 'onButtonPressed' | 'onMemorySaved',
  listener: (event: any) => void
) {
  return AISeeGlassesModule.addListener(eventName, listener);
}
