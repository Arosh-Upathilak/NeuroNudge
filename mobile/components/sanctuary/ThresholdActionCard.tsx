import React from "react";
import { View, Text, TouchableOpacity } from "react-native";

import { Ionicons } from "@expo/vector-icons";
import { ScaledSheet } from "react-native-size-matters";

import { Fonts, FontSizes } from "../../constants/theme";
import { useTheme } from "../../hooks/useTheme";

type ThresholdAction = "none" | "sound" | "anc" | "both";
type BackgroundSound = "ocean" | "river" | "rain";

interface ThresholdActionCardProps {
  action: ThresholdAction;
  onActionChange: (action: ThresholdAction) => void;
  selectedSound: BackgroundSound;
  onSelectedSoundChange: (sound: BackgroundSound) => void;
}

export default function ThresholdActionCard({
  action,
  onActionChange,
  selectedSound,
  onSelectedSoundChange,
}: ThresholdActionCardProps): React.JSX.Element {
  const { colors }: { colors: ThemeColors } = useTheme();

  const actionsList: {
    id: ThresholdAction;
    label: string;
    description: string;
  }[] = [
    {
      id: "none",
      label: "Notify Only",
      description: "Trigger haptic and visual warnings only.",
    },
    {
      id: "sound",
      label: "Play Background Sound",
      description: "Mask ambient noise with calming nature sounds.",
    },
    {
      id: "anc",
      label: "Only Turn on ANC",
      description: "Activate Active Noise Cancellation.",
    },
    {
      id: "both",
      label: "Turn on ANC & Play Sound",
      description: "Activate ANC and mask with background nature sounds.",
    },
  ];

  const soundsList: {
    id: BackgroundSound;
    label: string;
    icon: keyof typeof Ionicons.glyphMap;
  }[] = [
    { id: "ocean", label: "Ocean Waves", icon: "water-outline" },
    { id: "river", label: "River Stream", icon: "leaf-outline" },
    { id: "rain", label: "Rain Shower", icon: "rainy-outline" },
  ];

  const showSoundSelector = action === "sound" || action === "both";

  return (
    <View style={[styles.card, { backgroundColor: colors.card }]}>
      <Text style={[styles.title, { color: colors.text }]}>
        Threshold Response
      </Text>
      <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
        Choose what happens when ambient noise exceeds threshold.
      </Text>

      {/* Action Options */}
      <View style={styles.optionsList}>
        {actionsList.map((item) => {
          const isSelected = action === item.id;
          return (
            <TouchableOpacity
              key={item.id}
              style={[
                styles.optionRow,
                {
                  borderColor: isSelected ? colors.primary : colors.divider,
                  backgroundColor: isSelected ? colors.background : colors.card,
                },
              ]}
              onPress={() => onActionChange(item.id)}
            >
              <View style={styles.optionHeader}>
                <View style={styles.optionTextContainer}>
                  <View style={styles.labelRow}>
                    <Text
                      style={[
                        styles.optionLabel,
                        {
                          color: isSelected ? colors.primary : colors.text,
                          fontFamily: isSelected
                            ? Fonts.semiBold
                            : Fonts.medium,
                        },
                      ]}
                    >
                      {item.label}
                    </Text>
                  </View>
                  <Text
                    style={[styles.optionDesc, { color: colors.textSecondary }]}
                  >
                    {item.description}
                  </Text>
                </View>
                {/* Radio Button indicator */}
                <View
                  style={[
                    styles.radioCircle,
                    {
                      borderColor: isSelected
                        ? colors.primary
                        : colors.textSecondary,
                    },
                  ]}
                >
                  {isSelected && (
                    <View
                      style={[
                        styles.radioInnerCircle,
                        {
                          backgroundColor: colors.primary,
                        },
                      ]}
                    />
                  )}
                </View>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Background Sound Selector Sub-Menu */}
      {showSoundSelector && (
        <View
          style={[
            styles.soundSelectorContainer,
            { borderTopColor: colors.divider },
          ]}
        >
          <Text style={[styles.soundSelectorTitle, { color: colors.text }]}>
            Select Calm Sound
          </Text>
          <View style={styles.soundsRow}>
            {soundsList.map((sound) => {
              const isSoundSelected = selectedSound === sound.id;
              return (
                <TouchableOpacity
                  key={sound.id}
                  style={[
                    styles.soundTab,
                    {
                      backgroundColor: isSoundSelected
                        ? colors.primary
                        : colors.background,
                    },
                  ]}
                  onPress={() => onSelectedSoundChange(sound.id)}
                >
                  <Ionicons
                    name={sound.icon}
                    size={16}
                    color={
                      isSoundSelected ? colors.surface : colors.textSecondary
                    }
                    style={styles.soundIcon}
                  />
                  <Text
                    style={[
                      styles.soundLabel,
                      {
                        color: isSoundSelected ? colors.surface : colors.text,
                        fontFamily: isSoundSelected
                          ? Fonts.medium
                          : Fonts.regular,
                      },
                    ]}
                  >
                    {sound.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      )}
    </View>
  );
}

const styles = ScaledSheet.create({
  card: {
    borderRadius: "24@s",
    padding: "20@s",
    marginTop: "12@vs",
    marginBottom: "12@vs",
  },

  title: {
    fontSize: FontSizes.md,
    fontFamily: Fonts.bold,
  },

  subtitle: {
    fontSize: FontSizes.sm,
    fontFamily: Fonts.regular,
    marginTop: "2@vs",
    marginBottom: "14@vs",
  },

  optionsList: {
    gap: "8@vs",
  },

  optionRow: {
    borderWidth: 1,
    borderRadius: "14@s",
    paddingHorizontal: "14@s",
    paddingVertical: "12@vs",
  },

  optionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  optionTextContainer: {
    flex: 1,
    marginRight: "12@s",
  },

  labelRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: "6@s",
  },

  optionLabel: {
    fontSize: FontSizes.md,
  },

  optionDesc: {
    fontSize: FontSizes.sm,
    fontFamily: Fonts.regular,
    marginTop: "2@vs",
  },

  radioCircle: {
    width: "18@s",
    height: "18@s",
    borderRadius: "9@s",
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },

  radioInnerCircle: {
    width: "10@s",
    height: "10@s",
    borderRadius: "5@s",
  },

  soundSelectorContainer: {
    borderTopWidth: 1,
    marginTop: "16@vs",
    paddingTop: "16@vs",
  },

  soundSelectorTitle: {
    fontSize: FontSizes.sm,
    fontFamily: Fonts.semiBold,
    marginBottom: "10@vs",
  },

  soundsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: "8@s",
  },

  soundTab: {
    flex: 1,
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: "8@vs",
    paddingHorizontal: "4@s",
    borderRadius: "12@s",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },

  soundIcon: {
    marginBottom: "4@vs",
  },

  soundLabel: {
    fontSize: "11@s",
    textAlign: "center",
  },
});
