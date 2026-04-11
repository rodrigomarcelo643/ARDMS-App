import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';

interface InfoTabsProps {
  activeTab: 'media' | 'files' | 'links';
  setActiveTab: (tab: 'media' | 'files' | 'links') => void;
  cardColor: string;
  mutedColor: string;
}

export const InfoTabs: React.FC<InfoTabsProps> = ({
  activeTab,
  setActiveTab,
  cardColor,
  mutedColor,
}) => (
  <View className="flex-row border-b" style={{ backgroundColor: cardColor, borderBottomColor: mutedColor + '30' }}>
    {(['media', 'files', 'links'] as const).map((tab) => (
      <TouchableOpacity
        key={tab}
        onPress={() => setActiveTab(tab)}
        className={`flex-1 py-4 items-center ${activeTab === tab ? 'border-b-2' : ''}`}
        style={{ borderBottomColor: activeTab === tab ? '#af1616' : 'transparent' }}
      >
        <Text className={`font-medium ${activeTab === tab ? 'font-bold' : ''}`} style={{ color: activeTab === tab ? '#af1616' : mutedColor }}>
          {tab.charAt(0).toUpperCase() + tab.slice(1)}
        </Text>
      </TouchableOpacity>
    ))}
  </View>
);
