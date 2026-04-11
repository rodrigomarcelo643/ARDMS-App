import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Image as ImageIcon, File } from 'lucide-react-native';

interface ChatAttachmentsProps {
  onPickImage: () => void;
  onPickDocument: () => void;
  cardColor: string;
  textColor: string;
  mutedColor: string;
}

export const ChatAttachments: React.FC<ChatAttachmentsProps> = ({
  onPickImage,
  onPickDocument,
  cardColor,
  textColor,
  mutedColor,
}) => (
  <View className="px-6 py-5 border-t" style={{ backgroundColor: cardColor, borderTopColor: mutedColor + '20' }}>
    <View className="flex-row justify-center items-center">
      <TouchableOpacity
        onPress={onPickImage}
        className="items-center flex-1"
        activeOpacity={0.7}
      >
        <View className="w-16 h-16 rounded-2xl items-center justify-center mb-3 shadow-lg" style={{ backgroundColor: '#10B981', elevation: 8 }}>
          <ImageIcon size={28} color="#fff" />
        </View>
        <Text className="text-sm font-medium" style={{ color: textColor }}>Gallery</Text>
        <Text className="text-xs mt-1" style={{ color: mutedColor }}>Photos & Images</Text>
      </TouchableOpacity>
      
      <View className="w-px h-20 mx-4" style={{ backgroundColor: mutedColor + '30' }} />
      
      <TouchableOpacity
        onPress={onPickDocument}
        className="items-center flex-1"
        activeOpacity={0.7}
      >
        <View className="w-16 h-16 rounded-2xl items-center justify-center mb-3 shadow-lg" style={{ backgroundColor: '#3B82F6', elevation: 8 }}>
          <File size={28} color="#fff" />
        </View>
        <Text className="text-sm font-medium" style={{ color: textColor }}>Document</Text>
        <Text className="text-xs mt-1" style={{ color: mutedColor }}>Files & PDFs</Text>
      </TouchableOpacity>
    </View>
  </View>
);
