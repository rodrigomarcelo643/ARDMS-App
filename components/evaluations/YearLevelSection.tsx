import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { CheckCircle, Lock, Upload } from 'lucide-react-native';
import { Evaluation } from '@/@types/tabs';
import { useThemeColor } from '@/hooks/useThemeColor';

// ── Upload state type ─────────────────────────────────────────────────────────
/**
 * open        — student's current year level, admin has enabled uploads
 * admin_locked— student's current year level, but admin disabled uploads
 * completed   — past year level where every evaluation has a grade (nothing left to submit)
 * not_current — a year level that doesn't match the student's current year (and not completed)
 */
export type UploadState = 'open' | 'admin_locked' | 'completed' | 'not_current';

// ── type helpers ──────────────────────────────────────────────────────────────
function getStatusFromEvaluation(evaluation: Evaluation) {
  if (evaluation.grade !== null && evaluation.grade !== '') {
    if (evaluation.remarks === 'Passed')          return 'passed';
    if (evaluation.remarks === 'Failed')          return 'failed';
    if (['INC', 'Academic Support'].includes(evaluation.grade)) return 'in_progress';
  }
  return 'pending';
}

function getStatusColor(status: string) {
  switch (status) {
    case 'passed':      return 'bg-green-600';
    case 'failed':      return 'bg-red-600';
    case 'in_progress': return 'bg-amber-600';
    default:            return 'bg-orange-500';
  }
}

function getStatusText(status: string) {
  switch (status) {
    case 'passed':      return 'Passed';
    case 'failed':      return 'Failed';
    case 'in_progress': return 'In Progress';
    default:            return 'Pending';
  }
}

function formatTerm(term: string) {
  if (term === '1st_semestral') return '1st Semestral';
  if (term === '2nd_semestral') return '2nd Semestral';
  return term;
}
// ──────────────────────────────────────────────────────────────────────────────

interface Props {
  yearLevelId: number | null;
  yearLevelLabel: string;
  yearLevel: string;
  evaluations: Evaluation[];
  uploadState: UploadState;
  uploadedImageCount: number;
  onPressEvaluation: (evaluation: Evaluation) => void;
  onPressUpload: () => void;
}

/**
 * YearLevelSection
 *
 * Upload badge logic:
 *  open        → white pill with Upload icon — tappable
 *  admin_locked→ faded pill with Lock icon + "Locked by Admin"
 *  completed   → green pill with CheckCircle + "All Grades In"
 *  not_current → faded pill with Lock icon + "Not Your Year"
 */
