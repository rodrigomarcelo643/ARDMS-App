import React from 'react';
import { View, Text } from 'react-native';
import { Message } from '@/@types/tabs';

interface AIMessageItemProps {
  item: Message;
  userInitials: string;
}

export const AIMessageItem: React.FC<AIMessageItemProps> = ({ item, userInitials }) => (
  <View
    className={`flex-row mb-5 ${item.sender === "user" ? "justify-end" : "justify-start"}`}
  >
    <View
      className={`flex-row max-w-[85%] ${item.sender === "user" ? "flex-row-reverse" : ""}`}
    >
      <View
        className={`w-10 h-10 rounded-full items-center justify-center mx-2 ${
          item.sender === "user" ? "bg-[#8C2323]" : "bg-[#2563EB]"
        }`}
      >
        {item.sender === "user" ? (
          <Text className="text-white font-bold text-xs">
            {userInitials}
          </Text>
        ) : (
          <Text className="text-white font-bold text-xs">AI</Text>
        )}
      </View>
      <View
        className={`rounded-2xl px-4 py-3 ${
          item.sender === "user"
            ? "bg-[#8C2323] rounded-tr-sm"
            : "bg-gray-100 rounded-tl-sm"
        }`}
      >
        <Text
          className={`text-base ${
            item.sender === "user" ? "text-white" : "text-gray-800"
          }`}
        >
          {item.text}
        </Text>
        <Text
          className={`text-xs mt-1 ${
            item.sender === "user" ? "text-[#FFB3B3]" : "text-gray-500"
          }`}
        >
          {item.timestamp.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </Text>
      </View>
    </View>
  </View>
);
