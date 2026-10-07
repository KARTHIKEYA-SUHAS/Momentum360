import { Ionicons } from "@expo/vector-icons";
import { Pressable, Text, View } from "react-native";
import type { Employee } from "../services/employeeService";

type TeamCardProps = {
  manager: Employee;
  members: Employee[];
  onPress: () => void;
};

export default function TeamCard({ manager, members, onPress }: TeamCardProps) {
  return (
    <Pressable
      onPress={onPress}
      className="p-4 mb-4 bg-white border rounded-xl border-slate-200"
    >
      {/* Manager */}
      <View className="flex-row items-center">
        {/* Avatar */}
        <View className="items-center justify-center w-12 h-12 bg-purple-100 rounded-full">
          <Text className="text-lg font-bold text-purple-600">
            {manager.firstName.charAt(0)}
            {manager.lastName.charAt(0)}
          </Text>
        </View>

        {/* Manager Information */}
        <View className="flex-1 ml-3">
          <Text className="text-xs font-semibold text-purple-600">Manager</Text>

          <Text className="mt-1 text-base font-semibold text-slate-900">
            {manager.firstName} {manager.lastName}
          </Text>

          <Text className="mt-1 text-sm text-slate-500">
            {manager.designation ?? "Manager"}
          </Text>

          <Text className="mt-1 text-xs text-slate-400">
            Department:{" "}
            <Text className="text-slate-500">
              {manager.department?.name ?? "Not assigned"}
            </Text>
          </Text>
        </View>

        {/* Member Count */}
        <View className="ml-3">
          <View className="px-3 py-1 bg-purple-100 rounded-full">
            <Text className="text-xs font-semibold text-purple-700">
              {members.length} {members.length === 1 ? "Member" : "Members"}
            </Text>
          </View>
        </View>
      </View>

      {/* Action */}
      <View className="flex-row items-center pt-3 mt-4 border-t border-slate-100">
        <Text className="flex-1 text-sm font-medium text-blue-600">
          View Team Details
        </Text>

        <Ionicons name="arrow-forward" size={16} color="#2563EB" />
      </View>
    </Pressable>
  );
}
