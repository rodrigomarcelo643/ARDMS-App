import React from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import { Plus, X, Send, CornerUpLeft } from 'lucide-react-native';
import { Message } from '@/@types/screens/messages';

interface ChatInputAreaProps {
  inputText: string;
  setInputText: (text: string) => void;
  editText: string;
  setEditText: (text: string) => void;
  editingMessage: string | null;
  replyingTo?: Message | null;
  onCancelReply?: () => void;
  partnerName?: string;
  currentUserId?: string;
  showAttachments: boolean;
  setShowAttachments: (show: boolean) => void;
  onSendMessage: () => void;
  onEditMessage: () => void;
  onCancelEdit: () => void;
  backgroundColor: string;
  cardColor: string;
  mutedColor: string;
  textColor: string;
  hasThreeButtonNav: boolean;
  insetsBottom: number;
  isGestureNav: boolean;
  keyboardVisible: boolean;
}

export const ChatInputArea: React.FC<ChatInputAreaProps> = ({
  inputText,
  setInputText,
  editText,
  setEditText,
  editingMessage,
  replyingTo,
  onCancelReply,
  partnerName,
  currentUserId,
  showAttachments,
  setShowAttachments,
  onSendMessage,
  onEditMessage,
  onCancelEdit,
  backgroundColor,
  cardColor,
  mutedColor,
  textColor,
  hasThreeButtonNav,
  insetsBottom,
  isGestureNav,
  keyboardVisible,
}) => (
  <View
    className="border-t"
    style={{ 
      backgroundColor, 
      borderTopColor: mutedColor + '30',
      paddingBottom: hasThreeButtonNav ? insetsBottom : isGestureNav ? 8 : 0,
      transform: [{ translateY: keyboardVisible ? -270 : 0 }]
    }}
  >
    {/* Replying To Banner */}
    {replyingTo && (
      <View
        className="flex-row items-center justify-between px-4 py-2 border-b"
        style={{ backgroundColor: cardColor, borderBottomColor: mutedColor + '20' }}
      >
        <View className="flex-row items-center flex-1 mr-2">
          <CornerUpLeft size={16} color="#af1616" className="mr-2" />
          <View className="w-1 h-7 bg-[#af1616] rounded-full mr-2" />
          <View className="flex-1">
            <Text className="text-xs font-bold text-[#af1616]">
              Replying to {replyingTo.senderId === currentUserId ? 'yourself' : (partnerName || 'User')}
            </Text>
            <Text className="text-xs text-gray-500" numberOfLines={1}>
              {replyingTo.type === 'image'
                ? '📷 Photo'
                : replyingTo.type === 'file'
                  ? `📎 ${replyingTo.fileName || 'Document'}`
                  : replyingTo.text}
            </Text>
          </View>
        </View>
        <TouchableOpacity
          onPress={onCancelReply}
          className="p-1 rounded-full bg-gray-200"
        >
          <X size={14} color="#4b5563" />
        </TouchableOpacity>
      </View>
    )}

    {/* Input Row */}
    <View className="flex-row items-end px-4 py-3">
      <TouchableOpacity
        onPress={() => setShowAttachments(!showAttachments)}
        className="mr-2"
      >
        <View className="w-10 h-10 rounded-full items-center justify-center" style={{ backgroundColor: '#af1616' }}>
          {showAttachments ? (
            <X size={20} color="#fff" />
          ) : (
            <Plus size={20} color="#fff" />
          )}
        </View>
      </TouchableOpacity>
      
      {editingMessage ? (
        <View className="flex-1 flex-row items-center rounded-full px-4 py-0 border" style={{ backgroundColor: cardColor, borderColor: mutedColor + '30' }}>
          <TextInput
            style={{ color: textColor, fontSize: 16, flex: 1, maxHeight: 100 }}
            placeholder="Edit message..."
            placeholderTextColor={mutedColor}
            value={editText}
            onChangeText={setEditText}
            multiline
          />
          <TouchableOpacity onPress={onEditMessage} className="ml-2">
            <Text style={{ color: '#3B82F6' }}>Save</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={onCancelEdit} className="ml-2">
            <Text style={{ color: mutedColor }}>Cancel</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View className="flex-1 rounded-[20px] px-4 py-0 border" style={{ backgroundColor: cardColor, borderColor: mutedColor + '30' }}>
          <TextInput
            style={{ color: textColor, fontSize: 16, maxHeight: 100 }}
            placeholder="Type a message..."
            placeholderTextColor={mutedColor}
            value={inputText}
            onChangeText={setInputText}
            multiline
          />
        </View>
      )}
      
      {!editingMessage && (
        <TouchableOpacity
          onPress={onSendMessage}
          disabled={!inputText.trim()}
          className="ml-2 p-2 rounded-full"
          style={{ backgroundColor: '#af1616', opacity: inputText.trim() ? 1 : 0.5 }}
        >
          <Send size={20} color="#fff" />
        </TouchableOpacity>
      )}
    </View>
  </View>
);
