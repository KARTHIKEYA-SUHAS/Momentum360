import { useAuth } from "../../store/AuthContext";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";

import AttendanceLog from "../../components/AttendanceLog";
import AttendanceStatusCard from "../../components/AttendanceStatusCard";
import ToastMessage from "../../components/ToastMessage";

import { getCurrentLocation } from "../../services/locationService";
import {
  getAttendance,
  checkIn as checkInAttendance,
  checkOut as checkOutAttendance,
} from "../../services/attendanceService";

export default function AttendanceScreen() {
  const { user } = useAuth();
  const [attendanceStatus, setAttendanceStatus] = useState<
    "NOT_CHECKED_IN" | "CHECKED_IN" | "CHECKED_OUT"
  >("NOT_CHECKED_IN");

  const [loadingAttendance, setLoadingAttendance] = useState(true);
  const [checkInTime, setCheckInTime] = useState<Date | null>(null);
  const [checkOutTime, setCheckOutTime] = useState<Date | null>(null);
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [checkingOut, setCheckingOut] = useState(false);
  const [checkoutResetKey, setCheckoutResetKey] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  useEffect(() => {
    const loadTodayAttendance = async () => {
      try {
        setLoadingAttendance(true);
        setErrorMessage(null);

        const records = await getAttendance();

        const today = new Date();

        const localYear = today.getFullYear();
        const localMonth = String(today.getMonth() + 1).padStart(2, "0");
        const localDay = String(today.getDate()).padStart(2, "0");

        const todayDate = `${localYear}-${localMonth}-${localDay}`;

        const todayAttendance = records.find(
          (record) =>
            record.attendanceDate === todayDate &&
            record.employee?.userId === user?.id,
        );

        if (!todayAttendance) {
          setAttendanceStatus("NOT_CHECKED_IN");
          setCheckInTime(null);
          setCheckOutTime(null);
          setElapsedSeconds(0);
          return;
        }

        const checkInDate = todayAttendance.checkIn
          ? new Date(todayAttendance.checkIn)
          : null;

        const checkOutDate = todayAttendance.checkOut
          ? new Date(todayAttendance.checkOut)
          : null;

        setCheckInTime(checkInDate);
        setCheckOutTime(checkOutDate);

        if (checkInDate && !checkOutDate) {
          const elapsed = Math.floor(
            (Date.now() - checkInDate.getTime()) / 1000,
          );

          setElapsedSeconds(Math.max(0, elapsed));
          setAttendanceStatus("CHECKED_IN");
        } else if (checkInDate && checkOutDate) {
          const totalSeconds = Math.floor(
            (checkOutDate.getTime() - checkInDate.getTime()) / 1000,
          );

          setElapsedSeconds(Math.max(0, totalSeconds));
          setAttendanceStatus("CHECKED_OUT");
        } else {
          setAttendanceStatus("NOT_CHECKED_IN");
          setElapsedSeconds(0);
        }
      } catch (error: any) {
        if (error?.response?.data?.message) {
          setErrorMessage(error.response.data.message);
        } else if (error?.message) {
          setErrorMessage(error.message);
        } else {
          setErrorMessage("Unable to load today's attendance.");
        }
      } finally {
        setLoadingAttendance(false);
      }
    };

    loadTodayAttendance();
  }, []);

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
        setErrorMessage(
          error.response.data?.message ?? "You cannot check in at this time.",
        );
      } else if (error?.response?.data?.message) {
        setErrorMessage(error.response.data.message);
      } else if (error?.message) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage("Unable to check in. Please try again.");
      }
    }
  };

  const handleCheckOut = async () => {
    try {
      setCheckingOut(true);
      setErrorMessage(null);

      if (!checkInTime) {
        return;
      }

      const attendance = await checkOutAttendance();

      const checkOutDate = attendance.checkOut
        ? new Date(attendance.checkOut)
        : new Date();

      const totalSeconds = Math.floor(
        (checkOutDate.getTime() - checkInTime.getTime()) / 1000,
      );

      setCheckOutTime(checkOutDate);
      setElapsedSeconds(totalSeconds);
      setAttendanceStatus("CHECKED_OUT");

      setShowCheckoutModal(false);
    } catch (error: any) {
      if (error?.response?.status === 403) {
        setErrorMessage(
          "You are not authorized to check out with this account.",
        );
      } else if (error?.response?.status === 404) {
        setErrorMessage("No active attendance record was found for today.");
      } else if (error?.response?.status === 409) {
        setErrorMessage("You have already checked out today.");
      } else if (error?.response?.data?.message) {
        setErrorMessage(error.response.data.message);
      } else if (error?.message) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage("Unable to check out. Please try again.");
      }
    } finally {
      setCheckingOut(false);
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const requestCheckoutConfirmation = () => {
    setShowCheckoutModal(true);
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

  if (loadingAttendance) {
    return (
      <View className="items-center justify-center flex-1 bg-slate-50">
        <Text className="text-sm text-slate-500">Loading attendance...</Text>
      </View>
    );
  }

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
          onCheckOut={requestCheckoutConfirmation}
          resetKey={checkoutResetKey}
        />

        {/* Today's Log */}
        <AttendanceLog
          status={attendanceStatus}
          checkInTime={checkInTime}
          checkOutTime={checkOutTime}
          formatTime={formatTime}
        />
      </ScrollView>
      <Modal
        visible={showCheckoutModal}
        transparent
        animationType="fade"
        onRequestClose={() => {
          if (!checkingOut) {
            setShowCheckoutModal(false);
          }
        }}
      >
        <View className="items-center justify-center flex-1 px-6 bg-black/40">
          <View className="w-full p-6 bg-white rounded-2xl">
            {/* Icon */}
            <View className="items-center justify-center mx-auto bg-blue-100 rounded-full h-14 w-14">
              <Text className="text-2xl text-blue-600">→</Text>
            </View>

            {/* Title */}
            <Text className="mt-5 text-xl font-bold text-center text-slate-900">
              Confirm Check Out?
            </Text>

            {/* Message */}
            <Text className="mt-2 text-sm leading-5 text-center text-slate-500">
              Are you sure you want to check out for today?
            </Text>

            {/* Buttons */}
            <View className="flex-row gap-3 mt-6">
              <Pressable
                disabled={checkingOut}
                onPress={() => {
                  setShowCheckoutModal(false);
                  setCheckoutResetKey((current) => current + 1);
                }}
                className="items-center justify-center flex-1 h-12 bg-white border rounded-xl border-slate-200"
              >
                <Text className="text-sm font-semibold text-slate-700">
                  Cancel
                </Text>
              </Pressable>

              <Pressable
                disabled={checkingOut}
                onPress={handleCheckOut}
                className="items-center justify-center flex-1 h-12 bg-blue-600 rounded-xl"
              >
                {checkingOut ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text className="text-sm font-semibold text-white">
                    Check Out
                  </Text>
                )}
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}
