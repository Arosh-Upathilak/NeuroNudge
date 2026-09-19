# expo-aisee-glasses

A complete React Native / Expo bridge for interacting with the AISee Smart Glasses.

This module wraps the proprietary Realsil SDK and provides a clean, unified JavaScript API to connect to the glasses, capture photos, and stream high-quality audio directly to Gemini 3.5 Transcribe.

## Features

- **Direct Bluetooth SPP Connection**: Seamlessly connects to the glasses using their MAC address.
- **Photo Capture**: Triggers H.264 video streaming, decodes a high-quality I-Frame into a JPEG, and saves it to the device's Pictures directory.
- **Voice Activity Detection (VAD)**: Intelligently monitors microphone audio. Records for a minimum of 8 seconds, and automatically cuts off when 1.5 seconds of silence is detected (or at a 20-second hard safety timeout).
- **Gemini Transcription Integration**: Automatically uploads captured PCM audio to `gemini-3.5-transcribe` and returns the transcribed text.
- **Bundled Realtek SDKs**: No messy manual Android library configurations. The proprietary `.aar` and `.jar` SDKs are bundled right inside this module.

## Installation

```bash
# This module is meant to be installed locally or via your private registry.
npm install expo-aisee-glasses
```

## Setup & Initialization

Before you can use the AISee Glasses, you must initialize the module with your Google Gemini API key. This key is securely used by the native Android layer to upload audio bytes for STT processing.

```javascript
import * as AISeeGlasses from 'expo-aisee-glasses';

// Initialize with your Gemini API Key
AISeeGlasses.init("YOUR_GEMINI_API_KEY");
```

## API Reference

### Methods

#### `connect(macAddress: string): void`
Connects to the AISee glasses via Bluetooth using the provided MAC address. 
_Example:_ `AISeeGlasses.connect("AA:BB:CC:DD:EE:FF");`

#### `disconnect(): void`
Disconnects from the currently connected glasses and cleans up resources.

#### `startVoiceInput(): void`
Manually starts the voice recording sequence. The microphone will activate, and the VAD (Voice Activity Detection) algorithm will automatically stop the recording when you finish speaking. 

#### `stopVoiceInput(): void`
Manually forces the voice recording to stop, bypassing the VAD and safety timeouts. 

#### `snapPicture(): void`
Triggers the glasses to capture a photo.

#### `setGlassesLed(on: boolean): void`
Turns the indicator LED on the glasses on or off.

### Events

You can listen to events using the `addListener` function:

```javascript
AISeeGlasses.addListener('eventName', (event) => { ... });
```

| Event Name | Payload | Description |
|------------|---------|-------------|
| `onConnectionStateChanged` | `{ state: string }` | Fires when the Bluetooth connection state changes (e.g., `CONNECTING`, `CONNECTED`, `READY`, `DISCONNECTED`). |
| `onImageCaptured` | `{ path: string }` | Fires when a photo is successfully captured and decoded. `path` is the absolute filepath to the JPEG on the Android device. |
| `onTranscript` | `{ text: string, isFinal: boolean }` | Fires when the Gemini API successfully transcribes the recorded audio. |
| `onAudioSaved` | `{ path: string }` | Fires when the `.wav` file is saved to disk, immediately before it is sent to Gemini. |
| `onButtonPressed` | `{}` | Fires when the user physically clicks the action button on the glasses. By default, this also automatically triggers a photo capture followed by a voice prompt. |

## Complete Usage Example

```javascript
import React, { useEffect, useState } from 'react';
import { View, Text, Button } from 'react-native';
import * as AISeeGlasses from 'expo-aisee-glasses';

export default function App() {
  const [transcript, setTranscript] = useState("");
  const [status, setStatus] = useState("Disconnected");

  useEffect(() => {
    // 1. Initialize API Key
    AISeeGlasses.init("YOUR_GEMINI_KEY");

    // 2. Setup Listeners
    const subState = AISeeGlasses.addListener('onConnectionStateChanged', (e) => {
      setStatus(e.state);
    });

    const subTranscript = AISeeGlasses.addListener('onTranscript', (e) => {
      setTranscript(e.text);
    });

    const subButton = AISeeGlasses.addListener('onButtonPressed', () => {
      console.log("Glasses button was clicked!");
    });

    return () => {
      subState.remove();
      subTranscript.remove();
      subButton.remove();
    };
  }, []);

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>Status: {status}</Text>
      <Text>Transcript: {transcript}</Text>
      
      <Button 
        title="Connect to Glasses" 
        onPress={() => AISeeGlasses.connect("YOUR_MAC_ADDRESS")} 
      />
    </View>
  );
}
```

## License
MIT
