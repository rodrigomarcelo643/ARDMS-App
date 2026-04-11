import React from 'react';
import { View, ScrollView, ViewStyle } from 'react-native';
import { SkeletonLoaderProps } from '@/@types/tabs';

const SkeletonLoader: React.FC<SkeletonLoaderProps & { loadColor: string; backgroundColor: string }> = ({
  width,
  height,
  borderRadius = 4,
  style = {},
  children,
  loadColor,
  backgroundColor
}) => {
  return (
    <View
      className="mb-2 overflow-hidden"
      style={[{ width, height, borderRadius, backgroundColor: loadColor } as ViewStyle, style]}
    >
      <View
        className="w-full h-full mb-2"
        style={{ opacity: 0.5, backgroundColor: loadColor }}
      >
        {children}
      </View>
    </View>
  );
};

const SkeletonPulse = () => (
  <View
    className="absolute top-0 left-0 mb-2 right-0 bottom-0 bg-gray-300 dark:bg-gray-600 opacity-20"
    style={{ opacity: 0.3 }}
  />
);

interface HomeSkeletonProps {
  backgroundColor: string;
  loadColor: string;
  isLargeWeb: boolean;
}

export const HomeSkeleton: React.FC<HomeSkeletonProps> = ({ backgroundColor, loadColor, isLargeWeb }) => (
  <ScrollView
    style={{ flex: 1, backgroundColor, padding: isLargeWeb ? 16 : 12 }}
    className={isLargeWeb ? "max-w-4xl mx-auto" : ""}
  >
    {/* Welcome Header Skeleton */}
    <View className="flex-row justify-between p-2 items-center mb-4">
      <View className="flex-1">
        <SkeletonLoader width={120} height={16} loadColor={loadColor} backgroundColor={backgroundColor}>
          <SkeletonPulse />
        </SkeletonLoader>
        <SkeletonLoader width={200} height={32} style={{ marginTop: 4 }} loadColor={loadColor} backgroundColor={backgroundColor}>
          <SkeletonPulse />
        </SkeletonLoader>
      </View>
    </View>

    {/* Section Title Skeleton */}
    <View className="mb-6 ml-2">
      <SkeletonLoader width={120} height={24} loadColor={loadColor} backgroundColor={backgroundColor}>
        <SkeletonPulse />
      </SkeletonLoader>
      <SkeletonLoader width={200} height={16} style={{ marginTop: 4 }} loadColor={loadColor} backgroundColor={backgroundColor}>
        <SkeletonPulse />
      </SkeletonLoader>
    </View>

    {/* Quick Links Grid Skeleton */}
    <View className="flex-col">
      {[1, 2, 3, 4].map((item) => (
        <View
          key={item}
          className="mb-4 rounded-2xl overflow-hidden"
          style={{ width: "100%" }}
        >
          <SkeletonLoader width="100%" height={145} borderRadius={16} loadColor={loadColor} backgroundColor={backgroundColor}>
            <SkeletonPulse />
          </SkeletonLoader>
        </View>
      ))}
    </View>
  </ScrollView>
);
