import { Box, Text, Icon, Button } from "zmp-ui";
import { useEffect, useState, useCallback } from "react";
import { selectImageFromDevice } from "../../utils/imageUtils";
import { logImageData, logAlbumSelection, logConversionProcess, createDataSnapshot } from "../../utils/imageDataLogger";

// Debug mode - set to true để xem chi tiết logs
const DEBUG = true;

const debug = (label, data) => {
  if (DEBUG) {
    console.log(`[CameraView] ${label}:`, data);
  }
};

function CameraView({
  videoRef,
  canvasRef,
  capturedPhoto,
  selectedStage,
  progressNotes,
  progressStages,
  onCapturePhoto,
  onRetakePhoto,
  onProgressNotesChange,
  onSaveReport,
  onCancel,
  onImageSelected,
  reportId,
  technicianName,
  onUploadProgress,
}) {
  const [imageState, setImageState] = useState({
    isLoading: false,
    error: null,
  });

  // Cleanup camera khi component unmount
  useEffect(() => {
    return () => {
      if (videoRef?.current?.srcObject) {
        videoRef.current.srcObject.getTracks().forEach((track) => track.stop());
      }
    };
  }, [videoRef]);

  // Khởi động camera khi chưa có ảnh
  useEffect(() => {
    if (!capturedPhoto && videoRef?.current) {
      const startCamera = async () => {
        try {
          debug("Starting camera", { facingMode: "environment" });
          const stream = await navigator.mediaDevices.getUserMedia({
            video: {
              facingMode: "environment",
              width: { ideal: 720 },
              height: { ideal: 720 },
            },
          });
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            debug("Camera started successfully", null);
          }
        } catch (error) {
          debug("Camera error", error?.message);
          setImageState((prev) => ({
            ...prev,
            error: "Không thể truy cập camera",
          }));
        }
      };
      startCamera();
    }
  }, [capturedPhoto, videoRef]);

  const convertFilePathToDataUrl = useCallback(async (filePath) => {
    try {
      debug("Converting file path", { filePath, type: typeof filePath });

      // Nếu đã là base64
      if (filePath.startsWith("data:")) {
        debug("File is already base64", {
          length: filePath.length,
          preview: filePath.substring(0, 50),
        });
        return filePath;
      }

      // Nếu là blob URL
      if (filePath.startsWith("blob:")) {
        debug("File is blob URL", { url: filePath });
        return filePath;
      }

      // Fetch file và convert thành base64
      debug("Fetching file", { url: filePath });
      const response = await fetch(filePath);
      const blob = await response.blob();

      debug("Blob received", {
        size: blob.size,
        type: blob.type,
        sizeInMB: (blob.size / (1024 * 1024)).toFixed(2),
      });

      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const result = reader.result;
          debug("File converted to base64", {
            dataUrlLength: result.length,
            dataUrlLengthInMB: (result.length / (1024 * 1024)).toFixed(2),
            preview: result.substring(0, 50) + "...",
          });
          resolve(result);
        };
        reader.onerror = () => {
          debug("FileReader error", reader.error);
          resolve(filePath);
        };
        reader.readAsDataURL(blob);
      });
    } catch (error) {
      debug("Error converting file path", {
        message: error?.message,
        stack: error?.stack,
      });
      return filePath;
    }
  }, []);

  /**
   * Handle upload to Cloudinary
   * Removed - Upload now happens when user clicks "Gửi Báo Cáo" in ProgressReport.jsx
   */
  const handleSelectImageFromDevice = useCallback(async () => {
    debug("Album selection started", null);
    setImageState({
      isLoading: true,
      error: null,
    });

    try {
      const filePath = await selectImageFromDevice({
        sourceType: ["album"],
        count: 1,
      });

      // Log album selection result
      if (filePath) {
        logAlbumSelection({ sourceType: ["album"], count: 1 }, filePath);
      }

      debug("Album selection result", { filePath, pathType: typeof filePath });

      if (!filePath) {
        debug("No file selected", null);
        setImageState((prev) => ({
          ...prev,
          isLoading: false,
          error: "Vui lòng chọn ảnh",
        }));
        return;
      }

      // Chuyển đổi file path thành data URL
      const imageData = await convertFilePathToDataUrl(filePath);

      // Log conversion result
      if (filePath !== imageData) {
        logConversionProcess(filePath, imageData);
      }

      // Create detailed snapshot of final image data
      const dataSnapshot = createDataSnapshot(imageData, {
        source: "album",
        stage: "after_conversion",
      });
      debug("Image data snapshot", dataSnapshot);

      // Log final image data
      logImageData(imageData, { label: "Album Upload - Final Data" });

      if (onImageSelected) {
        onImageSelected(imageData);
      }

      setImageState({
        isLoading: false,
        error: null,
      });
    } catch (error) {
      debug("Album selection error", error?.message);
      setImageState({
        isLoading: false,
        error: error?.message || "Lỗi khi chọn ảnh",
      });
    }
  }, [convertFilePathToDataUrl, onImageSelected]);

  return (
    <>
      {/* Error Message */}
      {imageState.error && (
        <Box className="mb-4 p-3 bg-red-100 border border-red-400 rounded-lg">
          <Text className="text-sm text-red-800 font-semibold">{imageState.error}</Text>
        </Box>
      )}

      {/* Camera View */}
      <Box className="mb-4 relative">
        <Box className="relative w-full aspect-square rounded-2xl overflow-hidden border-4 border-blue-600 shadow-lg bg-black">
          {!capturedPhoto ? (
            <>
              <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
              <Box className="absolute inset-0 pointer-events-none">
                <Box className="absolute inset-0 border-2 border-white/30 opacity-50">
                  <Box className="absolute top-1/3 left-0 right-0 border-t border-white/30"></Box>
                  <Box className="absolute top-2/3 left-0 right-0 border-t border-white/30"></Box>
                  <Box className="absolute left-1/3 top-0 bottom-0 border-l border-white/30"></Box>
                  <Box className="absolute left-2/3 top-0 bottom-0 border-l border-white/30"></Box>
                </Box>
                <Box className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-20 h-20 border-2 border-blue-400 rounded-full"></Box>
              </Box>
              <Box className="absolute top-4 left-4 px-3 py-1 bg-black/60 rounded-full border border-white/30">
                <Text className="text-xs text-white font-semibold flex items-center gap-1">
                  <Icon icon="zi-video" size={12} />
                  Camera Sau
                </Text>
              </Box>
            </>
          ) : (
            <img src={capturedPhoto} alt="Captured" className="w-full h-full object-cover" />
          )}
        </Box>
        <canvas ref={canvasRef} className="hidden" />
      </Box>

      {/* Photo Info & Notes */}
      {capturedPhoto && (
        <Box className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 mb-4">
          <Text className="font-bold text-gray-900 mb-3">Thông Tin Báo Cáo</Text>
          <Box className="space-y-2 mb-3">
            <Box className="flex justify-between items-center p-2 bg-gray-50 rounded-lg border border-gray-200">
              <Text className="text-xs text-gray-600">Giai Đoạn:</Text>
              <Text className="text-xs font-semibold text-gray-900">
                {progressStages.find((s) => s.id === selectedStage)?.name}
              </Text>
            </Box>
            <Box className="flex justify-between items-center p-2 bg-gray-50 rounded-lg border border-gray-200">
              <Text className="text-xs text-gray-600">Giờ:</Text>
              <Text className="text-xs font-semibold text-gray-900">
                {new Date().toLocaleTimeString("vi-VN", {
                  hour: "2-digit",
                  minute: "2-digit",
                  second: "2-digit",
                })}
              </Text>
            </Box>
          </Box>

          <Box>
            <Text className="text-xs text-gray-600 font-semibold mb-1">Ghi chú (tùy chọn):</Text>
            <textarea
              value={progressNotes}
              onChange={(e) => onProgressNotesChange(e.target.value)}
              placeholder="Mô tả chi tiết về tình trạng và quá trình làm việc..."
              className="w-full p-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:border-blue-500"
              rows={2}
            />
          </Box>
        </Box>
      )}

      {/* Action Buttons */}
      <Box className="space-y-2">
        {!capturedPhoto ? (
          <>
            <Box className="grid grid-cols-3 gap-2">
              <Button
                onClick={onCancel}
                fullWidth
                disabled={imageState.isLoading}
                className="w-full px-3 py-3 bg-gray-200 text-gray-800 rounded-lg text-sm font-semibold hover:bg-gray-300 transition-colors disabled:opacity-50"
              >
                <Icon icon="zi-backup-arrow-solid" size={16} className="mb-0.5 mr-1" />
                Hủy
              </Button>
              <Button
                variant="primary"
                fullWidth
                onClick={onCapturePhoto}
                disabled={imageState.isLoading}
                className="py-3 rounded-lg font-semibold text-base bg-blue-600 hover:bg-blue-700 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <Icon icon="zi-camera" size={16} className="mb-0.5 mx-1" />
                Chụp Ảnh
              </Button>
              <Button
                variant="secondary"
                fullWidth
                onClick={handleSelectImageFromDevice}
                disabled={imageState.isLoading}
                className="py-3 rounded-lg font-semibold text-base bg-orange-600 hover:bg-orange-700 flex items-center justify-center gap-2 text-white disabled:opacity-50"
              >
                <Icon icon="zi-gallery" size={16} className="mb-0.5 mx-1" />
                {imageState.isLoading ? "Tải..." : "Thư viện"}
              </Button>
            </Box>
          </>
        ) : (
          <>
            <Box className="grid grid-cols-3 gap-2">
              <Button
                onClick={onCancel}
                disabled={imageState.isLoading}
                className="px-3 py-3 bg-gray-200 text-gray-800 rounded-lg text-sm font-semibold hover:bg-gray-300 transition-colors disabled:opacity-50"
              >
                <Icon icon="zi-backup-arrow-solid" size={16} className="mb-0.5 mr-1" />
                Hủy
              </Button>
              <Button
                variant="primary"
                onClick={onRetakePhoto}
                disabled={imageState.isLoading}
                className="px-3 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold transition-colors flex items-center justify-center gap-1 disabled:opacity-50"
              >
                <Icon icon="zi-camera" size={16} className="mb-0.5 mr-1" />
                Chụp Lại
              </Button>
              <Button
                variant="secondary"
                onClick={handleSelectImageFromDevice}
                disabled={imageState.isLoading}
                className="py-3 rounded-lg font-semibold text-base bg-orange-600 hover:bg-orange-700 flex items-center justify-center gap-2 text-white disabled:opacity-50"
              >
                <Icon icon="zi-gallery" size={16} className="mb-0.5 mx-1" />
                {imageState.isLoading ? "Tải..." : "Thư viện"}
              </Button>
            </Box>

            <Box className="mt-2">
              <Button
                variant="primary"
                onClick={onSaveReport}
                disabled={imageState.isLoading}
                className="w-full py-3 rounded-lg font-semibold text-base bg-green-600 hover:bg-green-700 flex items-center justify-center gap-2 text-white disabled:opacity-50"
              >
                <Icon icon="zi-check-circle" size={16} className="mb-0.5 mr-1" />
                Thêm Ảnh
              </Button>
            </Box>
          </>
        )}
      </Box>
    </>
  );
}

export default CameraView;
