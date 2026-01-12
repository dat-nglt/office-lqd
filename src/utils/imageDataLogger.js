/**
 * Logger utility để track chi tiết dữ liệu ảnh
 * Giúp debug và kiểm tra dữ liệu nhận được từ album
 */

export class ImageDataLogger {
  static logImageData(imageData, context = {}) {
    const timestamp = new Date().toISOString();
    
    const report = {
      timestamp,
      context,
      data: {
        type: this.getDataType(imageData),
        length: imageData.length,
        isBase64: imageData.startsWith("data:"),
        isBlob: imageData.startsWith("blob:"),
        preview: this.getPreview(imageData),
      },
    };

    console.group(`📸 Image Data Report [${context.label || "Unknown"}]`);
    console.log("🕐 Timestamp:", report.timestamp);
    console.log("📊 Data Type:", report.data.type);
    console.log("📏 Length:", report.data.length);
    console.log("🔍 Data Analysis:", {
      isBase64: report.data.isBase64,
      isBlob: report.data.isBlob,
    });
    console.log("👁️ Preview:", report.data.preview);
    console.log("📦 Full Data:", imageData);
    console.groupEnd();

    return report;
  }

  static getDataType(imageData) {
    if (typeof imageData !== "string") {
      return `Invalid type: ${typeof imageData}`;
    }

    if (imageData.startsWith("data:image/")) {
      const match = imageData.match(/data:image\/([\w]+);/);
      return match ? `Base64 (${match[1]})` : "Base64";
    }

    if (imageData.startsWith("blob:")) {
      return "Blob URL";
    }

    if (imageData.startsWith("file:")) {
      return "File Path";
    }

    return "Unknown Type";
  }

  static getPreview(imageData, length = 100) {
    if (imageData.startsWith("data:")) {
      return imageData.substring(0, length) + "...";
    }
    return imageData;
  }

  static logAlbumSelection(result, selectedFile) {
    console.group("🎯 Album Selection Result");
    console.log("📦 Full Result:", result);
    console.log("✅ Selected File:", selectedFile);
    console.log("📊 File Info:", {
      type: typeof selectedFile,
      preview: this.getPreview(selectedFile, 80),
    });
    console.groupEnd();
  }

  static logConversionProcess(input, output) {
    console.group("🔄 File Conversion Process");
    console.log("📥 Input:", {
      type: this.getDataType(input),
      preview: this.getPreview(input, 80),
    });
    console.log("📤 Output:", {
      type: this.getDataType(output),
      preview: this.getPreview(output, 80),
      sizeIncrease: `${(
        ((output.length - input.length) / input.length) * 100
      ).toFixed(2)}%`,
    });
    console.groupEnd();
  }

  static logImageInfo(imageElement) {
    if (!imageElement) return;

    const info = {
      src: imageElement.src,
      width: imageElement.width,
      height: imageElement.height,
      complete: imageElement.complete,
      srcType: this.getDataType(imageElement.src),
    };

    console.table(info);
  }

  static createDataSnapshot(imageData, metadata = {}) {
    return {
      timestamp: new Date().toISOString(),
      dataLength: imageData.length,
      dataType: this.getDataType(imageData),
      isBase64: imageData.startsWith("data:"),
      isBlob: imageData.startsWith("blob:"),
      preview: this.getPreview(imageData, 50),
      metadata,
      // Store first 500 chars for debugging
      dataPrefix: imageData.substring(0, 500),
    };
  }
}

// Convenience functions
export const logImageData = (imageData, context) =>
  ImageDataLogger.logImageData(imageData, context);

export const logAlbumSelection = (result, selectedFile) =>
  ImageDataLogger.logAlbumSelection(result, selectedFile);

export const logConversionProcess = (input, output) =>
  ImageDataLogger.logConversionProcess(input, output);

export const createDataSnapshot = (imageData, metadata) =>
  ImageDataLogger.createDataSnapshot(imageData, metadata);
