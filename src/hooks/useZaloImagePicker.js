import { useState } from "react";
import { selectImageFromDevice, selectImageFromAlbum, capturePhotoWithZaloCamera } from "../utils/imageUtils";

/**
 * Custom hook để quản lý logic chọn ảnh từ Zalo Mini App
 * @returns {Object} - { selectImage, selectFromAlbum, captureFromCamera, isLoading }
 */
export const useZaloImagePicker = () => {
  const [isLoading, setIsLoading] = useState(false);

  const convertFilePathToDataUrl = async (filePath) => {
    try {
      // Nếu đã là base64
      if (filePath.startsWith("data:")) {
        return filePath;
      }

      // Nếu là blob URL
      if (filePath.startsWith("blob:")) {
        return filePath;
      }

      // Fetch file và convert thành base64
      const response = await fetch(filePath);
      const blob = await response.blob();
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.readAsDataURL(blob);
      });
    } catch (error) {
      console.error("Error converting file path to data URL:", error);
      return filePath;
    }
  };

  /**
   * Chọn ảnh từ album hoặc camera
   * @param {Object} options - { sourceType: ["album", "camera"], count: 1 }
   * @returns {Promise<string>} - Data URL của ảnh được chọn
   */
  const selectImage = async (options = {}) => {
    setIsLoading(true);
    try {
      const filePath = await selectImageFromDevice(options);
      if (filePath) {
        const dataUrl = await convertFilePathToDataUrl(filePath);
        return dataUrl;
      }
      return null;
    } catch (error) {
      console.error("Error selecting image:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Chọn ảnh từ album
   * @returns {Promise<string>} - Data URL của ảnh được chọn
   */
  const selectFromAlbum = async () => {
    setIsLoading(true);
    try {
      const filePath = await selectImageFromAlbum(1);
      if (filePath) {
        const dataUrl = await convertFilePathToDataUrl(filePath);
        return dataUrl;
      }
      return null;
    } catch (error) {
      console.error("Error selecting from album:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Chụp ảnh từ camera Zalo Mini App
   * @param {string} cameraType - "front" hoặc "back"
   * @returns {Promise<string>} - Data URL của ảnh được chụp
   */
  const captureFromCamera = async (cameraType = "back") => {
    setIsLoading(true);
    try {
      const filePath = await capturePhotoWithZaloCamera(cameraType);
      if (filePath) {
        const dataUrl = await convertFilePathToDataUrl(filePath);
        return dataUrl;
      }
      return null;
    } catch (error) {
      console.error("Error capturing from camera:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    selectImage,
    selectFromAlbum,
    captureFromCamera,
    isLoading,
  };
};
