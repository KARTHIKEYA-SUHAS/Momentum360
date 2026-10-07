import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { useAuth } from "../../store/AuthContext";
import { getEmployees, type Employee } from "../../services/employeeService";
import { Ionicons } from "@expo/vector-icons";

import EmployeeCard from "../../components/EmployeeCard";
import EmployeeViewToggle from "../../components/EmployeeViewToggle";
import ManagerCard from "../../components/ManagerCard";
import TeamWorkLocationCard from "../../components/TeamWorkLocationCard";
import Button from "../../components/Button";
import TeamCard from "../../components/TeamCard";

import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { EmployeesStackParamList } from "../../navigations/EmployeesNavigator";
import { useNavigation } from "@react-navigation/native";

export default function EmployeesScreen() {
  const { user } = useAuth();
  const secondViewLabel =
    user?.role === "ADMIN" || user?.role === "HR" ? "All Teams" : "My Team";
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [employeeView, setEmployeeView] = useState<"all" | "team">("all");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const navigation =
    useNavigation<NativeStackNavigationProp<EmployeesStackParamList>>();

  const loadEmployees = async () => {
    try {
      setLoading(true);
      setErrorMessage(null);

      const data = await getEmployees();

      setEmployees(data);
    } catch (error: any) {
      console.log("Employees error:", error);

      if (error?.response?.data?.message) {
        setErrorMessage(error.response.data.message);
      } else if (error?.message) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage("Unable to load employees. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      setErrorMessage(null);

      const data = await getEmployees();
      setEmployees(data);
    } catch (error: any) {
      console.log("Employees refresh error:", error);

      if (error?.response?.data?.message) {
        setErrorMessage(error.response.data.message);
      } else {
        setErrorMessage("Unable to refresh employees. Please try again.");
      }
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadEmployees();
  }, []);

  const currentEmployee = useMemo(() => {
    if (!user) {
      return null;
    }

    return employees.find((employee) => employee.userId === user.id) ?? null;
  }, [employees, user]);

  const showTeamToggle = true;

  const teamEmployees = useMemo(() => {
    if (!currentEmployee) {
      return [];
    }

    if (user?.role === "MANAGER") {
      return employees.filter(
        (employee) =>
          employee.managerId === currentEmployee.id &&
          employee.id !== currentEmployee.id,
      );
    }

    if (user?.role === "EMPLOYEE") {
      if (!currentEmployee.managerId) {
        return [];
      }

      return employees.filter(
        (employee) =>
          employee.managerId === currentEmployee.managerId &&
          employee.id !== currentEmployee.id,
      );
    }

    return [];
  }, [employees, currentEmployee, user?.role]);

  const teamManager = useMemo(() => {
    if (user?.role !== "EMPLOYEE" || !currentEmployee?.managerId) {
      return null;
    }

    return (
      employees.find((employee) => employee.id === currentEmployee.managerId) ??
      null
    );
  }, [employees, currentEmployee, user?.role]);

  const teams = useMemo(() => {
    if (user?.role !== "ADMIN" && user?.role !== "HR") {
      return [];
    }

    const managers = employees.filter(
      (employee) =>
        employee.id !== currentEmployee?.id &&
        employee.user?.role === "MANAGER" &&
        employee.isActive,
    );

    return managers.map((manager) => ({
      manager,
      members: employees.filter(
        (employee) =>
          employee.managerId === manager.id &&
          employee.isActive &&
          employee.id !== manager.id,
      ),
    }));
  }, [employees, currentEmployee, user?.role]);

  const filteredEmployees = useMemo(() => {
    const sourceEmployees =
      showTeamToggle && employeeView === "team"
        ? teamEmployees
        : employees.filter((employee) => employee.id !== currentEmployee?.id);

    const query = search.trim().toLowerCase();

    if (!query) {
      return sourceEmployees;
    }

    return sourceEmployees.filter((employee) => {
      const fullName =
        `${employee.firstName} ${employee.lastName}`.toLowerCase();
      const employeeCode = employee.employeeCode.toLowerCase();
      const designation = employee.designation?.toLowerCase() ?? "";

      return (
        fullName.includes(query) ||
        employeeCode.includes(query) ||
        designation.includes(query)
      );
    });
  }, [employees, search, employeeView, showTeamToggle, teamEmployees]);

  if (loading) {
    return (
      <View className="items-center justify-center flex-1 bg-slate-50">
        <ActivityIndicator size="large" color="#2563EB" />

        <Text className="mt-3 text-sm text-slate-500">
          Loading employees...
        </Text>
      </View>
    );
  }

  if (errorMessage) {
    return (
      <View className="items-center justify-center flex-1 px-6 bg-slate-50">
        <View className="w-full p-5 border border-red-200 rounded-xl bg-red-50">
          <Text className="text-lg font-semibold text-red-700">
            Unable to Load Employees
          </Text>

          <Text className="mt-2 text-sm text-red-600">{errorMessage}</Text>

          <Pressable
            onPress={loadEmployees}
            className="items-center justify-center mt-5 bg-blue-600 h-11 rounded-xl"
          >
            <Text className="text-sm font-semibold text-white">Try Again</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-slate-50">
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor="#2563EB"
          />
        }
        contentContainerStyle={{
          padding: 20,
          paddingBottom: 32,
        }}
      >
        {/* Search */}
        <View className="mb-5">
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Search employees..."
            placeholderTextColor="#94A3B8"
            className="h-12 px-4 text-base bg-white border rounded-xl border-slate-200 text-slate-900"
          />
        </View>

        {showTeamToggle ? (
          <EmployeeViewToggle
            value={employeeView}
            onChange={setEmployeeView}
            secondLabel={secondViewLabel}
          />
        ) : null}

        {/* Empty State */}
        {user?.role === "EMPLOYEE" && employeeView === "team" && teamManager ? (
          <ManagerCard manager={teamManager} />
        ) : null}
        {showTeamToggle &&
        (user?.role === "ADMIN" || user?.role === "HR") &&
        employeeView === "team" ? (
          teams.length === 0 ? (
            <View className="p-6 bg-white border rounded-xl border-slate-200">
              <Text className="text-lg font-semibold text-center text-slate-900">
                No Teams Found
              </Text>

              <Text className="mt-2 text-sm text-center text-slate-500">
                There are no active teams to display.
              </Text>
            </View>
          ) : (
            teams.map((team) => (
              <TeamCard
                key={team.manager.id}
                manager={team.manager}
                members={team.members}
                onPress={() =>
                  navigation.navigate("TeamDetails", {
                    managerId: team.manager.id,
                  })
                }
              />
            ))
          )
        ) : filteredEmployees.length === 0 ? (
          <View className="p-6 bg-white border rounded-xl border-slate-200">
            <Text className="text-lg font-semibold text-center text-slate-900">
              No Employees Found
            </Text>

            <Text className="mt-2 text-sm text-center text-slate-500">
              {search
                ? "Try a different search term."
                : "There are no employees to display."}
            </Text>
          </View>
        ) : (
          filteredEmployees.map((employee) => (
            <EmployeeCard key={employee.id} employee={employee} />
          ))
        )}
      </ScrollView>
      {user?.role === "ADMIN" || user?.role === "HR" ? (
        <View className="px-5 py-3">
          <Button
            title="Add Employee"
            onPress={() => navigation.navigate("AddEmployee")}
            icon={
              <Ionicons
                name="add"
                size={16}
                color="#FFFFFF"
                style={{ marginRight: 6 }}
              />
            }
          />
        </View>
      ) : null}
    </View>
  );
}
