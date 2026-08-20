import React, { useEffect, useRef, useState } from 'react';
import { View, Text, Animated, Platform, AppState, LayoutChangeEvent } from 'react-native';
import { WifiOff, AlertTriangle } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNetworkBanner } from '@/contexts/NetworkContext';
import axios from 'axios';

type NetworkStatus = 'connected' | 'slow' | 'offline';

const PING_URL = 'https://clients3.google.com/generate_204';
const SLOW_THRESHOLD_MS = 3000;
const PING_TIMEOUT_MS = 8000;
const CHECK_INTERVAL_MS = 10000;

export default function NetworkStatusBanner() {
  const [status, setStatus] = useState<NetworkStatus>('connected');
  const [visible, setVisible] = useState(false);
  const slideAnim = useRef(new Animated.Value(-100)).current;
  const insets = useSafeAreaInsets();
  const checkTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const prevStatus = useRef<NetworkStatus>('connected');
  const { setBannerHeight } = useNetworkBanner();
  const measuredHeight = useRef(0);

  const checkNetwork = async () => {
    try {
      const start = Date.now();
      const response = await axios.head(PING_URL, {
        timeout: PING_TIMEOUT_MS,
      }).catch(() => null);

      const latency = Date.now() - start;

      if (!response) {
        applyStatus('offline');
      } else if (latency > SLOW_THRESHOLD_MS) {
        applyStatus('slow');
      } else {
        applyStatus('connected');
      }
    } catch {
      applyStatus('offline');
    }
  };

  const applyStatus = (newStatus: NetworkStatus) => {
    if (prevStatus.current === newStatus) return;
    prevStatus.current = newStatus;
    setStatus(newStatus);

    if (newStatus === 'connected') {
      hideBanner();
    } else {
      showBanner();
    }
  };

  const showBanner = () => {
    setVisible(true);
    setBannerHeight(measuredHeight.current || 70);
    Animated.spring(slideAnim, {
      toValue: 0,
      useNativeDriver: true,
      tension: 80,
      friction: 12,
    }).start();
  };

  const hideBanner = () => {
    Animated.timing(slideAnim, {
      toValue: -100,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setVisible(false);
      setBannerHeight(0);
    });
  };

  const onLayout = (e: LayoutChangeEvent) => {
    const height = e.nativeEvent.layout.height;
    measuredHeight.current = height;
    if (visible) {
      setBannerHeight(height);
    }
  };

  useEffect(() => {
    checkNetwork();

    checkTimer.current = setInterval(checkNetwork, CHECK_INTERVAL_MS);

    const appStateListener = AppState.addEventListener('change', (nextState) => {
      if (nextState === 'active') {
        checkNetwork();
      }
    });

    return () => {
      if (checkTimer.current) clearInterval(checkTimer.current);
      appStateListener.remove();
      setBannerHeight(0);
    };
  }, []);

  if (!visible) return null;

  const isOffline = status === 'offline';
  const bgColor = isOffline ? '#DC2626' : '#F59E0B';
  const textMsg = isOffline ? 'No Internet Connection' : 'Slow Network Detected';
  const subMsg = isOffline
    ? 'Please check your connection and try again.'
    : 'Some features may take longer to load.';
  const IconComponent = isOffline ? WifiOff : AlertTriangle;

  return (
    <Animated.View
      onLayout={onLayout}
      style={{
        backgroundColor: bgColor,
        paddingTop: Platform.OS === 'ios' ? insets.top : insets.top + 4,
        transform: [{ translateY: slideAnim }],
        zIndex: 99999,
        elevation: 99999,
      }}
      className="absolute top-0 left-0 right-0 shadow-md"
      pointerEvents="box-none"
    >
      <View className="flex-row items-center px-4 py-2.5">
        <View className="w-8 h-8 rounded-full bg-white/20 justify-center items-center mr-3">
          <IconComponent size={18} color="#FFFFFF" />
        </View>
        <View className="flex-1">
          <Text className="text-white text-sm font-bold tracking-wide">{textMsg}</Text>
          <Text className="text-white/85 text-xs mt-0.5">{subMsg}</Text>
        </View>
        <View
          className="w-2.5 h-2.5 rounded-full ml-2 opacity-80"
          style={{ backgroundColor: isOffline ? '#FCA5A5' : '#FDE68A' }}
        />
      </View>
    </Animated.View>
  );
}
