import { Text, View } from "react-native";

import type { Employee } from "../../src/services/employeeService";

type EmployeeCardProps = {
  employee: Employee;
};

export default function EmployeeCard({ employee }: EmployeeCardProps) {
  const fullName = `${employee.firstName} ${employee.lastName}`;

  return (
    <View className="p-4 mb-3 bg-white border rounded-xl border-slate-200">
      <View className="flex-row items-center">
        {/* Avatar */}
        <View className="items-center justify-center w-12 h-12 bg-blue-100 rounded-full">
          <Text className="text-lg font-bold text-blue-600">
            {employee.firstName.charAt(0)}
            {employee.lastName.charAt(0)}
          </Text>
        </View>

        {/* Employee Info */}
        <View className="flex-1 ml-3">
          <Text className="text-base font-semibold text-slate-900">
            {fullName}
          </Text>

          <Text className="mt-1 text-sm text-slate-500">
            {employee.employeeCode}
          </Text>

          {employee.designation ? (
            <Text className="mt-1 text-sm text-slate-500">
              {employee.designation}
            </Text>
          ) : null}
        </View>

        {/* Status */}
        <View
          className={`rounded-full px-3 py-1 ${
            employee.isActive ? "bg-emerald-100" : "bg-slate-100"
          }`}
        >
          <Text
            className={`text-xs font-semibold ${
              employee.isActive ? "text-emerald-700" : "text-slate-600"
            }`}
          >
            {employee.isActive ? "Active" : "Inactive"}
          </Text>
        </View>
      </View>

      {/* Department */}
      <View className="pt-3 mt-4 border-t border-slate-100">
        <Text className="text-xs font-medium text-slate-400">Department</Text>

        <Text className="mt-1 text-sm text-slate-700">
          {employee.department?.name ?? "Not assigned"}
        </Text>
      </View>
    </View>
  );
}
