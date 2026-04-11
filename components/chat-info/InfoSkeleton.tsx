import React from 'react';
import { View } from 'react-native';

const SkeletonLoader = ({ width, height, borderRadius = 4, mutedColor }: { width: number | string; height: number; borderRadius?: number; mutedColor: string }) => {
  return (
    <View
      style={{
        width: width as any,
        height,
        borderRadius,
        backgroundColor: mutedColor + '30',
      }}
    />
  );
};

interface InfoSkeletonProps {
  backgroundColor: string;
  cardColor: string;
  mutedColor: string;
}

export const InfoSkeleton: React.FC<InfoSkeletonProps> = ({
  backgroundColor,
  cardColor,
  mutedColor,
}) => (
  <View style={{ flex: 1, backgroundColor }}>
    {/* Header skeleton */}
    <View className="flex-row items-center px-4 py-4 pt-10 border-b" style={{ backgroundColor: cardColor, borderBottomColor: mutedColor + '30' }}>
      <SkeletonLoader width={24} height={24} borderRadius={12} mutedColor={mutedColor} />
      <View className="ml-3 flex-1">
        <SkeletonLoader width={100} height={20} borderRadius={4} mutedColor={mutedColor} />
      </View>
      <SkeletonLoader width={24} height={24} borderRadius={12} mutedColor={mutedColor} />
    </View>
    
    {/* Profile section skeleton */}
    <View className="items-center py-6" style={{ backgroundColor: cardColor }}>
      <SkeletonLoader width={96} height={96} borderRadius={48} mutedColor={mutedColor} />
      <View className="mt-4">
        <SkeletonLoader width={120} height={24} borderRadius={4} mutedColor={mutedColor} />
      </View>
      <View className="mt-2">
        <SkeletonLoader width={80} height={16} borderRadius={4} mutedColor={mutedColor} />
      </View>
    </View>
    
    {/* Tabs skeleton */}
    <View className="flex-row border-b" style={{ backgroundColor: cardColor, borderBottomColor: mutedColor + '30' }}>
      {[1,2,3].map(i => (
        <View key={i} className="flex-1 py-4 items-center">
          <SkeletonLoader width={60} height={16} borderRadius={4} mutedColor={mutedColor} />
        </View>
      ))}
    </View>
    
    {/* Content skeleton */}
    <View className="flex-row flex-wrap p-1">
      {[1,2,3,4,5,6,7,8,9,10,11,12].map(i => (
        <View key={i} className="w-1/3 p-1">
          <SkeletonLoader width="100%" height={96} borderRadius={8} mutedColor={mutedColor} />
        </View>
      ))}
    </View>
  </View>
);
