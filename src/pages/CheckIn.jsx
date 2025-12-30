import { Box, Page } from "zmp-ui";
import { useState, useRef, useEffect, useContext } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { ToastContext } from "../components/layout";
import BottomNavigation from "../components/BottomNavigation";
import { getPlaceNameFromCoordinates, calculateDistance, isPointWithinRadius } from "../utils/geocoding";
import CheckInHeader from "../components/checkin/CheckInHeader";
import CheckInTypeSelector from "../components/checkin/CheckInTypeSelector";
import LocationStatus from "../components/checkin/LocationStatus";
import LocationSelector from "../components/checkin/LocationSelector";
import CheckInModeSelector from "../components/checkin/CheckInModeSelector";
import GetLocationButton from "../components/checkin/GetLocationButton";
import CameraView from "../components/checkin/CameraView";
import PhotoInfo from "../components/checkin/PhotoInfo";
import ActionButtons from "../components/checkin/ActionButtons";
import CheckInHistory from "../components/checkin/CheckInHistory";
import { getAccessToken, getLocation, getUserInfo } from "zmp-sdk/apis";
import { dataURItoBlob, uploadCheckInPhoto } from "../services/upload.service";
import {
  miniAppGetListOfWorkAssignmentsInCurrentDayByZAID,
  miniAppGetLocationByUserToken,
} from "../services/user.service";

