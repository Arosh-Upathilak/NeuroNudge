import React, { useState } from "react";
import {
  View,
  Text,
} from "react-native";

import { ScaledSheet } from "react-native-size-matters";

import { Fonts, FontSizes } from "../../constants/theme";
import { useTheme } from "../../hooks/useTheme";

import CustomToggle from "./CustomToggle";

export default function AlertsTab(): React.JSX.Element {
  const { colors }: { colors: ThemeColors } = useTheme();

  const [thresholdAlerts, setThresholdAlerts] =
    useState(true);

  const [dailySummary, setDailySummary] =
    useState(false);

  const [pushNotifications, setPushNotifications] =
    useState(true);

  const [inAppSounds, setInAppSounds] =
    useState(true);

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
            onToggle={() => setThresholdAlerts((prev) => !prev)}
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
            onToggle={() => setDailySummary((prev) => !prev)}
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
            onToggle={() =>
              setPushNotifications(
                !pushNotifications
              )
            }
          />
        </View>

        <View
          style={[
            styles.divider,
            {
              backgroundColor:
                colors.divider,
            },
          ]}
        />

        <View style={styles.settingRow}>
          <Text
            style={[
              styles.itemTitle,
              {
                color: colors.text,
              },
            ]}
          >
            In-App Sounds
          </Text>

          <CustomToggle
            value={inAppSounds}
            onToggle={() =>
              setInAppSounds(!inAppSounds)
            }
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