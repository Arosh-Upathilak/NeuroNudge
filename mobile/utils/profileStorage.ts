import * as SecureStore from "expo-secure-store";

const PROFILE_KEY = "user_profile";

export interface UserProfile {
  fullName: string;
  email: string;
  username: string;
}

export const saveProfile = async (
  profile: UserProfile
): Promise<void> => {
  await SecureStore.setItemAsync(
    PROFILE_KEY,
    JSON.stringify(profile)
  );
};

export const getProfile = async (): Promise<UserProfile | null> => {
  const data = await SecureStore.getItemAsync(
    PROFILE_KEY
  );

  if (!data) {
    return null;
  }

  return JSON.parse(data);
};
