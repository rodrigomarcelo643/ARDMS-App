import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { QuickLinkCardProps } from '@/@types/tabs';

export const QuickLinkCard: React.FC<QuickLinkCardProps> = ({
  title,
  description,
  onPress,
  bgImage,
}) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      className="overflow-hidden"
      style={{ width: "100%", elevation: 8 }}
      activeOpacity={0.8}
    >
      <View className="rounded-2xl px-0 overflow-hidden" style={{ height: 115 }}>
        {/* Background Image */}
        <Image
          source={bgImage}
          className="w-full h-full absolute"
          resizeMode="cover"
        />
        {/* Content Overlay */}
        <View className="flex-1 pt-5 px-7 justify-start">
          <View className="flex-col justify-start items-start">
            {/* Title */}
            <Text className="text-2xl font-bold text-white mb-1">
              {title}
            </Text>

            {/* Description */}
            <Text className="text-sm text-white/90">
              {description}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};
