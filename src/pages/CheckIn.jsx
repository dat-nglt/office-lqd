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

function CheckIn() {
  const toast = useContext(ToastContext);
  const navigate = useNavigate();
  const params = useParams(); // lấy tham số từ URL để xác định công việc chấm công
  const [searchParams] = useSearchParams(); // lấy tham số tìm kiếm từ URL
  const work_id = params.work_code || searchParams.get("work_id"); // Lấy work_code từ URL nếu có
  const [userDataInSystem, setUserDataInSystem] = useState(null); // Thông tin người dùng
  const [checkInLocations, setCheckInLocations] = useState([]); // Danh sách địa điểm chấm công trong ngày + thêm kho vật tư & văn phòng
  const [currentLocation, setCurrentLocation] = useState(null); // Vị trí hiện tại của người dùng
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
      const userInfo = getUserInfoInStorage();
      const ZAID = userInfo.id;
      const userInfoResp = await miniAppGetProfileInfoByID(ZAID);
      setUserDataInSystem(userInfoResp.data);

      const listOfWorkAssignmentsResp = await miniAppGetListOfWorkAssignmentsInCurrentDayByZAID(ZAID);
      const todayAttendanceHistoryResp = await getTodayAttendanceHistory(userInfoResp.data.id);
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
          address: assign.work.location,
          latitude: parseFloat(assign.work.location_lat),
          longitude: parseFloat(assign.work.location_lng),
          radius: 70,
          type: "work",
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
      const [attendanceLocationResp, attendanceTypeResp] = await Promise.all([
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
      if (attendanceTypeResp.success) {
        setCheckInTypes(attendanceTypeResp.data);
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

            toast?.warn({
              title: "Vị trí không hợp lệ",
              message: `Bạn cách ${closestLocation.name} ${(distanceToClosest / 1000).toFixed(1) || 0}Km.`,
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

      // Set canvas to 1:1 aspect ratio
      const size = 720;
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
      const resultPayload = await uploadCheckInPhoto(blob, userDataInSystem.zalo_id);

      let attendanceResp;
      if (selectedAttendanceMode === "out") {
        const checkOutDataPayload = {
          work_id: workId,
          user_id: userDataInSystem.id,
          check_out_time_on_local: new Date(), // Thời gian check-out trên thiết bị
          photo_url_check_out: resultPayload.photo_url,
          latitude_check_out: currentLocation.latitude,
          longitude_check_out: currentLocation.longitude,
          location_name_check_out: currentLocation.placeName,
          distance_from_work_check_out: violationDistance || 0,
          attendance_type_id: selectedAttendanceType?.id || null,
          address_check_out: selectedAttendanceLocation.address || null,
        };
        attendanceResp = await submitCheckOut(checkOutDataPayload);
      } else {
        let checkInPayload = {
          user_id: userDataInSystem.id,
          work_id: workId,
          check_in_time_on_local: new Date(),
          project_id: selectedAttendanceLocation?.project_id || null,
          latitude: currentLocation.latitude,
          longitude: currentLocation.longitude,
          location_name: currentLocation.placeName,
          address: selectedAttendanceLocation.address || null,
          attendance_type_id: selectedAttendanceType?.id || null,
          notes: notes || null,
          distance_from_work: violationDistance || 0,
          technicians: [userDataInSystem.id],
          ...resultPayload,
        };
        attendanceResp = await submitCheckIn(checkInPayload);
      }

      if (attendanceResp.success) {
        const attendanceRespData = attendanceResp.data;
        const checkInTypeText = selectedAttendanceMode === "in" ? "Chấm công vào" : "Chấm công ra";
        // Xác định dữ liệu dựa trên mode check-in/check-out
        let timeField, photoField, latitudeField, longitudeField, violationDistanceField, timeLocalField;

        timeField =
          selectedAttendanceMode === "out" ? attendanceRespData?.check_out_time : attendanceRespData?.check_in_time;
        timeLocalField =
          selectedAttendanceMode === "out"
            ? attendanceRespData?.check_out_time_on_local
            : attendanceRespData?.check_in_time_on_local;
        photoField =
          selectedAttendanceMode === "out" ? attendanceRespData?.photo_url_check_out : attendanceRespData?.photo_url;
        latitudeField =
          selectedAttendanceMode === "out" ? attendanceRespData?.latitude_check_out : attendanceRespData?.latitude;
        longitudeField =
          selectedAttendanceMode === "out" ? attendanceRespData?.longitude_check_out : attendanceRespData?.longitude;
        violationDistanceField =
          selectedAttendanceMode === "out"
            ? attendanceRespData?.distance_from_work_check_out
            : attendanceRespData?.distance_from_work;

        const now = new Date(timeField || Date.now());
        const updatedWorkTitle =
          selectedAttendanceLocation.type === "work" ? selectedAttendanceLocation.name : "chưa xác định";

        const newRecord = {
          id: attendanceRespData?.id || Date.now(),
          attendanceId: `${attendanceRespData.id}-${selectedAttendanceMode}`,
          workTitle: updatedWorkTitle,
          date: now.toLocaleDateString("vi-VN"),
          attendanceType: checkInTypeText,
          checkInTime: now.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }),
          attendanceTimeLocal: timeLocalField
            ? new Date(timeLocalField).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })
            : null,
          location: attendanceRespData?.location_name || selectedAttendanceLocation.name,
          locationType: selectedAttendanceLocation.type,
          isAtHub: attendanceRespData?.metadata?.hub === "warehouse" || attendanceRespData?.metadata?.hub === "office",
          photo: photoField,
          latitude: parseFloat(latitudeField) || currentLocation.latitude,
          longitude: parseFloat(longitudeField) || currentLocation.longitude,
          isViolation: locationViolation,
          violationDistance: violationDistanceField || null,
        };

        // Kiểm tra và cập nhật workTitle nếu có bản ghi cũ với cùng id
        setTodayAttendanceRecords((prev) => {
          const existingIndex = prev.findIndex((record) => record.id === newRecord.id);

          if (existingIndex !== -1) {
            // Có bản ghi cũ, cập nhật workTitle để đồng bộ
            const updated = [...prev];
            updated[existingIndex] = {
              ...updated[existingIndex],
              workTitle: newRecord.workTitle,
            };
            return [newRecord, ...updated];
          }

          // Không có bản ghi cũ, chỉ thêm mới
          return [newRecord, ...prev];
        });

        toast?.success({
          title: "Chấm công thành công",
          message: `Đã ghi nhận ${checkInTypeText} lúc ${newRecord.checkInTime}`,
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
    const roundedDistance = Number.isFinite(distance) ? Math.round(Number(distance)) : null;
    setLocationViolation(isViolation);
    setViolationDistance(roundedDistance);

    if (isViolation) {
      // Luôn mở camera và set mode (dù vi phạm hay không)
      setSelectedAttendanceMode(mode);
      setShowCamera(true);
      toast?.warning({
        title: "⚠️ Cảnh báo vi phạm vị trí",
        message: `Bạn cách ${selectedAttendanceLocation.name} ${
          roundedDistance || 0
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
  const isValidTimeForType = (typeOrId) => {
    const now = new Date();
    const hour = now.getHours();
    const minute = now.getMinutes();
    const currentTime = hour * 60 + minute;

    // If caller passed a type object with start_time/end_time, use them
    if (typeOrId && typeof typeOrId === "object") {
      const { start_time, end_time } = typeOrId;

      const parseToMinutes = (timeStr) => {
        // Expecting format like '11:30:00' or '11:30'
        const parts = (timeStr || "").split(":");
        const h = parseInt(parts[0] || "0", 10);
        const m = parseInt(parts[1] || "0", 10);
        return h * 60 + m;
      };

      const startMin = parseToMinutes(start_time);
      const endMin = parseToMinutes(end_time);

      if (startMin <= endMin) {
        return currentTime >= startMin && currentTime <= endMin;
      }

      // Overnight range (e.g., 22:00 - 06:00)
      return currentTime >= startMin || currentTime <= endMin;
    }

    // Backwards-compatible numeric id handling
    const typeId = typeof typeOrId === "number" ? typeOrId : typeOrId?.id;

    if (typeId === 1) return currentTime >= 8 * 60 && currentTime <= 17 * 60; // Regular Work (ID: 1) - 08:00 - 17:00

    // Overtime Lunch (ID: 4) - 11:30 - 13:00
    if (typeId === 4) return currentTime >= 11 * 60 + 30 && currentTime <= 13 * 60;

    // Overtime After (ID: 3) - 17:00 - 22:00
    if (typeId === 3) return currentTime >= 17 * 60 && currentTime <= 22 * 60;

    // Night Shift (ID: 2) - 22:00 - 06:00 (overnight)
    if (typeId === 2) return currentTime >= 22 * 60 || currentTime <= 6 * 60;

    return false; // Unknown
  };

  const handleCheckSelectType = (type) => {
    console.log("Selected attendance type:", type);
    if (!isValidTimeForType(type)) {
      // Build a helpful human-readable time message from available data
      let timeMsg = "";

      if (type && typeof type === "object") {
        if (type.start_time && type.end_time) {
          const start = type.start_time.slice(0, 5);
          const end = type.end_time.slice(0, 5);
          timeMsg = `${start} - ${end}`;
          if (type.code === "night_shift" && start > end) {
            timeMsg = `trong khoảng ${start} - ${end}`;
          } else {
            timeMsg = `trong khoảng ${start} - ${end}`;
          }
        } else {
          // fallback to known codes
          if (type.code === "overtime_after") timeMsg = "sau 17:00";
          else if (type.code === "overtime_lunch") timeMsg = "trong khoảng 11:30 - 13:00";
          else if (type.code === "night_shift") timeMsg = "trong khoảng 22:00 - 06:00";
        }
      } else {
        // fallback to numeric id mapping
        timeMsg =
          type.id === 3 // OVERTIME_AFTER
            ? "sau 17:00"
            : type.id === 4 // OVERTIME_LUNCH
            ? "trong khoảng 11:30 - 13:00"
            : type.id === 2 // NIGHT_SHIFT
            ? "trong khoảng 22:00 - 06:00"
            : "";
      }

      toast?.error({
        title: "Thời gian không hợp lệ",
        message: `Chấm công ${type?.name || type?.code || ""} chỉ được thực hiện ${timeMsg}`,
        duration: 3000,
      });
      return;
    }
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
  }, []);

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
