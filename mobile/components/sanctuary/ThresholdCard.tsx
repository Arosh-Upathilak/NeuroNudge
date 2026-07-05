import React, { useState } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import Slider from "@react-native-community/slider";

import { ScaledSheet } from "react-native-size-matters";

import { Fonts, FontSizes } from "../../constants/theme";
import { useTheme } from "../../hooks/useTheme";
import InteractiveThresholdModal from "./InteractiveThresholdModal";

interface ThresholdCardProps {
  threshold: number;
  onValueChange: (value: number) => void;
}

export default function ThresholdCard({
  threshold,
  onValueChange,
}: ThresholdCardProps): React.JSX.Element {
  const { colors }: { colors: ThemeColors } = useTheme();
  const [isInteractiveModalVisible, setInteractiveModalVisible] = useState(false);

  return (
    <View style={styles.container}>
      {/* Header */}

      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Text style={[styles.title, { color: colors.text }]}>
            Personal Threshold
          </Text>
          <TouchableOpacity 
            onPress={() => setInteractiveModalVisible(true)} 
            style={[styles.interactiveButton, { backgroundColor: colors.primary + "1A" }]}
          >
            <Ionicons name="options-outline" size={14} color={colors.primary} />
            <Text style={[styles.interactiveButtonText, { color: colors.primary }]}>Interactive</Text>
          </TouchableOpacity>
        </View>

        <Text style={[styles.dbValue, { color: colors.text }]}>
          {Math.round(threshold)} dB
        </Text>
      </View>

      {/* Slider */}

      <Slider
        style={styles.slider}
        minimumValue={0}
        maximumValue={100}
        value={threshold}
        onValueChange={onValueChange}
        minimumTrackTintColor={colors.primary}
        maximumTrackTintColor={colors.divider}
        thumbTintColor={colors.primary}
      />

      {/* Labels */}

      <View style={styles.labels}>
        <Text style={[styles.label, { color: colors.textSecondary }]}>
          Quiet
        </Text>

        <Text style={[styles.label, { color: colors.textSecondary }]}>
          Loud
        </Text>
      </View>

      <InteractiveThresholdModal
        isVisible={isInteractiveModalVisible}
        onClose={() => setInteractiveModalVisible(false)}
        onSetThreshold={onValueChange}
      />
    </View>
  );
}

const styles = ScaledSheet.create({
  container: {
    marginTop: "8@vs",
    marginBottom: "20@vs",
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "10@vs",
  },

  titleRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  interactiveButton: {
    marginLeft: "8@s",
    paddingHorizontal: "8@s",
    paddingVertical: "4@vs",
    borderRadius: "12@s",
    flexDirection: "row",
    alignItems: "center",
    gap: "4@s",
  },

  interactiveButtonText: {
    fontSize: "10@s",
    fontFamily: Fonts.medium,
  },

  title: {
    fontSize: FontSizes.md,
    fontFamily: Fonts.medium,
  },

  dbValue: {
    fontSize: FontSizes.md,
    fontFamily: Fonts.medium,
  },

  slider: {
    width: "100%",
    height: "30@vs",
  },

  labels: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: "-2@vs",
  },

  label: {
    fontSize: FontSizes.sm,
    fontFamily: Fonts.regular,
  },
});
