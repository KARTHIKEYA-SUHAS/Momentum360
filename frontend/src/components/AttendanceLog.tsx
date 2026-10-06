import { Text, View } from "react-native";

type AttendanceLogProps = {
  status: "NOT_CHECKED_IN" | "CHECKED_IN" | "CHECKED_OUT";
  checkInTime: Date | null;
  checkOutTime: Date | null;
  formatTime: (date: Date) => string;
};

export default function AttendanceLog({
  status,
  checkInTime,
  checkOutTime,
  formatTime,
}: AttendanceLogProps) {
  return (
    <View className="mt-5 rounded-xl border border-slate-200 bg-white p-5">
      <Text className="text-lg font-semibold text-slate-900">Today's Log</Text>

      {status === "NOT_CHECKED_IN" && (
        <View className="mt-4 border-b border-slate-100 pb-4">
          <Text className="text-sm font-medium text-slate-700">
            No attendance recorded yet
          </Text>

          <Text className="mt-1 text-sm text-slate-500">
            Your attendance activity will appear here.
          </Text>
        </View>
      )}

      {status === "CHECKED_IN" && checkInTime && (
        <View className="mt-4 border-b border-slate-100 pb-4">
          <View className="flex-row items-center justify-between">
            <View>
              <Text className="text-sm font-medium text-slate-700">
                Check In
              </Text>

              <Text className="mt-1 text-sm text-slate-500">
                Attendance started
              </Text>
            </View>

            <Text className="text-sm font-semibold text-slate-900">
              {formatTime(checkInTime)}
            </Text>
          </View>
        </View>
      )}

      {status === "CHECKED_OUT" && checkInTime && checkOutTime && (
        <View className="mt-4 border-b border-slate-100 pb-4">
          <View className="flex-row items-center justify-between">
            <View>
              <Text className="text-sm font-medium text-slate-700">
                Check In
              </Text>

              <Text className="mt-1 text-sm text-slate-500">
                Attendance started
              </Text>
            </View>

            <Text className="text-sm font-semibold text-slate-900">
              {formatTime(checkInTime)}
            </Text>
          </View>

          <View className="mt-4 flex-row items-center justify-between">
            <View>
              <Text className="text-sm font-medium text-slate-700">
                Check Out
              </Text>

              <Text className="mt-1 text-sm text-slate-500">
                Attendance completed
              </Text>
            </View>

            <Text className="text-sm font-semibold text-slate-900">
              {formatTime(checkOutTime)}
            </Text>
          </View>
        </View>
      )}

      <Text className="mt-4 text-center text-sm font-semibold text-blue-600">
        View History
      </Text>
    </View>
  );
}
