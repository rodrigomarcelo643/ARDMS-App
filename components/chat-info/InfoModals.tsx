import React from 'react';
import { View, Text, Modal, TouchableOpacity, Image } from 'react-native';

interface InfoModalsProps {
  imageModalVisible: boolean;
  imageCarousel: string[];
  currentImageIndex: number;
  onCloseImageModal: () => void;
  onPrevImage: () => void;
  onNextImage: () => void;
}

export const InfoModals: React.FC<InfoModalsProps> = ({
  imageModalVisible,
  imageCarousel,
  currentImageIndex,
  onCloseImageModal,
  onPrevImage,
  onNextImage,
}) => (
  <Modal
    visible={imageModalVisible}
    transparent={true}
    animationType="fade"
    onRequestClose={onCloseImageModal}
  >
    <View className="flex-1 bg-black">
      {/* Close Button */}
      <TouchableOpacity
        className="absolute top-12 right-4 z-10 w-14 h-14 rounded-full bg-white bg-opacity-90 items-center justify-center shadow-lg"
        onPress={onCloseImageModal}
        style={{ elevation: 5 }}
      >
        <Text className="text-black text-2xl font-bold">×</Text>
      </TouchableOpacity>
      
      {/* Image Counter */}
      {imageCarousel.length > 1 && (
        <View className="absolute top-12 left-4 z-10 px-3 py-1 rounded-full bg-black bg-opacity-50">
          <Text className="text-white text-sm">{currentImageIndex + 1} / {imageCarousel.length}</Text>
        </View>
      )}
      
      {/* Current Image */}
      {imageCarousel[currentImageIndex] && (
        <Image
          source={{ uri: imageCarousel[currentImageIndex] }}
          className="flex-1"
          resizeMode="contain"
        />
      )}
      
      {/* Navigation Buttons */}
      {imageCarousel.length > 1 && (
        <>
          {/* Previous Button */}
          {currentImageIndex > 0 && (
            <TouchableOpacity
              className="absolute left-4 top-1/2 w-12 h-12 rounded-full bg-black bg-opacity-50 items-center justify-center"
              onPress={onPrevImage}
              style={{ marginTop: -24 }}
            >
              <Text className="text-white text-2xl font-bold">‹</Text>
            </TouchableOpacity>
          )}
          
          {/* Next Button */}
          {currentImageIndex < imageCarousel.length - 1 && (
            <TouchableOpacity
              className="absolute right-4 top-1/2 w-12 h-12 rounded-full bg-black bg-opacity-50 items-center justify-center"
              onPress={onNextImage}
              style={{ marginTop: -24 }}
            >
              <Text className="text-white text-2xl font-bold">›</Text>
            </TouchableOpacity>
          )}
        </>
      )}
    </View>
  </Modal>
);
