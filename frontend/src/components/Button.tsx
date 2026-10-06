import {
  ActivityIndicator,
  Pressable,
  Text,
  type PressableProps,
} from "react-native";

type ButtonProps = PressableProps & {
  title: string;
  loading?: boolean;
};

export default function Button({
  title,
  loading = false,
  disabled,
  ...props
}: ButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <Pressable
      {...props}
      disabled={isDisabled}
      className={`h-12 items-center justify-center rounded-xl bg-blue-600 ${
        isDisabled ? "opacity-50" : "opacity-100"
      }`}
    >
      {loading ? (
        <ActivityIndicator color="#FFFFFF" />
      ) : (
        <Text className="text-base font-semibold text-white">{title}</Text>
      )}
    </Pressable>
  );
}
