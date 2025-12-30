import { Box, Text } from "zmp-ui";

function CheckInHeader() {
  return (
    <Box className="bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 shadow-lg pb-4 relative overflow-hidden">
      <Box className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full -mr-24 -mt-24"></Box>
      <Box className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full -ml-16 -mb-16"></Box>

      <Box className="px-4 pt-10 pb-4 relative z-10">
        <Text.Title className="text-white font-bold" size="large">
          Chấm Công Công Việc
        </Text.Title>
        <Text className="text-blue-100 text-sm mt-1">
          {new Date().toLocaleDateString("vi-VN")} -{" "}
          {new Date().toLocaleTimeString("vi-VN")}
        </Text>
      </Box>
    </Box>
  );
}

export default CheckInHeader;
