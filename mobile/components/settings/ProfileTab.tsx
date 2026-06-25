import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { ScaledSheet } from "react-native-size-matters";

import { Fonts, FontSizes } from "../../constants/theme";
import { useTheme } from "../../hooks/useTheme";

export default function ProfileTab(): React.JSX.Element {
  const { colors }: { colors: ThemeColors } = useTheme();

  return (
    <>
      {/* Profile Card */}
      <TouchableOpacity
      style={[
        styles.profileCard,
        { backgroundColor: colors.card },
      ]}
      activeOpacity={0.9}
      onPress={() => router.push("/settings/edit-profile") }
      >
        <View>
          <View
            style={[
              styles.avatar,
              { backgroundColor: colors.primary },
            ]}
          >
            <Ionicons
              name="person-outline"
              size={34}
              color="#FFFFFF"
            />
          </View>

          <TouchableOpacity
  style={[
    styles.editAvatarButton,
    {
      backgroundColor: colors.primary,
    },
  ]}
  activeOpacity={0.8}
  onPress={() => router.push("/settings/edit-profile")}
>
  <Ionicons
    name="create-outline"
    size={14}
    color="#FFFFFF"
  />
</TouchableOpacity>
        </View>

        <View style={styles.profileInfo}>
          <Text
            style={[
              styles.userName,
              { color: colors.text },
            ]}
          >
            Alex Doe
          </Text>

          <Text
            style={[
              styles.userEmail,
              {
                color: colors.textSecondary,
              },
            ]}
          >
            alex@example.com
          </Text>
        </View>
      </TouchableOpacity>

      {/* Personal Information */}
      <View
        style={[
          styles.card,
          { backgroundColor: colors.card },
        ]}
      >
        <Text
          style={[
            styles.sectionTitle,
            { color: colors.text },
          ]}
        >
          Personal Information
        </Text>

        <View style={styles.infoBlock}>
          <Text
            style={[
              styles.label,
              {
                color:
                  colors.textSecondary,
              },
            ]}
          >
            FULL NAME
          </Text>

          <Text
            style={[
              styles.value,
              { color: colors.text },
            ]}
          >
            Alex Doe
          </Text>
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

        <View style={styles.infoBlock}>
          <Text
            style={[
              styles.label,
              {
                color:
                  colors.textSecondary,
              },
            ]}
          >
            EMAIL
          </Text>

          <Text
            style={[
              styles.value,
              { color: colors.text },
            ]}
          >
            alex@example.com
          </Text>
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

        <View style={styles.infoBlock}>
          <Text
            style={[
              styles.label,
              {
                color:
                  colors.textSecondary,
              },
            ]}
          >
            USERNAME
          </Text>

          <Text
            style={[
              styles.value,
              { color: colors.text },
            ]}
          >
            @alexdoe
          </Text>
        </View>

        <TouchableOpacity
          style={[
            styles.editButton,
            {
              backgroundColor:
                colors.primary,
            },
          ]}
          activeOpacity={0.8}
          onPress={() =>
            router.push(
              "/settings/edit-profile" as any
            )
          }
        >
          <Ionicons
            name="create-outline"
            size={18}
            color="#FFFFFF"
          />

          <Text style={styles.editButtonText}>
            Edit Profile
          </Text>
        </TouchableOpacity>
      </View>

      {/* Security */}
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
            { color: colors.text },
          ]}
        >
          Security
        </Text>

        <TouchableOpacity
          style={styles.securityItem}
        >
          <Text
            style={[
              styles.securityText,
              { color: colors.text },
            ]}
          >
            Change Password
          </Text>

          <Ionicons
            name="chevron-forward"
            size={20}
            color={colors.textSecondary}
          />
        </TouchableOpacity>

        <View
          style={[
            styles.divider,
            {
              backgroundColor:
                colors.divider,
            },
          ]}
        />

        <TouchableOpacity
          style={styles.securityItem}
        >
          <Text
            style={[
              styles.securityText,
              { color: colors.text },
            ]}
          >
            Notifications
          </Text>

          <Ionicons
            name="chevron-forward"
            size={20}
            color={colors.textSecondary}
          />
        </TouchableOpacity>

        <View
          style={[
            styles.divider,
            {
              backgroundColor:
                colors.divider,
            },
          ]}
        />

        <TouchableOpacity
          style={styles.securityItem}
        >
          <Text
            style={[
              styles.securityText,
              { color: colors.error },
            ]}
          >
            Sign Out
          </Text>

          <Ionicons
            name="log-out-outline"
            size={20}
            color={colors.error}
          />
        </TouchableOpacity>
      </View>
    </>
  );
}

const styles = ScaledSheet.create({
  profileCard: {
    borderRadius: "24@s",
    padding: "24@s",
    flexDirection: "row",
    alignItems: "center",
    marginBottom: "18@vs",
  },

  avatar: {
    width: "72@s",
    height: "72@s",
    borderRadius: "36@s",
    alignItems: "center",
    justifyContent: "center",
  },

  editAvatarButton: {
    position: "absolute",
    right: "-2@s",
    bottom: "-2@vs",
    width: "28@s",
    height: "28@s",
    borderRadius: "14@s",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#FFFFFF",
  },

  profileInfo: {
    marginLeft: "16@s",
  },

  userName: {
    fontSize: FontSizes.xl,
    fontFamily: Fonts.semiBold,
  },

  userEmail: {
    marginTop: "4@vs",
    fontSize: FontSizes.sm,
    fontFamily: Fonts.regular,
  },

  card: {
    borderRadius: "24@s",
    padding: "24@s",
    marginBottom: "18@vs",
  },

  sectionTitle: {
    fontSize: FontSizes.xl,
    fontFamily: Fonts.semiBold,
    marginBottom: "20@vs",
  },

  infoBlock: {
    marginBottom: "10@vs",
  },

  label: {
    fontSize: FontSizes.sm,
    fontFamily: Fonts.medium,
    letterSpacing: 0.5,
  },

  value: {
    marginTop: "6@vs",
    fontSize: FontSizes.md,
    fontFamily: Fonts.regular,
  },

  divider: {
    height: 1,
    marginVertical: "14@vs",
  },

  editButton: {
    marginTop: "20@vs",
    height: "54@vs",
    borderRadius: "28@s",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },

  editButtonText: {
    color: "#FFFFFF",
    marginLeft: "8@s",
    fontSize: FontSizes.md,
    fontFamily: Fonts.semiBold,
  },

  securityItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: "10@vs",
  },

  securityText: {
    fontSize: FontSizes.md,
    fontFamily: Fonts.medium,
  },
});