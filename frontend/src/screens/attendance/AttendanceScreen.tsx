import { useEffect, useState } from "react";
import { ScrollView, Text, View } from "react-native";

import AttendanceLog from "../../components/AttendanceLog";
import AttendanceStatusCard from "../../components/AttendanceStatusCard";
import ToastMessage from "../../components/ToastMessage";

import { getCurrentLocation } from "../../services/locationService";
import { checkIn as checkInAttendance } from "../../services/attendanceService";

export default function AttendanceScreen() {
  const [attendanceStatus, setAttendanceStatus] = useState<
    "NOT_CHECKED_IN" | "CHECKED_IN" | "CHECKED_OUT"
  >("NOT_CHECKED_IN");

  const [checkInTime, setCheckInTime] = useState<Date | null>(null);
  const [checkOutTime, setCheckOutTime] = useState<Date | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  useEffect(() => {
    if (attendanceStatus !== "CHECKED_IN" || !checkInTime) {
      return;
    }

    const updateElapsedTime = () => {
      const elapsed = Math.floor((Date.now() - checkInTime.getTime()) / 1000);

      setElapsedSeconds(elapsed);
    };

    updateElapsedTime();

    const interval = setInterval(updateElapsedTime, 1000);

    return () => clearInterval(interval);
  }, [attendanceStatus, checkInTime]);

  const handleCheckIn = async () => {
    try {
      setErrorMessage(null);

      const location = await getCurrentLocation();

      const attendance = await checkInAttendance(
        location.latitude,
        location.longitude,
      );

      const checkInDate = attendance.checkIn
        ? new Date(attendance.checkIn)
        : new Date();

      setCheckInTime(checkInDate);
      setCheckOutTime(null);
      setElapsedSeconds(0);
      setAttendanceStatus("CHECKED_IN");
    } catch (error: any) {
      if (error?.response?.status === 403) {
        setErrorMessage(
          "You are not authorized to check in with this account.",
        );
      } else if (error?.response?.status === 409) {
        setErrorMessage("You have already checked in today.");
      } else if (error?.response?.data?.message) {
        setErrorMessage(error.response.data.message);
      } else if (error?.message) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage("Unable to check in. Please try again.");
      }
    }
  };

  const handleCheckOut = () => {
    const now = new Date();

    if (!checkInTime) {
      return;
    }

    const totalSeconds = Math.floor(
      (now.getTime() - checkInTime.getTime()) / 1000,
    );

    setCheckOutTime(now);
    setElapsedSeconds(totalSeconds);
    setAttendanceStatus("CHECKED_OUT");
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

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
    <View className="flex-1 bg-slate-50">
      {errorMessage ? (
        <ToastMessage
          message={errorMessage}
          onHide={() => setErrorMessage(null)}
        />
      ) : null}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 20 }}
      >
        {/* Header */}

        {/* Attendance Card */}
        <AttendanceStatusCard
          status={attendanceStatus}
          elapsedSeconds={elapsedSeconds}
          onCheckIn={handleCheckIn}
          onCheckOut={handleCheckOut}
        />

        {/* Today's Log */}
        <AttendanceLog
          status={attendanceStatus}
          checkInTime={checkInTime}
          checkOutTime={checkOutTime}
          formatTime={formatTime}
        />
      </ScrollView>
    </View>
  );
}
