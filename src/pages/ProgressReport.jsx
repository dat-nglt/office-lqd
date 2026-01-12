import { Box, Button, Page, Icon, Text, Spinner } from "zmp-ui";
import { useState, useRef, useEffect, useContext } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { ToastContext } from "../components/layout";
import BottomNavigation from "../components/BottomNavigation";
import { getWorkByID } from "../services/work-management.service";
import useProgressReportUpload from "../hooks/useProgressReportUpload";
import {
  WorkAssignmentCard,
  ProgressStagesSelection,
  CameraView,
  ProgressReportsSummary,
  ImagePreviewModal,
  SubmittedReportsHistory,
} from "../components/ProgressReport";

function ProgressReport() {
  const toast = useContext(ToastContext);
  const navigate = useNavigate();
  const params = useParams();
  const [searchParams] = useSearchParams();
  const workIdForReport = params.id || searchParams.get("id");
  const [userInfo, setUserInfo] = useState(null);

  // Live clock to update header time every second
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Current work assignment
  const [currentWork, setCurrentWork] = useState({
    id: 1,
    title: "Bảo trì điều hòa",
    location: "05A Quốc Hương, Phường An Khánh, Quận 2, TP.HCM",
    scheduledTime: "08:00 - 12:00",
    company: "NEXUS HOUSE",
    customer: "Nguyễn Văn A",
    requirements: ["Kiểm tra gas hệ thống", "Vệ sinh bộ lọc", "Kiểm tra hoạt động", "Lấy ký xác nhận khách hàng"],
  });

  // Progress stages
  const [progressStages] = useState([
    {
      id: "before",
      name: "Trước Khi Thực Hiện",
      description: "Chụp ảnh trạng thái ban đầu của công việc",
      icon: "zi-chevron-double-up",
      color: "from-blue-600 to-blue-700",
      bgColor: "bg-blue-50",
      badgeColor: "bg-blue-100 text-blue-800",
    },
    {
      id: "during",
      name: "Trong Quá Trình Thực Hiện",
      description: "Chụp ảnh quá trình làm việc",
      icon: "zi-auto-solid",
      color: "from-amber-600 to-amber-700",
      bgColor: "bg-amber-50",
      badgeColor: "bg-amber-100 text-amber-800",
    },
    {
      id: "after",
      name: "Sau Khi Hoàn Thành",
      description: "Chụp ảnh kết quả cuối cùng của công việc",
      icon: "zi-check-circle",
      color: "from-green-600 to-green-700",
      bgColor: "bg-green-50",
      badgeColor: "bg-green-100 text-green-800",
    },
  ]);

  const [selectedStage, setSelectedStage] = useState(null);
  const [showCamera, setShowCamera] = useState(false);
  const [capturedPhoto, setCapturedPhoto] = useState(null);
  const [progressNotes, setProgressNotes] = useState("");
  const [progressReports, setProgressReports] = useState([]);
  const [submittedReports, setSubmittedReports] = useState([]);
  const [showPreview, setShowPreview] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const [previewReport, setPreviewReport] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  // Upload hook for batch upload
  const {
    isUploading: isBatchUploading,
    progress: batchUploadProgress,
    error: batchUploadError,
    uploadMultiple: batchUploadImages,
    resetState: resetUploadState,
  } = useProgressReportUpload();

  const capturePhoto = () => {
    if (canvasRef.current && videoRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext("2d");

      const size = 720;
      canvas.width = size;
      canvas.height = size;

      const videoWidth = video.videoWidth;
      const videoHeight = video.videoHeight;
      const videoAspectRatio = videoWidth / videoHeight;

      let sourceX, sourceY, sourceWidth, sourceHeight;

      if (videoAspectRatio > 1) {
        sourceHeight = videoHeight;
        sourceWidth = videoHeight;
        sourceX = (videoWidth - sourceWidth) / 2;
        sourceY = 0;
      } else {
        sourceWidth = videoWidth;
        sourceHeight = videoWidth;
        sourceX = 0;
        sourceY = (videoHeight - sourceHeight) / 2;
      }

      context.drawImage(video, sourceX, sourceY, sourceWidth, sourceHeight, 0, 0, size, size);

      const imageData = canvas.toDataURL("image/jpeg", 0.95);
      setCapturedPhoto(imageData);

      const stream = video.srcObject;
      const tracks = stream.getTracks();
      tracks.forEach((track) => track.stop());
    }
  };

  const handleSaveProgressReport = () => {
    if (!capturedPhoto || !selectedStage) {
      toast?.error({
        title: "Thông tin chưa đủ",
        message: "Vui lòng cung cấp đầy đủ thông tin",
        duration: 2000,
      });
      return;
    }

    const now = new Date();
    const stageInfo = progressStages.find((s) => s.id === selectedStage);

    const newReport = {
      id: Date.now(),
      stageId: selectedStage,
      stageName: stageInfo.name,
      photo: capturedPhoto,
      notes: progressNotes,
      timestamp: now.toLocaleTimeString("vi-VN", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      }),
      date: now.toLocaleDateString("vi-VN"),
      duringCount: selectedStage === "during" ? progressReports.filter((r) => r.stageId === "during").length + 1 : null,
    };

    setProgressReports([...progressReports, newReport]);

    toast?.success({
      title: "Lưu thành công",
      message: `Đã lưu ảnh báo cáo ${stageInfo.name.toLowerCase()}`,
      duration: 2000,
    });

    // Reset
    setCapturedPhoto(null);
    setShowCamera(false);
    setSelectedStage(null);
    setProgressNotes("");
  };

  const retakePhoto = () => {
    setCapturedPhoto(null);
    startCamera();
  };

  const handleSelectStage = (stageId) => {
    setSelectedStage(stageId);
    setProgressNotes("");
    setShowCamera(true);
  };

  const handleDeleteReport = (id) => {
    setProgressReports(progressReports.filter((r) => r.id !== id));
    toast?.success({
      title: "Xóa thành công",
      message: "Ảnh báo cáo đã được xóa",
      duration: 2000,
    });
  };

  const handleSubmitAllReports = async () => {
    if (progressReports.length === 0) {
      toast?.error({
        title: "Không có báo cáo",
        message: "Vui lòng chụp ít nhất một ảnh báo cáo",
        duration: 2000,
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Extract all photos from progress reports
      const photosToUpload = progressReports.map((report) => report.photo);

      // Upload all images to Cloudinary
      const uploadResults = await batchUploadImages(photosToUpload, {
        reportId: currentWork.id,
        compressImage: true,
      });

      // Check if all uploads were successful
      const failedUploads = uploadResults.filter((result) => result.error);
      if (failedUploads.length > 0) {
        toast?.error({
          title: "Lỗi upload",
          message: `Có ${failedUploads.length} ảnh upload thất bại`,
          duration: 2500,
        });
        return;
      }

      // Update progressReports with Cloudinary URLs
      const updatedReports = progressReports.map((report, index) => ({
        ...report,
        cloudinaryUrl: uploadResults[index]?.secureUrl,
        cloudinaryPublicId: uploadResults[index]?.publicId,
      }));

      // Save submitted reports
      const newSubmission = {
        id: Date.now(),
        workId: currentWork.id,
        workTitle: currentWork.title,
        workCompany: currentWork.company,
        submittedDate: new Date().toLocaleDateString("vi-VN"),
        submittedTime: new Date().toLocaleTimeString("vi-VN", {
          hour: "2-digit",
          minute: "2-digit",
        }),
        reports: updatedReports,
        totalPhotos: updatedReports.length,
      };

      setSubmittedReports([newSubmission, ...submittedReports]);
      setProgressReports([]);
      resetUploadState();

      toast?.success({
        title: "Gửi báo cáo thành công",
        message: `Đã upload ${newSubmission.totalPhotos} ảnh lên Cloudinary`,
        duration: 2500,
      });
    } catch (error) {
      console.error("Error submitting reports:", error);
      toast?.error({
        title: "Lỗi gửi báo cáo",
        message: error?.message || "Không thể gửi báo cáo",
        duration: 2500,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePreviewImage = (report) => {
    setPreviewImage(report.photo);
    setPreviewReport(report);
    setShowPreview(true);
  };

  const handleImageSelected = (imageDataUrl) => {
    if (imageDataUrl) {
      setCapturedPhoto(imageDataUrl);
    }
  };

  useEffect(() => {
    if (showCamera && !capturedPhoto) {
      startCamera();
    }
  }, [showCamera, capturedPhoto]);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "environment",
          width: { ideal: 720 },
          height: { ideal: 720 },
        },
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (error) {
      console.error("Error accessing camera:", error);
      toast?.error({
        title: "Lỗi camera",
        message: "Không thể truy cập camera",
        duration: 2000,
      });
    }
  };

  useEffect(() => {
    const fetchWorkForReport = async () => {
      try {
        if (workIdForReport) {
          const workForReportResp = await getWorkByID(workIdForReport);
          if (workForReportResp) {
            console.log("Work for Report:", workForReportResp.data);
            setCurrentWork(workForReportResp.data);
          }
        }
      } catch (error) {
        console.error("Error fetching work for report:", error);
      }
    };

    fetchWorkForReport();
  }, []);

  return (
    <Page className="bg-gray-50 min-h-screen pb-20">
      {/* Header */}
      <PageHeader currentTime={currentTime} />

      <Box className="p-4 pb-20 relative">
        {!showCamera ? (
          <>
            {/* Current Work Assignment */}
            <WorkAssignmentCard currentWork={currentWork} />

            {/* Progress Stages Selection */}
            <ProgressStagesSelection
              progressStages={progressStages}
              selectedStage={selectedStage}
              progressReports={progressReports}
              onSelectStage={handleSelectStage}
            />

            {/* Progress Reports Summary */}
            <ProgressReportsSummary
              progressReports={progressReports}
              onDeleteReport={handleDeleteReport}
              onPreviewImage={handlePreviewImage}
            />

            {/* Action Buttons */}
            <Box className="space-y-2">
              {/* Error Display */}
              {batchUploadError && (
                <Box className="mb-4 p-3 bg-red-100 border border-red-400 rounded-lg">
                  <Text className="text-sm text-red-800 font-semibold">{batchUploadError}</Text>
                </Box>
              )}

              {progressReports.length > 0 && (
                <Button
                  variant="primary"
                  fullWidth
                  onClick={handleSubmitAllReports}
                  disabled={isSubmitting || isBatchUploading}
                  className="py-3 rounded-lg font-semibold text-base bg-green-600 hover:bg-green-700 flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <Icon icon="zi-send" size={16} />
                  {isSubmitting || isBatchUploading ? "Đang gửi..." : `Gửi Báo Cáo (${progressReports.length} ảnh)`}
                </Button>
              )}

              <Button
                variant="tertiary"
                fullWidth
                onClick={() => navigate("/work-management")}
                disabled={isSubmitting || isBatchUploading}
                className="py-3 rounded-lg font-semibold text-base bg-gray-200 hover:bg-gray-300 text-gray-800 disabled:opacity-50"
              >
                Quay Lại
              </Button>
            </Box>

            {/* Submitted Reports History */}
            <SubmittedReportsHistory submittedReports={submittedReports} onPreviewImage={handlePreviewImage} />
          </>
        ) : (
          <>
            {/* Camera View */}
            <CameraView
              videoRef={videoRef}
              canvasRef={canvasRef}
              capturedPhoto={capturedPhoto}
              selectedStage={selectedStage}
              progressNotes={progressNotes}
              progressStages={progressStages}
              onCapturePhoto={capturePhoto}
              onRetakePhoto={retakePhoto}
              onProgressNotesChange={setProgressNotes}
              onSaveReport={handleSaveProgressReport}
              onCancel={() => {
                setShowCamera(false);
                setCapturedPhoto(null);
                setSelectedStage(null);
              }}
              onImageSelected={handleImageSelected}
            />
          </>
        )}
      </Box>

      {/* Image Preview Modal */}
      <ImagePreviewModal
        showPreview={showPreview}
        previewImage={previewImage}
        previewReport={previewReport}
        onClose={() => setShowPreview(false)}
      />

      {/* Spinner Loading Overlay - Batch Upload */}
      {isBatchUploading && (
        <Box className="absolute inset-0 bg-white bg-opacity-75 flex flex-col items-center justify-center z-50">
          <Spinner logo="https://res.cloudinary.com/djiwsnmtq/image/upload/v1768034655/lqd_l8z0wh.jpg" />
          <Text className="mt-4 text-gray-600 text-sm">Đang tải ảnh báo cáo... {batchUploadProgress}%</Text>
        </Box>
      )}

      <BottomNavigation />
    </Page>
  );
}

function PageHeader({ currentTime }) {
  return (
    <Box className="bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 shadow-lg pb-4 relative overflow-hidden">
      <Box className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full -mr-24 -mt-24"></Box>
      <Box className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full -ml-16 -mb-16"></Box>

      <Box className="px-4 pt-10 mt-5 pb-4 relative z-10">
        <Text.Title className="text-white font-bold" size="large">
          Báo Cáo Tiến Độ
        </Text.Title>
        <Text className="text-blue-100 text-sm mt-1">
          {currentTime.toLocaleDateString("vi-VN")} -{" "}
          {currentTime.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
        </Text>
      </Box>
    </Box>
  );
}

export default ProgressReport;
