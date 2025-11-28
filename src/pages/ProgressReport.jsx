import { Box, Text, Icon, Button, Page } from "zmp-ui";
import { useState, useRef, useEffect, useContext } from "react";
import { ToastContext } from "../components/layout";
import BottomNavigation from "../components/BottomNavigation";
import { useNavigate } from "react-router-dom";

function ProgressReport() {
    const toast = useContext(ToastContext);
    const navigate = useNavigate();

    // Current work assignment
    const [currentWork] = useState({
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
            description: "Chụp ảnh trạng thái ban đầu của thiết bị",
            icon: "zi-chevron-double-up",
            color: "from-blue-600 to-blue-700",
            bgColor: "bg-blue-50",
            badgeColor: "bg-blue-100 text-blue-800",
        },
        {
            id: "during",
            name: "Trong Quá Trình Thực Hiện",
            description: "Chụp ảnh quá trình làm việc (có thể chụp nhiều lần)",
            icon: "zi-auto-solid",
            color: "from-amber-600 to-amber-700",
            bgColor: "bg-amber-50",
            badgeColor: "bg-amber-100 text-amber-800",
        },
        {
            id: "after",
            name: "Sau Khi Hoàn Thành",
            description: "Chụp ảnh kết quả cuối cùng của thiết bị",
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

    const videoRef = useRef(null);
    const canvasRef = useRef(null);

    const startCamera = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: {
                    facingMode: "environment",
                    width: { ideal: 1080 },
                    height: { ideal: 1080 },
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

    const capturePhoto = () => {
        if (canvasRef.current && videoRef.current) {
            const video = videoRef.current;
            const canvas = canvasRef.current;
            const context = canvas.getContext("2d");

            const size = 1080;
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
            duringCount:
                selectedStage === "during" ? progressReports.filter((r) => r.stageId === "during").length + 1 : null,
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

    const handleSelectStage = (stage) => {
        setSelectedStage(stage);
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

    const handleSubmitAllReports = () => {
        if (progressReports.length === 0) {
            toast?.error({
                title: "Không có báo cáo",
                message: "Vui lòng chụp ít nhất một ảnh báo cáo",
                duration: 2000,
            });
            return;
        }

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
            reports: progressReports,
            totalPhotos: progressReports.length,
        };

        setSubmittedReports([newSubmission, ...submittedReports]);
        setProgressReports([]);

        toast?.success({
            title: "Gửi báo cáo thành công",
            message: `Đã gửi báo cáo tiến độ với ${newSubmission.totalPhotos} ảnh`,
            duration: 2500,
        });
    };

    const handlePreviewImage = (report) => {
        setPreviewImage(report.photo);
        setPreviewReport(report);
        setShowPreview(true);
    };

    useEffect(() => {
        if (showCamera && !capturedPhoto) {
            startCamera();
        }
    }, [showCamera, capturedPhoto]);

    return (
        <Page className="bg-gray-50 min-h-screen pb-20">
            {/* Header */}
            <Box className="bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 shadow-lg pb-4 relative overflow-hidden">
                <Box className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full -mr-24 -mt-24"></Box>
                <Box className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full -ml-16 -mb-16"></Box>

                <Box className="px-4 pt-10 mt-5 pb-4 relative z-10">
                    <Text.Title className="text-white font-bold" size="large">
                        Báo Cáo Tiến Độ
                    </Text.Title>
                    <Text className="text-blue-100 text-sm mt-1">
                        {new Date().toLocaleDateString("vi-VN")} - {new Date().toLocaleTimeString("vi-VN")}
                    </Text>
                </Box>
            </Box>

            <Box className="p-4 pb-20">
                {!showCamera ? (
                    <>
                        {/* Current Work Assignment */}
                        <Box className="bg-white rounded-xl p-4 shadow-sm border border-blue-200 mb-4">
                            <Box className="space-y-2">
                                <Box className="flex justify-between items-start">
                                    <Box className="flex-1">
                                        <Text className="font-semibold text-gray-900 text-sm">{currentWork.title}</Text>
                                        <Text className="text-xs text-gray-600 mt-0.5">{currentWork.company}</Text>
                                    </Box>
                                    <Box className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded font-semibold">
                                        {currentWork.scheduledTime}
                                    </Box>
                                </Box>
                                <Box className="flex items-center gap-1 text-xs text-gray-600">
                                    <Icon icon="zi-user" className="text-gray-400 flex-shrink-0" size={16} />
                                    <Text className="text-xs">{currentWork.customer}</Text>
                                </Box>
                                <Box className="flex items-center gap-1 text-xs text-gray-600">
                                    <Icon icon="zi-location" className="text-red-500 flex-shrink-0" size={16} />
                                    <Text className="text-xs">{currentWork.location}</Text>
                                </Box>
                            </Box>
                        </Box>

                        {/* Requirements */}
                        {/* <Box className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 mb-4">
                            <Text className="font-bold text-gray-900 mb-3 flex items-center">
                                <Icon icon="zi-checklist" className="mr-2 text-blue-600" size={16} />
                                Yêu Cầu Công Việc
                            </Text>
                            <Box className="space-y-1.5">
                                {currentWork.requirements.map((req, index) => (
                                    <Box key={index} className="flex items-start gap-2 text-sm">
                                        <Box className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-1.5 flex-shrink-0"></Box>
                                        <Text className="text-gray-700">{req}</Text>
                                    </Box>
                                ))}
                            </Box>
                        </Box> */}

                        {/* Progress Stages Selection */}
                        <Box className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 mb-4">
                            <Text className="font-bold text-gray-900 mb-3 flex items-center">
                                <Icon icon="zi-camera" className="mr-2 text-blue-600" size={16} />
                                Chụp Ảnh Báo Cáo Tiến Độ
                            </Text>

                            <Box className="grid grid-cols-1 gap-2">
                                {progressStages.map((stage) => {
                                    const stageReports = progressReports.filter((r) => r.stageId === stage.id);
                                    const isCompleted = stageReports.length > 0;

                                    return (
                                        <button
                                            key={stage.id}
                                            onClick={() => handleSelectStage(stage.id)}
                                            className={`p-3 rounded-lg border-2 transition-all text-left ${
                                                selectedStage === stage.id
                                                    ? `border-2 border-blue-600 bg-blue-50`
                                                    : `border-gray-200 ${stage.bgColor} hover:border-blue-300`
                                            }`}
                                        >
                                            <Box className="flex items-center space-x-3">
                                                <Box
                                                    className={`w-10 h-10 rounded-full bg-gradient-to-br ${stage.color} flex items-center justify-center text-white shadow-md relative`}
                                                >
                                                    <Icon icon={stage.icon} size={18} />
                                                    {isCompleted && (
                                                        <Box className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
                                                            <Icon icon="zi-check" size={10} className="text-white" />
                                                        </Box>
                                                    )}
                                                </Box>
                                                <Box className="flex-1">
                                                    <Text className="font-semibold text-gray-900 text-sm">
                                                        {stage.name}
                                                    </Text>
                                                    <Text className="text-xs text-gray-600">{stage.description}</Text>
                                                </Box>
                                                {stageReports.length > 0 && (
                                                    <Box
                                                        className={`text-xs px-2 py-1 rounded font-semibold ${stage.badgeColor}`}
                                                    >
                                                        {stageReports.length}
                                                        {stage.id === "during" ? "+" : ""}
                                                    </Box>
                                                )}
                                            </Box>
                                        </button>
                                    );
                                })}
                            </Box>
                        </Box>

                        {/* Progress Reports Summary */}
                        {progressReports.length > 0 && (
                            <Box className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 mb-4">
                                <Box className="flex items-center justify-between mb-3">
                                    <Text className="font-bold text-gray-900 flex items-center">
                                        <Icon icon="zi-image" className="mr-2 text-blue-600" size={16} />
                                        Ảnh Báo Cáo ({progressReports.length})
                                    </Text>
                                    <Text className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded font-semibold">
                                        Sẵn sàng gửi
                                    </Text>
                                </Box>

                                <Box className="space-y-2 max-h-80 overflow-y-auto">
                                    {progressReports.map((report, index) => (
                                        <Box
                                            key={report.id}
                                            className="p-2 bg-gray-50 rounded-lg border border-gray-200 hover:border-blue-300 transition-colors"
                                        >
                                            <Box className="flex items-start justify-between gap-2 mb-2">
                                                <Box className="flex-1">
                                                    <Box className="flex items-center gap-2 mb-0.5">
                                                        <Text className="text-xs font-semibold text-gray-900">
                                                            #{index + 1} - {report.stageName}
                                                        </Text>
                                                        {report.duringCount && (
                                                            <Text className="text-xs px-1.5 py-0.5 bg-amber-100 text-amber-800 rounded">
                                                                Lần {report.duringCount}
                                                            </Text>
                                                        )}
                                                    </Box>
                                                    <Text className="text-xs text-gray-600">
                                                        {report.timestamp}
                                                        {report.notes && ` • ${report.notes}`}
                                                    </Text>
                                                </Box>
                                                <button
                                                    onClick={() => handleDeleteReport(report.id)}
                                                    className="text-gray-400 hover:text-red-600 p-1 flex-shrink-0"
                                                >
                                                    <Icon icon="zi-close" size={14} />
                                                </button>
                                            </Box>

                                            <Box
                                                className="relative aspect-square rounded-lg overflow-hidden bg-gray-200 border border-gray-300 cursor-pointer hover:opacity-80 transition-opacity"
                                                onClick={() => handlePreviewImage(report)}
                                            >
                                                <img
                                                    src={report.photo}
                                                    alt={report.stageName}
                                                    className="w-full h-full object-cover"
                                                />
                                                <Box className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 bg-black/30 transition-opacity">
                                                    <Icon icon="zi-expand" className="text-white" size={24} />
                                                </Box>
                                            </Box>
                                        </Box>
                                    ))}
                                </Box>
                            </Box>
                        )}

                        {/* Action Buttons */}
                        <Box className="space-y-2">
                            {progressReports.length > 0 && (
                                <Button
                                    variant="primary"
                                    fullWidth
                                    onClick={handleSubmitAllReports}
                                    className="py-3 rounded-lg font-semibold text-base bg-green-600 hover:bg-green-700 flex items-center justify-center gap-2"
                                >
                                    <Icon icon="zi-send" size={16} />
                                    Gửi Báo Cáo ({progressReports.length} ảnh)
                                </Button>
                            )}

                            <Button
                                variant="tertiary"
                                fullWidth
                                onClick={() => navigate("/work-management")}
                                className="py-3 rounded-lg font-semibold text-base bg-gray-200 hover:bg-gray-300 text-gray-800"
                            >
                                Quay Lại
                            </Button>
                        </Box>

                        {/* Submitted Reports History */}
                        {submittedReports.length > 0 && (
                            <Box className="mt-6 bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                                <Text className="font-bold text-gray-900 mb-3 flex items-center">
                                    <Icon icon="zi-gallery" className="mr-2 text-green-600" size={16} />
                                    Báo Cáo Đã Gửi ({submittedReports.length})
                                </Text>

                                <Box className="space-y-4">
                                    {submittedReports.map((submission) => (
                                        <Box
                                            key={submission.id}
                                            className="pb-4 border-b border-gray-200 last:border-b-0"
                                        >
                                            {/* Submission Header */}
                                            <Box className="flex items-start justify-between mb-2">
                                                <Box className="flex-1">
                                                    <Text className="text-sm font-semibold text-gray-900">
                                                        {submission.submittedDate} • {submission.submittedTime}
                                                    </Text>
                                                    <Text className="text-xs text-gray-600 mt-0.5">
                                                        {submission.totalPhotos} ảnh • {submission.workTitle}
                                                    </Text>
                                                </Box>
                                                <Box className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded font-semibold flex-shrink-0">
                                                    ✓ Đã gửi
                                                </Box>
                                            </Box>

                                            {/* Submitted Images Grid */}
                                            <Box className="grid grid-cols-3 gap-2 mt-2">
                                                {submission.reports.map((report) => (
                                                    <Box
                                                        key={report.id}
                                                        className="relative aspect-square rounded-lg overflow-hidden bg-gray-200 border border-gray-300 cursor-pointer hover:opacity-80 transition-opacity group"
                                                        onClick={() => handlePreviewImage(report)}
                                                    >
                                                        <img
                                                            src={report.photo}
                                                            alt={report.stageName}
                                                            className="w-full h-full object-cover"
                                                        />
                                                        <Box className="absolute inset-0 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 bg-black/40 transition-opacity">
                                                            <Icon
                                                                icon="zi-expand"
                                                                className="text-white mb-1"
                                                                size={18}
                                                            />
                                                            <Text className="text-xs text-white font-semibold text-center px-1">
                                                                {report.stageName}
                                                            </Text>
                                                        </Box>
                                                    </Box>
                                                ))}
                                            </Box>

                                            {/* Submission Details */}
                                            <Box className="mt-2 text-xs text-gray-600 space-y-1">
                                                <Text>
                                                    <span className="font-semibold">Công việc:</span>{" "}
                                                    {submission.workTitle}
                                                </Text>
                                                <Text>
                                                    <span className="font-semibold">Công ty:</span>{" "}
                                                    {submission.workCompany}
                                                </Text>
                                                <Text>
                                                    <span className="font-semibold">Tổng ảnh:</span>{" "}
                                                    {submission.totalPhotos}
                                                </Text>
                                            </Box>
                                        </Box>
                                    ))}
                                </Box>
                            </Box>
                        )}
                    </>
                ) : (
                    <>
                        {/* Camera View */}
                        <Box className="mb-4 relative">
                            <Box className="relative w-full aspect-square rounded-2xl overflow-hidden border-4 border-blue-600 shadow-lg bg-black">
                                {!capturedPhoto ? (
                                    <>
                                        <video
                                            ref={videoRef}
                                            autoPlay
                                            playsInline
                                            className="w-full h-full object-cover"
                                        />
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
                                    <Text className="text-xs text-gray-600 font-semibold mb-1">
                                        Ghi chú (tùy chọn):
                                    </Text>
                                    <textarea
                                        value={progressNotes}
                                        onChange={(e) => setProgressNotes(e.target.value)}
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
                                    <Button
                                        variant="primary"
                                        fullWidth
                                        onClick={capturePhoto}
                                        className="py-3 rounded-lg font-semibold text-base bg-blue-600 hover:bg-blue-700 flex items-center justify-center gap-2"
                                    >
                                        <Icon icon="zi-camera" size={16} />
                                        Chụp Ảnh
                                    </Button>
                                    <button
                                        onClick={() => {
                                            setShowCamera(false);
                                            setCapturedPhoto(null);
                                            setSelectedStage(null);
                                        }}
                                        className="w-full px-3 py-3 bg-gray-200 text-gray-800 rounded-lg text-sm font-semibold hover:bg-gray-300 transition-colors"
                                    >
                                        Hủy
                                    </button>
                                </>
                            ) : (
                                <>
                                    <Button
                                        variant="primary"
                                        fullWidth
                                        onClick={handleSaveProgressReport}
                                        className="py-3 rounded-lg font-semibold text-base bg-blue-600 hover:bg-blue-700 flex items-center justify-center gap-2"
                                    >
                                        <Icon icon="zi-check-circle" size={16} />
                                        Lưu Ảnh Báo Cáo
                                    </Button>
                                    <button
                                        onClick={retakePhoto}
                                        className="w-full px-3 py-3 bg-blue-200 text-blue-800 rounded-lg text-sm font-semibold hover:bg-blue-300 transition-colors"
                                    >
                                        Chụp Lại
                                    </button>
                                    <button
                                        onClick={() => {
                                            setShowCamera(false);
                                            setCapturedPhoto(null);
                                        }}
                                        className="w-full px-3 py-3 bg-gray-200 text-gray-800 rounded-lg text-sm font-semibold hover:bg-gray-300 transition-colors"
                                    >
                                        Hủy
                                    </button>
                                </>
                            )}
                        </Box>
                    </>
                )}
            </Box>

            {/* Image Preview Modal */}
            {showPreview && previewImage && (
                <Box className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
                    <Box className="relative max-w-2xl w-full max-h-96">
                        <Box className="relative aspect-square rounded-lg overflow-hidden bg-gray-900">
                            <img src={previewImage} alt="Preview" className="w-full h-full object-contain" />
                        </Box>

                        {/* Preview Info */}
                        {previewReport && (
                            <Box className="mt-3 bg-white rounded-lg p-3 shadow-lg">
                                <Text className="text-xs font-semibold text-gray-900 mb-1">
                                    {previewReport.stageName}
                                </Text>
                                <Text className="text-xs text-gray-600 mb-1">{previewReport.timestamp}</Text>
                                {previewReport.notes && (
                                    <Text className="text-xs text-gray-700">
                                        <span className="font-semibold">Ghi chú:</span> {previewReport.notes}
                                    </Text>
                                )}
                            </Box>
                        )}

                        {/* Close Button */}
                        <button
                            onClick={() => setShowPreview(false)}
                            className="absolute -top-10 right-0 text-white hover:text-gray-300 transition-colors"
                        >
                            <Icon icon="zi-close" size={24} />
                        </button>
                    </Box>
                </Box>
            )}

            <BottomNavigation />
        </Page>
    );
}

export default ProgressReport;
