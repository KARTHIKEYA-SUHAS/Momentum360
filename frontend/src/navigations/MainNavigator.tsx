import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Text, View } from "react-native";

import type { MainTabParamList } from "./types";
import ScreenHeader from "../components/ScreenHeader";

import DashboardScreen from "../screens/dashboard/DashboardScreen";
import EmployeesNavigator from "./EmployeesNavigator";
import AttendanceScreen from "../screens/attendance/AttendanceScreen";
import ProfileScreen from "../screens/profile/ProfileScreen";

const Tab = createBottomTabNavigator<MainTabParamList>();

function PlaceholderScreen({ title }: { title: string }) {
  return (
    <View className="items-center justify-center flex-1 bg-slate-50">
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
        component={EmployeesNavigator}
        options={{
          headerShown: false,
        }}
      />

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
