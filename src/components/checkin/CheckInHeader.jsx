import { useEffect, useState } from "react";
import { Box, Text, Icon } from "zmp-ui";

function CheckInHeader() {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <Box className="bg-gradient-to-r from-green-600 via-green-700 to-green-800 shadow-lg pb-4 relative overflow-hidden">
      <Box className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full -mr-24 -mt-24"></Box>
      <Box className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full -ml-16 -mb-16"></Box>

      <Box className="px-4 pt-10 mt-5 pb-2 relative z-10">
        <Text.Title className="text-white font-bold" size="large">
          Chấm Công Công Việc
        </Text.Title>
        <Text className="text-green-100 text-sm mt-1">
          {currentTime.toLocaleDateString("vi-VN")} - {currentTime.toLocaleTimeString("vi-VN")}
        </Text>
      </Box>

      {/* Cảnh báo về chỉnh sửa thời gian */}
      {/* <Box className="px-4 pb-3 relative z-10">
        <Box className="bg-amber-50 border-l-4 border-amber-400 rounded py-3 px-3 flex gap-2">
          <Box>
            <Text className="text-amber-900 font-semibold text-xs">Cảnh báo bảo mật</Text>
            <Text className="text-amber-800 text-xs mt-1">
              Hệ thống ghi nhận thời gian chấm công dựa trên máy chủ IMS. Việc điều chỉnh thời gian trên thiết bị sẽ
              được ghi lại và có thể xem xét trong quá trình đánh giá hiệu suất làm việc!
            </Text>
          </Box>
        </Box>
      </Box> */}
    </Box>
  );
}

export default CheckInHeader;
