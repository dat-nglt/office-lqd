import { Box, Icon, Page, Text } from "zmp-ui";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { nativeStorage } from "zmp-sdk/apis";
// import Header from "../components/Header"; // Removed import
import BottomNavigation from "../components/BottomNavigation";

/*
 * Dữ liệu cần thiết cho trang AttendanceHistory:
 * - attendanceList: Mảng các đối tượng với các trường id (số), date (chuỗi DD/MM/YYYY), checkInTime (chuỗi HH:MM), checkOutTime (chuỗi HH:MM), workingHours (số), status (chuỗi như "Đúng giờ" hoặc "Tăng ca"), type (chuỗi như "Chấm công thường"), serviceType (chuỗi như "Bảo trì điều hòa"). Được sử dụng để hiển thị danh sách chấm công.
 * - filterDate: Chuỗi ngày (YYYY-MM-DD) để lọc dữ liệu theo ngày, tuần hoặc tháng.
 * - viewMode: Chuỗi ('day', 'week', 'month') để xác định chế độ xem.
 * - showDatePicker: Boolean để hiển thị date picker (hiện tại không sử dụng).
 * - totalWorkingHours: Số tổng giờ làm việc, tính từ attendanceList.
 * - overtimeCount: Số lượng bản ghi tăng ca, tính từ attendanceList.
 *
 * API cần thiết (đề xuất thực hiện):
 * - fetchAttendanceHistory(employeeId, startDate, endDate): API để lấy danh sách chấm công từ backend, trả về mảng attendanceList dựa trên ID nhân viên và khoảng thời gian. Ví dụ: GET /api/attendance/history?employeeId=123&start=2024-11-01&end=2024-11-30.
 * - fetchAttendanceStats(employeeId, period): API để lấy thống kê như totalWorkingHours và overtimeCount cho một khoảng thời gian (day/week/month). Ví dụ: GET /api/attendance/stats?employeeId=123&period=month&date=2024-11.
 * - filterAttendanceByPeriod(employeeId, viewMode, filterDate): API để lọc dữ liệu theo chế độ xem (day/week/month) và ngày lọc. Có thể tích hợp vào fetchAttendanceHistory với tham số bổ sung.
 * - Cải tiến tiềm năng: Thêm xử lý lỗi, caching dữ liệu, và tích hợp với useEffect để gọi API khi component mount hoặc khi filterDate/viewMode thay đổi. Sử dụng thư viện như Axios hoặc Fetch để gọi API.
 * - Không có lệnh gọi API backend hiện tại; dựa vào dữ liệu local hardcode.
 */

