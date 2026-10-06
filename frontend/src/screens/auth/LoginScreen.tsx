import { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

import Input from "../../components/Input";
import Button from "../../components/Button";
import { useAuth } from "../../store/AuthContext";
import api from "../../services/api";

export default function LoginScreen() {
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const [loading, setLoading] = useState(false);

  const validate = () => {
    let valid = true;

    setEmailError("");
    setPasswordError("");

    if (!email.trim()) {
      setEmailError("Email is required.");
      valid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setEmailError("Enter a valid email address.");
      valid = false;
    }

    if (!password) {
      setPasswordError("Password is required.");
      valid = false;
    }

    return valid;
  };

  const handleLogin = async () => {
    if (!validate()) {
      return;
    }

    try {
      setLoading(true);

      const response = await api.post("/auth/login", {
        email: email.trim(),
        password,
      });

      await login(response.data.accessToken, response.data.user);
    } catch (error: any) {
      const message =
        error?.response?.data?.message ||
        "Unable to login. Please check your credentials.";

      setPasswordError(Array.isArray(message) ? message[0] : message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-slate-50"
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          flexGrow: 1,
          paddingHorizontal: 24,
          paddingVertical: 32,
        }}
      >
        <View className="flex-1 justify-center">
          {/* Logo */}

          <View className="items-center">
            <View className="h-20 w-20 items-center justify-center rounded-3xl bg-blue-600 shadow-sm">
              <Text className="text-4xl font-bold text-white">M</Text>
            </View>

            <Text className="mt-4 text-2xl font-bold text-slate-900">
              Momentum
              <Text className="text-blue-600">360</Text>
            </Text>

            <Text className="mt-1 text-xs font-medium tracking-wide text-slate-400">
              People • Process • Progress
            </Text>
          </View>

          {/* Welcome */}

          <View className="mt-10">
            <Text className="text-2xl font-bold text-slate-900">
              Welcome back
            </Text>

            <Text className="mt-2 text-sm leading-5 text-slate-500">
              Please login to your account to continue.
            </Text>
          </View>

          {/* Form */}

          <View className="mt-8">
            <Input
              label="Email or Username"
              placeholder="Enter your email"
              value={email}
              onChangeText={(value) => {
                setEmail(value);
                if (emailError) {
                  setEmailError("");
                }
              }}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              error={emailError}
            />

            <View className="mt-5">
              <Input
                label="Password"
                placeholder="Enter your password"
                value={password}
                onChangeText={(value) => {
                  setPassword(value);
                  if (passwordError) {
                    setPasswordError("");
                  }
                }}
                secureTextEntry
                isPassword
                autoCapitalize="none"
                error={passwordError}
              />
            </View>

            {/* Forgot Password */}

            <Pressable className="mt-4 self-end" onPress={() => {}}>
              <Text className="text-sm font-semibold text-blue-600">
                Forgot Password?
              </Text>
            </Pressable>

            {/* Login */}

            <View className="mt-6">
              <Button title="Login" loading={loading} onPress={handleLogin} />
            </View>
          </View>

          {/* Footer */}

          <View className="mt-8 items-center">
            <Text className="text-sm text-slate-400">
              Don't have an account?
            </Text>

            <Text className="mt-1 text-sm font-medium text-slate-500">
              Contact your administrator
            </Text>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
