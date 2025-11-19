import { Box, Text, Icon, Button } from "zmp-ui";

function WorkCard({ work, onViewDetail }) {
    const getStatusColor = (status) => {
        switch (status) {
            case "completed":
                return "bg-green-100 text-green-800 border-green-300";
            case "in_progress":
                return "bg-blue-100 text-blue-800 border-blue-300";
            case "pending":
                return "bg-yellow-100 text-yellow-800 border-yellow-300";
            case "scheduled":
                return "bg-purple-100 text-purple-800 border-purple-300";
            default:
                return "bg-gray-100 text-gray-800 border-gray-300";
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

    const getPriorityColor = (priority) => {
        switch (priority) {
            case "high":
                return "bg-red-500 border-red-600";
            case "medium":
                return "bg-orange-500 border-orange-600";
            case "low":
                return "bg-green-500 border-green-600";
            default:
                return "bg-gray-500 border-gray-600";
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

    const handleCallCustomer = (phone) => {
        if (!phone) return;
        window.location.href = `tel:${phone}`;
    };

    return (
        <Box className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
            {/* Header */}
            <Box className="flex justify-between items-start gap-2 p-4 mb-2 border-b border-gray-100">
                <Box className="flex-1">
                    <Text className="font-semibold text-gray-900 line-clamp-2">{work.workName}</Text>
                    <Text className="text-xs text-gray-600 mt-0.5">{work.company}</Text>
                </Box>
                <Box
                    className={`px-2.5 py-1 rounded-full text-xs font-semibold border whitespace-nowrap flex-shrink-0 ${getStatusColor(
                        work.status
                    )}`}
                >
                    {getStatusLabel(work.status)}
                </Box>
            </Box>

            <Box className="px-4 pb-4 space-y-3">
                {/* Service & Equipment Tags */}
                <Box className="flex flex-wrap gap-1.5">
                    {work.service && (
                        <Box className="text-xs px-2 py-0.5 bg-gray-100 rounded text-gray-700 font-medium">
                            {work.service}
                        </Box>
                    )}
                    {work.serviceType && (
                        <Box className="text-xs px-2 py-0.5 bg-gray-100 rounded text-gray-700 font-medium">
                            {work.serviceType}
                        </Box>
                    )}
                    {(work.equipment) && (
                        <Box className="text-xs px-2 py-0.5 bg-gray-100 rounded text-gray-700 font-medium">
                            <Icon icon="zi-tools" size={10} className="mr-0.5 inline" />
                            {work.equipment}
                        </Box>
                    )}
                    <Box
                        className={`text-xs px-2 py-0.5 rounded border font-medium border-current ${
                            work.priority === "high"
                                ? "bg-red-50 text-red-800 border-red-300"
                                : work.priority === "medium"
                                ? "bg-orange-50 text-orange-800 border-orange-300"
                                : "bg-green-50 text-green-800 border-green-300"
                        }`}
                    >
                        <Box className={`w-2 h-2 rounded-full ${getPriorityColor(work.priority)} inline-block mr-1`}></Box>
                        {getPriorityLabel(work.priority)}
                    </Box>
                </Box>

                {/* Progress Bar */}
                {work.progress !== undefined && (
                    <Box className="bg-gray-50 rounded-lg p-2 border border-gray-200">
                        <Box className="flex justify-between items-center mb-1">
                            <Text className="text-xs text-gray-600 font-medium">Tiến độ</Text>
                            <Text className="text-xs font-bold text-blue-600">{work.progress}%</Text>
                        </Box>
                        <Box className="w-full bg-gray-300 rounded-full h-2">
                            <Box
                                className="bg-blue-600 h-2 rounded-full transition-all"
                                style={{ width: `${work.progress}%` }}
                            />
                        </Box>
                    </Box>
                )}

                {/* Schedule Info */}
                <Box className="space-y-1.5 p-2.5 bg-gray-50 rounded-lg border border-gray-200">
                    {(work.scheduledDate || work.date) && (
                        <Box className="flex items-center gap-2 text-xs">
                            <Icon icon="zi-calendar" className="text-gray-400 flex-shrink-0" size={14} />
                            <Text className="text-gray-700 font-medium">{work.scheduledDate || work.date}</Text>
                            {work.scheduledTime && (
                                <>
                                    <Icon icon="zi-clock-1" className="text-gray-400 flex-shrink-0" size={14} />
                                    <Text className="text-gray-700 font-medium">{work.scheduledTime}</Text>
                                </>
                            )}
                        </Box>
                    )}
                    {(work.location || work.address) && (
                        <Box className="flex items-start gap-2">
                            <Icon icon="zi-location" className="text-red-500 mt-0.5 flex-shrink-0" size={14} />
                            <Text className="text-xs text-gray-600 flex-1">{work.location || work.address}</Text>
                        </Box>
                    )}
                </Box>

                {/* Technicians */}
                {work.technicians && work.technicians.length > 0 && (
                    <Box className="bg-blue-50 rounded-lg p-2 border border-blue-200">
                        <Text className="text-xs text-blue-700 font-semibold mb-1.5">
                            Kỹ thuật viên cộng tác ({work.technicians.length})
                        </Text>
                        <Box className="space-y-1">
                            {work.technicians.slice(0, 2).map((tech, index) => (
                                <Box key={index} className="flex items-center justify-between">
                                    <Box className="flex-1 min-w-0">
                                        <Text className="text-xs text-gray-800 font-medium">{tech.name}</Text>
                                        <Text className="text-xs text-gray-600">{tech.specialization}</Text>
                                    </Box>
                                    <button
                                        onClick={() => handleCallCustomer(tech.phone)}
                                        className="ml-2 p-1 text-blue-600 hover:bg-blue-100 rounded transition-colors flex-shrink-0"
                                        title={`Gọi ${tech.name}`}
                                    >
                                        <Icon icon="zi-call" size={14} />
                                    </button>
                                </Box>
                            ))}
                            {work.technicians.length > 2 && (
                                <Text className="text-xs text-gray-600 text-center py-1">
                                    +{work.technicians.length - 2} KTV khác
                                </Text>
                            )}
                        </Box>
                    </Box>
                )}

                {/* Customer Info */}
                {(work.customerName || work.phoneNumber) && (
                    <Box className="bg-purple-50 rounded-lg p-2.5 border border-purple-200">
                        <Box className="flex items-center justify-between">
                            <Box className="flex-1 min-w-0">
                                {work.customerName && (
                                    <Box>
                                        <Text className="text-xs text-purple-700 font-semibold mb-0.5">Khách hàng</Text>
                                        <Text className="text-xs text-gray-800 font-medium">{work.customerName}</Text>
                                    </Box>
                                )}
                                {work.phoneNumber && (
                                    <Text className="text-xs text-gray-600 mt-1">{work.phoneNumber}</Text>
                                )}
                            </Box>
                            {work.phoneNumber && (
                                <button
                                    onClick={() => handleCallCustomer(work.phoneNumber)}
                                    className="ml-2 p-1.5 text-purple-600 hover:bg-purple-100 rounded transition-colors flex-shrink-0"
                                    title="Gọi khách hàng"
                                >
                                    <Icon icon="zi-call" size={16} />
                                </button>
                            )}
                        </Box>
                    </Box>
                )}

                {/* Notes */}
                {work.notes && (
                    <Box className="bg-yellow-50 rounded-lg p-2 border border-yellow-200">
                        <Text className="text-xs text-yellow-800">
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
        </Box>
    );
}

export default WorkCard;
