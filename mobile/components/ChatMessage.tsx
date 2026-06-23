import React from "react";
import { View, Text, Image, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { ScaledSheet } from "react-native-size-matters";
import { Fonts, FontSizes } from "../constants/theme";
import { useTheme } from "../hooks/useTheme";

export interface ChatMessageData {
  id: string;
  type: "user" | "system" | "widget";
  text?: string;
  title?: string;
  location?: string;
  timeAgo?: string;
  imageUri?: string;
}

interface ChatMessageProps {
  message: ChatMessageData;
}

export default function ChatMessage({ message }: ChatMessageProps): React.JSX.Element | null {
  const { colors }: { colors: ThemeColors } = useTheme();

  if (message.type === "user") {
    if (!message.text && !message.imageUri) return null;
    return (
      <View style={styles.userContainer}>
        {message.imageUri && (
          <View style={styles.userImageWrapper}>
            <Image source={{ uri: message.imageUri }} style={styles.image} resizeMode="cover" />
          </View>
        )}
        {!!message.text && (
          <View style={[styles.userBubble, { backgroundColor: colors.primary }]}>
            <Text style={[styles.userText, { color: colors.surface }]}>{message.text}</Text>
          </View>
        )}
      </View>
    );
  }

  if (message.type === "system") {
    if (!message.text) return null;
    return (
      <View style={styles.systemContainer}>
        <View style={[styles.systemBubble, { backgroundColor: colors.card }]}>
          <Ionicons name="hardware-chip-outline" size={18} color={colors.primary} style={styles.systemIcon} />
          <Text style={[styles.systemText, { color: colors.text }]}>{message.text}</Text>
        </View>
      </View>
    );
  }

  if (message.type === "widget") {
    return (
      <View style={styles.systemContainer}>
        <View style={[styles.widgetContainer, { backgroundColor: colors.card }]}>
          {!!message.title && (
            <Text style={[styles.widgetTitle, { color: colors.text }]}>{message.title}</Text>
          )}
          
          {!!message.location && (
            <View style={styles.locationRow}>
              <Ionicons name="location-outline" size={16} color={colors.textSecondary} />
              <Text style={[styles.locationText, { color: colors.textSecondary }]}>{message.location}</Text>
            </View>
          )}

          <View style={styles.imageWrapper}>
            {message.imageUri ? (
              <Image source={{ uri: message.imageUri }} style={styles.image} resizeMode="cover" />
            ) : (
              <View style={[styles.imagePlaceholder, { backgroundColor: colors.background }]} />
            )}
            
            {!!message.timeAgo && (
              <View style={[styles.badgeContainer, { backgroundColor: colors.surface }]}>
                <Ionicons name="time-outline" size={12} color={colors.textSecondary} />
                <Text style={[styles.badgeText, { color: colors.textSecondary }]}>{message.timeAgo}</Text>
              </View>
            )}
          </View>

          <TouchableOpacity style={[styles.mapButton, { backgroundColor: colors.primary }]}>
            <Ionicons name="map-outline" size={18} color={colors.surface} />
            <Text style={[styles.mapButtonText, { color: colors.surface }]}>Open with Google Maps</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return <View />;
}

const styles = ScaledSheet.create({
  userContainer: {
    alignItems: "flex-end",
    marginBottom: "16@vs",
    paddingLeft: "40@s",
  },
  userImageWrapper: {
    width: "180@s",
    height: "140@vs",
    borderRadius: "12@s",
    overflow: "hidden",
    marginBottom: "8@vs",
  },
  userBubble: {
    paddingHorizontal: "16@s",
    paddingVertical: "12@vs",
    borderRadius: "20@s",
    borderBottomRightRadius: "4@s",
  },
  userText: {
    fontFamily: Fonts.regular,
    fontSize: FontSizes.md,
  },
  systemContainer: {
    alignItems: "flex-start",
    marginBottom: "16@vs",
    paddingRight: "40@s",
  },
  systemBubble: {
    flexDirection: "row",
    paddingHorizontal: "16@s",
    paddingVertical: "12@vs",
    borderRadius: "20@s",
    borderTopLeftRadius: "4@s",
  },
  systemIcon: {
    marginRight: "8@s",
    marginTop: "2@vs",
  },
  systemText: {
    flex: 1,
    fontFamily: Fonts.regular,
    fontSize: FontSizes.md,
  },
  widgetContainer: {
    width: "100%",
    borderRadius: "20@s",
    padding: "16@s",
  },
  widgetTitle: {
    fontFamily: Fonts.medium,
    fontSize: FontSizes.xl,
    marginBottom: "4@vs",
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: "16@vs",
  },
  locationText: {
    fontFamily: Fonts.regular,
    fontSize: FontSizes.sm,
    marginLeft: "4@s",
    flex: 1,
  },
  imageWrapper: {
    width: "100%",
    height: "140@vs",
    borderRadius: "12@s",
    overflow: "hidden",
    marginBottom: "16@vs",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  imagePlaceholder: {
    width: "100%",
    height: "100%",
  },
  badgeContainer: {
    position: "absolute",
    top: "8@vs",
    right: "8@s",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: "8@s",
    paddingVertical: "4@vs",
    borderRadius: "12@s",
  },
  badgeText: {
    fontFamily: Fonts.regular,
    fontSize: FontSizes.xs,
    marginLeft: "4@s",
  },
  mapButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: "12@vs",
    borderRadius: "24@s",
  },
  mapButtonText: {
    fontFamily: Fonts.medium,
    fontSize: FontSizes.md,
    marginLeft: "8@s",
  },
});
