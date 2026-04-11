import React from 'react';
import { View, Text } from 'react-native';
import { Check, X } from "lucide-react-native";

interface PasswordValidationUIProps {
  validation: {
    hasUpperCase: boolean;
    hasNumber: boolean;
    hasSpecialChar: boolean;
    hasMinLength: boolean;
    isNotCommon: boolean;
  };
  passwords: {
    new_password: string;
    confirm_password: string;
  };
}

export const PasswordValidationUI: React.FC<PasswordValidationUIProps> = ({
  validation,
  passwords,
}) => {
  if (passwords.new_password.length === 0) return null;

  return (
    <View className="mt-0 mb-3 p-3 bg-gray-50 rounded-lg">
      <Text className="text-sm font-medium text-gray-600 mb-2">Password requirements:</Text>
      <View className="ml-1">
        <ValidationRow isDone={validation.hasUpperCase} text="At least one uppercase letter" />
        <ValidationRow isDone={validation.hasNumber} text="At least one number" />
        <ValidationRow isDone={validation.hasSpecialChar} text="At least one special character" />
        <ValidationRow isDone={validation.hasMinLength} text="At least 8 characters" />
        <ValidationRow isDone={validation.isNotCommon} text="Not a common password" />
      </View>
    </View>
  );
};

const ValidationRow = ({ isDone, text }: { isDone: boolean; text: string }) => (
  <View className="flex-row items-center mb-1">
    {isDone ? <Check size={14} color="#10b981" /> : <X size={14} color="#ef4444" />}
    <Text className={`text-xs ml-2 ${isDone ? 'text-green-600' : 'text-red-600'}`}>
      {text}
    </Text>
  </View>
);
