import React from 'react';
import { View, Text, Image, Linking } from 'react-native';
import { File } from 'lucide-react-native';

// File icon component
export const FileIcon = ({ type, fileName }: { type: string; fileName?: string }) => {
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
      return <Image source={require('../../assets/images/pdf.png')} className="w-4 h-4" />;
    case 'word':
      return <Image source={require('../../assets/images/docs.png')} className="w-4 h-4" />;
    case 'png':
      return <Image source={require('../../assets/images/png.png')} className="w-4 h-4" />;
    case 'jpg':
      return <Image source={require('../../assets/images/jpg.png')} className="w-4 h-4" />;
    default:
      return <File size={16} color="#666" />;
  }
};

// Link text component
export const LinkText = ({ text, isMyMessage }: { text: string; isMyMessage: boolean }) => {
  if (text === 'Message removed') {
    return (
      <Text style={{ color: isMyMessage ? '#ffffff' : '#000000', fontStyle: 'italic', fontSize: 14 }}>
        {text}
      </Text>
    );
  }
  const detectLinks = (text: string) => {
    const urlRegex = /(https?:\/\/[^\s]+|www\.[^\s]+|[a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9]\.[a-zA-Z]{2,}[^\s]*)/g;
    return text.split(urlRegex);
  };

  const formatUrl = (url: string): string => {
    if (!url.match(/^https?:\/\//)) {
      return `https://${url}`;
    }
    return url;
  };

  const isUrl = (text: string): boolean => {
    const urlRegex = /(https?:\/\/[^\s]+|www\.[^\s]+|[a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9]\.[a-zA-Z]{2,}[^\s]*)/;
    return urlRegex.test(text);
  };

  const parts = detectLinks(text);

  return (
    <Text className={`text-base ${isMyMessage ? 'text-white' : 'text-gray-800'}`}>
      {parts.map((part, index) => {
        if (isUrl(part)) {
          return (
            <Text
              key={index}
              className={`underline ${isMyMessage ? 'text-blue-200' : 'text-blue-600'}`}
              onPress={() => {
                try {
                  Linking.openURL(formatUrl(part));
                } catch (error) {
                  console.error('Error opening URL:', error);
                }
              }}
            >
              {part}
            </Text>
          );
        }
        return <Text key={index}>{part}</Text>;
      })}
    </Text>
  );
};

// Skeleton Load
export const SkeletonLoader = ({ width, height, borderRadius = 4, mutedColor }: { width: number | string; height: number | string; borderRadius?: number; mutedColor: string }) => {
  return (
    <View
      style={{
        width,
        height,
        borderRadius,
        backgroundColor: mutedColor + '30',
      } as any}
    />
  );
};
