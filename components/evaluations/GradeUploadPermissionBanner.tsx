import React from 'react';
import { View, Text } from 'react-native';
import { Lock, Unlock } from 'lucide-react-native';
import { useThemeColor } from '@/hooks/useThemeColor';

interface Props {
  isEnabled: boolean;
  yearLevelName: string | null;
}

/**
 * Displays a small banner indicating whether grade uploads are open or locked
 * for the student's current year level.
 */
const GradeUploadPermissionBanner: React.FC<Props> = ({ isEnabled, yearLevelName }) => {
  const cardColor = useThemeColor({}, 'card');
  const textColor = useThemeColor({}, 'text');

  if (isEnabled) {
    return (
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: '#dcfce7',
          borderRadius: 2,
          paddingVertical: 10,
          paddingHorizontal: 14,
          marginHorizontal: 12,
          marginBottom: 4,
          borderLeftWidth: 4,
          borderLeftColor: '#16a34a',
          gap: 8,
        }}
      >
        <Unlock size={16} color="#16a34a" />
        <Text style={{ color: '#15803d', fontSize: 13, fontWeight: '600', flex: 1 }}>
          Grade uploads are <Text style={{ fontWeight: '700' }}>open</Text> for{' '}
          {yearLevelName ?? 'your year level'}
        </Text>
      </View>
    );
  }

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fee2e2',
        borderRadius: 2,
        paddingVertical: 10,
        paddingHorizontal: 14,
        marginHorizontal: 12,
        marginBottom: 4,
        borderLeftWidth: 4,
        borderLeftColor: '#dc2626',
        gap: 8,
      }}
    >
      <Lock size={16} color="#dc2626" />
      <Text style={{ color: '#b91c1c', fontSize: 13, fontWeight: '600', flex: 1 }}>
        Grade uploads are <Text style={{ fontWeight: '700' }}>locked</Text> for{' '}
        {yearLevelName ?? 'your year level'}
      </Text>
    </View>
  );
};

export default GradeUploadPermissionBanner;
