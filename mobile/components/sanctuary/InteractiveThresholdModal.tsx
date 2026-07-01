import React, { useState, useEffect, useRef } from "react";
import { View, Text, Modal, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { ScaledSheet } from "react-native-size-matters";
import { createAudioPlayer } from "expo-audio";
import { Buffer } from "buffer";
import { Fonts, FontSizes } from "../../constants/theme";
import { useTheme } from "../../hooks/useTheme";

function generateWhiteNoiseUri(durationSeconds = 1, sampleRate = 44100): string {
  const numSamples = durationSeconds * sampleRate;
  const numChannels = 1;
  const bytesPerSample = 2;
  const blockAlign = numChannels * bytesPerSample;
  const byteRate = sampleRate * blockAlign;
  const dataSize = numSamples * blockAlign;
  const bufferSize = 44 + dataSize;

  const buffer = new ArrayBuffer(bufferSize);
  const view = new DataView(buffer);

  const writeString = (offset: number, string: string) => {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i));
    }
  };

  writeString(0, "RIFF");
  view.setUint32(4, 36 + dataSize, true);
  writeString(8, "WAVE");
  writeString(12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true); // PCM
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, byteRate, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, bytesPerSample * 8, true);
  writeString(36, "data");
  view.setUint32(40, dataSize, true);

  for (let i = 0; i < numSamples; i++) {
    const sample = Math.max(-32768, Math.min(32767, (Math.random() * 2 - 1) * 32767));
    view.setInt16(44 + i * 2, sample, true);
  }

  const base64 = Buffer.from(buffer).toString("base64");
  return `data:audio/wav;base64,${base64}`;
}



interface InteractiveThresholdModalProps {
  isVisible: boolean;
  onClose: () => void;
  onSetThreshold: (value: number) => void;
}

export default function InteractiveThresholdModal({
  isVisible,
  onClose,
  onSetThreshold,
}: InteractiveThresholdModalProps): React.JSX.Element {
  const { colors }: { colors: ThemeColors } = useTheme();

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentVolume, setCurrentVolume] = useState(0);

  const playerRef = useRef<any>(null);
  const intervalRef = useRef<any>(null);

  const startTest = async () => {
    try {
      if (!playerRef.current) {
        playerRef.current = createAudioPlayer(generateWhiteNoiseUri());
        playerRef.current.loop = true;
      }

      playerRef.current.volume = 0;
      await playerRef.current.play();

      setCurrentVolume(0);
      setIsPlaying(true);

      const duration = 15000; // 15 seconds to reach max
      const intervalMs = 100;
      const step = 1.0 / (duration / intervalMs);

      if (intervalRef.current) clearInterval(intervalRef.current);

      intervalRef.current = setInterval(() => {
        setCurrentVolume((prev) => {
          const nextVol = Math.min(1.0, prev + step);
          if (playerRef.current) {
            try {
              // Use an exponential curve (power of 3) for white noise 
              // because human hearing is logarithmic and white noise RMS is very high.
              // This makes the perceived volume increase linearly over time.
              playerRef.current.volume = Math.pow(nextVol, 3);
            } catch { }
          }
          if (nextVol >= 1.0) {
            if (intervalRef.current) clearInterval(intervalRef.current);
          }
          return nextVol;
        });
      }, intervalMs);
    } catch (e) {
      console.log(e);
    }
  };

  const stopAudio = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    if (playerRef.current) {
      try {
        playerRef.current.pause();
      } catch { }
    }
    setIsPlaying(false);
  };

  const handleClose = () => {
    stopAudio();
    onClose();
  };

  const handleSet = () => {
    // Map volume 0.0 - 1.0 to threshold 0 - 100
    // Actually, maybe noise floor starts higher, but let's just map 0-100 directly.
    // Or to give a reasonable range (30 - 95 is what the app uses for db), let's map 30 to 95.
    const minDb = 30;
    const maxDb = 95;
    const mappedThreshold = minDb + (currentVolume * (maxDb - minDb));

    onSetThreshold(Math.round(mappedThreshold));
    handleClose();
  };

  useEffect(() => {
    if (isVisible) {
      setCurrentVolume(0);
      setIsPlaying(false);
    } else {
      stopAudio();
    }
    return () => stopAudio();
  }, [isVisible]);

  return (
    <Modal visible={isVisible} transparent animationType="fade" onRequestClose={handleClose}>
      <View style={[styles.overlay, { backgroundColor: "rgba(0,0,0,0.5)" }]}>
        <View style={[styles.modalContainer, { backgroundColor: colors.card }]}>
          <Text style={[styles.title, { color: colors.text }]}>Interactive Threshold</Text>

          <Text style={[styles.description, { color: colors.textSecondary }]}>
            Listen to the increasing noise. Press the button when the noise reaches your comfort limit.
          </Text>

          <View style={styles.visualizerContainer}>
            <View
              style={[
                styles.volumeBar,
                {
                  backgroundColor: colors.primary,
                  width: `${currentVolume * 100}%`
                }
              ]}
            />
          </View>

          {!isPlaying ? (
            <TouchableOpacity
              style={[styles.button, { backgroundColor: colors.primary }]}
              onPress={startTest}
            >
              <Ionicons name="play" size={20} color={colors.surface} />
              <Text style={[styles.buttonText, { color: colors.surface }]}>Start Test</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={[styles.button, { backgroundColor: colors.error }]}
              onPress={handleSet}
            >
              <Ionicons name="stop" size={20} color={colors.surface} />
              <Text style={[styles.buttonText, { color: colors.surface }]}>Set Threshold</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={[styles.cancelButton]}
            onPress={handleClose}
          >
            <Text style={[styles.cancelButtonText, { color: colors.textSecondary }]}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = ScaledSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: "20@s",
  },
  modalContainer: {
    width: "100%",
    borderRadius: "20@s",
    padding: "20@s",
    alignItems: "center",
  },
  title: {
    fontSize: FontSizes.lg,
    fontFamily: Fonts.bold,
    marginBottom: "10@vs",
  },
  description: {
    fontSize: FontSizes.sm,
    fontFamily: Fonts.regular,
    textAlign: "center",
    marginBottom: "20@vs",
    lineHeight: "20@vs",
  },
  visualizerContainer: {
    width: "100%",
    height: "10@vs",
    backgroundColor: "rgba(0,0,0,0.1)",
    borderRadius: "5@s",
    marginBottom: "20@vs",
    overflow: "hidden",
  },
  volumeBar: {
    height: "100%",
    borderRadius: "5@s",
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    paddingVertical: "12@vs",
    borderRadius: "12@s",
    marginBottom: "10@vs",
    gap: "8@s",
  },
  buttonText: {
    fontSize: FontSizes.md,
    fontFamily: Fonts.semiBold,
  },
  cancelButton: {
    paddingVertical: "10@vs",
  },
  cancelButtonText: {
    fontSize: FontSizes.sm,
    fontFamily: Fonts.medium,
  },
});
