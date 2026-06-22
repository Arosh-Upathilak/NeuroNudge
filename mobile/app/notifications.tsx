import React, { useState } from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import Animated, { FadeIn, FadeOut, Layout } from "react-native-reanimated";
import { ScaledSheet, scale, verticalScale } from "react-native-size-matters";
import { Fonts, FontSizes } from "../constants/theme";
import { useTheme } from "../hooks/useTheme";
import {
  useNotifications,
  type NotificationFilter,
  type NotificationItem,
} from "../contexts/NotificationContext";

const FILTER_PILLS: NotificationFilter[] = ["All", "Unread", "Sound", "Items"];

export default function NotificationsScreen(): React.JSX.Element {
  const router = useRouter();
  const { colors }: { colors: ThemeColors } = useTheme();
  const { unreadCount, markAllAsRead, getFilteredNotifications } = useNotifications();
  
  const [activeFilter, setActiveFilter] = useState<NotificationFilter>("All");

  const filteredNotifications = getFilteredNotifications(activeFilter);
  const todayNotifications = filteredNotifications.filter((n) => n.section === "TODAY");
  const earlierNotifications = filteredNotifications.filter((n) => n.section === "EARLIER");

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Ionicons name="close-outline" size={28} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Notifications</Text>
        {unreadCount > 0 && (
          <Animated.View 
            entering={FadeIn} 
            exiting={FadeOut} 
            style={[styles.badge, { backgroundColor: colors.primary }]}
          >
            <Text style={styles.badgeText}>{unreadCount}</Text>
          </Animated.View>
        )}
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Filters */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false} 
          style={styles.filtersScroll}
          contentContainerStyle={styles.filtersContainer}
        >
          {FILTER_PILLS.map((pill) => {
            const isActive = activeFilter === pill;
            return (
              <TouchableOpacity
                key={pill}
                style={[
                  styles.pill,
                  { backgroundColor: isActive ? colors.primary : colors.card }
                ]}
                onPress={() => setActiveFilter(pill)}
              >
                <Text style={[
                  styles.pillText,
                  { color: isActive ? "#FFFFFF" : colors.text }
                ]}>
                  {pill}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Mark All As Read */}
        {unreadCount > 0 && (
          <Animated.View 
            entering={FadeIn}
            exiting={FadeOut}
            layout={Layout.springify()}
            style={styles.markReadButton}
          >
            <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center', gap: scale(4) }} onPress={markAllAsRead}>
              <Ionicons name="checkmark-done-outline" size={16} color={colors.primary} />
              <Text style={[styles.markReadText, { color: colors.primary }]}>Mark all as read</Text>
            </TouchableOpacity>
          </Animated.View>
        )}

        {/* TODAY SECTION */}
        {todayNotifications.length > 0 && (
          <Animated.View layout={Layout.springify()} style={styles.section}>
            <Animated.Text layout={Layout.springify()} style={[styles.sectionTitle, { color: colors.textSecondary }]}>TODAY</Animated.Text>
            {todayNotifications.map((notification) => (
              <Animated.View key={notification.id} entering={FadeIn} exiting={FadeOut} layout={Layout.springify()}>
                <NotificationCard notification={notification} colors={colors} />
              </Animated.View>
            ))}
          </Animated.View>
        )}

        {/* EARLIER SECTION */}
        {earlierNotifications.length > 0 && (
          <Animated.View layout={Layout.springify()} style={[styles.section, { marginTop: verticalScale(12) }]}>
            <Animated.Text layout={Layout.springify()} style={[styles.sectionTitle, { color: colors.textSecondary }]}>EARLIER</Animated.Text>
            {earlierNotifications.map((notification) => (
              <Animated.View key={notification.id} entering={FadeIn} exiting={FadeOut} layout={Layout.springify()}>
                <NotificationCard notification={notification} colors={colors} />
              </Animated.View>
            ))}
          </Animated.View>
        )}
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <TouchableOpacity disabled={true} style={{ opacity: 0.5 }}>
          <Text style={[styles.footerText, { color: colors.primary }]}>Notification Settings</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

function NotificationCard({ notification, colors }: { notification: NotificationItem, colors: ThemeColors }) {
  return (
    <View style={[styles.card, { backgroundColor: colors.card }]}>
      {/* Left Icon */}
      <View style={[styles.iconCircle, { backgroundColor: colors.primary }]}>
        <Ionicons name={notification.iconName} size={20} color="#FFFFFF" />
      </View>

      {/* Right Content */}
      <View style={styles.cardContent}>
        <View style={styles.cardHeader}>
          <Text style={[styles.categoryTitle, { color: colors.primary }]}>{notification.category}</Text>
          <View style={styles.timeContainer}>
            <Text style={[styles.timeText, { color: colors.textSecondary }]}>{notification.timeAgo}</Text>
            {notification.isUnread && <View style={[styles.unreadDot, { backgroundColor: colors.primary }]} />}
          </View>
        </View>
        <Text style={[styles.messageText, { color: colors.text }]} numberOfLines={3}>
          {notification.message}
        </Text>
      </View>
    </View>
  );
}

const styles = ScaledSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: "20@s",
    paddingVertical: "12@vs",
  },
  headerTitle: {
    fontSize: FontSizes.xxl,
    fontFamily: Fonts.bold,
    marginLeft: "16@s",
  },
  badge: {
    width: "24@s",
    height: "24@s",
    borderRadius: "12@s",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: "12@s",
  },
  badgeText: {
    color: "#FFFFFF",
    fontSize: FontSizes.sm,
    fontFamily: Fonts.bold,
  },
  content: {
    flex: 1,
    paddingHorizontal: "20@s",
  },
  filtersScroll: {
    flexGrow: 0,
    marginBottom: "12@vs",
  },
  filtersContainer: {
    gap: "10@s",
  },
  pill: {
    paddingHorizontal: "16@s",
    paddingVertical: "8@vs",
    borderRadius: "20@s",
  },
  pillText: {
    fontSize: FontSizes.md,
    fontFamily: Fonts.medium,
  },
  markReadButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    marginBottom: "12@vs",
    gap: "4@s",
  },
  markReadText: {
    fontSize: FontSizes.sm,
    fontFamily: Fonts.medium,
  },
  section: {
    marginBottom: "8@vs",
  },
  sectionTitle: {
    fontSize: FontSizes.xs,
    fontFamily: Fonts.bold,
    letterSpacing: 1,
    marginBottom: "8@vs",
  },
  card: {
    flexDirection: "row",
    borderRadius: "16@s",
    padding: "12@s",
    marginBottom: "8@vs",
  },
  iconCircle: {
    width: "40@s",
    height: "40@s",
    borderRadius: "20@s",
    alignItems: "center",
    justifyContent: "center",
    marginRight: "16@s",
  },
  cardContent: {
    flex: 1,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: "4@vs",
  },
  categoryTitle: {
    fontSize: FontSizes.sm,
    fontFamily: Fonts.bold,
  },
  timeContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: "6@s",
  },
  timeText: {
    fontSize: FontSizes.xs,
    fontFamily: Fonts.regular,
  },
  unreadDot: {
    width: "8@s",
    height: "8@s",
    borderRadius: "4@s",
  },
  messageText: {
    fontSize: FontSizes.md,
    fontFamily: Fonts.regular,
    lineHeight: "22@vs",
  },
  footer: {
    paddingVertical: "16@vs",
    alignItems: "center",
    justifyContent: "center",
  },
  footerText: {
    fontSize: FontSizes.md,
    fontFamily: Fonts.semiBold,
  },
});
