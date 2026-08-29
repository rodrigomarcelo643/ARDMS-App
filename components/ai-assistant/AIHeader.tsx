import React from "react";
import { Image, Text, View, TouchableOpacity } from "react-native";
import { RotateCcw } from "lucide-react-native";

interface AIHeaderProps {
  cardColor: string;
  textColor: string;
  mutedColor: string;
  borderColor: string;
  onClearChat?: () => void;
}

export const AIHeader: React.FC<AIHeaderProps> = ({
  cardColor,
  textColor,
  mutedColor,
  borderColor,
  onClearChat,
}) => (
  <View
    style={{
      backgroundColor: cardColor,
      paddingHorizontal: 20,
      paddingVertical: 14,
      borderBottomWidth: 1,
      borderBottomColor: borderColor,
    }}
  >
    <View className="flex-row items-center justify-between">
      <View className="flex-row items-center">
        <View className="w-10 h-10 rounded-full items-center justify-center mr-3">
          <Image
            source={require("../../assets/images/chatbot.png")}
            className="w-10 h-10"
          />
        </View>
        <View>
          <View className="flex-row items-center">
            <Text
              style={{
                color: "#af1616",
                fontWeight: "900",
                fontSize: 18,
                textShadowColor: "rgba(0,0,0,0.15)",
                textShadowOffset: { width: 1, height: 1 },
                textShadowRadius: 2,
              }}
            >
              Med
            </Text>
            <Text
              style={{
                color: "#16a34a",
                fontWeight: "900",
                fontSize: 18,
                textShadowColor: "rgba(0,0,0,0.15)",
                textShadowOffset: { width: 1, height: 1 },
                textShadowRadius: 2,
              }}
            >
              SIS
            </Text>
            <Text
              style={{
                color: textColor,
                fontWeight: "700",
                fontSize: 18,
                marginLeft: 4,
              }}
            >
              Assistant
            </Text>
          </View>
          <Text style={{ fontSize: 12, color: mutedColor }}>
            SWU School of Medicine Advisor
          </Text>
        </View>
      </View>

      {onClearChat && (
        <TouchableOpacity
          onPress={onClearChat}
          className="flex-row items-center px-2.5 py-1.5 rounded-lg bg-gray-100 dark:bg-gray-800"
          activeOpacity={0.7}
        >
          <RotateCcw size={14} color={mutedColor} style={{ marginRight: 4 }} />
          <Text className="text-xs font-semibold" style={{ color: mutedColor }}>
            New Chat
          </Text>
        </TouchableOpacity>
      )}
    </View>
  </View>
);
