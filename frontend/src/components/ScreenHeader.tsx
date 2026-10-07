import { Ionicons } from "@expo/vector-icons";
import { Pressable, Text, View } from "react-native";

type ScreenHeaderProps = {
  title: string;
  subtitle: string;
  showBack?: boolean;
  onBackPress?: () => void;
};

export default function ScreenHeader({
  title,
  subtitle,
  showBack = false,
  onBackPress,
}: ScreenHeaderProps) {
  return (
    <View className="px-5 pb-4 bg-white border-b pt-14 border-slate-200">
      <View className="flex-row items-center">
        {showBack ? (
          <Pressable
            onPress={onBackPress}
            className="items-center justify-center w-10 h-10 mr-3 rounded-full"
          >
            <Ionicons name="arrow-back" size={22} color="#0F172A" />
          </Pressable>
        ) : null}

        <View className="flex-1">
          <Text className="text-2xl font-bold text-slate-900">{title}</Text>

          <Text className="mt-1 text-sm text-slate-500">{subtitle}</Text>
        </View>
      </View>
    </View>
  );
}
