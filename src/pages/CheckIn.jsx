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
import {
  dataURItoBlob,
  submitCheckIn,
  submitCheckOut,
  uploadCheckInPhoto,
  getTodayAttendanceHistory,
} from "../services/upload.service";
import { parseTodayAttendanceRecords } from "../utils/attendanceHelper";
import {
  miniAppGetAttendanceLocation,
  miniAppGetAttendanceType,
  miniAppGetListOfWorkAssignmentsInCurrentDayByZAID,
  miniAppGetLocationByUserToken,
  miniAppGetProfileInfoByID,
} from "../services/user.service";

function CheckIn() {
  const toast = useContext(ToastContext);
  const params = useParams(); // lấy tham số từ URL để xác định công việc chấm công
  const [searchParams] = useSearchParams(); // lấy tham số tìm kiếm từ URL
  const work_id = params.work_code || searchParams.get("work_id"); // Lấy work_code từ URL nếu có
  const [userInfo, setUserInfo] = useState(null); // Thông tin người dùng
  const [checkInLocations, setCheckInLocations] = useState([]); // Danh sách địa điểm chấm công trong ngày + thêm kho vật tư & văn phòng
  const [currentLocation, setCurrentLocation] = useState(null); // Vị trí hiện tại của người dùng
  const [currentPlaceName, setCurrentPlaceName] = useState(null); // Tên địa điểm hiện tại
  const [isLoadingPlaceName, setIsLoadingPlaceName] = useState(false); // Trạng thái tải tên địa điểm
  const [isCheckingLocation, setIsCheckingLocation] = useState(false); // Trạng thái đang lấy vị trí
  const [selectedAttendanceLocation, setSelectedAttendanceLocation] = useState(null); // Địa điểm chấm công đã chọn
  const [selectedAttendanceMode, setSelectedAttendanceMode] = useState(null); // Chế độ chấm công đã chọn (in/out)
  const [showCamera, setShowCamera] = useState(false); // Hiển thị camera để chụp ảnh
  const [capturedPhoto, setCapturedPhoto] = useState(null); // Ảnh đã chụp
  const [todayAttendanceRecords, setTodayAttendanceRecords] = useState([]); // Lịch sử chấm công
  const [locationViolation, setLocationViolation] = useState(false); // Trạng thái vi phạm vị trí
  const [violationDistance, setViolationDistance] = useState(null); // Lưu khoảng cách vi phạm
  const [selectedAttendanceType, setSelectedAttendanceType] = useState(null); // Loại chấm công đã chọn
  const [submitting, setSubmitting] = useState(false);
  const [notes, setNotes] = useState("");
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [checkInTypes, setCheckInTypes] = useState([]);
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
      if (userInfoResp.success) {
        setUserInfo(userInfoResp.data);
      } else {
        clearTokens();
      }

      const listOfWorkAssignmentsResp = await miniAppGetListOfWorkAssignmentsInCurrentDayByZAID(ZAID);
      const todayAttendanceHistoryResp = await getTodayAttendanceHistory(userInfoResp.data.id);
      console.log("Today's attendance history response:", todayAttendanceHistoryResp);


      // Parse today's attendance history and set local state
      // if (todayAttendanceHistoryResp?.success) {
      const parsed = parseTodayAttendanceRecords(todayAttendanceHistoryResp.data);
      setTodayAttendanceRecords(parsed);
      // }

      if (listOfWorkAssignmentsResp.success) {
        const mappedAssignments = (listOfWorkAssignmentsResp?.data || []).map((assign) => ({
          id: assign.work.id,
          name: assign.work.title,
          project_id: assign.work.project_id,
          serviceType: "outside_service",
          address: assign.work.location,
          latitude: parseFloat(assign.work.location_lat),
          longitude: parseFloat(assign.work.location_lng),
          radius: 70,
          icon: "zi-setting",
        }));

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
      // Gọi cả ba API song song
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

        if (work_id) {
          const workLocation = checkInLocations.find((loc) => loc.id === Number(work_id));
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
    return true;
    // return todayAttendanceRecords.some((record) => record.type === "Vào");
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
        project_id: selectedAttendanceLocation?.project_id || null,
        latitude: currentLocation.latitude,
        longitude: currentLocation.longitude,
        location_name: selectedAttendanceLocation.name,
        address: selectedAttendanceLocation.address || null,
        attendance_type_id: selectedAttendanceType?.id || null,
        notes: notes || null, // Ghi chú từ user input
        distance_from_work: violationDistance || 0,
        technicians: [userInfo.id],
        ...resultPayload,
      };

      let attendanceResp;
      if (selectedAttendanceMode === "out") {
        const checkOutDataPayload = {
          work_id: workId,
          user_id: userInfo.id,
          photo_url_check_out: resultPayload.photo_url,
          latitude_check_out: currentLocation.latitude,
          longitude_check_out: currentLocation.longitude,
          location_name_check_out: selectedAttendanceLocation.name,
          distance_from_work_check_out: violationDistance || 0,
          attendance_type_id: selectedAttendanceType?.id || null,
          address_check_out: selectedAttendanceLocation.address || null,
        };
        attendanceResp = await submitCheckOut(checkOutDataPayload);
      } else {
        attendanceResp = await submitCheckIn(attendanceDataPayload);
      }

      if (attendanceResp.success) {
        const attendanceRespData = attendanceResp.data;

        const checkInTypeText = selectedAttendanceMode === "in" ? "Chấm công vào" : "Chấm công ra";

        // Xác định dữ liệu dựa trên mode check-in/check-out
        let timeField, photoField, latitudeField, longitudeField, violationDistanceField;

        if (selectedAttendanceMode === "out") {
          timeField = attendanceRespData?.check_out_time;
          photoField = attendanceRespData?.photo_url_check_out;
          latitudeField = attendanceRespData?.latitude_check_out;
          longitudeField = attendanceRespData?.longitude_check_out;
          violationDistanceField = attendanceRespData?.violation_distance_check_out;
        } else {
          timeField = attendanceRespData?.check_in_time;
          photoField = attendanceRespData?.photo_url;
          latitudeField = attendanceRespData?.latitude;
          longitudeField = attendanceRespData?.longitude;
          violationDistanceField = attendanceRespData?.violation_distance;
        }

        const now = new Date(timeField || Date.now());

        const newRecord = {
          id: attendanceRespData?.id || Date.now(),
          date: now.toLocaleDateString("vi-VN"),
          checkInTime: now.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }),
          type: checkInTypeText,
          checkInType: checkInTypeText,
          location: attendanceRespData?.location_name || selectedAttendanceLocation.name,
          locationType: selectedAttendanceLocation.type,
          photo: photoField,
          latitude: parseFloat(latitudeField) || currentLocation.latitude,
          longitude: parseFloat(longitudeField) || currentLocation.longitude,
          isViolation: locationViolation,
          violationDistance: violationDistanceField || null,
        };

        setTodayAttendanceRecords((prev) => [newRecord, ...prev]);

        toast?.success({
          title: "Chấm công thành công",
          message: `Đã ghi nhận chấm ${checkInTypeText} lúc ${newRecord.checkInTime}`,
          duration: 2000,
        });
      } else {
        toast?.warn({
          title: "Chấm công thất bại",
          message: attendanceResp.message || "Chấm công không hợp lệ",
          duration: 10000,
        });
      }

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
  }, [work_id]); // Load user info on mount

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

        <CheckInHistory todayAttendanceRecords={todayAttendanceRecords} />
      </Box>

      <BottomNavigation />
    </Page>
  );
}

export default CheckIn;
