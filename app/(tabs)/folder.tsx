import { API_BASE_URL, ML_API_BASE_URL, EXPO_OPENAI_API_KEY } from '@/constants/Config';
import { extractNmatPercentileFromImage } from '@/services/nmatExtractionService';

export const isNmatRequirement = (reqName: string): boolean => {
  if (!reqName) return false;
  const lower = reqName.toLowerCase();
  return lower.includes('nmat') || lower.includes('percentile rank') || lower.includes('percentile');
};
import { useAuth } from "@/contexts/AuthContext";
import { useThemeColor } from "@/hooks/useThemeColor";
import axios from "axios";
import { getDocumentAsync } from "expo-document-picker";
import { documentDirectory, downloadAsync } from "expo-file-system";
import { launchImageLibraryAsync, requestMediaLibraryPermissionsAsync } from "expo-image-picker";
import { shareAsync } from "expo-sharing";
import {
  AlertTriangle,
  Download,
} from "lucide-react-native";
import { useEffect, useState } from "react";

import { FileInfo, FilterType, Requirement, UploadedFile } from '@/@types/tabs';
import {
  Alert,
  Animated,
  Image,
  Modal,
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import Toast from "react-native-toast-message";

import { FolderHeader } from "@/components/folder/FolderHeader";
import {
  BlurErrorModal,
  ConfirmModal,
  FileTypeModal,
  ImageViewModal,
  NmatResultModal,
  ProgressModal,
  QualityModalContent
} from "@/components/folder/FolderModals";
import { RequirementItem } from "@/components/folder/RequirementItem";
import { RequirementSkeleton } from "@/components/folder/RequirementSkeleton";
import ErrorDisplay, { detectErrorType } from '@/components/ui/ErrorDisplay';

export default function FolderScreen() {
  const { user } = useAuth();

  // Theme Change 
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const cardColor = useThemeColor({}, 'card');
  const mutedColor = useThemeColor({}, 'muted');
  const loadColor = useThemeColor({}, 'loaderCard');

  // State for requirements
  const [requirements, setRequirements] = useState<Requirement[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState<boolean>(false);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  // UI states
  const [filter, setFilter] = useState<FilterType>("all");
  const [showFilterDropdown, setShowFilterDropdown] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [viewingImage, setViewingImage] = useState<string | null>(null);
  const [downloadingFile, setDownloadingFile] = useState<string | null>(null);
  const [showFileTypeModal, setShowFileTypeModal] = useState<boolean>(false);
  const [selectedRequirement, setSelectedRequirement] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [printingFiles, setPrintingFiles] = useState<boolean>(false);
  const [showDownloadConfirmModal, setShowDownloadConfirmModal] = useState<boolean>(false);
  const [showFileDownloadModal, setShowFileDownloadModal] = useState<boolean>(false);
  const [fileToDownload, setFileToDownload] = useState<{ file: UploadedFile; reqId: string } | null>(null);

  // Delete confirmation modal state
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
  const [fileToDelete, setFileToDelete] = useState<UploadedFile | null>(null);
  const [requirementToDelete, setRequirementToDelete] = useState<string | null>(null);

  // Feedback modal state
  const [showFeedbackModal, setShowFeedbackModal] = useState<boolean>(false);
  const [selectedFeedback, setSelectedFeedback] = useState<string>("");

  // Blur check modal state
  const [checkingBlur, setCheckingBlur] = useState<boolean>(false);
  const [checkingNmat, setCheckingNmat] = useState<boolean>(false);
  const [showQualityModal, setShowQualityModal] = useState<boolean>(false);
  const [showBlurErrorModal, setShowBlurErrorModal] = useState<boolean>(false);
  const [blurPercentage, setBlurPercentage] = useState<number>(0);
  const [sharpPercentage, setSharpPercentage] = useState<number>(0);
  const [pendingImageUpload, setPendingImageUpload] = useState<{ reqId: string | null; fileInfo: FileInfo } | null>(null);
  const [qualityCountdown, setQualityCountdown] = useState<number>(3);

  // NMAT extraction result modal state
  const [showNmatModal, setShowNmatModal] = useState<boolean>(false);
  const [nmatResultData, setNmatResultData] = useState<{
    success: boolean;
    found: boolean;
    percentileRank: number | null;
    reason?: string;
    pendingUpload: { reqId: string | null; fileInfo: FileInfo } | null;
  } | null>(null);

  // Image viewing state
  const [imageScale] = useState(new Animated.Value(1));
  const [imageRotation] = useState(new Animated.Value(0));
  const [currentRotation, setCurrentRotation] = useState<number>(0);
  const [currentScale, setCurrentScale] = useState<number>(1);

  // Fetch requirements based on student's nationality
  const fetchRequirements = async () => {
    try {
      setLoading(true);
      setError(null);

      // Check if user has id
      if (!user?.id) {
        setError("User ID not found. Please log in again.");
        setLoading(false);
        return;
      }

      const response = await axios.post(
        `${API_BASE_URL}/api/student_requirements.php`,
        {
          user_id: user.id,
        },
        {
          timeout: 10000,
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        }
      );

      if (response.data.success) {
        const transformedRequirements = response.data.requirements.map(
          (req: Record<string, unknown>) => ({
            id: req.id as string,
            name: req.name as string,
            completed: (req.completed as boolean) || false,
            file_count: (req.file_count as number) || 1,
            uploadedFiles: (req.uploaded_files as UploadedFile[]) || [],
          })
        );

        setRequirements(transformedRequirements);
      } else {
        setError(response.data.message || "Failed to fetch requirements");
      }
    } catch (err) {
      console.error("Error fetching requirements:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch requirements");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchRequirements();
  }, [user?.id]);

  // Function to refresh requirements after upload/delete
  const refreshRequirements = async () => {
    try {
      if (!user?.id) return;

      const response = await axios.post(
        `${API_BASE_URL}/api/student_requirements.php`,
        {
          user_id: user.id,
        },
        {
          timeout: 10000,
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        }
      );

      if (response.data.success) {
        const transformedRequirements = response.data.requirements.map(
          (req: Record<string, unknown>) => ({
            id: req.id as string,
            name: req.name as string,
            completed: (req.completed as boolean) || false,
            file_count: (req.file_count as number) || 1,
            uploadedFiles: (req.uploaded_files as UploadedFile[]) || [],
          })
        );

        setRequirements(transformedRequirements);
      }
    } catch (err) {
      console.error("Error refreshing requirements:", err);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Failed to refresh requirements",
      });
    }
  };

  // Handle pull-to-refresh
  const onRefresh = () => {
    setRefreshing(true);
    fetchRequirements();
  };

  // Stats
  const completedCount = requirements.filter((req) => req.completed).length;
  const totalCount = requirements.length;
  const completionPercentage =
    totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  // Filtered and searched requirements
  const filteredRequirements = requirements.filter((req) => {
    if (filter === "completed" && !req.completed) return false;
    if (filter === "not-completed" && req.completed) return false;

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return req.name.toLowerCase().includes(query);
    }

    return true;
  });

  // Handle file selection modal
  const openFileTypeModal = (reqId: string) => {
    setSelectedRequirement(reqId);
    setShowFileTypeModal(true);
  };

  // Validate selected file (NMAT percentile extraction vs ML Image Blur check)
  const validateAndUploadFile = async (reqId: string | null, fileInfo: FileInfo, isImage: boolean) => {
    const currentReq = requirements.find(r => r.id === reqId);
    const reqName = currentReq?.name || '';

    if (isNmatRequirement(reqName)) {
      // Validate NMAT percentile using OpenAI API (EXPO_OPENAI_API_KEY)
      setCheckingNmat(true);
      const extraction = await extractNmatPercentileFromImage(fileInfo.uri, EXPO_OPENAI_API_KEY);
      setCheckingNmat(false);

      setNmatResultData({
        success: extraction.success,
        found: extraction.found,
        percentileRank: extraction.percentileRank,
        reason: extraction.reason,
        pendingUpload: { reqId, fileInfo },
      });
      setShowNmatModal(true);
    } else {
      // Non-NMAT requirements: use ML image classifier blur check for images
      if (isImage) {
        setCheckingBlur(true);
        const { isBlurry, blurScore, sharpScore } = await checkImageBlur(fileInfo);
        setCheckingBlur(false);

        setBlurPercentage(blurScore);
        setSharpPercentage(sharpScore);
        setPendingImageUpload({ reqId, fileInfo });

        if (isBlurry || blurScore > 40) {
          setShowBlurErrorModal(true);
        } else {
          setShowQualityModal(true);
        }
      } else {
        await handleFileUpload(reqId, fileInfo);
      }
    }
  };

  // Pick document file
  const pickDocument = async () => {
    try {
      setShowFileTypeModal(false);

      const result = await getDocumentAsync({
        type: [
          "application/pdf",
          "application/msword",
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        ],
        copyToCacheDirectory: true,
      });

      if (result.canceled) return;

      if (result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        let mimeType = asset.mimeType;

        if (!mimeType && asset.name) {
          const ext = asset.name.split('.').pop()?.toLowerCase();
          if (ext === 'pdf') mimeType = 'application/pdf';
          else if (ext === 'doc') mimeType = 'application/msword';
          else if (ext === 'docx') mimeType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
        }

        const fileInfo: FileInfo = {
          name: asset.name,
          size: asset.size || 0,
          uri: asset.uri,
          type: mimeType?.includes('pdf') ? 'pdf' :
            mimeType?.includes('word') ? 'word' : 'document',
          mimeType: mimeType || 'application/octet-stream',
        };

        await validateAndUploadFile(selectedRequirement, fileInfo, false);
      }
    } catch (err) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Failed to pick document",
      });
    }
  };

  // Check image blur via ML API
  const checkImageBlur = async (fileInfo: FileInfo): Promise<{ isBlurry: boolean; blurScore: number; sharpScore: number }> => {
    try {
      const formData = new FormData();
      formData.append('file', {
        uri: fileInfo.uri,
        name: fileInfo.name,
        type: fileInfo.mimeType || 'image/jpeg',
      } as unknown as Blob);

      console.log("Calling ML Blur Check (Simple Fetch):", `${ML_API_BASE_URL}/api/app/blur-check`);

      const response = await fetch(`${ML_API_BASE_URL}/api/app/blur-check`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const rawScore: number = typeof data?.blur_score === 'number' ? data.blur_score : 0;
      const isBlurry: boolean = data?.is_blurry === true;
      const sharpScore = Math.min(100, Math.round((rawScore / 1000) * 100));
      const blurScore = 100 - sharpScore;

      return { isBlurry, blurScore, sharpScore };
    } catch (err) {
      console.error('Folder blur check error:', err);
      return { isBlurry: false, blurScore: 0, sharpScore: 100 };
    }
  };

  // Pick image file
  const pickImage = async () => {
    try {
      setShowFileTypeModal(false);

      const { status } = await requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Toast.show({ type: "error", text1: "Permission Required", text2: "Need camera roll permissions." });
        return;
      }

      const result = await launchImageLibraryAsync({
        mediaTypes: 'images',
        allowsEditing: false,
        quality: 1,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        const fileInfo: FileInfo = {
          name: asset.fileName || `image_${Date.now()}.jpg`,
          size: asset.fileSize || 0,
          uri: asset.uri,
          type: 'image',
          mimeType: asset.mimeType || 'image/jpeg',
        };

        await validateAndUploadFile(selectedRequirement, fileInfo, true);
      }
    } catch (err) {
      Toast.show({ type: "error", text1: "Error", text2: "Failed to pick image" });
    }
  };

  // Handle file upload to server
  const handleFileUpload = async (reqId: string | null, fileInfo: FileInfo, extractedPercentile?: number | null) => {
    try {
      setUploading(true);
      setUploadProgress(0);

      if (!user?.id || !reqId) throw new Error("Missing user ID or requirement ID");

      const formData = new FormData();
      formData.append("user_id", user.id);
      formData.append("requirement_id", reqId);
      if (extractedPercentile !== undefined && extractedPercentile !== null) {
        formData.append("nmat_score", extractedPercentile.toString());
      }

      const timestamp = Date.now();
      const safeName = fileInfo.name
        ? fileInfo.name.replace(/[^a-zA-Z0-9_\-\s()]/g, "_")
        : `file_${timestamp}`;

      let fileExtension = 'file';
      if (fileInfo.mimeType) {
        if (fileInfo.mimeType.includes('pdf')) fileExtension = 'pdf';
        else if (fileInfo.mimeType.includes('jpeg') || fileInfo.mimeType.includes('jpg')) fileExtension = 'jpg';
        else if (fileInfo.mimeType.includes('png')) fileExtension = 'png';
        else if (fileInfo.mimeType.includes('gif')) fileExtension = 'gif';
        else if (fileInfo.mimeType.includes('word')) fileExtension = 'docx';
        else if (fileInfo.mimeType.includes('msword')) fileExtension = 'doc';
      } else if (fileInfo.name) {
        fileExtension = fileInfo.name.split('.').pop() || 'file';
      }

      const fileName = `${safeName}_${timestamp}.${fileExtension}`;

      formData.append("file", {
        uri: fileInfo.uri,
        name: fileName,
        type: fileInfo.mimeType || 'application/octet-stream',
      } as unknown as Blob);

      console.log("Uploading to:", `${API_BASE_URL}/api/upload_requirement.php`);
      
      const response = await fetch(`${API_BASE_URL}/api/upload_requirement.php`, {
        method: 'POST',
        body: formData,
        headers: {
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      console.log("Upload Response:", data);

      if (data.success) {
        setUploadProgress(100);
        await refreshRequirements();
        const successMsg = (extractedPercentile !== undefined && extractedPercentile !== null)
          ? `File uploaded successfully. Verified NMAT Percentile Rank: ${extractedPercentile}% (Passed ≥ 40%)`
          : "File uploaded successfully";
        Toast.show({ type: "success", text1: "Success", text2: successMsg });
      } else {
        Toast.show({ type: "error", text1: "Error", text2: data.message || "Failed to upload file" });
      }
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : "Unknown Error";
      Toast.show({
        type: "error",
        text1: "Error",
        text2: errorMsg.length > 50 ? errorMsg.substring(0, 50) + "..." : errorMsg
      });
      Alert.alert("Upload Error", errorMsg);
    } finally {
      setTimeout(() => {
        setUploading(false);
        setUploadProgress(0);
      }, 500);
    }
  };

  // Open delete confirmation modal
  const openDeleteModal = (reqId: string, fileId: string, fileName: string) => {
    setRequirementToDelete(reqId);
    setFileToDelete({ id: fileId, name: fileName } as UploadedFile);
    setShowDeleteModal(true);
  };

  // Handle file removal
  const handleRemoveFile = async () => {
    try {
      if (!user?.id || !requirementToDelete || !fileToDelete?.id) return;

      const response = await axios.post(
        `${API_BASE_URL}/api/delete_requirement.php`,
        { user_id: user.id, requirement_id: requirementToDelete, file_id: fileToDelete.id }
      );

      if (response.data.success) {
        await refreshRequirements();
        Toast.show({ type: "success", text1: "Success", text2: "File removed successfully" });
      } else {
        Toast.show({ type: "error", text1: "Error", text2: response.data.message || "Failed to remove file" });
      }
    } catch (err) {
      Toast.show({ type: "error", text1: "Error", text2: "Failed to remove file." });
    } finally {
      setShowDeleteModal(false);
      setFileToDelete(null);
      setRequirementToDelete(null);
    }
  };

  // Handle download all files as one PDF
  const handleDownloadAll = async () => {
    try {
      setPrintingFiles(true);

      const allFiles = requirements.flatMap(req =>
        req.uploadedFiles.map(file => ({ ...file, requirementId: req.id, requirementName: req.name }))
      );

      if (allFiles.length === 0) {
        Toast.show({ type: "info", text1: "No Files", text2: "No files available to download" });
        return;
      }

      Toast.show({ type: "info", text1: "Compiling PDF", text2: `Combining ${allFiles.length} files...` });

      try {
        if (!user?.id) return;

        const response = await axios.post(
          `${API_BASE_URL}/api/generate_compiled_pdf.php`,
          {
            user_id: user.id,
            files: allFiles.map(file => ({
              requirement_id: file.requirementId,
              requirement_name: file.requirementName,
              file_id: file.id,
              file_name: file.name,
              file_path: (file as UploadedFile).file_path
            }))
          },
          { timeout: 60000 }
        );

        if (response.data.success && response.data.pdf_url) {
          const pdfFileName = `Student_Requirements_${user.first_name}_${user.last_name}_${Date.now()}.pdf`;
          const pdfUri = documentDirectory + pdfFileName;
          await downloadAsync(response.data.pdf_url, pdfUri);
          await shareAsync(pdfUri, { mimeType: 'application/pdf', dialogTitle: 'Download Compiled PDF' });
          Toast.show({ type: "success", text1: "PDF Ready", text2: `Files compiled successfully` });
          return;
        }
      } catch (apiError) {
        // Fallback or ignore
      }

      Toast.show({ type: "info", text1: "Downloading Files", text2: `Preparing individual files...` });

      const downloadPromises = allFiles.map(async (file) => {
        try {
          if (!user?.id) return null;
          const downloadUrl = `${API_BASE_URL}/api/get_requirement_file.php?user_id=${user.id}&requirement_id=${file.requirementId}&file_path=${encodeURIComponent((file as UploadedFile).file_path || '')}`;
          const fileUri = documentDirectory + file.name;
          const { uri } = await downloadAsync(downloadUrl, fileUri);
          return uri;
        } catch (error) {
          return null;
        }
      });

      const downloadedFileUris = (await Promise.all(downloadPromises)).filter(Boolean);

      for (const uri of downloadedFileUris) {
        if (uri) await shareAsync(uri);
      }

      Toast.show({ type: "success", text1: "Download Complete", text2: `${downloadedFileUris.length} files downloaded` });
    } catch (error) {
      Toast.show({ type: "error", text1: "Error", text2: "Failed to download files" });
    } finally {
      setPrintingFiles(false);
    }
  };

  // View file handler
  const handleViewFile = async (file: UploadedFile, requirementId: string) => {
    try {
      if (!user?.id) return;

      if (file.type === "image") {
        const imageUrl = `${API_BASE_URL}/api/get_requirement_file.php?user_id=${user.id}&requirement_id=${requirementId}&file_path=${encodeURIComponent(file.file_path || '')}`;
        setViewingImage(imageUrl);
      } else {
        setDownloadingFile(file.name);
        const downloadUrl = `${API_BASE_URL}/api/get_requirement_file.php?user_id=${user.id}&requirement_id=${requirementId}&file_path=${encodeURIComponent(file.file_path || '')}`;
        const fileUri = documentDirectory + file.name;
        const { uri } = await downloadAsync(downloadUrl, fileUri);
        await shareAsync(uri);
        setDownloadingFile(null);
      }
    } catch (error) {
      setDownloadingFile(null);
      Toast.show({ type: "error", text1: "Error", text2: "Could not open the file." });
    }
  };

  // Download file handler
  const handleDownloadFile = async (file: UploadedFile, requirementId: string) => {
    try {
      if (!user?.id) return;

      setDownloadingFile(file.name);
      const downloadUrl = `${API_BASE_URL}/api/get_requirement_file.php?user_id=${user.id}&requirement_id=${requirementId}&file_path=${encodeURIComponent(file.file_path || '')}`;
      const fileUri = documentDirectory + file.name;
      const { uri } = await downloadAsync(downloadUrl, fileUri);

      await shareAsync(uri, { mimeType: file.mimeType, dialogTitle: `Download ${file.name}` });
      setDownloadingFile(null);
      Toast.show({ type: "success", text1: "Success", text2: "File downloaded successfully" });
    } catch (error) {
      setDownloadingFile(null);
      Toast.show({ type: "error", text1: "Error", text2: "Could not download the file." });
    }
  };

  // Retry fetching requirements
  const retryFetch = () => {
    setLoading(true);
    setError(null);
    fetchRequirements();
  };

  // Loading state
  if (loading && !refreshing) {
    return <RequirementSkeleton backgroundColor={backgroundColor} loadColor={loadColor} />;
  }

  // Error state
  if (error) {
    return (
      <View className="flex-1" style={{ backgroundColor }}>
        <ErrorDisplay
          type={detectErrorType(error)}
          title={error.includes('User ID') ? 'Authentication Error' : undefined}
          message={error}
          onRetry={retryFetch}
        />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor }}>
      <ScrollView
        className="p-4"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#be2e2e"]}
            tintColor="#be2e2e"
            progressBackgroundColor="#ffffff"
          />
        }
      >
        <FolderHeader
          backgroundColor={backgroundColor}
          textColor={textColor}
          cardColor={cardColor}
          mutedColor={mutedColor}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          totalCount={totalCount}
          completedCount={completedCount}
          completionPercentage={completionPercentage}
          printingFiles={printingFiles}
          onDownloadAll={() => setShowDownloadConfirmModal(true)}
          filter={filter}
          setFilter={setFilter}
          showFilterDropdown={showFilterDropdown}
          setShowFilterDropdown={setShowFilterDropdown}
        />

        {/* Requirements List */}
        {filteredRequirements.length === 0 ? (
          <View style={{ backgroundColor: cardColor }} className="bg-white border-2 border-dashed border-gray-300 rounded-lg p-8 items-center justify-center">
            <Image source={require("../../assets/images/no_file.png")} className="w-20 h-20" />
            <Text className="text-gray-500 text-center">No requirements found</Text>
          </View>
        ) : (
          filteredRequirements.map((req) => (
            <RequirementItem
              key={req.id}
              requirement={req}
              textColor={textColor}
              cardColor={cardColor}
              uploading={uploading}
              onViewFile={(file, reqId) => handleViewFile(file, reqId)}
              onDownloadFile={(file, reqId) => {
                setFileToDownload({ file, reqId });
                setShowFileDownloadModal(true);
              }}
              onDeleteFile={(reqId, fileId, fileName) => openDeleteModal(reqId, fileId, fileName)}
              onBrowseFiles={(reqId) => openFileTypeModal(reqId)}
              onShowFeedback={(feedback) => {
                setSelectedFeedback(feedback);
                setShowFeedbackModal(true);
              }}
            />
          ))
        )}
      </ScrollView>

      {/* Modals */}
      <FileTypeModal
        visible={showFileTypeModal}
        onClose={() => setShowFileTypeModal(false)}
        onPickDocument={pickDocument}
        onPickImage={pickImage}
      />

      <ConfirmModal
        visible={showDownloadConfirmModal}
        onClose={() => setShowDownloadConfirmModal(false)}
        onConfirm={() => { setShowDownloadConfirmModal(false); handleDownloadAll(); }}
        title="Download All Files"
        message="This will download all your uploaded files. Are you sure you want to proceed?"
        confirmText="Download"
        icon={<Download size={32} color="#3b82f6" />}
        confirmColor="#be2e2e"
      />

      <ConfirmModal
        visible={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleRemoveFile}
        title="Delete File"
        message={<Text className="text-gray-600 text-center">Are you sure you want to delete <Text className="font-semibold">&quot;{fileToDelete?.name}&quot;</Text>? This action cannot be undone.</Text>}
        confirmText="Delete"
        icon={<AlertTriangle size={32} color="#ef4444" />}
        confirmColor="#dc2626"
      />

      <ConfirmModal
        visible={showFileDownloadModal}
        onClose={() => setShowFileDownloadModal(false)}
        onConfirm={() => {
          setShowFileDownloadModal(false);
          if (fileToDownload) handleDownloadFile(fileToDownload.file, fileToDownload.reqId);
        }}
        title="Download File"
        message={`Download "${fileToDownload?.file?.name}"?`}
        confirmText="Download"
        icon={<Download size={32} color="#059669" />}
        confirmColor="#059669"
      />

      <ConfirmModal
        visible={showFeedbackModal}
        onClose={() => setShowFeedbackModal(false)}
        onConfirm={() => setShowFeedbackModal(false)}
        title="Rejection Feedback"
        message={
          <View className="bg-red-50 border border-red-200 rounded-lg p-4 w-full">
            <Text className="text-red-800 text-sm leading-5">{selectedFeedback}</Text>
          </View>
        }
        confirmText="Close"
        icon={<AlertTriangle size={32} color="#ef4444" />}
        confirmColor="#be2e2e"
      />

      <ProgressModal visible={uploading} title="Uploading File" progress={uploadProgress} />
      <ProgressModal visible={downloadingFile !== null} title="Downloading File" subtitle={downloadingFile || ""} />
      <ProgressModal visible={checkingBlur} title="Analyzing Image" subtitle="Checking image quality..." />
      <ProgressModal visible={checkingNmat} title="Analyzing NMAT Result" subtitle="Reading NMAT Percentile Rank..." />

      <ImageViewModal
        visible={viewingImage !== null}
        imageUrl={viewingImage}
        onClose={() => {
          setViewingImage(null);
          imageScale.setValue(1);
          imageRotation.setValue(0);
          setCurrentRotation(0);
          setCurrentScale(1);
        }}
        scale={imageScale}
        rotation={imageRotation}
        currentScale={currentScale}
        currentRotation={currentRotation}
        onZoomIn={() => {
          const newScale = Math.min(currentScale + 0.5, 3);
          setCurrentScale(newScale);
          Animated.spring(imageScale, { toValue: newScale, useNativeDriver: true }).start();
        }}
        onZoomOut={() => {
          const newScale = Math.max(currentScale - 0.5, 0.5);
          setCurrentScale(newScale);
          Animated.spring(imageScale, { toValue: newScale, useNativeDriver: true }).start();
        }}
        onRotate={() => {
          const newRotation = currentRotation + 90;
          setCurrentRotation(newRotation);
          Animated.spring(imageRotation, { toValue: newRotation, useNativeDriver: true }).start();
        }}
        onTapToZoom={() => {
          const newScale = currentScale === 1 ? 2 : 1;
          setCurrentScale(newScale);
          Animated.spring(imageScale, { toValue: newScale, useNativeDriver: true }).start();
        }}
      />

      <BlurErrorModal
        visible={showBlurErrorModal}
        blurPercentage={blurPercentage}
        sharpPercentage={sharpPercentage}
        onClose={() => { setShowBlurErrorModal(false); setPendingImageUpload(null); }}
      />

      <NmatResultModal
        visible={showNmatModal}
        success={nmatResultData?.success ?? false}
        found={nmatResultData?.found ?? false}
        percentileRank={nmatResultData?.percentileRank ?? null}
        reason={nmatResultData?.reason}
        onClose={() => {
          setShowNmatModal(false);
          setNmatResultData(null);
        }}
        onConfirmUpload={async () => {
          setShowNmatModal(false);
          if (nmatResultData?.pendingUpload) {
            await handleFileUpload(
              nmatResultData.pendingUpload.reqId,
              nmatResultData.pendingUpload.fileInfo,
              nmatResultData.percentileRank
            );
          }
          setNmatResultData(null);
        }}
      />

      <Modal visible={showQualityModal} transparent={true} animationType="fade">
        <QualityModalContent
          sharpPercentage={sharpPercentage}
          blurPercentage={blurPercentage}
          pendingImageUpload={pendingImageUpload}
          onUpload={async (upload) => {
            setShowQualityModal(false);
            await handleFileUpload(upload.reqId, upload.fileInfo);
            setPendingImageUpload(null);
          }}
          onCountdownChange={setQualityCountdown}
          countdown={qualityCountdown}
          onReset={() => setQualityCountdown(3)}
        />
      </Modal>

      <Toast />
    </View>
  );
}