import React, { useState, useEffect } from "react";
import { View, Text } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { ScaledSheet } from "react-native-size-matters";

import { Fonts, FontSizes } from "../../constants/theme";
import { useTheme } from "../../hooks/useTheme";

import CustomToggle from "./CustomToggle";
import { NotificationService } from "../../services/NotificationService";

export default function AlertsTab(): React.JSX.Element {
  const { colors }: { colors: ThemeColors } = useTheme();

  const [thresholdAlerts, setThresholdAlerts] = useState(true);

  const [dailySummary, setDailySummary] = useState(false);

  const [pushNotifications, setPushNotifications] = useState(true);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const threshold = await AsyncStorage.getItem("alerts_threshold");
        if (threshold !== null) setThresholdAlerts(threshold === "true");

        const daily = await AsyncStorage.getItem("alerts_daily_summary");
        if (daily !== null) setDailySummary(daily === "true");

        const push = await AsyncStorage.getItem("alerts_push_notifications");
        if (push !== null) setPushNotifications(push === "true");
      } catch {}
    };
    loadSettings();
  }, []);

  const handleToggle = async (
    key: string,
    value: boolean,
    setter: React.Dispatch<React.SetStateAction<boolean>>,
  ) => {
    setter(value);
    try {
      await AsyncStorage.setItem(key, value.toString());
    } catch {}
  };

  const handleDailySummaryToggle = async () => {
    const newVal = !dailySummary;
    await handleToggle("alerts_daily_summary", newVal, setDailySummary);
    if (pushNotifications) {
      NotificationService.scheduleDailySummary(newVal);
    } else if (!newVal) {
      NotificationService.scheduleDailySummary(false);
    }
  };

  const handlePushNotificationsToggle = async () => {
    const newVal = !pushNotifications;
    await handleToggle(
      "alerts_push_notifications",
      newVal,
      setPushNotifications,
    );
    if (newVal) {
      const granted = await NotificationService.requestPermissionsAsync();
      if (!granted) {
        setPushNotifications(false);
        await AsyncStorage.setItem("alerts_push_notifications", "false");
        return;
      }
      if (dailySummary) {
        NotificationService.scheduleDailySummary(newVal);
      }
    } else {
      await handleToggle("alerts_threshold", false, setThresholdAlerts);
      await handleToggle("alerts_daily_summary", false, setDailySummary);
      NotificationService.scheduleDailySummary(false);
    }
  };

  return (
    <>
      {/* Noise Alerts */}

      <View
        style={[
          styles.card,
          {
            backgroundColor: colors.card,
          },
        ]}
      >
        <Text
          style={[
            styles.sectionTitle,
            {
              color: colors.text,
            },
          ]}
        >
          Noise Alerts
        </Text>

        <View style={styles.settingRow}>
          <View style={styles.textContainer}>
            <Text
              style={[
                styles.itemTitle,
                {
                  color: colors.text,
                },
              ]}
            >
              Threshold Alerts
            </Text>

            <Text
              style={[
                styles.itemSubtitle,
                {
                  color: colors.textSecondary,
                },
              ]}
            >
              Notify when noise exceeds your limit
            </Text>
          </View>

          <CustomToggle
            value={thresholdAlerts}
            disabled={!pushNotifications}
            onToggle={() =>
              handleToggle(
                "alerts_threshold",
                !thresholdAlerts,
                setThresholdAlerts,
              )
            }
          />
        </View>
      </View>

      {/* Item Alerts */}

      <View
        style={[
          styles.card,
          {
            backgroundColor: colors.card,
          },
        ]}
      >
        <Text
          style={[
            styles.sectionTitle,
            {
              color: colors.text,
            },
          ]}
        >
          Item Alerts
        </Text>

        <View style={styles.settingRow}>
          <View style={styles.textContainer}>
            <Text
              style={[
                styles.itemTitle,
                {
                  color: colors.text,
                },
              ]}
            >
              Daily Summary
            </Text>

            <Text
              style={[
                styles.itemSubtitle,
                {
                  color: colors.textSecondary,
                },
              ]}
            >
              Morning recap of your tracked items
            </Text>
          </View>

          <CustomToggle
            value={dailySummary}
            disabled={!pushNotifications}
            onToggle={handleDailySummaryToggle}
          />
        </View>
      </View>

      {/* Delivery Methods */}

      <View
        style={[
          styles.card,
          {
            backgroundColor: colors.card,
            marginBottom: 120,
          },
        ]}
      >
        <Text
          style={[
            styles.sectionTitle,
            {
              color: colors.text,
            },
          ]}
        >
          Delivery Methods
        </Text>

        <View style={styles.settingRow}>
          <Text
            style={[
              styles.itemTitle,
              {
                color: colors.text,
              },
            ]}
          >
            Push Notifications
          </Text>

          <CustomToggle
            value={pushNotifications}
            onToggle={handlePushNotificationsToggle}
          />
        </View>
      </View>
    </>
  );
}

const styles = ScaledSheet.create({
  card: {
    borderRadius: "24@s",
    paddingHorizontal: "24@s",
    paddingVertical: "24@vs",
    marginBottom: "16@vs",
  },

  sectionTitle: {
    fontSize: FontSizes.xl,
    fontFamily: Fonts.semiBold,
    marginBottom: "22@vs",
  },

  settingRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  textContainer: {
    flex: 1,
    marginRight: "12@s",
  },

  itemTitle: {
    fontSize: FontSizes.md,
    fontFamily: Fonts.medium,
    marginBottom: "6@vs",
  },

  itemSubtitle: {
    fontSize: FontSizes.sm,
    fontFamily: Fonts.regular,
    lineHeight: "18@vs",
  },

  divider: {
    height: 1,
    marginVertical: "18@vs",
  },
});
