import { useEffect, useState } from "react";
import { ActivityIndicator, ScrollView, Text, View } from "react-native";

import TeamWorkLocationCard from "../../components/TeamWorkLocationCard";
import { getEmployees, type Employee } from "../../services/employeeService";
import {
  getTeamWorkLocation,
  type TeamWorkLocation,
} from "../../services/workLocationService";
import { useAuth } from "../../store/AuthContext";

export default function DashboardScreen() {
  const { user } = useAuth();

  const [currentEmployee, setCurrentEmployee] = useState<Employee | null>(null);

  const [workLocation, setWorkLocation] = useState<TeamWorkLocation | null>(
    null,
  );

  const [loadingWorkLocation, setLoadingWorkLocation] = useState(false);

  useEffect(() => {
    const loadDashboardData = async () => {
      if (!user || (user.role !== "MANAGER" && user.role !== "EMPLOYEE")) {
        return;
      }

      try {
        setLoadingWorkLocation(true);

        const employees = await getEmployees();

        const employee = employees.find((item) => item.userId === user.id);

        if (!employee) {
          setCurrentEmployee(null);
          setWorkLocation(null);
          return;
        }

        setCurrentEmployee(employee);

        const managerId =
          user.role === "MANAGER" ? employee.id : employee.managerId;

        if (!managerId) {
          setWorkLocation(null);
          return;
        }

        const data = await getTeamWorkLocation(managerId);

        setWorkLocation(data);
      } catch (error: any) {
        if (error?.response?.status === 404) {
          setWorkLocation(null);
        } else {
          console.log("Dashboard work location error:", error);
        }
      } finally {
        setLoadingWorkLocation(false);
      }
    };

    loadDashboardData();
  }, [user]);

  return (
    <View className="flex-1 bg-slate-50">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 20 }}
      >
        <View>
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
        {(user?.role === "MANAGER" || user?.role === "EMPLOYEE") && (
          <View className="mt-5">
            {loadingWorkLocation ? (
              <View className="items-center justify-center p-6 bg-white border rounded-xl border-slate-200">
                <ActivityIndicator size="small" color="#2563EB" />
                <Text className="mt-3 text-sm text-slate-500">
                  Loading work location...
                </Text>
              </View>
            ) : (
              <TeamWorkLocationCard
                role={user.role}
                workLocation={workLocation}
                loading={loadingWorkLocation}
              />
            )}
          </View>
        )}
        <View className="p-5 bg-white border rounded-xl border-slate-200">
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
