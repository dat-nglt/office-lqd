import { Box, Text, Icon } from "zmp-ui";

function LocationStatus({ currentLocation }) {
  return (
    <Box className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
      <Text className="font-bold text-gray-900 mb-3 flex items-center capitalize">Vị trí hiện tại</Text>

      {currentLocation ? (
        <Box className="space-y-2">
          <Box className="flex justify-between items-center p-2 bg-blue-50 rounded-lg">
            <Text className="text-sm text-gray-600">Địa chỉ:</Text>
            <Text className="text-xs text-blue-700">{currentLocation.placeName || "Đang tải..."}</Text>
          </Box>

          <Box className="flex justify-between items-center p-2 bg-blue-50 rounded-lg">
            <Text className="text-sm text-gray-600">Tọa độ:</Text>
            <Text className="text-xs text-blue-700">
              {currentLocation.latitude.toFixed(4)}, {currentLocation.longitude.toFixed(4)}
            </Text>
          </Box>
          <Box className="flex justify-between items-center p-2 bg-purple-50 rounded-lg">
            <Text className="text-sm text-gray-600">Bán kính cho phép chênh lệch:</Text>
            <Text className="text-xs font-semibold text-purple-700">
              ±{currentLocation.accuracy?.toFixed(0) || "N/A"}m
            </Text>
          </Box>
        </Box>
      ) : (
        <Text className="text-sm text-gray-600">Nhấn nút dưới để lấy vị trí</Text>
      )}
    </Box>
  );
}

export default LocationStatus;
