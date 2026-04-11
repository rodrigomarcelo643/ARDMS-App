import React from 'react';
import { View, TextInput, Animated, TouchableOpacity } from 'react-native';
import { User, Lock, Eye, EyeOff } from "lucide-react-native";

interface LoginInputsProps {
  loginData: any;
  setLoginData: (data: any) => void;
  loginFocused: any;
  handleFocus: (field: string, anim: Animated.Value) => void;
  handleBlur: (field: string, anim: Animated.Value) => void;
  usernameAnim: Animated.Value;
  passwordAnim: Animated.Value;
  labelPosition: (anim: Animated.Value) => any;
  labelSize: (anim: Animated.Value) => any;
  showPassword: boolean;
  setShowPassword: (show: boolean) => void;
}

export const LoginInputs: React.FC<LoginInputsProps> = ({
  loginData,
  setLoginData,
  loginFocused,
  handleFocus,
  handleBlur,
  usernameAnim,
  passwordAnim,
  labelPosition,
  labelSize,
  showPassword,
  setShowPassword,
}) => {
  const handleInputChange = (field: string, value: string) => {
    setLoginData((prev: any) => ({ ...prev, [field]: value }));
  };

  return (
    <>
      {/* Student ID Input */}
      <View className="mb-6">
        <Animated.Text
          className="absolute left-10 z-10"
          style={{
            top: labelPosition(usernameAnim),
            fontSize: labelSize(usernameAnim),
            color: loginFocused.student_id ? "#af1616" : "#4B5563",
            transform: [{ translateY: labelPosition(usernameAnim) }],
          }}
        >
          Student ID
        </Animated.Text>
        <View
          className={`border-b py-1 px-2 ${
            loginFocused.student_id
              ? "border-[#af1616]"
              : "border-gray-400"
          }`}
        >
          <View className="flex-row items-center">
            <User
              size={20}
              color={loginFocused.student_id ? "#af1616" : "#6b7280"}
              style={{ marginRight: 10, marginTop: 15 }}
            />
            <TextInput
              className="h-14 text-[#af1616] pt-5 flex-1"
              value={loginData.student_id}
              onChangeText={(text) => handleInputChange("student_id", text)}
              onFocus={() => handleFocus("student_id", usernameAnim)}
              onBlur={() => handleBlur("student_id", usernameAnim)}
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>
        </View>
      </View>

      {/* Regular Password Input */}
      <View className="mb-6">
        <Animated.Text
          className="absolute left-10 z-10"
          style={{
            top: labelPosition(passwordAnim),
            fontSize: labelSize(passwordAnim),
            color: loginFocused.password ? "#af1616" : "#6b7280",
            transform: [{ translateY: labelPosition(passwordAnim) }],
          }}
        >
          Password
        </Animated.Text>
        <View
          className={`border-b py-1 px-2 ${
            loginFocused.password ? "border-[#af1616]" : "border-gray-400"
          }`}
        >
          <View className="flex-row items-center">
            <Lock
              size={20}
              color={loginFocused.password ? "#af1616" : "#6b7280"}
              style={{ marginRight: 10, marginTop: 15 }}
            />
            <TextInput
              className="h-14 text-[#af1616] pt-5 flex-1"
              value={loginData.password}
              onChangeText={(text) => handleInputChange("password", text)}
              onFocus={() => handleFocus("password", passwordAnim)}
              onBlur={() => handleBlur("password", passwordAnim)}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
            />
            <TouchableOpacity
              onPress={() => setShowPassword(!showPassword)}
              className="ml-2 px-2 py-1"
              style={{ marginTop: 25 }}
            >
              {showPassword ? (
                <EyeOff size={20} color="#af1616" />
              ) : (
                <Eye size={20} color="#af1616" />
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </>
  );
};
