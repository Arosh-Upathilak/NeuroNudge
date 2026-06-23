import React from "react";
import { View, Text, Image, type ImageSourcePropType } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { ScaledSheet } from "react-native-size-matters";
import { Fonts, FontSizes } from "../constants/theme";
import { useTheme } from "../hooks/useTheme";

interface MemoryCardProps {
  title: string;
  location: string;
  dateStr: string;
  highlightDate?: boolean;
  imageSource?: ImageSourcePropType;
  iconName?: keyof typeof Ionicons.glyphMap;
}

export default function MemoryCard({
  title,
  location,
  dateStr,
  highlightDate = false,
  imageSource,
  iconName,
}: MemoryCardProps): React.JSX.Element {
  const { colors }: { colors: ThemeColors } = useTheme();

  return (
    <View style={[styles.cardContainer, { backgroundColor: colors.card }]}>
      <View style={[styles.imageContainer, { backgroundColor: colors.background }]}>
        {imageSource ? (
          <Image source={imageSource} style={styles.image} resizeMode="cover" />
        ) : iconName ? (
          <Ionicons name={iconName} size={32} color={colors.text} />
        ) : null}
      </View>
      <View style={styles.detailsContainer}>
        <Text style={[styles.title, { color: colors.text }]} numberOfLines={1}>
          {title}
        </Text>
        <View style={styles.locationRow}>
          <Ionicons name="location-outline" size={14} color={colors.textSecondary} />
          <Text style={[styles.locationText, { color: colors.textSecondary }]} numberOfLines={1}>
            {location}
          </Text>
        </View>
        <View style={styles.dateRow}>
          <View
            style={[
              styles.dateBadge,
              highlightDate && { backgroundColor: `${colors.info}20` }, // 20% opacity of info color
            ]}
          >
            <Text
              style={[
                styles.dateText,
                { color: highlightDate ? colors.info : colors.textSecondary },
                highlightDate && { fontFamily: Fonts.medium },
              ]}
            >
              {dateStr}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = ScaledSheet.create({
  cardContainer: {
    flexDirection: "row",
    borderRadius: "16@s",
    padding: "12@s",
    marginBottom: "16@vs",
    alignItems: "center",
  },
  imageContainer: {
    width: "70@s",
    height: "70@s",
    borderRadius: "12@s",
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
    marginRight: "16@s",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  detailsContainer: {
    flex: 1,
    justifyContent: "center",
  },
  title: {
    fontSize: FontSizes.lg,
    fontFamily: Fonts.medium,
    marginBottom: "4@vs",
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: "8@vs",
  },
  locationText: {
    fontSize: FontSizes.sm,
    fontFamily: Fonts.regular,
    marginLeft: "4@s",
  },
  dateRow: {
    flexDirection: "row",
  },
  dateBadge: {
    paddingHorizontal: "8@s",
    paddingVertical: "4@vs",
    borderRadius: "12@s",
  },
  dateText: {
    fontSize: FontSizes.xs,
    fontFamily: Fonts.regular,
  },
});