const YearLevelSection: React.FC<Props> = ({
  yearLevel,
  yearLevelId,
  yearLevelLabel,
  evaluations,
  uploadState,
  uploadedImageCount,
  onPressEvaluation,
  onPressUpload,
}) => {
  const cardColor  = useThemeColor({}, 'card');
  const textColor  = useThemeColor({}, 'text');
  const mutedColor = useThemeColor({}, 'muted');

  // ── Header badge config per state ─────────────────────────────────────────
  const badgeConfig = {
    open: {
      bg:      '#ffffff',
      iconColor: '#be2e2e',
      textColor: '#be2e2e',
      label:   uploadedImageCount > 0 ? `Uploads (${uploadedImageCount})` : 'Upload Grade',
      icon:    <Upload size={13} color="#be2e2e" />,
      tappable: true,
    },
    admin_locked: {
      bg:      'rgba(255,255,255,0.2)',
      iconColor: '#fca5a5',
      textColor: '#fca5a5',
      label:   'Locked by Admin',
      icon:    <Lock size={13} color="#fca5a5" />,
      tappable: false,
    },
    completed: {
      bg:      'rgba(22,163,74,0.25)',
      iconColor: '#86efac',
      textColor: '#86efac',
      label:   'All Grades In',
      icon:    <CheckCircle size={13} color="#86efac" />,
      tappable: false,
    },
    not_current: {
      bg:      'rgba(255,255,255,0.15)',
      iconColor: '#fca5a5',
      textColor: '#fca5a5',
      label:   'Not Your Year',
      icon:    <Lock size={13} color="#fca5a5" />,
      tappable: false,
    },
  }[uploadState];

  // Header tint: completed past-years look a little different
  const headerBg = uploadState === 'completed' ? '#166534' : '#be2e2e';
  const isCurrent = uploadState === 'open' || uploadState === 'admin_locked';

  return (
    <View
      style={{
        marginHorizontal: 12,
        marginBottom: 12,
        borderRadius: 2,
        overflow: 'hidden',
        backgroundColor: cardColor,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.08,
        shadowRadius: 1,
        elevation: 2,
      }}
    >
      {/* ── Header bar ───────────────────────────────────────────────────── */}
      <View
        style={{
          backgroundColor: headerBg,
          paddingHorizontal: 16,
          paddingVertical: 12,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Text style={{ color: '#fff', fontSize: 15, fontWeight: '700', flex: 1 }}>
          {yearLevelLabel}
          {isCurrent && (
            <Text style={{ fontSize: 12, fontWeight: '400', color: '#fca5a5' }}> (Current)</Text>
          )}
          {uploadState === 'completed' && (
            <Text style={{ fontSize: 12, fontWeight: '400', color: '#bbf7d0' }}> ✓</Text>
          )}
        </Text>

        {/* Upload pill — always shown to communicate state clearly */}
        <TouchableOpacity
          onPress={badgeConfig.tappable ? onPressUpload : undefined}
          disabled={!badgeConfig.tappable}
          activeOpacity={badgeConfig.tappable ? 0.75 : 1}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 5,
            backgroundColor: badgeConfig.bg,
            paddingHorizontal: 11,
            paddingVertical: 5,
            borderRadius: 2,
          }}
        >
          {badgeConfig.icon}
          <Text style={{ fontSize: 11, fontWeight: '700', color: badgeConfig.textColor }}>
            {badgeConfig.label}
          </Text>
        </TouchableOpacity>
      </View>

      {/* ── Evaluation list ──────────────────────────────────────────────── */}
      <View style={{ padding: 12 }}>
        {evaluations.length > 0 ? (
          evaluations.map((evaluation) => {
            const status = getStatusFromEvaluation(evaluation);
            return (
              <TouchableOpacity
                key={evaluation.curriculum_course_id}
                onPress={() => onPressEvaluation(evaluation)}
                activeOpacity={0.75}
                style={{
                  backgroundColor: cardColor,
                  padding: 14,
                  borderRadius: 2,
                  marginBottom: 10,
                  borderLeftWidth: 4,
                  borderLeftColor:
                    uploadState === 'completed' ? '#16a34a' : '#be2e2e',
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 1 },
                  shadowOpacity: 0.05,
                  shadowRadius: 1,
                  elevation: 1,
                }}
              >
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                  <Text style={{ fontSize: 14, fontWeight: '700', color: textColor }}>
                    {evaluation.code}
                  </Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <Text style={{ fontSize: 11, color: mutedColor }}>
                      {formatTerm(evaluation.term)}
                    </Text>
                    <View className={`px-3 py-0.5 rounded-full ${getStatusColor(status)}`}>
                      <Text style={{ color: '#fff', fontSize: 11, fontWeight: '700' }}>
                        {getStatusText(status)}
                      </Text>
                    </View>
                  </View>
                </View>

                <Text style={{ fontSize: 13, color: textColor, marginBottom: 6 }}>
                  {evaluation.title}
                </Text>

                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  {evaluation.year_level !== 'fourth_year' && (
                    <Text style={{ fontSize: 12, color: mutedColor }}>
                      {evaluation.units} units
                    </Text>
                  )}
                  {evaluation.grade ? (
                    <Text style={{ fontSize: 12, color: mutedColor }}>
                      Grade: {evaluation.grade}
                    </Text>
                  ) : null}
                </View>
              </TouchableOpacity>
            );
          })
        ) : (
          <Text style={{ textAlign: 'center', color: mutedColor, paddingVertical: 16, fontSize: 13 }}>
            No courses found for this year level
          </Text>
        )}
      </View>
    </View>
  );
};

export default YearLevelSection;
