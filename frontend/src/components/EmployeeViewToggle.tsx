import { Pressable, Text, View } from "react-native";

type EmployeeView = "all" | "team";

type EmployeeViewToggleProps = {
  value: EmployeeView;
  onChange: (value: EmployeeView) => void;
  secondLabel: string;
};

export default function EmployeeViewToggle({
  value,
  onChange,
  secondLabel,
}: EmployeeViewToggleProps) {
  return (
    <View className="flex-row p-1 mb-5 bg-slate-200 rounded-3xl">
      <Pressable
        onPress={() => onChange("all")}
        className={`flex-1 items-center justify-center h-10 rounded-3xl ${
          value === "all" ? "bg-blue-600" : ""
        }`}
      >
        <Text
          className={`text-sm font-semibold ${
            value === "all" ? "text-white" : "text-slate-500"
          }`}
        >
          All Employees
        </Text>
      </Pressable>

      <Pressable
        onPress={() => onChange("team")}
        className={`flex-1 items-center justify-center h-10 rounded-3xl ${
          value === "team" ? "bg-blue-600" : ""
        }`}
      >
        <Text
          className={`text-sm font-semibold ${
            value === "team" ? "text-white" : "text-slate-500"
          }`}
        >
          {secondLabel}
        </Text>
      </Pressable>
    </View>
  );
}