function AttendanceHistory() {
  const navigate = useNavigate();
  const [userInfo, setUserInfo] = useState(null);
  const [attendanceList] = useState([
    {
      id: 1,
      date: "17/11/2025",
      checkInTime: "07:55",
      checkOutTime: "17:30",
      workingHours: 9.58,
      status: "Đúng giờ",
      type: "Chấm công thường",
      serviceType: "Bảo trì điều hòa",
    },
    {
      id: 2,
      date: "16/11/2025",
      checkInTime: "08:05",
      checkOutTime: "20:15",
      workingHours: 12.17,
      status: "Tăng ca",
      type: "Tăng ca chiều",
      serviceType: "Sửa chữa hệ thống điện",
    },
    {
      id: 3,
      date: "15/11/2025",
      checkInTime: "07:50",
      checkOutTime: "17:20",
      workingHours: 9.5,
      status: "Đúng giờ",
      type: "Chấm công thường",
      serviceType: "Lắp đặt điều hòa",
    },
    {
      id: 4,
      date: "14/11/2025",
      checkInTime: "11:25",
      checkOutTime: "13:15",
      workingHours: 1.83,
      status: "Tăng ca",
      type: "Tăng ca trưa",
      serviceType: "Kiểm tra thiết bị",
    },
    {
      id: 5,
      date: "13/11/2025",
      checkInTime: "08:00",
      checkOutTime: "17:15",
      workingHours: 9.25,
      status: "Đúng giờ",
      type: "Chấm công thường",
      serviceType: "Bảo trì định kỳ",
    },
  ]);

  const [filterDate, setFilterDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [viewMode, setViewMode] = useState("day"); // 'day', 'week', 'month'
  const [showDatePicker, setShowDatePicker] = useState(false);

  useEffect(() => {
    const token = nativeStorage.getItem("access_token");
    const userInfo = nativeStorage.getItem("user_info");

    if (!token || !userInfo) {
      navigate("/login", { replace: true });
    } else {
      try {
        setUserInfo(JSON.parse(userInfo));
      } catch (err) {
        console.error("Error parsing stored user info:", err);
        // Clear invalid data
        localStorage.removeItem("access_token");
        localStorage.removeItem("user_info");
        navigate("/login", { replace: true });
      }
    }
  }, [navigate]);

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

  // Add calculations for statistics
  const totalWorkingHours = attendanceList.reduce(
    (sum, item) => sum + item.workingHours,
    0
  );
  const overtimeCount = attendanceList.filter((a) =>
    a.status.includes("Tăng ca")
  ).length;

  const formatDate = (dateString) => {
    const date = new Date(dateString + "T00:00:00");
    const days = [
      "Chủ nhật",
      "Thứ hai",
      "Thứ ba",
      "Thứ tư",
      "Thứ năm",
      "Thứ sáu",
      "Thứ bảy",
    ];
    const dayName = days[date.getDay()];
    const formattedDate = date.toLocaleDateString("vi-VN");
    return `${formattedDate} - ${dayName}`;
  };

  const getStatusColor = (status) => {
    if (status.includes("Đúng giờ")) {
      return "bg-green-100 text-green-800 border-green-200";
    } else if (status.includes("Tăng ca")) {
      return "bg-orange-100 text-orange-800 border-orange-200";
    }
    return "bg-gray-100 text-gray-800 border-gray-200";
  };

  // Helper to convert DD/MM/YYYY to Date
  const parseDate = (dateString) => {
    const [day, month, year] = dateString.split("/");
    return new Date(year, month - 1, day);
  };

  const filteredAttendance = attendanceList.filter((record) => {
    const recordDate = parseDate(record.date);
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    return (
      recordDate.getMonth() === currentMonth &&
      recordDate.getFullYear() === currentYear
    );
  });

  // Navigation functions
  const navigatePeriod = (direction) => {
    const currentDate = new Date(filterDate + "T00:00:00");
    let newDate;
    if (viewMode === "week") {
      newDate = new Date(currentDate);
      newDate.setDate(currentDate.getDate() + (direction === "next" ? 7 : -7));
    } else if (viewMode === "month") {
      newDate = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth() + (direction === "next" ? 1 : -1),
        1
      );
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
              Lịch Sử Chấm Công - Tháng Hiện Tại
            </Text.Title>
          </Box>

          {/* Stats Bar */}
          <Box className="flex gap-2">
            <Box className="flex-1 bg-white/15 rounded-lg px-3 py-2 text-center border border-white/20">
              <Text className="text-white font-bold text-sm">
                {attendanceList.length}
              </Text>
              <Text className="text-blue-100 text-xs">Tổng ngày</Text>
            </Box>
            <Box className="flex-1 bg-white/15 rounded-lg px-3 py-2 text-center border border-white/20">
              <Text className="text-white font-bold text-sm">
                {overtimeCount}
              </Text>
              <Text className="text-blue-100 text-xs">Tăng ca</Text>
            </Box>
            <Box className="flex-1 bg-white/15 rounded-lg px-3 py-2 text-center border border-white/20">
              <Text className="text-white font-bold text-sm">
                {totalWorkingHours.toFixed(1)}
              </Text>
              <Text className="text-blue-100 text-xs">Tổng giờ</Text>
            </Box>
          </Box>
        </Box>
      </Box>

      <Box className="px-4 pb-28 mt-5">
        {/* Attendance List */}
        <Box className="space-y-3">
          {filteredAttendance.length > 0 ? (
            filteredAttendance.map((record) => (
              <Box
                key={record.id}
                className="bg-white rounded-lg p-4 shadow-sm border border-gray-100 hover:border-green-300 hover:shadow-md transition-all"
              >
                <Box className="flex justify-between items-start mb-2">
                  <Box className="flex-1">
                    <Text className="font-semibold text-gray-900">
                      {record.date}
                    </Text>
                    <Text className="text-sm text-gray-600 mt-1">
                      {record.checkInTime} - {record.checkOutTime}
                    </Text>
                    <Text className="text-xs text-gray-500 mt-1">
                      {record.serviceType}
                    </Text>
                  </Box>
                  <Box
                    className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(
                      record.status
                    )}`}
                  >
                    {record.status}
                  </Box>
                </Box>

                <Box className="flex justify-between items-center mt-3 pt-3 border-t border-gray-100">
                  <Box className="flex items-center space-x-2">
                    <Icon
                      icon="zi-clock-1"
                      className="text-gray-400"
                      size={14}
                    />
                    <Text className="text-sm text-gray-600">
                      Giờ làm:{" "}
                      <span className="font-semibold">
                        {record.workingHours.toFixed(2)}h
                      </span>
                    </Text>
                  </Box>
                  <Box className="flex items-center space-x-1 px-2 py-1 bg-blue-50 rounded">
                    <Icon icon="zi-post" className="text-blue-600" size={12} />
                    <Text className="text-xs text-blue-600 font-medium">
                      {record.type}
                    </Text>
                  </Box>
                </Box>
              </Box>
            ))
          ) : (
            <Box className="text-center py-12">
              <Icon icon="zi-inbox" className="text-gray-400 text-4xl mb-3" />
              <Text className="text-gray-600 font-semibold">
                Không có dữ liệu chấm công
              </Text>
              <Text className="text-gray-500 text-sm mt-1">
                Chưa có dữ liệu chấm công cho ngày này
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
