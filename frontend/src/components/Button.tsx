import {
  ActivityIndicator,
  Pressable,
  Text,
  type PressableProps,
} from "react-native";
import type { ReactNode } from "react";

type ButtonProps = PressableProps & {
  title: string;
  loading?: boolean;
  icon?: ReactNode;
};

export default function Button({
  title,
  loading = false,
  disabled,
  icon,
  ...props
}: ButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <Pressable
      {...props}
      disabled={isDisabled}
      className={`h-12 flex-row items-center justify-center rounded-3xl bg-blue-600 ${
        isDisabled ? "opacity-50" : "opacity-100"
      }`}
    >
      {loading ? (
        <ActivityIndicator color="#FFFFFF" />
      ) : (
        <>
          {icon}
          <Text className="text-base font-semibold text-white">{title}</Text>
        </>
      )}
    </Pressable>
  );
}
