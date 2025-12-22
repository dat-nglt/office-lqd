/*
 * Dữ liệu cần thiết cho trang CheckIn:
 * - checkInLocations: Mảng các đối tượng địa điểm chấm công với các trường id, name, type, address, latitude, longitude, radius, icon. Được sử dụng để hiển thị và chọn địa điểm chấm công.
 * - currentLocation: Đối tượng với latitude, longitude, accuracy, timestamp. Được sử dụng để xác định vị trí người dùng.
 * - currentPlaceName: Chuỗi tên địa điểm từ tọa độ. Được sử dụng để hiển thị địa chỉ.
 * - selectedCheckInLocation: Đối tượng địa điểm được chọn. Được sử dụng để xác định vị trí chấm công.
 * - selectedCheckInMode: Chuỗi ('in' hoặc 'out'). Được sử dụng để xác định chế độ chấm công.
 * - capturedPhoto: Chuỗi base64 của ảnh chụp. Được sử dụng để lưu ảnh chấm công.
 * - checkInRecords: Mảng các bản ghi chấm công với id, date, checkInTime, type, location, photo, latitude, longitude, isViolation, violationDistance. Được sử dụng để hiển thị lịch sử chấm công.
 * - locationViolation: Boolean cho biết có vi phạm vị trí không. Được sử dụng để cảnh báo.
 * - violationDistance: Số khoảng cách vi phạm. Được sử dụng để hiển thị khoảng cách.
 * - selectedCheckInType: Đối tượng loại chấm công được chọn (id, name, time). Được sử dụng để chọn loại chấm công.
 * - checkInTypes: Mảng các loại chấm công. Được sử dụng để hiển thị tùy chọn loại.
 *
 * API cần thiết (đề xuất thực hiện):
 * - fetchCheckInLocations(employeeId): API để lấy danh sách địa điểm chấm công từ backend dựa trên ID nhân viên. Ví dụ: GET /api/checkin/locations?employeeId=123. Trả về mảng checkInLocations.
 * - submitCheckIn(employeeId, data): API để gửi dữ liệu chấm công lên server, bao gồm vị trí, ảnh, loại, v.v. Ví dụ: POST /api/checkin/submit với body {employeeId, locationId, mode, photo, lat, lng, type, violation}. Trả về trạng thái thành công.
 * - fetchCheckInHistory(employeeId, date): API để lấy lịch sử chấm công cho một ngày cụ thể. Ví dụ: GET /api/checkin/history?employeeId=123&date=2024-11-17. Trả về mảng checkInRecords.
 * - validateLocation(employeeId, lat, lng): API để xác thực vị trí chấm công dựa trên tọa độ. Ví dụ: POST /api/checkin/validate với body {employeeId, lat, lng}. Trả về {isValid: boolean, distance: number, nearestLocation: object}.
 * - Cải tiến tiềm năng: Tích hợp geocoding API (như Google Maps) cho getPlaceNameFromCoordinates; thêm xử lý lỗi và caching cho vị trí; sử dụng Axios hoặc Fetch cho các API backend.
 * - Không có lệnh gọi API backend hiện tại; dựa vào SDK cho vị trí và dữ liệu local.
 */

import { Box, Page } from "zmp-ui";
import { useState, useRef, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { ToastContext } from "../components/layout";
import BottomNavigation from "../components/BottomNavigation";
import {
    getPlaceNameFromCoordinates,
    getPlaceDetailsFromCoordinates,
    calculateDistance,
    isPointWithinRadius,
} from "../utils/geocoding";
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

import { getLocation } from "zmp-sdk/apis";
import { getAccessToken } from "zmp-sdk/apis";
import { nativeStorage } from "zmp-sdk/apis";
import { dataURItoBlob, uploadCheckInPhoto } from "../services/upload.service";

function CheckIn() {
    const navigate = useNavigate();
    const toast = useContext(ToastContext);
    const [userInfo, setUserInfo] = useState(null);

    // Check-in locations: Kho vật tư + các công trình
    const [checkInLocations] = useState([
        {
            id: "warehouse",
            name: "Văn phòng Proshop - Daikin",
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
    const [selectedCheckInType, setSelectedCheckInType] = useState(null);
    // Submit check-in (client uploads image directly to Cloudinary)
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

    useEffect(() => {
        const token = nativeStorage.getItem("access_token");
        const userInfo = nativeStorage.getItem("user_info");

        if (!token || !userInfo) {
            navigate("/login", { replace: true });
        } else {
            try {
                setUserInfo(JSON.parse(userInfo));
            } catch (err) {
                console.error("Error parsing stored user info:", err);
                // Clear invalid data
                localStorage.removeItem("access_token");
                localStorage.removeItem("user_info");
                navigate("/login", { replace: true });
            }
        }
    }, [navigate]);

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
                    const placeName = await getPlaceNameFromCoordinates(userLocation.latitude, userLocation.longitude);
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

                                    <GetLocationButton
                                        onGetLocation={handleGetLocation}
                                        isCheckingLocation={isCheckingLocation}
                                    />
                                    
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
