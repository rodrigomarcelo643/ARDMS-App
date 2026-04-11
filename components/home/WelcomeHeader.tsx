import React from 'react';
import { View, Text } from 'react-native';
import { useThemeColor } from "@/hooks/useThemeColor";
import { WelcomeHeaderProps } from '@/@types/tabs';

export const WelcomeHeader: React.FC<WelcomeHeaderProps & { mutedColor: string }> = ({
  user,
  mutedColor
}) => {
  return (
    <View className="flex-row justify-between p-2 items-center mb-2">
      <View className="flex-1">
        <Text style={{ fontSize: 16, color: mutedColor, marginBottom: 4 }}>
          Welcome back,
        </Text>
        <Text style={{ fontSize: 30, fontWeight: 'bold', color: '#dc2626' }}>
          {user?.first_name} {user?.last_name}
        </Text>
      </View>
    </View>
  );
};
