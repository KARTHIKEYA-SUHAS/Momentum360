import { Text, View } from "react-native";

import Button from "./Button";
import SlideToCheckout from "./SlideToCheckout";

type AttendanceStatus = "NOT_CHECKED_IN" | "CHECKED_IN" | "CHECKED_OUT";

type AttendanceStatusCardProps = {
  status: AttendanceStatus;
  elapsedSeconds: number;
  onCheckIn: () => void;
  onCheckOut: () => void;
  resetKey?: number;
};

export default function AttendanceStatusCard({
  status,
  elapsedSeconds,
  onCheckIn,
  onCheckOut,
  resetKey,
}: AttendanceStatusCardProps) {
  const formatElapsedTime = () => {
    const hours = Math.floor(elapsedSeconds / 3600);
    const minutes = Math.floor((elapsedSeconds % 3600) / 60);
    const seconds = elapsedSeconds % 60;

    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(
      2,
      "0",
    )}:${String(seconds).padStart(2, "0")}`;
  };

  return (
    <View className="p-5 bg-white border rounded-xl border-slate-200">
      <Text className="text-sm font-medium text-slate-500">Status</Text>

      <Text className="mt-2 text-xl font-semibold text-slate-900">
        {status === "NOT_CHECKED_IN"
          ? "Not Checked In"
          : status === "CHECKED_IN"
            ? "Checked In"
            : "Checked Out"}
      </Text>

      {status === "NOT_CHECKED_IN" && (
        <>
          <Text className="mt-1 text-sm text-slate-500">
            You haven't checked in today.
          </Text>

          <View className="mt-5">
            <Button title="Check In" onPress={onCheckIn} />
          </View>
        </>
      )}

      {status === "CHECKED_IN" && (
        <>
          <View className="items-center mt-6">
            <View className="h-48 w-48 items-center justify-center rounded-full border-[12px] border-emerald-500">
              <Text className="text-3xl font-bold text-slate-900">
                {formatElapsedTime()}
              </Text>

              <Text className="mt-1 text-sm text-slate-500">Working time</Text>
            </View>
          </View>

          <View className="mt-6">
            <SlideToCheckout onComplete={onCheckOut} resetKey={resetKey} />
          </View>
        </>
      )}

      {status === "CHECKED_OUT" && (
        <>
          <Text className="mt-1 text-sm text-slate-500">
            Attendance completed for today.
          </Text>

          <View className="p-4 mt-6 rounded-xl bg-slate-50">
            <Text className="text-sm text-slate-500">Total Working Time</Text>

            <Text className="mt-1 text-2xl font-bold text-slate-900">
              {formatElapsedTime()}
            </Text>
          </View>
        </>
      )}
    </View>
  );
}
