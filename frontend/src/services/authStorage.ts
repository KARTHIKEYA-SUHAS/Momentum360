import * as SecureStore from "expo-secure-store";

const TOKEN_KEY = "momentum360_access_token";
const USER_KEY = "momentum360_user";

export type StoredUser = {
  id: string;
  email: string;
  organizationId: string;
  role: string;
};

export async function saveAuthData(accessToken: string, user: StoredUser) {
  await SecureStore.setItemAsync(TOKEN_KEY, accessToken);
  await SecureStore.setItemAsync(USER_KEY, JSON.stringify(user));
}

export async function getAccessToken() {
  return SecureStore.getItemAsync(TOKEN_KEY);
}

export async function getStoredUser(): Promise<StoredUser | null> {
  const user = await SecureStore.getItemAsync(USER_KEY);

  if (!user) {
    return null;
  }

  return JSON.parse(user) as StoredUser;
}

export async function clearAuthData() {
  await SecureStore.deleteItemAsync(TOKEN_KEY);
  await SecureStore.deleteItemAsync(USER_KEY);
}
