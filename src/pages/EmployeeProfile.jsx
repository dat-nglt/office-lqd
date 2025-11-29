import { Box, Text, Icon, Button, Page } from "zmp-ui";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { getUserInfo } from "zmp-sdk/apis";
import { AppError } from "zmp-sdk";
import BottomNavigation from "../components/BottomNavigation";

/*
 * Dữ liệu cần thiết cho trang EmployeeProfile:
 * - Thông tin người dùng: Đối tượng với các trường name (chuỗi), employeeId (chuỗi), position (chuỗi), department (chuỗi), avatar (chuỗi hoặc null), email (chuỗi), phone (chuỗi), specialization (chuỗi). Được sử dụng để hiển thị chi tiết hồ sơ nhân viên.
 * - Địa điểm làm việc: Đối tượng với các trường name (chuỗi), address (chuỗi), coordinates (đối tượng với lat và lng là số). Được sử dụng cho vị trí chấm công mặc định.
 *
 * API cần thiết:
 * - getUserInfo từ zmp-sdk/apis: Được gọi trong getUserInfoMiniApp để lấy thông tin người dùng từ mini app, cập nhật name, employeeId và avatar trong state userInfo. Xử lý quyền và lỗi qua AppError.
 * - Không có API trực tiếp cho lịch sử chấm công hoặc báo cáo công việc; thay vào đó, sử dụng navigation để chuyển đến "/attendance-history" và "/work-reports", ngụ ý các component/trang riêng biệt xử lý những phần đó.
 *
 * Ghi chú bổ sung:
 * - Hàm getStatusColor được định nghĩa nhưng không sử dụng trong JSX; có thể là phần thừa hoặc dành cho tính năng tương lai như badge trạng thái.
 * - Cải tiến tiềm năng: Lấy department, email, phone, specialization từ API thay vì hardcode; thêm API cho địa điểm làm việc động hoặc trạng thái thời gian thực.
 * - Không có lệnh gọi API backend cho việc lưu trữ dữ liệu; dựa vào SDK cho thông tin người dùng.
 */