function CheckIn() {
  // const navigate = useNavigate()
  const toast = useContext(ToastContext);

  // Lấy params từ URL
  const params = useParams();
  const [searchParams] = useSearchParams();
  const workCode = params.work_code || searchParams.get("work_code");

  const [userInfo, setUserInfo] = useState(null);

  // Check-in locations: Kho vật tư + các công trình
  const [checkInLocations, setCheckInLocations] = useState([
    {
      id: "warehouse",
      name: "Văn phòng Proshop - Daikin",
      type: "warehouse",
      address: "89 Lê Thị Riêng, Phường Thới An, Quận 12, TP.HCM",
      latitude: 10.865716541594042,
      longitude: 106.65439575433395,
      radius: 70,
      icon: "zi-home",
    },
    {
      id: "warehouse2",
      name: "Kho Vật Tư LQD - Quận 12",
      type: "warehouse",
      address: "189a Đ. TX 25, Thạnh Xuân, Quận 12, TP.HCM",
      latitude: 10.879636346006611,
      longitude: 106.66332006457188,
      radius: 70,
      icon: "zi-home",
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
  const [selectedCheckInType, setSelectedCheckInType] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  const [checkInTypes] = useState([
    {
      id: 1,
      code: "REGULAR",
      name: "Chấm Công Ca Ngày",
      time: "08:00 - 17:00",
    },
    {
      id: 2,
      code: "NIGHT_SHIFT",
      name: "Chấm Công Ca Đêm",
      time: "22:00 - 06:00",
    },
    {
      id: 3,
      code: "OVERTIME_AFTER",
      name: "Tăng Ca Ngoài Giờ",
      time: "17:00 - 22:00",
    },
    {
      id: 4,
      code: "OVERTIME_LUNCH",
      name: "Tăng Ca Trưa",
      time: "11:30 - 13:00",
    },
  ]);

  const decodeLocationToken = async (locationToken, accessToken) => {
    try {
      console.log("Decoding location token:", locationToken);
      console.log("Using access token:", accessToken);
      const locationResp = await miniAppGetLocationByUserToken(locationToken, accessToken);

      const locationData = {
        latitude: locationResp.data.data.latitude,
        longitude: locationResp.data.data.longitude,
        accuracy: 150,
        altitude: 0,
        timestamp: locationResp.data.data.timestamp,
      };
      return locationData;
    } catch (error) {
      console.error("Error decoding location token:", error);
      throw error;
    }
  };

  const fetchLocationOfWorkInCurrentDay = async () => {
    try {
      const { userInfo } = await getUserInfo();
      const ZAID = userInfo.id;
      const listOfWorkAssignmentsResp = await miniAppGetListOfWorkAssignmentsInCurrentDayByZAID(ZAID);

      const mappedAssignments = (listOfWorkAssignmentsResp?.data || []).map((assign) => ({
        id: assign.work.work_code,
        name: assign.work.title,
        serviceType: "outside_service",
        address: assign.work.location,
        latitude: parseFloat(assign.work.location_lat),
        longitude: parseFloat(assign.work.location_lng),
        radius: 70,
        icon: "zi-setting",
      }));
      setCheckInLocations((prev) => [...prev, ...mappedAssignments]);
    } catch (error) {
      toast?.error({
        title: "Lỗi tải địa điểm công việc",
        message: `Không thể tải địa điểm công việc trong ngày`,
        duration: 2000,
      });
    }
  };

  // Get user's current location
  const handleGetLocation = async () => {
    setIsCheckingLocation(true);
    try {
      const response = await getLocation();
      const accessToken = await getAccessToken();

      if (response) {
        const token = response.token;
        const locationData = await decodeLocationToken(token, accessToken);
        console.log("Obtained location data:", locationData);

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
          setCurrentPlaceName(`${userLocation.latitude.toFixed(5)}, ${userLocation.longitude.toFixed(5)}`);
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

        if (workCode) {
          console.log("Work code detected in URL:", workCode);
          const workLocation = checkInLocations.find((loc) => loc.id === workCode);
          setSelectedCheckInLocation(workLocation || null);
        } else {
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
              message: `Bạn cách ${closestLocation.name} ${distanceToClosest.toFixed(
                0
              )}m. Vui lòng đến địa điểm chấm công.`,
              duration: 3000,
            });
          }
        }
      } else {
        throw new Error(response.message || "Không thể lấy vị trí");
      }
    } catch (error) {
      console.error("Error getting location:" + error);
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

  const handleSubmitCheckIn = async () => {
    if (!capturedPhoto || !currentLocation || !selectedCheckInLocation || !selectedCheckInMode) {
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

    setSubmitting(true);

    try {
      // 1) Convert base64 to Blob
      const blob = dataURItoBlob(capturedPhoto);

      // 2) Prepare check-in data (without photo info)
      const checkInData = {
        user_id: userInfo.id,
        latitude: currentLocation.latitude,
        longitude: currentLocation.longitude,
        location_name: selectedCheckInLocation.name,
        address: selectedCheckInLocation.address || null,
        check_in_type_id: selectedCheckInType?.id || null,
        violation_distance: violationDistance || null,
        mode: selectedCheckInMode,
      };

      // 3) Call upload service to handle: get signature -> upload -> submit
      const result = await uploadCheckInPhoto(blob, checkInData, userInfo.employee_id);

      const attendance = result.attendance;
      const photoUrl = result.photoUrl;
      const now = new Date(attendance.check_in_time || Date.now());
      const checkInTypeText = selectedCheckInMode === "in" ? "Vào" : "Ra";

      const newRecord = {
        id: attendance.id || Date.now(),
        date: now.toLocaleDateString("vi-VN"),
        checkInTime: now.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }),
        type: checkInTypeText,
        checkInType: checkInTypeText,
        location: attendance.location_name || selectedCheckInLocation.name,
        locationType: selectedCheckInLocation.type,
        photo: attendance.photo_url || photoUrl,
        latitude: attendance.latitude || currentLocation.latitude,
        longitude: attendance.longitude || currentLocation.longitude,
        isViolation: locationViolation,
        violationDistance: violationDistance || null,
      };

      setCheckInRecords((prev) => [newRecord, ...prev]);

      toast?.success({
        title: "Chấm công thành công",
        message: `Đã ghi nhận chấm ${checkInTypeText} lúc ${newRecord.checkInTime}`,
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
    } catch (error) {
      console.error("Error submitting check-in: " + error.message);
      toast?.error({ title: "Lỗi", message: error.message || "Không thể chấm công", duration: 3000 });
    } finally {
      setSubmitting(false);
    }
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
    const distance = isViolation ? getDistanceToLocation(selectedCheckInLocation) : null;

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

  // Check if time is valid for check-in type
  const isValidTimeForType = (typeId) => {
    const now = new Date();
    const hour = now.getHours();
    const minute = now.getMinutes();
    const currentTime = hour * 60 + minute;

    // Regular (ID: 1) - Không ràng buộc thời gian
    if (typeId === 1) {
      return true;
    }

    // Overtime Lunch (ID: 4) - 11:30 - 13:00
    if (typeId === 4) {
      return currentTime >= 11 * 60 + 30 && currentTime <= 13 * 60;
    }

    // Overtime After (ID: 3) - 17:00 - 22:00
    if (typeId === 3) {
      return currentTime >= 17 * 60 && currentTime <= 22 * 60;
    }

    // Night Shift (ID: 2) - 22:00 - 06:00 (qua đêm)
    if (typeId === 2) {
      return currentTime >= 22 * 60 || currentTime <= 6 * 60;
    }

    return false; // Trường hợp không xác định
  };

  useEffect(() => {
    if (showCamera && !capturedPhoto) {
      startCamera();
    }
  }, [showCamera, capturedPhoto]);

  useEffect(() => {
    fetchLocationOfWorkInCurrentDay();
  }, []); // Load user info on mount

  return (
    <Page className="bg-gray-50 min-h-screen pb-20">
      <CheckInHeader />

      <Box className="p-4 pb-20">
        {!showCamera ? (
          <>
            <CheckInTypeSelector
              checkInTypes={checkInTypes}
              selectedCheckInType={selectedCheckInType}
              onSelectType={(type) => {
                if (!isValidTimeForType(type.id)) {
                  const timeMsg =
                    type.id === 3 // OVERTIME_AFTER
                      ? "sau 17:00"
                      : type.id === 4 // OVERTIME_LUNCH
                      ? "trong khoảng 11:30 - 13:00"
                      : type.id === 2 // NIGHT_SHIFT
                      ? "trong khoảng 22:00 - 06:00"
                      : "";
                  toast?.error({
                    title: "Thời gian không hợp lệ",
                    message: `Chấm công ${type.name} chỉ được thực hiện ${timeMsg}`,
                    duration: 3000,
                  });
                  return;
                }
                setSelectedCheckInType(type);
              }}
            />

            <Box className="space-y-4 mb-6">
              {selectedCheckInType && (
                <>
                  {/* Vị trí hiện tại của người dùng */}
                  <LocationStatus
                    currentLocation={currentLocation}
                    currentPlaceName={currentPlaceName}
                    isLoadingPlaceName={isLoadingPlaceName}
                  />

                  <GetLocationButton onGetLocation={handleGetLocation} isCheckingLocation={isCheckingLocation} />

                  {/* Lựa chọn địa điểm chấm công trong ngày (Kho hoặc công trình) */}
                  <LocationSelector
                    currentLocation={currentLocation}
                    checkInLocations={checkInLocations}
                    selectedCheckInLocation={selectedCheckInLocation}
                    onSelectLocation={setSelectedCheckInLocation}
                    isWithinLocation={isWithinLocation}
                    getDistanceToLocation={getDistanceToLocation}
                  />
                </>
              )}

              {/* Lựa chọn hình thức chấm công (Vào / Ra) */}
              <CheckInModeSelector
                selectedCheckInLocation={selectedCheckInLocation}
                currentLocation={currentLocation}
                selectedCheckInType={selectedCheckInType}
                selectedCheckInMode={selectedCheckInMode}
                onSelectMode={handleSelectCheckInMode}
                canCheckOut={canCheckOut}
              />
            </Box>
          </>
        ) : (
          <>
            <CameraView capturedPhoto={capturedPhoto} videoRef={videoRef} canvasRef={canvasRef} />

            <PhotoInfo
              capturedPhoto={capturedPhoto}
              selectedCheckInMode={selectedCheckInMode}
              selectedCheckInLocation={selectedCheckInLocation}
              currentLocation={currentLocation}
              locationViolation={locationViolation}
              violationDistance={violationDistance}
            />

            <ActionButtons
              capturedPhoto={capturedPhoto}
              onCapturePhoto={capturePhoto}
              onSubmitCheckIn={handleSubmitCheckIn}
              onRetakePhoto={retakePhoto}
              onCancel={() => {
                setShowCamera(false);
                setCapturedPhoto(null);
                setSelectedCheckInMode(null);
              }}
              submitting={submitting}
            />
          </>
        )}

        <CheckInHistory checkInRecords={checkInRecords} />
      </Box>

      <BottomNavigation />
    </Page>
  );
}

export default CheckIn;
