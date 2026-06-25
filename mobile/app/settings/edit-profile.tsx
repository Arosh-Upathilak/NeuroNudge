import React, {
  useState,
  useEffect,
} from "react";

import {
  getProfile,
  saveProfile,
} from "../../utils/profileStorage";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { ScaledSheet } from "react-native-size-matters";

import { Fonts, FontSizes } from "../../constants/theme";
import { useTheme } from "../../hooks/useTheme";

export default function EditProfileScreen(): React.JSX.Element {
  const { colors }: { colors: ThemeColors } = useTheme();

  const [fullName, setFullName] =
  useState("");

const [email, setEmail] =
  useState("");

const [username, setUsername] =
  useState("");

  const handleSave = async (): Promise<void> => {
  await saveProfile({
    fullName,
    email,
    username,
  });

  router.back();
};

  useEffect(() => {
  const loadProfile = async (): Promise<void> => {
    const profile = await getProfile();

    if (profile) {
      setFullName(profile.fullName);
      setEmail(profile.email);
      setUsername(profile.username);
    }
  };

  loadProfile();
}, []);

  return (
    <SafeAreaView
      style={[
        styles.container,
        {
          backgroundColor:
            colors.background,
        },
      ]}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}

        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
          >
            <Ionicons
              name="arrow-back"
              size={24}
              color={colors.text}
            />
          </TouchableOpacity>

          <Text
            style={[
              styles.headerTitle,
              { color: colors.text },
            ]}
          >
            Edit Profile
          </Text>

          <View style={{ width: 24 }} />
        </View>

        {/* Avatar */}

        <View style={styles.avatarContainer}>
          <View
            style={[
              styles.avatar,
              {
                backgroundColor:
                  colors.primary,
              },
            ]}
          >
            <Ionicons
  name="person-outline"
  size={50}
  color={colors.surface}
/>
          </View>

          <TouchableOpacity
            style={[
              styles.editAvatarButton,
              {
                backgroundColor:
                  colors.primary,
              },
            ]}
          >
            <Ionicons
  name="camera-outline"
  size={18}
  color={colors.surface}
/>
          </TouchableOpacity>
        </View>

        {/* Form Card */}

        <View
          style={[
            styles.card,
            {
              backgroundColor:
                colors.card,
            },
          ]}
        >
          <Text
            style={[
              styles.label,
              { color: colors.text },
            ]}
          >
            Full Name
          </Text>

          <TextInput
            value={fullName}
            onChangeText={setFullName}
            style={[
              styles.input,
              {
                backgroundColor:
                  colors.surface,
                color: colors.text,
                borderColor:
                  colors.divider,
              },
            ]}
          />

          <Text
            style={[
              styles.label,
              { color: colors.text },
            ]}
          >
            Email
          </Text>

          <TextInput
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            style={[
              styles.input,
              {
                backgroundColor:
                  colors.surface,
                color: colors.text,
                borderColor:
                  colors.divider,
              },
            ]}
          />

          <Text
            style={[
              styles.label,
              { color: colors.text },
            ]}
          >
            Username
          </Text>

          <TextInput
            value={username}
            onChangeText={setUsername}
            style={[
              styles.input,
              {
                backgroundColor:
                  colors.surface,
                color: colors.text,
                borderColor:
                  colors.divider,
              },
            ]}
          />

          <TouchableOpacity
            style={[
              styles.saveButton,
              {
                backgroundColor:
                  colors.primary,
              },
            ]}
            onPress={handleSave}
          >
            <Text
  style={[
    styles.saveButtonText,
    { color: colors.surface },
  ]}
>
  Save Changes
</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = ScaledSheet.create({
  container: {
    flex: 1,
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: "20@s",
    paddingTop: "10@vs",
    marginBottom: "20@vs",
  },

  headerTitle: {
    fontSize: FontSizes.xl,
    fontFamily: Fonts.semiBold,
  },

  avatarContainer: {
  width: "110@s",
  height: "110@s",
  alignSelf: "center",
  position: "relative",
  marginBottom: "30@vs",
},

  avatar: {
    width: "110@s",
    height: "110@s",
    borderRadius: "55@s",
    justifyContent: "center",
    alignItems: "center",
  },

  editAvatarButton: {
  position: "absolute",
  bottom: 0,
  right: 0,
  width: "34@s",
  height: "34@s",
  borderRadius: "17@s",
  justifyContent: "center",
  alignItems: "center",
},

  card: {
    marginHorizontal: "20@s",
    borderRadius: "24@s",
    padding: "20@s",
    marginBottom: "40@vs",
  },

  label: {
    fontSize: FontSizes.md,
    fontFamily: Fonts.medium,
    marginBottom: "8@vs",
    marginTop: "12@vs",
  },

  input: {
    borderWidth: 1,
    borderRadius: "14@s",
    paddingHorizontal: "14@s",
    height: "52@vs",
    fontFamily: Fonts.regular,
    fontSize: FontSizes.md,
  },

  saveButton: {
    marginTop: "28@vs",
    height: "54@vs",
    borderRadius: "27@s",
    justifyContent: "center",
    alignItems: "center",
  },

  saveButtonText: {
    fontSize: FontSizes.lg,
    fontFamily: Fonts.semiBold,
  },
});
