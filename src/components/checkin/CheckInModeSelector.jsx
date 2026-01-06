import { Box, Text, Icon } from "zmp-ui";

function CheckInModeSelector({
  selectedCheckInLocation: selectedAttendanceLocation,
  currentLocation,
  selectedAttendanceType,
  selectedAttendanceMode,
  onSelectMode,
  canCheckOut,
}) {
  if (!selectedAttendanceLocation || !currentLocation || !selectedAttendanceType) return null;

  return (
    <Box className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
      <Text className="font-bold text-gray-900 mb-3 flex items-center capitalize">Lựa chọn trạng thái chấm công</Text>

      <Box className="space-y-2">
        <button
          onClick={() => onSelectMode("in")}
          className={`w-full p-3 rounded-lg border-2 transition-all text-left ${
            selectedAttendanceMode === "in"
              ? "border-blue-600 bg-blue-50"
              : "border-gray-200 bg-white hover:border-blue-300"
          }`}
        >
          <Box className="flex items-center space-x-3">
            <Icon icon="zi-arrow-right" className="text-blue-600" size={20} />
            <Box>
              <Text className="font-semibold text-blue-700">Chấm Công Vào</Text>
              <Text className="text-xs text-gray-600">Bắt đầu công việc tại {selectedAttendanceLocation.address}</Text>
            </Box>
          </Box>
        </button>

        <button
          onClick={() => onSelectMode("out")}
          disabled={!canCheckOut()}
          className={`w-full p-3 rounded-lg border-2 transition-all text-left ${
            selectedAttendanceMode === "out"
              ? "border-blue-600 bg-blue-50"
              : canCheckOut()
              ? "border-gray-200 bg-white hover:border-blue-300"
              : "border-gray-200 bg-gray-100 cursor-not-allowed opacity-50"
          }`}
        >
          <Box className="flex items-center space-x-3">
            <Icon icon="zi-arrow-left" className={canCheckOut() ? "text-blue-600" : "text-gray-400"} size={20} />
            <Box>
              <Text className={canCheckOut() ? "font-semibold text-blue-700" : "font-semibold text-gray-400"}>
                Chấm Công Ra
              </Text>
              <Text className="text-xs text-gray-600">
                {canCheckOut() ? `Kết thúc công việc tại ${selectedAttendanceLocation.address}` : "Không được chấm công ra tại Kho & Văn phòng. Chỉ có thể chấm công ra tại công việc được giao"}
              </Text>
            </Box>
          </Box>
        </button>
      </Box>
    </Box>
  );
}

export default CheckInModeSelector;