function EmployeeProfile() {
  const [userInfo, setUserInfo] = useState({
    name: "Nguyễn Lê Tấn Đạt",
    employeeId: "KTV-2024-001",
    position: "Kỹ Thuật Viên",
    department: "Bộ phận Kỹ Thuật",
    avatar: null,
    email: "tan.dat@lamquangdai.vn",
    phone: "0977708819",
    specialization: "Điều hòa & Hệ thống điện",
  });

  const navigate = useNavigate();

  const [workLocation] = useState({
    name: "Kho Hàng - Lâm Quang Đại",
    address: "189A Đ. TX 25, Thạnh Xuân, Quận 12, Thành phố Hồ Chí Minh",
    coordinates: { lat: 10.87957, lng: 106.663325 },
  });

  const getUserInfoMiniApp = async () => {
    try {
      const { userInfo } = await getUserInfo({
        autoRequestPermission: true,
      });

      if (userInfo) {
        setUserInfo((prev) => ({
          ...prev,
          name: userInfo.name || prev.name,
          employeeId: userInfo.idByOA || prev.employeeId,
          avatar: userInfo.avatar || null,
        }));
      }
    } catch (error) {
      if (error instanceof AppError) {
        console.error("Error getting user info:", error);
      }
    }
  };

  useEffect(() => {
    getUserInfoMiniApp();
  }, []);

  return (
    <Page className="bg-gray-50 min-h-screen pb-20">
      {/* Enhanced Header */}
      <Box className="bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 shadow-lg pb-6 relative overflow-hidden">
        {/* Background Effects */}
        <Box className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full -mr-24 -mt-24"></Box>
        <Box className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full -ml-16 -mb-16"></Box>

        <Box className="px-4 pt-10 mt-5 pb-10 relative z-10">
          {/* Title */}
          <Text.Title className="text-white font-bold" size="large">
            Thông Tin Kỹ Thuật Viên
          </Text.Title>
        </Box>
      </Box>

      <Box className="p-4 pb-20">
        {/* User Profile Card */}
        <Box className="bg-white rounded-2xl shadow-md p-6 mb-4 border border-gray-100 -mt-12 relative z-10">
          <Box className="flex items-center space-x-4 mb-4">
            <Box className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-3xl font-bold shadow-lg">
              {userInfo.avatar ? (
                <img
                  src={userInfo.avatar}
                  alt={userInfo.name}
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                userInfo.name.charAt(0)
              )}
            </Box>
            <Box className="flex-1">
              <Text className="font-bold text-lg text-gray-900">
                {userInfo.name}
              </Text>
              <Text className="text-sm text-blue-600 font-semibold">
                {userInfo.position}
              </Text>
              <Text className="text-xs text-gray-500 mt-1">
                ID: {userInfo.employeeId}
              </Text>
            </Box>
          </Box>

          {/* Online Status */}
          <Box className="flex items-center space-x-2 pt-4 border-t border-gray-200">
            <Box className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></Box>
            <Text className="text-sm text-gray-600">Trực tuyến</Text>
          </Box>
        </Box>

        {/* Employee Details */}
        <Box className="bg-white rounded-xl shadow-sm p-4 mb-4 border border-gray-100">
          <Text className="font-bold text-gray-900 mb-3 flex items-center">
            <Icon
              icon="zi-info-circle"
              className="mr-2 text-blue-600"
              size={16}
            />
            Thông Tin Chi Tiết
          </Text>

          <Box className="space-y-3">
            <Box className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <Text className="text-sm text-gray-600">Bộ phận:</Text>
              <Text className="text-sm font-semibold text-gray-900">
                {userInfo.department}
              </Text>
            </Box>
            <Box className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <Text className="text-sm text-gray-600">Email:</Text>
              <Text className="text-sm font-semibold text-gray-900">
                {userInfo.email}
              </Text>
            </Box>
            <Box className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <Text className="text-sm text-gray-600">Điện thoại:</Text>
              <Text className="text-sm font-semibold text-gray-900">
                {userInfo.phone}
              </Text>
            </Box>
          </Box>
        </Box>

        {/* Work Location */}
        <Box className="bg-white rounded-xl shadow-sm p-4 mb-4 border border-gray-100">
          <Text className="font-bold text-gray-900 mb-3 flex items-center">
            <Icon icon="zi-location" className="mr-2 text-red-600" size={16} />
            Địa Điểm Chấm Công Mặc Định
          </Text>

          <Box className="p-4 bg-red-50 rounded-lg border border-red-200">
            <Text className="font-bold text-gray-900 mb-1">
              {workLocation.name}
            </Text>
            <Text className="text-xs text-gray-600 mb-3">
              {workLocation.address}
            </Text>
            <Button
              size="small"
              className="w-full bg-red-600 hover:bg-red-700 text-white rounded-lg"
              onClick={() => {
                const { lat, lng } = workLocation.coordinates;
                const mapsUrl = `https://maps.google.com/?q=${lat},${lng}`;
                window.open(mapsUrl, "_blank");
              }}
            >
              <Icon icon="zi-location" className="mr-1" size={14} />
              Xem Bản Đồ
            </Button>
          </Box>
        </Box>

        <Box className="bg-white rounded-xl shadow-sm p-4 mb-4 border border-gray-100">
          <Text className="font-bold text-gray-900 mb-3 flex items-center">
            <Icon
              icon="zi-share-external-2"
              className="mr-2 text-blue-600"
              size={16}
            />
            Lịch sử chấm công
          </Text>

          <Box className="text-center">
            <Text className="text-sm text-gray-600 mb-3">
              Truy cập danh sách báo cáo công việc cá nhân
            </Text>
            <Button
              variant="primary"
              onClick={() => navigate("/attendance-history")}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-lg py-3 font-semibold"
            >
              <Icon icon="zi-list-1" className="mr-2" size={16} />
              Xem Danh Sách Chấm Công
            </Button>
          </Box>
        </Box>

        {/* Work Reports Section */}
        <Box className="bg-white rounded-xl shadow-sm p-4 mb-4 border border-gray-100">
          <Text className="font-bold text-gray-900 mb-3 flex items-center">
            <Icon
              icon="zi-share-external-2"
              className="mr-2 text-blue-600"
              size={16}
            />
            Báo Cáo Công Việc
          </Text>

          <Box className="text-center">
            <Text className="text-sm text-gray-600 mb-3">
              Truy cập danh sách báo cáo công việc cá nhân
            </Text>
            <Button
              variant="primary"
              onClick={() => navigate("/work-reports")}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-lg py-3 font-semibold"
            >
              <Icon icon="zi-list-1" className="mr-2" size={16} />
              Xem Danh Sách Báo Cáo
            </Button>
          </Box>
        </Box>
      </Box>

      <BottomNavigation />
    </Page>
  );
}

export default EmployeeProfile;
