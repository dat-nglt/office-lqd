import { Box, Text, Icon } from "zmp-ui";

function CheckInModeSelector({
    selectedCheckInLocation,
    currentLocation,
    selectedCheckInType,
    selectedCheckInMode,
    onSelectMode,
    canCheckOut,
}) {
    if (!selectedCheckInLocation || !currentLocation || !selectedCheckInType) return null;

    return (
        <Box className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <Text className="font-bold text-gray-900 mb-3 flex items-center">Chọn loại chấm công</Text>

            <Box className="space-y-2">
                <button
                    onClick={() => onSelectMode("in")}
                    className={`w-full p-3 rounded-lg border-2 transition-all text-left ${
                        selectedCheckInMode === "in"
                            ? "border-blue-600 bg-blue-50"
                            : "border-gray-200 bg-white hover:border-blue-300"
                    }`}
                >
                    <Box className="flex items-center space-x-3">
                        <Icon icon="zi-arrow-right" className="text-blue-600" size={20} />
                        <Box>
                            <Text className="font-semibold text-gray-900">Chấm Vào</Text>
                            <Text className="text-xs text-gray-600">
                                Bắt đầu công việc tại {selectedCheckInLocation.name}
                            </Text>
                        </Box>
                    </Box>
                </button>

                <button
                    onClick={() => onSelectMode("out")}
                    disabled={!canCheckOut()}
                    className={`w-full p-3 rounded-lg border-2 transition-all text-left ${
                        selectedCheckInMode === "out"
                            ? "border-purple-600 bg-purple-50"
                            : canCheckOut()
                            ? "border-gray-200 bg-white hover:border-purple-300"
                            : "border-gray-200 bg-gray-100 cursor-not-allowed opacity-50"
                    }`}
                >
                    <Box className="flex items-center space-x-3">
                        <Icon
                            icon="zi-arrow-left"
                            className={canCheckOut() ? "text-purple-600" : "text-gray-400"}
                            size={20}
                        />
                        <Box>
                            <Text
                                className={
                                    canCheckOut() ? "font-semibold text-gray-900" : "font-semibold text-gray-500"
                                }
                            >
                                Chấm Ra
                            </Text>
                            <Text className="text-xs text-gray-600">
                                {canCheckOut()
                                    ? `Kết thúc công việc tại ${selectedCheckInLocation.name}`
                                    : "Phải chấm vào trước"}
                            </Text>
                        </Box>
                    </Box>
                </button>
            </Box>
        </Box>
    );
}

export default CheckInModeSelector;
