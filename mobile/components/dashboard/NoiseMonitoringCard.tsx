import React, { useState, useEffect } from "react";
import { View, Text } from "react-native";

import { Ionicons } from "@expo/vector-icons";
import { ScaledSheet } from "react-native-size-matters";

import { Fonts, FontSizes } from "../../constants/theme";
import { useTheme } from "../../hooks/useTheme";
import CustomToggle from "../settings/CustomToggle";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function NoiseMonitoringCard(): React.JSX.Element {
  const { colors }: { colors: ThemeColors } = useTheme();

  const [enabled, setEnabled] = useState(true);

  useEffect(() => {
    const loadStatus = async () => {
      try {
        const stored = await AsyncStorage.getItem("ambient_noise_enabled");
        if (stored !== null) {
          setEnabled(stored === "true");
        }
      } catch {}
    };
    loadStatus();
  }, []);

  const handleToggle = async () => {
    const nextVal = !enabled;
    setEnabled(nextVal);
    try {
      await AsyncStorage.setItem("ambient_noise_enabled", nextVal.toString());
    } catch {}
  };

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: colors.card,
        },
      ]}
    >
      <View style={styles.leftSection}>
        <View
          style={[
            styles.iconContainer,
            {
              backgroundColor: colors.background,
            },
          ]}
        >
          <Ionicons name="mic" size={18} color={colors.primary} />
        </View>

        <Text
          style={[
            styles.title,
            {
              color: colors.text,
            },
          ]}
        >
          Ambient Noise Monitoring
        </Text>
      </View>

      <CustomToggle value={enabled} onToggle={handleToggle} />
    </View>
  );
}

const styles = ScaledSheet.create({
  card: {
    borderRadius: "22@s",
    paddingHorizontal: "20@s",
    paddingVertical: "14@vs",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  leftSection: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },

  iconContainer: {
    width: "32@s",
    height: "32@s",
    borderRadius: "16@s",
    justifyContent: "center",
    alignItems: "center",
    marginRight: "12@s",
  },

  title: {
    fontSize: FontSizes.md,
    fontFamily: Fonts.medium,
    flexShrink: 1,
  },
});
