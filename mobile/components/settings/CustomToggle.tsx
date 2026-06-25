import React, { useEffect, useRef } from "react";
import {
  TouchableOpacity,
  Animated,
} from "react-native";

import { ScaledSheet } from "react-native-size-matters";
import { useTheme } from "../../hooks/useTheme";

interface CustomToggleProps {
  value: boolean;
  onToggle: () => void;
}

export default function CustomToggle({
  value,
  onToggle,
}: CustomToggleProps): React.JSX.Element {
  const { colors }: { colors: ThemeColors } =
    useTheme();

  const translateX =
    useRef(
      new Animated.Value(value ? 20 : 0)
    ).current;

  useEffect(() => {
    Animated.timing(translateX, {
      toValue: value ? 20 : 0,
      duration: 180,
      useNativeDriver: true,
    }).start();
  }, [value, translateX]);

  return (
    <TouchableOpacity
      accessibilityRole="switch"
      accessibilityState={{ checked: value }}
      activeOpacity={0.8}
      onPress={onToggle}
      style={[
        styles.track,
        {
          backgroundColor: value
            ? colors.primary
            : "#C9CECA",
        },
      ]}
    >
      <Animated.View
        style={[
          styles.thumb,
          {
            transform: [
              {
                translateX,
              },
            ],
          },
        ]}
      />
    </TouchableOpacity>
  );
}

const styles = ScaledSheet.create({
  track: {
    width: "48@s",
    height: "28@vs",
    borderRadius: "14@s",
    justifyContent: "center",
    paddingHorizontal: "2@s",
  },

  thumb: {
    width: "24@s",
    height: "24@s",
    borderRadius: "12@s",
    backgroundColor: "#FFFFFF",
  },
});