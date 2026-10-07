import { useEffect, useRef } from "react";
import { Animated, Text, View } from "react-native";

type ToastMessageProps = {
  message: string;
  title?: string;
  type?: "success" | "error";
  onHide: () => void;
};

export default function ToastMessage({
  message,
  title,
  type = "error",
  onHide,
}: ToastMessageProps) {
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.delay(2600),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(({ finished }) => {
      if (finished) {
        onHide();
      }
    });
  }, [message, opacity, onHide]);

  return (
    <Animated.View
      style={{ opacity }}
      className="absolute left-4 right-4 top-[-65px] z-50"
    >
      <View
        className={`rounded-xl border px-4 py-3 shadow-sm ${
          type === "success"
            ? "border-emerald-200 bg-emerald-50"
            : "border-red-200 bg-red-50"
        }`}
      >
        <Text
          className={`text-sm font-semibold ${
            type === "success" ? "text-emerald-700" : "text-red-700"
          }`}
        >
          {title || (type === "success" ? "Success" : "Unable to Check In")}
        </Text>

        <Text
          className={`mt-1 text-sm ${
            type === "success" ? "text-emerald-600" : "text-red-600"
          }`}
        >
          {message}
        </Text>
      </View>
    </Animated.View>
  );
}
