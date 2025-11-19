import { Box, Text, Icon, Button, Page, useNavigate } from "zmp-ui";
import { useState, useEffect } from "react";
import { getUserInfo } from "zmp-sdk/apis";
import { AppError } from "zmp-sdk";
import BottomNavigation from "../components/BottomNavigation";

function EmployeeProfile() {
    const [userInfo, setUserInfo] = useState({
        name: "Nguyễn Lê Tấn Đạt",
        employeeId: "KTV-2024-001",
        position: "Kỹ Thuật Viên",
        department: "Bộ Phận Dịch Vụ Kỹ Thuật",
        avatar: null,
        email: "tan.dat@lamquangdai.vn",
        phone: "0977708819",
        specialization: "Điều hòa & Hệ thống điện",
    });

    const navigate = useNavigate();

    const [checkInTypes] = useState([
        {
            id: "regular",
            name: "Chấm Công Thường",
            time: "08:00 - 17:00",
        },
        {
            id: "overtime_after",
            name: "Tăng Ca Chiều",
            time: "17:00 - 20:00",
        },
        {
            id: "overtime_lunch",
            name: "Tăng Ca Trưa",
            time: "11:30 - 13:00",
        },
    ]);

    const [workLocation] = useState({
        name: "Kho Hàng - Lâm Quang Đại",
        address: "Kho hàng - TP.HCM",
        coordinates: { lat: 10.7769, lng: 106.7009 }, // Will be updated
    });

    const [attendanceList, setAttendanceList] = useState([
        {
            id: 1,
            date: "17/11/2025",
            checkInTime: "07:55",
            checkOutTime: "17:30",
            workingHours: 9.58,
            status: "Đúng giờ",
            type: "Chấm công thường",
            serviceType: "Bảo trì điều hòa",
        },
        {
            id: 2,
            date: "16/11/2025",
            checkInTime: "08:05",
            checkOutTime: "20:15",
            workingHours: 12.17,
            status: "Tăng ca",
            type: "Tăng ca chiều",
            serviceType: "Sửa chữa hệ thống điện",
        },
        {
            id: 3,
            date: "15/11/2025",
            checkInTime: "07:50",
            checkOutTime: "17:20",
            workingHours: 9.5,
            status: "Đúng giờ",
            type: "Chấm công thường",
            serviceType: "Lắp đặt điều hòa",
        },
        {
            id: 4,
            date: "14/11/2025",
            checkInTime: "11:25",
            checkOutTime: "13:15",
            workingHours: 1.83,
            status: "Tăng ca",
            type: "Tăng ca trưa",
            serviceType: "Kiểm tra thiết bị",
        },
        {
            id: 5,
            date: "13/11/2025",
            checkInTime: "08:00",
            checkOutTime: "17:15",
            workingHours: 9.25,
            status: "Đúng giờ",
            type: "Chấm công thường",
            serviceType: "Bảo trì định kỳ",
        },
    ]);

    const getUserInfoMiniApp = async () => {
        try {
            const { userInfo } = await getUserInfo({
                autoRequestPermission: true,
            });

            if (userInfo) {
                setUserInfo((prev) => ({
                    ...prev,
                    name: userInfo.name || prev.name,
                    employeeId: userInfo.idByOA || prev.employeeId,
                    avatar: userInfo.avatar || null,
                }));
            }
        } catch (error) {
            if (error instanceof AppError) {
                console.error("Error getting user info:", error);
            }
        }
    };

    useEffect(() => {
        getUserInfoMiniApp();
    }, []);

    const getStatusColor = (status) => {
        if (status.includes("Đúng giờ")) {
            return "bg-green-100 text-green-800 border-green-200";
        } else if (status.includes("Tăng ca")) {
            return "bg-orange-100 text-orange-800 border-orange-200";
        }
        return "bg-gray-100 text-gray-800 border-gray-200";
    };

    const totalWorkingHours = attendanceList.reduce((sum, item) => sum + item.workingHours, 0);
    const averageWorkingHours = (totalWorkingHours / attendanceList.length).toFixed(2);
    const overtimeCount = attendanceList.filter((a) => a.status.includes("Tăng ca")).length;

    return (
        <Page className="bg-gray-50 min-h-screen pb-20">
            {/* Enhanced Header */}
            <Box className="bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 shadow-lg pb-6 relative overflow-hidden">
                {/* Background Effects */}
                <Box className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full -mr-24 -mt-24"></Box>
                <Box className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full -ml-16 -mb-16"></Box>

                <Box className="px-4 pt-10 mt-5 pb-10 relative z-10">
                    {/* Title */}
                    <Text.Title className="text-white font-bold" size="large">
                        Thông Tin Kỹ Thuật Viên
                    </Text.Title>
                </Box>
            </Box>

            <Box className="p-4 pb-20">
                {/* User Profile Card */}
                <Box className="bg-white rounded-2xl shadow-md p-6 mb-4 border border-gray-100 -mt-12 relative z-10">
                    <Box className="flex items-center space-x-4 mb-4">
                        <Box className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-3xl font-bold shadow-lg">
                            {userInfo.avatar ? (
                                <img
                                    src={userInfo.avatar}
                                    alt={userInfo.name}
                                    className="w-full h-full rounded-full object-cover"
                                />
                            ) : (
                                userInfo.name.charAt(0)
                            )}
                        </Box>
                        <Box className="flex-1">
                            <Text className="font-bold text-lg text-gray-900">{userInfo.name}</Text>
                            <Text className="text-sm text-blue-600 font-semibold">{userInfo.position}</Text>
                            <Text className="text-xs text-gray-500 mt-1">ID: {userInfo.employeeId}</Text>
                        </Box>
                    </Box>

                    {/* Online Status */}
                    <Box className="flex items-center space-x-2 pt-4 border-t border-gray-200">
                        <Box className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></Box>
                        <Text className="text-sm text-gray-600">Trực tuyến</Text>
                    </Box>
                </Box>

                {/* Employee Details */}
                <Box className="bg-white rounded-xl shadow-sm p-4 mb-4 border border-gray-100">
                    <Text className="font-bold text-gray-900 mb-3 flex items-center">
                        <Icon icon="zi-info-circle" className="mr-2 text-blue-600" size={16} />
                        Thông Tin Chi Tiết
                    </Text>

                    <Box className="space-y-3">
                        <Box className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                            <Text className="text-sm text-gray-600">Bộ phận:</Text>
                            <Text className="text-sm font-semibold text-gray-900">{userInfo.department}</Text>
                        </Box>
                        <Box className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                            <Text className="text-sm text-gray-600">Chuyên môn:</Text>
                            <Text className="text-sm font-semibold text-gray-900">{userInfo.specialization}</Text>
                        </Box>
                        <Box className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                            <Text className="text-sm text-gray-600">Email:</Text>
                            <Text className="text-sm font-semibold text-gray-900">{userInfo.email}</Text>
                        </Box>
                        <Box className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                            <Text className="text-sm text-gray-600">Điện thoại:</Text>
                            <Text className="text-sm font-semibold text-gray-900">{userInfo.phone}</Text>
                        </Box>
                    </Box>
                </Box>

                {/* Check-in Types */}
                <Box className="bg-white rounded-xl shadow-sm p-4 mb-4 border border-gray-100">
                    <Text className="font-bold text-gray-900 mb-3 flex items-center">
                        <Icon icon="zi-post" className="mr-2 text-blue-600" size={16} />
                        Loại Chấm Công
                    </Text>

                    <Box className="space-y-3">
                        {checkInTypes.map((type) => (
                            <Box
                                key={type.id}
                                onClick={() => navigate("/checkin")}
                                className="p-4 bg-gradient-to-r from-gray-50 to-white rounded-lg border-2 border-gray-200 hover:border-blue-300 transition-all cursor-pointer"
                            >
                                <Box className="flex items-center justify-between">
                                    <Box className="flex items-center space-x-3">
                                        <Box>
                                            <Text className="font-bold text-gray-900">{type.name}</Text>
                                            <Text className="text-sm text-gray-600">{type.time}</Text>
                                        </Box>
                                    </Box>
                                    <Icon icon="zi-arrow-right" className="text-gray-400" size={16} />
                                </Box>
                            </Box>
                        ))}
                    </Box>
                </Box>

                {/* Work Location */}
                <Box className="bg-white rounded-xl shadow-sm p-4 mb-4 border border-gray-100">
                    <Text className="font-bold text-gray-900 mb-3 flex items-center">
                        <Icon icon="zi-location" className="mr-2 text-red-600" size={16} />
                        Địa Điểm Chấm Công Mặc Định
                    </Text>

                    <Box className="p-4 bg-red-50 rounded-lg border border-red-200">
                        <Text className="font-bold text-gray-900 mb-1">{workLocation.name}</Text>
                        <Text className="text-xs text-gray-600 mb-3">{workLocation.address}</Text>
                        <Text className="text-xs text-red-600 mb-3 flex items-center">
                            <Icon icon="zi-info-circle" className="mr-1" size={12} />
                            Tọa độ sẽ được cập nhật
                        </Text>
                        <Button
                            size="small"
                            className="w-full bg-red-600 hover:bg-red-700 text-white rounded-lg"
                            onClick={() => {
                                const { lat, lng } = workLocation.coordinates;
                                const mapsUrl = `https://maps.google.com/?q=${lat},${lng}`;
                                window.open(mapsUrl, "_blank");
                            }}
                        >
                            <Icon icon="zi-location" className="mr-1" size={14} />
                            Xem Bản Đồ
                        </Button>
                    </Box>
                </Box>

                {/* Attendance Statistics */}
                <Box className="bg-white rounded-xl shadow-sm p-4 mb-4 border border-gray-100">
                    <Text className="font-bold text-gray-900 mb-3 flex items-center">
                        <Icon icon="zi-calendar" className="mr-2 text-blue-600" size={16} />
                        Thống Kê Chấm Công
                    </Text>

                    <Box className="grid grid-cols-2 gap-3 mb-3">
                        <Box className="bg-blue-50 rounded-lg p-3 border border-blue-200 text-center">
                            <Text className="text-2xl font-bold text-blue-600">{attendanceList.length}</Text>
                            <Text className="text-xs text-gray-600 mt-1">Tổng ngày làm</Text>
                        </Box>
                        <Box className="bg-orange-50 rounded-lg p-3 border border-orange-200 text-center">
                            <Text className="text-2xl font-bold text-orange-600">{overtimeCount}</Text>
                            <Text className="text-xs text-gray-600 mt-1">Ngày tăng ca</Text>
                        </Box>
                    </Box>

                    <Box className="grid grid-cols-2 gap-3">
                        <Box className="bg-green-50 rounded-lg p-3 border border-green-200 text-center">
                            <Text className="text-2xl font-bold text-green-600">{averageWorkingHours}</Text>
                            <Text className="text-xs text-gray-600 mt-1">Giờ/ngày TB</Text>
                        </Box>
                        <Box className="bg-purple-50 rounded-lg p-3 border border-purple-200 text-center">
                            <Text className="text-2xl font-bold text-purple-600">{totalWorkingHours.toFixed(1)}</Text>
                            <Text className="text-xs text-gray-600 mt-1">Tổng giờ làm</Text>
                        </Box>
                    </Box>
                </Box>

                {/* Attendance List */}
                <Box className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <Box className="p-4 border-b border-gray-200 bg-gray-50">
                        <Text className="font-bold text-gray-900 flex items-center">
                            <Icon icon="zi-list-1" className="mr-2 text-blue-600" size={16} />
                            Lịch Sử Chấm Công Gần Đây
                        </Text>
                    </Box>

                    <Box className="divide-y divide-gray-200">
                        {attendanceList.map((record) => (
                            <Box key={record.id} className="p-4 hover:bg-gray-50 transition-colors">
                                <Box className="flex justify-between items-start mb-2">
                                    <Box className="flex-1">
                                        <Text className="font-semibold text-gray-900">{record.date}</Text>
                                        <Text className="text-sm text-gray-600 mt-1">
                                            {record.checkInTime} - {record.checkOutTime}
                                        </Text>
                                        <Text className="text-xs text-gray-500 mt-1">{record.serviceType}</Text>
                                    </Box>
                                    <Box
                                        className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(
                                            record.status
                                        )}`}
                                    >
                                        {record.status}
                                    </Box>
                                </Box>

                                <Box className="flex justify-between items-center mt-3 pt-3 border-t border-gray-100">
                                    <Box className="flex items-center space-x-2">
                                        <Icon icon="zi-clock-1" className="text-gray-400" size={14} />
                                        <Text className="text-sm text-gray-600">
                                            Giờ làm:{" "}
                                            <span className="font-semibold">{record.workingHours.toFixed(2)}h</span>
                                        </Text>
                                    </Box>
                                    <Box className="flex items-center space-x-1 px-2 py-1 bg-blue-50 rounded">
                                        <Icon icon="zi-post" className="text-blue-600" size={12} />
                                        <Text className="text-xs text-blue-600 font-medium">{record.type}</Text>
                                    </Box>
                                </Box>
                            </Box>
                        ))}
                    </Box>
                </Box>

                {/* View More Button */}
                <Box className="mt-4">
                    <Button
                        size="large"
                        variant="tertiary"
                        fullWidth
                        className="rounded-xl border-2 border-gray-300 hover:bg-gray-100"
                    >
                        <Icon icon="zi-more" className="mr-1" size={16} />
                        Xem Lịch Sử Đầy Đủ
                    </Button>
                </Box>
            </Box>

            <BottomNavigation />
        </Page>
    );
}

export default EmployeeProfile;
