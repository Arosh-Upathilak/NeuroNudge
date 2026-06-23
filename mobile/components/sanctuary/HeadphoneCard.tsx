import React from "react";
import {
  View,
  Text,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";
import { ScaledSheet } from "react-native-size-matters";

import { Fonts, FontSizes } from "../../constants/theme";

export default function HeadphoneCard(): React.JSX.Element {
  return (
    <View style={styles.card}>
      <View style={styles.iconContainer}>
        <Ionicons
          name="headset"
          size={22}
          color="#4C6F61"
        />
      </View>

      <View style={styles.textContainer}>
        <Text style={styles.title}>
          Optimize your experience
        </Text>

        <Text style={styles.description}>
          Connect headphones for active noise
          cancellation suggestions.
        </Text>
      </View>
    </View>
  );
}

const styles = ScaledSheet.create({
  card: {
    backgroundColor: "#CFE5F7",
    borderRadius: "24@s",
    padding: "18@s",
    flexDirection: "row",
    alignItems: "flex-start",
    marginTop: "12@vs",
  },

  iconContainer: {
    width: "38@s",
    height: "38@s",
    borderRadius: "19@s",
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: "12@s",
  },

  textContainer: {
    flex: 1,
  },

  title: {
    fontSize: FontSizes.md,
    fontFamily: Fonts.semiBold,
    color: "#556270",
    marginBottom: "4@vs",
  },

  description: {
    fontSize: FontSizes.sm,
    fontFamily: Fonts.regular,
    color: "#556270",
    lineHeight: "20@vs",
  },
});