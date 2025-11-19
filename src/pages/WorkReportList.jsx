import { Box, Button, Icon, Page, Text } from "zmp-ui";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import BottomNavigation from "../components/BottomNavigation";

function WorkReportList() {
    const navigate = useNavigate();
    const [workReports, setWorkReports] = useState([
        {
            id: 1,
            date: "2024-01-15",
            company: "NEXUS HOUSE",
            content: "Lắp đặt hệ thống điện",
            customerName: "Nguyễn Văn A",
            estimatedStartTime: "08:00",
            estimatedEndTime: "17:00",
            status: "completed",
        },
        {
            id: 2,
            date: "2024-01-16",
            company: "VINHOMES",
            content: "Bảo trì điều hòa",
            customerName: "Trần Thị B",
            estimatedStartTime: "09:00",
            estimatedEndTime: "16:30",
            status: "pending",
        },
        {
            id: 3,
            date: "2024-01-17",
            company: "MASTERI",
            content: "Hệ thống điện nước",
            customerName: "Lê Văn C",
            estimatedStartTime: "07:30",
            estimatedEndTime: "18:00",
            status: "in_progress",
        },
    ]);

    const [filterDate, setFilterDate] = useState(new Date().toISOString().split('T')[0]);

    const formatDate = (dateString) => {
        const date = new Date(dateString + 'T00:00:00');
        const days = ["Chủ nhật", "Thứ hai", "Thứ ba", "Thứ tư", "Thứ năm", "Thứ sáu", "Thứ bảy"];
        const dayName = days[date.getDay()];
        const formattedDate = date.toLocaleDateString("vi-VN");
        return `${formattedDate} - ${dayName}`;
    };

    const calculateWorkHours = (startTime, endTime) => {
        const [startHour, startMin] = startTime.split(':').map(Number);
        const [endHour, endMin] = endTime.split(':').map(Number);
        const start = startHour * 60 + startMin;
        const end = endHour * 60 + endMin;
        const minutes = end - start;
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return `${hours}h ${mins}m`;
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'completed':
                return 'bg-green-100 text-green-800';
            case 'in_progress':
                return 'bg-blue-100 text-blue-800';
            case 'pending':
                return 'bg-yellow-100 text-yellow-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const getStatusText = (status) => {
        switch (status) {
            case 'completed':
                return 'Hoàn thành';
            case 'in_progress':
                return 'Đang thực hiện';
            case 'pending':
                return 'Chờ xử lý';
            default:
                return 'Không xác định';
        }
    };

    const filteredReports = workReports.filter(report => report.date === filterDate);

    return (
        <Page className="bg-gray-50 min-h-screen">
            <Header title="Danh Sách Báo Cáo" showBack={true} onBack={() => navigate("/")} />

            <Box className="px-4 pt-4 pb-28">
                {/* Filter Section */}
                <Box className="bg-white rounded-lg p-4 shadow-sm border border-gray-100 mb-4">
                    <Text className="font-semibold text-gray-800 mb-3 text-sm flex items-center">
                        <Icon icon="zi-calendar" className="mr-2 text-green-600" size={16} />
                        Lọc theo ngày
                    </Text>
                    <input
                        type="date"
                        value={filterDate}
                        onChange={(e) => setFilterDate(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-green-600"
                    />
                    <Text className="text-xs text-gray-500 mt-2">{formatDate(filterDate)}</Text>
                </Box>

                {/* Work Reports List */}
                <Box className="space-y-3">
                    {filteredReports.length > 0 ? (
                        filteredReports.map((report) => (
                            <Box
                                key={report.id}
                                onClick={() => navigate(`/work-report/${report.id}`)}
                                className="bg-white rounded-lg p-4 shadow-sm border border-gray-100 hover:border-green-300 hover:shadow-md transition-all cursor-pointer"
                            >
                                <Box className="flex items-start justify-between mb-3">
                                    <Box className="flex-1">
                                        <Text className="font-semibold text-gray-900">
                                            {report.company}
                                        </Text>
                                        <Text className="text-sm text-gray-600 mt-1">
                                            {report.content}
                                        </Text>
                                    </Box>
                                    <Box className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(report.status)}`}>
                                        {getStatusText(report.status)}
                                    </Box>
                                </Box>

                                {/* Time Information */}
                                <Box className="bg-gray-50 rounded-lg p-3 mb-3 space-y-2">
                                    <Box className="flex items-center justify-between">
                                        <Box className="flex items-center space-x-2">
                                            <Icon icon="zi-time" className="text-blue-600" size={14} />
                                            <Text className="text-xs text-gray-600">Giờ bắt đầu dự kiến:</Text>
                                        </Box>
                                        <Text className="text-xs font-semibold text-gray-900">{report.estimatedStartTime}</Text>
                                    </Box>
                                    <Box className="flex items-center justify-between">
                                        <Box className="flex items-center space-x-2">
                                            <Icon icon="zi-time" className="text-blue-600" size={14} />
                                            <Text className="text-xs text-gray-600">Giờ kết thúc dự kiến:</Text>
                                        </Box>
                                        <Text className="text-xs font-semibold text-gray-900">{report.estimatedEndTime}</Text>
                                    </Box>
                                    <Box className="flex items-center justify-between pt-2 border-t border-gray-200">
                                        <Text className="text-xs text-gray-600 font-semibold">Thời gian dự kiến:</Text>
                                        <Text className="text-xs font-bold text-blue-600">
                                            {calculateWorkHours(report.estimatedStartTime, report.estimatedEndTime)}
                                        </Text>
                                    </Box>
                                </Box>

                                <Box className="flex items-center justify-between">
                                    <Text className="text-xs text-gray-600">
                                        Khách hàng: <span className="font-semibold text-gray-900">{report.customerName}</span>
                                    </Text>
                                    <Icon icon="zi-chevron-right" className="text-gray-400" size={16} />
                                </Box>
                            </Box>
                        ))
                    ) : (
                        <Box className="text-center py-12">
                            <Icon icon="zi-inbox" className="text-gray-400 text-4xl mb-3" />
                            <Text className="text-gray-600 font-semibold">Không có báo cáo nào</Text>
                            <Text className="text-gray-500 text-sm mt-1">Chưa có báo cáo công việc cho ngày này</Text>
                            <Button
                                variant="primary"
                                onClick={() => navigate("/")}
                                className="mt-4 bg-green-600 hover:bg-green-700"
                            >
                                Tạo báo cáo mới
                            </Button>
                        </Box>
                    )}
                </Box>
            </Box>

            <BottomNavigation />
        </Page>
    );
}

export default WorkReportList;
