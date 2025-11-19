import { Box, Text, Icon, Button, Page } from "zmp-ui";
import { useState, useRef, useEffect, useContext } from "react";
import { getLocation } from "zmp-sdk/apis";
import { ToastContext } from "../components/layout";
import BottomNavigation from "../components/BottomNavigation";
import {
    getPlaceNameFromCoordinates,
    getPlaceDetailsFromCoordinates,
    calculateDistance,
    isPointWithinRadius,
} from "../utils/geocoding";

function CheckIn() {
    const toast = useContext(ToastContext);

    // Check-in locations
    const [checkInLocations] = useState([
        {
            id: "office",
            name: "Văn Phòng",
            address: "89 Lê Thị Riêng, Phường Thới An, Quận 12, TP.HCM",
            latitude: 10.867905908286646,
            longitude: 106.65442409580359,
            radius: 70, // meters
            icon: "zi-home",
        },
    ]);

    const [currentLocation, setCurrentLocation] = useState(null);
    const [currentPlaceName, setCurrentPlaceName] = useState(null);
    const [isLoadingPlaceName, setIsLoadingPlaceName] = useState(false);
    const [isCheckingLocation, setIsCheckingLocation] = useState(false);
    const [selectedCheckInType, setSelectedCheckInType] = useState(null);
    const [selectedCheckInMode, setSelectedCheckInMode] = useState(null); // "in" or "out"
    const [showCamera, setShowCamera] = useState(false);
    const [capturedPhoto, setCapturedPhoto] = useState(null);
    const [checkInRecords, setCheckInRecords] = useState([]);

    const videoRef = useRef(null);
    const canvasRef = useRef(null);

    // Decode location from token
    const decodeLocationToken = async (token) => {
        try {
            const mockLocationData = {
                latitude: 10.867694697332366,
                latitude: 10.867905908286646,
                longitude: 106.65442409580359,
                accuracy: 65,
                altitude: 0,
                timestamp: Date.now(),
            };

            return mockLocationData;
        } catch (error) {
            console.error("Error decoding location token:", error);
            throw error;
        }
    };

    // Get user's current location
    const handleGetLocation = async () => {
        setIsCheckingLocation(true);
        try {
            const response = await getLocation();

            console.log("Location response:", response);

            if (response.token) {
                const token = response.data;
                const locationData = await decodeLocationToken(token);

                const userLocation = {
                    latitude: parseFloat(locationData.latitude),
                    longitude: parseFloat(locationData.longitude),
                    accuracy: locationData.accuracy,
                    timestamp: locationData.timestamp,
                };

                setCurrentLocation(userLocation);

                // Get place name from coordinates
                setIsLoadingPlaceName(true);
                try {
                    const placeName = await getPlaceNameFromCoordinates(userLocation.latitude, userLocation.longitude);
                    setCurrentPlaceName(placeName);
                } catch (error) {
                    console.error("Error getting place name:", error);
                    setCurrentPlaceName("Không thể xác định địa chỉ");
                } finally {
                    setIsLoadingPlaceName(false);
                }

                // Check if user is within any check-in location
                const validLocation = checkInLocations.find((loc) => {
                    return isPointWithinRadius(
                        userLocation.latitude,
                        userLocation.longitude,
                        loc.latitude,
                        loc.longitude,
                        loc.radius
                    );
                });

                if (validLocation) {
                    toast?.success({
                        title: "Vị trí hợp lệ",
                        message: `Bạn đang ở ${validLocation.name} (${calculateDistance(
                            userLocation.latitude,
                            userLocation.longitude,
                            validLocation.latitude,
                            validLocation.longitude
                        ).toFixed(2)}m)`,
                        duration: 2000,
                    });
                    setSelectedCheckInType(validLocation);
                } else {
                    const closestLocation = checkInLocations.reduce((prev, current) => {
                        const prevDistance = calculateDistance(
                            userLocation.latitude,
                            userLocation.longitude,
                            prev.latitude,
                            prev.longitude
                        );
                        const currentDistance = calculateDistance(
                            userLocation.latitude,
                            userLocation.longitude,
                            current.latitude,
                            current.longitude
                        );
                        return prevDistance < currentDistance ? prev : current;
                    });

                    const distanceToClosest = calculateDistance(
                        userLocation.latitude,
                        userLocation.longitude,
                        closestLocation.latitude,
                        closestLocation.longitude
                    );

                    toast?.error({
                        title: "Vị trí không hợp lệ",
                        message: `Bạn cách ${closestLocation.name} ${distanceToClosest.toFixed(
                            0
                        )}m. Vui lòng đến địa điểm chấm công.`,
                        duration: 3000,
                    });
                }
            } else {
                throw new Error(response.message || "Không thể lấy vị trí");
            }
        } catch (error) {
            console.error("Error getting location:", error);
            toast?.error({
                title: "Lỗi lấy vị trí",
                message: "Vui lòng bật định vị và thử lại",
                duration: 2000,
            });
        } finally {
            setIsCheckingLocation(false);
        }
    };

    // Start camera
    const startCamera = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: {
                    facingMode: "user",
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

    // Capture photo with 1:1 aspect ratio
    const capturePhoto = () => {
        if (canvasRef.current && videoRef.current) {
            const video = videoRef.current;
            const canvas = canvasRef.current;
            const context = canvas.getContext("2d");

            // Set canvas to 1:1 aspect ratio
            const size = 1080;
            canvas.width = size;
            canvas.height = size;

            // Calculate the crop area to maintain aspect ratio
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

            // Draw with mirror effect
            context.save();
            context.scale(-1, 1);
            context.translate(-size, 0);
            context.drawImage(video, sourceX, sourceY, sourceWidth, sourceHeight, 0, 0, size, size);
            context.restore();

            const imageData = canvas.toDataURL("image/jpeg", 0.95);
            setCapturedPhoto(imageData);

            // Stop video stream
            const stream = video.srcObject;
            const tracks = stream.getTracks();
            tracks.forEach((track) => track.stop());
        }
    };

    // Submit check-in
    const handleSubmitCheckIn = () => {
        if (!capturedPhoto || !currentLocation || !selectedCheckInType || !selectedCheckInMode) {
            toast?.error({
                title: "Thông tin chưa đủ",
                message: "Vui lòng cung cấp đầy đủ thông tin",
                duration: 2000,
            });
            return;
        }

        const now = new Date();
        const checkInTypeText = selectedCheckInMode === "in" ? "Vào" : "Ra";

        const newRecord = {
            id: checkInRecords.length + 1,
            date: now.toLocaleDateString("vi-VN"),
            checkInTime: now.toLocaleTimeString("vi-VN", {
                hour: "2-digit",
                minute: "2-digit",
            }),
            type: checkInTypeText,
            location: selectedCheckInType.name,
            photo: capturedPhoto,
            latitude: currentLocation.latitude,
            longitude: currentLocation.longitude,
        };

        setCheckInRecords([newRecord, ...checkInRecords]);
        toast?.success({
            title: "Chấm công thành công",
            message: `Đã ghi nhận chấm ${checkInTypeText} lúc ${newRecord.checkInTime}`,
            duration: 2000,
        });

        // Reset
        setCapturedPhoto(null);
        setShowCamera(false);
        setCurrentLocation(null);
        setSelectedCheckInType(null);
        setSelectedCheckInMode(null);
    };

    // Retake photo
    const retakePhoto = () => {
        setCapturedPhoto(null);
        startCamera();
    };

    // Proceed to camera selection
    const handleSelectCheckInMode = (mode) => {
        if (!selectedCheckInType) {
            toast?.error({
                title: "Lỗi",
                message: "Vui lòng xác định vị trí trước",
                duration: 2000,
            });
            return;
        }
        setSelectedCheckInMode(mode);
        setShowCamera(true);
    };

    useEffect(() => {
        if (showCamera && !capturedPhoto) {
            startCamera();
        }
    }, [showCamera, capturedPhoto]);

    return (
        <Page className="bg-gray-50 min-h-screen pb-20">
            {/* Header */}
            <Box className="bg-gradient-to-r from-green-600 via-green-700 to-green-800 shadow-lg pb-4 relative overflow-hidden">
                <Box className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full -mr-24 -mt-24"></Box>
                <Box className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full -ml-16 -mb-16"></Box>

                <Box className="px-4 pt-10 pb-4 relative z-10">
                    <Text.Title className="text-white font-bold" size="large">
                        Chấm Công
                    </Text.Title>
                    <Text className="text-green-100 text-sm mt-1">
                        {new Date().toLocaleDateString("vi-VN")} - {new Date().toLocaleTimeString("vi-VN")}
                    </Text>
                </Box>
            </Box>

            <Box className="p-4 pb-20">
                {!showCamera ? (
                    <>
                        {/* Info Cards */}
                        <Box className="space-y-4 mb-6">
                            {/* Current Status */}
                            <Box className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                                <Text className="font-bold text-gray-900 mb-3 flex items-center">
                                    <Icon icon="zi-info-circle" className="mr-2 text-green-600" size={16} />
                                    Vị trí hiện tại
                                </Text>

                                {currentLocation ? (
                                    <Box className="space-y-2">
                                        <Box className="flex justify-between items-center p-2 bg-green-50 rounded-lg">
                                            <Text className="text-sm text-gray-600">Vị trí:</Text>
                                            <Text className="text-sm font-semibold text-green-700">
                                                {selectedCheckInType?.name || "Đang tải..."}
                                            </Text>
                                        </Box>

                                        {/* Place name from coordinates */}
                                        <Box className="flex justify-between items-start p-2 bg-blue-50 rounded-lg gap-2">
                                            <Text className="text-sm text-gray-600">Địa chỉ:</Text>
                                            <Box className="text-right flex-1">
                                                {isLoadingPlaceName ? (
                                                    <Text className="text-xs text-blue-600 italic">Đang tải...</Text>
                                                ) : (
                                                    <Text className="text-xs font-semibold text-blue-700 line-clamp-3">
                                                        {currentPlaceName}
                                                    </Text>
                                                )}
                                            </Box>
                                        </Box>

                                        <Box className="flex justify-between items-center p-2 bg-blue-50 rounded-lg">
                                            <Text className="text-sm text-gray-600">Tọa độ:</Text>
                                            <Text className="text-xs font-mono text-blue-700">
                                                {currentLocation.latitude.toFixed(4)},{" "}
                                                {currentLocation.longitude.toFixed(4)}
                                            </Text>
                                        </Box>
                                        <Box className="flex justify-between items-center p-2 bg-purple-50 rounded-lg">
                                            <Text className="text-sm text-gray-600">Độ chính xác:</Text>
                                            <Text className="text-xs font-semibold text-purple-700">
                                                ±{currentLocation.accuracy?.toFixed(0) || "N/A"}m
                                            </Text>
                                        </Box>
                                    </Box>
                                ) : (
                                    <Text className="text-sm text-gray-600">Nhấn nút dưới để lấy vị trí</Text>
                                )}
                            </Box>

                            {/* Check-in Mode Selection */}
                            {selectedCheckInType && (
                                <Box className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                                    <Text className="font-bold text-gray-900 mb-3 flex items-center">
                                        <Icon icon="zi-clock-1" className="mr-2 text-blue-600" size={16} />
                                        Chọn loại chấm công
                                    </Text>

                                    <Box className="space-y-2">
                                        <button
                                            onClick={() => handleSelectCheckInMode("in")}
                                            className={`w-full p-3 rounded-lg border-2 transition-all text-left ${
                                                selectedCheckInMode === "in"
                                                    ? "border-blue-600 bg-blue-50"
                                                    : "border-gray-200 bg-white hover:border-blue-300"
                                            }`}
                                        >
                                            <Box className="flex items-center space-x-3">
                                                <Icon icon="zi-arrow-right" className="text-blue-600" size={20} />
                                                <Box>
                                                    <Text className="font-semibold text-gray-900">Chấm Vào</Text>
                                                    <Text className="text-xs text-gray-600">Bắt đầu ngày làm việc</Text>
                                                </Box>
                                            </Box>
                                        </button>

                                        <button
                                            onClick={() => handleSelectCheckInMode("out")}
                                            className={`w-full p-3 rounded-lg border-2 transition-all text-left ${
                                                selectedCheckInMode === "out"
                                                    ? "border-purple-600 bg-purple-50"
                                                    : "border-gray-200 bg-white hover:border-purple-300"
                                            }`}
                                        >
                                            <Box className="flex items-center space-x-3">
                                                <Icon icon="zi-arrow-left" className="text-purple-600" size={20} />
                                                <Box>
                                                    <Text className="font-semibold text-gray-900">Chấm Ra</Text>
                                                    <Text className="text-xs text-gray-600">
                                                        Kết thúc ngày làm việc
                                                    </Text>
                                                </Box>
                                            </Box>
                                        </button>
                                    </Box>
                                </Box>
                            )}

                            {/* Check-in Locations */}
                            <Box className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                                <Text className="font-bold text-gray-900 mb-3 flex items-center">
                                    <Icon icon="zi-location" className="mr-2 text-red-600" size={16} />
                                    Địa Điểm Chấm Công
                                </Text>

                                <Box className="space-y-2">
                                    {checkInLocations.map((location) => (
                                        <Box
                                            key={location.id}
                                            className="p-3 bg-gray-50 rounded-lg border border-gray-200"
                                        >
                                            <Text className="font-semibold text-gray-900">{location.name}</Text>
                                            <Text className="text-xs text-gray-600 mt-1">{location.address}</Text>
                                            <Text className="text-xs text-gray-500 mt-1 font-mono">
                                                {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}
                                            </Text>
                                            <Text className="text-xs text-gray-500 mt-1">
                                                Bán kính chấm công cho phép: {location.radius}m
                                            </Text>
                                        </Box>
                                    ))}
                                </Box>
                            </Box>
                        </Box>

                        {/* Get Location Button */}
                        <Button
                            variant="primary"
                            fullWidth
                            onClick={handleGetLocation}
                            disabled={isCheckingLocation}
                            className={`py-3 rounded-lg font-semibold text-base flex items-center justify-center gap-2 ${
                                isCheckingLocation
                                    ? "bg-gray-400 cursor-not-allowed"
                                    : "bg-green-600 hover:bg-green-700"
                            }`}
                        >
                            {isCheckingLocation ? (
                                <>
                                    <Icon icon="zi-loading" className="animate-spin" size={16} />
                                    Đang lấy vị trí...
                                </>
                            ) : (
                                <>
                                    <Icon icon="zi-location" size={16} />
                                    Xác Định Vị Trí
                                </>
                            )}
                        </Button>
                    </>
                ) : (
                    <>
                        {/* Camera View - 1:1 Aspect Ratio */}
                        <Box className="mb-4 relative">
                            <Box className="relative w-full aspect-square rounded-2xl overflow-hidden border-4 border-green-600 shadow-lg bg-black">
                                {!capturedPhoto ? (
                                    <>
                                        <video
                                            ref={videoRef}
                                            autoPlay
                                            playsInline
                                            className="w-full h-full object-cover -scale-x-100"
                                        />
                                        {/* Grid overlay */}
                                        <Box className="absolute inset-0 pointer-events-none">
                                            <Box className="absolute inset-0 border-2 border-white/30 opacity-50">
                                                <Box className="absolute top-1/3 left-0 right-0 border-t border-white/30"></Box>
                                                <Box className="absolute top-2/3 left-0 right-0 border-t border-white/30"></Box>
                                                <Box className="absolute left-1/3 top-0 bottom-0 border-l border-white/30"></Box>
                                                <Box className="absolute left-2/3 top-0 bottom-0 border-l border-white/30"></Box>
                                            </Box>
                                            {/* Center circle indicator */}
                                            <Box className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-20 h-20 border-2 border-green-400 rounded-full"></Box>
                                        </Box>
                                    </>
                                ) : (
                                    <img src={capturedPhoto} alt="Captured" className="w-full h-full object-cover" />
                                )}
                            </Box>
                            <canvas ref={canvasRef} className="hidden" />
                        </Box>

                        {/* Photo Info */}
                        {capturedPhoto && (
                            <Box className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 mb-4">
                                <Text className="font-bold text-gray-900 mb-3">Thông Tin Chấm Công</Text>
                                <Box className="space-y-2">
                                    <Box className="flex justify-between items-center p-2 bg-gray-50 rounded-lg">
                                        <Text className="text-sm text-gray-600">Ngày:</Text>
                                        <Text className="text-sm font-semibold text-gray-900">
                                            {new Date().toLocaleDateString("vi-VN")}
                                        </Text>
                                    </Box>
                                    <Box className="flex justify-between items-center p-2 bg-gray-50 rounded-lg">
                                        <Text className="text-sm text-gray-600">Giờ:</Text>
                                        <Text className="text-sm font-semibold text-gray-900">
                                            {new Date().toLocaleTimeString("vi-VN", {
                                                hour: "2-digit",
                                                minute: "2-digit",
                                                second: "2-digit",
                                            })}
                                        </Text>
                                    </Box>
                                    <Box className="flex justify-between items-center p-2 bg-gray-50 rounded-lg">
                                        <Text className="text-sm text-gray-600">Loại:</Text>
                                        <Text className="text-sm font-semibold text-blue-600">
                                            {selectedCheckInMode === "in" ? "Chấm Vào" : "Chấm Ra"}
                                        </Text>
                                    </Box>
                                    <Box className="flex justify-between items-center p-2 bg-gray-50 rounded-lg">
                                        <Text className="text-sm text-gray-600">Địa điểm:</Text>
                                        <Text className="text-sm font-semibold text-gray-900">
                                            {selectedCheckInType?.name}
                                        </Text>
                                    </Box>
                                    <Box className="flex justify-between items-center p-2 bg-gray-50 rounded-lg">
                                        <Text className="text-sm text-gray-600">Tọa độ:</Text>
                                        <Text className="text-xs font-mono text-gray-900">
                                            {currentLocation.latitude.toFixed(4)},{" "}
                                            {currentLocation.longitude.toFixed(4)}
                                        </Text>
                                    </Box>
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
                                        className="py-3 rounded-lg font-semibold text-base bg-green-600 hover:bg-green-700 flex items-center justify-center gap-2"
                                    >
                                        <Icon icon="zi-camera" size={16} />
                                        Chụp Ảnh
                                    </Button>
                                    <button
                                        onClick={() => {
                                            setShowCamera(false);
                                            setCapturedPhoto(null);
                                            setSelectedCheckInMode(null);
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
                                        onClick={handleSubmitCheckIn}
                                        className="py-3 rounded-lg font-semibold text-base bg-green-600 hover:bg-green-700 flex items-center justify-center gap-2"
                                    >
                                        <Icon icon="zi-check-circle" size={16} />
                                        Xác Nhận Chấm Công
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
                                            setSelectedCheckInMode(null);
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

                {/* Check-in History */}
                <Box className="mt-8 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <Box className="p-4 border-b border-gray-200">
                        <Text className="font-bold text-gray-900 flex items-center">
                            <Icon icon="zi-list-1" className="mr-2 text-green-600" size={16} />
                            Lịch Sử Chấm Công Hôm Nay
                        </Text>
                    </Box>

                    <Box className="divide-y divide-gray-200">
                        {checkInRecords.length > 0 ? (
                            checkInRecords.map((record) => (
                                <Box key={record.id} className="p-4 hover:bg-gray-50 transition-colors">
                                    <Box className="flex items-start justify-between mb-2">
                                        <Box>
                                            <Text className="font-semibold text-gray-900">
                                                {record.type === "Vào" ? "Chấm Vào" : "Chấm Ra"}
                                            </Text>
                                            <Text className="text-sm text-gray-600 mt-1">
                                                {record.checkInTime} - {record.location}
                                            </Text>
                                        </Box>
                                        <Box
                                            className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                                record.type === "Vào"
                                                    ? "bg-blue-100 text-blue-800"
                                                    : "bg-purple-100 text-purple-800"
                                            }`}
                                        >
                                            {record.type}
                                        </Box>
                                    </Box>

                                    {record.photo && (
                                        <Box className="mt-3 rounded-lg overflow-hidden border border-gray-200 aspect-square bg-gray-100">
                                            <img
                                                src={record.photo}
                                                alt="Check-in"
                                                className="w-full h-full object-cover"
                                            />
                                        </Box>
                                    )}

                                    <Text className="text-xs text-gray-500 mt-2 font-mono">
                                        {record.latitude.toFixed(4)}, {record.longitude.toFixed(4)}
                                    </Text>
                                </Box>
                            ))
                        ) : (
                            <Box className="text-center py-8">
                                <Icon icon="zi-check-circle" className="text-gray-400 text-3xl mb-2" />
                                <Text className="text-gray-500 text-sm">Chưa có chấm công hôm nay</Text>
                            </Box>
                        )}
                    </Box>
                </Box>
            </Box>

            <BottomNavigation />
        </Page>
    );
}

export default CheckIn;
