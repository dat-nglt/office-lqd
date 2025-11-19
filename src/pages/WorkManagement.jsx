import { Box, Text, Icon, Button, Page, Modal, Input, DatePicker } from "zmp-ui";
import { useState, useContext } from "react";
import BottomNavigation from "../components/BottomNavigation";
import WorkDetailModal from "../components/WorkDetailModal";
import { ToastContext } from "../components/layout";

function WorkManagement() {
    const toast = useContext(ToastContext);
    const today = new Date().toLocaleDateString("vi-VN");

    const [workList, setWorkList] = useState([
        {
            id: 1,
            title: "Bảo trì điều hòa tại NEXUS HOUSE",
            serviceType: "Bảo trì định kỳ",
            equipment: "Điều hòa",
            company: "NEXUS HOUSE",
            location: "05A Quốc Hương, Phường An Khánh, Quận 2, TP.HCM",
            address: "05A Quốc Hương, Phường An Khánh, Quận 2, TP.HCM",
            coordinates: { lat: 10.7769, lng: 106.7009 },
            scheduledDate: today,
            scheduledTime: "08:00 - 12:00",
            status: "pending",
            priority: "high",
            customerName: "Nguyễn Văn A",
            phoneNumber: "0901234567",
            notes: "Cần kiểm tra gas và lọc",
            content: "Bảo trì hệ thống điều hòa định kỳ",
        },
        {
            id: 2,
            title: "Sửa chữa hệ thống điện tại VINHOMES",
            serviceType: "Sửa chữa",
            equipment: "Hệ thống điện",
            company: "VINHOMES",
            location: "456 Lê Văn Việt, Quận 9, TP.HCM",
            address: "456 Lê Văn Việt, Quận 9, TP.HCM",
            coordinates: { lat: 10.8411, lng: 106.8097 },
            scheduledDate: today,
            scheduledTime: "13:00 - 17:00",
            status: "in_progress",
            priority: "high",
            customerName: "Trần Thị B",
            phoneNumber: "0902345678",
            notes: "Có bảng mạch bị lỗi",
            content: "Sửa chữa hệ thống điện và kiểm tra bảng mạch",
        },
        {
            id: 3,
            title: "Kiểm tra thiết bị tại MASTERI",
            serviceType: "Kiểm tra",
            equipment: "Điều hòa",
            company: "MASTERI",
            location: "789 Võ Văn Ngân, Thủ Đức, TP.HCM",
            address: "789 Võ Văn Ngân, Thủ Đức, TP.HCM",
            coordinates: { lat: 10.8505, lng: 106.7717 },
            scheduledDate: today,
            scheduledTime: "17:30 - 18:30",
            status: "pending",
            priority: "medium",
            customerName: "Lê Văn C",
            phoneNumber: "0903456789",
            notes: "Kiểm tra định kỳ hàng quý",
            content: "Kiểm tra hệ thống camera an ninh",
        },
    ]);

    const [showRescheduleModal, setShowRescheduleModal] = useState(false);
    const [showCancelModal, setShowCancelModal] = useState(false);
    const [showOvertimeModal, setShowOvertimeModal] = useState(false);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [selectedWork, setSelectedWork] = useState(null);
    const [newDate, setNewDate] = useState(new Date());
    const [newTime, setNewTime] = useState("08:00");
    const [cancelReason, setCancelReason] = useState("");
    const [overtimeReason, setOvertimeReason] = useState("");
    const [overtimeHours, setOvertimeHours] = useState("1");

    // Filter only today's work
    const todayWorkList = workList.filter((w) => w.scheduledDate === today);

    const handleReschedule = (work) => {
        setSelectedWork(work);
        const dateParts = work.scheduledDate.split("/");
        setNewDate(new Date(dateParts[2], parseInt(dateParts[1]) - 1, dateParts[0]));
        setNewTime(work.scheduledTime.split(" - ")[0]);
        setShowRescheduleModal(true);
    };

    const handleCancel = (work) => {
        setSelectedWork(work);
        setCancelReason("");
        setShowCancelModal(true);
    };

    const handleRequestOvertime = (work) => {
        setSelectedWork(work);
        setOvertimeReason("");
        setOvertimeHours("1");
        setShowOvertimeModal(true);
    };

    const handleShowDetail = (work) => {
        setSelectedWork(work);
        setShowDetailModal(true);
    };

    const confirmReschedule = () => {
        if (selectedWork) {
            setWorkList(
                workList.map((w) =>
                    w.id === selectedWork.id
                        ? {
                              ...w,
                              scheduledDate: newDate.toLocaleDateString("vi-VN"),
                              scheduledTime: `${newTime} - ${parseInt(newTime) + 3}:00`,
                              status: "pending",
                          }
                        : w
                )
            );
            toast?.success({
                title: "Cập nhật thành công",
                message: "Lịch công việc đã được thay đổi!",
                duration: 2500,
            });
            setShowRescheduleModal(false);
        }
    };

    const confirmCancel = () => {
        if (selectedWork && cancelReason.trim()) {
            setWorkList(workList.filter((w) => w.id !== selectedWork.id));
            toast?.success({
                title: "Hủy thành công",
                message: "Công việc đã được hủy!",
                duration: 2500,
            });
            setShowCancelModal(false);
        } else {
            toast?.error({
                title: "Thông tin chưa đủ",
                message: "Vui lòng nhập lý do hủy công việc!",
                duration: 2500,
            });
        }
    };

    const confirmOvertimeRequest = () => {
        if (selectedWork && overtimeReason.trim() && overtimeHours) {
            toast?.success({
                title: "Yêu cầu thành công",
                message: `Yêu cầu tăng ca ${overtimeHours} giờ đã được gửi!`,
                duration: 2500,
            });
            setShowOvertimeModal(false);
        } else {
            toast?.error({
                title: "Thông tin chưa đủ",
                message: "Vui lòng nhập đủ thông tin yêu cầu tăng ca!",
                duration: 2500,
            });
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case "in_progress":
                return "bg-blue-100 text-blue-800 border-blue-300";
            case "pending":
                return "bg-yellow-100 text-yellow-800 border-yellow-300";
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

    const getPriorityBadgeColor = (priority) => {
        switch (priority) {
            case "high":
                return "bg-red-100 text-red-800 border-red-300";
            case "medium":
                return "bg-orange-100 text-orange-800 border-orange-300";
            case "low":
                return "bg-green-100 text-green-800 border-green-300";
            default:
                return "bg-gray-100 text-gray-800 border-gray-300";
        }
    };

    const stats = {
        total: todayWorkList.length,
        pending: todayWorkList.filter((w) => w.status === "pending").length,
        inProgress: todayWorkList.filter((w) => w.status === "in_progress").length,
        completed: todayWorkList.filter((w) => w.status === "completed").length,
    };

    return (
        <Page className="bg-gray-50 min-h-screen pb-20">
            {/* Simplified Header */}
            <Box className="bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 shadow-lg px-4 pt-6 pb-4">
                <Box className="flex items-center justify-between">
                    <Text.Title className="text-white font-bold" size="large">
                        Quản Lý Công Việc Hôm Nay
                    </Text.Title>
                    <Text className="text-sm text-blue-100 font-medium">{today}</Text>
                </Box>
            </Box>

            <Box className="px-4 pt-4 pb-28">
                {/* Statistics Cards */}
                <Box className="bg-white rounded-xl shadow-sm p-4 mb-4 border border-gray-100">
                    <Box className="flex items-center justify-between mb-3">
                        <Text className="font-bold text-gray-900 flex items-center">
                            <Icon icon="zi-chart" className="mr-2 text-blue-600" size={16} />
                            Thống Kê Ngày Hôm Nay
                        </Text>
                        <Text className="text-xs text-gray-600 font-medium">{today}</Text>
                    </Box>

                    <Box className="grid grid-cols-2 gap-2 mb-2">
                        <Box className="bg-blue-50 rounded-lg p-2 border border-blue-200 text-center">
                            <Text className="text-lg font-bold text-blue-600">{stats.total}</Text>
                            <Text className="text-xs text-gray-600">Tổng công việc</Text>
                        </Box>
                        <Box className="bg-yellow-50 rounded-lg p-2 border border-yellow-200 text-center">
                            <Text className="text-lg font-bold text-yellow-600">{stats.pending}</Text>
                            <Text className="text-xs text-gray-600">Chờ thực hiện</Text>
                        </Box>
                    </Box>

                    <Box className="grid grid-cols-2 gap-2">
                        <Box className="bg-blue-100 rounded-lg p-2 border border-blue-300 text-center">
                            <Text className="text-lg font-bold text-blue-700">{stats.inProgress}</Text>
                            <Text className="text-xs text-gray-600">Đang làm</Text>
                        </Box>
                        <Box className="bg-green-50 rounded-lg p-2 border border-green-200 text-center">
                            <Text className="text-lg font-bold text-green-600">{stats.completed}</Text>
                            <Text className="text-xs text-gray-600">Hoàn thành</Text>
                        </Box>
                    </Box>
                </Box>

                {/* Work List */}
                <Box className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <Box className="p-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-blue-100">
                        <Text className="font-bold text-gray-900 flex items-center">
                            <Icon icon="zi-list-1" className="mr-2 text-blue-600" size={16} />
                            Danh Sách Công Việc Hôm Nay ({todayWorkList.length})
                        </Text>
                    </Box>

                    <Box className="divide-y divide-gray-200">
                        {todayWorkList.length > 0 ? (
                            todayWorkList.map((work, index) => (
                                <Box key={work.id} className="p-4 hover:bg-gray-50 transition-colors">
                                    {/* Work Header */}
                                    <Box className="flex items-start justify-between gap-2 mb-2">
                                        <Box className="flex-1">
                                            <Box className="flex items-center gap-2 mb-1">
                                                <Text className="font-semibold text-gray-900 line-clamp-2">
                                                    {work.title}
                                                </Text>
                                            </Box>
                                            <Text className="text-xs text-gray-600 ml-8">{work.company}</Text>
                                        </Box>
                                        <Box
                                            className={`px-2.5 py-1 rounded-full text-xs font-semibold border whitespace-nowrap flex-shrink-0 ${getStatusColor(
                                                work.status
                                            )}`}
                                        >
                                            {getStatusLabel(work.status)}
                                        </Box>
                                    </Box>

                                    {/* Service & Equipment Tags */}
                                    <Box className="flex flex-wrap gap-1 mb-2">
                                        <Box className="text-xs px-2 py-0.5 bg-gray-100 rounded text-gray-700 font-medium">
                                            {work.serviceType}
                                        </Box>
                                        <Box className="text-xs px-2 py-0.5 bg-gray-100 rounded text-gray-700 font-medium">
                                            {work.equipment}
                                        </Box>
                                        <Box
                                            className={`text-xs px-2 py-0.5 rounded font-medium border ${getPriorityBadgeColor(
                                                work.priority
                                            )}`}
                                        >
                                            {getPriorityLabel(work.priority)}
                                        </Box>
                                    </Box>

                                    {/* Time & Location */}
                                    <Box className="space-y-1 mb-2 text-sm text-gray-600">
                                        <Box className="flex items-center gap-2">
                                            <Icon icon="zi-clock-1" size={14} className="text-gray-400 flex-shrink-0" />
                                            <Text className="text-xs font-medium">{work.scheduledTime}</Text>
                                        </Box>
                                        <Box className="flex items-start gap-2">
                                            <Icon
                                                icon="zi-location"
                                                size={14}
                                                className="text-red-500 flex-shrink-0 mt-0.5"
                                            />
                                            <Text className="text-xs">{work.location}</Text>
                                        </Box>
                                        <Box className="flex items-center gap-2">
                                            <Icon icon="zi-user" size={14} className="text-gray-400 flex-shrink-0" />
                                            <Text className="text-xs">
                                                <span className="font-semibold">{work.customerName}</span> •{" "}
                                                {work.phoneNumber}
                                            </Text>
                                        </Box>
                                    </Box>

                                    {/* Notes */}
                                    {work.notes && (
                                        <Box className="p-2 bg-blue-50 rounded border border-blue-200 mb-3">
                                            <Text className="text-xs text-blue-800">
                                                <span className="font-semibold">Ghi chú:</span> {work.notes}
                                            </Text>
                                        </Box>
                                    )}

                                    {/* Action Buttons */}
                                    <Box className="flex gap-2 flex-wrap">
                                        {work.status !== "completed" && (
                                            <>
                                                <button
                                                    onClick={() => handleReschedule(work)}
                                                    className="px-3 py-2 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center gap-1 flex-1 min-w-fit"
                                                >
                                                    <Icon icon="zi-calendar" size={12} />
                                                    Thay đổi lịch
                                                </button>
                                                <button
                                                    onClick={() => handleCancel(work)}
                                                    className="px-3 py-2 bg-red-600 text-white rounded-lg text-xs font-semibold hover:bg-red-700 transition-colors flex items-center justify-center gap-1 flex-1 min-w-fit"
                                                >
                                                    <Icon icon="zi-close" size={12} />
                                                    Hủy
                                                </button>
                                            </>
                                        )}
                                        {work.status === "in_progress" && (
                                            <button
                                                onClick={() => handleRequestOvertime(work)}
                                                className="px-3 py-2 bg-orange-600 text-white rounded-lg text-xs font-semibold hover:bg-orange-700 transition-colors flex items-center justify-center gap-1 flex-1 min-w-fit"
                                            >
                                                <Icon icon="zi-upload" size={12} />
                                                Yêu cầu tăng ca
                                            </button>
                                        )}
                                        <button
                                            onClick={() => handleShowDetail(work)}
                                            className="px-3 py-2 bg-gray-200 text-gray-700 rounded-lg text-xs font-semibold hover:bg-gray-300 transition-colors flex items-center justify-center gap-1 flex-1 min-w-fit"
                                        >
                                            <Icon icon="zi-info-circle" size={12} />
                                            Chi tiết
                                        </button>
                                    </Box>
                                </Box>
                            ))
                        ) : (
                            <Box className="text-center py-12 p-4">
                                <Icon icon="zi-check-circle" className="text-gray-400 text-5xl mb-4" />
                                <Text className="text-gray-600 font-semibold">Không có công việc hôm nay</Text>
                                <Text className="text-gray-500 text-xs mt-1">
                                    Tất cả công việc đã hoàn thành hoặc được dời lịch
                                </Text>
                            </Box>
                        )}
                    </Box>
                </Box>
            </Box>

            {/* Reschedule Modal */}
            <Modal
                visible={showRescheduleModal}
                onClose={() => setShowRescheduleModal(false)}
                title="Thay đổi lịch công việc"
            >
                <Box className="p-0 space-y-4">
                    {selectedWork && (
                        <>
                            <Box className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                                <Text className="text-xs text-blue-700 mb-1 font-semibold">Công việc:</Text>
                                <Text className="font-semibold text-gray-900 text-sm">{selectedWork.title}</Text>
                            </Box>

                            <Box>
                                <Text className="text-sm font-semibold text-gray-700 mb-2">Chọn ngày mới:</Text>
                                <DatePicker
                                    value={newDate}
                                    onChange={setNewDate}
                                    className="w-full"
                                    dateFormat="dd/mm/yyyy"
                                />
                            </Box>

                            <Box>
                                <Text className="text-sm font-semibold text-gray-700 mb-2">Chọn giờ bắt đầu:</Text>
                                <Input
                                    type="time"
                                    value={newTime}
                                    onChange={(e) => setNewTime(e.target.value)}
                                    className="w-full rounded-lg"
                                />
                            </Box>

                            <Box className="flex gap-2">
                                <button
                                    onClick={() => setShowRescheduleModal(false)}
                                    className="flex-1 px-3 py-2 bg-gray-200 text-gray-800 rounded-lg font-semibold hover:bg-gray-300 transition-colors text-sm"
                                >
                                    Hủy
                                </button>
                                <button
                                    onClick={confirmReschedule}
                                    className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors text-sm"
                                >
                                    Xác nhận
                                </button>
                            </Box>
                        </>
                    )}
                </Box>
            </Modal>

            {/* Cancel Modal */}
            <Modal visible={showCancelModal} onClose={() => setShowCancelModal(false)} title="Hủy công việc">
                <Box className="p-0 space-y-4">
                    {selectedWork && (
                        <>
                            <Box className="bg-red-50 rounded-lg p-3 border border-red-200">
                                <Text className="text-xs text-red-900 font-semibold mb-1">Xác nhận hủy công việc</Text>
                                <Text className="font-semibold text-gray-900 text-sm">{selectedWork.title}</Text>
                            </Box>

                            <Box>
                                <Text className="text-sm font-semibold text-gray-700 mb-2">Lý do hủy công việc:</Text>
                                <Input
                                    placeholder="Nhập lý do hủy..."
                                    value={cancelReason}
                                    onChange={(e) => setCancelReason(e.target.value)}
                                    className="w-full rounded-lg border-gray-300"
                                    rows={3}
                                />
                            </Box>

                            <Box className="flex gap-2">
                                <button
                                    onClick={() => setShowCancelModal(false)}
                                    className="flex-1 px-3 py-2 bg-gray-200 text-gray-800 rounded-lg font-semibold hover:bg-gray-300 transition-colors text-sm"
                                >
                                    Quay lại
                                </button>
                                <button
                                    onClick={confirmCancel}
                                    className="flex-1 px-3 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors text-sm"
                                >
                                    Xác nhận hủy
                                </button>
                            </Box>
                        </>
                    )}
                </Box>
            </Modal>

            {/* Overtime Request Modal */}
            <Modal visible={showOvertimeModal} onClose={() => setShowOvertimeModal(false)} title="Yêu cầu tăng ca">
                <Box className="p-0 space-y-4">
                    {selectedWork && (
                        <>
                            <Box className="bg-orange-50 rounded-lg p-3 border border-orange-200">
                                <Text className="text-xs text-orange-700 font-semibold mb-1">Công việc:</Text>
                                <Text className="font-semibold text-gray-900 text-sm">{selectedWork.title}</Text>
                                <Text className="text-xs text-gray-600 mt-1">
                                    Thời gian: {selectedWork.scheduledTime}
                                </Text>
                            </Box>

                            <Box>
                                <Text className="text-sm font-semibold text-gray-700 mb-2">
                                    Số giờ tăng ca yêu cầu:
                                </Text>
                                <Input
                                    type="number"
                                    min="0.5"
                                    step="0.5"
                                    value={overtimeHours}
                                    onChange={(e) => setOvertimeHours(e.target.value)}
                                    className="w-full rounded-lg"
                                    placeholder="Ví dụ: 1, 1.5, 2..."
                                />
                            </Box>

                            <Box>
                                <Text className="text-sm font-semibold text-gray-700 mb-2">Lý do yêu cầu tăng ca:</Text>
                                <Input
                                    placeholder="Nhập lý do tăng ca..."
                                    value={overtimeReason}
                                    onChange={(e) => setOvertimeReason(e.target.value)}
                                    className="w-full rounded-lg border-gray-300"
                                    rows={3}
                                />
                            </Box>

                            <Box className="flex gap-2">
                                <button
                                    onClick={() => setShowOvertimeModal(false)}
                                    className="flex-1 px-3 py-2 bg-gray-200 text-gray-800 rounded-lg font-semibold hover:bg-gray-300 transition-colors text-sm"
                                >
                                    Hủy
                                </button>
                                <button
                                    onClick={confirmOvertimeRequest}
                                    className="flex-1 px-3 py-2 bg-orange-600 text-white rounded-lg font-semibold hover:bg-orange-700 transition-colors text-sm"
                                >
                                    Gửi yêu cầu
                                </button>
                            </Box>
                        </>
                    )}
                </Box>
            </Modal>

            {/* Work Detail Modal - Use Component */}
            <WorkDetailModal visible={showDetailModal} onClose={() => setShowDetailModal(false)} work={selectedWork} />

            <BottomNavigation />
        </Page>
    );
}

export default WorkManagement;
