import Skeleton from "@/components/ui/Skeleton";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { useThemeColor } from "@/hooks/useThemeColor";
import { useRouter } from "expo-router";
import { Bell as BellIcon } from "lucide-react-native";
import React from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";

interface TabsHeaderProps {
  isLoading: boolean;
  notificationCount: number;
  messageCount: number;
}

export const TabsHeader = ({
  isLoading,
  notificationCount,
  messageCount,
}: TabsHeaderProps) => {
  const router = useRouter();
  const { theme } = useTheme();
  const { user } = useAuth();

  const backgroundColor = useThemeColor({}, "background");
  const textColor = useThemeColor({}, "text");

  const renderYearStatusBadge = () => {
    if (!user) return null;

    const rawYear = user.year_level_id ? String(user.year_level_id).trim() : "";
    const rawStatus = (user.status || "").trim();
    const yearLevelName = (user.year_level_name || "").trim();

    const yearNumber = rawYear.replace(/[^0-9]/g, "");

    const isGraduating =
      yearNumber === "4" ||
      rawStatus.toLowerCase().includes("graduating") ||
      yearLevelName.toLowerCase().includes("graduating");

    if (isGraduating) {
      const isReg = rawStatus.toLowerCase() === "regular";
      const isIrreg = rawStatus.toLowerCase() === "irregular";
      const subStatus = isReg ? " (Regular)" : isIrreg ? " (Irregular)" : "";

      return (
        <View className="flex-row items-center mt-1 px-2 py-0.5 rounded-sm bg-blue-100 dark:bg-blue-900/40">
          <Text className="text-xs font-semibold text-blue-800 dark:text-blue-300">
            Graduating{subStatus}
          </Text>
        </View>
      );
    }

    const isRegular = rawStatus.toLowerCase() === "regular";
    const isIrregular = rawStatus.toLowerCase() === "irregular";

    const badgeBg = isRegular
      ? "bg-green-100 dark:bg-green-900/40"
      : isIrregular
      ? "bg-red-100 dark:bg-red-900/40"
      : "bg-gray-100 dark:bg-gray-800";

    const badgeTextColor = isRegular
      ? "text-green-800 dark:text-green-300"
      : isIrregular
      ? "text-red-800 dark:text-red-300"
      : "text-gray-800 dark:text-gray-300";

    const yearPrefix = yearNumber ? `Year ${yearNumber}` : yearLevelName || "Year";
    const fullText = `${yearPrefix} ${rawStatus}`.trim();

    return (
      <View className={`flex-row items-center mt-1 px-2 py-0.5 rounded-sm ${badgeBg}`}>
        <Text className={`text-xs font-semibold ${badgeTextColor}`}>
          {fullText || "N/A"}
        </Text>
      </View>
    );
  };

  const renderNotificationBadge = () => {
    if (notificationCount <= 0) return null;

    const displayCount = notificationCount > 99 ? "99+" : notificationCount;

    return (
      <View className="absolute -right-2 -top-1 min-w-[18px] h-[18px] rounded-full bg-red-500 justify-center items-center">
        <Text className="text-xs text-white font-bold px-1">
          {displayCount}
        </Text>
      </View>
    );
  };

  const renderMessageBadge = () => {
    if (messageCount <= 0) return null;

    const displayCount = messageCount > 99 ? "99+" : messageCount;

    return (
      <View className="absolute -right-2 -top-1 min-w-[18px] h-[18px] rounded-full bg-red-500 justify-center items-center">
        <Text className="text-xs text-white font-bold px-1">
          {displayCount}
        </Text>
      </View>
    );
  };

  return (
    <View
      style={{
        backgroundColor,
        borderBottomWidth: 1,
        borderBottomColor: theme === "dark" ? "#374151" : "#e5e7eb",
      }}
      className="flex-row items-center px-4 py-4"
    >
      <View className="flex-row items-center">
        {isLoading ? (
          <Skeleton width={36} height={36} borderRadius={18} />
        ) : (
          <TouchableOpacity
            onPress={() => router.push("/(tabs)/home")}
            className="flex-row items-center"
          >
            <Image
              source={require("@/assets/images/swu_head.png")}
              className="w-9 h-9 mr-2"
            />
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
          </TouchableOpacity>
        )}
      </View>

      <View className="flex-1" />
      <View className="flex-row items-center">
        <TouchableOpacity
          onPress={() => router.push("/screens/messages")}
          className="mr-3 relative"
        >
          {isLoading ? (
            <Skeleton width={24} height={24} borderRadius={12} />
          ) : (
            <>
              <Image
                className="w-7 h-7"
                source={require("@/assets/images/chat_icon_main.png")}
              />
              {renderMessageBadge()}
            </>
          )}
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => router.push("/notifications")}
          className="mr-3 relative"
        >
          {isLoading ? (
            <Skeleton width={24} height={24} borderRadius={12} />
          ) : (
            <>
              <BellIcon size={24} color={textColor} />
              {renderNotificationBadge()}
            </>
          )}
        </TouchableOpacity>
      </View>
      {user && (
        <View className="flex-row items-center ">
          <View className="items-end mr-2">
            <View className="flex-row items-center">
              {user.nationality && (
                <Image
                  source={
                    user.nationality.toLowerCase() === "filipino"
                      ? require("@/assets/images/ph_flag.png")
                      : require("@/assets/images/foreign_flag.png")
                  }
                  className="w-4 h-3 mr-1"
                />
              )}
              <Text
                className="text-xs font-medium"
                style={{ color: textColor }}
              >
                {user.nationality || "N/A"}
              </Text>
            </View>
            {renderYearStatusBadge()}
          </View>
        </View>
      )}
    </View>
  );
};

export default TabsHeader;
