import { chooseImage } from "zmp-sdk/apis";

/**
 * Chọn ảnh từ album hoặc camera của Zalo Mini App
 * @param {Object} options - Tùy chọn
 * @param {string[]} options.sourceType - Nguồn chọn: ["album"], ["camera"], ["album", "camera"]
 * @param {number} options.count - Số lượng ảnh tối đa có thể chọn (mặc định 1)
 * @returns {Promise<string>} Đường dẫn ảnh được chọn (base64 format)
 */
export const selectImageFromDevice = async (options = {}) => {
  try {
    const { sourceType = ["album", "camera"], count = 1 } = options;

    const result = await chooseImage({
      sourceType,
      count,
    });

    if (result && result.tempFiles && result.tempFiles.length > 0) {
      // Lấy file đầu tiên nếu chỉ chọn 1 ảnh
      const tempFile = result.tempFiles[0];
      return tempFile.path;
    }

    return null;
  } catch (error) {
    console.error("Error choosing image:", error);
    throw error;
  }
};

/**
 * Chọn ảnh từ album
 * @param {number} count - Số lượng ảnh tối đa
 * @returns {Promise<string>}
 */
export const selectImageFromAlbum = async (count = 1) => {
  return selectImageFromDevice({
    sourceType: ["album"],
    count,
  });
};

/**
 * Chụp ảnh từ camera Zalo Mini App
 * @param {string} cameraType - "front" hoặc "back" (mặc định "back")
 * @returns {Promise<string>}
 */
export const capturePhotoWithZaloCamera = async (cameraType = "back") => {
  try {
    const result = await chooseImage({
      sourceType: ["camera"],
      cameraType,
    });

    if (result && result.tempFiles && result.tempFiles.length > 0) {
      const tempFile = result.tempFiles[0];
      return tempFile.path;
    }

    return null;
  } catch (error) {
    console.error("Error capturing photo with Zalo camera:", error);
    throw error;
  }
};

/**
 * Chuyển đổi file path (base64) từ Zalo SDK sang Image element
 * @param {string} filePath - Đường dẫn từ chooseImage API
 * @returns {Promise<string>} Đường dẫn base64 hoặc blob URL
 */
export const convertZaloImageToDataUrl = async (filePath) => {
  try {
    // Nếu filePath đã là base64
    if (filePath.startsWith("data:")) {
      return filePath;
    }

    // Nếu là blob URL
    if (filePath.startsWith("blob:")) {
      return filePath;
    }

    // Nếu là file path cục bộ, cần fetch và convert
    const response = await fetch(filePath);
    const blob = await response.blob();
    return URL.createObjectURL(blob);
  } catch (error) {
    console.error("Error converting Zalo image:", error);
    return filePath; // Trả về filePath gốc nếu convert thất bại
  }
};
