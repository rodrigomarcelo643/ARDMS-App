import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { ArrowLeft, Info } from 'lucide-react-native';

interface ChatHeaderProps {
  name: string;
  avatar?: string;
  userOnlineStatus: boolean;
  textColor: string;
  cardColor: string;
  mutedColor: string;
  onBack: () => void;
  onInfo: () => void;
  getInitials: (name: string) => string;
}

export const ChatHeader: React.FC<ChatHeaderProps> = ({
  name,
  avatar,
  userOnlineStatus,
  textColor,
  cardColor,
  mutedColor,
  onBack,
  onInfo,
  getInitials,
}) => (
  <View
    className="flex-row items-center px-4 py-4 pt-[50px] border-b"
    style={{ backgroundColor: cardColor, borderBottomColor: mutedColor + '30' }}
  >
    <TouchableOpacity onPress={onBack} className="mr-3">
      <ArrowLeft size={24} color={textColor} />
    </TouchableOpacity>
    
    <View className="relative mr-3">
      {avatar ? (
        <Image
          source={{ uri: avatar }}
          className="w-10 h-10 rounded-full"
          style={{ backgroundColor: '#af1616' }}
        />
      ) : (
        <View className="w-10 h-10 rounded-full items-center justify-center" style={{ backgroundColor: '#af1616' }}>
          <Text className="text-white font-bold text-sm">
            {getInitials(name)}
          </Text>
        </View>
      )}
      {userOnlineStatus && (
        <View className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white" />
      )}
    </View>
    
    <View className="flex-1">
      <Text className="font-semibold text-lg" style={{ color: textColor }}>
        {name}
      </Text>
      <Text className="text-sm" style={{ color: mutedColor }}>
        {userOnlineStatus ? 'Online' : 'Offline'}
      </Text>
    </View>
    
    <TouchableOpacity onPress={onInfo}>
      <Info size={24} color={textColor} />
    </TouchableOpacity>
  </View>
);
