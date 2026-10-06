import { useRef, useState } from "react";
import { Animated, PanResponder, Text, View } from "react-native";

type SlideToCheckoutProps = {
  onComplete: () => void;
};

const HANDLE_SIZE = 48;
const TRACK_PADDING = 4;

export default function SlideToCheckout({ onComplete }: SlideToCheckoutProps) {
  const translateX = useRef(new Animated.Value(0)).current;

  const [trackWidth, setTrackWidth] = useState(0);
  const [completed, setCompleted] = useState(false);

  const trackWidthRef = useRef(0);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,

      onMoveShouldSetPanResponder: () => true,

      onPanResponderMove: (_, gestureState) => {
        const width = trackWidthRef.current;

        const maxTranslate = Math.max(
          0,
          width - HANDLE_SIZE - TRACK_PADDING * 2,
        );

        const position = Math.max(0, Math.min(maxTranslate, gestureState.dx));

        translateX.setValue(position);
      },

      onPanResponderRelease: (_, gestureState) => {
        const width = trackWidthRef.current;

        const maxTranslate = Math.max(
          0,
          width - HANDLE_SIZE - TRACK_PADDING * 2,
        );

        const threshold = maxTranslate * 0.75;

        if (gestureState.dx >= threshold) {
          setCompleted(true);

          Animated.timing(translateX, {
            toValue: maxTranslate,
            duration: 150,
            useNativeDriver: true,
          }).start(() => {
            onComplete();
          });
        } else {
          Animated.spring(translateX, {
            toValue: 0,
            useNativeDriver: true,
          }).start();
        }
      },
    }),
  ).current;

  return (
    <View
      className="h-14 w-full overflow-hidden rounded-xl bg-slate-100"
      onLayout={(event) => {
        const width = event.nativeEvent.layout.width;

        trackWidthRef.current = width;
        setTrackWidth(width);
      }}
    >
      {/* Center Text */}
      <View className="absolute inset-0 items-center justify-center">
        <Text className="text-sm font-semibold text-slate-500">
          {completed ? "Checking Out..." : "Slide to Check Out"}
        </Text>
      </View>

      {/* Sliding Handle */}
      <Animated.View
        {...panResponder.panHandlers}
        className="absolute left-1 top-1 h-12 w-12 items-center justify-center rounded-lg bg-blue-600"
        style={{
          transform: [{ translateX }],
        }}
      >
        <Text className="text-xl font-bold text-white">→</Text>
      </Animated.View>
    </View>
  );
}
