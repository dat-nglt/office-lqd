import { Box, Text, Icon } from "zmp-ui";
import { formatDistance } from "../../utils/helpers";

function LocationSelector({
  currentLocation,
  checkInLocations,
  selectedCheckInLocation: selectedAttendanceLocation,
  onSelectLocation,
  isWithinLocation,
  getDistanceToLocation,
}) {
  if (!currentLocation) return null;

  return (
    <Box className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
      <Text className="font-bold text-gray-900 mb-3 flex items-center">Chọn Địa Điểm Chấm Công</Text>

      <Box className="space-y-2">
        {checkInLocations.map((location) => {
          const isWithin = isWithinLocation(location);
          const distance = getDistanceToLocation(location);
          const isSelected = selectedAttendanceLocation?.id === location.id;

          return (
            <button
              key={location.id}
              onClick={() => onSelectLocation(location)}
              className={`w-full p-3 rounded-lg border-2 transition-all text-left ${
                isSelected && isWithin
                  ? "border-blue-600 bg-blue-50"
                  : isSelected && !isWithin
                  ? "border-orange-600 bg-orange-50"
                  : isWithin
                  ? "border-gray-200 bg-white hover:border-blue-300"
                  : "border-gray-200 bg-white hover:border-orange-300"
              }`}
            >
              <Box className="flex items-start justify-between gap-3">
                <Box className="flex items-start space-x-3 flex-1">
                  <Box>
                    <Text className="font-semibold text-gray-900">{location.name}</Text>
                    <Text className="text-xs text-gray-600 mt-0.5">{location.address}</Text>
                  </Box>
                </Box>

                {/* Status Badge */}
                <Box className="flex items-center gap-2 flex-col">
                  <Text
                    className={`text-xs min-w-[60px] text-center font-semibold px-2 py-0.5 rounded whitespace-nowrap ${
                      isWithin ? "text-green-700 bg-green-100" : "text-red-700 bg-red-100"
                    }`}
                  >
                    {formatDistance(distance)}
                  </Text>
                </Box>
              </Box>
            </button>
          );
        })}
      </Box>
    </Box>
  );
}

export default LocationSelector;
