import { Message, QuickLink } from "@/@types/tabs";
import { API_BASE_URL } from "@/constants/Config";
import { useAuth } from "@/contexts/AuthContext";
import { useThemeColor } from "@/hooks/useThemeColor";
import axios from "axios";
import {
  Bell,
  Calendar,
  ClipboardList,
  FolderOpen,
  RotateCcw,
  Upload,
  X,
} from "lucide-react-native";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

//  components
import { AIHeader } from "@/components/ai-assistant/AIHeader";
import { AIInputArea } from "@/components/ai-assistant/AIInputArea";
import { AIMessageItem } from "@/components/ai-assistant/AIMessageItem";
import { AIQuickLinks } from "@/components/ai-assistant/AIQuickLinks";

export default function AIAssistant() {
  const { user } = useAuth();

  const backgroundColor = useThemeColor({}, "background");
  const textColor = useThemeColor({}, "text");
  const cardColor = useThemeColor({}, "card");
  const mutedColor = useThemeColor({}, "muted");
  const loadColor = useThemeColor({}, "loaderCard");
  const borderColor = useThemeColor({}, "border");

  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      text: `Hi ${user?.first_name || 'Student'}! I'm your MedSIS AI Assistant. How can I help you with your academic evaluator, secretary office, semester requirements, grades, or calendar today?`,
      sender: "bot",
      timestamp: new Date(),
    },
  ]);
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [currentContext, setCurrentContext] = useState("general");
  const [inputHeight, setInputHeight] = useState(0);
  const [showNewChatModal, setShowNewChatModal] = useState(false);

  const flatListRef = useRef<FlatList>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const inputScrollRef = useRef<ScrollView>(null);

  // Initialize services
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  // Quick links data
  const quickLinks: QuickLink[] = [
    {
      id: "1",
      title: "My Requirements",
      description: "Check pending documents to upload",
      icon: Upload,
      color: "#DC2626",
      action: "requirements",
      context: "requirements",
    },
    {
      id: "2",
      title: "Evaluations",
      description: "View your evaluation results & grades",
      icon: ClipboardList,
      color: "#059669",
      action: "evaluations",
      context: "evaluations",
    },
    {
      id: "3",
      title: "Event Calendar",
      description: "Upcoming events and important dates",
      icon: Calendar,
      color: "#D97706",
      action: "calendar",
      context: "calendar",
    },
    {
      id: "4",
      title: "Announcements",
      description: "Latest school announcements",
      icon: Bell,
      color: "#7C3AED",
      action: "announcements",
      context: "announcements",
    },
    {
      id: "5",
      title: "My Folders",
      description: "Browse your uploaded documents",
      icon: FolderOpen,
      color: "#0284C7",
      action: "folders",
      context: "folders",
    },
  ];

  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages]);

  useEffect(() => {
    if (inputHeight > 100 && inputScrollRef.current) {
      inputScrollRef.current.scrollToEnd({ animated: true });
    }
  }, [inputHeight, inputText]);

  const stopGeneration = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsLoading(false);
  };

  const getAIResponse = async (
    message: string,
    context: string = "general",
  ) => {
    if (!user)
      return {
        text: "I need to know who you are to help. Please log in again.",
        context: null,
      };
    try {
      abortControllerRef.current = new AbortController();
      const signal = abortControllerRef.current.signal;
      const response = await axios.post(
        `${API_BASE_URL}/api/ai/ai_integration.php`,
        { user_id: user.id, query: message, context },
        {
          headers: { "Content-Type": "application/json" },
          signal,
          timeout: 30000,
        },
      );
      if (response.data && response.data.success)
        return {
          text: response.data.response,
          context: response.data.context || context,
        };
      return {
        text: response.data?.message || "Trouble connecting. Try again.",
        context: null,
      };
    } catch (error: any) {
      if (error.name === "AbortError") return { text: "", context: null };
      return {
        text: "Technical difficulties. Check connection.",
        context: null,
      };
    } finally {
      abortControllerRef.current = null;
    }
  };

  const handleSend = async () => {
    if (!inputText.trim() || isLoading) return;
    const queryText = inputText.trim();
    const userMessage: Message = {
      id: Date.now().toString(),
      text: queryText,
      sender: "user",
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setInputText("");
    setInputHeight(0);
    setIsLoading(true);
    try {
      const response = await getAIResponse(queryText, currentContext);
      if (!response.text) return;
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: response.text,
        sender: "bot",
        timestamp: new Date(),
        isTyping: false,
        context: response.context,
      };
      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          text: "I'm having a brief issue accessing records. Please try again.",
          sender: "bot",
          timestamp: new Date(),
          isTyping: false,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickLink = async (action: string, context: string) => {
    if (isLoading) return;
    setCurrentContext(context);
    const messagesMap: Record<string, string> = {
      requirements: "What are my pending requirements that I need to upload?",
      evaluations: "Show me my evaluation results and grades.",
      calendar: "What are the upcoming events and important dates on my calendar?",
      announcements: "What are the latest school announcements?",
      folders: "What documents have I uploaded in my folders?",
    };
    const messageText = messagesMap[action] || "I need help with this area.";
    const userMessage: Message = {
      id: Date.now().toString(),
      text: messageText,
      sender: "user",
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);
    try {
      const response = await getAIResponse(messageText, context);
      if (!response.text) return;
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: response.text,
        sender: "bot",
        timestamp: new Date(),
        isTyping: false,
        context: response.context,
      };
      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          text: "I'm having a brief issue accessing records. Please try again.",
          sender: "bot",
          timestamp: new Date(),
          isTyping: false,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearChat = () => {
    if (messages.length <= 1) return;
    setShowNewChatModal(true);
  };

  const confirmNewChat = () => {
    stopGeneration();
    setShowNewChatModal(false);
    setMessages([
      {
        id: Date.now().toString(),
        text: `Hi ${user?.first_name || "Student"}! I'm your MedSIS AI Assistant. How can I help you with your academic evaluator, secretary office, semester requirements, grades, or calendar today?`,
        sender: "bot",
        timestamp: new Date(),
      },
    ]);
  };

  const handleSelectSuggestion = async (text: string) => {
    if (isLoading) return;
    const userMessage: Message = {
      id: Date.now().toString(),
      text,
      sender: "user",
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);
    try {
      const response = await getAIResponse(text, "general");
      if (!response.text) return;
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: response.text,
        sender: "bot",
        timestamp: new Date(),
        isTyping: false,
        context: response.context,
      };
      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          text: "I'm having a brief issue accessing records. Please try again.",
          sender: "bot",
          timestamp: new Date(),
          isTyping: false,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const getUserAvatar = () => {
    if (user?.avatar_data) return user.avatar_data;
    const avatar = user?.avatar_url || user?.avatar;
    if (!avatar) return undefined;
    if (avatar.includes('swu-head') || avatar.includes('swu_header')) return undefined;
    return avatar.startsWith('http') ? avatar : `${API_BASE_URL}/${avatar}`;
  };

  const getUserInitials = () => {
    if (!user) return "U";
    return (
      `${user.first_name?.charAt(0) || ""}${user.last_name?.charAt(0) || ""}`.toUpperCase() ||
      "U"
    );
  };

  const handleInputContentSizeChange = (event: any) => {
    setInputHeight(Math.min(event.nativeEvent.contentSize.height, 120));
  };

  return (
    <View style={{ flex: 1, backgroundColor }}>
      <AIHeader
        cardColor={cardColor}
        textColor={textColor}
        mutedColor={mutedColor}
        borderColor={borderColor}
        onClearChat={handleClearChat}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "padding"}
        style={{ flex: 1 }}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={({ item }) => (
            <AIMessageItem
              item={item}
              userInitials={getUserInitials()}
              userAvatar={getUserAvatar()}
            />
          )}
          keyExtractor={(item) => item.id}
          className="flex-1 px-4 pt-4"
          ListHeaderComponent={
            <AIQuickLinks
              quickLinks={quickLinks}
              textColor={textColor}
              cardColor={cardColor}
              mutedColor={mutedColor}
              isLoading={isLoading}
              onPressLink={handleQuickLink}
              onSelectSuggestion={handleSelectSuggestion}
            />
          }
          ListFooterComponent={
            isLoading ? (
              <View className="flex-row justify-start mb-4">
                <View className="flex-row max-w-[85%]">
                  <View className="w-9 h-9 rounded-full bg-[#af1616] items-center justify-center mx-2">
                    <Text className="text-white font-bold text-xs">AI</Text>
                  </View>
                  <View className="bg-gray-100 dark:bg-gray-800 rounded-2xl rounded-tl-sm px-4 py-3 flex-row items-center">
                    <ActivityIndicator
                      size="small"
                      color="#af1616"
                      style={{ marginRight: 8 }}
                    />
                    <Text className="text-gray-500 dark:text-gray-400 text-sm font-medium">
                      Thinking...
                    </Text>
                    <TouchableOpacity
                      onPress={stopGeneration}
                      className="ml-3 bg-gray-200 dark:bg-gray-700 rounded-full p-1"
                    >
                      <X size={13} color="#666" />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            ) : null
          }
        />

        <AIInputArea
          inputText={inputText}
          setInputText={setInputText}
          isLoading={isLoading}
          inputHeight={inputHeight}
          handleInputContentSizeChange={handleInputContentSizeChange}
          handleSend={handleSend}
          stopGeneration={stopGeneration}
          inputScrollRef={inputScrollRef}
          backgroundColor={backgroundColor}
          textColor={textColor}
          mutedColor={mutedColor}
          loadColor={loadColor}
          borderColor={borderColor}
        />
      </KeyboardAvoidingView>

      {/* Real Custom New Chat Confirmation Modal */}
      <Modal
        visible={showNewChatModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowNewChatModal(false)}
      >
        <View className="flex-1 bg-black/60 justify-center items-center px-6">
          <View
            className="w-full max-w-sm rounded-3xl p-6 shadow-2xl border"
            style={{ backgroundColor: cardColor, borderColor: borderColor }}
          >
            <View className="w-12 h-12 rounded-2xl bg-red-100 dark:bg-red-950/50 items-center justify-center mb-4 self-center">
              <RotateCcw size={24} color="#af1616" />
            </View>
            <Text className="text-lg font-bold text-center mb-2" style={{ color: textColor }}>
              Start New Chat Session?
            </Text>
            <Text className="text-xs text-center text-gray-500 dark:text-gray-400 mb-6 leading-relaxed">
              This will reset your current conversation. You can ask about your evaluator, secretary office, grades, or documents fresh.
            </Text>
            <View className="flex-row gap-3">
              <TouchableOpacity
                onPress={() => setShowNewChatModal(false)}
                className="flex-1 py-3 rounded-xl border border-gray-300 dark:border-gray-700 items-center"
                activeOpacity={0.7}
              >
                <Text className="font-semibold text-sm" style={{ color: mutedColor }}>
                  Cancel
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={confirmNewChat}
                className="flex-1 py-3 rounded-xl bg-[#af1616] items-center shadow-sm"
                activeOpacity={0.8}
              >
                <Text className="font-bold text-sm text-white">
                  New Chat
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}
