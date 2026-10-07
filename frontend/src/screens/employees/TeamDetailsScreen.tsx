import { useAuth } from "../../store/AuthContext";
import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";

import type { NativeStackScreenProps } from "@react-navigation/native-stack";

import type { EmployeesStackParamList } from "../../navigations/EmployeesNavigator";
import { getEmployees, type Employee } from "../../services/employeeService";
import {
  createTeamWorkLocation,
  getOfficeLocations,
  getTeamWorkLocation,
  updateTeamWorkLocation,
  type OfficeLocation,
  type TeamWorkLocation,
} from "../../services/workLocationService";

type Props = NativeStackScreenProps<EmployeesStackParamList, "TeamDetails">;

export default function TeamDetailsScreen({ route }: Props) {
  const { managerId } = route.params;
  const { user } = useAuth();
  const [officeLocations, setOfficeLocations] = useState<OfficeLocation[]>([]);
  const [showLocationOptions, setShowLocationOptions] = useState(false);
  const [savingLocation, setSavingLocation] = useState(false);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [workLocation, setWorkLocation] = useState<TeamWorkLocation | null>(
    null,
  );
  const [selectedWorkMode, setSelectedWorkMode] = useState<"OFFICE" | "WFH">(
    "OFFICE",
  );
  const [selectedOfficeId, setSelectedOfficeId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loadEmployees = async () => {
    try {
      setLoading(true);
      setErrorMessage(null);

      const data = await getEmployees();
      setEmployees(data);
    } catch (error: any) {
      console.log("Team details error:", error);

      if (error?.response?.data?.message) {
        setErrorMessage(error.response.data.message);
      } else if (error?.message) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage("Unable to load team details. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const loadWorkLocation = async () => {
    try {
      const data = await getTeamWorkLocation(managerId);
      setSelectedWorkMode(data.workMode);
      setSelectedOfficeId(data.officeLocationId);
      setWorkLocation(data);
    } catch (error: any) {
      // A team may not have a work location assigned yet.
      if (error?.response?.status === 404) {
        setWorkLocation(null);
        setSelectedWorkMode("OFFICE");
        setSelectedOfficeId(null);
        return;
      }

      console.log("Work location error:", error);
    }
  };

  const loadOfficeLocations = async () => {
    if (user?.role !== "ADMIN" && user?.role !== "HR") {
      return;
    }

    try {
      const data = await getOfficeLocations();
      setOfficeLocations(data);
    } catch (error) {
      console.log("Office locations error:", error);
    }
  };

  const handleSaveWorkLocation = async () => {
    if (selectedWorkMode === "OFFICE" && !selectedOfficeId) {
      return;
    }

    try {
      setSavingLocation(true);

      const payload =
        selectedWorkMode === "OFFICE"
          ? {
              workMode: "OFFICE" as const,
              officeLocationId: selectedOfficeId!,
            }
          : {
              workMode: "WFH" as const,
            };

      const data = workLocation
        ? await updateTeamWorkLocation(managerId, payload)
        : await createTeamWorkLocation(managerId, payload);

      setWorkLocation(data);
      setSelectedWorkMode(data.workMode);
      setSelectedOfficeId(data.officeLocationId);
      setShowLocationOptions(false);
    } catch (error: any) {
      console.log("Save work location error:", error);
    } finally {
      setSavingLocation(false);
    }
  };

  useEffect(() => {
    loadEmployees();
    loadWorkLocation();
    loadOfficeLocations();
  }, []);

  const manager = useMemo(() => {
    return employees.find((employee) => employee.id === managerId) ?? null;
  }, [employees, managerId]);

  const teamMembers = useMemo(() => {
    return employees.filter(
      (employee) =>
        employee.managerId === managerId &&
        employee.isActive &&
        employee.id !== managerId,
    );
  }, [employees, managerId]);

  if (loading) {
    return (
      <View className="items-center justify-center flex-1 bg-slate-50">
        <ActivityIndicator size="large" color="#2563EB" />

        <Text className="mt-3 text-sm text-slate-500">
          Loading team details...
        </Text>
      </View>
    );
  }

  if (errorMessage) {
    return (
      <View className="items-center justify-center flex-1 px-6 bg-slate-50">
        <View className="w-full p-5 border border-red-200 bg-red-50 rounded-xl">
          <Text className="text-lg font-semibold text-red-700">
            Unable to Load Team
          </Text>

          <Text className="mt-2 text-sm text-red-600">{errorMessage}</Text>
        </View>
      </View>
    );
  }

  if (!manager) {
    return (
      <View className="items-center justify-center flex-1 px-6 bg-slate-50">
        <View className="w-full p-5 bg-white border rounded-xl border-slate-200">
          <Text className="text-lg font-semibold text-center text-slate-900">
            Team Not Found
          </Text>

          <Text className="mt-2 text-sm text-center text-slate-500">
            The selected team could not be found.
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-slate-50">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          padding: 20,
          paddingBottom: 32,
        }}
      >
        {/* Manager */}
        <View className="p-5 mb-5 bg-white border rounded-2xl border-slate-200">
          <Text className="text-xs font-semibold text-purple-600">MANAGER</Text>

          <Text className="mt-2 text-xl font-bold text-slate-900">
            {manager.firstName} {manager.lastName}
          </Text>

          <Text className="mt-1 text-sm text-slate-500">
            {manager.designation ?? "Manager"}
          </Text>

          <Text className="mt-2 text-xs text-slate-400">
            Department:{" "}
            <Text className="text-slate-500">
              {manager.department?.name ?? "Not assigned"}
            </Text>
          </Text>
        </View>

        {/* Team Members */}
        <View className="p-5 mb-5 bg-white border rounded-2xl border-slate-200">
          <View className="flex-row items-center justify-between">
            <Text className="text-base font-semibold text-slate-900">
              Team Members
            </Text>

            <Text className="text-xs font-semibold text-purple-600">
              {teamMembers.length}{" "}
              {teamMembers.length === 1 ? "Member" : "Members"}
            </Text>
          </View>

          {teamMembers.length === 0 ? (
            <Text className="mt-4 text-sm text-slate-500">
              No employees are currently assigned to this team.
            </Text>
          ) : (
            <View className="mt-4">
              {teamMembers.map((member) => (
                <View
                  key={member.id}
                  className="flex-row items-center py-3 border-t border-slate-100"
                >
                  <View className="items-center justify-center w-10 h-10 rounded-full bg-blue-50">
                    <Text className="text-sm font-semibold text-blue-600">
                      {member.firstName.charAt(0)}
                      {member.lastName.charAt(0)}
                    </Text>
                  </View>

                  <View className="flex-1 ml-3">
                    <Text className="text-sm font-semibold text-slate-800">
                      {member.firstName} {member.lastName}
                    </Text>

                    <Text className="mt-1 text-xs text-slate-500">
                      {member.designation ?? "Employee"}
                    </Text>
                  </View>

                  <Text className="text-xs text-slate-400">
                    {member.employeeCode}
                  </Text>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Work Location */}
        <View className="p-5 bg-white border rounded-2xl border-slate-200">
          <Text className="text-base font-semibold text-slate-900">
            Work Location
          </Text>

          {workLocation ? (
            <View className="mt-3">
              <Text className="text-sm font-semibold text-slate-800">
                {workLocation.workMode === "OFFICE"
                  ? (workLocation.officeLocation?.name ?? "Office")
                  : "Work From Home"}
              </Text>

              {workLocation.workMode === "OFFICE" &&
              workLocation.officeLocation?.address ? (
                <Text className="mt-1 text-sm text-slate-500">
                  {workLocation.officeLocation.address}
                </Text>
              ) : null}
            </View>
          ) : (
            <Text className="mt-2 text-sm text-slate-500">
              No work location assigned.
            </Text>
          )}

          {/* Change / Assign Work Location */}
          {user?.role === "ADMIN" || user?.role === "HR" ? (
            !showLocationOptions ? (
              <Pressable
                onPress={() => setShowLocationOptions(true)}
                className="flex-row items-center justify-center mt-4 border border-blue-200 h-11 rounded-xl bg-blue-50"
              >
                <Text className="text-sm font-semibold text-blue-600">
                  {workLocation
                    ? "Change Work Location"
                    : "Assign Work Location"}
                </Text>
              </Pressable>
            ) : null
          ) : null}
          {showLocationOptions ? (
            <View className="pt-4 mt-4 border-t border-slate-100">
              <Text className="text-sm font-semibold text-slate-800">
                Work Mode
              </Text>

              <View className="flex-row mt-3">
                <Pressable
                  onPress={() => setSelectedWorkMode("OFFICE")}
                  className={`flex-1 items-center justify-center h-11 mr-2 border rounded-xl ${
                    selectedWorkMode === "OFFICE"
                      ? "bg-blue-50 border-blue-500"
                      : "bg-white border-slate-200"
                  }`}
                >
                  <Text
                    className={`text-sm font-semibold ${
                      selectedWorkMode === "OFFICE"
                        ? "text-blue-600"
                        : "text-slate-500"
                    }`}
                  >
                    Office
                  </Text>
                </Pressable>

                <Pressable
                  onPress={() => {
                    setSelectedWorkMode("WFH");
                    setSelectedOfficeId(null);
                  }}
                  className={`flex-1 items-center justify-center h-11 ml-2 border rounded-xl ${
                    selectedWorkMode === "WFH"
                      ? "bg-blue-50 border-blue-500"
                      : "bg-white border-slate-200"
                  }`}
                >
                  <Text
                    className={`text-sm font-semibold ${
                      selectedWorkMode === "WFH"
                        ? "text-blue-600"
                        : "text-slate-500"
                    }`}
                  >
                    Work From Home
                  </Text>
                </Pressable>
              </View>

              {selectedWorkMode === "OFFICE" ? (
                <View className="mt-5">
                  <Text className="text-sm font-semibold text-slate-800">
                    Office Location
                  </Text>

                  {officeLocations.length === 0 ? (
                    <Text className="mt-3 text-sm text-slate-500">
                      No active office locations are available.
                    </Text>
                  ) : (
                    officeLocations.map((office) => (
                      <Pressable
                        key={office.id}
                        onPress={() => setSelectedOfficeId(office.id)}
                        className={`p-4 mt-3 border rounded-xl ${
                          selectedOfficeId === office.id
                            ? "bg-blue-50 border-blue-500"
                            : "bg-white border-slate-200"
                        }`}
                      >
                        <Text
                          className={`text-sm font-semibold ${
                            selectedOfficeId === office.id
                              ? "text-blue-600"
                              : "text-slate-800"
                          }`}
                        >
                          {office.name}
                        </Text>

                        {office.address ? (
                          <Text className="mt-1 text-xs text-slate-500">
                            {office.address}
                          </Text>
                        ) : null}
                      </Pressable>
                    ))
                  )}
                </View>
              ) : null}
              <View className="flex-row items-center mt-5">
                <Pressable
                  onPress={() => setShowLocationOptions(false)}
                  disabled={savingLocation}
                  className="items-center justify-center mr-3 border border-red-200 bg-red-50 rounded-xl w-11 h-11"
                >
                  <Ionicons name="close" size={20} color="#DC2626" />
                </Pressable>

                <Pressable
                  onPress={handleSaveWorkLocation}
                  disabled={
                    savingLocation ||
                    (selectedWorkMode === "OFFICE" && !selectedOfficeId)
                  }
                  className={`flex-1 items-center justify-center h-11 rounded-xl ${
                    savingLocation ||
                    (selectedWorkMode === "OFFICE" && !selectedOfficeId)
                      ? "bg-blue-300"
                      : "bg-blue-600"
                  }`}
                >
                  <Text className="text-sm font-semibold text-white">
                    {savingLocation
                      ? "Saving..."
                      : workLocation
                        ? "Update Work Location"
                        : "Save Work Location"}
                  </Text>
                </Pressable>
              </View>
            </View>
          ) : null}
        </View>
      </ScrollView>
    </View>
  );
}
