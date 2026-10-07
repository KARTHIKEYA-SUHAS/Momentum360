import { Ionicons } from "@expo/vector-icons";
import { Text, View } from "react-native";

import Button from "../components/Button";
import type { TeamWorkLocation } from "../services/workLocationService";

type TeamWorkLocationCardProps = {
  role: "ADMIN" | "HR" | "MANAGER" | "EMPLOYEE";
  workLocation?: TeamWorkLocation | null;
  loading?: boolean;
  onPress?: () => void;
};

export default function TeamWorkLocationCard({
  role,
  workLocation,
  loading = false,
  onPress,
}: TeamWorkLocationCardProps) {
  const canManage = role === "ADMIN" || role === "HR";

  const locationTitle = workLocation
    ? workLocation.workMode === "OFFICE"
      ? (workLocation.officeLocation?.name ?? "Office")
      : "Work From Home"
    : "No work location assigned";

  const locationAddress =
    workLocation?.workMode === "OFFICE"
      ? workLocation.officeLocation?.address
      : null;

  return (
    <View className="p-4 mb-5 bg-white border border-blue-100 shadow-sm rounded-2xl">
      {/* Header label */}
      <Text className="mb-3 text-xs font-semibold tracking-wider uppercase text-slate-400">
        Team Work Location
      </Text>

      {/* Icon + content */}
      <View className="flex-row items-center">
        <View className="items-center justify-center w-12 h-12 bg-blue-100 rounded-2xl">
          <Ionicons name="location" size={24} color="#2563EB" />
        </View>

        <View className="flex-1 ml-4">
          {canManage ? (
            <Text className="text-sm leading-5 text-slate-600">
              Manage the work location for your entire team.
            </Text>
          ) : loading ? (
            <Text className="text-sm leading-5 text-slate-400">
              Loading work location...
            </Text>
          ) : (
            <>
              <Text className="text-base font-semibold text-slate-900">
                {locationTitle}
              </Text>
              {locationAddress ? (
                <Text className="mt-0.5 text-sm leading-5 text-slate-500">
                  {locationAddress}
                </Text>
              ) : null}
            </>
          )}
        </View>
      </View>

      {/* Action */}
      {canManage && onPress ? (
        <>
          <View className="h-px my-4 bg-slate-100" />
          <Button title="Manage Location" onPress={onPress} />
        </>
      ) : null}
    </View>
  );
}
