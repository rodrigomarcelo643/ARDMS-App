import { useThemeColor } from '@/hooks/useThemeColor';
import { AlertTriangle, FileQuestion, RefreshCw, ServerCrash, WifiOff } from 'lucide-react-native';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

type ErrorType = 'network' | 'server' | 'empty' | 'generic';

interface ErrorDisplayProps {
  /** Type of error to display */
  type?: ErrorType;
  /** Custom title override */
  title?: string;
  /** Custom message override */
  message?: string;
  /** Retry callback — shows retry button when provided */
  onRetry?: () => void;
  /** Custom retry button label */
  retryLabel?: string;
  /** Compact mode — smaller layout for inline use */
  compact?: boolean;
}

const ERROR_CONFIG: Record<ErrorType, { icon: React.ElementType; title: string; message: string; color: string; bgColor: string }> = {
  network: {
    icon: WifiOff,
    title: 'No Internet Connection',
    message: 'Please check your network connection and try again.',
    color: '#EF4444',
    bgColor: '#FEF2F2',
  },
  server: {
    icon: ServerCrash,
    title: 'Server Error',
    message: 'Something went wrong on our end. Please try again later.',
    color: '#F59E0B',
    bgColor: '#FFFBEB',
  },
  empty: {
    icon: FileQuestion,
    title: 'No Data Available',
    message: 'There is nothing to show here right now.',
    color: '#6B7280',
    bgColor: '#F9FAFB',
  },
  generic: {
    icon: AlertTriangle,
    title: 'Something Went Wrong',
    message: 'An unexpected error occurred. Please try again.',
    color: '#EF4444',
    bgColor: '#FEF2F2',
  },
};

/**
 * Detects the error type from an Error object or string.
 */
export function detectErrorType(error: unknown): ErrorType {
  const msg = error instanceof Error ? error.message.toLowerCase() : String(error).toLowerCase();

  if (
    msg.includes('network') ||
    msg.includes('fetch') ||
    msg.includes('timeout') ||
    msg.includes('internet') ||
    msg.includes('aborted') ||
    msg.includes('dns')
  ) {
    return 'network';
  }

  if (
    msg.includes('500') ||
    msg.includes('502') ||
    msg.includes('503') ||
    msg.includes('server')
  ) {
    return 'server';
  }

  return 'generic';
}

export default function ErrorDisplay({
  type = 'generic',
  title,
  message,
  onRetry,
  retryLabel = 'Try Again',
  compact = false,
}: ErrorDisplayProps) {
  const textColor = useThemeColor({}, 'text');
  const mutedColor = useThemeColor({}, 'muted');
  const cardColor = useThemeColor({}, 'card');

  const config = ERROR_CONFIG[type];
  const Icon = config.icon;
  const displayTitle = title || config.title;
  const displayMessage = message || config.message;

  if (compact) {
    return (
      <View
        className="flex-row items-center mx-4 my-2 p-3 rounded-sm"
        style={{ backgroundColor: config.bgColor }}
      >
        <View
          className="w-8 h-8 rounded-full items-center justify-center mr-3"
          style={{ backgroundColor: config.color + '20' }}
        >
          <Icon size={16} color={config.color} />
        </View>
        <View className="flex-1">
          <Text className="text-sm font-semibold" style={{ color: config.color }}>
            {displayTitle}
          </Text>
          <Text className="text-xs mt-0.5" style={{ color: mutedColor }}>
            {displayMessage}
          </Text>
        </View>
        {onRetry && (
          <TouchableOpacity
            onPress={onRetry}
            className="ml-2 px-3 py-1.5 rounded-sm"
            style={{ backgroundColor: config.color + '15' }}
          >
            <RefreshCw size={14} color={config.color} />
          </TouchableOpacity>
        )}
      </View>
    );
  }

  return (
    <View className="flex-1 justify-center items-center px-8 py-12">
      {/* Icon circle */}
      <View
        className="w-20 h-20 rounded-full items-center justify-center mb-5"
        style={{ backgroundColor: config.bgColor }}
      >
        <Icon size={36} color={config.color} />
      </View>

      {/* Title */}
      <Text
        className="text-lg font-bold text-center mb-2"
        style={{ color: textColor }}
      >
        {displayTitle}
      </Text>

      {/* Message */}
      <Text
        className="text-sm text-center leading-5 mb-6 max-w-[280px]"
        style={{ color: mutedColor }}
      >
        {displayMessage}
      </Text>

      {/* Retry button */}
      {onRetry && (
        <TouchableOpacity
          onPress={onRetry}
          className="flex-row items-center px-6 py-3 rounded-sm"
          style={{ backgroundColor: config.color }}
          activeOpacity={0.8}
        >
          <RefreshCw size={16} color="#FFFFFF" />
          <Text className="text-white text-sm font-semibold ml-2">
            {retryLabel}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

/**
 * Inline banner variant for showing errors at the top of a screen
 * while still displaying cached/stale content below.
 */
export function ErrorBanner({
  type = 'network',
  message,
  onRetry,
}: {
  type?: ErrorType;
  message?: string;
  onRetry?: () => void;
}) {
  const config = ERROR_CONFIG[type];
  const Icon = config.icon;

  return (
    <View
      className="flex-row items-center mx-4 mt-2 mb-1 px-3 py-2.5 rounded-sm"
      style={{ backgroundColor: config.bgColor, borderLeftWidth: 3, borderLeftColor: config.color }}
    >
      <Icon size={16} color={config.color} />
      <Text className="flex-1 text-xs font-medium ml-2" style={{ color: config.color }}>
        {message || config.message}
      </Text>
      {onRetry && (
        <TouchableOpacity onPress={onRetry} className="ml-2 p-1">
          <RefreshCw size={14} color={config.color} />
        </TouchableOpacity>
      )}
    </View>
  );
}
