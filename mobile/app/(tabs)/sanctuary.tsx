/**
 * Sound Sanctuary screen – manages acoustic environments
 * and calming audioscapes.
 */

import React, { useState, useEffect, useRef } from "react";
import { Text, ScrollView, PermissionsAndroid, Platform, Alert } from "react-native";
import { Fonts } from "../../constants/theme";
import { useTheme } from "../../hooks/useTheme";
import NoiseLevelCard from "../../components/sanctuary/NoiseLevelCard";
import ThresholdCard from "../../components/sanctuary/ThresholdCard";
import DelayCard from "../../components/sanctuary/DelayCard";
import ThresholdActionCard from "../../components/sanctuary/ThresholdActionCard";
import HeadphoneCard from "../../components/sanctuary/HeadphoneCard";

import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect } from "@react-navigation/native";
import { ScaledSheet } from "react-native-size-matters";
import { ExpoSpeechRecognitionModule, useSpeechRecognitionEvent } from "expo-speech-recognition";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Haptics from "expo-haptics";
import { createAudioPlayer } from "expo-audio";

import { HeadphoneManager } from "../../services/headphones/HeadphoneManager";
import { AncMode } from "../../services/headphones/types";

type ThresholdAction = "none" | "sound" | "anc" | "both";
type BackgroundSound = "ocean" | "river" | "rain";

