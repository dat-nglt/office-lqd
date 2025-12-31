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
import { dataURItoBlob, submitCheckIn, uploadCheckInPhoto } from "../services/upload.service";
import {
  miniAppGetAttendanceLocation,
  miniAppGetAttendanceType,
  miniAppGetListOfWorkAssignmentsInCurrentDayByZAID,
  miniAppGetLocationByUserToken,
  miniAppGetProfileInfoByID,
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
  const [checkInLocations, setCheckInLocations] = useState([]);

  const [currentLocation, setCurrentLocation] = useState(null);
  const [currentPlaceName, setCurrentPlaceName] = useState(null);
  const [isLoadingPlaceName, setIsLoadingPlaceName] = useState(false);
  const [isCheckingLocation, setIsCheckingLocation] = useState(false);
  const [selectedAttendanceLocation, setSelectedAttendanceLocation] = useState(null);
  const [selectedAttendanceMode, setSelectedAttendanceMode] = useState(null);
  const [showCamera, setShowCamera] = useState(false);
  const [capturedPhoto, setCapturedPhoto] = useState(null);
  const [checkInRecords, setCheckInRecords] = useState([]);
  const [locationViolation, setLocationViolation] = useState(false);
  const [violationDistance, setViolationDistance] = useState(null); // Lưu khoảng cách vi phạm
  const [selectedAttendanceType, setSelectedAttendanceType] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [notes, setNotes] = useState("");

  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  const [checkInTypes, setCheckInTypes] = useState([]);

  // Decode vị trị từ location token
  const decodeLocationToken = async (locationToken, accessToken) => {
    try {
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

  // Lấy danh sách địa điểm chấm công trong ngày từ các công việc được giao
  const fetchLocationOfWorkInCurrentDay = async () => {
    try {
      const { userInfo } = await getUserInfo();
      const ZAID = userInfo.id;
      const userInfoResp = await miniAppGetProfileInfoByID(ZAID);
      const listOfWorkAssignmentsResp = await miniAppGetListOfWorkAssignmentsInCurrentDayByZAID(ZAID);

      if (userInfoResp.success) {
        console.log("userInfoResp", userInfoResp);
        setUserInfo(userInfoResp.data);
      }

      console.log("listOfWorkAssignmentsResp", listOfWorkAssignmentsResp);
      if (listOfWorkAssignmentsResp.success) {
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

        console.log("mappedAssignments", mappedAssignments);
        setCheckInLocations((prev) => [...prev, ...mappedAssignments]);
      }
    } catch (error) {
      toast?.error({
        title: "Lỗi tải địa điểm công việc",
        message: `Không thể tải địa điểm công việc trong ngày`,
        duration: 2000,
      });
    }
  };

  // Lấy danh sách địa điểm chấm công (Kho vật tư + Công trình) và loại chấm công
  const fetchAttendanceData = async () => {
    try {
      // Gọi cả hai API song song
      const [attendanceLocationResp, checkInTypeResp] = await Promise.all([
        miniAppGetAttendanceLocation(),
        miniAppGetAttendanceType(),
      ]);

      // Xử lý danh sách địa điểm
      if (attendanceLocationResp.success) {
        setCheckInLocations((prev) => [...prev, ...attendanceLocationResp.data]);
      } else {
        throw new Error("Không thể tải danh sách địa điểm chấm công");
      }

      // Xử lý danh sách loại chấm công
      if (checkInTypeResp.success) {
        setCheckInTypes(checkInTypeResp.data);
      } else {
        throw new Error("Không thể tải danh sách loại chấm công");
      }
    } catch (error) {
      toast?.error({
        title: "Lỗi tải dữ liệu",
        message: error.message || "Không thể tải dữ liệu chấm công",
        duration: 2000,
      });
    }
  };

  // Lấy vị trí hiện tại của người dùng từ Zalo Mini App
  const handleGetLocation = async () => {
    setIsCheckingLocation(true);
    try {
      const response = await getLocation();
      const accessToken = await getAccessToken();

      if (response) {
        const token = response.token;
        const locationData = await decodeLocationToken(token, accessToken);

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
          const workLocation = checkInLocations.find((loc) => loc.id === workCode);
          setSelectedAttendanceLocation(workLocation || null);
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
            setSelectedAttendanceLocation(closest);
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
    if (!capturedPhoto || !currentLocation || !selectedAttendanceLocation || !selectedAttendanceMode) {
      toast?.error({
        title: "Thông tin chấm công chưa đầy đủ",
        message: "Đảm bảo đã chụp ảnh, lấy vị trí và chọn địa điểm chấm công",
        duration: 2000,
      });
      return;
    }

    // Kiểm tra: phải chấm vào trước khi chấm ra
    if (selectedAttendanceMode === "out" && !canCheckOut()) {
      toast?.error({
        title: "Sai quy trình chấm công",
        message: "Bạn phải chấm vào trước khi chấm ra",
        duration: 2000,
      });
      return;
    }

    setSubmitting(true);

    try {
      // Chuyển đổi hình ảnh sang Blob
      const blob = dataURItoBlob(capturedPhoto);
      // Trích xuất work_id từ selectedAttendanceLocation (nếu có)
      const workId = selectedAttendanceLocation?.id || null;
      const resultPayload = await uploadCheckInPhoto(blob, userInfo.zalo_id);

      let attendanceDataPayload = {
        user_id: userInfo.id,
        work_id: workId,
        latitude: currentLocation.latitude,
        longitude: currentLocation.longitude,
        location_name: selectedAttendanceLocation.name,
        address: selectedAttendanceLocation.address || null,
        attendance_type_id: selectedAttendanceType?.id || null,
        violation_distance: violationDistance || null,
        notes: notes || null, // Ghi chú từ user input
        technicians: [userInfo.id],
        attendance_mode: selectedAttendanceMode,
        ...resultPayload,
      };

      console.log("attendanceDataPayload", attendanceDataPayload);
      return;

      // Gửi dữ liệu chấm công lên server
      const attendanceResp = await submitCheckIn(attendanceDataPayload);

      const attendanceRespData = attendanceResp.data;

      const photoUrl = resultPayload.photo_url;
      const now = new Date(attendanceRespData.check_in_time || Date.now());
      const checkInTypeText = selectedAttendanceMode === "in" ? "Vào" : "Ra";

      const newRecord = {
        id: attendanceRespData.id || Date.now(),
        date: now.toLocaleDateString("vi-VN"),
        checkInTime: now.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }),
        type: checkInTypeText,
        checkInType: checkInTypeText,
        location: attendanceRespData.location_name || selectedAttendanceLocation.name,
        locationType: selectedAttendanceLocation.type,
        photo: attendanceRespData.photo_url || photoUrl,
        latitude: attendanceRespData.latitude || currentLocation.latitude,
        longitude: attendanceRespData.longitude || currentLocation.longitude,
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
      setSelectedAttendanceLocation(null);
      setSelectedAttendanceMode(null);
      setLocationViolation(false);
      setViolationDistance(null);
      setNotes("");
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
  const handleSelectAttendaceMode = (mode) => {
    if (!selectedAttendanceLocation) {
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
    const isViolation = !isWithinLocation(selectedAttendanceLocation);
    const distance = getDistanceToLocation(selectedAttendanceLocation) || 0;

    // Set violation states
    setLocationViolation(isViolation);
    setViolationDistance(distance?.toFixed(0) || null);

    if (isViolation) {
      // Luôn mở camera và set mode (dù vi phạm hay không)
      setSelectedAttendanceMode(mode);
      setShowCamera(true);
      toast?.warning({
        title: "⚠️ Cảnh báo vi phạm vị trí",
        message: `Bạn cách ${selectedAttendanceLocation.name} ${
          distance?.toFixed(0) || 0
        }m. Chấm công này sẽ được đánh dấu là vi phạm!`,
        duration: 3000,
      });
    } else {
      // Luôn mở camera và set mode (dù vi phạm hay không)
      setSelectedAttendanceMode(mode);
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
    fetchAttendanceData();
    fetchLocationOfWorkInCurrentDay();
  }, [workCode]); // Load user info on mount

  return (
    <Page className="bg-gray-50 min-h-screen pb-20">
      <CheckInHeader />

      <Box className="p-4 pb-20">
        {!showCamera ? (
          <>
            <CheckInTypeSelector
              checkInTypes={checkInTypes}
              selectedAttendanceType={selectedAttendanceType}
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
                setSelectedAttendanceType(type);
              }}
            />

            <Box className="space-y-4 mb-6">
              {selectedAttendanceType && (
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
                    selectedCheckInLocation={selectedAttendanceLocation}
                    onSelectLocation={setSelectedAttendanceLocation}
                    isWithinLocation={isWithinLocation}
                    getDistanceToLocation={getDistanceToLocation}
                  />
                </>
              )}

              {/* Lựa chọn hình thức chấm công (Vào / Ra) */}
              <CheckInModeSelector
                selectedCheckInLocation={selectedAttendanceLocation}
                currentLocation={currentLocation}
                selectedAttendanceType={selectedAttendanceType}
                selectedAttendanceMode={selectedAttendanceMode}
                onSelectMode={handleSelectAttendaceMode}
                canCheckOut={canCheckOut}
              />
            </Box>
          </>
        ) : (
          <>
            <CameraView capturedPhoto={capturedPhoto} videoRef={videoRef} canvasRef={canvasRef} />

            <PhotoInfo
              capturedPhoto={capturedPhoto}
              selectedAttendanceMode={selectedAttendanceMode}
              selectedCheckInLocation={selectedAttendanceLocation}
              currentLocation={currentLocation}
              locationViolation={locationViolation}
              violationDistance={violationDistance}
              notes={notes}
              onNotesChange={setNotes}
            />

            <ActionButtons
              capturedPhoto={capturedPhoto}
              onCapturePhoto={capturePhoto}
              onSubmitCheckIn={handleSubmitCheckIn}
              onRetakePhoto={retakePhoto}
              onCancel={() => {
                setShowCamera(false);
                setCapturedPhoto(null);
                setSelectedAttendanceMode(null);
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
