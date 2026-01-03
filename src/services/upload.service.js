import axiosInstance from "../config/axiosConfig";
import API_ENDPOINTS from "../config/apiEndpoints";

/**
 * Upload Service
 * Handles all image upload operations including Cloudinary signature generation and upload
 */

/**
 * Get Cloudinary signature from server
 * @param {string} folder - The folder name to store images in Cloudinary (default: 'attendances')
 * @returns {Promise<Object>} - { signature, timestamp, api_key, cloud_name, folder }
 */
export const getCloudinarySignature = async (folder) => {
  try {
    const response = await axiosInstance.post(
      API_ENDPOINTS.UPLOADS.CLOUDINARY_SIGN,
      { folder },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.data.success) {
      throw new Error(response.data.error || "Không thể lấy signature");
    }

    return response.data.data;
  } catch (error) {
    console.error("Error getting Cloudinary signature:", error);
    throw error.response?.data || error;
  }
};

/**
 * Upload image to Cloudinary using signed upload
 * @param {Blob} blob - Image blob to upload
 * @param {string} signature - Signature from server
 * @param {string} timestamp - Timestamp from server
 * @param {string} apiKey - Cloudinary API key
 * @param {string} cloudName - Cloudinary cloud name
 * @param {string} folder - Folder in Cloudinary
 * @returns {Promise<Object>} - { secure_url, public_id, ...otherCloudinaryData }
 */
export const uploadToCloudinary = async (blob, signature, timestamp, apiKey, cloudName, folder) => {
  try {
    const form = new FormData();
    form.append("file", blob);
    form.append("api_key", apiKey);
    form.append("timestamp", timestamp);
    form.append("signature", signature);
    form.append("folder", folder);

    const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
      method: "POST",
      body: form,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || "Upload ảnh thất bại");
    }

    const uploadData = await response.json();

    if (!uploadData.secure_url) {
      throw new Error("Upload ảnh thất bại - không nhận được URL");
    }

    return {
      photoUrl: uploadData.secure_url,
      photoPublicId: uploadData.public_id,
      uploadData: uploadData,
    };
  } catch (error) {
    console.error("Error uploading to Cloudinary:", error);
    throw error;
  }
};

/**
 * Submit check-in data with photo to server
 * @param {Object} checkInData - Check-in payload
 *   - latitude: number
 *   - longitude: number
 *   - location_name: string
 *   - address: string (optional)
 *   - check_in_type_id: string (optional)
 *   - violation_distance: number (optional)
 *   - photo_url: string
 *   - photo_public_id: string
 *   - mode: string ('in' or 'out')
 * @returns {Promise<Object>} - Attendance record from server
 */
export const submitCheckIn = async (checkInData) => {
  try {
    const response = await axiosInstance.post(API_ENDPOINTS.ATTENDANCE.SUBMIT_CHECKIN, checkInData);

    if (!response.data) {
      throw new Error(response.data?.error || "Lỗi khi gửi chấm công");
    }

    return response.data;
  } catch (error) {
    console.error("Error submitting check-in:", error);
    throw error.response?.data || error;
  }
};

export const submitCheckOut = async (checkOutData) => {
  try {
    const response = await axiosInstance.post(API_ENDPOINTS.ATTENDANCE.SUBMIT_CHECKOUT, checkOutData);

    if (!response.data) {
      throw new Error(response.data?.error || "Lỗi khi gửi chấm công");
    }

    return response.data;
  } catch (error) {
    console.error("Error submitting check-in:", error);
    throw error.response?.data || error;
  }
};

/**
 * Complete upload flow: Get signature -> Upload to Cloudinary -> Submit to server
 * @param {Blob} blob - Image blob to upload
 * @param {Object} checkInData - Check-in data (without photo info)
 *   - latitude, longitude, location_name, address, check_in_type_id, violation_distance, mode
 * @returns {Promise<Object>} - Complete attendance record from server
 */
export const uploadCheckInPhoto = async (blob, userNameForFolder) => {
  try {
    // Step 1: Get Cloudinary signature
    const folderByUser = `chamCong/${userNameForFolder || "chamCong"}`;

    const signatureData = await getCloudinarySignature(folderByUser);

    const { signature, timestamp, api_key, cloud_name, folder } = signatureData;

    // Step 2: Upload to Cloudinary
    const { photoUrl, photoPublicId } = await uploadToCloudinary(
      blob,
      signature,
      timestamp,
      api_key,
      cloud_name,
      folder
    );

    // Step 3: Submit check-in with photo info
    const payload = {
      photo_url: photoUrl,
      photo_public_id: photoPublicId,
    };

    return payload;
  } catch (error) {
    console.error("Error in uploadCheckInPhoto:", error);
    throw error;
  }
};

/**
 * Convert base64 data URI to Blob
 * @param {string} dataURI - Base64 data URI string (data:image/jpeg;base64,...)
 * @returns {Blob} - Blob object
 */
export const dataURItoBlob = (dataURI) => {
  try {
    const byteString = atob(dataURI.split(",")[1]);
    const mimeString = dataURI.split(",")[0].split(":")[1].split(";")[0];
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }
    return new Blob([ab], { type: mimeString });
  } catch (error) {
    console.error("Error converting data URI to blob:", error);
    throw new Error("Không thể xử lý ảnh");
  }
};

export const getTodayAttendanceHistory = async (userId) => {
  try {
    const response = await axiosInstance.get(`${API_ENDPOINTS.ATTENDANCE.GET_TODAY_HISTORY}/${userId}`);

    if (!response.data) {
      throw new Error(response.data?.error || "Lỗi khi lấy lịch sử chấm công hôm nay");
    }
    return response.data;
  } catch (error) {
    console.error("Error getting today's attendance history:", error);
    throw error.response?.data || error;
  }
};

export const getMonthAttendanceHistory = async (userId) => {
  try {
    const response = await axiosInstance.get(`${API_ENDPOINTS.ATTENDANCE.GET_MONTH_HISTORY}/${userId}`);
    if (!response.data) {
      throw new Error(response.data?.error || "Lỗi khi lấy lịch sử chấm công tháng này");
    }
    return response.data;
  } catch (error) {
    console.error("Error getting month's attendance history:", error);
    throw error.response?.data || error;
  }
};
