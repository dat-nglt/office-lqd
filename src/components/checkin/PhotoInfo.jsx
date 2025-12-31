import { Box, Text, Icon } from "zmp-ui";
import { formatDistance } from "../../utils/helpers";

function PhotoInfo({
  capturedPhoto,
  selectedAttendanceMode,
  selectedCheckInLocation: selectedAttendanceLocation,
  currentLocation,
  locationViolation,
  violationDistance,
  notes,
  onNotesChange,
}) {
  if (!capturedPhoto) return null;

  return (
    <Box className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 mb-4">
      <Box className="flex items-center justify-between mb-3">
        <Text className="font-bold text-gray-900">Thông Tin Chấm Công</Text>
        {locationViolation && (
          <Box className="flex items-center gap-1 bg-red-100 text-red-700 px-2 py-1 rounded text-xs font-semibold">
            VI PHẠM
          </Box>
        )}
      </Box>
      <Box className="space-y-2">
        <Box className="flex justify-between items-center p-2 bg-gray-50 rounded-lg">
          <Text className="text-xs text-gray-600 min-w-[100px] ">Thời gian:</Text>
          <Text className="text-xs font-semibold text-blue-600 text-right">
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
          <Text className="text-xs text-gray-600 min-w-[100px] ">Loại:</Text>
          <Text className="text-xs font-semibold text-blue-600 text-right">
            {selectedAttendanceMode === "in" ? "Chấm Công Vào" : "Chấm Công Ra"}
          </Text>
        </Box>
        <Box className="flex justify-between items-center p-2 bg-gray-50 rounded-lg">
          <Text className="text-xs text-gray-600 min-w-[100px] ">Địa điểm:</Text>
          <Text className="text-xs font-semibold text-blue-600 text-right">{selectedAttendanceLocation?.address}</Text>
        </Box>
        <Box className="flex justify-between items-center p-2 bg-gray-50 rounded-lg">
          <Text className="text-xs text-gray-600 min-w-[100px] ">Tọa độ:</Text>
          <Text className="text-xs font-semibold text-blue-600 text-right">
            {currentLocation.latitude.toFixed(4)}, {currentLocation.longitude.toFixed(4)}
          </Text>
        </Box>
        {locationViolation && (
          <Box className="flex justify-between items-center p-2 bg-red-50 rounded-lg border border-red-200">
            <Text className="text-sm text-red-700 font-semibold">Khoảng cách:</Text>
            <Text className="text-sm font-semibold text-red-700">{formatDistance(violationDistance)}</Text>
          </Box>
        )}
        <Box className="mt-4">
          <textarea
            value={notes}
            onChange={(e) => onNotesChange(e.target.value)}
            placeholder="Nhập ghi chú về chấm công (nếu cần)..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 resize-none"
            rows="3"
            maxLength="500"
          />
          <Text className="text-xs text-gray-500 mt-1 text-right">{notes.length}/500</Text>
        </Box>
      </Box>
    </Box>
  );
}

export default PhotoInfo;
