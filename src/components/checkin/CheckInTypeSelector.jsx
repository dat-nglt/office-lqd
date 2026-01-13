import { Box, Text, Icon } from "zmp-ui";

function CheckInTypeSelector({ checkInTypes, selectedAttendanceType, onSelectType }) {
  if (selectedAttendanceType) return null;

  return (
    <>
      <Box className="p-4 border-b  rounded-t-xl border-gray-200 bg-gradient-to-r from-green-50 to-green-100 flex items-center justify-between">
        <Text className="font-bold text-gray-900 flex items-center">
          Chọn ca chấm công
          {/* ({todayAssignments.length}) */}
        </Text>
      </Box>
      <Box className="bg-white rounded-b-xl p-4 shadow-sm border border-gray-100 mb-4">
        <Box className="space-y-3">
          {checkInTypes.map((type) => (
            <button
              key={type.id}
              onClick={() => onSelectType(type)}
              className="w-full p-4 bg-gradient-to-r from-gray-50 to-white rounded-lg border-2 border-gray-200 hover:border-green-300 transition-all text-left"
            >
              <Box className="flex items-center justify-between">
                <Box className="flex items-center space-x-3">
                  <Box>
                    <Text className="font-bold text-gray-900">{type.name}</Text>
                    <Text className="text-sm text-gray-600 mt-1">
                      {type.start_time} - {type.end_time}
                    </Text>
                  </Box>
                </Box>
                <Icon icon="zi-arrow-right" className="text-gray-400" size={16} />
              </Box>
            </button>
          ))}
        </Box>
      </Box>
    </>
  );
}

export default CheckInTypeSelector;
