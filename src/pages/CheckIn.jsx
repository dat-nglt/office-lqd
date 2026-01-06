import { Box, Page } from "zmp-ui";
import { useState, useRef, useEffect, useContext } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
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
import { getAccessToken, getLocation } from "zmp-sdk/apis";
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
import { clearTokens, getTokens, getUserInfoInStorage } from "../config/axiosConfig";
import { getTimeValidationMessage, isValidTimeForType } from "../utils/attendance-type.helpers";

function CheckIn() {
  const toast = useContext(ToastContext);
  const navigate = useNavigate();
  const params = useParams();
  const [cannotCheckOutID, setCannotCheckOutID] = useState([]);
  const [searchParams] = useSearchParams();
  const work_id = params.work_code || searchParams.get("work_id");
  const [userDataInSystem, setUserDataInSystem] = useState(null);
  const [checkInLocations, setCheckInLocations] = useState([]);
  const [checkInTypes, setCheckInTypes] = useState([]);
  const [todayAttendanceRecords, setTodayAttendanceRecords] = useState([]);

  // Location states
  const [currentLocation, setCurrentLocation] = useState(null);
  const [isCheckingLocation, setIsCheckingLocation] = useState(false);
  const [selectedAttendanceLocation, setSelectedAttendanceLocation] = useState(null);

  // Attendance selection states
  const [selectedAttendanceType, setSelectedAttendanceType] = useState(null);
  const [selectedAttendanceMode, setSelectedAttendanceMode] = useState(null);

  // Camera & violation states
  const [showCamera, setShowCamera] = useState(false);
  const [capturedPhoto, setCapturedPhoto] = useState(null);
  const [locationViolation, setLocationViolation] = useState(false);
  const [violationDistance, setViolationDistance] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [notes, setNotes] = useState("");

  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  // Hàm decode location token từ Zalo Mini App
  const decodeLocationToken = async (locationToken, accessToken) => {
    try {
      const locationResp = await miniAppGetLocationByUserToken(locationToken, accessToken);
      return {
        latitude: locationResp.data.data.latitude,
        longitude: locationResp.data.data.longitude,
        accuracy: 150,
        altitude: 0,
        timestamp: locationResp.data.data.timestamp,
      };
    } catch (error) {
      toast?.error({
        title: "Lỗi giải mã vị trí",
        message: "Không thể giải mã vị trí từ ứng dụng Zalo Mini App",
        duration: 2000,
      });
    }
  };

  // Chuyển đổi danh sách công việc được giao thành định dạng địa điểm chấm công
  const mapWorkAssignmentsToLocations = (assignments) => {
    return (assignments || []).map((assign) => ({
      id: assign.work.id,
      name: assign.work.title,
      project_id: assign.work.project_id,
      address: assign.work.location,
      latitude: parseFloat(assign.work.location_lat),
      longitude: parseFloat(assign.work.location_lng),
      radius: 70,
      type: "work",
      icon: "zi-setting",
    }));
  };

  // Lấy danh sách địa điểm chấm công trong ngày từ các công việc được giao
  const fetchLocationOfWorkInCurrentDay = async () => {
    try {
      const userInfo = getUserInfoInStorage();
      const ZAID = userInfo.id;
      const userInfoResp = await miniAppGetProfileInfoByID(ZAID);
      setUserDataInSystem(userInfoResp.data);

      const [listOfWorkAssignmentsResp, todayAttendanceHistoryResp] = await Promise.all([
        miniAppGetListOfWorkAssignmentsInCurrentDayByZAID(ZAID),
        getTodayAttendanceHistory(userInfoResp.data.id),
      ]);

      const parsed = parseTodayAttendanceRecords(todayAttendanceHistoryResp.data);
      setTodayAttendanceRecords(parsed);

      if (listOfWorkAssignmentsResp.success) {
        const mappedAssignments = mapWorkAssignmentsToLocations(listOfWorkAssignmentsResp?.data);
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
      const [attendanceLocationResp, attendanceTypeResp] = await Promise.all([
        miniAppGetAttendanceLocation(),
        miniAppGetAttendanceType(),
      ]);

      // Xử lý danh sách địa điểm
      if (attendanceLocationResp.success) {
        setCannotCheckOutID(attendanceLocationResp.data.filter((loc) => loc.type !== "work").map((loc) => loc.id));
        setCheckInLocations((prev) => [...prev, ...attendanceLocationResp.data]);
      } else {
        throw new Error("Không thể tải danh sách địa điểm chấm công");
      }

      // Xử lý danh sách loại chấm công
      if (attendanceTypeResp.success) {
        setCheckInTypes(attendanceTypeResp.data);
      } else {
        throw new Error("Không thể tải danh sách loại chấm công trong ngày");
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
      const locationRespFromMiniApp = await getLocation();
      const accessToken = await getAccessToken();

      if (locationRespFromMiniApp) {
        const token = locationRespFromMiniApp.token;
        const locationData = await decodeLocationToken(token, accessToken);

        const placeName = await getPlaceNameFromCoordinates(
          parseFloat(locationData.latitude),
          parseFloat(locationData.longitude)
        );

        const userLocation = {
          latitude: parseFloat(locationData.latitude),
          longitude: parseFloat(locationData.longitude),
          placeName: placeName,
          accuracy: locationData.accuracy,
          timestamp: locationData.timestamp,
        };

        setCurrentLocation(userLocation);

        // Kiểm tra vị trí người dùng có nằm trong bán kính của bất kỳ địa điểm chấm công nào không
        const nearby = checkInLocations.filter((loc) =>
          isPointWithinRadius(userLocation.latitude, userLocation.longitude, loc.latitude, loc.longitude, loc.radius)
        );

        if (work_id) {
          // Nếu có work_id trong URL, ưu tiên chọn công trình đó
          const workLocation = checkInLocations.find((loc) => loc.id === Number(work_id));
          setSelectedAttendanceLocation(workLocation || null);
        } else if (nearby.length > 0) {
          // Nếu có địa điểm gần, chọn địa điểm gần nhất
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
          // Không có địa điểm nằm trong bán kính, thực hiện so sánh khoảng cách với tất cả địa điểm
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

          toast?.warn({
            title: "Vị trí không hợp lệ",
            message: `Bạn cách ${closestLocation.name} ${(distanceToClosest / 1000).toFixed(1) || 0}Km.`,
            duration: 3000,
          });
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
    return !cannotCheckOutID.includes(selectedAttendanceLocation?.id);
  };

  // Start camera
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "user",
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
  // Capture photo with 1:1 aspect ratio
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

      // Calculate crop area to maintain 1:1 aspect ratio
      const sourceSize = videoAspectRatio > 1 ? videoHeight : videoWidth;
      const sourceX = videoAspectRatio > 1 ? (videoWidth - sourceSize) / 2 : 0;
      const sourceY = videoAspectRatio > 1 ? 0 : (videoHeight - sourceSize) / 2;

      // Draw with mirror effect
      context.save();
      context.scale(-1, 1);
      context.translate(-size, 0);
      context.drawImage(video, sourceX, sourceY, sourceSize, sourceSize, 0, 0, size, size);
      context.restore();

      setCapturedPhoto(canvas.toDataURL("image/jpeg", 0.95));

      // Stop video stream
      const stream = video.srcObject;
      const tracks = stream.getTracks();
      tracks.forEach((track) => track.stop());
    }
  };

  // Build check-in/out payload based on mode
  const buildAttendancePayload = () => {
    const workId = selectedAttendanceLocation?.id || null;
    const basePayload = {
      user_id: userDataInSystem.id,
      latitude: currentLocation.latitude,
      longitude: currentLocation.longitude,
      location_name: currentLocation.placeName,
      address: selectedAttendanceLocation.address || null,
      attendance_type_id: selectedAttendanceType?.id || null,
      distance_from_work: violationDistance || 0,
    };

    if (selectedAttendanceMode === "out") {
      return {
        ...basePayload,
        work_id: workId,
        check_out_time_on_local: new Date(),
        latitude_check_out: currentLocation.latitude,
        longitude_check_out: currentLocation.longitude,
        location_name_check_out: currentLocation.placeName,
        distance_from_work_check_out: violationDistance || 0,
        address_check_out: selectedAttendanceLocation.address || null,
      };
    }

    return {
      ...basePayload,
      work_id: workId,
      check_in_time_on_local: new Date(),
      project_id: selectedAttendanceLocation?.project_id || null,
      notes: notes || null,
      technicians: [userDataInSystem.id],
    };
  };

  // Extract relevant fields from attendance response
  const getAttendanceResponseFields = (response) => {
    const isCheckOut = selectedAttendanceMode === "out";
    return {
      time: isCheckOut ? response?.check_out_time : response?.check_in_time,
      timeLocal: isCheckOut ? response?.check_out_time_on_local : response?.check_in_time_on_local,
      photo: isCheckOut ? response?.photo_url_check_out : response?.photo_url,
      latitude: isCheckOut ? response?.latitude_check_out : response?.latitude,
      longitude: isCheckOut ? response?.longitude_check_out : response?.longitude,
      violationDistance: isCheckOut ? response?.distance_from_work_check_out : response?.distance_from_work,
    };
  };

  // Build attendance record from response
  const buildAttendanceRecord = (response, photoUrl) => {
    const fields = getAttendanceResponseFields(response);
    const now = new Date(fields.time || Date.now());
    const isCheckOut = selectedAttendanceMode === "out";
    const checkInTypeText = isCheckOut ? "Chấm công ra" : "Chấm công vào";
    const workTitle = selectedAttendanceLocation.type === "work" ? selectedAttendanceLocation.name : "chưa xác định";

    return {
      id: response?.id || Date.now(),
      attendanceId: `${response.id}-${selectedAttendanceMode}`,
      workTitle,
      date: now.toLocaleDateString("vi-VN"),
      attendanceType: checkInTypeText,
      checkInTime: now.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }),
      attendanceTimeLocal: fields.timeLocal
        ? new Date(fields.timeLocal).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })
        : null,
      location: response?.location_name || selectedAttendanceLocation.name,
      locationType: selectedAttendanceLocation.type,
      isAtHub: response?.metadata?.hub === "warehouse" || response?.metadata?.hub === "office",
      photo: photoUrl || fields.photo,
      latitude: parseFloat(fields.latitude) || currentLocation.latitude,
      longitude: parseFloat(fields.longitude) || currentLocation.longitude,
      isViolation: locationViolation,
      violationDistance: fields.violationDistance || null,
    };
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
      const blob = dataURItoBlob(capturedPhoto);
      const resultPayload = await uploadCheckInPhoto(blob, userDataInSystem.zalo_id);
      const attendancePayload = buildAttendancePayload();
      const photoUrl = resultPayload.photo_url;

      const attendanceResp =
        selectedAttendanceMode === "out"
          ? await submitCheckOut({ ...attendancePayload, photo_url_check_out: photoUrl })
          : await submitCheckIn({ ...attendancePayload, photo_url: photoUrl });

      if (attendanceResp.success) {
        const newRecord = buildAttendanceRecord(attendanceResp.data, photoUrl);
        const checkInTypeText = selectedAttendanceMode === "in" ? "Chấm công vào" : "Chấm công ra";

        setTodayAttendanceRecords((prev) => {
          const existingIndex = prev.findIndex((record) => record.id === newRecord.id);
          if (existingIndex !== -1) {
            const updated = [...prev];
            updated[existingIndex] = { ...updated[existingIndex], workTitle: newRecord.workTitle };
            return [newRecord, ...updated];
          }
          return [newRecord, ...prev];
        });

        toast?.success({
          title: "Chấm công thành công",
          message: `Đã ghi nhận ${checkInTypeText} lúc ${newRecord.checkInTime}`,
          duration: 2000,
        });

        // Reset states
        setCapturedPhoto(null);
        setShowCamera(false);
        setSelectedAttendanceType(null);
        setCurrentLocation(null);
        setSelectedAttendanceLocation(null);
        setSelectedAttendanceMode(null);
        setLocationViolation(false);
        setViolationDistance(null);
        setNotes("");
      } else {
        toast?.warn({
          title: "Chấm công thất bại",
          message: attendanceResp.message || "Chấm công không hợp lệ",
          duration: 10000,
        });
      }
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

    if (mode === "out" && !canCheckOut()) {
      toast?.error({
        title: "Lỗi",
        message: "Bạn phải chấm vào trước khi chấm ra",
        duration: 2000,
      });
      return;
    }

    const isViolation = !isWithinLocation(selectedAttendanceLocation);
    const roundedDistance = Math.round(getDistanceToLocation(selectedAttendanceLocation) || 0);

    setLocationViolation(isViolation);
    setViolationDistance(roundedDistance);
    setSelectedAttendanceMode(mode);
    setShowCamera(true);

    if (isViolation) {
      toast?.warning({
        title: "⚠️ Cảnh báo vi phạm vị trí",
        message: `Bạn cách ${selectedAttendanceLocation.name} ${roundedDistance}m. Chấm công này sẽ được đánh dấu là vi phạm!`,
        duration: 3000,
      });
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

  const handleCheckSelectType = (type) => {
    // if (!isValidTimeForType(type)) {
    //   const timeMsg = getTimeValidationMessage(type);
    //   toast?.error({
    //     title: "Thời gian không hợp lệ",
    //     message: `Chấm công ${type?.name || type?.code || ""} chỉ được thực hiện ${timeMsg}`,
    //     duration: 3000,
    //   });
    //   return;
    // }
    setSelectedAttendanceType(type);
  };

  useEffect(() => {
    if (showCamera && !capturedPhoto) {
      startCamera();
    }
  }, [showCamera, capturedPhoto]);

  useEffect(() => {
    const currentToken = getTokens();
    if (!currentToken.accessToken) {
      clearTokens();
      navigate("/login");
    } else {
      fetchAttendanceData();
      fetchLocationOfWorkInCurrentDay();
    }
  }, [navigate]);

  return (
    <Page className="bg-gray-50 min-h-screen pb-20">
      <CheckInHeader />

      <Box className="p-4 pb-20">
        {!showCamera ? (
          <>
            <CheckInTypeSelector
              checkInTypes={checkInTypes}
              selectedAttendanceType={selectedAttendanceType}
              onSelectType={handleCheckSelectType}
            />

            <Box className="space-y-4 mb-6">
              {selectedAttendanceType && (
                <>
                  {/* Vị trí hiện tại của người dùng */}
                  <LocationStatus currentLocation={currentLocation} />

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

        {showCamera ? null : <CheckInHistory todayAttendanceRecords={todayAttendanceRecords} />}
      </Box>

      <BottomNavigation />
    </Page>
  );
}

export default CheckIn;
