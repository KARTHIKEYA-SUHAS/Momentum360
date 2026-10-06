import React from "react";
import {
  Pressable,
  Text,
  TextInput,
  View,
  type TextInputProps,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

type InputProps = TextInputProps & {
  label: string;
  error?: string;
  isPassword?: boolean;
};

export default function Input({
  label,
  error,
  isPassword = false,
  secureTextEntry,
  ...props
}: InputProps) {
  const [showPassword, setShowPassword] = React.useState(false);

  const shouldHidePassword = isPassword && secureTextEntry && !showPassword;

  return (
    <View className="w-full">
      <Text className="mb-2 text-sm font-medium text-slate-700">{label}</Text>

      <View className="relative">
        <TextInput
          {...props}
          secureTextEntry={shouldHidePassword}
          className={`h-12 rounded-xl border bg-white px-4 pr-12 text-base text-slate-900 ${
            error ? "border-red-500" : "border-slate-200"
          }`}
          placeholderTextColor="#94A3B8"
        />

        {isPassword ? (
          <Pressable
            onPress={() => setShowPassword((current) => !current)}
            className="absolute right-0 top-0 h-12 w-12 items-center justify-center"
          >
            <Ionicons
              name={showPassword ? "eye-off-outline" : "eye-outline"}
              size={18}
              color="#64748B"
            />
          </Pressable>
        ) : null}
      </View>

      {error ? (
        <Text className="mt-1 text-xs text-red-500">{error}</Text>
      ) : null}
    </View>
  );
}
