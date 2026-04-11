import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Modal,
  Text,
  TouchableOpacity,
  View,
  ScrollView,
  Dimensions,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import axios from 'axios';
import Toast from 'react-native-toast-message';
import { Upload, X, ImageIcon, CheckCircle, Trash2, Eye, AlertTriangle } from 'lucide-react-native';
import { API_BASE_URL, ML_API_BASE_URL } from '@/constants/Config';
import { useThemeColor } from '@/hooks/useThemeColor';
import { GradeImage } from '@/@types/tabs';
import { ProgressModal, BlurErrorModal } from '@/components/folder/FolderModals';

interface Props {
  visible: boolean;
  onClose: () => void;
  onUploaded: () => void;
  userId: string;
  yearLevelId: number;
  yearLevelName: string;
  existingImages: GradeImage[];
}

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const GradeUploadModal: React.FC<Props> = ({
  visible,
  onClose,
  onUploaded,
  userId,
  yearLevelId,
  yearLevelName,
  existingImages,
}) => {
  const cardColor  = useThemeColor({}, 'card');
  const textColor  = useThemeColor({}, 'text');
  const mutedColor = useThemeColor({}, 'muted');

  const [pickedUri,  setPickedUri]  = useState<string | null>(null);
  const [mimeType,   setMimeType]   = useState<string>('image/jpeg');
  const [fileName,   setFileName]   = useState<string>('grade_image.jpg');
  const [uploading,  setUploading]  = useState(false);
  const [uploadDone, setUploadDone] = useState(false);

  // Blur check modal state
  const [checkingBlur, setCheckingBlur] = useState<boolean>(false);
  const [showBlurErrorModal, setShowBlurErrorModal] = useState<boolean>(false);
  const [blurPercentage, setBlurPercentage] = useState<number>(0);
  const [sharpPercentage, setSharpPercentage] = useState<number>(0);

  // Status for deletion
  const [deletingId, setDeletingId] = useState<number | null>(null);
  
  // Custom Confirmation Modal State
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);

  // Full screen preview state
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const checkImageBlur = async (uri: string) => {
    try {
      const formData = new FormData();
      // @ts-ignore
      formData.append('image', {
        uri: uri,
        name: 'blur_check.jpg',
        type: 'image/jpeg',
      });

      const response = await axios.post(
        `${ML_API_BASE_URL}/api/app/blur-check`,
        formData,
        {
          headers: { 'Content-Type': 'multipart/form-data' },
          timeout: 15000,
        }
      );

      const data = response.data;
      const rawScore = typeof data?.blur_score === 'number' ? data.blur_score : 0;
      const isBlurry = data?.is_blurry === true;

      const sharpScore = Math.round(100 - (rawScore * 100));
      const blurScore = 100 - sharpScore;

      return { isBlurry, blurScore, sharpScore };
    } catch (error) {
      console.error('Blur check error:', error);
      return { isBlurry: false, blurScore: 0, sharpScore: 100 };
    }
  };

  const reset = () => {
    setPickedUri(null);
    setUploadDone(false);
    setUploading(false);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'Please allow access to your photo library.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: false,
      quality: 0.85,
    });

      if (!result.canceled && result.assets.length > 0) {
        const asset = result.assets[0];
        
        // Quality check before setting
        setCheckingBlur(true);
        const { isBlurry, blurScore, sharpScore } = await checkImageBlur(asset.uri);
        setCheckingBlur(false);

        setBlurPercentage(blurScore);
        setSharpPercentage(sharpScore);

        if (isBlurry || blurScore > 40) {
          setShowBlurErrorModal(true);
          return; // Stop here if blurry
        }

        setPickedUri(asset.uri);
        setMimeType(asset.mimeType ?? 'image/jpeg');
        setFileName(asset.fileName ?? 'grade_image.' + (asset.uri.split('.').pop() ?? 'jpg'));
        setUploadDone(false);
      }
  };

  const handleUpload = async () => {
    if (!pickedUri) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('user_id',       userId);
      formData.append('year_level_id', String(yearLevelId));
      // @ts-ignore
      formData.append('file', {
        uri:  pickedUri,
        name: fileName,
        type: mimeType,
      });

      const response = await axios.post(
        `${API_BASE_URL}/api/grade_uploads/upload_grade_image.php`,
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' }, timeout: 30000 }
      );

      if (response.data.success) {
        setUploadDone(true);
        onUploaded();
        Toast.show({
          type: 'success',
          text1: 'Upload Successful',
          text2: 'Your grade record has been updated.',
        });
      } else {
        Alert.alert('Upload Failed', response.data.message);
      }
    } catch (error: any) {
      console.error('Upload Error:', error);
      Alert.alert('Network Error', 'Check your connection and try again.');
    } finally {
      setUploading(false);
    }
  };

  const executeDelete = async () => {
    const imageId = confirmDeleteId;
    if (!imageId) return;

    setConfirmDeleteId(null);
    setDeletingId(imageId);
    
    try {
      // Using JSON payload + explicit headers to fix "connection error" issues
      const res = await axios.post(
        `${API_BASE_URL}/api/grade_uploads/delete_grade_image.php`,
        {
          user_id:  userId,
          image_id: imageId,
        },
        { headers: { 'Content-Type': 'application/json' } }
      );

      if (res.data.success) {
        Toast.show({
          type: 'success',
          text1: 'Record Deleted',
          text2: 'The grade image has been removed.',
        });
        onUploaded();
      } else {
        Alert.alert('Deletion Failed', res.data.message);
      }
    } catch (err: any) {
      console.error('Delete Error:', err?.response?.data || err.message);
      Alert.alert('Connection Error', 'Failed to reach the server. Please try again.');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <>
      <Modal visible={visible} animationType="slide" transparent onRequestClose={handleClose}>
        <View style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.6)' }}>
          <View
            style={{
              backgroundColor: cardColor,
              borderTopLeftRadius: 2,
              borderTopRightRadius: 2,
              padding: 24,
              maxHeight: '92%',
            }}
          >
            {/* Header */}
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <View>
                <Text style={{ fontSize: 18, fontWeight: '800', color: textColor }}>Grade Uploads</Text>
                <Text style={{ fontSize: 12, color: mutedColor }}>{yearLevelName}</Text>
              </View>
              <TouchableOpacity onPress={handleClose}>
                <X size={24} color={textColor} />
              </TouchableOpacity>
            </View>

            {/* List */}
            {existingImages.length > 0 && (
              <View style={{ marginBottom: 24 }}>
                <Text style={{ fontSize: 11, fontWeight: '800', color: mutedColor, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12 }}>
                  Already Uploaded ({existingImages.length})
                </Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12 }}>
                  {existingImages.map((img) => (
                    <View key={img.id} style={{ width: 110 }}>
                      <View style={{ width: 110, height: 110, borderRadius: 2, overflow: 'hidden', borderWidth: 1, borderColor: '#f3f4f6' }}>
                        {img.image_data ? (
                          <Image source={{ uri: img.image_data }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
                        ) : (
                          <View style={{ flex: 1, backgroundColor: '#f9fafb', alignItems: 'center', justifyContent: 'center' }}>
                            <ImageIcon size={28} color="#d1d5db" />
                          </View>
                        )}
                        
                        {/* Actions Overlay */}
                        <View style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.15)', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
                          <TouchableOpacity 
                            onPress={() => setPreviewImage(img.image_data)}
                            style={{ backgroundColor: '#fff', padding: 8, borderRadius: 2 }}
                          >
                            <Eye size={16} color="#4b5563" />
                          </TouchableOpacity>
                          <TouchableOpacity 
                            onPress={() => setConfirmDeleteId(img.id)}
                            disabled={deletingId === img.id}
                            style={{ backgroundColor: '#be2e2e', padding: 8, borderRadius: 2 }}
                          >
                            {deletingId === img.id ? (
                              <ActivityIndicator size="small" color="#fff" />
                            ) : (
                              <Trash2 size={16} color="#fff" />
                            )}
                          </TouchableOpacity>
                        </View>
                      </View>
                      <Text style={{ fontSize: 10, color: mutedColor, marginTop: 4, textAlign: 'center' }} numberOfLines={1}>
                        {img.file_name}
                      </Text>
                    </View>
                  ))}
                </ScrollView>
              </View>
            )}

            {/* Upload Area */}
            {uploadDone ? (
              <View style={{ alignItems: 'center', paddingVertical: 40 }}>
                <View style={{ backgroundColor: '#f0fdf4', padding: 20, borderRadius: 100, marginBottom: 16 }}>
                  <CheckCircle size={48} color="#16a34a" />
                </View>
                <Text style={{ fontSize: 17, fontWeight: '800', color: textColor }}>Update Successful!</Text>
                <TouchableOpacity onPress={reset} style={{ marginTop: 24, paddingVertical: 12, paddingHorizontal: 32, backgroundColor: '#be2e2e', borderRadius: 2 }}>
                  <Text style={{ color: '#fff', fontWeight: '700' }}>Upload More</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <>
                <Text style={{ fontSize: 11, fontWeight: '800', color: mutedColor, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12 }}>
                  {pickedUri ? 'Image Selected' : 'Submission'}
                </Text>
                <TouchableOpacity
                  onPress={pickImage}
                  style={{
                    borderWidth: 2, borderColor: pickedUri ? '#be2e2e' : '#e5e7eb', borderStyle: 'dashed',
                    borderRadius: 2, height: 180, alignItems: 'center', justifyContent: 'center',
                    marginBottom: 20, backgroundColor: pickedUri ? 'transparent' : '#f9fafb'
                  }}
                >
                  {pickedUri ? (
                    <Image source={{ uri: pickedUri }} style={{ width: '100%', height: '100%' }} resizeMode="contain" />
                  ) : (
                    <View style={{ alignItems: 'center' }}>
                      <Upload size={40} color="#d1d5db" />
                      <Text style={{ color: mutedColor, marginTop: 12, fontWeight: '600' }}>Tap to select file</Text>
                      <Text style={{ color: '#d1d5db', fontSize: 11, marginTop: 2 }}>JPG, JPEG, PNG up to 5MB</Text>
                    </View>
                  )}
                </TouchableOpacity>

                <View style={{ flexDirection: 'row', gap: 10 }}>
                  {pickedUri && (
                    <TouchableOpacity onPress={() => setPickedUri(null)} style={{ flex: 1, padding: 14, borderRadius: 2, borderWidth: 1, borderColor: '#e5e7eb', alignItems: 'center' }}>
                      <Text style={{ fontWeight: '700' }}>Clear</Text>
                    </TouchableOpacity>
                  )}
                  <TouchableOpacity
                    onPress={pickedUri ? handleUpload : pickImage}
                    disabled={uploading}
                    style={{ flex: 2, backgroundColor: uploading ? '#d1d5db' : '#be2e2e', padding: 14, borderRadius: 2, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 8 }}
                  >
                    {uploading && <ActivityIndicator color="#fff" size="small" />}
                    <Text style={{ color: '#fff', fontWeight: '800' }}>{uploading ? 'Processing' : pickedUri ? 'Submit Record' : 'Browse Files'}</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>

      {/* ── Custom Deletion Confirmation Modal ── */}
      <Modal visible={confirmDeleteId !== null} transparent animationType="fade">
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', padding: 30 }}>
            <View style={{ backgroundColor: cardColor, borderRadius: 2, padding: 24, alignItems: 'center' }}>
                <View style={{ backgroundColor: '#fef2f2', padding: 16, borderRadius: 50, marginBottom: 16 }}>
                    <AlertTriangle size={36} color="#dc2626" />
                </View>
                <Text style={{ fontSize: 18, fontWeight: '800', color: textColor, marginBottom: 8 }}>Remove Image?</Text>
                <Text style={{ fontSize: 14, color: mutedColor, textAlign: 'center', marginBottom: 24 }}>
                    This will permanently delete this grade record from your file. This action cannot be undone.
                </Text>
                <View style={{ flexDirection: 'row', gap: 12, width: '100%' }}>
                    <TouchableOpacity 
                        onPress={() => setConfirmDeleteId(null)}
                        style={{ flex: 1, paddingVertical: 14, borderRadius: 2, borderWidth: 1, borderColor: '#e5e7eb', alignItems: 'center' }}
                    >
                        <Text style={{ fontWeight: '700' }}>Cancel</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                        onPress={executeDelete}
                        style={{ flex: 1, paddingVertical: 14, borderRadius: 2, backgroundColor: '#dc2626', alignItems: 'center' }}
                    >
                        <Text style={{ color: '#fff', fontWeight: '800' }}>Confirm</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
      </Modal>

      {/* ── Full Preview Modal ── */}
      <Modal visible={!!previewImage} transparent animationType="fade">
        <View style={{ flex: 1, backgroundColor: '#000', justifyContent: 'center' }}>
          <TouchableOpacity onPress={() => setPreviewImage(null)} style={{ position: 'absolute', top: 50, right: 20, zIndex: 10, backgroundColor: 'rgba(255,255,255,0.2)', padding: 10, borderRadius: 2 }}>
            <X size={24} color="#fff" />
          </TouchableOpacity>
          {previewImage && <Image source={{ uri: previewImage }} style={{ width: SCREEN_WIDTH, height: SCREEN_HEIGHT * 0.8 }} resizeMode="contain" />}
        </View>
      </Modal>

      {/* ── Blur Check Modals ── */}
      <ProgressModal 
        visible={checkingBlur} 
        title="Analyzing Image" 
        subtitle="Verifying image quality for medical records..." 
      />

      <BlurErrorModal
        visible={showBlurErrorModal}
        blurPercentage={blurPercentage}
        sharpPercentage={sharpPercentage}
        onClose={() => setShowBlurErrorModal(false)}
      />
    </>
  );
};

export default GradeUploadModal;
