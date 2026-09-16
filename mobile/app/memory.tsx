/**
 * Deep link route for Google Assistant / "Hey Google" voice commands.
 *
 * Expo Router matches `mobile://memory?text=...` to this file.
 * It extracts the `text` query param, stores it in VoiceCommandStore,
 * and immediately redirects to the Lost-Found Chat tab where the
 * message is auto-sent through the NLP pipeline.
 */

import { useEffect } from "react";
import { useLocalSearchParams, router } from "expo-router";
import { View, ActivityIndicator } from "react-native";
import { VoiceCommandStore } from "../services/voiceCommandStore";
import { useTheme } from "../hooks/useTheme";
import { ScaledSheet } from "react-native-size-matters";

export default function MemoryDeepLinkScreen(): React.JSX.Element {
  const { colors } = useTheme();
  const params = useLocalSearchParams<{ text?: string }>();

  useEffect(() => {
    const text = params.text;

    if (text && typeof text === "string" && text.trim().length > 0) {
      // Store the voice command text for the Lost-Found screen to pick up
      VoiceCommandStore.set(text.trim());
    }

    // Redirect to Lost-Found tab (Chat view)
    router.replace("/(tabs)/lost-found" as any);
  }, [params.text]);

  // Show a brief loading indicator while redirecting
  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ActivityIndicator size="large" color={colors.primary} />
    </View>
  );
}

const styles = ScaledSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
