import { Box, Text, Icon, Page } from "zmp-ui";
import { useState } from "react";
import BottomNavigation from "../components/BottomNavigation";

function Notifications() {
    const [notificationTypes] = useState([
        { id: "assignment", label: "Phân bổ công việc", icon: "zi-list-1", color: "bg-blue-100 text-blue-700 border-blue-300" },
        { id: "change", label: "Thay đổi công việc", icon: "zi-edit", color: "bg-orange-100 text-orange-700 border-orange-300" },
        { id: "checkin", label: "Đến giờ chấm công", icon: "zi-post", color: "bg-green-100 text-green-700 border-green-300" },
        { id: "report", label: "Đến giờ báo cáo", icon: "zi-send", color: "bg-purple-100 text-purple-700 border-purple-300" },
        { id: "announcement", label: "Thông báo chung", icon: "zi-info-circle", color: "bg-gray-100 text-gray-700 border-gray-300" },
    ]);

    const [notifications, setNotifications] = useState([
        {
            id: 1,
            type: "assignment",
            title: "Phân bổ công việc mới",
            content:
                "Bạn được phân bổ công việc: Bảo trì điều hòa tại NEXUS HOUSE. Thời gian dự kiến: 08:00 - 12:00. Hãy chuẩn bị đầy đủ dụng cụ.",
            date: "17/11/2025",
            time: "07:30",
            priority: "Cao",
            read: false,
            serviceType: "Bảo trì",
            location: "NEXUS HOUSE - Quận 2",
        },
        {
            id: 2,
            type: "checkin",
            title: "Đến giờ chấm công",
            content:
                "Nhắc nhở: Bạn cần chấm công vào lúc 08:00. Vui lòng thực hiện chấm công tại kho hàng hoặc địa điểm công trình.",
            date: "17/11/2025",
            time: "07:45",
            priority: "Cao",
            read: false,
            checkInTime: "08:00",
        },
        {
            id: 3,
            type: "change",
            title: "Thay đổi lịch công việc",
            content:
                "Công việc sửa chữa hệ thống điện tại VINHOMES được dời từ 14:00 sang 15:30. Vui lòng cập nhật lịch trình của bạn.",
            date: "17/11/2025",
            time: "06:15",
            priority: "Trung bình",
            read: true,
            serviceType: "Sửa chữa",
            oldTime: "14:00",
            newTime: "15:30",
        },
        {
            id: 4,
            type: "report",
            title: "Đến giờ báo cáo tiến độ",
            content:
                "Nhắc nhở: Bạn cần báo cáo tiến độ công việc trước 18:00 hôm nay. Vui lòng truy cập ứng dụng để gửi báo cáo.",
            date: "16/11/2025",
            time: "17:00",
            priority: "Cao",
            read: true,
            deadline: "18:00",
        },
        {
            id: 5,
            type: "announcement",
            title: "Cập nhật quy trình bảo an toàn",
            content:
                "Tất cả kỹ thuật viên khi đi công tác phải mang theo bộ đồ bảo hộ. Vi phạm sẽ bị phạt theo quy định của công ty.",
            date: "16/11/2025",
            time: "09:00",
            priority: "Cao",
            read: true,
        },
        {
            id: 6,
            type: "assignment",
            title: "Phân bổ công việc - Lắp đặt điều hòa",
            content:
                "Bạn được phân bổ công việc mới: Lắp đặt điều hòa tại MASTERI. Đây là công việc ưu tiên cao. Thời gian bắt đầu: 09:00.",
            date: "15/11/2025",
            time: "14:30",
            priority: "Cao",
            read: true,
            serviceType: "Lắp đặt",
            location: "MASTERI - Thủ Đức",
        },
    ]);

    const [selectedType, setSelectedType] = useState(null);

    const handleMarkAsRead = (id) => {
        setNotifications(notifications.map((notif) => (notif.id === id ? { ...notif, read: true } : notif)));
    };

    const handleMarkAllAsRead = () => {
        setNotifications(notifications.map((notif) => ({ ...notif, read: true })));
    };

    const handleDelete = (id) => {
        setNotifications(notifications.filter((notif) => notif.id !== id));
    };

    const getPriorityColor = (priority) => {
        switch (priority) {
            case "Cao":
                return "bg-red-100 text-red-700 border-red-300";
            case "Trung bình":
                return "bg-yellow-100 text-yellow-700 border-yellow-300";
            case "Thấp":
                return "bg-green-100 text-green-700 border-green-300";
            default:
                return "bg-gray-100 text-gray-700 border-gray-300";
        }
    };

    const getNotificationTypeInfo = (type) => {
        return notificationTypes.find((t) => t.id === type);
    };

    const filteredNotifications = selectedType
        ? notifications.filter((n) => n.type === selectedType)
        : notifications;

    const unreadCount = notifications.filter((n) => !n.read).length;

    return (
        <Page className="bg-gray-50 min-h-screen pb-20">
            {/* Enhanced Header */}
            <Box className="bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 shadow-lg pb-4 relative overflow-hidden">
                <Box className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full -mr-24 -mt-24"></Box>
                <Box className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full -ml-16 -mb-16"></Box>

                <Box className="px-4 pt-10 mt-5 pb-2 relative z-10">
                    <Box className="flex items-center justify-between mb-3">
                        <Text.Title className="text-white font-bold" size="large">
                            Thông Báo
                        </Text.Title>
                    </Box>

                    {/* Stats Bar */}
                    <Box className="flex gap-2">
                        <Box className="flex-1 bg-white/15 rounded-lg px-3 py-2 text-center border border-white/20">
                            <Text className="text-white font-bold text-sm">{notifications.length}</Text>
                            <Text className="text-blue-100 text-xs">Tổng</Text>
                        </Box>
                        <Box className="flex-1 bg-white/15 rounded-lg px-3 py-2 text-center border border-white/20">
                            <Text className="text-white font-bold text-sm">{unreadCount}</Text>
                            <Text className="text-blue-100 text-xs">Mới</Text>
                        </Box>
                        <Box className="flex-1 bg-white/15 rounded-lg px-3 py-2 text-center border border-white/20">
                            <Text className="text-white font-bold text-sm">
                                {notifications.filter((n) => n.priority === "Cao").length}
                            </Text>
                            <Text className="text-blue-100 text-xs">Ưu tiên</Text>
                        </Box>
                    </Box>
                </Box>
            </Box>

            <Box className="px-4 py-4 pb-20">
                {/* Action Bar */}
                {unreadCount > 0 && (
                    <Box className="flex justify-between items-center mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                        <Text className="text-sm text-blue-700 font-semibold">{unreadCount} thông báo chưa đọc</Text>
                        <button
                            onClick={handleMarkAllAsRead}
                            className="text-blue-600 hover:text-blue-800 text-xs font-bold"
                        >
                            Đánh dấu tất cả
                        </button>
                    </Box>
                )}

                {/* Type Filter */}
                <Box className="mb-4">
                    <Text className="font-semibold text-gray-800 mb-2 text-sm">Loại thông báo:</Text>
                    <Box className="flex gap-2 overflow-x-auto pb-2">
                        <button
                            onClick={() => setSelectedType(null)}
                            className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap border transition-all ${
                                selectedType === null
                                    ? "bg-blue-600 text-white border-blue-600"
                                    : "bg-white text-gray-700 border-gray-300 hover:border-blue-300"
                            }`}
                        >
                            Tất cả
                        </button>
                        {notificationTypes.map((type) => (
                            <button
                                key={type.id}
                                onClick={() => setSelectedType(type.id)}
                                className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap border transition-all flex items-center gap-1 ${
                                    selectedType === type.id
                                        ? `${type.color} bg-opacity-20 border-2`
                                        : "bg-white text-gray-700 border-gray-300 hover:border-blue-300"
                                }`}
                            >
                                <Icon icon={type.icon} size={12} />
                                {type.label}
                            </button>
                        ))}
                    </Box>
                </Box>

                {/* Notifications List */}
                <Box className="space-y-2">
                    {filteredNotifications.length > 0 ? (
                        filteredNotifications.map((notif) => {
                            const typeInfo = getNotificationTypeInfo(notif.type);
                            return (
                                <Box
                                    key={notif.id}
                                    className={`rounded-lg p-4 border transition-all ${
                                        notif.read
                                            ? "bg-white border-gray-200 hover:border-blue-300"
                                            : "bg-blue-50 border-blue-300 shadow-sm"
                                    }`}
                                >
                                    {/* Header Row */}
                                    <Box className="flex items-start justify-between gap-2 mb-2">
                                        <Box className="flex-1 min-w-0">
                                            <Box className="flex items-center gap-2">
                                                {!notif.read && (
                                                    <Box className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0 mt-1"></Box>
                                                )}
                                                <Box
                                                    className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-xs ${typeInfo?.color}`}
                                                >
                                                    <Icon icon={typeInfo?.icon} size={14} />
                                                </Box>
                                                <Text className="font-semibold text-gray-900 line-clamp-2">
                                                    {notif.title}
                                                </Text>
                                            </Box>
                                        </Box>
                                    </Box>

                                    {/* Meta Info */}
                                    <Box className="flex items-center gap-2 mb-2 ml-8">
                                        <Box
                                            className={`text-xs font-semibold px-2 py-0.5 rounded border ${getPriorityColor(
                                                notif.priority
                                            )}`}
                                        >
                                            {notif.priority}
                                        </Box>
                                        <Text className="text-xs text-gray-500">
                                            {notif.date} • {notif.time}
                                        </Text>
                                    </Box>

                                    {/* Content */}
                                    <Text className="text-sm text-gray-700 mb-3 leading-relaxed line-clamp-3 ml-8">
                                        {notif.content}
                                    </Text>

                                    {/* Notification-specific info */}
                                    <Box className="ml-8 mb-3">
                                        {notif.type === "assignment" && (
                                            <Box className="bg-gradient-to-r from-blue-50 to-blue-100 p-3 rounded-lg border border-blue-200 text-sm">
                                                <Text className="text-xs text-gray-600 font-semibold mb-1">Thông tin công việc:</Text>
                                                <Text className="text-xs text-gray-700">
                                                    <span className="font-semibold">Loại:</span> {notif.serviceType}
                                                </Text>
                                                <Text className="text-xs text-gray-700">
                                                    <span className="font-semibold">Địa điểm:</span> {notif.location}
                                                </Text>
                                            </Box>
                                        )}
                                        {notif.type === "change" && (
                                            <Box className="bg-gradient-to-r from-orange-50 to-orange-100 p-3 rounded-lg border border-orange-200 text-sm">
                                                <Text className="text-xs text-gray-600 font-semibold mb-1">Thay đổi thời gian:</Text>
                                                <Text className="text-xs text-gray-700">
                                                    <span className="line-through">{notif.oldTime}</span>
                                                    <span className="ml-2 text-green-700 font-bold">→ {notif.newTime}</span>
                                                </Text>
                                            </Box>
                                        )}
                                        {notif.type === "checkin" && (
                                            <Box className="bg-gradient-to-r from-green-50 to-green-100 p-3 rounded-lg border border-green-200 text-sm">
                                                <Text className="text-xs text-gray-600 font-semibold mb-1">Thời gian chấm công:</Text>
                                                <Text className="text-xs text-gray-700 font-semibold">{notif.checkInTime}</Text>
                                            </Box>
                                        )}
                                        {notif.type === "report" && (
                                            <Box className="bg-gradient-to-r from-purple-50 to-purple-100 p-3 rounded-lg border border-purple-200 text-sm">
                                                <Text className="text-xs text-gray-600 font-semibold mb-1">Hạn cuối:</Text>
                                                <Text className="text-xs text-gray-700 font-semibold">{notif.deadline}</Text>
                                            </Box>
                                        )}
                                    </Box>

                                    {/* Actions */}
                                    <Box className="flex gap-2 ml-8">
                                        {!notif.read && (
                                            <button
                                                onClick={() => handleMarkAsRead(notif.id)}
                                                className="text-xs text-blue-600 hover:text-blue-800 font-semibold px-3 py-1.5 rounded hover:bg-blue-100 transition-colors"
                                            >
                                                Đánh dấu là đã đọc
                                            </button>
                                        )}
                                        <button
                                            onClick={() => handleDelete(notif.id)}
                                            className="text-xs text-gray-500 hover:text-red-600 font-semibold px-3 py-1.5 rounded hover:bg-gray-100 transition-colors ml-auto"
                                        >
                                            Xóa
                                        </button>
                                    </Box>
                                </Box>
                            );
                        })
                    ) : (
                        <Box className="text-center py-12">
                            <Icon icon="zi-check-circle" className="text-blue-400 text-5xl mb-3" />
                            <Text className="text-gray-600 font-semibold">
                                {selectedType ? "Không có thông báo loại này" : "Không có thông báo mới"}
                            </Text>
                            <Text className="text-gray-500 text-sm mt-1">
                                {selectedType ? "Chọn loại khác để xem" : "Tất cả thông báo đã được xử lý"}
                            </Text>
                        </Box>
                    )}
                </Box>
            </Box>

            <BottomNavigation />
        </Page>
    );
}

export default Notifications;
