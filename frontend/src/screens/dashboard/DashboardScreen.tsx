import { ScrollView, Text, View } from "react-native";

import { useAuth } from "../../store/AuthContext";

export default function DashboardScreen() {
  const { user } = useAuth();

  return (
    <View className="flex-1 bg-slate-50">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 20 }}
      >
        <View className="mb-6">
          <Text className="text-sm font-medium text-slate-500">
            Welcome back
          </Text>

          <Text className="mt-1 text-2xl font-bold text-slate-900">
            {user?.email ?? "User"}
          </Text>

          <Text className="mt-1 text-sm text-slate-500">
            Here's your work overview for today.
          </Text>
        </View>

        <View className="rounded-xl border border-slate-200 bg-white p-5">
          <Text className="text-lg font-semibold text-slate-900">
            Today's Overview
          </Text>

          <Text className="mt-2 text-sm text-slate-500">
            Dashboard data will be connected to the backend next.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}
