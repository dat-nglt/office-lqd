/*
 * Dữ liệu cần thiết cho trang Notifications:
 * - notificationTypes: Mảng các đối tượng loại thông báo với id, label, icon, color. Được sử dụng để hiển thị bộ lọc loại.
 * - notifications: Mảng các đối tượng thông báo với id (số), type (chuỗi), title (chuỗi), content (chuỗi), date (chuỗi), time (chuỗi), priority (chuỗi), read (boolean), work (đối tượng với title, company, location, scheduledTime, customer, phone, checkInTime, checkOutTime, oldTime, newTime), deadline (chuỗi). Được sử dụng để hiển thị danh sách thông báo.
 * - selectedType: Chuỗi để lọc thông báo theo loại. Được sử dụng cho bộ lọc.
 * - unreadCount: Số lượng thông báo chưa đọc, tính từ notifications. Được sử dụng để hiển thị thống kê.
 *
 * API cần thiết (đề xuất thực hiện):
 * - fetchNotifications(employeeId): API để lấy danh sách thông báo từ backend dựa trên ID nhân viên. Ví dụ: GET /api/notifications?employeeId=123. Trả về mảng notifications.
 * - markNotificationAsRead(notificationId): API để đánh dấu thông báo đã đọc. Ví dụ: PUT /api/notifications/mark-read với body {notificationId: 1}.
 * - deleteNotification(notificationId): API để xóa thông báo. Ví dụ: DELETE /api/notifications/delete?notificationId=1.
 * - fetchNotificationTypes(): API để lấy danh sách loại thông báo. Ví dụ: GET /api/notifications/types. Trả về mảng notificationTypes.
 * - Cải tiến tiềm năng: Tích hợp useEffect để gọi fetchNotifications khi component mount; thêm xử lý lỗi và loading states; sử dụng Axios hoặc Fetch cho các API backend; thêm real-time updates qua WebSocket.
 * - Không có lệnh gọi API backend hiện tại; dựa vào dữ liệu local hardcode.
 */

import { Box, Text, Icon, Page } from "zmp-ui";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import BottomNavigation from "../components/BottomNavigation";

