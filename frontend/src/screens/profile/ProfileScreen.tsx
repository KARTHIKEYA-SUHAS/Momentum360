import { useState } from "react";
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { useAuth } from "../../store/AuthContext";

type ProfileRowProps = {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  onPress: () => void;
};

function ProfileRow({ icon, title, onPress }: ProfileRowProps) {
  return (
    <Pressable onPress={onPress} className="flex-row items-center px-4 py-4">
      <View className="mr-4 h-10 w-10 items-center justify-center rounded-xl bg-slate-50">
        <Ionicons name={icon} size={19} color="#475569" />
      </View>

      <Text className="flex-1 text-[15px] font-medium text-slate-800">
        {title}
      </Text>

      <Ionicons name="chevron-forward" size={18} color="#94A3B8" />
    </Pressable>
  );
}

export default function ProfileScreen() {
  const { user, logout } = useAuth();

  const [logoutModalVisible, setLogoutModalVisible] = useState(false);

  const [loggingOut, setLoggingOut] = useState(false);

  const displayName = user?.email?.split("@")[0] || "User";

  const formattedName = displayName
    .replace(/[._-]/g, " ")
    .replace(/\b\w/g, (character) => character.toUpperCase());

  const formattedRole = user?.role
    ? user.role.charAt(0) + user.role.slice(1).toLowerCase()
    : "User";

  const handleLogout = async () => {
    try {
      setLoggingOut(true);

      await logout();

      setLogoutModalVisible(false);
    } catch (error) {
      console.log("Logout error:", error);
      setLoggingOut(false);
    }
  };

  return (
    <View className="flex-1 bg-slate-50">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          padding: 20,
          paddingBottom: 32,
        }}
      >
        {/* Header */}

        {/* Profile Identity */}

        <View className="mb-7 items-center">
          <View className="h-24 w-24 items-center justify-center rounded-full bg-blue-50">
            <View className="h-[84px] w-[84px] items-center justify-center rounded-full bg-blue-600">
              <Text className="text-3xl font-bold text-white">
                {formattedName.charAt(0).toUpperCase()}
              </Text>
            </View>
          </View>

          <Text className="mt-4 text-xl font-bold text-slate-900">
            {formattedName}
          </Text>

          <View className="mt-2 flex-row items-center">
            {user?.id ? (
              <>
                <Text className="text-sm font-medium text-slate-500">
                  {user.id}
                </Text>

                <View className="mx-2 h-1 w-1 rounded-full bg-slate-300" />
              </>
            ) : null}

            <Text className="text-sm font-medium text-slate-500">
              {formattedRole}
            </Text>
          </View>
        </View>

        {/* Profile Options */}

        <View className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
          <ProfileRow
            icon="person-outline"
            title="Personal Information"
            onPress={() => {}}
          />

          <View className="ml-[68px] h-px bg-slate-100" />

          <ProfileRow
            icon="briefcase-outline"
            title="Employment Information"
            onPress={() => {}}
          />

          <View className="ml-[68px] h-px bg-slate-100" />

          <ProfileRow
            icon="document-text-outline"
            title="Account Information"
            onPress={() => {}}
          />

          <View className="ml-[68px] h-px bg-slate-100" />

          <ProfileRow
            icon="lock-closed-outline"
            title="Change Password"
            onPress={() => {}}
          />
        </View>

        {/* Logout */}

        <Pressable
          onPress={() => setLogoutModalVisible(true)}
          className="mt-5 flex-row items-center rounded-2xl border border-red-100 bg-white px-4 py-4"
        >
          <View className="mr-4 h-10 w-10 items-center justify-center rounded-xl bg-red-50">
            <Ionicons name="log-out-outline" size={20} color="#EF4444" />
          </View>

          <Text className="flex-1 text-[15px] font-semibold text-red-500">
            Logout
          </Text>

          <Ionicons name="chevron-forward" size={18} color="#FCA5A5" />
        </Pressable>
      </ScrollView>

      {/* Logout Confirmation Modal */}

      <Modal
        visible={logoutModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => {
          if (!loggingOut) {
            setLogoutModalVisible(false);
          }
        }}
      >
        <View className="flex-1 items-center justify-center bg-black/40 px-6">
          <View className="w-full max-w-[380px] rounded-3xl bg-white p-6">
            {/* Icon */}

            <View className="items-center">
              <View className="h-16 w-16 items-center justify-center rounded-full bg-red-50">
                <View className="h-12 w-12 items-center justify-center rounded-full bg-red-100">
                  <Ionicons name="log-out-outline" size={25} color="#EF4444" />
                </View>
              </View>
            </View>

            {/* Title */}

            <Text className="mt-5 text-center text-xl font-bold text-slate-900">
              Logout?
            </Text>

            <Text className="mt-2 text-center text-sm leading-5 text-slate-500">
              Are you sure you want to logout?
            </Text>

            {/* Actions */}

            <View className="mt-6 flex-row gap-3">
              <Pressable
                onPress={() => setLogoutModalVisible(false)}
                disabled={loggingOut}
                className="h-12 flex-1 items-center justify-center rounded-xl border border-slate-200 bg-white"
              >
                <Text className="text-sm font-semibold text-slate-700">
                  Cancel
                </Text>
              </Pressable>

              <Pressable
                onPress={handleLogout}
                disabled={loggingOut}
                className="h-12 flex-1 items-center justify-center rounded-xl bg-red-500"
              >
                {loggingOut ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text className="text-sm font-semibold text-white">
                    Logout
                  </Text>
                )}
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}
