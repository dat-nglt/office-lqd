import { Box, Text, Icon, Button } from "zmp-ui";
import { useState } from "react";

function CheckInHistory({ todayAttendanceRecords }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <Box className="mt-8 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <Box className="p-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-blue-100">
        <Box className="flex items-center justify-between ">
          <Text className="font-bold text-gray-900 flex items-center">
            Lịch Sử Chấm Công Hôm Nay
          </Text>
          {todayAttendanceRecords.length > 0 && (
            <Button
              size="small"
              className="text-xs bg-white/50 text-gray-700 hover:bg-white/20"
              onClick={() => setExpanded((s) => !s)}
            >
              {/** use ternary to toggle label and icon */}
              <span className="flex items-center gap-1">
                {expanded ? "Thu gọn" : `Xem (${todayAttendanceRecords.length})`}
                <Icon icon={expanded ? "zi-chevron-up" : "zi-chevron-down"} size={12} />
              </span>
            </Button>
          )}
        </Box>
      </Box>

      <Box className="divide-y divide-gray-200">
        {todayAttendanceRecords.length > 0 ? (
          <>
            {todayAttendanceRecords.slice(0, expanded ? todayAttendanceRecords.length : 1).map((record) => (
              <Box key={record.attendanceId} className={`p-4`}>
                <Box className="mb-2">
                  <Box>
                    <Box className="flex items-center gap-2 justify-between">
                      <Text className="font-semibold text-gray-600 uppercase">{record.attendanceType}</Text>
                      {record.isViolation && (
                        <Box className="flex items-center gap-1 bg-red-600 text-white px-2 py-0.5 rounded text-xs font-semibold">
                          VI PHẠM
                        </Box>
                      )}
                    </Box>
                    <Text className="text-xs text-gray-500 mt-1">
                      Công việc {record.workTitle || "chưa được xác định"}
                    </Text>
                    <Text className="text-xs text-gray-500 mt-1">
                      Kỹ thuật bắt đầu công việc tại {record.isAtHub ? "kho" : "hiện trường"}
                    </Text>
                    <Box className="flex items-center justify-between">
                      <Text className="text-xs text-gray-500 mt-1">
                        Toạ độ ghi nhận {record.latitude != null ? record.latitude.toFixed(4) : "—"},{" "}
                        {record.longitude != null ? record.longitude.toFixed(4) : "—"}
                      </Text>
                    </Box>
                    <Text className="text-xs text-gray-500 mt-1">
                      Lúc {record.checkInTime} tại {record.location}
                    </Text>
                    {record.isViolation && (
                      <Text className="text-xs text-red-700 font-semibold mt-1">
                        Vi phạm vị trí chấm công công việc ~ {Number(record.violationDistance / 1000).toFixed(2)}
                        Km
                      </Text>
                    )}
                  </Box>
                </Box>

                {record.photo && (
                  <Box
                    className={`mt-3 rounded-lg overflow-hidden border-2 aspect-square bg-gray-100  border-gray-200
                    `}
                  >
                    <img src={record.photo} alt="Check-in" className="w-full h-full object-cover" />
                  </Box>
                )}
              </Box>
            ))}

            {!expanded && todayAttendanceRecords.length > 2 && (
              <Box className="p-3 text-center">
                <Text className="text-xs text-blue-600 " onClick={() => setExpanded(true)}>
                  Nhấn để xem thêm {todayAttendanceRecords.length - 1} bản ghi chấm công
                </Text>
              </Box>
            )}
          </>
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
