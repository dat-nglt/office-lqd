/*
 * Dữ liệu cần thiết cho trang WorkReportDetail:
 * - workReport: Đối tượng với các trường id (số), date (chuỗi), company (chuỗi), address (chuỗi), content (chuỗi), customerName (chuỗi), phoneNumber (chuỗi), notes (chuỗi), estimatedStartTime (chuỗi HH:MM), estimatedEndTime (chuỗi HH:MM), status (chuỗi như "completed"). Được sử dụng để hiển thị chi tiết báo cáo công việc.
 *
 * API cần thiết (đề xuất thực hiện):
 * - fetchWorkReportDetail(workReportId): API để lấy chi tiết báo cáo công việc từ backend dựa trên ID báo cáo. Ví dụ: GET /api/work-reports/detail?workReportId=1. Trả về đối tượng workReport.
 * - Cải tiến tiềm năng: Tích hợp useEffect để gọi fetchWorkReportDetail khi component mount với workReportId từ useParams; thêm xử lý lỗi và loading states; sử dụng Axios hoặc Fetch cho các API backend.
 * - Không có lệnh gọi API backend hiện tại; dựa vào dữ liệu local hardcode.
 */

import { Box, Button, Icon, Page, Text } from "zmp-ui";
import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { nativeStorage } from "zmp-sdk/apis";
import Header from "../components/Header";
import BottomNavigation from "../components/BottomNavigation";

function WorkReportDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [userInfo, setUserInfo] = useState(null);

    // Mock data - in real app, fetch from API or context
    const [workReport] = useState({
        id: parseInt(id),
        date: "2024-01-15",
        company: "NEXUS HOUSE",
        address: "05A Quốc Hương, Phường An Khánh, Quận 2, TP.HCM",
        content: "Lắp đặt hệ thống điện, kiểm tra an toàn điện, lập báo cáo kỹ thuật",
        customerName: "Nguyễn Văn A",
        phoneNumber: "0912345678",
        notes: "Đã hoàn thành lắp đặt, khách hàng hài lòng",
        estimatedStartTime: "08:00",
        estimatedEndTime: "17:00",
        status: "completed",
    });

    useEffect(() => {
        const token = nativeStorage.getItem("access_token");
        const userInfo = nativeStorage.getItem("user_info");

        if (!token || !userInfo) {
            navigate("/login", { replace: true });
        } else {
            try {
                setUserInfo(JSON.parse(userInfo));
            } catch (err) {
                console.error("Error parsing stored user info:", err);
                // Clear invalid data
                localStorage.removeItem("access_token");
                localStorage.removeItem("user_info");
                navigate("/login", { replace: true });
            }
        }
    }, [navigate]);

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
        return { hours, mins, total: minutes };
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'completed':
                return 'bg-green-100 text-green-800 border-green-300';
            case 'in_progress':
                return 'bg-blue-100 text-blue-800 border-blue-300';
            case 'pending':
                return 'bg-yellow-100 text-yellow-800 border-yellow-300';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-300';
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

    const workHours = calculateWorkHours(workReport.estimatedStartTime, workReport.estimatedEndTime);

    return (
        <Page className="bg-gray-50 min-h-screen">
            <Header title="Chi Tiết Báo Cáo" showBack={true} onBack={() => navigate(-1)} />

            <Box className="px-4 pt-4 pb-28">
                {/* Status Badge */}
                <Box className={`rounded-lg px-4 py-3 mb-4 border-2 text-center font-semibold ${getStatusColor(workReport.status)}`}>
                    {getStatusText(workReport.status)}
                </Box>

                {/* Main Information */}
                <Box className="bg-white rounded-lg p-4 shadow-sm border border-gray-100 mb-4 space-y-4">
                    <Box>
                        <Text className="text-xs text-gray-600 mb-1 flex items-center">
                            <Icon icon="zi-calendar" className="mr-1 text-gray-400" size={14} />
                            Ngày thực hiện
                        </Text>
                        <Text className="text-sm font-semibold text-gray-900">{formatDate(workReport.date)}</Text>
                    </Box>

                    <Box className="border-t border-gray-100 pt-4">
                        <Text className="text-xs text-gray-600 mb-1 flex items-center">
                            <Icon icon="zi-home" className="mr-1 text-gray-400" size={14} />
                            Công ty / Công trình
                        </Text>
                        <Text className="text-sm font-semibold text-gray-900">{workReport.company}</Text>
                    </Box>

                    <Box className="border-t border-gray-100 pt-4">
                        <Text className="text-xs text-gray-600 mb-1 flex items-center">
                            <Icon icon="zi-location" className="mr-1 text-gray-400" size={14} />
                            Địa chỉ
                        </Text>
                        <Text className="text-sm font-semibold text-gray-900">{workReport.address}</Text>
                    </Box>
                </Box>

                {/* Work Time Section */}
                <Box className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-4 shadow-sm border border-blue-200 mb-4">
                    <Text className="font-semibold text-blue-900 mb-3 text-sm flex items-center">
                        <Icon icon="zi-time" className="mr-2 text-blue-600" size={16} />
                        Thời Gian Làm Việc Dự Kiến
                    </Text>

                    <Box className="space-y-3">
                        <Box className="bg-white rounded-lg p-3 flex items-center justify-between">
                            <Box className="flex items-center space-x-2">
                                <Icon icon="zi-arrow-down" className="text-blue-600" size={16} />
                                <Text className="text-sm text-gray-600">Giờ bắt đầu:</Text>
                            </Box>
                            <Text className="text-sm font-bold text-blue-600">{workReport.estimatedStartTime}</Text>
                        </Box>

                        <Box className="bg-white rounded-lg p-3 flex items-center justify-between">
                            <Box className="flex items-center space-x-2">
                                <Icon icon="zi-arrow-up" className="text-green-600" size={16} />
                                <Text className="text-sm text-gray-600">Giờ kết thúc:</Text>
                            </Box>
                            <Text className="text-sm font-bold text-green-600">{workReport.estimatedEndTime}</Text>
                        </Box>

                        <Box className="bg-blue-600 rounded-lg p-3 flex items-center justify-between border-2 border-blue-700">
                            <Text className="text-sm font-semibold text-white flex items-center">
                                <Icon icon="zi-clock-1" className="mr-2" size={16} />
                                Tổng thời gian dự kiến:
                            </Text>
                            <Text className="text-sm font-bold text-white">
                                {workHours.hours}h {workHours.mins}m
                            </Text>
                        </Box>
                    </Box>
                </Box>

                {/* Work Content */}
                <Box className="bg-white rounded-lg p-4 shadow-sm border border-gray-100 mb-4">
                    <Text className="text-xs text-gray-600 mb-2 flex items-center">
                        <Icon icon="zi-note" className="mr-1 text-gray-400" size={14} />
                        Nội dung công việc
                    </Text>
                    <Text className="text-sm text-gray-900 leading-relaxed">{workReport.content}</Text>
                </Box>

                {/* Customer Information */}
                <Box className="bg-white rounded-lg p-4 shadow-sm border border-gray-100 mb-4 space-y-3">
                    <Box>
                        <Text className="text-xs text-gray-600 mb-1 flex items-center">
                            <Icon icon="zi-user" className="mr-1 text-gray-400" size={14} />
                            Tên khách hàng liên hệ
                        </Text>
                        <Text className="text-sm font-semibold text-gray-900">{workReport.customerName}</Text>
                    </Box>

                    <Box className="border-t border-gray-100 pt-3">
                        <Text className="text-xs text-gray-600 mb-1 flex items-center">
                            <Icon icon="zi-call" className="mr-1 text-gray-400" size={14} />
                            Số điện thoại liên hệ
                        </Text>
                        <Box className="flex items-center justify-between">
                            <Text className="text-sm font-semibold text-gray-900">{workReport.phoneNumber}</Text>
                            <button className="text-blue-600 hover:text-blue-800 text-xs font-semibold">
                                Gọi
                            </button>
                        </Box>
                    </Box>
                </Box>

                {/* Notes */}
                {workReport.notes && (
                    <Box className="bg-white rounded-lg p-4 shadow-sm border border-gray-100 mb-4">
                        <Text className="text-xs text-gray-600 mb-2 flex items-center">
                            <Icon icon="zi-edit" className="mr-1 text-gray-400" size={14} />
                            Ghi chú
                        </Text>
                        <Text className="text-sm text-gray-900 leading-relaxed">{workReport.notes}</Text>
                    </Box>
                )}

                {/* Action Buttons */}
                <Box className="space-y-2 mt-6">
                    <Button
                        variant="primary"
                        fullWidth
                        onClick={() => navigate(`/edit-work-report/${workReport.id}`)}
                        className="py-3 rounded-lg font-semibold text-base bg-green-600 hover:bg-green-700"
                    >
                        <Icon icon="zi-edit" className="mr-2" size={16} />
                        Chỉnh Sửa Báo Cáo
                    </Button>
                    <button
                        onClick={() => navigate(-1)}
                        className="w-full px-3 py-3 bg-gray-200 text-gray-800 rounded-lg text-sm font-semibold hover:bg-gray-300 transition-colors"
                    >
                        Quay Lại
                    </button>
                </Box>
            </Box>

            <BottomNavigation />
        </Page>
    );
}

export default WorkReportDetail;
