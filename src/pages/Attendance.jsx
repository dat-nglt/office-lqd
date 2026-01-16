import { Box, Page, Spinner, Text, Button } from "zmp-ui";
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
import CameraView from "../components/checkin/CameraView";
import PhotoInfo from "../components/checkin/PhotoInfo";
import ActionButtons from "../components/checkin/ActionButtons";
import CheckInHistory from "../components/checkin/CheckInHistory";
import OvertimeRequestModal from "../components/checkin/OvertimeRequestModal";
import { getAccessToken, getLocation } from "zmp-sdk/apis";
import {
    dataURItoBlob,
    submitCheckIn,
    submitCheckOut,
    uploadCheckInPhoto,
    getTodayAttendanceHistory,
    submitCheckInOfffice,
    submitCheckOutOfffice,
} from "../services/upload.service";
import { submitOvertimeRequest } from "../services/overtime-request.service";
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
    const params = useParams();
    const [searchParams] = useSearchParams();
    const work_id = params.work_code || searchParams.get("work_id");

    // User & System Data
    const [userDataInSystem, setUserDataInSystem] = useState(null);
    const [checkInTypes, setCheckInTypes] = useState([]);

    // Attendance Locations
    const [attendanceLocations, setAttendanceLocations] = useState({
        workAssignments: [], // Địa điểm từ công việc được giao
        defaults: [], // Địa điểm mặc định (kho, văn phòng, công trình)
    });

    // Current Location
    const [currentLocation, setCurrentLocation] = useState(null);
    const [isCheckingLocation, setIsCheckingLocation] = useState(false);

    // Check-in Selection
    const [checkinSelection, setCheckinSelection] = useState({
        location: null,
        mode: null, // 'in' | 'out'
        type: null,
    });

    // Location Violation Status
    const [locationStatus, setLocationStatus] = useState({
        isViolation: false,
        violationDistance: null,
    });

    // Camera State
    const [cameraState, setCameraState] = useState({
        isOpen: false,
        capturedPhoto: null,
    });

    // Overtime Request Modal State
    const [overtimeModalVisible, setOvertimeModalVisible] = useState(false);
    const [overtimeSubmitting, setOvertimeSubmitting] = useState(false);

    // Attendance Records & Notes
    const [todayAttendanceRecords, setTodayAttendanceRecords] = useState([]);
    const [notes, setNotes] = useState("");
    const [submitting, setSubmitting] = useState(false);

    // Refs
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
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
            const parsed = parseTodayAttendanceRecords(todayAttendanceHistoryResp.data);
            setTodayAttendanceRecords(parsed);

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

                setAttendanceLocations((prev) => ({
                    ...prev,
                    workAssignments: [...prev.workAssignments, ...mappedAssignments],
                }));
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
            const [attendanceLocationResp, attendanceTypeResp] = await Promise.all([
                miniAppGetAttendanceLocation(),
                miniAppGetAttendanceType(),
            ]);

            if (attendanceLocationResp.success) {
                setAttendanceLocations((prev) => ({
                    ...prev,
                    defaults: attendanceLocationResp.data,
                }));
            } else {
                throw new Error("Không thể tải danh sách địa điểm chấm công");
            }

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

                // Tạo danh sách tất cả địa điểm (công việc + mặc định) CHỈ để kiểm tra tính hợp lệ
                const allLocations = [...attendanceLocations.workAssignments, ...attendanceLocations.defaults];

                // Kiểm tra khoảng cách từ vị trí hiện tại đến TẤT CẢ địa điểm - nếu < 150m thì vị trí hợp lệ
                const locationsWithin150m = allLocations
                    .map((loc) => ({
                        ...loc,
                        distance: calculateDistance(
                            userLocation.latitude,
                            userLocation.longitude,
                            loc.latitude,
                            loc.longitude
                        ),
                    }))
                    .filter((loc) => loc.distance < 150);

                // Xác định vị trí hợp lệ hay không (dùng tất cả địa điểm để kiểm tra)
                const isLocationValid = locationsWithin150m.length > 0;

                if (work_id) {
                    const workLocation = attendanceLocations.workAssignments.find((loc) => loc.id === Number(work_id));
                    setCheckinSelection((prev) => ({ ...prev, location: workLocation || null }));
                    if (isLocationValid) {
                        toast?.success({
                            title: "Vị trí hợp lệ",
                            message: `Bạn có thể thực hiện chấm công ngay bây giờ!`,
                            duration: 2000,
                        });
                    }
                } else {
                    if (isLocationValid) {
                        // Vị trí hợp lệ - chọn công việc được giao gần nhất từ attendanceLocations.workAssignments
                        if (attendanceLocations.workAssignments.length === 0) {
                            setLocationStatus({ isViolation: false, violationDistance: null });
                            toast?.success({
                                title: "Thông tin làm việc trong ngày",
                                message:
                                    "Bạn không có lịch làm việc tại công trình, tiến hành chấm công tại Văn phòng & Kho",
                                duration: 3000,
                            });
                            return;
                        }

                        const workLocationsWithDistance = attendanceLocations.workAssignments.map((loc) => ({
                            ...loc,
                            distance: calculateDistance(
                                userLocation.latitude,
                                userLocation.longitude,
                                loc.latitude,
                                loc.longitude
                            ),
                        }));

                        const closest = workLocationsWithDistance.reduce((prev, current) =>
                            prev.distance < current.distance ? prev : current
                        );

                        setCheckinSelection((prev) => ({ ...prev, location: closest }));
                        setLocationStatus({ isViolation: false, violationDistance: closest.distance });

                        toast?.success({
                            title: "Vị trí hợp lệ",
                            message: `Bạn có thể thực hiện chấm công ngay bây giờ!`,
                            duration: 2000,
                        });
                    } else {
                        // Vị trí không hợp lệ - tìm địa điểm gần nhất từ toàn bộ danh sách để báo vi phạm
                        if (allLocations.length === 0) {
                            setLocationStatus({ isViolation: false, violationDistance: null });
                            toast?.warn({
                                title: "Xác định vị trí thất bại",
                                message: "Không có địa điểm chấm công được cấu hình sẵn trong hệ thống",
                                duration: 3000,
                            });
                            return;
                        }

                        const closestLocation = allLocations.reduce((prev, current) => {
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

                        setLocationStatus({ isViolation: true, violationDistance: distanceToClosest });

                        toast?.warn({
                            title: "Vị trí không hợp lệ",
                            message: `Bạn đang ở ngoài phạm vi chấm công (${Math.round(
                                distanceToClosest
                            )}m). Vui lòng di chuyển đến gần địa điểm chấm công hơn!`,
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

    const canCheckOut = () => {
        return true;
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

            context.save();
            context.scale(-1, 1);
            context.translate(-size, 0);
            context.drawImage(video, sourceX, sourceY, sourceWidth, sourceHeight, 0, 0, size, size);
            context.restore();

            const imageData = canvas.toDataURL("image/jpeg", 0.95);
            setCameraState((prev) => ({ ...prev, capturedPhoto: imageData }));

            const stream = video.srcObject;
            const tracks = stream.getTracks();
            tracks.forEach((track) => track.stop());
        }
    };

    // Handle office/warehouse check-in
    // Routes to different API endpoint for office-based attendance vs work-based attendance
    const handleSubmitOfficeAttendance = async (blob, resultPayload) => {
        try {
            const isWithinRadius = isWithinLocation(checkinSelection.location);
            const officeLocationId = checkinSelection.location?.id || null;

            // Determine attendance category based on check-in type name
            let attendanceCategory = "regular";
            if (checkinSelection.type?.name?.toLowerCase().includes("công tác")) {
                attendanceCategory = "business_trip";
            } else if (checkinSelection.type?.name?.toLowerCase().includes("từ xa")) {
                attendanceCategory = "remote_work";
            } else if (checkinSelection.type?.name?.toLowerCase().includes("nhà")) {
                attendanceCategory = "work_from_home";
            }

            let attendanceResp;

            if (checkinSelection.mode === "out") {
                const checkOutDataPayload = {
                    user_id: userDataInSystem.id,
                    office_location_id: officeLocationId,
                    office_location_id_check_out: officeLocationId,
                    check_out_time_on_local: new Date(),
                    photo_url_check_out: resultPayload.photo_url,
                    latitude_check_out: currentLocation.latitude,
                    longitude_check_out: currentLocation.longitude,
                    location_name_check_out: currentLocation.placeName,
                    address_check_out: checkinSelection.location.address || null,
                    attendance_type_id: checkinSelection.type?.id || null,
                    is_within_radius_check_out: isWithinRadius,
                    violation_distance_check_out: locationStatus.violationDistance || 0,
                    check_out_metadata: {
                        attendanceMode: "out",
                        locationType: "office",
                    },
                    work_id: null,
                    project_id: null,
                };
                console.log("Office Check-Out Payload:", checkOutDataPayload);
                attendanceResp = await submitCheckOutOfffice(checkOutDataPayload);
            } else {
                let checkInPayload = {
                    user_id: userDataInSystem.id,
                    office_location_id: officeLocationId,
                    check_in_time_on_local: new Date(),
                    latitude: currentLocation.latitude,
                    longitude: currentLocation.longitude,
                    location_name: currentLocation.placeName,
                    address: checkinSelection.location.address || null,
                    attendance_type_id: checkinSelection.type?.id || null,
                    notes: notes || null,
                    distance_from_work: locationStatus.violationDistance || 0,
                    is_within_radius: isWithinRadius,
                    violation_distance: locationStatus.violationDistance || 0,
                    attendance_category: attendanceCategory,
                    check_in_metadata: {
                        attendanceMode: "in",
                        locationType: "office",
                    },
                    work_id: null,
                    project_id: null,
                    ...resultPayload,
                };

                console.log("Office Check-Out Payload:", checkInPayload);
                attendanceResp = await submitCheckInOfffice(checkInPayload);
            }

            return attendanceResp;
        } catch (error) {
            console.error("Error submitting office attendance:", error.message);
            throw error;
        }
    };

    // Determine if location is office/warehouse type
    const isOfficeOrWarehouseLocation = (location) => {
        if (!location) return false;
        const locationType = location.type?.toLowerCase();
        return locationType === "office" || locationType === "warehouse" || locationType === "kho";
    };

    const handleSubmitAttendance = async () => {
        if (!cameraState.capturedPhoto || !currentLocation || !checkinSelection.location || !checkinSelection.mode) {
            toast?.error({
                title: "Thông tin chấm công chưa đầy đủ",
                message: "Đảm bảo đã chụp ảnh, lấy vị trí và chọn địa điểm chấm công",
                duration: 2000,
            });
            return;
        }

        if (checkinSelection.mode === "out" && !canCheckOut()) {
            toast?.error({
                title: "Sai quy trình chấm công",
                message: "Bạn phải chấm vào trước khi chấm ra",
                duration: 2000,
            });
            return;
        }

        setSubmitting(true);

        try {
            const blob = dataURItoBlob(cameraState.capturedPhoto);
            const workId = checkinSelection.location?.id || null;
            const resultPayload = await uploadCheckInPhoto(blob, userDataInSystem.zalo_id);

            // Route to appropriate attendance handler based on location type
            let attendanceResp;
            if (isOfficeOrWarehouseLocation(checkinSelection.location)) {
                attendanceResp = await handleSubmitOfficeAttendance(blob, resultPayload);
            } else {
                // Handle traditional work attendance
                if (checkinSelection.mode === "out") {
                    const isWithinRadius = isWithinLocation(checkinSelection.location);
                    const matchingDefaultLocation = attendanceLocations.defaults.find((defaultLoc) =>
                        isPointWithinRadius(
                            currentLocation.latitude,
                            currentLocation.longitude,
                            defaultLoc.latitude,
                            defaultLoc.longitude,
                            defaultLoc.radius || 70
                        )
                    );

                    const checkOutDataPayload = {
                        work_id: workId,
                        user_id: userDataInSystem.id,
                        check_out_time_on_local: new Date(),
                        photo_url_check_out: resultPayload.photo_url,
                        latitude_check_out: currentLocation.latitude,
                        longitude_check_out: currentLocation.longitude,
                        location_name_check_out: currentLocation.placeName,
                        distance_from_work_check_out: locationStatus.violationDistance || 0,
                        attendance_type_id: checkinSelection.type?.id || null,
                        address_check_out: checkinSelection.location.address || null,
                        is_within_radius_check_out: isWithinRadius,
                        violation_distance_check_out: locationStatus.violationDistance || 0,
                        check_out_metadata: {
                            attendanceMode: "out",
                            isAtHub: !!matchingDefaultLocation,
                            locationType: matchingDefaultLocation?.type || checkinSelection.location?.type || null,
                        },
                    };
                    attendanceResp = await submitCheckOut(checkOutDataPayload);

                    console.log("Check-Out Payload:", attendanceResp);
                } else {
                    const isWithinRadius = isWithinLocation(checkinSelection.location);
                    const matchingDefaultLocation = attendanceLocations.defaults.find((defaultLoc) =>
                        isPointWithinRadius(
                            currentLocation.latitude,
                            currentLocation.longitude,
                            defaultLoc.latitude,
                            defaultLoc.longitude,
                            defaultLoc.radius || 70
                        )
                    );

                    let checkInPayload = {
                        user_id: userDataInSystem.id,
                        work_id: workId,
                        check_in_time_on_local: new Date(),
                        project_id: checkinSelection.location?.project_id || null,
                        latitude: currentLocation.latitude,
                        longitude: currentLocation.longitude,
                        location_name: currentLocation.placeName,
                        address: checkinSelection.location.address || null,
                        attendance_type_id: checkinSelection.type?.id || null,
                        notes: notes || null,
                        distance_from_work: locationStatus.violationDistance || 0,
                        is_within_radius: isWithinRadius,
                        violation_distance: locationStatus.violationDistance || 0,
                        check_in_metadata: {
                            attendanceMode: "in",
                            isAtHub: !!matchingDefaultLocation,
                            locationType: matchingDefaultLocation?.type || checkinSelection.location?.type || null,
                        },
                        technicians: [userDataInSystem.id],
                        ...resultPayload,
                    };
                    attendanceResp = await submitCheckIn(checkInPayload);
                    console.log("Check-In Payload:", attendanceResp);
                }
            }

            if (attendanceResp.success) {
                const attendanceRespData = attendanceResp.data;
                const checkInTypeText = checkinSelection.mode === "in" ? "Chấm công vào" : "Chấm công ra";
                let timeField, photoField, latitudeField, longitudeField, violationDistanceField, timeLocalField;

                timeField =
                    checkinSelection.mode === "out"
                        ? attendanceRespData?.check_out_time
                        : attendanceRespData?.check_in_time;
                timeLocalField =
                    checkinSelection.mode === "out"
                        ? attendanceRespData?.check_out_time_on_local
                        : attendanceRespData?.check_in_time_on_local;
                photoField =
                    checkinSelection.mode === "out"
                        ? attendanceRespData?.photo_url_check_out
                        : attendanceRespData?.photo_url;
                latitudeField =
                    checkinSelection.mode === "out"
                        ? attendanceRespData?.latitude_check_out
                        : attendanceRespData?.latitude;
                longitudeField =
                    checkinSelection.mode === "out"
                        ? attendanceRespData?.longitude_check_out
                        : attendanceRespData?.longitude;
                violationDistanceField =
                    checkinSelection.mode === "out"
                        ? attendanceRespData?.distance_from_work_check_out
                        : attendanceRespData?.distance_from_work;

                const now = new Date(timeField || Date.now());
                const updatedWorkTitle =
                    checkinSelection.location.type === "work" ? checkinSelection.location.name : "chưa xác định";

                // Xác định metadata chính xác dựa trên mode (check-in hoặc check-out)
                const relevantMetadata =
                    checkinSelection.mode === "out"
                        ? attendanceRespData?.check_out_metadata
                        : attendanceRespData?.check_in_metadata;

                const isAtHub = relevantMetadata?.isAtHub ?? false;
                const locationType = relevantMetadata?.locationType ?? checkinSelection.location?.type;

                const newRecord = {
                    id: attendanceRespData?.id || Date.now(),
                    attendanceId: `${attendanceRespData.id}-${checkinSelection.mode}`,
                    workTitle: updatedWorkTitle,
                    date: now.toLocaleDateString("vi-VN"),
                    attendanceType: checkInTypeText,
                    checkInTime: now.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }),
                    attendanceTimeLocal: timeLocalField
                        ? new Date(timeLocalField).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })
                        : null,
                    location: attendanceRespData?.location_name || checkinSelection.location.name,
                    locationType: locationType,
                    isAtHub: isAtHub,
                    photo: photoField,
                    latitude: parseFloat(latitudeField) || currentLocation.latitude,
                    longitude: parseFloat(longitudeField) || currentLocation.longitude,
                    isViolation: locationStatus.isViolation,
                    violationDistance: violationDistanceField || null,
                };

                setTodayAttendanceRecords((prev) => {
                    const existingIndex = prev.findIndex((record) => record.id === newRecord.id);

                    if (existingIndex !== -1) {
                        const updated = [...prev];
                        updated[existingIndex] = {
                            ...updated[existingIndex],
                            workTitle: newRecord.workTitle,
                        };
                        return [newRecord, ...updated];
                    }

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

            setCameraState({ isOpen: false, capturedPhoto: null });
            setCurrentLocation(null);
            setCheckinSelection({ location: null, mode: null, type: null });
            setLocationStatus({ isViolation: false, violationDistance: null });
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
        setCameraState((prev) => ({ ...prev, capturedPhoto: null }));
        startCamera();
    };

    // Proceed to camera selection
    const handleSelectAttendaceMode = (mode) => {
        if (!checkinSelection.location) {
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

        const isViolation = !isWithinLocation(checkinSelection.location);
        const distance = getDistanceToLocation(checkinSelection.location) || 0;
        const roundedDistance = Number.isFinite(distance) ? Math.round(Number(distance)) : null;

        setLocationStatus({ isViolation, violationDistance: roundedDistance });
        setCheckinSelection((prev) => ({ ...prev, mode }));
        setCameraState((prev) => ({ ...prev, isOpen: true }));
    };

    const isWithinLocation = (location) => {
        if (!currentLocation || !location) return false;

        const isWithinSelectedLocation = isPointWithinRadius(
            currentLocation.latitude,
            currentLocation.longitude,
            location.latitude,
            location.longitude,
            location.radius
        );

        if (isWithinSelectedLocation) return true;

        const isWithinDefaultLocation = attendanceLocations.defaults.some((defaultLoc) =>
            isPointWithinRadius(
                currentLocation.latitude,
                currentLocation.longitude,
                defaultLoc.latitude,
                defaultLoc.longitude,
                defaultLoc.radius || 70
            )
        );

        return isWithinDefaultLocation;
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
        setCheckinSelection((prev) => ({ ...prev, type }));
    };

    // Handle overtime request submission
    const handleSubmitOvertimeRequest = async (formData) => {
        setOvertimeSubmitting(true);
        try {
            const overtimePayload = {
                user_id: userDataInSystem?.id,
                department_id: userDataInSystem?.profile?.department_id,
                overtime_category: formData.overtime_category,
                priority: formData.priority,
                requested_date: formData.requested_date,
                start_time: formData.start_time,
                end_time: formData.end_time,
                reason: formData.reason,
                notes: formData.notes || null,
                work_id: null,
                status: "pending",
                is_paid: false,
            };

            const response = await submitOvertimeRequest(overtimePayload);

            if (response?.success || response?.data?.id) {
                setOvertimeModalVisible(false);
                toast?.success({
                    title: "Gửi yêu cầu thành công",
                    message: "Phiếu tăng ca của bạn đã được gửi đi",
                    duration: 3000,
                });
            } else {
                setOvertimeModalVisible(false);
                toast?.error({
                    title: "Gửi yêu cầu thất bại",
                    message: response?.message || "Không thể gửi phiếu tăng ca",
                    duration: 3000,
                });
            }
        } catch (error) {
            console.error("Error submitting overtime request:", error);
            toast?.error({
                title: "Lỗi gửi yêu cầu",
                message: error?.message || "Đã xảy ra lỗi khi gửi phiếu tăng ca",
                duration: 3000,
            });
        } finally {
            setOvertimeSubmitting(false);
        }
    };

    useEffect(() => {
        if (cameraState.isOpen && !cameraState.capturedPhoto) {
            startCamera();
        }
    }, [cameraState.isOpen, cameraState.capturedPhoto]);

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
        <Page className={`bg-gray-50 min-h-screen pb-20 relative ${submitting ? "pointer-events-none" : ""}`}>
            <CheckInHeader title={"Chấm công công việc"} />

            <Box className="p-4 pb-20">
                {!cameraState.isOpen ? (
                    <>
                        {/* Button Yêu cầu tăng ca */}
                        <Box className="mb-4">
                            <Button
                                onClick={() => setOvertimeModalVisible(true)}
                                fullWidth
                                className="px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-semibold transition-colors disabled:opacity-50"
                            >
                                Yêu cầu tăng ca
                            </Button>
                        </Box>

                        <CheckInTypeSelector
                            checkInTypes={checkInTypes}
                            selectedAttendanceType={checkinSelection.type}
                            onSelectType={handleCheckSelectType}
                        />

                        <Box className="space-y-4 mb-6">
                            {checkinSelection.type && (
                                <>
                                    <LocationStatus
                                        currentLocation={currentLocation}
                                        onGetLocation={handleGetLocation}
                                        isCheckingLocation={isCheckingLocation}
                                    />

                                    <LocationSelector
                                        currentLocation={currentLocation}
                                        checkInLocations={attendanceLocations.workAssignments}
                                        defaultLocations={attendanceLocations.defaults}
                                        selectedCheckInLocation={checkinSelection.location}
                                        onSelectLocation={(location) =>
                                            setCheckinSelection((prev) => ({ ...prev, location }))
                                        }
                                        isWithinLocation={isWithinLocation}
                                        getDistanceToLocation={getDistanceToLocation}
                                    />
                                </>
                            )}

                            <CheckInModeSelector
                                selectedCheckInLocation={checkinSelection.location}
                                currentLocation={currentLocation}
                                selectedAttendanceType={checkinSelection.type}
                                selectedAttendanceMode={checkinSelection.mode}
                                onSelectMode={handleSelectAttendaceMode}
                                canCheckOut={canCheckOut}
                            />
                        </Box>
                    </>
                ) : (
                    <>
                        <CameraView
                            capturedPhoto={cameraState.capturedPhoto}
                            videoRef={videoRef}
                            canvasRef={canvasRef}
                        />

                        <ActionButtons
                            capturedPhoto={cameraState.capturedPhoto}
                            onCapturePhoto={capturePhoto}
                            onSubmitCheckIn={handleSubmitAttendance}
                            onRetakePhoto={retakePhoto}
                            onCancel={() => {
                                setCameraState({ isOpen: false, capturedPhoto: null });
                                setCheckinSelection((prev) => ({ ...prev, mode: null }));
                            }}
                            submitting={submitting}
                        />

                        <PhotoInfo
                            capturedPhoto={cameraState.capturedPhoto}
                            selectedAttendanceMode={checkinSelection.mode}
                            currentLocation={currentLocation}
                            locationViolation={locationStatus.isViolation}
                            violationDistance={locationStatus.violationDistance}
                            notes={notes}
                            onNotesChange={setNotes}
                        />
                    </>
                )}

                {cameraState.isOpen ? null : <CheckInHistory todayAttendanceRecords={todayAttendanceRecords} />}
            </Box>

            <BottomNavigation />

            {submitting && (
                <Box className="absolute inset-0 bg-white bg-opacity-75 flex flex-col items-center justify-center z-50">
                    <Spinner logo="https://res.cloudinary.com/djiwsnmtq/image/upload/v1768034655/lqd_l8z0wh.jpg" />
                    <Text className="mt-4 text-gray-600 text-sm">Đang xử lý chấm công của bạn ...</Text>
                </Box>
            )}

            {isCheckingLocation && (
                <Box className="absolute inset-0 bg-white bg-opacity-75 flex flex-col items-center justify-center z-50">
                    <Spinner logo="https://res.cloudinary.com/djiwsnmtq/image/upload/v1768034655/lqd_l8z0wh.jpg" />
                    <Text className="mt-4 text-gray-600 text-sm">Đang xử lý vị trí của bạn ...</Text>
                </Box>
            )}

            {/* Overtime Request Modal */}
            <OvertimeRequestModal
                visible={overtimeModalVisible}
                onClose={() => setOvertimeModalVisible(false)}
                onSubmit={handleSubmitOvertimeRequest}
                loading={overtimeSubmitting}
            />
        </Page>
    );
}

export default CheckIn;
