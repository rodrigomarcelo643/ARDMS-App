import React from 'react';
import { View, Text, TouchableOpacity, Image, Linking } from 'react-native';
import { File, Link } from 'lucide-react-native';
import { MediaItem, LinkItem } from '@/@types/chat';

const FileIcon = ({ type, fileName }: { type: string; fileName?: string }) => {
  const getFileType = () => {
    if (type === 'image') return 'image';
    if (fileName) {
      const ext = fileName.split('.').pop()?.toLowerCase();
      if (ext === 'pdf') return 'pdf';
      if (ext === 'doc' || ext === 'docx') return 'word';
      if (ext === 'png') return 'png';
      if (ext === 'jpg' || ext === 'jpeg') return 'jpg';
    }
    return 'document';
  };
  
  const fileType = getFileType();
  
  switch (fileType) {
    case 'pdf':
      return <Image source={require('../../assets/images/pdf.png')} className="w-6 h-6" />;
    case 'word':
      return <Image source={require('../../assets/images/docs.png')} className="w-6 h-6" />;
    case 'png':
      return <Image source={require('../../assets/images/png.png')} className="w-6 h-6" />;
    case 'jpg':
      return <Image source={require('../../assets/images/jpg.png')} className="w-6 h-6" />;
    default:
      return <File size={20} color="#666" />;
  }
};

interface InfoItemProps {
  item: MediaItem | LinkItem;
  textColor: string;
  mutedColor: string;
  onImagePress?: (url: string) => void;
}

export const InfoMediaItem: React.FC<InfoItemProps> = ({
  item,
  textColor,
  mutedColor,
  onImagePress,
}) => {
  if ('type' in item && item.type === 'image') {
    return (
      <TouchableOpacity 
        className="w-1/3 p-1"
        onPress={() => onImagePress?.(item.url)}
      >
        <Image source={{ uri: item.url }} className="w-full h-24 rounded-lg" />
      </TouchableOpacity>
    );
  }
  
  if ('type' in item && item.type === 'file') {
    return (
      <TouchableOpacity className="flex-row items-center p-3 border-b" style={{ borderBottomColor: mutedColor + '30' }}>
        <View className="w-10 h-10 rounded-lg bg-gray-100 items-center justify-center mr-3">
          <FileIcon type={item.type} fileName={item.fileName} />
        </View>
        <View className="flex-1">
          <Text className="font-medium" style={{ color: textColor }}>{item.name}</Text>
          <Text className="text-xs" style={{ color: mutedColor }}>
            {item.timestamp.getMonth() + 1}/{item.timestamp.getDate()}/{item.timestamp.getFullYear()}
          </Text>
        </View>
      </TouchableOpacity>
    );
  }

  // Link item
  if ('url' in item && !('type' in item)) {
    return (
      <TouchableOpacity 
        className="flex-row items-center p-3 border-b" 
        style={{ borderBottomColor: mutedColor + '30' }}
        onPress={() => Linking.openURL(item.url)}
      >
        <View className="w-10 h-10 rounded-full bg-blue-500 items-center justify-center mr-3">
          <Link size={20} color="#fff" />
        </View>
        <View className="flex-1">
          <Text className="font-medium text-blue-600" numberOfLines={1}>{item.url}</Text>
          <Text className="text-sm mt-1" style={{ color: textColor }} numberOfLines={2}>{item.text}</Text>
          <Text className="text-xs mt-1" style={{ color: mutedColor }}>
            {item.timestamp.getMonth() + 1}/{item.timestamp.getDate()}/{item.timestamp.getFullYear()}
          </Text>
        </View>
      </TouchableOpacity>
    );
  }

  return null;
};
