import React from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import { Send } from "lucide-react-native";

interface ForgotPasswordOtpInputProps {
  otp: string[];
  handleOtpChange: (value: string, index: number) => void;
  handleKeyPress: (e: any, index: number) => void;
  inputs: React.MutableRefObject<Array<TextInput | null>>;
  verifying: boolean;
  onVerify: () => void;
}

export const ForgotPasswordOtpInput: React.FC<ForgotPasswordOtpInputProps> = ({
  otp,
  handleOtpChange,
  handleKeyPress,
  inputs,
  verifying,
  onVerify,
}) => (
  <>
    <View className="mb-6">
      <Text className="text-sm text-gray-600 mb-3">Enter OTP Code</Text>
      <View className="flex-row justify-between items-center">
        {otp.map((digit, index) => (
          <View key={index} className="justify-center items-center">
            <TextInput
              ref={ref => { inputs.current[index] = ref; }}
              className={`w-12 h-12 border ${
                digit ? 'border-[#af1616]' : 'border-gray-300'
              } rounded-lg text-center text-lg font-bold`}
              value={digit}
              onChangeText={value => handleOtpChange(value, index)}
              onKeyPress={e => handleKeyPress(e, index)}
              keyboardType="numeric"
              maxLength={1}
              selectTextOnFocus
            />
          </View>
        ))}
      </View>
    </View>

    {/* Verify OTP Button */}
    <TouchableOpacity
      className={`h-14 flex flex-row bg-[#15803d] rounded-[8px] mb-4 justify-center items-center shadow-md ${
        verifying ? "opacity-80" : ""
      }`}
      onPress={onVerify}
      disabled={verifying}
    >
      <Text className="text-white text-lg mr-2 font-semibold">
        {verifying ? "Verifying..." : "Verify OTP"}
      </Text>
      <Send size={17} color="white" />
    </TouchableOpacity>
  </>
);
