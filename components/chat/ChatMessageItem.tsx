import React from 'react';
import { View, Text, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import { MoreVertical, Edit3, Trash2 } from 'lucide-react-native';
import { Message } from '@/@types/screens/messages';
import { FileIcon, LinkText } from './ChatUIElements';

interface ChatMessageItemProps {
  item: Message;
  isMyMessage: boolean;
  avatar?: string;
  name: string;
  cardColor: string;
  textColor: string;
  mutedColor: string;
  highlightedMessageId: string | null;
  selectedMessage: string | null;
  editLoading: boolean;
  unsendingMessage: string | null;
  userOnlineStatus: boolean;
  onSelectMessage: (id: string | null) => void;
  onEditMessage: (item: Message) => void;
  onUnsendMessage: (id: string) => void;
  onImagePress: (url: string) => void;
  getInitials: (name: string) => string;
  canEditMessage: (timestamp: string) => boolean;
  isLastMessage: boolean;
}

export const ChatMessageItem: React.FC<ChatMessageItemProps> = ({
  item,
  isMyMessage,
  avatar,
  name,
  cardColor,
  textColor,
  mutedColor,
  highlightedMessageId,
  selectedMessage,
  editLoading,
  unsendingMessage,
  userOnlineStatus,
  onSelectMessage,
  onEditMessage,
  onUnsendMessage,
  onImagePress,
  getInitials,
  canEditMessage,
  isLastMessage,
}) => (
  <View className="mb-4">
    <View className={`flex-row ${isMyMessage ? 'justify-end' : 'justify-start'}`}>
      {isMyMessage && item.text !== 'Message removed' && (
        <View className="relative">
          <TouchableOpacity
            onPress={() => onSelectMessage(selectedMessage === item.id ? null : item.id)}
            className="mr-2 mt-2 p-1"
          >
            <MoreVertical size={16} color={mutedColor} />
          </TouchableOpacity>
          
          {selectedMessage === item.id && (
            <>
              <TouchableOpacity 
                className="absolute inset-0 w-full h-full"
                style={{ zIndex: 999 }}
                onPress={() => onSelectMessage(null)}
                activeOpacity={1}
              />
              <View className="absolute top-8 right-0 rounded-lg shadow-lg border py-1" style={{ backgroundColor: cardColor, borderColor: mutedColor + '30', minWidth: 100, zIndex: 1000 }}>
                {item.type === 'text' && item.timestamp && canEditMessage(new Date(item.timestamp).toISOString()) && (
                  <TouchableOpacity
                    onPress={() => onEditMessage(item)}
                    className="flex-row items-center px-3 py-2"
                    disabled={editLoading}
                  >
                    {editLoading ? (
                      <ActivityIndicator size={14} color={textColor} />
                    ) : (
                      <Edit3 size={14} color={textColor} />
                    )}
                    <Text className="ml-2 text-sm" style={{ color: textColor }}>Edit</Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity
                  onPress={() => onUnsendMessage(item.id)}
                  className="flex-row items-center px-3 py-2"
                  disabled={unsendingMessage === item.id}
                >
                  {unsendingMessage === item.id ? (
                    <ActivityIndicator size={14} color="#ef4444" />
                  ) : (
                    <Trash2 size={14} color="#ef4444" />
                  )}
                  <Text className="ml-2 text-sm" style={{ color: '#ef4444' }}>Unsend</Text>
                </TouchableOpacity>
              </View>
            </>
          )}
        </View>
      )}
      
      <View className={`flex-row max-w-[80%] ${isMyMessage ? 'flex-row-reverse' : ''}`}>
        {!isMyMessage && (
          <View className="relative mr-2">
            {avatar ? (
              <Image
                source={{ uri: avatar }}
                className="w-8 h-8 rounded-full"
                style={{ backgroundColor: '#af1616' }}
              />
            ) : (
              <View className="w-8 h-8 rounded-full items-center justify-center" style={{ backgroundColor: '#af1616' }}>
                <Text className="text-white font-bold text-xs">
                  {getInitials(name)}
                </Text>
              </View>
            )}
          </View>
        )}
        
        <View className={`rounded-2xl px-4 py-3 ${isMyMessage ? 'bg-blue-500 rounded-br-sm' : 'bg-gray-200 rounded-bl-sm'} ${highlightedMessageId === item.id ? 'border-2 border-yellow-400' : ''}`} style={highlightedMessageId === item.id ? { backgroundColor: isMyMessage ? '#3B82F6' : '#FEF3C7' } : {}}>
          {item.type === 'image' && item.fileUrl && (
            <TouchableOpacity onPress={() => onImagePress(item.fileUrl!)}>
              <Image
                source={{ uri: item.fileUrl }}
                className="w-48 h-36 rounded-lg"
                resizeMode="cover"
              />
            </TouchableOpacity>
          )}
        
          {item.type === 'file' && (
            <TouchableOpacity
              onPress={() => console.log('Opening file:', item.fileUrl)}
              className="flex-row items-center"
            >
              <FileIcon type={item.type} fileName={item.fileName} />
              <Text className={`ml-2 font-medium underline ${isMyMessage ? 'text-white' : 'text-gray-800'}`}>
                {item.fileName || item.text}
              </Text>
            </TouchableOpacity>
          )}
          
          {item.type === 'text' && (
            <LinkText text={item.text} isMyMessage={isMyMessage} />
          )}
          
          <View className="mt-1">
            <Text className={`text-xs ${isMyMessage ? 'text-blue-100' : 'text-gray-500'}`}>
              {(() => {
                const date = new Date(item.timestamp);
                const hours = date.getHours();
                const minutes = date.getMinutes();
                const ampm = hours >= 12 ? 'PM' : 'AM';
                const displayHours = hours % 12 || 12;
                return `${displayHours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')} ${ampm}`;
              })()} 
            </Text>
          </View>
        </View>
      </View>
    </View>
  
    {isMyMessage && isLastMessage && (
      <View className={`flex-row items-center mt-1 justify-end mr-2`}>
        {item.id.startsWith('temp_') ? (
          <View className="flex-row items-center">
            <ActivityIndicator size={10} color={mutedColor} style={{ marginRight: 4 }} />
            <Text className="text-xs" style={{ color: mutedColor }}>Sending...</Text>
          </View>
        ) : item.isSeen ? (
          <View className="flex-row items-center">
            {avatar ? (
              <Image
                source={{ uri: avatar }}
                className="w-4 h-4 rounded-full"
                style={{ backgroundColor: '#af1616' }}
              />
            ) : (
              <View className="w-4 h-4 rounded-full" style={{ backgroundColor: '#af1616' }}>
                <Text className="text-white text-xs font-bold text-center" style={{ fontSize: 8, lineHeight: 16 }}>
                  {getInitials(name).charAt(0)}
                </Text>
              </View>
            )}
          </View>
        ) : (
          <Text className="text-xs" style={{ color: mutedColor }}>
            {userOnlineStatus ? 'Delivered' : 'Sent'}
          </Text>
        )}
      </View>
    )}
  </View>
);
