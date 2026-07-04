import * as Notifications from "expo-notifications";
import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getMemories } from "./api";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

export const NotificationService = {
  async requestPermissionsAsync(): Promise<boolean> {
    if (Platform.OS === "android") {
      await Notifications.setNotificationChannelAsync("default", {
        name: "default",
        importance: Notifications.AndroidImportance.LOW,
      });
    }

    const { status: existingStatus } =
      await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    return finalStatus === "granted";
  },

  async scheduleDailySummary(enabled: boolean): Promise<void> {
    await Notifications.cancelScheduledNotificationAsync("daily_summary").catch(
      () => {},
    );

    if (!enabled) return;

    const hasPermission = await this.requestPermissionsAsync();
    if (!hasPermission) return;

    let body =
      "Good morning! Here is a recap of your tracked items and memories.";

    try {
      const memories = await getMemories();
      const now = new Date();
      const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);

      const recentMemories = memories.filter(
        (m: any) => new Date(m.createdAt) >= yesterday,
      );
      if (recentMemories.length > 0) {
        const titles = recentMemories.map((m: any) => m.title);
        if (titles.length <= 3) {
          body = `Yesterday you tracked: ${titles.join(", ")}.`;
        } else {
          body = `Yesterday you tracked: ${titles.slice(0, 3).join(", ")} and ${titles.length - 3} more items.`;
        }
      } else {
        body =
          "You didn't track any new items yesterday. Remember to log your important things today!";
      }
    } catch {}

    await Notifications.scheduleNotificationAsync({
      identifier: "daily_summary",
      content: {
        title: "NeuroNudge Daily Summary",
        body,
        sound: false,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour: 8,
        minute: 0,
      } as Notifications.DailyTriggerInput,
    });
  },

  async updateDailySummaryIfNeeded(): Promise<void> {
    try {
      const dailySummaryStr = await AsyncStorage.getItem(
        "alerts_daily_summary",
      );
      const pushNotificationsStr = await AsyncStorage.getItem(
        "alerts_push_notifications",
      );

      const isDailySummaryEnabled = dailySummaryStr === "true";
      const isPushEnabled = pushNotificationsStr !== "false";

      if (isDailySummaryEnabled && isPushEnabled) {
        await this.scheduleDailySummary(true);
      }
    } catch {}
  },
};
