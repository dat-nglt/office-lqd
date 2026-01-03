import { Box, Icon, Page, Text } from "zmp-ui";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import BottomNavigation from "../components/BottomNavigation";
import { getUserInfo } from "zmp-sdk/apis";
import { getMonthAttendanceHistory } from "../services/upload.service";
import { miniAppGetProfileInfoByID } from "../services/user.service";

function AttendanceHistory() {
  const navigate = useNavigate();
  const [userInfo, setUserInfo] = useState(null);
  const [attendanceList, setAttendanceList] = useState([]);

  const fetchAttendanceData = async () => {
    try {
      const { userInfo } = await getUserInfo();
      const ZAID = userInfo.id;
      const userInfoResp = await miniAppGetProfileInfoByID(ZAID);
      if (userInfoResp.success) {
        setUserInfo(userInfoResp.data);
      } else {
        clearTokens();
      }

      const attendanceDataHistory = await getMonthAttendanceHistory(userInfoResp.data.id);
      console.log("attendanceDataHistory", attendanceDataHistory);
      if (attendanceDataHistory.success) {
        setAttendanceList(attendanceDataHistory.data);
      } else {
        setAttendanceList([]);
      }
    } catch (error) {}
  };

  useEffect(() => {
    fetchAttendanceData();
  }, []);

  const [filterDate, setFilterDate] = useState(new Date().toISOString().split("T")[0]);
  const [viewMode, setViewMode] = useState("day"); // 'day', 'week', 'month'

  // Helper functions
  const getWeekStartEnd = (dateString) => {
    const date = new Date(dateString + "T00:00:00");
    const day = date.getDay(); // 0 = Sunday
    const diff = date.getDate() - day + (day === 0 ? -6 : 1); // Adjust for Monday start
    const weekStart = new Date(date.setDate(diff));
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    return {
      start: weekStart.toISOString().split("T")[0],
      end: weekEnd.toISOString().split("T")[0],
    };
  };

  const getMonthStartEnd = (dateString) => {
    const date = new Date(dateString + "T00:00:00");
    const year = date.getFullYear();
    const month = date.getMonth();
    const start = new Date(year, month, 1).toISOString().split("T")[0];
    const end = new Date(year, month + 1, 0).toISOString().split("T")[0];
    return { start, end };
  };

  // New helpers for ISO timestamps
  const parseISODate = (iso) => (iso ? new Date(iso) : null);
  const formatTime = (iso) => {
    const d = parseISODate(iso);
    return d ? d.toTimeString().substring(0, 5) : "--:--";
  };

  const formatDate = (iso) => {
    const d = parseISODate(iso);
    if (!d) return "";
    const days = ["Chủ nhật", "Thứ hai", "Thứ ba", "Thứ tư", "Thứ năm", "Thứ sáu", "Thứ bảy"];
    const dayName = days[d.getDay()];
    const formattedDate = d.toLocaleDateString("vi-VN");
    return `${formattedDate} - ${dayName}`;
  };

  const getStatusColor = (status, attendanceTypeName) => {
    if (attendanceTypeName && attendanceTypeName.includes("Tăng ca")) {
      return "bg-orange-100 text-orange-800 border-orange-200";
    }
    if (status === "checked_in") {
      return "bg-green-100 text-green-800 border-green-200";
    }
    if (status === "checked_out") {
      return "bg-gray-100 text-gray-800 border-gray-200";
    }
    return "bg-gray-100 text-gray-800 border-gray-200";
  };

  const currentDate = new Date(filterDate + "T00:00:00");
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();

  const filteredAttendance = attendanceList.filter((record) => {
    const recordDate = parseISODate(record.check_in_time);
    return recordDate && recordDate.getMonth() === currentMonth && recordDate.getFullYear() === currentYear;
  });

  // Add calculations for statistics (use filtered list)
  const totalWorkingHours = filteredAttendance.reduce((sum, item) => {
    const durationMinutes =
      item.attendanceSession?.duration_minutes ??
      (item.check_in_time && item.check_out_time
        ? Math.round((new Date(item.check_out_time) - new Date(item.check_in_time)) / 60000)
        : 0);
    return sum + durationMinutes / 60;
  }, 0);

  const overtimeCount = filteredAttendance.filter((a) => a.attendanceType?.name?.includes("Tăng ca")).length;

  // Navigation functions
  const navigatePeriod = (direction) => {
    const currentDate = new Date(filterDate + "T00:00:00");
    let newDate;
    if (viewMode === "week") {
      newDate = new Date(currentDate);
      newDate.setDate(currentDate.getDate() + (direction === "next" ? 7 : -7));
    } else if (viewMode === "month") {
      newDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + (direction === "next" ? 1 : -1), 1);
    } else {
      // For day mode
      newDate = new Date(currentDate);
      newDate.setDate(currentDate.getDate() + (direction === "next" ? 1 : -1));
    }
    setFilterDate(newDate.toISOString().split("T")[0]);
  };

  const resetToToday = () => {
    setFilterDate(new Date().toISOString().split("T")[0]);
  };

  const displayPeriod = (() => {
    if (viewMode === "day") {
      return `Ngày ${formatDate(filterDate)}`;
    } else if (viewMode === "week") {
      const { start, end } = getWeekStartEnd(filterDate);
      return `${start} đến ${end}`;
    } else if (viewMode === "month") {
      const date = new Date(filterDate + "T00:00:00");
      return `Tháng ${date.getMonth() + 1}/${date.getFullYear()}`;
    }
    return "";
  })();

  return (
    <Page className="bg-gray-50 min-h-screen">
      {/* Enhanced Header */}
      <Box className="bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 shadow-lg pb-4 relative overflow-hidden">
        <Box className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full -mr-24 -mt-24"></Box>
        <Box className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full -ml-16 -mb-16"></Box>

        <Box className="px-4 pt-10 mt-5 pb-4 relative z-10">
          <Box className="flex items-center justify-between mb-3">
            <Text.Title className="text-white font-bold" size="large">
              Lịch Sử Chấm Công - Tháng {new Date().getMonth() + 1}/{new Date().getFullYear()}
            </Text.Title>
          </Box>

          {/* Stats Bar */}
          <Box className="flex gap-2">
            <Box className="flex-1 bg-white/15 rounded-lg px-3 py-2 text-center border border-white/20">
              <Text className="text-white font-bold text-sm">{attendanceList.length}</Text>
              <Text className="text-blue-100 text-xs">Tổng ngày</Text>
            </Box>
            <Box className="flex-1 bg-white/15 rounded-lg px-3 py-2 text-center border border-white/20">
              <Text className="text-white font-bold text-sm">{overtimeCount}</Text>
              <Text className="text-blue-100 text-xs">Tăng ca</Text>
            </Box>
            <Box className="flex-1 bg-white/15 rounded-lg px-3 py-2 text-center border border-white/20">
              <Text className="text-white font-bold text-sm">{totalWorkingHours.toFixed(1)}</Text>
              <Text className="text-blue-100 text-xs">Tổng giờ</Text>
            </Box>
          </Box>
        </Box>
      </Box>

      <Box className="px-4 pb-28 mt-5">
        {/* Attendance List */}
        <Box className="space-y-3">
          {filteredAttendance.length > 0 ? (
            filteredAttendance.map((record) => {
              const workTitle = record.work?.title || record.location_name || "N/A";
              const attendanceTypeName = record.attendanceType?.name || "";
              const durationMinutes =
                record.attendanceSession?.duration_minutes ??
                (record.check_in_time && record.check_out_time
                  ? Math.round((new Date(record.check_out_time) - new Date(record.check_in_time)) / 60000)
                  : 0);
              const workingHours = durationMinutes / 60;

              return (
                <Box
                  key={record.id}
                  className="bg-white rounded-lg p-4 shadow-sm border border-gray-100 hover:border-green-300 hover:shadow-md transition-all"
                >
                  <Box className="flex justify-between items-start mb-2">
                    <Box className="flex-1">
                      <Text className="font-semibold text-gray-900">{formatDate(record.check_in_time)}</Text>
                      <Text className="text-sm text-gray-600 mt-1">
                        {formatTime(record.check_in_time)} - {formatTime(record.check_out_time)}
                      </Text>
                      <Text className="text-xs text-gray-500 mt-1">{workTitle}</Text>
                    </Box>
                    <Box
                      className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(
                        record.status,
                        attendanceTypeName
                      )}`}
                    >
                      {record.status === "checked_out"
                        ? "Đã ra ca"
                        : record.status === "checked_in"
                        ? "Đã vào ca"
                        : record.status}
                    </Box>
                  </Box>

                  <Box className="flex justify-between items-center mt-3 pt-3 border-t border-gray-100">
                    <Box className="flex items-center space-x-2">
                      <Icon icon="zi-clock-1" className="text-gray-400" size={14} />
                      <Text className="text-sm text-gray-600">
                        Giờ làm: <span className="font-semibold">{workingHours.toFixed(2)}h</span>
                      </Text>
                    </Box>
                    <Box className="flex items-center space-x-1 px-2 py-1 bg-blue-50 rounded">
                      <Icon icon="zi-post" className="text-blue-600" size={12} />
                      <Text className="text-xs text-blue-600 font-medium">{attendanceTypeName}</Text>
                    </Box>
                  </Box>
                </Box>
              );
            })
          ) : (
            <Box className="text-center py-12">
              <Icon icon="zi-inbox" className="text-gray-400 text-4xl mb-3" />
              <Text className="text-gray-600 font-semibold">Không có dữ liệu chấm công</Text>
              <Text className="text-gray-500 text-sm mt-1">
                Chưa có dữ liệu chấm công cho tháng {new Date().getMonth() + 1}/{new Date().getFullYear()}
              </Text>
            </Box>
          )}
        </Box>
      </Box>

      <BottomNavigation />
    </Page>
  );
}

export default AttendanceHistory;
