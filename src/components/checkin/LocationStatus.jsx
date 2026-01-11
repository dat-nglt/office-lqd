import { Box, Text, Icon } from "zmp-ui";
import GetLocationButton from "./GetLocationButton";

function LocationStatus({ currentLocation, onGetLocation, isCheckingLocation }) {
  return (
    <>
      <Box className=" bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <Box className="p-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-blue-100">
          <Box className="flex items-center justify-between ">
            <Text className="font-bold text-gray-900 flex items-center">Lịch Sử Chấm Công Hôm Nay</Text>
          </Box>
        </Box>

        <Box className="divide-y divide-gray-200">
          {currentLocation ? (
            <Box className="space-y-2 p-2">
              <Box className="flex justify-between items-center p-2 ">
                <Text className="text-sm text-gray-600">Địa chỉ:</Text>
                <Text className="text-xs text-blue-700">{currentLocation.placeName || "Đang tải..."}</Text>
              </Box>

              <Box className="flex justify-between items-center p-2 ">
                <Text className="text-sm text-gray-600">Tọa độ:</Text>
                <Text className="text-xs text-blue-700">
                  {currentLocation.latitude.toFixed(4)}, {currentLocation.longitude.toFixed(4)}
                </Text>
              </Box>
              <Box className="flex justify-between items-center p-2 ">
                <Text className="text-sm text-gray-600">Bán kính cho phép chênh lệch:</Text>
                <Text className="text-xs font-semibold text-purple-700">
                  ±{currentLocation.accuracy?.toFixed(0) || "N/A"}m
                </Text>
              </Box>
            </Box>
          ) : (
            <Text className="text-sm text-gray-600 p-4">Nhấn nút dưới để lấy vị trí</Text>
          )}
        </Box>
        <Box className="px-4 mb-4">
          <GetLocationButton onGetLocation={onGetLocation} isCheckingLocation={isCheckingLocation} />
        </Box>
      </Box>
    </>
  );
}

export default LocationStatus;
