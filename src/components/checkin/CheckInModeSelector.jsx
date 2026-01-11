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
    <Box className="mt-8 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <Box className="p-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-blue-100">
        <Box className="flex items-center justify-between ">
          <Text className="font-bold text-gray-900 flex items-center capitalize ">Lựa Chọn Địa Điểm Chấm Công</Text>
        </Box>
      </Box>

      <Box className="space-y-2 p-4">
        <button
          onClick={() => onSelectMode("in")}
          className={`w-full p-3 rounded-lg border-2 transition-all text-left ${
            selectedAttendanceMode === "in"
              ? "border-blue-600 bg-blue-50"
              : "border-gray-200 bg-white hover:border-blue-300"
          }`}
        >
          <Box className="flex items-center space-x-3">
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
            <Box>
              <Text className={canCheckOut() ? "font-semibold text-blue-700" : "font-semibold text-gray-400"}>
                Chấm Công Ra
              </Text>
              <Text className="text-xs text-gray-600">
                {canCheckOut()
                  ? `Kết thúc công việc tại ${selectedAttendanceLocation.address}`
                  : "Không được chấm công ra tại Kho & Văn phòng. Chỉ có thể chấm công ra tại công việc được giao"}
              </Text>
            </Box>
          </Box>
        </button>
      </Box>
    </Box>
  );
}

export default CheckInModeSelector;
