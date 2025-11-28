import { Box, Text, Icon, Button } from "zmp-ui";

function WorkCard({ work, onViewDetail, getStatusColor, getStatusLabel }) {
    const getPriorityColor = (priority) => {
        switch (priority) {
            case "high":
                return "bg-red-100 text-red-800";
            case "medium":
                return "bg-yellow-100 text-yellow-800";
            case "low":
                return "bg-green-100 text-green-800";
            default:
                return "bg-gray-100 text-gray-800";
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
                return "Không xác định";
        }
    };

    const handleStartWork = () => {
        // TODO: Implement start work logic
        console.log("Start work:", work.id);
    };

    const handleProgressReport = () => {
        // TODO: Implement progress report logic
        console.log("Progress report:", work.id);
    };

    return (
        <Box className="p-4 hover:bg-gray-50 transition-colors bg-white rounded-lg border border-gray-200 shadow-sm">
            {/* Job Header */}
            <Box className="flex items-start justify-between gap-2 mb-2">
                <Box className="flex-1">
                    <Box className="flex items-center gap-2 mb-1">
                        <Text className="font-semibold text-gray-900 line-clamp-2">
                            {work.title}
                        </Text>
                    </Box>
                    <Text className="text-xs text-gray-600">{work.company}</Text>
                </Box>
                <Box
                    className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${getStatusColor(
                        work.status
                    )}`}
                >
                    {getStatusLabel(work.status)}
                </Box>
            </Box>

            {/* Service & Equipment Info */}
            <Box className="mb-2">
                <Box className="flex flex-wrap gap-2 mb-2">
                    <Box className="text-xs px-2 py-1 bg-gray-100 rounded text-gray-700 font-medium">
                        <Icon icon="zi-tools" size={10} className="mr-0.5 inline" />
                        {work.service}
                    </Box>
                    <Box className="text-xs px-2 py-1 bg-gray-100 rounded text-gray-700 font-medium">
                        <Icon icon="zi-setting" size={10} className="mr-0.5 inline" />
                        {work.workType === "service" ? "Dịch vụ" : "Dự án"}
                    </Box>
                    <Box
                        className={`text-xs px-2 py-1 rounded font-medium ${getPriorityColor(
                            work.priority
                        )}`}
                    >
                        Ưu tiên: {getPriorityLabel(work.priority)}
                    </Box>
                </Box>
            </Box>

            {/* Scheduled Time */}
            <Box className="mb-2 flex items-center gap-2">
                <Icon icon="zi-clock-1" className="text-gray-400" size={14} />
                <Text className="text-sm font-semibold text-gray-700">
                    {work.scheduledTime}
                </Text>
            </Box>

            {/* Location */}
            <Box className="mb-2 flex items-start gap-2">
                <Icon
                    icon="zi-location"
                    className="text-red-500 mt-0.5 flex-shrink-0"
                    size={14}
                />
                <Text className="text-xs text-gray-600">{work.location}</Text>
            </Box>

            {/* Customer Info */}
            <Box className="mb-2 flex items-center gap-2">
                <Icon icon="zi-user" className="text-gray-400" size={14} />
                <Text className="text-xs text-gray-600">
                    <span className="font-semibold">{work.customerName}</span> •{" "}
                    {work.phoneNumber}
                </Text>
            </Box>

            {/* Notes */}
            {work.notes && (
                <Box className="p-2 bg-blue-50 rounded border border-blue-200 mb-2">
                    <Text className="text-xs text-blue-800">
                        <span className="font-semibold">Ghi chú:</span> {work.notes}
                    </Text>
                </Box>
            )}

            {/* Action Buttons */}
            <Box className="flex gap-2 mt-3">
                {work.status === "pending" && (
                    <Button
                        size="small"
                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs"
                        onClick={handleStartWork}
                    >
                        <Icon icon="zi-play-circle" size={12} className="mr-1" />
                        Bắt đầu
                    </Button>
                )}
                {work.status === "in_progress" && (
                    <Button
                        size="small"
                        className="flex-1 bg-orange-600 hover:bg-orange-700 text-white rounded text-xs"
                        onClick={handleProgressReport}
                    >
                        <Icon icon="zi-camera" size={12} className="mr-1" />
                        Báo cáo tiến độ
                    </Button>
                )}
                {work.status === "completed" && (
                    <Button
                        size="small"
                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs"
                        disabled
                    >
                        <Icon icon="zi-check-circle" size={12} className="mr-1" />
                        Hoàn thành
                    </Button>
                )}
                <Button
                    size="small"
                    className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded text-xs"
                    onClick={() => onViewDetail(work)}
                >
                    <Icon icon="zi-info-circle" size={12} className="mr-1" />
                    Chi tiết
                </Button>
            </Box>
        </Box>
    );
}

export default WorkCard;
