import { Box, Text, Icon } from "zmp-ui";

function CheckInTypeSelector({ checkInTypes, selectedCheckInType, onSelectType }) {
  if (selectedCheckInType) return null;

  return (
    <Box className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 mb-4">
      <Text className="font-bold text-gray-900 mb-3 flex items-center">
        <Icon icon="zi-post" className="mr-2 text-blue-600" size={16} />
        Chọn Loại Chấm Công
      </Text>

      <Box className="space-y-3">
        {checkInTypes.map((type) => (
          <button
            key={type.id}
            onClick={() => onSelectType(type)}
            className="w-full p-4 bg-gradient-to-r from-gray-50 to-white rounded-lg border-2 border-gray-200 hover:border-blue-300 transition-all text-left"
          >
            <Box className="flex items-center justify-between">
              <Box className="flex items-center space-x-3">
                <Box>
                  <Text className="font-bold text-gray-900">
                    {type.name}
                  </Text>
                  <Text className="text-sm text-gray-600">{type.time}</Text>
                </Box>
              </Box>
              <Icon
                icon="zi-arrow-right"
                className="text-gray-400"
                size={16}
              />
            </Box>
          </button>
        ))}
      </Box>
    </Box>
  );
}

export default CheckInTypeSelector;
