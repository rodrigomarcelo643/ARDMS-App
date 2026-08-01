import React from "react";
import { Image, Text, View } from "react-native";

interface AIHeaderProps {
  cardColor: string;
  textColor: string;
  mutedColor: string;
  borderColor: string;
}

export const AIHeader: React.FC<AIHeaderProps> = ({
  cardColor,
  textColor,
  mutedColor,
  borderColor,
}) => (
  <View
    style={{
      backgroundColor: cardColor,
      paddingHorizontal: 24,
      paddingVertical: 16,
      borderBottomWidth: 1,
      borderBottomColor: borderColor,
    }}
  >
    <View className="flex-row items-center">
      <View className="w-10 h-10 rounded-full items-center justify-center mr-3">
        <Image
          source={require("../../assets/images/chatbot.png")}
          className="w-10 h-10"
        />
      </View>
      <View>
        <Text className="text-xl mt-2 font-extrabold tracking-wide">
                      <Text
                        style={{
                          color: "#af1616",
                          fontWeight: "900",
                          textShadowColor: "rgba(0,0,0,0.3)",
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
                          textShadowColor: "rgba(0,0,0,0.25)",
                          textShadowOffset: { width: 1, height: 1 },
                          textShadowRadius: 2,
                        }}
                      >
                        SIS
                      </Text>
                    </Text>
        <Text style={{ fontSize: 14, color: mutedColor }}>
          Academic Records Support
        </Text>
      </View>
    </View>
  </View>
);
