import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Text, View } from "react-native";

import type { MainTabParamList } from "./types";

import DashboardScreen from "../screens/dashboard/DashboardScreen";
import AttendanceScreen from "../screens/attendance/AttendanceScreen";
import ProfileScreen from "../screens/profile/ProfileScreen";

const Tab = createBottomTabNavigator<MainTabParamList>();

function ScreenHeader({
  title,
  subtitle,
}: {
  title: string;
  subtitle: string;
}) {
  return (
    <View className="bg-white px-5 pb-4 pt-16">
      <Text className="text-2xl font-bold text-slate-900">{title}</Text>

      <Text className="mt-1 text-sm text-slate-500">{subtitle}</Text>
    </View>
  );
}

function PlaceholderScreen({ title }: { title: string }) {
  return (
    <View className="flex-1 items-center justify-center bg-slate-50">
      <Text className="text-2xl font-bold text-slate-900">{title}</Text>
    </View>
  );
}

export default function MainNavigator() {
  return (
    <Tab.Navigator>
      {/* Dashboard */}
      <Tab.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{
          header: () => (
            <ScreenHeader
              title="Dashboard"
              subtitle="Here's your work overview for today."
            />
          ),
        }}
      />

      {/* Employees */}
      <Tab.Screen
        name="Employees"
        options={{
          header: () => (
            <ScreenHeader
              title="Employees"
              subtitle="Manage your organization's employees."
            />
          ),
        }}
      >
        {() => <PlaceholderScreen title="Employees" />}
      </Tab.Screen>

      {/* Attendance */}
      <Tab.Screen
        name="Attendance"
        component={AttendanceScreen}
        options={{
          header: () => (
            <ScreenHeader
              title="Attendance"
              subtitle="Track your attendance for today."
            />
          ),
        }}
      />

      {/* Leave */}
      <Tab.Screen
        name="Leave"
        options={{
          header: () => (
            <ScreenHeader
              title="Leave"
              subtitle="Manage your leave requests."
            />
          ),
        }}
      >
        {() => <PlaceholderScreen title="Leave" />}
      </Tab.Screen>

      {/* Profile */}
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          header: () => (
            <ScreenHeader
              title="Profile"
              subtitle="Manage your account and preferences."
            />
          ),
        }}
      />
    </Tab.Navigator>
  );
}
