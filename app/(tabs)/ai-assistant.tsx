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
  Upload,
  X,
} from "lucide-react-native";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  KeyboardAvoidingView,
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
      text: `Hi ${user?.first_name}! I'm your MedSIS AI Assistant. How can I help you with your medical studies, evaluations, calendar, learning materials, or requirements today?`,
      sender: "bot",
      timestamp: new Date(),
    },
  ]);
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [currentContext, setCurrentContext] = useState("general");
  const [inputHeight, setInputHeight] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const typingIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const inputScrollRef = useRef<ScrollView>(null);

  // Initialize services
  useEffect(() => {
    return () => {
      if (typingIntervalRef.current) {
        clearInterval(typingIntervalRef.current);
      }
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
    if (typingIntervalRef.current) {
      clearInterval(typingIntervalRef.current);
      typingIntervalRef.current = null;
    }
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsTyping(false);
    setIsLoading(false);
    setMessages((prev) => {
      const lastMessage = prev[prev.length - 1];
      if (lastMessage && lastMessage.sender === "bot" && lastMessage.isTyping) {
        return prev.map((msg) =>
          msg.id === lastMessage.id ? { ...msg, isTyping: false } : msg,
        );
      }
      return prev;
    });
  };

  const simulateTyping = (fullText: string, messageId: string) => {
    let currentIndex = 0;
    const typingSpeed = 0.5;
    if (typingIntervalRef.current) clearInterval(typingIntervalRef.current);
    setIsTyping(true);
    return new Promise<void>((resolve) => {
      typingIntervalRef.current = setInterval(() => {
        if (currentIndex <= fullText.length) {
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === messageId
                ? {
                    ...msg,
                    text: fullText.substring(0, currentIndex),
                    isTyping: currentIndex < fullText.length,
                  }
                : msg,
            ),
          );
          currentIndex++;
        } else {
          if (typingIntervalRef.current) {
            clearInterval(typingIntervalRef.current);
            typingIntervalRef.current = null;
          }
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === messageId ? { ...msg, isTyping: false } : msg,
            ),
          );
          setIsTyping(false);
          resolve();
        }
      }, typingSpeed);
    });
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
      if (response.data.success)
        return {
          text: response.data.response,
          context: response.data.context || context,
        };
      return {
        text: response.data.message || "Trouble connecting. Try again.",
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
    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText.trim(),
      sender: "user",
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setInputText("");
    setInputHeight(0);
    setIsLoading(true);
    try {
      const response = await getAIResponse(inputText, currentContext);
      if (!response.text) return;
      const botMessageId = (Date.now() + 1).toString();
      const botMessage: Message = {
        id: botMessageId,
        text: "",
        sender: "bot",
        timestamp: new Date(),
        isTyping: true,
        context: response.context,
      };
      setMessages((prev) => [...prev, botMessage]);
      await simulateTyping(response.text, botMessageId);
    } catch (error) {
      Alert.alert("Error", "Failed to get response");
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
      const botMessageId = (Date.now() + 1).toString();
      const botMessage: Message = {
        id: botMessageId,
        text: "",
        sender: "bot",
        timestamp: new Date(),
        isTyping: true,
        context: response.context,
      };
      setMessages((prev) => [...prev, botMessage]);
      await simulateTyping(response.text, botMessageId);
    } catch (error) {
      Alert.alert("Error", "Failed to get response");
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearChat = () => {
    if (messages.length <= 1) return;
    Alert.alert(
      "New Chat",
      "Are you sure you want to clear the conversation and start a new session?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Start New Chat",
          style: "destructive",
          onPress: () => {
            stopGeneration();
            setMessages([
              {
                id: Date.now().toString(),
                text: `Hi ${user?.first_name || 'Student'}! I'm your MedSIS AI Assistant. How can I help you with your academic evaluator, secretary office, semester requirements, grades, or calendar today?`,
                sender: "bot",
                timestamp: new Date(),
              },
            ]);
          },
        },
      ]
    );
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
      const botMessageId = (Date.now() + 1).toString();
      const botMessage: Message = {
        id: botMessageId,
        text: "",
        sender: "bot",
        timestamp: new Date(),
        isTyping: true,
        context: response.context,
      };
      setMessages((prev) => [...prev, botMessage]);
      await simulateTyping(response.text, botMessageId);
    } catch (error) {
      Alert.alert("Error", "Failed to get response");
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
                  <View className="w-10 h-10 rounded-full bg-[#2563EB] items-center justify-center mx-2">
                    <Text className="text-white font-bold text-xs">AI</Text>
                  </View>
                  <View className="bg-gray-100 rounded-2xl rounded-tl-sm px-4 py-3 flex-row items-center">
                    <ActivityIndicator
                      size="small"
                      color="#2563EB"
                      className="mr-2"
                    />
                    <Text className="text-gray-500 text-sm">Thinking...</Text>
                    {isTyping && (
                      <TouchableOpacity
                        onPress={stopGeneration}
                        className="ml-3 bg-gray-200 rounded-full p-1"
                      >
                        <X size={14} color="#666" />
                      </TouchableOpacity>
                    )}
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
    </View>
  );
}
