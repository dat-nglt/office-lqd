import { getCloudinarySignature, uploadToCloudinary } from "./upload.service";
import { logImageData, createDataSnapshot } from "../utils/imageDataLogger";

/**
 * Progress Report Upload Service
 * Handles uploading progress report images to Cloudinary
 * Supports both base64 and blob URLs from album selection
 */

/**
 * Convert base64 or blob URL to Blob
 * @param {string} imageData - Base64 string or blob URL
 * @returns {Promise<Blob>} - Blob object
 */
export const dataUrlToBlob = async (imageData) => {
  try {
    if (imageData.startsWith("data:")) {
      // Base64 to Blob
      const arr = imageData.split(",");
      const mimeMatch = arr[0].match(/:(.*?);/);
      const mime = mimeMatch ? mimeMatch[1] : "image/jpeg";
      const bstr = atob(arr[1]);
      const n = bstr.length;
      const u8arr = new Uint8Array(n);

      for (let i = 0; i < n; i++) {
        u8arr[i] = bstr.charCodeAt(i);
      }

      const blob = new Blob([u8arr], { type: mime });
      return blob;
    } else if (imageData.startsWith("blob:")) {
      // Blob URL to Blob
      const response = await fetch(imageData);
      const blob = await response.blob();
      return blob;
    } else {
      throw new Error("Invalid image format - must be base64 or blob URL");
    }
  } catch (error) {
    throw error;
  }
};

/**
 * Upload single progress report image to Cloudinary
 * @param {string} imageData - Base64 or blob URL from album
 * @param {Object} options - Upload options
 *   - reportId: string (work report ID)
 *   - stage: string ('before', 'during', 'after')
 *   - technicianName: string
 *   - compressImage: boolean (default: true)
 * @returns {Promise<Object>} - { secureUrl, publicId, size, type, metadata }
 */
export const uploadProgressReportImage = async (imageData, options = {}) => {
  const startTime = Date.now();

  try {
    const { reportId = "report", stage = "progress", technicianName = "technician", compressImage = true } = options;

    // Step 1: Create data snapshot
    const preUploadSnapshot = createDataSnapshot(imageData, {
      source: "album",
      stage: "pre_upload",
    });

    // Step 2: Convert data URL to Blob
    let blob = await dataUrlToBlob(imageData);
    const originalBlobSize = blob.size;

    // Step 3: Optional image compression
    if (compressImage && blob.size > 1024 * 1024) {
      // Only compress if > 1MB
      blob = await compressImageBlob(blob);
    }

    // Step 4: Get Cloudinary signature
    const folderPath = `progress-reports/${technicianName}/${reportId}/${stage}`;

    const signatureData = await getCloudinarySignature(folderPath);
    const { signature, timestamp, api_key, cloud_name, folder } = signatureData;

    // Step 5: Upload to Cloudinary
    const uploadStartTime = Date.now();

    const uploadResult = await uploadToCloudinary(blob, signature, timestamp, api_key, cloud_name, folder);

    const uploadDuration = Date.now() - uploadStartTime;

    // Step 6: Create final report
    const totalDuration = Date.now() - startTime;
    const finalReport = {
      secureUrl: uploadResult.photoUrl,
      publicId: uploadResult.photoPublicId,
      metadata: {
        timestamp: new Date().toISOString(),
        source: "album",
        stage,
        reportId,
        technicianName,
        blobSize: originalBlobSize,
        compressedSize: blob.size,
        type: blob.type,
        uploadDuration: uploadDuration + "ms",
        totalDuration: totalDuration + "ms",
        cloudinary: {
          format: uploadResult.uploadData.format,
          width: uploadResult.uploadData.width,
          height: uploadResult.uploadData.height,
          bytes: uploadResult.uploadData.bytes,
          secure_url: uploadResult.uploadData.secure_url,
          public_id: uploadResult.uploadData.public_id,
        },
      },
    };

    logImageData(uploadResult.photoUrl, {
      label: `Progress Report Upload Success - ${stage}`,
    });

    return finalReport;
  } catch (error) {
    throw error;
  }
};

/**
 * Upload multiple progress report images
 * @param {Array<string>} imageDatas - Array of base64 or blob URLs
 * @param {Object} options - Upload options (same as uploadProgressReportImage)
 * @returns {Promise<Array<Object>>} - Array of upload results
 */
export const uploadMultipleProgressReportImages = async (imageDatas, options = {}) => {
  try {
    const results = [];

    for (let i = 0; i < imageDatas.length; i++) {
      const imageData = imageDatas[i];
      const stage = options.stage || `image_${i + 1}`;

      try {
        const result = await uploadProgressReportImage(imageData, {
          ...options,
          stage,
        });
        results.push(result);
      } catch (error) {
        throw new Error(`Upload failed for image index ${i}: ${error?.message}`);
      }
    }

    return results;
  } catch (error) {
    throw error;
  }
};

/**
 * Compress image blob using canvas (lossy compression)
 * @param {Blob} blob - Original blob
 * @param {number} quality - Compression quality (0-1), default 0.7
 * @returns {Promise<Blob>} - Compressed blob
 */
export const compressImageBlob = async (blob, quality = 0.7) => {
  return new Promise((resolve, reject) => {
    try {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement("canvas");
          const ctx = canvas.getContext("2d");

          // Set canvas size to image size
          canvas.width = img.width;
          canvas.height = img.height;

          // Draw image on canvas
          ctx.drawImage(img, 0, 0);

          // Convert canvas to blob with quality
          canvas.toBlob(
            (compressedBlob) => {
              if (compressedBlob) {
                resolve(compressedBlob);
              } else {
                resolve(blob); // Fallback to original if compression fails
              }
            },
            "image/jpeg",
            quality
          );
        };
        img.onerror = () => reject(new Error("Failed to load image for compression"));
        img.src = event.target.result;
      };
      reader.onerror = () => reject(new Error("Failed to read blob"));
      reader.readAsDataURL(blob);
    } catch (error) {
      reject(error);
    }
  });
};

/**
 * Validate image before upload
 * @param {string} imageData - Base64 or blob URL
 * @param {Object} options - Validation options
 *   - maxSizeInMB: number (default: 10)
 *   - allowedFormats: array (default: ['image/jpeg', 'image/png', 'image/webp'])
 * @returns {Object} - { valid: boolean, errors: array }
 */
export const validateProgressReportImage = async (imageData, options = {}) => {
  const { maxSizeInMB = 10, allowedFormats = ["image/jpeg", "image/png", "image/webp"] } = options;

  const errors = [];

  try {
    // Check format
    if (!imageData.startsWith("data:") && !imageData.startsWith("blob:")) {
      errors.push("Invalid image format - must be base64 or blob URL");
      return { valid: false, errors };
    }

    // Convert to blob for validation
    const blob = await dataUrlToBlob(imageData);

    // Check size
    const sizeInMB = blob.size / (1024 * 1024);
    if (sizeInMB > maxSizeInMB) {
      errors.push(`Image size ${sizeInMB.toFixed(2)}MB exceeds maximum ${maxSizeInMB}MB`);
    }

    // Check MIME type
    if (!allowedFormats.includes(blob.type)) {
      errors.push(`Image format ${blob.type} not allowed. Allowed: ${allowedFormats.join(", ")}`);
    }

    return {
      valid: errors.length === 0,
      errors,
      metadata: {
        size: blob.size,
        sizeInMB: sizeInMB.toFixed(2),
        type: blob.type,
      },
    };
  } catch (error) {
    errors.push(`Validation error: ${error?.message}`);
    return { valid: false, errors };
  }
};