function Notifications() {
    const navigate = useNavigate();

    const [notificationTypes] = useState([
        {
            id: "assignment",
            label: "Phân bổ công việc",
            icon: "zi-list-1",
            color: "bg-blue-100 text-blue-700 border-blue-300",
        },
        {
            id: "change",
            label: "Thay đổi công việc",
            icon: "zi-edit",
            color: "bg-orange-100 text-orange-700 border-orange-300",
        },
        {
            id: "checkin",
            label: "Chấm công",
            icon: "zi-post",
            color: "bg-green-100 text-green-700 border-green-300",
        },
        {
            id: "report",
            label: "Báo cáo",
            icon: "zi-share-external-2",
            color: "bg-purple-100 text-purple-700 border-purple-300",
        },
        {
            id: "announcement",
            label: "Thông báo",
            icon: "zi-info-circle",
            color: "bg-gray-100 text-gray-700 border-gray-300",
        },
    ]);

    const [notifications, setNotifications] = useState([
        {
            id: 1,
            type: "checkin",
            title: "Đến giờ chấm vào",
            content: "Bạn cần chấm vào lúc 08:00 để bắt đầu công việc bảo trì điều hòa",
            date: "17/11/2025",
            time: "07:45",
            priority: "Cao",
            read: false,
            work: {
                title: "Bảo trì điều hòa tại NEXUS HOUSE",
                company: "NEXUS HOUSE",
                location: "05A Quốc Hương, Quận 2",
                scheduledTime: "08:00 - 12:00",
                customer: "Nguyễn Văn A",
                phone: "0901234567",
                checkInTime: "08:00",
            },
        },
        {
            id: 2,
            type: "assignment",
            title: "Phân bổ công việc mới",
            content: "Bạn được phân bổ công việc bảo trì mới",
            date: "17/11/2025",
            time: "07:30",
            priority: "Cao",
            read: false,
            work: {
                title: "Bảo trì điều hòa tại NEXUS HOUSE",
                company: "NEXUS HOUSE",
                location: "05A Quốc Hương, Quận 2",
                scheduledTime: "08:00 - 12:00",
                customer: "Nguyễn Văn A",
                phone: "0901234567",
            },
        },
        {
            id: 3,
            type: "change",
            title: "Thay đổi lịch công việc",
            content: "Công việc sửa chữa điện được dời từ 14:00 sang 15:30",
            date: "17/11/2025",
            time: "06:15",
            priority: "Trung bình",
            read: true,
            work: {
                title: "Sửa chữa hệ thống điện tại VINHOMES",
                company: "VINHOMES",
                location: "456 Lê Văn Việt, Quận 9",
                oldTime: "14:00 - 17:00",
                newTime: "15:30 - 18:30",
                customer: "Trần Thị B",
            },
        },
        {
            id: 4,
            type: "checkin",
            title: "Đến giờ chấm ra",
            content: "Nhắc nhở: Bạn cần chấm ra lúc 17:00 để kết thúc công việc",
            date: "16/11/2025",
            time: "16:45",
            priority: "Cao",
            read: true,
            work: {
                title: "Sửa chữa hệ thống điện tại VINHOMES",
                company: "VINHOMES",
                scheduledTime: "13:00 - 17:00",
                checkOutTime: "17:00",
            },
        },
        {
            id: 5,
            type: "report",
            title: "Hạn báo cáo tiến độ",
            content: "Bạn cần báo cáo tiến độ công việc trước 18:00 hôm nay",
            date: "16/11/2025",
            time: "17:00",
            priority: "Cao",
            read: true,
            deadline: "18:00",
        },
        {
            id: 6,
            type: "announcement",
            title: "Cập nhật quy trình an toàn",
            content: "Mang theo bộ đồ bảo hộ khi đi công tác",
            date: "16/11/2025",
            time: "09:00",
            priority: "Cao",
            read: true,
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

    const filteredNotifications = selectedType ? notifications.filter((n) => n.type === selectedType) : notifications;
    const unreadCount = notifications.filter((n) => !n.read).length;

    return (
        <Page className="bg-gray-50 min-h-screen pb-20">
            {/* Enhanced Header */}
            <Box className="bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 shadow-lg pb-4 relative overflow-hidden">
                <Box className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full -mr-24 -mt-24"></Box>
                <Box className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full -ml-16 -mb-16"></Box>

                <Box className="px-4 pt-10 mt-5 pb-4 relative z-10">
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
                                                <Text className="font-semibold text-gray-900 line-clamp-1">
                                                    {notif.title}
                                                </Text>
                                            </Box>
                                        </Box>
                                        <button
                                            onClick={() => handleDelete(notif.id)}
                                            className="text-gray-400 hover:text-red-600 p-1 flex-shrink-0"
                                        >
                                            <Icon icon="zi-close" size={14} />
                                        </button>
                                    </Box>

                                    {/* Meta Info */}
                                    <Box className="flex items-center gap-2 mb-2 ">
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
                                    <Text className="text-sm text-gray-700 mb-3  line-clamp-2">{notif.content}</Text>

                                    {/* Work Info Card */}
                                    {notif.work && (
                                        <Box className=" mb-3 p-3 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg border border-blue-200">
                                            <Text className="text-xs text-blue-700 font-bold mb-2">
                                                Thông Tin Công Việc
                                            </Text>

                                            {/* Work Title */}
                                            <Text className="text-xs font-semibold text-gray-900 mb-1">
                                                {notif.work.title}
                                            </Text>

                                            {/* Company & Location */}
                                            <Box className="space-y-1 mb-2 text-xs text-gray-700">
                                                {notif.work.company && (
                                                    <Box className="flex items-center gap-1">
                                                        <Icon icon="zi-home" size={12} className="text-gray-500" />
                                                        <Text>{notif.work.company}</Text>
                                                    </Box>
                                                )}
                                                {notif.work.location && (
                                                    <Box className="flex items-center gap-1">
                                                        <Icon icon="zi-location" size={12} className="text-red-500" />
                                                        <Text>{notif.work.location}</Text>
                                                    </Box>
                                                )}
                                            </Box>

                                            {/* Time Info */}
                                            <Box className="space-y-1 mb-2 text-xs text-gray-700 border-t border-blue-200 pt-2">
                                                {notif.work.scheduledTime && (
                                                    <Box className="flex items-center gap-1">
                                                        <Icon icon="zi-clock-1" size={12} className="text-gray-500" />
                                                        <Text className="font-medium">{notif.work.scheduledTime}</Text>
                                                    </Box>
                                                )}
                                                {notif.work.checkInTime && (
                                                    <Box className="flex items-center gap-1 text-green-700 font-semibold">
                                                        <Icon icon="zi-post" size={12} />
                                                        <Text>Chấm vào: {notif.work.checkInTime}</Text>
                                                    </Box>
                                                )}
                                                {notif.work.checkOutTime && (
                                                    <Box className="flex items-center gap-1 text-orange-700 font-semibold">
                                                        <Icon icon="zi-post" size={12} />
                                                        <Text>Chấm ra: {notif.work.checkOutTime}</Text>
                                                    </Box>
                                                )}
                                                {notif.work.oldTime && notif.work.newTime && (
                                                    <Box className="flex items-center gap-1">
                                                        <Icon icon="zi-edit" size={12} className="text-orange-500" />
                                                        <Text>
                                                            <span className="line-through">{notif.work.oldTime}</span>
                                                            <span className="ml-1 font-semibold text-green-700">
                                                                → {notif.work.newTime}
                                                            </span>
                                                        </Text>
                                                    </Box>
                                                )}
                                            </Box>

                                            {/* Customer Info */}
                                            {(notif.work.customer || notif.work.phone) && (
                                                <Box className="border-t border-blue-200 pt-2 flex items-center justify-between">
                                                    <Box className="text-xs">
                                                        {notif.work.customer && (
                                                            <Text className="text-gray-700">
                                                                <span className="text-gray-500">KH:</span>{" "}
                                                                <span className="font-semibold">
                                                                    {notif.work.customer}
                                                                </span>
                                                            </Text>
                                                        )}
                                                        {notif.work.phone && (
                                                            <Text className="text-gray-700">
                                                                <span className="text-gray-500">SDT:</span>{" "}
                                                                <span className="font-semibold">
                                                                    {notif.work.phone}
                                                                </span>
                                                            </Text>
                                                        )}
                                                    </Box>
                                                    {notif.work.phone && (
                                                        <button
                                                            onClick={() => {
                                                                window.location.href = `tel:${notif.work.phone}`;
                                                            }}
                                                            className="text-blue-600 hover:text-blue-800 p-1"
                                                        >
                                                            <Icon icon="zi-call" size={16} />
                                                        </button>
                                                    )}
                                                </Box>
                                            )}
                                        </Box>
                                    )}

                                    {/* Quick Action Button */}
                                    <Box className=" flex gap-2">
                                        {notif.type === "checkin" && (
                                            <button
                                                onClick={() => navigate("/checkin")}
                                                className="flex-1 text-xs px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded font-semibold transition-colors flex items-center justify-center gap-1"
                                            >
                                                <Icon icon="zi-camera" size={12} />
                                                Chấm Công Ngay
                                            </button>
                                        )}
                                        {notif.type === "assignment" && (
                                            <button
                                                onClick={() => navigate("/work-management")}
                                                className="flex-1 text-xs px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded font-semibold transition-colors flex items-center justify-center gap-1"
                                            >
                                                <Icon icon="zi-list-1" size={12} />
                                                Xem Chi Tiết
                                            </button>
                                        )}
                                        {!notif.read && (
                                            <button
                                                onClick={() => handleMarkAsRead(notif.id)}
                                                className="text-xs text-blue-600 hover:text-blue-800 font-semibold px-2 py-1.5 rounded hover:bg-blue-100 transition-colors"
                                            >
                                                Đã đọc
                                            </button>
                                        )}
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
