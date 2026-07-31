import { HapticTab } from "@/components/HapticTab";
import { TabsHeader } from "@/components/TabsHeader";
import { Skeleton } from "@/components/ui/Skeleton";
import TabBarBackground from "@/components/ui/TabBarBackground";
import { API_BASE_URL } from "@/constants/Config";
import { useAuth } from "@/contexts/AuthContext";
import { useNetworkBanner } from "@/contexts/NetworkContext";
import { useTheme } from "@/contexts/ThemeContext";
import { useNavigationMode } from "@/hooks/useNavigationMode";
import { useThemeColor } from "@/hooks/useThemeColor";
import { registerForPushNotifications, showLocalNotification } from "@/services/notificationService";
import { registerForPushNotificationsAsync, savePushTokenToServer } from "@/services/pushNotificationService";
import { messageService } from "@/services/messageService";
import axios from "axios";
import { Audio } from "expo-av";
import { Tabs, useRouter, useSegments } from "expo-router";
import {
  ClipboardList,
  Folder as FolderIcon,
  Home as HomeIcon,
  User as UserIcon,
} from "lucide-react-native";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Easing,
  Image,
  Platform,
  StatusBar,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import Reanimated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

export default function TabLayout() {
  const router = useRouter();
  const segments = useSegments();
  const { theme } = useTheme();
  const { hasThreeButtonNav, insets } = useNavigationMode();
  const { isBannerVisible, bannerHeight } = useNetworkBanner();

  // Theme Change
  const cardColor = useThemeColor({}, "card");

  const tintColor = "#be2e2e";
  const { width } = useWindowDimensions();
  const [isLoading, setIsLoading] = useState(true);
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const { user, refreshUser } = useAuth();
  const [notificationCount, setNotificationCount] = useState(0);
  const [messageCount, setMessageCount] = useState(0);
  const [isFirstFetch, setIsFirstFetch] = useState(true);
  const [isFirstMessageFetch, setIsFirstMessageFetch] = useState(true);
  const soundRef = useRef<Audio.Sound | null>(null);
  const [prevNotificationCount, setPrevNotificationCount] = useState(0);
  const [prevMessageCount, setPrevMessageCount] = useState(0);
  const soundPlayingRef = useRef(false);

  const isWeb = Platform.OS === "web";
  const iconSize = 26;
  // Track header visibility
  const [showHeader, setShowHeader] = useState(true);

  // Debug logging
  console.log(
    "hasThreeButtonNav:",
    hasThreeButtonNav,
    "insets.bottom:",
    insets.bottom,
    "Platform.OS:",
    Platform.OS,
  );

  // Calculate tab bar padding and styling based on navigation mode (same for iOS and Android)
  const tabBarPadding = hasThreeButtonNav ? 40 : 35;
  const tabBarBottomOffset = hasThreeButtonNav ? insets.bottom : 4;

  // Load notification sound
  useEffect(() => {
    const loadSound = async () => {
      try {
        const { sound } = await Audio.Sound.createAsync(
          require("@/assets/sounds/notification_sound.mp3"),
        );
        soundRef.current = sound;
      } catch (error) {
        console.error("Error loading notification sound:", error);
      }
    };

    loadSound();

    return () => {
      if (soundRef.current) {
        soundRef.current.unloadAsync();
      }
    };
  }, []);

  // Play notification sound when count increases (with debouncing)
  const playNotificationSound = async () => {
    try {
      if (soundRef.current && !soundPlayingRef.current) {
        soundPlayingRef.current = true;
        await soundRef.current.replayAsync();
        // Reset flag after sound duration (assuming 2 seconds)
        setTimeout(() => {
          soundPlayingRef.current = false;
        }, 2000);
      }
    } catch (error) {
      console.error("Error playing notification sound:", error);
      soundPlayingRef.current = false;
    }
  };

  // Track known notification and announcement IDs to trigger local OS notifications when new items arrive
  const isFetchingNotification = useRef(false);
  const isFetchingMessage = useRef(false);
  const isFetchingAnnouncement = useRef(false);

  const knownNotificationIds = useRef<Set<string | number>>(new Set());
  const knownAnnouncementIds = useRef<Set<string | number>>(new Set());
  const knownChatMessageKeys = useRef<Set<string>>(new Set());
  const isFirstNotificationFetch = useRef(true);
  const isFirstAnnouncementFetch = useRef(true);
  const isFirstMsgFetch = useRef(true);

  useEffect(() => {
    if (!user?.id) return;

    // Register push token for OS remote push notifications on backend
    registerForPushNotifications(Number(user.id)).catch(() => {});
    registerForPushNotificationsAsync().then((token) => {
      if (token && user?.id) {
        savePushTokenToServer(String(user.id), token);
      }
    }).catch(() => {});

    const fetchNotificationCheck = async () => {
      if (isFetchingNotification.current) return;
      isFetchingNotification.current = true;

      try {
        const response = await axios.get(
          `${API_BASE_URL}/api/get_student_notifications.php?user_id=${user.id}`,
          {
            timeout: 8000,
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
            },
          },
        );

        const data = response.data;
        if (data.success && Array.isArray(data.notifications)) {
          const unreadNotifications = data.notifications.filter(
            (n: { status?: string }) => n.status !== "read",
          );
          setNotificationCount(unreadNotifications.length);

          if (isFirstNotificationFetch.current) {
            // First load: store existing IDs without triggering notifications
            data.notifications.forEach((n: { id: string | number }) => {
              if (n.id) knownNotificationIds.current.add(String(n.id));
            });
            isFirstNotificationFetch.current = false;
          } else {
            // Subsequent loads: find newly arrived notifications
            let hasNewItem = false;
            for (const notif of data.notifications) {
              const idStr = String(notif.id);
              if (notif.id && !knownNotificationIds.current.has(idStr)) {
                knownNotificationIds.current.add(idStr);
                hasNewItem = true;

                // Trigger OS Device Notification
                showLocalNotification(
                  notif.title || "New Notification",
                  notif.message || "You have a new notification from MedSIS",
                  { type: notif.type || "notification", id: notif.id },
                );
              }
            }
            if (hasNewItem) {
              playNotificationSound();
            }
          }
        }
      } catch (error: unknown) {
        const err = error as { response?: { status?: number }; message?: string };
        console.warn(
          `[Notification Check] ${err.message || "Error"} ${err.response?.status ? `(Status: ${err.response.status})` : ""}`,
        );
      } finally {
        isFetchingNotification.current = false;
      }
    };

    const fetchAnnouncementCheck = async () => {
      if (isFetchingAnnouncement.current) return;
      isFetchingAnnouncement.current = true;

      try {
        const response = await axios.get(
          `${API_BASE_URL}/api/get_student_announcements.php`,
          {
            params: {
              user_id: user.id,
              year_level: user.year_level_id || "all",
            },
            timeout: 8000,
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
            },
          },
        );

        const data = response.data;
        if (data.success && Array.isArray(data.announcements)) {
          if (isFirstAnnouncementFetch.current) {
            // First load: store existing IDs without triggering notifications
            data.announcements.forEach((a: { id: string | number }) => {
              if (a.id) knownAnnouncementIds.current.add(String(a.id));
            });
            isFirstAnnouncementFetch.current = false;
          } else {
            // Subsequent loads: find newly posted announcements
            let hasNewAnnouncement = false;
            for (const ann of data.announcements) {
              const idStr = String(ann.id);
              if (ann.id && !knownAnnouncementIds.current.has(idStr)) {
                knownAnnouncementIds.current.add(idStr);
                hasNewAnnouncement = true;

                // Trigger OS Device Notification for New Announcement
                const titleText = ann.title ? `📢 ${ann.title}` : "📢 New Announcement";
                const bodyText = ann.content || ann.message || "A new announcement has been posted.";

                showLocalNotification(titleText, bodyText, {
                  type: "announcement",
                  id: ann.id,
                });
              }
            }
            if (hasNewAnnouncement) {
              playNotificationSound();
            }
          }
        }
      } catch (error: unknown) {
        const err = error as { message?: string };
        console.warn(`[Announcement Check Error]: ${err.message || "Error"}`);
      } finally {
        isFetchingAnnouncement.current = false;
      }
    };

    const fetchMessageCountCheck = async () => {
      if (isFetchingMessage.current) return;
      isFetchingMessage.current = true;

      try {
        const { users: conversations } = await messageService.getConversations(String(user.id));
        const totalUnread = conversations.reduce((acc: number, c: { unreadCount?: number }) => acc + (c.unreadCount || 0), 0);
        setMessageCount(totalUnread);

        if (isFirstMsgFetch.current) {
          conversations.forEach((c: { id?: string | number; lastMessageTimestamp?: string; lastMessage?: string }) => {
            const key = `${c.id}_${c.lastMessageTimestamp || c.lastMessage}`;
            knownChatMessageKeys.current.add(key);
          });
          isFirstMsgFetch.current = false;
        } else {
          let hasNewMessage = false;
          for (const conv of conversations) {
            const key = `${conv.id}_${conv.lastMessageTimestamp || conv.lastMessage}`;
            if ((conv.unreadCount || 0) > 0 && !knownChatMessageKeys.current.has(key)) {
              knownChatMessageKeys.current.add(key);
              hasNewMessage = true;

              const senderName = conv.name || "New Chat Message";
              const messageText = conv.lastMessage || "Sent you a message";

              // Trigger OS Device Notification for New Chat Message
              showLocalNotification(`💬 ${senderName}`, messageText, {
                type: "chat",
                chatId: conv.unique_key || conv.id,
                name: conv.name,
              });
            }
          }
          if (hasNewMessage) {
            playNotificationSound();
          }
        }
      } catch (error: unknown) {
        const err = error as { message?: string };
        console.warn(`[Message Count Fetch] ${err.message || "Error"}`);
      } finally {
        isFetchingMessage.current = false;
      }
    };

    // Initial check
    fetchNotificationCheck();
    fetchAnnouncementCheck();
    fetchMessageCountCheck();
    refreshUser();

    // Poll every 5 seconds for live notifications, announcements, and messages
    const intervalId = setInterval(() => {
      fetchNotificationCheck();
      fetchAnnouncementCheck();
      fetchMessageCountCheck();
      refreshUser();
    }, 5000);

    return () => clearInterval(intervalId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  useEffect(() => {
    const currentRoute = segments[segments.length - 1]; // get last active tab
    if (currentRoute === "ai-assistant" || currentRoute === "profile") {
      setShowHeader(false);
    } else {
      setShowHeader(true);
    }
  }, [segments]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }).start();
    }, 1000);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleAIPress = () => {
    router.push("/ai-assistant");
  };

  // === Animated Underline & Highlight ===
  const underlineX = useSharedValue(0);
  const highlightX = useSharedValue(0);
  const tabWidth = width / 5;

  const underlineStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: underlineX.value }],
  }));

  const highlightStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: highlightX.value }],
  }));

  return (
    <GestureHandlerRootView className="flex-1">
      <View className="flex-1" style={isBannerVisible ? { paddingTop: bannerHeight } : undefined}>
        {!isWeb && !isBannerVisible && (
          <View
            style={{ height: StatusBar.currentHeight, backgroundColor: "#fff" }}
          />
        )}

        {showHeader && (
          <TabsHeader
            isLoading={isLoading}
            notificationCount={notificationCount}
            messageCount={messageCount}
          />
        )}

        <View className="flex-1">
          <Tabs
            screenOptions={{
              headerShown: false,
              tabBarStyle: {
                height: hasThreeButtonNav ? 80 + insets.bottom : 80,
                paddingBottom: hasThreeButtonNav
                  ? tabBarPadding + insets.bottom
                  : tabBarPadding,
                paddingTop: 8,
                position: "relative",
              },
              tabBarButton: HapticTab,
              tabBarBackground: TabBarBackground,
              tabBarLabelStyle: {
                fontSize: 12,
                marginBottom: 0,
                marginTop: 4,
              },
              tabBarActiveTintColor: tintColor,
              tabBarInactiveTintColor: theme === "dark" ? "#9BA1A6" : "#687076",
            }}
            screenListeners={{
              state: (e) => {
                const index = e.data.state.index;
                underlineX.value = withTiming(index * tabWidth, {
                  duration: 350,
                });
                highlightX.value = withTiming(index * tabWidth, {
                  duration: 350,
                });
              },
            }}
          >
            <Tabs.Screen
              name="home"
              options={{
                title: "Home",
                tabBarIcon: ({ color }) =>
                  isLoading ? (
                    <Skeleton width={26} height={26} borderRadius={13} />
                  ) : (
                    <HomeIcon size={iconSize} color={color} />
                  ),
              }}
            />
            <Tabs.Screen
              name="folder"
              options={{
                title: "Folder",
                tabBarIcon: ({ color }) =>
                  isLoading ? (
                    <Skeleton width={26} height={26} borderRadius={13} />
                  ) : (
                    <FolderIcon size={iconSize} color={color} />
                  ),
              }}
            />
            <Tabs.Screen
              name="ai-assistant"
              options={{
                title: "",
                tabBarIcon: ({ focused }) =>
                  isLoading ? (
                    <Skeleton width={62} height={62} borderRadius={31} />
                  ) : (
                    <TouchableOpacity
                      className="w-[60px] h-[60px] rounded-full justify-center  items-center "
                      style={{
                        backgroundColor: focused ? cardColor : cardColor,
                        borderWidth: 1,
                        borderColor: focused ? "#d66d6d5d" : "#d66d6d5d",
                        shadowColor: "",
                        shadowOffset: { width: 2, height: 2 },
                        shadowOpacity: 0.25,
                        shadowRadius: 4,
                      }}
                      onPress={handleAIPress}
                    >
                      <Image
                        source={require("../../assets/images/chatbot.png")}
                        className=" w-[60px] h-[60px] relative -left-1 top-1"
                      />
                    </TouchableOpacity>
                  ),
              }}
              listeners={{
                tabPress: (e) => {
                  e.preventDefault();
                  handleAIPress();
                },
              }}
            />
            <Tabs.Screen
              name="evaluations"
              options={{
                title: "Evaluation",
                tabBarIcon: ({ color }) =>
                  isLoading ? (
                    <Skeleton width={26} height={26} borderRadius={13} />
                  ) : (
                    <ClipboardList size={iconSize} color={color} />
                  ),
              }}
            />
            <Tabs.Screen
              name="profile"
              options={{
                title: "Profile",
                tabBarIcon: ({ color }) =>
                  isLoading ? (
                    <Skeleton width={26} height={26} borderRadius={13} />
                  ) : (
                    <UserIcon size={iconSize} color={color} />
                  ),
              }}
            />
          </Tabs>

          {/* Highlight background behind active tab */}
          <Reanimated.View
            style={[
              {
                position: "absolute",
                bottom: tabBarBottomOffset + 8,
                left: 0,
                width: tabWidth,
                height: 60,
                borderRadius: 10,
                backgroundColor: "rgba(140, 35, 35, 0.08)",
              },
              highlightStyle,
            ]}
          />

          {/* Underline (closer to text) */}
          <Reanimated.View
            style={[
              {
                position: "absolute",
                bottom: tabBarBottomOffset + 4,
                left: 0,
                width: tabWidth * 0.5,
                height: 3,
                marginLeft: tabWidth * 0.25,
                backgroundColor: tintColor,
                borderRadius: 3,
              },
              underlineStyle,
            ]}
          />
        </View>
      </View>
    </GestureHandlerRootView>
  );
}
