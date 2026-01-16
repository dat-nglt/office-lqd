import { Box, Button, Icon, Page, Text } from "zmp-ui";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import BottomNavigation from "../components/BottomNavigation";
import { getUserInfoInStorage } from "../config/axiosConfig";
import { getOvertimeRequestHistory } from "../services/overtime-request.service";
import { miniAppGetProfileInfoByID } from "../services/user.service";

function OvertimeList() {
    const navigate = useNavigate();
    const [overtimeRequests, setOvertimeRequests] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchOvertimeRequests();
    }, []);

    const fetchOvertimeRequests = async () => {
        try {
            setLoading(true);
            const userInfo = getUserInfoInStorage();
            const userInfoResp = await miniAppGetProfileInfoByID(userInfo.id);
            console.log("Fetched user info:", userInfoResp);
            if (userInfoResp?.data?.id) {
                console.log("User ID:", userInfoResp.data.id);
                const overtimeDataResp = await getOvertimeRequestHistory(userInfoResp.data.id);
                console.log("Fetched overtime requests:", overtimeDataResp);
                setOvertimeRequests(overtimeDataResp?.data || []);
            }
        } catch (error) {
            console.error("Lỗi khi tải danh sách yêu cầu tăng ca:", error);
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status) => {
        const statusColors = {
            pending: "text-yellow-600",
            approved: "text-green-600",
            rejected: "text-red-600",
            cancelled: "text-gray-600",
        };
        return statusColors[status] || "text-gray-800";
    };

    const getStatusText = (status) => {
        const statusTexts = {
            pending: "Chờ phê duyệt",
            approved: "Đã phê duyệt",
            rejected: "Từ chối",
            cancelled: "Đã hủy",
        };
        return statusTexts[status] || status;
    };

    return (
        <Page className="bg-gray-50 min-h-screen">
            {/* Header */}
            <Box className="bg-gradient-to-r from-green-600 via-green-700 to-green-800 shadow-lg pb-4 relative overflow-hidden">
                <Box className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full -mr-24 -mt-24"></Box>
                <Box className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full -ml-16 -mb-16"></Box>

                <Box className="px-4 pt-6 pb-2 relative z-10">
                    <Box className="flex items-center space-x-3 mb-3 mt-10">
                        <Text.Title className="text-white font-bold capitalize" size="large">
                            Danh sách tăng ca văn phòng
                        </Text.Title>
                    </Box>

                    <Box className="flex gap-2">
                        <Box className="flex-1 bg-white/15 rounded-lg px-3 py-2 text-center border border-white/20">
                            <Text className="text-white font-bold text-sm">{overtimeRequests.length}</Text>
                            <Text className="text-green-100 text-xs">Yêu cầu</Text>
                        </Box>
                        <Box className="flex-1 bg-white/15 rounded-lg px-3 py-2 text-center border border-white/20">
                            <Text className="text-white font-bold text-sm">
                                {overtimeRequests.filter((r) => r.status === "approved").length}
                            </Text>
                            <Text className="text-green-100 text-xs">Đã phê duyệt</Text>
                        </Box>
                    </Box>
                </Box>
            </Box>

            <Box className="px-4 pt-4 pb-28">
                {loading ? (
                    <Box className="text-center py-12">
                        <Icon icon="zi-loading" className="text-green-600 text-4xl mb-3 animate-spin" />
                        <Text className="text-gray-600">Đang tải dữ liệu...</Text>
                    </Box>
                ) : overtimeRequests.length > 0 ? (
                    <Box className="space-y-3">
                        {overtimeRequests.map((request) => (
                            <Box
                                key={request.id}
                                className="bg-white rounded-lg p-4 shadow-sm border border-gray-100 hover:border-green-300 hover:shadow-md transition-all cursor-pointer"
                            >
                                {/* Header */}
                                <Box className="flex items-start justify-between mb-3">
                                    <Box className="flex-1">
                                        <Text className="font-semibold text-gray-600 text-base">
                                            {request.reason || "Yêu cầu tăng ca"}
                                        </Text>
                                    </Box>
                                </Box>

                                {/* Info Grid */}
                                <Box className="bg-gray-50 rounded-lg p-3 mb-3 space-y-3">
                                    {request.requested_date && (
                                        <Box className="flex items-center justify-between">
                                            <Box className="flex items-center space-x-2">
                                                <Icon icon="zi-calendar" className="text-blue-600" size={14} />
                                                <Text className="text-xs text-gray-600">Ngày yêu cầu:</Text>
                                            </Box>
                                            <Text className="text-xs text-gray-900">{request.requested_date}</Text>
                                        </Box>
                                    )}
                                    {request.duration_minutes && (
                                        <Box className="flex items-center justify-between">
                                            <Box className="flex items-center space-x-2">
                                                <Icon icon="zi-clock-1" className="text-orange-600" size={14} />
                                                <Text className="text-xs text-gray-600">Số giờ yêu cầu:</Text>
                                            </Box>
                                            <Text className="text-xs">{request.duration_minutes / 60} giờ</Text>
                                        </Box>
                                    )}
                                    {request.duration_minutes && (
                                        <Box className="flex items-center justify-between">
                                            <Box className="flex items-center space-x-2">
                                                <Icon icon="zi-check" className="text-green-600" size={14} />
                                                <Text className="text-xs text-gray-600">Số giờ phê duyệt:</Text>
                                            </Box>
                                            <Text className="text-xs">{request.duration_minutes / 60} giờ</Text>
                                        </Box>
                                    )}

                                    {request.requested_date && (
                                        <Box className="flex items-center justify-between">
                                            <Box className="flex items-center space-x-2">
                                                <Icon icon="zi-check" className="text-green-600" size={14} />
                                                <Text className="text-xs text-gray-600">Trạng thái yêu cầu:</Text>
                                            </Box>
                                            <Text className={`text-xs font-bold ${getStatusColor(request.status)}`}>
                                                {getStatusText(request.status)}
                                            </Text>
                                        </Box>
                                    )}
                                </Box>

                                {/* Footer */}
                                {request.notes && (
                                    <Box className="text-xs text-gray-600 bg-blue-50 rounded p-2">
                                        <Text className="text-gray-700">{request.notes}</Text>
                                    </Box>
                                )}
                            </Box>
                        ))}
                    </Box>
                ) : (
                    <Box className="text-center py-12">
                        <Icon icon="zi-inbox" className="text-gray-400 text-4xl mb-3" />
                        <Text className="text-gray-600 font-semibold">Không có yêu cầu tăng ca nào</Text>
                        <Text className="text-gray-500 text-sm mt-1">Bạn chưa gửi yêu cầu tăng ca nào</Text>
                    </Box>
                )}
            </Box>

            <BottomNavigation />
        </Page>
    );
}

export default OvertimeList;
