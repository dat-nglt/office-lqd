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

  // Check-in locations: Kho vật tư + các công trình
  const [checkInLocations] = useState([
    {
      id: "warehouse",
      name: "Kho vật tư",
      type: "warehouse",
      address: "89 Lê Thị Riêng, Phường Thới An, Quận 12, TP.HCM",
      latitude: 10.867905908286646,
      longitude: 106.65442409580359,
      radius: 70,
      icon: "zi-home",
    },
    {
      id: "site1",
      name: "Công trình A - Q1",
      type: "worksite",
      address: "123 Nguyễn Huệ, Quận 1, TP.HCM",
      latitude: 10.776599,
      longitude: 106.701203,
      radius: 100,
      icon: "zi-building",
    },
    {
      id: "site2",
      name: "Công trình B - Q3",
      type: "worksite",
      address: "456 Ba Tháng Hai, Quận 3, TP.HCM",
      latitude: 10.793582,
      longitude: 106.679411,
      radius: 100,
      icon: "zi-building",
    },
  ]);

  const [currentLocation, setCurrentLocation] = useState(null);
  const [currentPlaceName, setCurrentPlaceName] = useState(null);
  const [isLoadingPlaceName, setIsLoadingPlaceName] = useState(false);
  const [isCheckingLocation, setIsCheckingLocation] = useState(false);
  const [selectedCheckInLocation, setSelectedCheckInLocation] = useState(null);
  const [selectedCheckInMode, setSelectedCheckInMode] = useState(null);
  const [showCamera, setShowCamera] = useState(false);
  const [capturedPhoto, setCapturedPhoto] = useState(null);
  const [checkInRecords, setCheckInRecords] = useState([]);
  const [locationViolation, setLocationViolation] = useState(false);
  const [violationDistance, setViolationDistance] = useState(null); // Lưu khoảng cách vi phạm

  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  // Decode location from token
  const decodeLocationToken = async (token) => {
    try {
      const mockLocationData = {
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
          const placeName = await getPlaceNameFromCoordinates(
            userLocation.latitude,
            userLocation.longitude
          );
          setCurrentPlaceName(placeName);
        } catch (error) {
          console.error("Error getting place name:", error);
          setCurrentPlaceName("Không thể xác định địa chỉ");
        } finally {
          setIsLoadingPlaceName(false);
        }

        // Check all nearby locations
        const nearby = checkInLocations.filter((loc) => {
          return isPointWithinRadius(
            userLocation.latitude,
            userLocation.longitude,
            loc.latitude,
            loc.longitude,
            loc.radius
          );
        });

        if (nearby.length > 0) {
          // Tự động chọn địa điểm đầu tiên gần nhất
          const closest = nearby[0];
          const distance = calculateDistance(
            userLocation.latitude,
            userLocation.longitude,
            closest.latitude,
            closest.longitude
          );
          setSelectedCheckInLocation(closest);
          toast?.success({
            title: "Vị trí hợp lệ",
            message: `Bạn đang ở ${closest.name} (${distance.toFixed(2)}m)`,
            duration: 2000,
          });
        } else {
          // Không ở trong phạm vi chấm công nào
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
            message: `Bạn cách ${
              closestLocation.name
            } ${distanceToClosest.toFixed(
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

  // Check if can check out (must have checked in before)
  const canCheckOut = () => {
    return checkInRecords.some((record) => record.type === "Vào");
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
      context.drawImage(
        video,
        sourceX,
        sourceY,
        sourceWidth,
        sourceHeight,
        0,
        0,
        size,
        size
      );
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
    if (
      !capturedPhoto ||
      !currentLocation ||
      !selectedCheckInLocation ||
      !selectedCheckInMode
    ) {
      toast?.error({
        title: "Thông tin chưa đủ",
        message: "Vui lòng cung cấp đầy đủ thông tin",
        duration: 2000,
      });
      return;
    }

    // Kiểm tra: phải chấm vào trước khi chấm ra
    if (selectedCheckInMode === "out" && !canCheckOut()) {
      toast?.error({
        title: "Lỗi",
        message: "Bạn phải chấm vào trước khi chấm ra",
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
      location: selectedCheckInLocation.name,
      locationType: selectedCheckInLocation.type,
      photo: capturedPhoto,
      latitude: currentLocation.latitude,
      longitude: currentLocation.longitude,
      isViolation: locationViolation,
      violationDistance: violationDistance || null,
    };

    setCheckInRecords([newRecord, ...checkInRecords]);

    const messageText = locationViolation
      ? `Đã ghi nhận chấm ${checkInTypeText} lúc ${newRecord.checkInTime} (⚠️ Vi phạm vị trí)`
      : `Đã ghi nhận chấm ${checkInTypeText} lúc ${newRecord.checkInTime}`;

    toast?.success({
      title: "Chấm công thành công",
      message: messageText,
      duration: 2000,
    });

    // Reset
    setCapturedPhoto(null);
    setShowCamera(false);
    setCurrentLocation(null);
    setSelectedCheckInLocation(null);
    setSelectedCheckInMode(null);
    setLocationViolation(false);
    setViolationDistance(null);
  };

  // Retake photo
  const retakePhoto = () => {
    setCapturedPhoto(null);
    startCamera();
  };

  // Proceed to camera selection
  const handleSelectCheckInMode = (mode) => {
    if (!selectedCheckInLocation) {
      toast?.error({
        title: "Lỗi",
        message: "Vui lòng chọn địa điểm chấm công",
        duration: 2000,
      });
      return;
    }

    // Validate mode FIRST before doing anything else
    if (mode === "out" && !canCheckOut()) {
      toast?.error({
        title: "Lỗi",
        message: "Bạn phải chấm vào trước khi chấm ra",
        duration: 2000,
      });
      return;
    }

    // Check location violation
    const isViolation = !isWithinLocation(selectedCheckInLocation);
    const distance = isViolation
      ? getDistanceToLocation(selectedCheckInLocation)
      : null;

    // Set violation states
    setLocationViolation(isViolation);
    setViolationDistance(distance?.toFixed(0) || null);

    if (isViolation) {
      // Luôn mở camera và set mode (dù vi phạm hay không)
      setSelectedCheckInMode(mode);
      setShowCamera(true);
      toast?.warning({
        title: "⚠️ Cảnh báo vi phạm vị trí",
        message: `Bạn cách ${selectedCheckInLocation.name} ${
          distance?.toFixed(0) || 0
        }m. Chấm công này sẽ được đánh dấu là vi phạm!`,
        duration: 3000,
      });
    } else {
      // Luôn mở camera và set mode (dù vi phạm hay không)
      setSelectedCheckInMode(mode);
      setShowCamera(true);
    }
  };

  const isWithinLocation = (location) => {
    if (!currentLocation || !location) return false;
    return isPointWithinRadius(
      currentLocation.latitude,
      currentLocation.longitude,
      location.latitude,
      location.longitude,
      location.radius
    );
  };

  const getDistanceToLocation = (location) => {
    if (!currentLocation || !location) return null;
    return calculateDistance(
      currentLocation.latitude,
      currentLocation.longitude,
      location.latitude,
      location.longitude
    );
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

        <Box className="px-4 pt-10 pb-4 relative z-10">
          <Text.Title className="text-white font-bold" size="large">
            Chấm Công
          </Text.Title>
          <Text className="text-blue-100 text-sm mt-1">
            {new Date().toLocaleDateString("vi-VN")} -{" "}
            {new Date().toLocaleTimeString("vi-VN")}
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
                  <Icon
                    icon="zi-info-circle"
                    className="mr-2 text-blue-600"
                    size={16}
                  />
                  Vị trí hiện tại
                </Text>

                {currentLocation ? (
                  <Box className="space-y-2">
                    <Box className="flex justify-between items-center p-2 bg-blue-50 rounded-lg">
                      <Text className="text-sm text-gray-600">Vị trí:</Text>
                      <Text className="text-sm font-semibold text-blue-700">
                        {currentPlaceName || "Đang tải..."}
                      </Text>
                    </Box>

                    <Box className="flex justify-between items-start p-2 bg-blue-50 rounded-lg gap-2">
                      <Text className="text-sm text-gray-600">Địa chỉ:</Text>
                      <Box className="text-right flex-1">
                        {isLoadingPlaceName ? (
                          <Text className="text-xs text-blue-600 italic">
                            Đang tải...
                          </Text>
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
                      <Text className="text-sm text-gray-600">
                        Độ chính xác:
                      </Text>
                      <Text className="text-xs font-semibold text-purple-700">
                        ±{currentLocation.accuracy?.toFixed(0) || "N/A"}m
                      </Text>
                    </Box>
                  </Box>
                ) : (
                  <Text className="text-sm text-gray-600">
                    Nhấn nút dưới để lấy vị trí
                  </Text>
                )}
              </Box>

              {/* Select Check-in Location - INTEGRATED */}
              {currentLocation && (
                <Box className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                  <Text className="font-bold text-gray-900 mb-3 flex items-center">
                    <Icon
                      icon="zi-location"
                      className="mr-2 text-red-600"
                      size={16}
                    />
                    Chọn Địa Điểm Chấm Công
                  </Text>

                  <Box className="space-y-2">
                    {checkInLocations.map((location) => {
                      const isWithin = isWithinLocation(location);
                      const distance = getDistanceToLocation(location);
                      const isSelected =
                        selectedCheckInLocation?.id === location.id;

                      return (
                        <button
                          key={location.id}
                          onClick={() => {
                            setSelectedCheckInLocation(location);
                          }}
                          className={`w-full p-3 rounded-lg border-2 transition-all text-left ${
                            isSelected && isWithin
                              ? "border-blue-600 bg-blue-50"
                              : isSelected && !isWithin
                              ? "border-orange-600 bg-orange-50"
                              : isWithin
                              ? "border-gray-200 bg-white hover:border-blue-300"
                              : "border-gray-200 bg-white hover:border-orange-300"
                          }`}
                        >
                          <Box className="flex items-start justify-between gap-3">
                            <Box className="flex items-start space-x-3 flex-1">
                              <Box>
                                <Text className="font-semibold text-gray-900">
                                  {location.name}
                                </Text>
                                <Text className="text-xs text-gray-600 mt-0.5">
                                  {location.address}
                                </Text>
                              </Box>
                            </Box>

                            {/* Status Badge */}
                            <Box className="flex items-center gap-2 flex-col">
                              {isWithin ? (
                                <>
                                  {isSelected && (
                                    <Icon
                                      icon="zi-check"
                                      className="text-blue-600"
                                      size={20}
                                    />
                                  )}
                                  <Text className="text-xs font-semibold text-green-700 bg-green-100 px-2 py-0.5 rounded whitespace-nowrap">
                                    ✓ {distance?.toFixed(0)}m
                                  </Text>
                                </>
                              ) : (
                                <>
                                  {isSelected && (
                                    <Icon
                                      icon="zi-warning"
                                      className="text-orange-600"
                                      size={20}
                                    />
                                  )}
                                  <Text className="text-xs font-semibold text-red-700 bg-red-100 px-2 py-0.5 rounded whitespace-nowrap">
                                    ⚠️ {distance?.toFixed(0)}m
                                  </Text>
                                </>
                              )}
                            </Box>
                          </Box>
                        </button>
                      );
                    })}
                  </Box>
                </Box>
              )}

              {/* Check-in Mode Selection */}
              {selectedCheckInLocation && currentLocation && (
                <Box className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                  <Text className="font-bold text-gray-900 mb-3 flex items-center">
                    <Icon
                      icon="zi-clock-1"
                      className="mr-2 text-blue-600"
                      size={16}
                    />
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
                        <Icon
                          icon="zi-arrow-right"
                          className="text-blue-600"
                          size={20}
                        />
                        <Box>
                          <Text className="font-semibold text-gray-900">
                            Chấm Vào
                          </Text>
                          <Text className="text-xs text-gray-600">
                            Bắt đầu công việc tại {selectedCheckInLocation.name}
                          </Text>
                        </Box>
                      </Box>
                    </button>

                    <button
                      onClick={() => handleSelectCheckInMode("out")}
                      disabled={!canCheckOut()}
                      className={`w-full p-3 rounded-lg border-2 transition-all text-left ${
                        selectedCheckInMode === "out"
                          ? "border-purple-600 bg-purple-50"
                          : canCheckOut()
                          ? "border-gray-200 bg-white hover:border-purple-300"
                          : "border-gray-200 bg-gray-100 cursor-not-allowed opacity-50"
                      }`}
                    >
                      <Box className="flex items-center space-x-3">
                        <Icon
                          icon="zi-arrow-left"
                          className={
                            canCheckOut() ? "text-purple-600" : "text-gray-400"
                          }
                          size={20}
                        />
                        <Box>
                          <Text
                            className={
                              canCheckOut()
                                ? "font-semibold text-gray-900"
                                : "font-semibold text-gray-500"
                            }
                          >
                            Chấm Ra
                          </Text>
                          <Text className="text-xs text-gray-600">
                            {canCheckOut()
                              ? `Kết thúc công việc tại ${selectedCheckInLocation.name}`
                              : "Phải chấm vào trước"}
                          </Text>
                        </Box>
                      </Box>
                    </button>
                  </Box>
                </Box>
              )}
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
                  : "bg-blue-600 hover:bg-blue-700"
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
              <Box className="relative w-full aspect-square rounded-2xl overflow-hidden border-4 border-blue-600 shadow-lg bg-black">
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
                      <Box className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-20 h-20 border-2 border-blue-400 rounded-full"></Box>
                    </Box>
                  </>
                ) : (
                  <img
                    src={capturedPhoto}
                    alt="Captured"
                    className="w-full h-full object-cover"
                  />
                )}
              </Box>
              <canvas ref={canvasRef} className="hidden" />
            </Box>

            {/* Photo Info */}
            {capturedPhoto && (
              <Box className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 mb-4">
                <Box className="flex items-center justify-between mb-3">
                  <Text className="font-bold text-gray-900">
                    Thông Tin Chấm Công
                  </Text>
                  {locationViolation && (
                    <Box className="flex items-center gap-1 bg-red-100 text-red-700 px-2 py-1 rounded text-xs font-semibold">
                      <Icon icon="zi-alert" size={14} />
                      VI PHẠM
                    </Box>
                  )}
                </Box>
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
                      {selectedCheckInLocation?.name}
                    </Text>
                  </Box>
                  <Box className="flex justify-between items-center p-2 bg-gray-50 rounded-lg">
                    <Text className="text-sm text-gray-600">Tọa độ:</Text>
                    <Text className="text-xs font-mono text-gray-900">
                      {currentLocation.latitude.toFixed(4)},{" "}
                      {currentLocation.longitude.toFixed(4)}
                    </Text>
                  </Box>
                  {locationViolation && (
                    <Box className="flex justify-between items-center p-2 bg-red-50 rounded-lg border border-red-200">
                      <Text className="text-sm text-red-700 font-semibold">
                        Khoảng cách:
                      </Text>
                      <Text className="text-sm font-semibold text-red-700">
                        {violationDistance || 0}m
                      </Text>
                    </Box>
                  )}
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
                    className="py-3 rounded-lg font-semibold text-base bg-blue-600 hover:bg-blue-700 flex items-center justify-center gap-2"
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
              <Icon icon="zi-list-1" className="mr-2 text-blue-600" size={16} />
              Lịch Sử Chấm Công Hôm Nay
            </Text>
          </Box>

          <Box className="divide-y divide-gray-200">
            {checkInRecords.length > 0 ? (
              checkInRecords.map((record) => (
                <Box
                  key={record.id}
                  className={`p-4 transition-colors ${
                    record.isViolation
                      ? "hover:bg-red-50 bg-red-50 border-l-4 border-red-600"
                      : "hover:bg-gray-50"
                  }`}
                >
                  <Box className="flex items-start justify-between mb-2">
                    <Box>
                      <Box className="flex items-center gap-2">
                        <Text className="font-semibold text-gray-900">
                          {record.type === "Vào" ? "Chấm Vào" : "Chấm Ra"}
                        </Text>
                        {record.isViolation && (
                          <Box className="flex items-center gap-1 bg-red-600 text-white px-2 py-0.5 rounded text-xs font-semibold">
                            <Icon icon="zi-alert" size={12} />
                            VI PHẠM
                          </Box>
                        )}
                      </Box>
                      <Text className="text-sm text-gray-600 mt-1">
                        {record.checkInTime} - {record.location}
                      </Text>
                      <Text className="text-xs text-gray-500 mt-1">
                        {record.locationType === "warehouse"
                          ? "📦 Kho vật tư"
                          : "🏗️ Công trình"}
                      </Text>
                      {record.isViolation && (
                        <Text className="text-xs text-red-700 font-semibold mt-1">
                          ⚠️ Cách vị trí {record.violationDistance || 0}m
                        </Text>
                      )}
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
                    <Box
                      className={`mt-3 rounded-lg overflow-hidden border-2 aspect-square bg-gray-100 ${
                        record.isViolation
                          ? "border-red-400 ring-2 ring-red-300"
                          : "border-gray-200"
                      }`}
                    >
                      <img
                        src={record.photo}
                        alt="Check-in"
                        className="w-full h-full object-cover"
                      />
                      {record.isViolation && (
                        <Box className="absolute inset-0 bg-red-600/5 pointer-events-none"></Box>
                      )}
                    </Box>
                  )}

                  <Box className="flex items-center justify-between mt-2">
                    <Text className="text-xs text-gray-500 font-mono">
                      {record.latitude.toFixed(4)},{" "}
                      {record.longitude.toFixed(4)}
                    </Text>
                  </Box>
                </Box>
              ))
            ) : (
              <Box className="text-center py-8">
                <Icon
                  icon="zi-check-circle"
                  className="text-gray-400 text-3xl mb-2"
                />
                <Text className="text-gray-500 text-sm">
                  Chưa có chấm công hôm nay
                </Text>
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