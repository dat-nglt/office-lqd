import { Box, Text, Icon, Button } from "zmp-ui";

function WorkCard({ work, onViewDetail }) {
    const getStatusColor = (status) => {
        switch (status) {
            case "completed":
                return "bg-green-100 text-green-700";
            case "in_progress":
                return "bg-yellow-100 text-yellow-700";
            case "pending":
                return "bg-red-100 text-red-700";
            case "scheduled":
                return "bg-blue-100 text-blue-700";
            default:
                return "bg-gray-100 text-gray-700";
        }
    };

    const getPriorityColor = (priority) => {
        switch (priority) {
            case "high":
                return "bg-red-500";
            case "medium":
                return "bg-yellow-500";
            case "low":
                return "bg-green-500";
            default:
                return "bg-gray-500";
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

    const getStatusLabel = (status) => {
        switch (status) {
            case "completed":
                return "Hoàn thành";
            case "in_progress":
                return "Đang thực hiện";
            case "pending":
                return "Chờ thực hiện";
            case "scheduled":
                return "Lên lịch";
            default:
                return "Không xác định";
        }
    };

    // Get technicians - show primary first, then count additional
    const technicians = work.technicians || [];
    const primaryTechnician = technicians.length > 0 ? technicians[0] : null;
    const additionalCount = technicians.length - 1;

    const handleCallTechnician = (phone) => {
        if (!phone) return;
        window.location.href = `tel:${phone}`;
    };

    const handleCallCustomer = (phone) => {
        if (!phone) return;
        window.location.href = `tel:${phone}`;
    };

    return (
        <Box className="bg-white rounded-lg shadow-sm p-4 border border-gray-200 hover:shadow-md transition-shadow">
            {/* Header */}
            <Box className="flex justify-between items-start mb-3">
                <Box className="flex-1">
                    <Text className="font-semibold text-gray-900 line-clamp-2">{work.workName || work.title}</Text>
                    <Text className="text-sm text-gray-600 mt-0.5">{work.company}</Text>
                </Box>
                <Box
                    className={`px-2 py-1 rounded text-xs font-medium whitespace-nowrap ml-2 flex-shrink-0 ${getStatusColor(
                        work.status
                    )}`}
                >
                    {getStatusLabel(work.status)}
                </Box>
            </Box>

            {/* Service & Equipment Tags */}
            {(work.service || work.serviceType || work.equipment) && (
                <Box className="flex flex-wrap gap-1 mb-3">
                    {(work.service || work.serviceType) && (
                        <Box className="text-xs px-2 py-0.5 bg-gray-100 rounded text-gray-700 font-medium">
                            {work.service || work.serviceType}
                        </Box>
                    )}
                    {work.equipment && (
                        <Box className="text-xs px-2 py-0.5 bg-gray-100 rounded text-gray-700 font-medium">
                            <Icon icon="zi-tools" size={10} className="mr-0.5 inline" />
                            {work.equipment}
                        </Box>
                    )}
                </Box>
            )}

            {/* Progress Bar */}
            {work.progress !== undefined && (
                <Box className="mb-3">
                    <Box className="flex justify-between items-center mb-1">
                        <Text className="text-xs text-gray-600">Tiến độ</Text>
                        <Text className="text-xs font-medium text-gray-700">{work.progress}%</Text>
                    </Box>
                    <Box className="w-full bg-gray-200 rounded-full h-2">
                        <Box
                            className="bg-blue-600 h-2 rounded-full transition-all"
                            style={{ width: `${work.progress}%` }}
                        />
                    </Box>
                </Box>
            )}

            {/* Technicians - Compact View */}
            {primaryTechnician && (
                <Box className="mb-3">
                    <Box className="flex items-center justify-between mb-1">
                        <Text className="text-xs text-gray-600 font-medium">
                            Kỹ thuật viên
                            {additionalCount > 0 && (
                                <span className="ml-1 text-blue-600 font-semibold">+{additionalCount}</span>
                            )}
                        </Text>
                    </Box>
                    <Box className="p-2 bg-blue-50 rounded-lg border border-blue-200">
                        <Box className="flex items-center justify-between">
                            <Box className="flex-1 min-w-0">
                                <Text className="text-sm text-gray-900 font-semibold line-clamp-1">
                                    {primaryTechnician.name}
                                </Text>
                                <Text className="text-xs text-gray-600 line-clamp-1">
                                    {primaryTechnician.specialization}
                                </Text>
                            </Box>
                            <button
                                onClick={() => handleCallTechnician(primaryTechnician.phone)}
                                className="ml-2 p-1.5 text-blue-600 hover:text-blue-800 hover:bg-blue-100 rounded transition-colors flex-shrink-0"
                                title={`Gọi ${primaryTechnician.name}`}
                            >
                                <Icon icon="zi-call" size={16} />
                            </button>
                        </Box>
                    </Box>
                    {additionalCount > 0 && (
                        <Text className="text-xs text-gray-600 mt-1.5 px-1">
                            Và <span className="font-semibold">{additionalCount}</span> kỹ thuật viên khác - Xem chi
                            tiết để xem đầy đủ
                        </Text>
                    )}
                </Box>
            )}

            {/* Schedule & Info Section */}
            <Box className="space-y-2 mb-3 py-2 border-t border-gray-100">
                {/* Date & Priority */}
                <Box className="flex items-center justify-between">
                    <Box className="flex items-center space-x-2 text-sm text-gray-600 flex-1">
                        <Icon icon="zi-calendar" className="text-gray-400 flex-shrink-0" size={14} />
                        <Text className="truncate">{work.scheduledDate || work.date || "N/A"}</Text>
                    </Box>
                    {work.priority && (
                        <Box className="flex items-center gap-1.5 ml-2 flex-shrink-0">
                            <Box className={`w-2 h-2 rounded-full ${getPriorityColor(work.priority)}`}></Box>
                            <Text className="text-xs font-medium text-gray-700">{getPriorityLabel(work.priority)}</Text>
                        </Box>
                    )}
                </Box>

                {/* Time */}
                {work.scheduledTime && (
                    <Box className="flex items-center space-x-2 text-sm text-gray-600">
                        <Icon icon="zi-clock-1" className="text-gray-400 flex-shrink-0" size={14} />
                        <Text className="truncate">{work.scheduledTime}</Text>
                    </Box>
                )}

                {/* Customer */}
                {work.customerName && (
                    <Box className="flex items-center space-x-2 text-sm text-gray-600">
                        <Icon icon="zi-user" className="text-gray-400 flex-shrink-0" size={14} />
                        <Text
                            className="truncate cursor-pointer hover:text-blue-600 font-medium"
                            onClick={() => handleCallCustomer(work.phoneNumber)}
                            title={work.phoneNumber}
                        >
                            {work.customerName}
                        </Text>
                    </Box>
                )}

                {/* Location */}
                {(work.location || work.address) && (
                    <Box className="flex items-start space-x-2 text-sm text-gray-600">
                        <Icon icon="zi-location" className="text-red-500 flex-shrink-0 mt-0.5" size={14} />
                        <Text className="truncate text-xs">{work.location || work.address}</Text>
                    </Box>
                )}
            </Box>

            {/* Notes */}
            {work.notes && (
                <Box className="mb-3 p-2 bg-blue-50 rounded border border-blue-200">
                    <Text className="text-xs text-blue-800">
                        <span className="font-semibold">Ghi chú:</span> {work.notes}
                    </Text>
                </Box>
            )}

            {/* Action Button */}
            <Button
                size="small"
                fullWidth
                className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold"
                onClick={() => onViewDetail(work)}
            >
                <Icon icon="zi-info-circle" className="mr-1" size={14} />
                Chi tiết
            </Button>
        </Box>
    );
}

export default WorkCard;
