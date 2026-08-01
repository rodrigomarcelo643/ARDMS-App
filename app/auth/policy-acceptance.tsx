import { useAuth } from "@/contexts/AuthContext";
import { API_BASE_URL } from '@/constants/Config';
import axios from "axios";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  FileText,
  Shield,
  Lock,
  Users,
  Clock,
  AlertCircle,
  Database,
  BookOpen,
  Share2,
  RefreshCw,
} from "lucide-react-native";
import React, { useRef, useState } from "react";
import {
  Animated,
  ScrollView,
  Text,
  View,
} from "react-native";
import Toast from "react-native-toast-message";

// Import modular components
import { AuthLoadingModal } from "@/components/auth/AuthLoadingModal";
import { PolicyHeader } from "@/components/auth/policy/PolicyHeader";
import { PolicyCard } from "@/components/auth/policy/PolicyCard";
import { PolicyAcceptanceSection } from "@/components/auth/policy/PolicyAcceptanceSection";

const PolicyAcceptance = () => {
  const APP_URL = `${API_BASE_URL}/api/login.php`;
  const { student_id, user_data } = useLocalSearchParams();
  const router = useRouter();
  const { login, user, updateUserPolicyStatus } = useAuth();

  const [state, setState] = useState({ loading: false, policyAccepted: false, hasScrolledToBottom: false });

  const scrollViewRef = useRef<ScrollView>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const handleScroll = (event: any) => {
    const { contentOffset, contentSize, layoutMeasurement } = event.nativeEvent;
    if (contentOffset.y >= contentSize.height - layoutMeasurement.height - 20 && !state.hasScrolledToBottom) {
      setState(prev => ({ ...prev, hasScrolledToBottom: true }));
      Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }).start();
    }
  };

  const handleAcceptPolicy = async () => {
    if (!state.policyAccepted) { Toast.show({ type: "error", text1: "Error", text2: "Accept policy to continue" }); return; }
    setState(prev => ({ ...prev, loading: true }));
    try {
      const res = await axios.post(APP_URL, { student_id, accept_policy: true }, { timeout: 10000 });
      if (res.data.success) {
        let finalUser: any = null;
        if (res.data.user) {
          finalUser = { ...res.data.user, avatar: res.data.user.avatar || "https://msis-som.eduisync.io/swu-head.png", policy_accepted: 1 };
          if (user_data && typeof user_data === 'string') {
            try { const parsed = JSON.parse(user_data); if (parsed.password) finalUser.password = parsed.password; } catch (e) {}
          }
        } else if (user_data && typeof user_data === 'string') {
          const parsed = JSON.parse(user_data);
          finalUser = { ...parsed, policy_accepted: 1 };
        } else if (user) { await updateUserPolicyStatus(true); }

        if (finalUser) await login(finalUser);
        Toast.show({ type: "success", text1: "Welcome to MSIS!" });
        setTimeout(() => router.replace("/(tabs)/home"), 1000);
      } else Toast.show({ type: "error", text1: "Error", text2: res.data.message });
    } catch (e: any) { Toast.show({ type: "error", text1: "Error", text2: e.message });
    } finally { setState(prev => ({ ...prev, loading: false })); }
  };

  return (
    <View className="flex-1 bg-white">
      <PolicyHeader onBack={() => router.replace("/auth/login")} title="Data Policy Agreement" />
      <AuthLoadingModal visible={state.loading} message="Processing... Please wait" />

      <ScrollView ref={scrollViewRef} onScroll={handleScroll} scrollEventThrottle={16} className="flex-1 px-4 bg-gray-50" contentContainerStyle={{ paddingBottom: 40 }}>
        <View className="mb-6 mt-6">
          <PolicyCard title="Terms and Conditions" icon={<FileText size={20} color="#3b82f6" />} iconBgColor="bg-blue-100">
            <Text className="text-sm text-gray-600 leading-5">The Medical Student Information System (MSIS) is designed to manage student academic records and documents in accordance with Republic Act No. 10173, also known as the Data Privacy Act of 2012, ensuring the protection of personal and sensitive information.</Text>
          </PolicyCard>

          <PolicyCard title="System Purpose" icon={<Database size={20} color="#9333ea" />} iconBgColor="bg-purple-100">
            <Text className="text-sm text-gray-600 leading-5">MSIS serves as the official repository for student academic documents, grades, and administrative records throughout your medical education journey.</Text>
          </PolicyCard>

          <PolicyCard title="Document Integrity" icon={<BookOpen size={20} color="#0891b2" />} iconBgColor="bg-cyan-100">
            <Text className="text-sm text-gray-600 leading-5">All uploaded documents are verified for authenticity and stored with digital timestamps to maintain academic integrity and prevent unauthorized modifications.</Text>
          </PolicyCard>

          <PolicyCard title="Confidentiality Protection" icon={<Shield size={20} color="#15803d" />} iconBgColor="bg-green-100">
            <Text className="text-sm text-gray-600 leading-5">All student records are treated with strict confidentiality. Access is limited to authorized personnel only, including faculty, administrators, and the student themselves.</Text>
          </PolicyCard>

          <PolicyCard title="Academic Use Only" icon={<BookOpen size={20} color="#7c3aed" />} iconBgColor="bg-violet-100">
            <Text className="text-sm text-gray-600 leading-5">Student information is used exclusively for educational administration, academic evaluation, and institutional compliance purposes.</Text>
          </PolicyCard>

          <PolicyCard title="Data Security Measures" icon={<Lock size={20} color="#dc2626" />} iconBgColor="bg-red-100">
            <Text className="text-sm text-gray-600 leading-5">All student data is protected through multiple security layers including encryption, access controls, and regular security audits to prevent unauthorized access or data breaches.</Text>
          </PolicyCard>

          <PolicyCard title="Student Rights" icon={<Users size={20} color="#d97706" />} iconBgColor="bg-amber-100">
            <Text className="text-sm text-gray-600 leading-5">Students have the right to access, review, and request corrections to their personal information stored in the system, in accordance with data privacy regulations.</Text>
          </PolicyCard>

          <PolicyCard title="Student Document Management & Retention Policy" icon={<Clock size={20} color="#4f46e5" />} iconBgColor="bg-indigo-100">
            <Text className="text-sm text-gray-600 leading-5 mb-3">Your academic documents and records are managed with the highest security standards throughout your medical education journey:</Text>

            <View className="bg-blue-50 rounded-lg p-3 mb-3 border border-blue-100">
              <Text className="text-xs font-bold text-blue-800 mb-1">Year 1 to Year 4 Students (Active Enrollment)</Text>
              <Text className="text-xs text-gray-600 leading-4">{"• Full access to all uploaded documents and academic records\n• Documents are backed up daily with 99.9% uptime guarantee\n• Real-time synchronization across all authorized devices\n• Version control for document updates and revisions\n• Secure download capabilities for personal copies"}</Text>
            </View>

            <View className="bg-green-50 rounded-lg p-3 mb-3 border border-green-100">
              <Text className="text-xs font-bold text-green-800 mb-1">Post-Graduation (1 Year Recovery Period)</Text>
              <Text className="text-xs text-gray-600 leading-4">{"• Account converted to alumni status with limited access\n• Document Recovery Window: 1 full year to download all personal documents\n• Email notifications sent at 6 months and 1 month before deletion\n• Bulk download feature available for easy document retrieval\n• Academic transcripts remain accessible through official channels"}</Text>
            </View>

            <View className="bg-red-50 rounded-lg p-3 mb-3 border border-red-100">
              <Text className="text-xs font-bold text-red-800 mb-1">Document Disposal (After 1 Year Post-Graduation)</Text>
              <Text className="text-xs text-gray-600 leading-4">{"• Secure deletion using DoD 5220.22-M standards (3-pass overwrite)\n• Cryptographic erasure of encrypted data\n• Physical destruction of backup media\n• Certificate of destruction provided upon request\n• Only official academic records retained in university archives"}</Text>
            </View>

            <View className="bg-yellow-50 rounded-lg p-3 mb-3 border border-yellow-100">
              <Text className="text-xs font-bold text-yellow-800 mb-1">Special Circumstances</Text>
              <Text className="text-xs text-gray-600 leading-4">{"• Dropped/Transferred Students: 6-month recovery period before deletion\n• Disciplinary Cases: Relevant documents retained for 7 years as per institutional policy\n• Legal Holds: Documents preserved as required by law or court order\n• Emergency Access: Family members may request access with proper legal documentation"}</Text>
            </View>

            <View className="bg-amber-50 rounded-lg p-3 border border-amber-200 flex-row items-start">
              <AlertCircle size={16} color="#d97706" style={{ marginRight: 8, marginTop: 1 }} />
              <Text className="text-xs text-amber-800 flex-1">It is your responsibility to download and secure personal copies of all important documents before the retention period expires. The university is not liable for any documents lost due to failure to retrieve them within the specified timeframe.</Text>
            </View>
          </PolicyCard>

          <PolicyCard title="Enhanced Security Measures" icon={<Shield size={20} color="#0f766e" />} iconBgColor="bg-teal-100">
            <Text className="text-sm text-gray-600 leading-5 mb-2">We implement multiple layers of security to protect your data:</Text>
            <Text className="text-xs text-gray-600 leading-5">{"\uD83D\uDD10 Password Protection: bcrypt hashing with salt rounds\n\uD83D\uDD11 Authentication: CAPTCHA verification, OTP Integration, 30-minute session timeout\n\uD83D\uDD12 Data Encryption: AES-256 for data at rest, TLS 1.3 for data in transit\n\uD83D\uDC65 Access Controls: Role-based access with audit logging\n\uD83D\uDCE1 Monitoring: 24/7 security monitoring\n\uD83D\uDCBE Backups: Encrypted daily backups\n\uD83C\uDF93 Alumni Data: Segregated storage with additional restrictions"}</Text>
            <View className="bg-red-50 rounded-lg p-3 mt-3 border border-red-100">
              <Text className="text-xs text-red-700 leading-4">⚠️ Breach Notification: Affected individuals will be notified within 72 hours of any data breach as required by law.</Text>
            </View>
          </PolicyCard>

          <PolicyCard title="Data Sharing & Third Parties" icon={<Share2 size={20} color="#0369a1" />} iconBgColor="bg-sky-100">
            <Text className="text-sm text-gray-600 leading-5 mb-2">Your data may be shared only under these circumstances:</Text>
            <Text className="text-xs text-gray-600 leading-5">{"• With government agencies as required by law (CHED, PRC, etc.)\n• For academic research (anonymized/aggregated only)\n• When legally compelled by court order\n• With alumni associations (opt-out available)"}</Text>
            <View className="bg-green-50 rounded-lg p-3 mt-3 border border-green-100">
              <Text className="text-xs text-green-800 leading-4">✅ We never sell student or alumni data to third parties. All external sharing undergoes strict review by our Data Protection Officer.</Text>
            </View>
          </PolicyCard>

          <PolicyCard title="Policy Updates & Contact Information" icon={<RefreshCw size={20} color="#6b7280" />} iconBgColor="bg-gray-100">
            <Text className="text-sm text-gray-600 leading-5">This policy may be updated to comply with new regulations or institutional changes. Significant changes will be communicated via official MSIS notifications and email.{"\n\n"}Questions or Concerns: Contact the College of Medicine Data Protection Officer or the MSIS Administrator for any inquiries regarding your document security and privacy rights.</Text>
          </PolicyCard>

          <View className="bg-blue-50 rounded-xl p-4 mb-4 border-l-4 border-blue-600">
            <Text className="text-xs text-gray-700 leading-5 italic">By using the Academic Record and Document Management System (MSIS), I acknowledge and agree to the terms outlined above. I understand my rights regarding document access, retention periods, and secure disposal procedures. I consent to the collection and processing of my academic data in accordance with the Data Privacy Act of 2012 (RA 10173) and institutional policies.</Text>
          </View>

          <PolicyAcceptanceSection
            fadeAnim={fadeAnim}
            hasScrolledToBottom={state.hasScrolledToBottom}
            policyAccepted={state.policyAccepted}
            setPolicyAccepted={(val) => setState(p => ({ ...p, policyAccepted: val }))}
            loading={state.loading}
            onAccept={handleAcceptPolicy}
            onCancel={() => router.replace("/auth/login")}
            scrollToBottom={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
          />
        </View>
      </ScrollView>
      <Toast />
    </View>
  );
};

export default PolicyAcceptance;
