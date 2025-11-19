import { Box, Text, Icon } from "zmp-ui";
import { useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";

function BottomNavigation() {
    const navigate = useNavigate();
    const location = useLocation();

    const tabs = useMemo(
        () => [
            {
                id: "report",
                label: "Trang Chủ",
                icon: "zi-home",
                path: "/report",
                badge: null,
            },
            {
                id: "list",
                label: "Danh sách",
                icon: "zi-list-1",
                path: "/worklist",
                badge: null,
            },
            {
                id: "management",
                label: "Quản Lý",
                icon: "zi-setting",
                path: "/work-management",
                badge: null,
            },
            {
                id: "notifications",
                label: "Thông Báo",
                icon: "zi-notif",
                path: "/notifications",
                badge: 2,
            },
            {
                id: "profile",
                label: "Hồ Sơ",
                icon: "zi-user",
                path: "/profile",
                badge: null,
            },
        ],
        []
    );

    const getCurrentActiveTab = () => {
        const currentPath = location.pathname;
        if (currentPath === "/" || currentPath === "/report") {
            return "report";
        } else if (currentPath === "/worklist") {
            return "list";
        } else if (currentPath === "/work-management") {
            return "management";
        } else if (currentPath === "/notifications") {
            return "notifications";
        } else if (currentPath === "/profile") {
            return "profile";
        }
        return "report";
    };

    const activeTab = getCurrentActiveTab();

    const handleTabClick = (tab) => {
        navigate(tab.path);
    };

    return (
        <Box className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 safe-area-bottom shadow-lg">
            <Box className="flex px-1 py-2">
                {tabs.map((tab) => {
                    const isActive = activeTab === tab.id;

                    return (
                        <Box
                            key={tab.id}
                            className="flex-1 flex justify-center"
                            role="button"
                            aria-label={`Chuyển đến tab ${tab.label}`}
                            aria-selected={isActive}
                        >
                            <Box
                                className={`flex flex-col items-center justify-center py-2.5 px-2 cursor-pointer transition-all duration-200 relative rounded-lg ${
                                    isActive ? "bg-green-50" : "hover:bg-gray-50"
                                }`}
                                onClick={() => handleTabClick(tab)}
                            >
                                {/* Icon Container */}
                                <Box className="relative mb-1">
                                    <Icon
                                        icon={tab.icon}
                                        className={`transition-colors duration-200 ${
                                            isActive ? "text-green-600" : "text-gray-500 hover:text-gray-700"
                                        }`}
                                        size={24}
                                    />

                                    {/* Badge */}
                                    {tab.badge && tab.badge > 0 && (
                                        <Box
                                            className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-xs font-bold border-2 border-white shadow-md"
                                            aria-label={`${tab.badge} thông báo chưa đọc`}
                                        >
                                            {tab.badge > 9 ? "9+" : tab.badge}
                                        </Box>
                                    )}
                                </Box>

                                {/* Label */}
                                <Text
                                    className={`text-xs font-semibold transition-colors duration-200 whitespace-nowrap ${
                                        isActive ? "text-green-600" : "text-gray-600"
                                    }`}
                                >
                                    {tab.label}
                                </Text>

                                {/* Active Indicator Line */}
                                {isActive && (
                                    <Box
                                        className="absolute bottom-0 w-8 h-1 bg-green-600 rounded-t-full"
                                        aria-hidden="true"
                                    />
                                )}
                            </Box>
                        </Box>
                    );
                })}
            </Box>
        </Box>
    );
}

export default BottomNavigation;
