import { Box, Text, Icon, Button, Page, Avatar } from "zmp-ui";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import BottomNavigation from "../components/BottomNavigation";
import { miniAppGetProfileInfoByID } from "../services/user.service";
import { clearTokens, getUserInfoInStorage } from "../config/axiosConfig";

function EmployeeProfile() {
    const navigate = useNavigate();
    const [userInfo, setUserInfo] = useState({
        name: "",
        employee_id: "",
        position: null,
        avatar_url: null,
        email: null,
        phone: null,
        zalo_id: "",
        profile: {
            departmentInfo: null,
            specialization: [],
            dailySalary: "0",
        },
        assignments: [],
        reports: [],
    });

    const [workLocation] = useState({
        name: "Kho Hàng - Lâm Quang Đại",
        address: "189A Đ. TX 25, Thạnh Xuân, Quận 12, Thành phố Hồ Chí Minh",
        coordinates: { lat: 10.87957, lng: 106.663325 },
    });

    const getUserInfoMiniApp = async () => {
        const userInfo = getUserInfoInStorage();

        const userInfoResp = await miniAppGetProfileInfoByID(userInfo.id);
        if (userInfoResp.success) {
            setUserInfo(userInfoResp.data);
        } else {
            clearTokens();
        }
    };

    useEffect(() => {
        getUserInfoMiniApp();
    }, []);

    return (
        <Page className="bg-gray-50 min-h-screen pb-20">
            {/* Enhanced Header */}
            <Box className="bg-gradient-to-r from-green-600 via-green-700 to-green-800 shadow-lg pb-6 relative overflow-hidden">
                {/* Background Effects */}
                <Box className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full -mr-24 -mt-24"></Box>
                <Box className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full -ml-16 -mb-16"></Box>

                <Box className="px-4 pt-10 mt-5 pb-10 relative z-10">
                    {/* Title */}
                    <Text.Title className="text-white font-bold" size="large">
                        Thông Tin Nhân Viên
                    </Text.Title>
                </Box>
            </Box>

            <Box className="p-4 pb-20">
                {/* User Profile Card */}
                <Box className="bg-white rounded-2xl shadow-md p-6 mb-4 border border-gray-100 -mt-12 relative z-10">
                    <Box className="flex items-center space-x-4 mb-4">
                        <Box className="rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center text-white text-3xl font-bold shadow-lg">
                            <Avatar
                                src={
                                    userInfo?.avatar_url ||
                                    "https://res.cloudinary.com/djiwsnmtq/image/upload/v1768035267/defaultUser_fldfhz.jpg"
                                }
                                size={64}
                                className="w-20 h-20 object-contain bg-white rounded-full shadow-lg"
                            >
                                {userInfo?.name.charAt(0)}
                            </Avatar>
                        </Box>
                        <Box className="flex-1">
                            <Text className="font-bold text-lg text-gray-900">{userInfo.name}</Text>
                            <Text className="text-xs text-gray-500 mt-1">Zalo ID: {userInfo.zalo_id}</Text>
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
                        <Icon icon="zi-info-circle" className="mr-2 text-green-600" size={16} />
                        Thông Tin Chi Tiết
                    </Text>

                    <Box className="space-y-3">
                        <Box className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                            <Text className="text-sm text-gray-600">Bộ phận:</Text>
                            <Text className="text-sm font-semibold text-gray-900">
                                {userInfo.profile?.departmentInfo?.name || "Chưa cập nhật"}
                            </Text>
                        </Box>
                        <Box className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                            <Text className="text-sm text-gray-600">Chức vụ:</Text>
                            <Text className="text-sm font-semibold text-gray-900">
                                {userInfo.position?.name || "Chưa cập nhật"}
                            </Text>
                        </Box>
                        <Box className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                            <Text className="text-sm text-gray-600">Điện thoại:</Text>
                            <Text className="text-sm font-semibold text-gray-900">
                                {userInfo.phone || userInfo.profile?.phone_secondary || "Chưa cập nhật"}
                            </Text>
                        </Box>
                    </Box>
                </Box>

                {/* Work Location */}
                {/* <Box className="bg-white rounded-xl shadow-sm p-4 mb-4 border border-gray-100">
          <Text className="font-bold text-gray-900 mb-3 flex items-center">
            <Icon icon="zi-location" className="mr-2 text-red-600" size={16} />
            Địa Điểm Chấm Công Mặc Định
          </Text>

          <Box className="p-4 bg-red-50 rounded-lg border border-red-200">
            <Text className="font-bold text-gray-900 mb-1">{workLocation.name}</Text>
            <Text className="text-xs text-gray-600 mb-3">{workLocation.address}</Text>
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
        </Box> */}

                <Box className="bg-white rounded-xl shadow-sm p-4 mb-4 border border-gray-100">
                    <Text className="font-bold text-gray-900 mb-3 flex items-center">
                        <Icon icon="zi-share-external-2" className="mr-2 text-green-600" size={16} />
                        Lịch sử chấm công
                    </Text>

                    <Box className="text-center">
                        <Text className="text-sm text-gray-600 mb-3">Truy cập danh sách chấm công cá nhân</Text>
                        <Button
                            variant="primary"
                            onClick={() => navigate("/attendance-history")}
                            className="w-full bg-green-600 hover:bg-green-700 text-white rounded-lg py-3 font-semibold"
                        >
                            <Icon icon="zi-list-1" className="mr-2" size={16} />
                            Xem Danh Sách Chấm Công
                        </Button>
                    </Box>
                </Box>

                {/* Work Reports Section */}
                <Box className="bg-white rounded-xl shadow-sm p-4 mb-4 border border-gray-100">
                    <Text className="font-bold text-gray-900 mb-3 flex items-center">
                        <Icon icon="zi-share-external-2" className="mr-2 text-green-600" size={16} />
                        Lịch sử tăng ca
                    </Text>

                    <Box className="text-center">
                        <Text className="text-sm text-gray-600 mb-3">Truy cập danh sách tăng ca công việc cá nhân</Text>
                        <Button
                            variant="primary"
                            onClick={() => navigate("/work-reports")}
                            className="w-full bg-green-600 hover:bg-green-700 text-white rounded-lg py-3 font-semibold"
                        >
                            <Icon icon="zi-list-1" className="mr-2" size={16} />
                            Xem Danh Sách Tăng Ca
                        </Button>
                    </Box>
                </Box>
            </Box>

            <BottomNavigation />
        </Page>
    );
}

export default EmployeeProfile;
