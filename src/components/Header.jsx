import { Box, Text, Icon, Avatar } from "zmp-ui";
import { useEffect, useState } from "react";
import { getUserInfo } from "zmp-sdk/apis";
import { AppError } from "zmp-sdk";
import { useNavigate } from "react-router-dom";

function Header({ title, showBack = false, onBack }) {
    const navigate = useNavigate();
    const [userInfo, setUserInfo] = useState({
        name: "Nguyễn Lê Tấn Đạt",
        employeeId: "KTV-2024-001",
        position: "Kỹ Thuật Viên",
        avatar: null,
    });

    const [currentTime, setCurrentTime] = useState(new Date());

    const getUserInfoMiniApp = async () => {
        try {
            const { userInfo } = await getUserInfo({
                autoRequestPermission: true,
            });

            if (userInfo) {
                setUserInfo({
                    name: userInfo.name || "Nguyễn Lê Tấn Đạt",
                    employeeId: userInfo.idByOA || "Không xác định",
                    position: "Kỹ Thuật Viên",
                    avatar: userInfo.avatar || null,
                });
            }
        } catch (error) {
            if (error instanceof AppError) {
                if (error.code === -1401) {
                    console.error("User denied permission to access user info.");
                }
            }
        }
    };

    useEffect(() => {
        getUserInfoMiniApp();

        // Update time every minute
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 60000);

        return () => clearInterval(timer);
    }, []);

    return (
        <Box className="bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 dark:from-gray-800 dark:via-gray-900 dark:to-gray-950 rounded-b-3xl shadow-xl pb-6 relative overflow-hidden">
            {/* Background Effects */}
            <Box className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32"></Box>
            <Box className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full -ml-24 -mb-24"></Box>
            <Box className="absolute top-1/2 left-1/4 w-32 h-32 bg-blue-400/10 rounded-full -translate-y-1/2"></Box>

            <Box className="px-4 pt-12 pb-2 relative z-10">
                {/* Header Controls */}
                <Box className="flex items-center justify-between mb-6">
                    <Box className="flex items-center space-x-3">
                        {showBack && (
                            <Box
                                className="bg-white/10 backdrop-blur-md p-2 rounded-xl cursor-pointer hover:bg-white/20 transition-all duration-200 border border-white/20"
                                onClick={onBack}
                            >
                                <Icon icon="zi-chevron-left" className="text-white" />
                            </Box>
                        )}
                        <Text.Title className="text-white font-bold" size="large">
                            {title}
                        </Text.Title>
                    </Box>

                    <Box className="flex items-center space-x-2">
                        {/* Notification Bell */}
                        <Box
                            className="bg-white/10 backdrop-blur-md p-2 rounded-xl hover:bg-white/20 transition-all duration-200 cursor-pointer relative border border-white/20"
                            onClick={() => navigate("/notifications")}
                        >
                            <Icon icon="zi-notif" className="text-white" size={20} />
                            <Box className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full shadow-lg"></Box>
                        </Box>
                    </Box>
                </Box>

                {/* User Info Section */}
                <Box className="flex items-center justify-between mb-6">
                    <Box className="flex items-center space-x-4">
                        <Avatar
                            src={userInfo.avatar}
                            size={64}
                            className="w-16 h-16 object-contain bg-white rounded-full shadow-lg"
                        >
                            {userInfo.name.charAt(0)}
                        </Avatar>
                        <Box>
                            <Text.Title size="large" className="text-white mb-0.5 font-bold">
                                {userInfo.name}
                            </Text.Title>
                            <Text size="small" className="text-blue-100">
                                {userInfo.position}
                            </Text>
                        </Box>
                    </Box>

                    {/* Check-in Quick Button */}
                    <Box
                        className="bg-white/20 backdrop-blur-md px-4 py-2 rounded-xl hover:bg-white/30 transition-all duration-200 cursor-pointer border border-white/30 shadow-lg flex items-center space-x-2 hover:scale-105 transform relative"
                        onClick={() => navigate("/notifications")}
                        title="Thông báo hệ thống"
                    >
                        <Icon icon="zi-notif" className="text-white" size={25} />
                        <Box className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full shadow-lg"></Box>
                    </Box>
                </Box>

                {/* Status Overview Card */}
                <Box className="bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/20 shadow-lg">
                    <Box className="flex justify-between items-start mb-4">
                        <Box>
                            <Text size="small" className="text-blue-100">
                                Trạng thái hôm nay - {currentTime.toLocaleDateString("vi-VN")}
                            </Text>
                        </Box>
                        <Text size="small" className="text-blue-100 font-semibold">
                            {currentTime.toLocaleTimeString("vi-VN", {
                                hour: "2-digit",
                                minute: "2-digit",
                            })}
                        </Text>
                    </Box>

                    {/* Status Message */}
                    <Box className="flex items-center space-x-3 bg-white/5 rounded-xl p-2 border border-white/10">
                        <Box className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></Box>
                        <Text size="small" className="text-blue-100 flex-1">
                            Sẵn sàng thực hiện công việc
                        </Text>
                    </Box>
                </Box>
            </Box>
        </Box>
    );
}

export default Header;
