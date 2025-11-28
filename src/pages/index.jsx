import { Box, Button, Icon, Page, Text } from "zmp-ui";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import WorkDetailModal from "../components/WorkDetailModal";
import BottomNavigation from "../components/BottomNavigation";

function HomePage() {
    const navigate = useNavigate();
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [selectedWork, setSelectedWork] = useState(null);

    const [todayAssignments] = useState([
        {
            id: 1,
            title: "Bảo trì điều hòa",
            workName: "Bảo trì điều hòa",
            serviceType: "Bảo trì định kỳ",
            service: "Bảo trì",
            equipment: "Điều hòa",
            location: "05A Quốc Hương, Phường An Khánh, Quận 2, TP.HCM",
            address: "05A Quốc Hương, Phường An Khánh, Quận 2, TP.HCM",
            coordinates: { lat: 10.7769, lng: 106.7009 },
            company: "NEXUS HOUSE",
            customerName: "Nguyễn Văn A",
            phoneNumber: "0901234567",
            scheduledDate: new Date().toLocaleDateString("vi-VN"),
            scheduledTime: "08:00 - 12:00",
            status: "in_progress",
            priority: "high",
            notes: "Cần kiểm tra gas và lọc. Mang theo dụng cụ vệ sinh máy lạnh.",
            content: "Bảo trì hệ thống điều hòa định kỳ",
            workType: "service",
            technicians: [{ name: "Nguyễn Văn A", phone: "0901234567", specialization: "Điều hòa" }],
        },
        {
            id: 2,
            title: "Sửa chữa hệ thống điện",
            workName: "Sửa chữa hệ thống điện",
            serviceType: "Sửa chữa",
            service: "Sửa chữa",
            equipment: "Hệ thống điện",
            location: "456 Lê Văn Việt, Quận 9, TP.HCM",
            address: "456 Lê Văn Việt, Quận 9, TP.HCM",
            coordinates: { lat: 10.8411, lng: 106.8097 },
            company: "VINHOMES",
            customerName: "Trần Thị B",
            phoneNumber: "0902345678",
            scheduledDate: new Date().toLocaleDateString("vi-VN"),
            scheduledTime: "13:00 - 17:00",
            status: "pending",
            priority: "high",
            notes: "Có bảng mạch bị lỗi. Cần kiểm tra và thay thế nếu cần.",
            content: "Sửa chữa hệ thống điện và kiểm tra bảng mạch",
            workType: "project",
            technicians: [{ name: "Trần Văn B", phone: "0907654321", specialization: "Điện công nghiệp" }],
        },
        {
            id: 3,
            title: "Kiểm tra thiết bị",
            workName: "Kiểm tra thiết bị",
            serviceType: "Kiểm tra",
            service: "Kiểm tra",
            equipment: "Điều hòa",
            location: "789 Võ Văn Ngân, Thủ Đức, TP.HCM",
            address: "789 Võ Văn Ngân, Thủ Đức, TP.HCM",
            coordinates: { lat: 10.8505, lng: 106.7717 },
            company: "MASTERI",
            customerName: "Lê Văn C",
            phoneNumber: "0903456789",
            scheduledDate: new Date().toLocaleDateString("vi-VN"),
            scheduledTime: "17:30 - 18:30",
            status: "pending",
            priority: "medium",
            notes: "Kiểm tra định kỳ hàng quý",
            content: "Kiểm tra hệ thống camera an ninh",
            workType: "project",
            technicians: [{ name: "Lê Văn C", phone: "0903456789", specialization: "An ninh" }],
        },
    ]);

    const [statistics] = useState({
        totalAssignedToday: 3,
        completed: 0,
        inProgress: 0,
        pending: 3,
        totalHours: 8.5,
        averageRating: 4.8,
    });

    const getStatusColor = (status) => {
        switch (status) {
            case "pending":
                return "bg-yellow-100 text-yellow-800 border-yellow-300";
            case "in_progress":
                return "bg-blue-100 text-blue-800 border-blue-300";
            case "completed":
                return "bg-green-100 text-green-800 border-green-300";
            default:
                return "bg-gray-100 text-gray-800 border-gray-300";
        }
    };

    const getStatusLabel = (status) => {
        switch (status) {
            case "pending":
                return "Chờ thực hiện";
            case "in_progress":
                return "Đang thực hiện";
            case "completed":
                return "Hoàn thành";
            default:
                return "Không xác định";
        }
    };

    const getPriorityLabel = (priority) => {
        switch (priority) {
            case "high":
                return "Cao";
            case "medium":
                return "Trung bình";
            case "low":
                return "Thấp";
            default:
                return "Bình thường";
        }
    };

    const getPriorityColor = (priority) => {
        switch (priority) {
            case "high":
                return "text-red-600 bg-red-50";
            case "medium":
                return "text-orange-600 bg-orange-50";
            case "low":
                return "text-green-600 bg-green-50";
            default:
                return "text-gray-600 bg-gray-50";
        }
    };

    const handleShowDetail = (job) => {
        setSelectedWork(job);
        setShowDetailModal(true);
    };

    const handleStartWork = (job) => {
        // Navigate to work start page or perform action
        navigate(`/work/${job.id}/start`);
    };

    const handleProgressReport = (job) => {
        // Navigate to progress report page
        navigate(`/report`);
    };

    return (
        <Page className="bg-gray-50 min-h-screen pb-20">
            <Header title="Theo Dõi Tiến Độ Công Việc" />

            <Box className="px-4 pt-4 pb-28">
                {/* Statistics Cards */}
                <Box className="bg-white rounded-xl shadow-sm p-4 mb-4 border border-gray-100">
                    <Text className="font-bold text-gray-900 mb-3 flex items-center">
                        <Icon icon="zi-reorder-solid" className="mr-2 text-blue-600" size={16} />
                        Thống Kê Hôm Nay
                    </Text>

                    <Box className="grid grid-cols-2 gap-3 mb-3">
                        <Box className="bg-blue-50 rounded-lg p-3 border border-blue-200 text-center">
                            <Text className="text-2xl font-bold text-blue-600">{statistics.totalAssignedToday}</Text>
                            <Text className="text-xs text-gray-600 mt-1">Công việc được phân bổ</Text>
                        </Box>
                        <Box className="bg-yellow-50 rounded-lg p-3 border border-yellow-200 text-center">
                            <Text className="text-2xl font-bold text-yellow-600">{statistics.pending}</Text>
                            <Text className="text-xs text-gray-600 mt-1">Công việc chờ thực hiện</Text>
                        </Box>
                    </Box>

                    <Box className="grid grid-cols-2 gap-3">
                        <Box className="bg-green-50 rounded-lg p-3 border border-green-200 text-center">
                            <Text className="text-2xl font-bold text-green-600">{statistics.completed}</Text>
                            <Text className="text-xs text-gray-600 mt-1">Công việc hoàn thành</Text>
                        </Box>
                        <Box className="bg-purple-50 rounded-lg p-3 border border-purple-200 text-center">
                            <Text className="text-2xl font-bold text-purple-600">{statistics.totalHours}h</Text>
                            <Text className="text-xs text-gray-600 mt-1">Tổng thời gian dự kiến</Text>
                        </Box>
                    </Box>
                </Box>

                {/* Work Progress Bar */}
                <Box className="bg-white rounded-xl shadow-sm p-4 mb-4 border border-gray-100">
                    <Box className="flex items-center justify-between mb-2">
                        <Box>
                            <Text className="font-bold text-gray-900 flex items-center">
                                <Icon icon="zi-reorder-solid" className="mr-2 text-blue-600" size={16} />
                                Tiến độ thực hiện công việc
                            </Text>
                        </Box>
                        <Text className="text-sm font-bold text-blue-600">
                            {Math.round((statistics.completed / statistics.totalAssignedToday) * 100)}%
                        </Text>
                    </Box>
                    <Box className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                        <Box
                            className="bg-gradient-to-r from-blue-500 to-blue-600 h-full rounded-full transition-all"
                            style={{ width: `${(statistics.completed / statistics.totalAssignedToday) * 100}%` }}
                        ></Box>
                    </Box>
                    <Box className="flex justify-between mt-2">
                        <Text className="text-xs text-gray-500">
                            <span className="font-semibold">{statistics.completed}</span> công việc hoàn thành
                        </Text>
                        <Text className="text-xs text-gray-500">
                            <span className="font-semibold">{statistics.pending}</span> công việc chờ xử lý
                        </Text>
                    </Box>
                </Box>

                {/* Today's Assignments */}
                <Box className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <Box className="p-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-blue-100">
                        <Text className="font-bold text-gray-900 flex items-center">
                            <Icon icon="zi-list-1" className="mr-2 text-blue-600" size={16} />
                            Công Việc Hôm Nay ({todayAssignments.length})
                        </Text>
                    </Box>

                    <Box className="divide-y divide-gray-200">
                        {todayAssignments.map((job, index) => (
                            <Box key={job.id} className="p-4 hover:bg-gray-50 transition-colors">
                                {/* Job Header */}
                                <Box className="flex items-start justify-between gap-2 mb-2">
                                    <Box className="flex-1">
                                        <Box className="flex items-center gap-2 mb-1">
                                            <Text className="font-semibold text-gray-900 line-clamp-2">
                                                {job.title}
                                            </Text>
                                        </Box>
                                        <Text className="text-xs text-gray-600">{job.company}</Text>
                                    </Box>
                                    <Box
                                        className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${getStatusColor(
                                            job.status
                                        )}`}
                                    >
                                        {getStatusLabel(job.status)}
                                    </Box>
                                </Box>

                                {/* Service & Equipment Info */}
                                <Box className="mb-2">
                                    <Box className="flex flex-wrap gap-2 mb-2">
                                        <Box className="text-xs px-2 py-1 bg-gray-100 rounded text-gray-700 font-medium">
                                            <Icon icon="zi-tools" size={10} className="mr-0.5 inline" />
                                            {job.serviceType}
                                        </Box>
                                        <Box className="text-xs px-2 py-1 bg-gray-100 rounded text-gray-700 font-medium">
                                            <Icon icon="zi-setting" size={10} className="mr-0.5 inline" />
                                            {job.equipment}
                                        </Box>
                                        <Box
                                            className={`text-xs px-2 py-1 rounded font-medium ${getPriorityColor(
                                                job.priority
                                            )}`}
                                        >
                                            Ưu tiên: {getPriorityLabel(job.priority)}
                                        </Box>
                                    </Box>
                                </Box>

                                {/* Scheduled Time */}
                                <Box className="mb-2 flex items-center gap-2">
                                    <Icon icon="zi-clock-1" className="text-gray-400" size={14} />
                                    <Text className="text-sm font-semibold text-gray-700">{job.scheduledTime}</Text>
                                </Box>

                                {/* Location */}
                                <Box className="mb-2 flex items-start gap-2">
                                    <Icon icon="zi-location" className="text-red-500 mt-0.5 flex-shrink-0" size={14} />
                                    <Text className="text-xs text-gray-600">{job.location}</Text>
                                </Box>

                                {/* Customer Info */}
                                <Box className="mb-2 flex items-center gap-2">
                                    <Icon icon="zi-user" className="text-gray-400" size={14} />
                                    <Text className="text-xs text-gray-600">
                                        <span className="font-semibold">{job.customerName}</span> • {job.phoneNumber}
                                    </Text>
                                </Box>

                                {/* Notes */}
                                {job.notes && (
                                    <Box className="p-2 bg-blue-50 rounded border border-blue-200 mb-2">
                                        <Text className="text-xs text-blue-800">
                                            <span className="font-semibold">Ghi chú:</span> {job.notes}
                                        </Text>
                                    </Box>
                                )}

                                {/* Action Buttons */}
                                <Box className="flex gap-2 mt-3">
                                    {job.status === "pending" && (
                                        <Button
                                            size="small"
                                            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs"
                                            onClick={() => handleStartWork(job)}
                                        >
                                            <Icon icon="zi-play-circle" size={12} className="mr-1" />
                                            Bắt đầu
                                        </Button>
                                    )}
                                    {job.status === "in_progress" && (
                                        <Button
                                            size="small"
                                            className="flex-1 bg-orange-600 hover:bg-orange-700 text-white rounded text-xs"
                                            onClick={() => handleProgressReport(job)}
                                        >
                                            <Icon icon="zi-camera" size={12} className="mr-1" />
                                            Báo cáo tiến độ
                                        </Button>
                                    )}
                                    {job.status === "completed" && (
                                        <Button
                                            size="small"
                                            className="flex-1 bg-green-600 hover:bg-green-700 text-white rounded text-xs"
                                            disabled
                                        >
                                            <Icon icon="zi-check-circle" size={12} className="mr-1" />
                                            Hoàn thành
                                        </Button>
                                    )}
                                    <Button
                                        size="small"
                                        className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded text-xs"
                                        onClick={() => handleShowDetail(job)}
                                    >
                                        <Icon icon="zi-info-circle" size={12} className="mr-1" />
                                        Chi tiết
                                    </Button>
                                </Box>
                            </Box>
                        ))}
                    </Box>
                </Box>

                {/* Submit Report Button */}
                {/* <Box className="mt-4">
                    <Button
                        variant="primary"
                        fullWidth
                        onClick={() => navigate("/report")}
                        className="bg-green-600 hover:bg-green-700 text-white rounded-lg py-3 font-semibold"
                    >
                        <Icon icon="zi-send" className="mr-2" size={16} />
                        Gửi Báo Cáo Công Việc
                    </Button>
                </Box> */}
            </Box>

            {/* Work Detail Modal */}
            <WorkDetailModal visible={showDetailModal} onClose={() => setShowDetailModal(false)} work={selectedWork} />

            <BottomNavigation />
        </Page>
    );
}

export default HomePage;
