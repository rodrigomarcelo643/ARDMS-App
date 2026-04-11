import { API_BASE_URL } from '@/constants/Config';
import axios from "axios";
import { useRouter } from "expo-router";
import { ArrowLeft, Send } from "lucide-react-native";
import React, { useRef, useState, useEffect } from "react";
import {
  Animated,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Toast from "react-native-toast-message";

// Import modular components
import { AuthBackground } from "@/components/auth/AuthBackground";
import { AuthLoadingModal } from "@/components/auth/AuthLoadingModal";
import { ForgotPasswordHeader } from "@/components/auth/forgot-password/ForgotPasswordHeader";
import { ForgotPasswordEmailInput } from "@/components/auth/forgot-password/ForgotPasswordEmailInput";
import { ForgotPasswordOtpInput } from "@/components/auth/forgot-password/ForgotPasswordOtpInput";

const ForgotPasswordScreen = () => {
  const APP_URL = `${API_BASE_URL}/api/forgot-password.php`;

  const [formData, setFormData] = useState({ email: "" });
  const [focused, setFocused] = useState({ email: false });
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [state, setState] = useState({ loading: false, showLoading: false, otpSent: false, verifying: false });

  const router = useRouter();
  const scrollViewRef = useRef<ScrollView>(null);
  const inputs = useRef<Array<TextInput | null>>([]);

  const emailAnim = useRef(new Animated.Value(0)).current;
  const logoAnim = useRef(new Animated.Value(0)).current;
  const textAnim = useRef(new Animated.Value(0)).current;

  const isWeb = Platform.OS === "web";

  useEffect(() => {
    Animated.sequence([
      Animated.timing(logoAnim, { toValue: 1, duration: 900, useNativeDriver: true }),
      Animated.timing(textAnim, { toValue: 1, duration: 900, useNativeDriver: true }),
    ]).start();
  }, []);

  const labelPosition = (anim: Animated.Value) => anim.interpolate({ inputRange: [0, 1], outputRange: isWeb ? [20, 8] : [13, 0] });
  const labelSize = (anim: Animated.Value) => anim.interpolate({ inputRange: [0, 1], outputRange: isWeb ? [16, 13] : [16, 12] });
  const animateLabel = (anim: Animated.Value, toValue: number) => {
    Animated.spring(anim, { toValue, useNativeDriver: false, speed: 20, bounciness: 10 }).start();
  };

  const handleOtpChange = (value: string, index: number) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp]; newOtp[index] = value; setOtp(newOtp);
    if (value && index < 5) inputs.current[index + 1]?.focus();
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === "Backspace" && !otp[index] && index > 0) inputs.current[index - 1]?.focus();
  };

  const handleFocus = (field: string, anim: Animated.Value) => {
    setFocused(prev => ({ ...prev, [field]: true })); animateLabel(anim, 1);
  };

  const handleBlur = (field: string, anim: Animated.Value) => {
    setFocused(prev => ({ ...prev, [field]: false }));
    if (!formData[field as keyof typeof formData]) animateLabel(anim, 0);
  };

  const validateForm = () => {
    if (!formData.email.trim()) { Toast.show({ type: "error", text1: "Validation Error", text2: "Email is required" }); return false; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) { Toast.show({ type: "error", text1: "Validation Error", text2: "Invalid email" }); return false; }
    return true;
  };

  const sendOTP = async () => {
    if (!validateForm()) return;
    Keyboard.dismiss(); setState(prev => ({ ...prev, loading: true, showLoading: true }));
    try {
      const res = await axios.post(APP_URL, { email: formData.email, action: "send_otp" }, { timeout: 10000 });
      if (res.data.success) {
        Toast.show({ type: "success", text1: "OTP Sent 📧", text2: res.data.message });
        setState(prev => ({ ...prev, loading: false, showLoading: false, otpSent: true }));
      } else {
        Toast.show({ type: "error", text1: "Failed", text2: res.data.message });
        setState(prev => ({ ...prev, loading: false, showLoading: false }));
      }
    } catch (e: any) {
      Toast.show({ type: "error", text1: "Error", text2: e.message });
      setState(prev => ({ ...prev, loading: false, showLoading: false }));
    }
  };

  const verifyOTP = async () => {
    if (otp.some(d => !d)) { Toast.show({ type: "error", text1: "Error", text2: "Enter all OTP digits" }); return; }
    setState(prev => ({ ...prev, verifying: true }));
    try {
      const res = await axios.post(APP_URL, { email: formData.email, otp: otp.join(""), action: "verify_otp" }, { timeout: 10000 });
      if (res.data.success) {
        Toast.show({ type: "success", text1: "Verified ✅" });
        setTimeout(() => router.push({ pathname: "/auth/reset-password" as any, params: { email: formData.email } }), 1000);
      } else {
        Toast.show({ type: "error", text1: "Failed", text2: res.data.message });
      }
    } catch (e: any) {
      Toast.show({ type: "error", text1: "Error", text2: e.message });
    } finally { setState(prev => ({ ...prev, verifying: false })); }
  };

  const logoStyle = { opacity: logoAnim, transform: [{ scale: logoAnim.interpolate({ inputRange: [0, 1], outputRange: [0.7, 1] }) }, { translateY: logoAnim.interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) }] };
  const textStyle = { opacity: textAnim, transform: [{ scale: textAnim.interpolate({ inputRange: [0, 1], outputRange: [0.7, 1] }) }, { translateY: textAnim.interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) }] };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} className="flex-1 bg-white">
      <AuthBackground />
      <AuthLoadingModal visible={state.showLoading || state.verifying} message={state.verifying ? "Verifying OTP..." : "Sending OTP..."} />

      <View className="absolute top-12 left-4 z-10">
        <TouchableOpacity onPress={() => router.back()} className="bg-white/80 p-3 rounded-full shadow-md">
          <ArrowLeft size={24} color="#af1616" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: "center" }} keyboardShouldPersistTaps="handled" ref={scrollViewRef}>
        <View className="flex-1 justify-center px-4 py-6">
          <View className="bg-white opacity-90 p-8 rounded-2xl shadow-lg border border-gray-100 w-full mx-auto max-w-md">
            <ForgotPasswordHeader logoStyle={logoStyle} textStyle={textStyle} />
            
            <ForgotPasswordEmailInput
              email={formData.email}
              setEmail={(text) => setFormData(prev => ({ ...prev, email: text }))}
              focused={focused.email}
              onFocus={() => handleFocus("email", emailAnim)}
              onBlur={() => handleBlur("email", emailAnim)}
              labelPosition={labelPosition(emailAnim)}
              labelSize={labelSize(emailAnim)}
              otpSent={state.otpSent}
            />

            {!state.otpSent ? (
              <TouchableOpacity
                className={`h-14 flex flex-row bg-[#af1616] rounded-[8px] mb-6 justify-center items-center shadow-md ${state.loading ? "opacity-80" : ""}`}
                onPress={sendOTP}
                disabled={state.loading}
              >
                <Text className="text-white text-lg mr-2 font-semibold">{state.loading ? "Sending..." : "Send OTP"}</Text>
                <Send size={17} color="white" />
              </TouchableOpacity>
            ) : (
              <ForgotPasswordOtpInput
                otp={otp}
                handleOtpChange={handleOtpChange}
                handleKeyPress={handleKeyPress}
                inputs={inputs}
                verifying={state.verifying}
                onVerify={verifyOTP}
              />
            )}

            <TouchableOpacity className="mt-3 items-center" onPress={() => router.back()}>
              <Text className="text-[#af1616] text-[15px] font-medium">Back to Sign In</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
      <Toast />
    </KeyboardAvoidingView>
  );
};

export default ForgotPasswordScreen;