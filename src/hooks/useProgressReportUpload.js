import { useState, useCallback } from "react";
import {
  uploadProgressReportImage,
  uploadMultipleProgressReportImages,
  validateProgressReportImage,
} from "../services/progress-report-upload.service";

/**
 * Hook for uploading progress report images to Cloudinary
 * Handles upload state, error handling, and progress tracking
 */
export const useProgressReportUpload = () => {
  const [uploadState, setUploadState] = useState({
    isUploading: false,
    error: null,
    progress: 0,
    results: [],
  });

  /**
   * Upload single image
   * @param {string} imageData - Base64 or blob URL from album
   * @param {Object} options - Upload options
   * @returns {Promise<Object>} - Upload result
   */
  const uploadImage = useCallback(async (imageData, options = {}) => {
    try {
      setUploadState((prev) => ({
        ...prev,
        isUploading: true,
        error: null,
        progress: 0,
      }));

      // Validate image first
      const validation = await validateProgressReportImage(imageData, {
        maxSizeInMB: options.maxSizeInMB || 10,
      });

      if (!validation.valid) {
        throw new Error(validation.errors.join(", "));
      }

      // Upload
      const result = await uploadProgressReportImage(imageData, options);

      setUploadState((prev) => ({
        ...prev,
        isUploading: false,
        progress: 100,
        results: [result],
      }));

      return result;
    } catch (error) {
      setUploadState((prev) => ({
        ...prev,
        isUploading: false,
        error: error?.message || "Upload failed",
      }));
      throw error;
    }
  }, []);

  /**
   * Upload multiple images
   * @param {Array<string>} imageDatas - Array of base64 or blob URLs
   * @param {Object} options - Upload options
   * @returns {Promise<Array<Object>>} - Array of upload results
   */
  const uploadMultiple = useCallback(async (imageDatas, options = {}) => {
    try {
      setUploadState((prev) => ({
        ...prev,
        isUploading: true,
        error: null,
        progress: 0,
        results: [],
      }));

      const results = [];
      const total = imageDatas.length;

      for (let i = 0; i < total; i++) {
        const imageData = imageDatas[i];

        try {
          // Validate
          const validation = await validateProgressReportImage(imageData, {
            maxSizeInMB: options.maxSizeInMB || 10,
          });

          if (!validation.valid) {
            results.push({
              error: validation.errors.join(", "),
              index: i,
            });
          } else {
            // Upload
            const result = await uploadProgressReportImage(imageData, {
              ...options,
              stage: options.stage ? `${options.stage}_${i + 1}` : `image_${i + 1}`,
            });
            results.push(result);
          }
        } catch (error) {
          results.push({
            error: error?.message,
            index: i,
          });
        }

        // Update progress
        setUploadState((prev) => ({
          ...prev,
          progress: Math.round(((i + 1) / total) * 100),
          results,
        }));
      }

      setUploadState((prev) => ({
        ...prev,
        isUploading: false,
        progress: 100,
        results,
      }));

      return results;
    } catch (error) {
      setUploadState((prev) => ({
        ...prev,
        isUploading: false,
        error: error?.message || "Batch upload failed",
      }));
      throw error;
    }
  }, []);

  /**
   * Validate image before upload
   * @param {string} imageData - Base64 or blob URL
   * @param {Object} options - Validation options
   * @returns {Promise<Object>} - Validation result
   */
  const validateImage = useCallback(async (imageData, options = {}) => {
    return validateProgressReportImage(imageData, options);
  }, []);

  /**
   * Reset upload state
   */
  const resetState = useCallback(() => {
    setUploadState({
      isUploading: false,
      error: null,
      progress: 0,
      results: [],
    });
  }, []);

  return {
    ...uploadState,
    uploadImage,
    uploadMultiple,
    validateImage,
    resetState,
  };
};

export default useProgressReportUpload;
