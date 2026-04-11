import React from 'react';
import { View, Text, Image } from 'react-native';

interface InfoProfileHeaderProps {
  name: string;
  avatar?: string;
  user_type: any;
  userOnlineStatus: boolean | null;
  statusLoading: boolean;
  textColor: string;
  cardColor: string;
  mutedColor: string;
  getInitials: (name: string) => string;
}

const SkeletonLoader = ({ width, height, borderRadius = 4, mutedColor }: { width: number | string; height: number; borderRadius?: number; mutedColor: string }) => (
  <View style={{ width: width as any, height, borderRadius, backgroundColor: mutedColor + '30' }} />
);

export const InfoProfileHeader: React.FC<InfoProfileHeaderProps> = ({
  name,
  avatar,
  user_type,
  userOnlineStatus,
  statusLoading,
  textColor,
  cardColor,
  mutedColor,
  getInitials,
}) => (
  <View className="items-center py-6" style={{ backgroundColor: cardColor }}>
    <View className="relative">
      <View className="w-24 h-24 rounded-full items-center justify-center" style={{ backgroundColor: '#af1616' }}>
        <Text className="text-white font-bold text-2xl">
          {getInitials(name)}
        </Text>
      </View>
      {avatar && (
        <Image
          source={{ uri: avatar }}
          className="absolute inset-0 w-24 h-24 rounded-full"
        />
      )}
      {statusLoading ? (
        <View className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full border-4 border-white" style={{ backgroundColor: mutedColor + '50' }}>
          <View className="flex-1 items-center justify-center">
            <View className="w-2 h-2 rounded-full" style={{ backgroundColor: mutedColor }} />
          </View>
        </View>
      ) : userOnlineStatus ? (
        <View className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-4 border-white" />
      ) : (
        <View className="absolute -bottom-1 -right-1 w-6 h-6 bg-gray-400 rounded-full border-4 border-white" />
      )}
    </View>
    <Text className="text-2xl font-bold mt-4" style={{ color: textColor }}>
      {name || 'User'}
    </Text>
    <View className="flex-row items-center mt-2 px-4 py-2 rounded-full" style={{ backgroundColor: userOnlineStatus ? '#10B98120' : mutedColor + '15' }}>
      <Text className="text-sm font-medium" style={{ color: mutedColor }}>
        {user_type ? String(user_type).charAt(0).toUpperCase() + String(user_type).slice(1) : 'User'}
      </Text>
      <Text className="text-sm mx-2" style={{ color: mutedColor }}>•</Text>
      {statusLoading ? (
        <SkeletonLoader width={50} height={14} borderRadius={7} mutedColor={mutedColor} />
      ) : (
        <View className="flex-row items-center">
          <View className={`w-2 h-2 rounded-full mr-1.5 ${userOnlineStatus ? 'bg-green-500' : 'bg-gray-400'}`} />
          <Text className="text-sm font-semibold" style={{ color: userOnlineStatus ? '#10B981' : mutedColor }}>
            {userOnlineStatus ? 'Online' : 'Offline'}
          </Text>
        </View>
      )}
    </View>
  </View>
);
