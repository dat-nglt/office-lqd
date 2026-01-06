import { Box, Text, Icon } from "zmp-ui";
import { useMemo } from "react";
import { useLocation } from "react-router-dom";
import { useRouter } from "../hooks/useRouter";

function BottomNavigation() {
  const location = useLocation();
  const {
    goHome,
    goToWorkList,
    goToCheckIn,
    goToWorkManagement,
    goToProfile
  } = useRouter();

  const tabs = useMemo(
    () => [
      {
        id: "report",
        label: "Theo dõi",
        icon: "zi-share-external-1",
        path: "/",
        badge: null,
      },
      {
        id: "list",
        label: "Công Việc",
        icon: "zi-list-1",
        path: "/worklist",
        badge: null,
      },
      {
        id: "management",
        label: "Chấm Công",
        icon: "zi-camera",
        path: "/checkin",
        badge: null,
      },
      {
        id: "notifications",
        label: "Quản Lý",
        icon: "zi-setting",
        path: "/work-management",
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
    } else if (currentPath === "/checkin") {
      return "management";
    } else if (currentPath === "/work-management") {
      return "notifications";
    } else if (currentPath === "/profile") {
      return "profile";
    }
    return "report";
  };

  const activeTab = getCurrentActiveTab();

  const handleTabClick = (tab) => {
    switch (tab.id) {
      case 'report':
        goHome();
        break;
      case 'list':
        goToWorkList();
        break;
      case 'management':
        goToCheckIn();
        break;
      case 'notifications':
        goToWorkManagement();
        break;
      case 'profile':
        goToProfile();
        break;
      default:
        goHome();
    }
  };

  return (
    <Box className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 safe-area-bottom shadow-lg">
      <Box className="flex px-2 py-2">
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
                className="flex flex-col items-center justify-center py-2 px-1 cursor-pointer transition-all duration-200 relative"
                onClick={() => handleTabClick(tab)}
              >
                {/* Icon Container */}
                <Box className="relative mb-1">
                  <Icon
                    icon={tab.icon}
                    className={`transition-colors duration-200 ${
                      isActive ? "text-blue-600" : "text-gray-500"
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
                    isActive ? "text-blue-600" : "text-gray-600"
                  }`}
                >
                  {tab.label}
                </Text>

                {/* Active Indicator Line */}
                {isActive && (
                  <Box
                    className="absolute bottom-0 w-12 h-0.5 bg-blue-600 rounded-full"
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
