import { markOnboardingDone } from "@/lib/onboardingStorage";
import { Bell, CalendarDays, UserCircle } from "lucide-react-native";
import { useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  FlatList,
  Image,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const { width } = Dimensions.get("window");

const SLIDES = [
  {
    id: "1",
    image: require("@/assets/onboarding_icons/onboarding_document.jpg"),
    wrapper: false,
    size: 200,
    color: "#af1616",
    title: "Document Management",
    description:
      "Upload and manage your academic requirements. ML-powered image quality validation ensures your documents are legible before submission. When you upload your NMAT score report, scores are automatically extracted and made instantly accessible to your evaluator — no manual entry needed."
  },
  {
    id: "2",
    image: require("@/assets/onboarding_icons/onboarding_evaluation.jpg"),
    wrapper: false,
    size: 200,
    color: "#1d4ed8",
    title: "Evaluations",
    description:
      "View your evaluation results history with evaluator e-signatures. Track your academic performance across all year levels.",
  },
  {
    id: "3",
    image: require("@/assets/onboarding_icons/onboarding_chatbot.png"),
    wrapper: false,
    color: "#7c3aed",
    title: "AI Assistant",
    description:
      "Get instant academic support from your AI-powered student assistant. Ask questions and get guidance anytime.",
  },
  {
    id: "4",
    image: require("@/assets/onboarding_icons/onboarding_chat_icon_main.png"),
    wrapper: false,
    size: 90,
    color: "#0891b2",
    title: "Messaging",
    description:
      "Communicate with admin, faculty, and Scretary in real-time. Persistent caching ensures your messages are always available, even on slow networks.",
  },
  {
    id: "5",
    lucideIcons: [Bell, CalendarDays],
    wrapper: true,
    color: "#d97706",
    title: "Notifications & Calendar",
    description:
      "Stay updated with school announcements and push notifications. Get reminders for pending files and requirements you still need to upload, plus academic calendar events aligned to Philippine time."
  },
  {
    id: "6",
    lucideIcons: [UserCircle],
    wrapper: true,
    color: "#15803d",
    title: "Profile & Settings",
    description:
      "Manage your personal and academic information, access learning materials, change your password, and toggle dark/light theme.",
  },
];

interface Props {
  onDone: () => void;
}

export default function OnboardingScreen({ onDone }: Props) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const dotAnims = useRef(
    SLIDES.map((_, i) => new Animated.Value(i === 0 ? 1 : 0))
  ).current;

  const animateDot = (index: number) => {
    dotAnims.forEach((anim, i) => {
      Animated.timing(anim, {
        toValue: i === index ? 1 : 0,
        duration: 250,
        useNativeDriver: false,
      }).start();
    });
  };

  const onMomentumScrollEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const index = Math.round(e.nativeEvent.contentOffset.x / width);
    setCurrentIndex(index);
    animateDot(index);
  };

  const handleNext = () => {
    if (currentIndex < SLIDES.length - 1) {
      const next = currentIndex + 1;
      flatListRef.current?.scrollToIndex({ index: next, animated: true });
      setCurrentIndex(next);
      animateDot(next);
    } else {
      handleFinish();
    }
  };

  const handleFinish = async () => {
    await markOnboardingDone();
    onDone();
  };

  const isLast = currentIndex === SLIDES.length - 1;

  return (
    <View className="flex-1 bg-white">
      <FlatList
        ref={flatListRef}
        data={SLIDES}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.id}
        onMomentumScrollEnd={onMomentumScrollEnd}
        renderItem={({ item }) => (
          <View style={{ width, flex: 1, paddingHorizontal: 40 }}>
            {/* Top half - icon always centered in fixed area */}
            <View style={{ flex: 0.9, justifyContent: "flex-end", alignItems: "center", paddingBottom: 20 }}>
              {item.lucideIcons ? (
                <View
                  style={{
                    width: 160,
                    height: 160,
                    borderRadius: 80,
                    backgroundColor: item.color + "18",
                    justifyContent: "center",
                    alignItems: "center",
                    flexDirection: "row",
                    gap: 8,
                  }}
                >
                  {item.lucideIcons.map((Icon: any, i: number) => (
                    <Icon key={i} size={item.lucideIcons!.length > 1 ? 44 : 64} color={item.color} strokeWidth={1.5} />
                  ))}
                </View>
              ) : (
                <Image
                  source={(item as any).image}
                  style={{ width: (item as any).size ?? 100, height: (item as any).size ?? 100 }}
                  resizeMode="contain"
                />
              )}
            </View>

            {/* Bottom half - text fixed area */}
            <View style={{ flex: 1.1, alignItems: "center", paddingTop: 0 }}>
              <Text
                className="text-2xl font-extrabold text-center"
                style={{ color: "#1f2937" }}
              >
                {item.title}
              </Text>
              <Text className="text-base text-gray-500 text-center mt-4 leading-6">
                {item.description}
              </Text>
            </View>
          </View>
        )}
      />

      {/* Dots */}
      <View className="flex-row justify-center items-center mb-6">
        {SLIDES.map((_, i) => {
          const dotWidth = dotAnims[i].interpolate({
            inputRange: [0, 1],
            outputRange: [8, 22],
          });
          const dotColor = dotAnims[i].interpolate({
            inputRange: [0, 1],
            outputRange: ["#d1d5db", "#af1616"],
          });
          return (
            <Animated.View
              key={i}
              style={{
                width: dotWidth,
                height: 8,
                borderRadius: 4,
                backgroundColor: dotColor,
                marginHorizontal: 4,
              }}
            />
          );
        })}
      </View>

      {/* Buttons */}
      <View className="flex-row justify-between items-center px-8 pb-10">
        <TouchableOpacity onPress={handleFinish}>
          <Text className="text-gray-400 text-base font-medium">Skip</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleNext}
          className="px-8 py-3 rounded-full"
          style={{ backgroundColor: "#af1616" }}
        >
          <Text className="text-white font-bold text-base">
            {isLast ? "Get Started" : "Next"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
