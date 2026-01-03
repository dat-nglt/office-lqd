import { Box, Text, Icon } from "zmp-ui";

function CheckInHistory({ todayAttendanceRecords }) {
  console.log("Today Attendance Records:", todayAttendanceRecords);
  return (
    <Box className="mt-8 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <Box className="p-4 border-b border-gray-200">
        <Text className="font-bold text-gray-900 flex items-center">
          <Icon icon="zi-list-1" className="mr-2 text-blue-600" size={16} />
          Lịch Sử Chấm Công Hôm Nay
        </Text>
      </Box>

      <Box className="divide-y divide-gray-200">
        {todayAttendanceRecords.length > 0 ? (
          todayAttendanceRecords.map((record) => (
            <Box key={record.id} className={`p-4`}>
              <Box className="mb-2">
                <Box>
                  <Box className="flex items-center gap-2 justify-between">
                    <Text className="font-semibold text-gray-600 uppercase">{record.type}</Text>
                    {record.isViolation && (
                      <Box className="flex items-center gap-1 bg-red-600 text-white px-2 py-0.5 rounded text-xs font-semibold">
                        VI PHẠM
                      </Box>
                    )}
                  </Box>
                  <Text className="text-xs text-gray-500 mt-1">
                    {record.checkInType} - {record.locationType !== "warehouse" ? "Văn Phòng" : "Dự án & Dịch vụ"}
                  </Text>
                  <Box className="flex items-center justify-between">
                    <Text className="text-xs text-gray-500 mt-1">
                      Tạo độ ghi nhận {record.latitude.toFixed(4)}, {record.longitude.toFixed(4)}
                    </Text>
                  </Box>
                  <Text className="text-xs text-gray-500 mt-1">
                    Lúc {record.checkInTime} tại {record.location}
                  </Text>
                  {record.isViolation && (
                    <Text className="text-xs text-red-700 font-semibold mt-1">
                      Vi phạm vị trí chấm công công việc ~ {(record.violationDistance / 1000).toFixed(2) || 0}Km
                    </Text>
                  )}
                </Box>
              </Box>

              {record.photo && (
                <Box
                  className={`mt-3 rounded-lg overflow-hidden border-2 aspect-square bg-gray-100 ${
                    record.isViolation ? "border-red-500" : "border-gray-200"
                  }`}
                >
                  <img src={record.photo} alt="Check-in" className="w-full h-full object-cover" />
                </Box>
              )}
            </Box>
          ))
        ) : (
          <Box className="text-center py-8">
            <Icon icon="zi-check-circle" className="text-gray-400 text-3xl mb-2" />
            <Text className="text-gray-500 text-sm">Chưa có chấm công hôm nay</Text>
          </Box>
        )}
      </Box>
    </Box>
  );
}

export default CheckInHistory;
