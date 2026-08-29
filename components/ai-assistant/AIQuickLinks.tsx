import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { QuickLink } from '@/@types/tabs';
import { Sparkles, UserCheck, User, FileText, Plus, Calendar } from 'lucide-react-native';

export interface SuggestionItem {
  text: string;
  iconName?: string;
}

interface AIQuickLinksProps {
  quickLinks: QuickLink[];
  textColor: string;
  cardColor: string;
  mutedColor?: string;
  isLoading: boolean;
  onPressLink: (action: string, context: string) => void;
  onSelectSuggestion?: (text: string) => void;
}

const defaultSuggestions = [
  { text: 'Who is my academic evaluator?', icon: UserCheck },
  { text: 'Who is the current secretary?', icon: User },
  { text: 'Show my semester requirements', icon: Sparkles },
  { text: 'Check my current grades', icon: FileText },
  { text: 'How do I request an evaluation?', icon: Plus },
  { text: 'What are the latest announcements?', icon: Calendar },
];

export const AIQuickLinks: React.FC<AIQuickLinksProps> = ({ 
  quickLinks, 
  textColor, 
  cardColor, 
  mutedColor = '#6b7280',
  isLoading, 
  onPressLink,
  onSelectSuggestion,
}) => (
  <View className="mb-4">
    {/* Suggestions Horizontal Chips */}
    <View className="mb-4">
      <Text style={{ fontSize: 13, fontWeight: '700', color: mutedColor, marginBottom: 8, paddingHorizontal: 4, textTransform: 'uppercase', letterSpacing: 0.5 }}>
        Suggested Inquiries
      </Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 2 }}
      >
        {defaultSuggestions.map((sug, idx) => {
          const IconComp = sug.icon;
          return (
            <TouchableOpacity
              key={idx}
              onPress={() => onSelectSuggestion && onSelectSuggestion(sug.text)}
              disabled={isLoading}
              className="flex-row items-center bg-white dark:bg-gray-800 rounded-full px-3.5 py-2 mr-2 border border-red-200/80 shadow-xs"
              activeOpacity={0.7}
            >
              <IconComp size={13} color="#af1616" style={{ marginRight: 6 }} />
              <Text className="text-xs font-semibold text-gray-800 dark:text-gray-200">
                {sug.text}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>

    {/* Quick Access Cards */}
    <View>
      <Text style={{ fontSize: 13, fontWeight: '700', color: mutedColor, marginBottom: 8, paddingHorizontal: 4, textTransform: 'uppercase', letterSpacing: 0.5 }}>
        Quick Services
      </Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 2 }}
      >
        {quickLinks.map((link) => {
          const IconComponent = link.icon;
          return (
            <TouchableOpacity
              key={link.id}
              className="rounded-xl p-3 mr-2.5 shadow-xs border border-gray-200/80 w-36"
              onPress={() => onPressLink(link.action, link.context)}
              style={{ backgroundColor: cardColor }}
              disabled={isLoading}
              activeOpacity={0.8}
            >
              <View
                className="w-8 h-8 rounded-lg items-center justify-center mb-2"
                style={{ backgroundColor: link.color }}
              >
                <IconComponent size={16} color="#fff" />
              </View>
              <Text className="font-bold text-xs mb-0.5" style={{ color: textColor }} numberOfLines={1}>
                {link.title}
              </Text>
              <Text className="text-[10px] text-gray-500 leading-snug" numberOfLines={2}>
                {link.description}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  </View>
);
