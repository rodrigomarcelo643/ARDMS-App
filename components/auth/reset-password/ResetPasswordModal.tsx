import React from 'react';
import { View, Text, Modal, Pressable } from 'react-native';

interface ResetPasswordModalProps {
  visible: boolean;
  type: string;
  title: string;
  message: string;
  onClose: () => void;
}

export const ResetPasswordModal: React.FC<ResetPasswordModalProps> = ({
  visible,
  type,
  title,
  message,
  onClose,
}) => (
  <Modal
    animationType="fade"
    transparent={true}
    visible={visible}
    onRequestClose={onClose}
  >
    <View className="flex-1 justify-center items-center bg-black/70">
      <View className="bg-white rounded-lg p-6 w-4/5 max-w-md">
        <View
          className={`rounded-full h-16 w-16 justify-center items-center mx-auto mb-4 ${
            type === "success" ? "bg-green-100" : "bg-red-100"
          }`}
        >
          <Text
            className={`text-2xl ${
              type === "success" ? "text-green-600" : "text-red-600"
            }`}
          >
            {type === "success" ? "✓" : "✕"}
          </Text>
        </View>
        <Text className="text-xl font-bold text-gray-800 text-center mb-2">
          {title}
        </Text>
        <Text className="text-gray-600 text-center mb-6">
          {message}
        </Text>
        <Pressable
          className="bg-[#af1616] rounded-lg py-3 px-6"
          onPress={onClose}
        >
          <Text className="text-white font-semibold text-center">OK</Text>
        </Pressable>
      </View>
    </View>
  </Modal>
);