export default function SanctuaryScreen(): React.JSX.Element {
  const { colors }: { colors: ThemeColors } = useTheme();

  const [currentLevel, setCurrentLevel] = useState(42);
  const [threshold, setThreshold] = useState(65);
  const [sustainDuration, setSustainDuration] = useState(2);
  const [isLoudSustained, setIsLoudSustained] = useState(false);
  const [permissionGranted, setPermissionGranted] = useState<boolean | null>(null);
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [isMonitoringEnabled, setIsMonitoringEnabled] = useState(true);
  const [isHeadphoneConnected, setIsHeadphoneConnected] = useState(false);
  const [connectedDeviceName, setConnectedDeviceName] = useState<string>("");
  const [isConnecting, setIsConnecting] = useState(false);

  // Threshold Actions & Background Sounds States
  const [action, setAction] = useState<ThresholdAction>("none");
  const [selectedSound, setSelectedSound] = useState<BackgroundSound>("ocean");

  const isFocusedRef = useRef(false);
  const hasTriggeredHaptic = useRef(false);
  const isRunningRef = useRef(false);
  const loudSinceRef = useRef<number | null>(null);
  const readingsWindowRef = useRef<{ db: number; timestamp: number }[]>([]);

  // Audio Playback & Fading Refs
  const playerRef = useRef<any>(null);
  const shouldBePlayingRef = useRef(false);
  const lastSoundTypeRef = useRef<BackgroundSound | null>(null);
  const fadeInIntervalRef = useRef<any>(null);
  const fadeOutIntervalRef = useRef<any>(null);
  const currentVolumeRef = useRef<number>(0);

  // --- Helpers (Callbacks) ---

  const checkPermissions = React.useCallback(async () => {
    try {
      const permission = await ExpoSpeechRecognitionModule.getPermissionsAsync();
      setPermissionGranted(permission.granted);
      return permission.granted;
    } catch (err) {
      console.log("Error checking mic permissions:", err);
      setPermissionGranted(false);
      return false;
    }
  }, []);

  const startMonitoring = React.useCallback(async () => {
    if (isRunningRef.current) {
      setIsMonitoring(true);
      return;
    }
    try {
      isRunningRef.current = true;
      setIsMonitoring(true);
      await ExpoSpeechRecognitionModule.start({
        lang: "en-US",
        volumeChangeEventOptions: { enabled: true },
        continuous: true,
      });
    } catch (err) {
      console.log("Error starting speech recognition for noise levels:", err);
      isRunningRef.current = false;
      setIsMonitoring(false);
    }
  }, []);

  const stopMonitoring = React.useCallback(async () => {
    setIsMonitoring(false);
    readingsWindowRef.current = [];
    try {
      await ExpoSpeechRecognitionModule.stop();
    } catch (err) {
      console.log("Error stopping speech recognition:", err);
    }
  }, []);

  const handleRequestPermission = React.useCallback(async () => {
    try {
      const permission = await ExpoSpeechRecognitionModule.requestPermissionsAsync();
      setPermissionGranted(permission.granted);
      if (permission.granted) {
        startMonitoring();
      }
    } catch (err) {
      console.log("Error requesting mic permissions:", err);
      setPermissionGranted(false);
    }
  }, [startMonitoring]);

  const unloadSoundInstantly = React.useCallback(async () => {
    shouldBePlayingRef.current = false;
    if (fadeInIntervalRef.current) clearInterval(fadeInIntervalRef.current);
    if (fadeOutIntervalRef.current) clearInterval(fadeOutIntervalRef.current);
    fadeInIntervalRef.current = null;
    fadeOutIntervalRef.current = null;

    if (playerRef.current) {
      try {
        playerRef.current.pause();
        playerRef.current.remove();
      } catch (err) {
        console.log("Error releasing sound instantly:", err);
      }
      playerRef.current = null;
    }
  }, []);

  const playAmbientSound = React.useCallback(async (soundType: BackgroundSound) => {
    shouldBePlayingRef.current = true;

    // Cancel any active fade-out
    if (fadeOutIntervalRef.current) {
      clearInterval(fadeOutIntervalRef.current);
      fadeOutIntervalRef.current = null;
    }

    // If sound type changed while playing, unload old one instantly
    if (playerRef.current && lastSoundTypeRef.current !== soundType) {
      await unloadSoundInstantly();
    }

    // If already playing, do nothing
    if (playerRef.current) {
      return;
    }

    // Audio stream URLs
    const urls = {
      rain: "https://archive.org/download/jamendo-082208/01.mp3",
      river: "https://archive.org/download/jamendo-082208/02.mp3",
      ocean: "https://archive.org/download/jamendo-082208/03.mp3",
    };
    const targetUrl = urls[soundType];

    try {
      lastSoundTypeRef.current = soundType;

      const player = createAudioPlayer(targetUrl);
      player.loop = true;
      player.volume = 0;

      // Async race condition check: if stopAmbientSound was called before player loaded
      if (!shouldBePlayingRef.current) {
        player.remove();
        return;
      }

      playerRef.current = player;
      await player.play();
      currentVolumeRef.current = 0;

      // Fade-in volume smoothly over 1.5 seconds (interval: 100ms)
      if (fadeInIntervalRef.current) clearInterval(fadeInIntervalRef.current);

      const targetVol = 0.5;
      const duration = 1500;
      const intervalMs = 100;
      const step = targetVol / (duration / intervalMs);

      fadeInIntervalRef.current = setInterval(async () => {
        currentVolumeRef.current = Math.min(targetVol, currentVolumeRef.current + step);
        try {
          if (playerRef.current) {
            playerRef.current.volume = currentVolumeRef.current;
          }
        } catch (err) {
          console.log("Error setting fade-in volume:", err);
        }

        if (currentVolumeRef.current >= targetVol) {
          if (fadeInIntervalRef.current) clearInterval(fadeInIntervalRef.current);
          fadeInIntervalRef.current = null;
        }
      }, intervalMs);
    } catch (err) {
      console.log("Error creating/playing audio:", err);
    }
  }, [unloadSoundInstantly]);

  const stopAmbientSound = React.useCallback(async () => {
    shouldBePlayingRef.current = false;

    // Cancel any active fade-in
    if (fadeInIntervalRef.current) {
      clearInterval(fadeInIntervalRef.current);
      fadeInIntervalRef.current = null;
    }

    const player = playerRef.current;
    if (!player) return;

    // If already in process of fading out, do not start again
    if (fadeOutIntervalRef.current) return;

    const duration = 1500;
    const intervalMs = 100;
    const startVol = currentVolumeRef.current;
    const step = startVol / (duration / intervalMs);

    fadeOutIntervalRef.current = setInterval(async () => {
      currentVolumeRef.current = Math.max(0, currentVolumeRef.current - step);
      try {
        if (playerRef.current) {
          playerRef.current.volume = currentVolumeRef.current;
        }
      } catch (err) {
        console.log("Error setting fade-out volume:", err);
      }

      if (currentVolumeRef.current <= 0) {
        if (fadeOutIntervalRef.current) clearInterval(fadeOutIntervalRef.current);
        fadeOutIntervalRef.current = null;

        try {
          if (playerRef.current) {
            playerRef.current.pause();
            playerRef.current.remove();
          }
        } catch (err) {
          console.log("Error releasing sound after fade-out:", err);
        }
        playerRef.current = null;
      }
    }, intervalMs);
  }, []);

  // --- Effects & Listeners ---

  // Load custom threshold, action, and sound on mount
  useEffect(() => {
    const loadSavedData = async () => {
      try {
        const savedThreshold = await AsyncStorage.getItem("sanctuary_threshold");
        if (savedThreshold !== null) {
          setThreshold(parseInt(savedThreshold, 10));
        }

        const savedSustain = await AsyncStorage.getItem("sanctuary_sustain");
        if (savedSustain !== null) {
          setSustainDuration(parseInt(savedSustain, 10));
        }

        const savedAction = await AsyncStorage.getItem("sanctuary_action");
        if (savedAction !== null) {
          setAction(savedAction as ThresholdAction);
        }

        const savedSound = await AsyncStorage.getItem("sanctuary_sound");
        if (savedSound !== null) {
          setSelectedSound(savedSound as BackgroundSound);
        }
      } catch (err) {
        console.log("Error loading saved data:", err);
      }
    };
    loadSavedData();

    return () => {
      unloadSoundInstantly();
    };
  }, [unloadSoundInstantly]);

  // Monitor Speech Recognition volume change events
  useSpeechRecognitionEvent("volumechange", (event) => {
    if (isMonitoring && isFocusedRef.current) {
      // Map event.value (ranges from -2 to 10) to db scale (30 to 95 dB)
      const minDb = 30;
      const maxDb = 95;
      const db = minDb + ((event.value + 2) / 12) * (maxDb - minDb);
      const rawDb = Math.max(minDb, Math.min(maxDb, db));

      const now = Date.now();
      readingsWindowRef.current.push({ db: rawDb, timestamp: now });

      // Keep only readings from the last 5 seconds
      const fiveSecondsAgo = now - 5000;
      readingsWindowRef.current = readingsWindowRef.current.filter(
        (r) => r.timestamp >= fiveSecondsAgo
      );

      // Compute rolling average
      const sum = readingsWindowRef.current.reduce((acc, r) => acc + r.db, 0);
      const average = readingsWindowRef.current.length > 0
        ? sum / readingsWindowRef.current.length
        : rawDb;

      setCurrentLevel(Math.round(average));
    }
  });

  useSpeechRecognitionEvent("start", () => {
    isRunningRef.current = true;
    setIsMonitoring(true);
  });

  // Handle auto-restart of speech recognition when it naturally ends
  useSpeechRecognitionEvent("end", () => {
    setIsMonitoring(false);
    isRunningRef.current = false;
    if (isFocusedRef.current && permissionGranted && isMonitoringEnabled) {
      startMonitoring();
    }
  });

  useSpeechRecognitionEvent("error", (event) => {
    console.log("Sanctuary Noise Monitoring Error:", event.error, event.message);
    setIsMonitoring(false);
    isRunningRef.current = false;

    // Automatically restart on no-speech to keep monitoring alive
    if (event.error === "no-speech" && isFocusedRef.current && permissionGranted && isMonitoringEnabled) {
      setTimeout(() => {
        startMonitoring();
      }, 1000);
    }
  });

  // Check Haptics whenever level changes
  useEffect(() => {
    if (permissionGranted && currentLevel > threshold && isMonitoringEnabled) {
      if (!hasTriggeredHaptic.current) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        hasTriggeredHaptic.current = true;
      }
    } else {
      hasTriggeredHaptic.current = false;
    }
  }, [currentLevel, threshold, permissionGranted, isMonitoringEnabled]);

  // Track sustained loud duration
  useEffect(() => {
    const isLoud = currentLevel > threshold;
    let timeout: ReturnType<typeof setTimeout> | null = null;
    
    if (isLoud) {
      if (loudSinceRef.current === null) {
        loudSinceRef.current = Date.now();
      }
      
      const timeLoud = Date.now() - loudSinceRef.current;
      const timeRemaining = (sustainDuration * 1000) - timeLoud;
      
      if (timeRemaining <= 0) {
        setIsLoudSustained(true);
      } else {
        timeout = setTimeout(() => {
          setIsLoudSustained(true);
        }, timeRemaining);
      }
    } else {
      loudSinceRef.current = null;
      setIsLoudSustained(false);
    }
    
    return () => {
      if (timeout) clearTimeout(timeout);
    };
  }, [currentLevel, threshold, sustainDuration]);

  // Audio Playback trigger based on threshold breach
  useEffect(() => {
    const shouldPlaySound =
      isMonitoringEnabled &&
      permissionGranted &&
      isLoudSustained &&
      (action === "sound" || action === "both");

    if (shouldPlaySound) {
      playAmbientSound(selectedSound);
    } else {
      stopAmbientSound();
    }
  }, [
    isLoudSustained,
    action,
    selectedSound,
    permissionGranted,
    isMonitoringEnabled,
    playAmbientSound,
    stopAmbientSound,
  ]);

  // ANC trigger based on threshold breach
  useEffect(() => {
    const shouldTriggerAnc =
      isMonitoringEnabled &&
      permissionGranted &&
      isLoudSustained &&
      (action === "anc" || action === "both");

    if (isHeadphoneConnected) {
      if (shouldTriggerAnc) {
        HeadphoneManager.getInstance().setAncMode(AncMode.ANC_ON);
      } else {
        // Revert to normal mode when loud noise subsides
        HeadphoneManager.getInstance().setAncMode(AncMode.NORMAL);
      }
    }
  }, [
    isLoudSustained,
    action,
    permissionGranted,
    isMonitoringEnabled,
    isHeadphoneConnected,
  ]);

  // Manage monitoring lifecycle based on screen focus
  useFocusEffect(
    React.useCallback(() => {
      isFocusedRef.current = true;

      const initMonitoring = async () => {
        try {
          const enabledStr = await AsyncStorage.getItem("ambient_noise_enabled");
          const enabled = enabledStr !== null ? enabledStr === "true" : true;
          setIsMonitoringEnabled(enabled);

          if (enabled) {
            const granted = await checkPermissions();
            if (granted) {
              startMonitoring();
            }
          } else {
            stopMonitoring();
          }
        } catch (err) {
          console.log("Error initializing monitoring on focus:", err);
        }
      };

      initMonitoring();

      return () => {
        isFocusedRef.current = false;
        stopMonitoring();
        unloadSoundInstantly();
      };
    }, [checkPermissions, startMonitoring, stopMonitoring, unloadSoundInstantly])
  );

  const handleThresholdChange = async (val: number) => {
    const rounded = Math.round(val);
    setThreshold(rounded);
    try {
      await AsyncStorage.setItem("sanctuary_threshold", rounded.toString());
    } catch (err) {
      console.log("Error saving threshold:", err);
    }
  };

  const handleDelayChange = async (val: number) => {
    const rounded = Math.round(val);
    setSustainDuration(rounded);
    try {
      await AsyncStorage.setItem("sanctuary_sustain", rounded.toString());
    } catch (err) {
      console.log("Error saving sustain duration:", err);
    }
  };

  const handleActionChange = async (newAction: ThresholdAction) => {
    setAction(newAction);
    try {
      await AsyncStorage.setItem("sanctuary_action", newAction);
    } catch (err) {
      console.log("Error saving action:", err);
    }
  };

  const handleSelectedSoundChange = async (newSound: BackgroundSound) => {
    setSelectedSound(newSound);
    try {
      await AsyncStorage.setItem("sanctuary_sound", newSound);
    } catch (err) {
      console.log("Error saving sound:", err);
    }
  };

  const handleHeadphoneConnectToggle = async () => {
    if (isHeadphoneConnected) {
      // Do nothing if already connected, as requested
      return;
    }

    try {
      let granted = true;
      if (Platform.OS === "android" && Platform.Version >= 31) {
        const result = await PermissionsAndroid.requestMultiple([
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
        ]);
        granted =
          result[PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT] ===
          PermissionsAndroid.RESULTS.GRANTED;
      }

      if (!granted) {
        Alert.alert(
          "Permission Required",
          "Bluetooth permission is required to detect headphones."
        );
        return;
      }

      setIsConnecting(true);
      
      const manager = HeadphoneManager.getInstance();
      const integration = await manager.scanAndConnect();
      
      if (integration) {
        setIsHeadphoneConnected(true);
        setConnectedDeviceName(integration.getDeviceName());
      } else {
        Alert.alert(
          "Device Not Found",
          "Could not find any supported headphones. Please ensure they are paired in your Android Bluetooth settings first."
        );
      }
      setIsConnecting(false);
    } catch (err) {
      console.log("Error requesting BT permissions:", err);
      setIsConnecting(false);
    }
  };

  return (
    <SafeAreaView
      edges={["bottom", "left", "right"]}
      style={[
        styles.container,
        { backgroundColor: colors.background },
      ]}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <Text
          style={[
            styles.title,
            { color: colors.text },
          ]}
        >
          Sound Sanctuary
        </Text>

        <Text
          style={[
            styles.subtitle,
            { color: colors.textSecondary },
          ]}
        >
          Monitoring ambient noise levels to support focus.
        </Text>

        <NoiseLevelCard
          currentLevel={currentLevel}
          threshold={threshold}
          permissionGranted={permissionGranted}
          onRequestPermission={handleRequestPermission}
          isMonitoringEnabled={isMonitoringEnabled}
          thresholdAction={action}
        />

        <ThresholdCard
          threshold={threshold}
          onValueChange={handleThresholdChange}
        />

        <DelayCard
          delay={sustainDuration}
          onValueChange={handleDelayChange}
        />

        <ThresholdActionCard
          action={action}
          onActionChange={handleActionChange}
          selectedSound={selectedSound}
          onSelectedSoundChange={handleSelectedSoundChange}
        />

        <HeadphoneCard
          isConnected={isHeadphoneConnected}
          isConnecting={isConnecting}
          deviceName={connectedDeviceName}
          onConnectToggle={handleHeadphoneConnectToggle}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = ScaledSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: "20@s",
    paddingTop: "8@vs",
    paddingBottom: "80@vs",
  },
  title: {
    fontSize: "30@s",
    fontFamily: Fonts.bold,
    textAlign: "center",
  },
  subtitle: {
    fontSize: "12@s",
    fontFamily: Fonts.regular,
    textAlign: "center",
    marginTop: "8@vs",
    marginBottom: "16@vs",
  },
});
