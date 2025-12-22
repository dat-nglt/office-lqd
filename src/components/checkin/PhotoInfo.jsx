import { Box, Text, Icon } from "zmp-ui";

function PhotoInfo({
    capturedPhoto,
    selectedCheckInMode,
    selectedCheckInLocation,
    currentLocation,
    locationViolation,
    violationDistance,
}) {
    if (!capturedPhoto) return null;

    return (
        <Box className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 mb-4">
            <Box className="flex items-center justify-between mb-3">
                <Text className="font-bold text-gray-900">Thông Tin Chấm Công</Text>
                {locationViolation && (
                    <Box className="flex items-center gap-1 bg-red-100 text-red-700 px-2 py-1 rounded text-xs font-semibold">
                        <Icon icon="zi-alert" size={14} />
                        VI PHẠM
                    </Box>
                )}
            </Box>
            <Box className="space-y-2">
                <Box className="flex justify-between items-center p-2 bg-gray-50 rounded-lg">
                    <Text className="text-sm text-gray-600">Thời gian:</Text>
                    <Text className="text-sm font-semibold text-gray-900">
                        {new Date().toLocaleTimeString("vi-VN", {
                            hour: "2-digit",
                            minute: "2-digit",
                            second: "2-digit",
                        })}
                        {" - "}
                        {new Date().toLocaleDateString("vi-VN")}
                    </Text>
                </Box>
                <Box className="flex justify-between items-center p-2 bg-gray-50 rounded-lg">
                    <Text className="text-sm text-gray-600">Loại:</Text>
                    <Text className="text-sm font-semibold text-blue-600">
                        {selectedCheckInMode === "in" ? "Chấm Công Vào" : "Chấm Công Ra"}
                    </Text>
                </Box>
                <Box className="flex justify-between items-center p-2 bg-gray-50 rounded-lg">
                    <Text className="text-sm text-gray-600">Địa điểm:</Text>
                    <Text className="text-sm font-semibold text-gray-900">{selectedCheckInLocation?.name}</Text>
                </Box>
                <Box className="flex justify-between items-center p-2 bg-gray-50 rounded-lg">
                    <Text className="text-sm text-gray-600">Tọa độ:</Text>
                    <Text className="text-xs font-mono text-gray-900">
                        {currentLocation.latitude.toFixed(4)}, {currentLocation.longitude.toFixed(4)}
                    </Text>
                </Box>
                {locationViolation && (
                    <Box className="flex justify-between items-center p-2 bg-red-50 rounded-lg border border-red-200">
                        <Text className="text-sm text-red-700 font-semibold">Khoảng cách:</Text>
                        <Text className="text-sm font-semibold text-red-700">{violationDistance || 0}m</Text>
                    </Box>
                )}
            </Box>
        </Box>
    );
}

export default PhotoInfo;
