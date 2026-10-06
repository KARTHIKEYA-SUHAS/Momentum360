import { useEffect, useRef } from "react";
import { Animated, Text, View } from "react-native";

type ToastMessageProps = {
  message: string;
  onHide: () => void;
};

export default function ToastMessage({ message, onHide }: ToastMessageProps) {
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
      <View className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 shadow-sm">
        <Text className="text-sm font-semibold text-red-700">
          Unable to Check In
        </Text>

        <Text className="mt-1 text-sm text-red-600">{message}</Text>
      </View>
    </Animated.View>
  );
}
