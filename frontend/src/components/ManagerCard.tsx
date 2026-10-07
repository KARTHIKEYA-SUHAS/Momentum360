import { Text, View } from "react-native";

import type { Employee } from "../../src/services/employeeService";

type ManagerCardProps = {
  manager: Employee;
};

export default function ManagerCard({ manager }: ManagerCardProps) {
  return (
    <View className="p-4 mb-4 bg-white border rounded-xl border-slate-200">
      <View className="flex-row items-center">
        {/* Avatar */}
        <View className="items-center justify-center w-12 h-12 bg-purple-100 rounded-full">
          <Text className="text-lg font-bold text-purple-600">
            {manager.firstName.charAt(0)}
            {manager.lastName.charAt(0)}
          </Text>
        </View>

        {/* Manager Info */}
        <View className="flex-1 ml-3">
          <Text className="text-xs font-medium text-purple-600">Manager</Text>

          <Text className="mt-1 text-base font-semibold text-slate-900">
            {manager.firstName} {manager.lastName}
          </Text>

          <Text className="mt-1 text-sm text-slate-500">
            {manager.designation ?? "Manager"}
          </Text>
        </View>
      </View>

      {/* Department */}
      <View className="pt-3 mt-4 border-t border-slate-100">
        <Text className="text-xs font-medium text-slate-400">Department</Text>

        <Text className="mt-1 text-sm text-slate-700">
          {manager.department?.name ?? "Not assigned"}
        </Text>
      </View>
    </View>
  );
}
