import { Box, Text, Icon } from "zmp-ui";

function WorkAssignmentCard({ currentWork }) {
  return (
    <Box className="bg-white rounded-xl p-4 shadow-sm border border-blue-200 mb-4">
      <Box className="space-y-3">
        <Box className="flex justify-between items-start">
          <Box className="flex-1">
            <Text className="font-semibold text-gray-900 text-sm">{currentWork.title}</Text>
          </Box>
          <Box className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded font-semibold">
            {currentWork.required_time_hour}:{String(currentWork.required_time_minute).padStart(2, "0")}
          </Box>
        </Box>
        <Box className="flex items-center gap-1 text-xs text-gray-600">
          <Icon icon="zi-user" className="text-gray-400 flex-shrink-0" size={16} />
          <Text className="text-xs">{currentWork.customer_name}</Text>
        </Box>
        <Box className="flex items-center gap-1 text-xs text-gray-600">
          <Icon icon="zi-location" className="text-gray-500 flex-shrink-0" size={16} />
          <Text className="text-xs">{currentWork.location}</Text>
        </Box>
        <Box className="flex items-start gap-1 text-xs text-gray-600">
          <Icon icon="zi-note" className="text-gray-500 flex-shrink-0" size={16} />
          <Text className="text-xs">{currentWork.description}</Text>
        </Box>
      </Box>
    </Box>
  );
}

export default WorkAssignmentCard;
