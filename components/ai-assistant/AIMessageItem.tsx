import React, { useState } from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import { Message } from '@/@types/tabs';
import { useRouter } from 'expo-router';
import { ArrowRight, Info, CheckCircle2, XCircle } from 'lucide-react-native';

interface AIMessageItemProps {
  item: Message;
  userInitials: string;
  userAvatar?: string;
}

export const AIMessageItem: React.FC<AIMessageItemProps> = ({ item, userInitials, userAvatar }) => {
  const [avatarError, setAvatarError] = useState(false);
  const router = useRouter();

  const handleLinkPress = (url: string) => {
    const lower = url.toLowerCase();
    if (lower.includes('evaluat')) {
      router.push('/(tabs)/evaluation' as any);
    } else if (lower.includes('folder') || lower.includes('require')) {
      router.push('/(tabs)/folder' as any);
    } else if (lower.includes('calendar') || lower.includes('event')) {
      router.push('/(tabs)/calendar' as any);
    } else if (lower.includes('profile') || lower.includes('setting')) {
      router.push('/(tabs)/profile' as any);
    }
  };

  const renderFormattedBotMessage = (content: string) => {
    const lines = content.split('\n');

    return (
      <View className="space-y-1.5">
        {lines.map((rawLine, idx) => {
          const line = rawLine.trim();
          if (!line) return <View key={idx} className="h-1.5" />;

          // 1. Callout Box (💡 / ℹ️)
          if (line.startsWith('💡') || line.startsWith('ℹ️') || line.startsWith('📌')) {
            const calloutText = line.replace(/^[💡ℹ️📌]\s*/, '');
            return (
              <View
                key={idx}
                className="mt-2 flex-row items-start bg-red-50 border border-red-200 rounded-lg p-2.5"
              >
                <Info size={14} color="#8C2323" style={{ marginTop: 2, marginRight: 6 }} />
                <View className="flex-1">
                  <Text className="text-xs text-red-950 leading-relaxed font-medium">
                    {renderInlineFormatting(calloutText)}
                  </Text>
                </View>
              </View>
            );
          }

          // 2. Section Header (e.g. **Title**)
          if ((line.startsWith('**') && line.endsWith('**')) || (line.startsWith('👨‍⚕️ **') && line.endsWith('**'))) {
            const headerText = line.replace(/^[👨‍⚕️📁📊📋📚📅🏢📢]\s*|\*\*$/g, '').replace(/^\*\*/, '');
            return (
              <View key={idx} className="pt-2 pb-1 border-b border-gray-200 mb-1">
                <Text className="font-bold text-sm text-gray-900">
                  {headerText}
                </Text>
              </View>
            );
          }

          // 3. Bullet Key-Value line (e.g. • **Evaluator Name**: Marcelo Rodrigo)
          const bulletKeyValue = line.match(/^•\s*\*\*(.*?)\*\*:\s*(.*)$/);
          if (bulletKeyValue) {
            const [, key, val] = bulletKeyValue;
            return (
              <View key={idx} className="flex-row items-start py-0.5">
                <Text className="text-xs text-gray-400 mr-1.5">•</Text>
                <Text className="text-xs font-bold text-gray-800 mr-1">{key}:</Text>
                <View className="flex-1">
                  <Text className="text-xs text-gray-700">
                    {renderInlineFormatting(val)}
                  </Text>
                </View>
              </View>
            );
          }

          // 4. Requirement item with check / cross (e.g. • ✅ **PSA** — Uploaded)
          if (line.includes('• ✅') || line.includes('• ❌') || line.includes('• [x]') || line.includes('• [ ]')) {
            const isCompleted = line.includes('✅') || line.includes('[x]');
            return (
              <View key={idx} className="flex-row items-center py-1 bg-white/70 rounded px-2 my-0.5 border border-gray-100">
                {isCompleted ? (
                  <CheckCircle2 size={13} color="#059669" style={{ marginRight: 6 }} />
                ) : (
                  <XCircle size={13} color="#dc2626" style={{ marginRight: 6 }} />
                )}
                <Text className="text-xs text-gray-800 flex-1">
                  {renderInlineFormatting(line.replace(/^•\s*[✅❌\[\]x\s]+/i, ''))}
                </Text>
              </View>
            );
          }

          // General formatted line
          return (
            <Text key={idx} className="text-sm leading-relaxed text-gray-800">
              {renderInlineFormatting(line)}
            </Text>
          );
        })}
      </View>
    );
  };

  const renderInlineFormatting = (text: string) => {
    // Regex matches: [Label](url) OR **bold**
    const parts = text.split(/(\[.*?\]\(.*?\)|\*\*.*?\*\*)/g);

    return parts.map((part, pIdx) => {
      if (!part) return null;

      // Link match: [Label](url)
      const linkMatch = part.match(/^\[(.*?)\]\((.*?)\)$/);
      if (linkMatch) {
        const [, label, url] = linkMatch;
        return (
          <TouchableOpacity
            key={pIdx}
            onPress={() => handleLinkPress(url)}
            className="bg-red-100 px-1.5 py-0.5 rounded flex-row items-center inline"
          >
            <Text className="text-xs font-bold text-[#8C2323] underline">
              {label} <ArrowRight size={10} color="#8C2323" />
            </Text>
          </TouchableOpacity>
        );
      }

      // Bold match: **text**
      const boldMatch = part.match(/^\*\*(.*?)\*\*$/);
      if (boldMatch) {
        return (
          <Text key={pIdx} className="font-bold text-gray-900">
            {boldMatch[1]}
          </Text>
        );
      }

      return <Text key={pIdx}>{part}</Text>;
    });
  };

  return (
    <View className={`flex-row mb-5 ${item.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
      <View className={`flex-row max-w-[88%] ${item.sender === 'user' ? 'flex-row-reverse' : ''}`}>
        <View className="w-9 h-9 rounded-full items-center justify-center mx-2 mt-1">
          {item.sender === 'user' ? (
            userAvatar && !avatarError ? (
              <Image
                source={{ uri: userAvatar }}
                style={{ width: 36, height: 36, borderRadius: 18 }}
                onError={() => setAvatarError(true)}
              />
            ) : (
              <View className="w-9 h-9 rounded-full bg-[#8C2323] items-center justify-center">
                <Text className="text-white font-bold text-xs">{userInitials}</Text>
              </View>
            )
          ) : (
            <Image
              source={require('../../assets/images/chatbot.png')}
              style={{ width: 36, height: 36, borderRadius: 18 }}
            />
          )}
        </View>

        <View
          className={`rounded-2xl px-4 py-3 shadow-sm ${
            item.sender === 'user' ? 'bg-[#8C2323] rounded-tr-sm' : 'bg-gray-100 rounded-tl-sm border border-gray-200/80'
          }`}
        >
          {item.sender === 'user' ? (
            <Text className="text-base text-white">{item.text}</Text>
          ) : (
            renderFormattedBotMessage(item.text)
          )}
          <Text className={`text-[10px] mt-1.5 ${item.sender === 'user' ? 'text-red-200' : 'text-gray-400'}`}>
            {item.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </Text>
        </View>
      </View>
    </View>
  );
};
