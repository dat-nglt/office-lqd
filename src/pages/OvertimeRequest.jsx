/*
 * Dữ liệu cần thiết cho trang OvertimeRequest:
 * - existingProjects: Mảng các đối tượng công trình với id, name, company, address, coordinates. Được sử dụng để chọn công trình có sẵn.
 * - overtimeInfo: Đối tượng với date (Date), company (chuỗi), address (chuỗi), content (chuỗi), customerName (chuỗi), phoneNumber (chuỗi), notes (chuỗi), estimatedStartTime (chuỗi HH:MM), estimatedEndTime (chuỗi HH:MM). Được sử dụng để lưu thông tin yêu cầu ca phát sinh.
 * - selectedProjectId: Chuỗi ID công trình được chọn. Được sử dụng để tự động điền thông tin.
 * - showProjectList: Boolean để hiển thị danh sách công trình. Được sử dụng cho dropdown.
 * - isSubmitting: Boolean cho trạng thái gửi yêu cầu. Được sử dụng để disable nút và hiển thị loading.
 *
 * API cần thiết (đề xuất thực hiện):
 * - fetchExistingProjects(employeeId): API để lấy danh sách công trình có sẵn từ backend dựa trên ID nhân viên. Ví dụ: GET /api/projects?employeeId=123. Trả về mảng existingProjects.
 * - submitOvertimeRequest(employeeId, data): API để gửi yêu cầu ca phát sinh lên server, bao gồm thông tin overtimeInfo. Ví dụ: POST /api/overtime-request/submit với body {employeeId, date, company, address, content, customerName, phoneNumber, notes, startTime, endTime}. Trả về trạng thái thành công.
 * - Cải tiến tiềm năng: Tích hợp useEffect để gọi fetchExistingProjects khi component mount; thêm xử lý lỗi và validation phía server; sử dụng Axios hoặc Fetch cho các API backend.
 * - API hiện tại: POST /api/overtime-request/send để gửi tin nhắn yêu cầu (có thể thay bằng submitOvertimeRequest để lưu vào DB).
 */

import { Box, Text, Icon, Page, Input, DatePicker, Button } from "zmp-ui";
import { useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { nativeStorage } from "zmp-sdk/apis";
import BottomNavigation from "../components/BottomNavigation";
import { ToastContext } from "../components/layout";
import { calculateWorkHours, formatDate, validateFormFields } from "../utils/helpers";

function OvertimeRequest() {
  const navigate = useNavigate();
  const toast = useContext(ToastContext);
  const [userInfo, setUserInfo] = useState(null);

  // Existing projects in the system
  const [existingProjects] = useState([
    {
      id: "p1",
      name: "NEXUS HOUSE - Lắp đặt hệ thống điện",
      company: "NEXUS HOUSE",
      address: "05A Quốc Hương, Phường An Khánh, Quận 2, TP.HCM",
      coordinates: { lat: 10.7769, lng: 106.7009 },
    },
    {
      id: "p2",
      name: "VINHOMES - Bảo trì điều hòa",
      company: "VINHOMES",
      address: "456 Lê Văn Việt, Quận 9, TP.HCM",
      coordinates: { lat: 10.8411, lng: 106.8097 },
    },
    {
      id: "p3",
      name: "MASTERI - Hệ thống điện nước",
      company: "MASTERI",
      address: "789 Võ Văn Ngân, Thủ Đức, TP.HCM",
      coordinates: { lat: 10.8505, lng: 106.7717 },
    },
  ]);

  const [overtimeInfo, setOvertimeInfo] = useState({
    date: new Date(),
    company: "",
    address: "",
    content: "",
    customerName: "",
    phoneNumber: "",
    notes: "",
    estimatedStartTime: "17:00",
    estimatedEndTime: "21:00",
  });

  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const [showProjectList, setShowProjectList] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSelectProject = (project) => {
    setSelectedProjectId(project.id);
    setOvertimeInfo((prev) => ({
      ...prev,
      company: project.company,
      address: project.address,
    }));
    setShowProjectList(false);
    toast?.success({
      title: "Chọn công trình thành công",
      message: `Đã chọn: ${project.company}`,
      duration: 2000,
    });
  };

  const handleClearProject = () => {
    setSelectedProjectId(null);
    setOvertimeInfo((prev) => ({
      ...prev,
      company: "",
      address: "",
    }));
  };

  const handleInputChange = (field, value) => {
    setOvertimeInfo((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const validateForm = () => {
    return validateFormFields(overtimeInfo, ["company", "address", "content", "customerName", "phoneNumber"]);
  };

  const handleSubmit = async () => {
    if (isSubmitting) return;

    if (!validateForm()) {
      toast?.error({
        title: "Lỗi nhập liệu",
        message: "Vui lòng điền đầy đủ thông tin bắt buộc!",
        duration: 3000,
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const messageText = `
YÊU CẦU CA PHÁT SINH:
- Ngày: ${new Date(overtimeInfo.date).toLocaleDateString("vi-VN")}
- Công ty: ${overtimeInfo.company}
- Địa chỉ: ${overtimeInfo.address}
- Nội dung: ${overtimeInfo.content}
- Khách hàng: ${overtimeInfo.customerName}
- SĐT: ${overtimeInfo.phoneNumber}
- Giờ bắt đầu: ${overtimeInfo.estimatedStartTime}
- Giờ kết thúc: ${overtimeInfo.estimatedEndTime}
- Ghi chú: ${overtimeInfo.notes || "Không có"}
      `;

      const response = await fetch("https://lamquangdai.vn/api/overtime-request/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: messageText.trim(),
        }),
      });

      if (response.ok) {
        toast?.success({
          title: "Thành công",
          message: "Yêu cầu ca phát sinh đã được gửi!",
          duration: 3000,
        });
        // Reset form
        setOvertimeInfo({
          date: new Date(),
          company: "",
          address: "",
          content: "",
          customerName: "",
          phoneNumber: "",
          notes: "",
          estimatedStartTime: "17:00",
          estimatedEndTime: "21:00",
        });
        setSelectedProjectId(null);
      } else {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (error) {
      console.error("Lỗi khi gửi yêu cầu:", error);
      toast?.error({
        title: "Lỗi gửi yêu cầu",
        message: "Có lỗi xảy ra khi gửi yêu cầu. Vui lòng thử lại!",
        duration: 3000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Memoize work hours calculation
  const workHoursInfo = calculateWorkHours(overtimeInfo.estimatedStartTime, overtimeInfo.estimatedEndTime);

  return (
    <Page className="bg-gray-50 min-h-screen">
      {/* Enhanced Header matching Notifications.jsx */}
      <Box className="bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 shadow-lg pb-4 relative overflow-hidden">
        <Box className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full -mr-24 -mt-24"></Box>
        <Box className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full -ml-16 -mb-16"></Box>

        <Box className="px-4 pt-10 mt-5 pb-4 relative z-10">
          <Box className="flex items-center justify-between mb-3">
            <Text.Title className="text-white font-bold" size="large">
              Tạo Yêu Cầu Ca Phát Sinh
            </Text.Title>
          </Box>

          {/* Info Message */}
          <Box className="bg-white/10 backdrop-blur-md rounded-lg p-2 border border-white/20">
            <Text size="small" className="text-blue-100 flex items-center">
              <Icon icon="zi-info-circle" className="mr-1" size={14} />
              Điền đầy đủ thông tin để tạo yêu cầu ca phát sinh
            </Text>
          </Box>
        </Box>
      </Box>

      <Box className="px-4 pt-4 pb-28">
        {/* Form */}
        <Box className="space-y-4">
          {/* Date Field */}
          <Box className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
            <Text className="font-semibold text-gray-800 mb-2 text-sm flex items-center">
              <Icon icon="zi-calendar" className="mr-2 text-blue-600" size={16} />
              Ngày ca phát sinh
            </Text>
            <DatePicker
              value={overtimeInfo.date}
              onChange={(date) => handleInputChange("date", date)}
              placeholder="Chọn ngày ca phát sinh"
              className="w-full"
              dateFormat="dd/mm/yyyy"
            />
            <Text className="text-xs text-gray-500 mt-2">{formatDate(overtimeInfo.date)}</Text>
          </Box>

          {/* Time Fields - Optimized */}
          <Box className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
            <Text className="font-semibold text-gray-800 mb-3 text-sm flex items-center">
              <Icon icon="zi-clock-1" className="mr-2 text-blue-600" size={16} />
              Thời Gian Ca Phát Sinh
            </Text>
            <Box className="grid grid-cols-2 gap-3 mb-3">
              <Box>
                <Text className="text-xs text-gray-600 mb-1">Bắt đầu</Text>
                <Input
                  type="time"
                  value={overtimeInfo.estimatedStartTime}
                  onChange={(e) => handleInputChange("estimatedStartTime", e.target.value)}
                  className="w-full rounded-lg"
                />
              </Box>
              <Box>
                <Text className="text-xs text-gray-600 mb-1">Kết thúc</Text>
                <Input
                  type="time"
                  value={overtimeInfo.estimatedEndTime}
                  onChange={(e) => handleInputChange("estimatedEndTime", e.target.value)}
                  className="w-full rounded-lg"
                />
              </Box>
            </Box>
            {/* Work Hours Preview */}
            <Box className="bg-blue-50 rounded-lg p-2 border border-blue-200">
              <Text className="text-xs text-blue-600 font-semibold text-center">
                {workHoursInfo.total > 0
                  ? `Tổng: ${workHoursInfo.hours}h ${workHoursInfo.mins}m`
                  : "Thời gian không hợp lệ"}
              </Text>
            </Box>
          </Box>

          {/* Project Selection Section */}
          <Box className="bg-white rounded-lg p-4 shadow-sm border border-blue-200">
            <Text className="font-semibold text-gray-800 mb-3 text-sm flex items-center">
              <Icon icon="zi-home" className="mr-2 text-blue-600" size={16} />
              Chọn Công Trình
            </Text>

            {selectedProjectId ? (
              <Box className="bg-blue-50 rounded-lg p-3 border border-blue-200 mb-3">
                <Box className="flex items-start justify-between">
                  <Box className="flex-1">
                    <Text className="font-semibold text-blue-900 text-sm">
                      {existingProjects.find((p) => p.id === selectedProjectId)?.name}
                    </Text>
                    <Text className="text-xs text-blue-700 mt-1">
                      {existingProjects.find((p) => p.id === selectedProjectId)?.address}
                    </Text>
                  </Box>
                  <button
                    onClick={handleClearProject}
                    className="text-blue-600 hover:text-blue-800 p-1 flex-shrink-0"
                    title="Xóa chọn"
                  >
                    <Icon icon="zi-close" size={18} />
                  </button>
                </Box>
              </Box>
            ) : null}

            <button
              onClick={() => setShowProjectList(!showProjectList)}
              className="w-full px-3 py-2.5 border-2 border-blue-600 text-blue-600 rounded-lg font-semibold hover:bg-blue-50 transition-colors flex items-center justify-center gap-2"
            >
              <Icon icon="zi-list-1" size={16} />
              {selectedProjectId ? "Đổi công trình" : "Chọn công trình có sẵn"}
            </button>

            {/* Project List Dropdown */}
            {showProjectList && (
              <Box className="mt-3 space-y-2 p-2 bg-gray-50 rounded-lg border border-gray-200">
                {existingProjects.map((project) => (
                  <button
                    key={project.id}
                    onClick={() => handleSelectProject(project)}
                    className={`w-full text-left p-3 rounded-lg border-2 transition-all ${
                      selectedProjectId === project.id
                        ? "border-blue-600 bg-blue-50"
                        : "border-gray-200 bg-white hover:border-blue-300"
                    }`}
                  >
                    <Text className="font-semibold text-gray-900 text-sm">{project.company}</Text>
                    <Text className="text-xs text-gray-600 mt-0.5">{project.name}</Text>
                    <Text className="text-xs text-gray-500 mt-1">{project.address}</Text>
                  </button>
                ))}
              </Box>
            )}

            {/* Or Manual Entry */}
            {!selectedProjectId && (
              <>
                <Text className="text-xs text-gray-500 text-center my-3">Hoặc nhập thủ công</Text>
                <Input
                  placeholder="Nhập tên công ty"
                  value={overtimeInfo.company}
                  onChange={(e) => handleInputChange("company", e.target.value)}
                  className="w-full rounded-lg"
                />
              </>
            )}

            {selectedProjectId && (
              <Box className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                <Text className="text-xs text-blue-800 flex items-center">
                  <Icon icon="zi-check-circle" className="mr-1" size={14} />
                  Thông tin công trình đã được tự động điền
                </Text>
              </Box>
            )}
          </Box>

          {/* Address Field */}
          <Box className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
            <Text className="font-semibold text-gray-800 mb-2 text-sm flex items-center">
              <Icon icon="zi-location" className="mr-2 text-blue-600" size={16} />
              Địa chỉ
            </Text>
            <Input
              placeholder="Nhập địa chỉ"
              value={overtimeInfo.address}
              onChange={(e) => handleInputChange("address", e.target.value)}
              className="w-full rounded-lg"
              rows={3}
              disabled={selectedProjectId !== null}
            />
            {selectedProjectId && (
              <Text className="text-xs text-gray-500 mt-2">Được tự động điền từ công trình đã chọn</Text>
            )}
          </Box>

          {/* Content Field */}
          <Box className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
            <Text className="font-semibold text-gray-800 mb-2 text-sm flex items-center">
              <Icon icon="zi-note" className="mr-2 text-blue-600" size={16} />
              Nội dung công việc
            </Text>
            <Input
              placeholder="Nhập nội dung công việc"
              value={overtimeInfo.content}
              onChange={(e) => handleInputChange("content", e.target.value)}
              className="w-full rounded-lg"
              rows={4}
            />
          </Box>

          {/* Customer Name Field */}
          <Box className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
            <Text className="font-semibold text-gray-800 mb-2 text-sm flex items-center">
              <Icon icon="zi-user" className="mr-2 text-blue-600" size={16} />
              Tên khách hàng liên hệ
            </Text>
            <Input
              placeholder="Nhập tên khách hàng"
              value={overtimeInfo.customerName}
              onChange={(e) => handleInputChange("customerName", e.target.value)}
              className="w-full rounded-lg"
            />
          </Box>

          {/* Phone Number Field */}
          <Box className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
            <Text className="font-semibold text-gray-800 mb-2 text-sm flex items-center">
              <Icon icon="zi-call" className="mr-2 text-blue-600" size={16} />
              Số điện thoại liên hệ
            </Text>
            <Input
              placeholder="Nhập số điện thoại"
              value={overtimeInfo.phoneNumber}
              onChange={(e) => handleInputChange("phoneNumber", e.target.value)}
              className="w-full rounded-lg"
              type="tel"
            />
          </Box>

          {/* Notes Field */}
          <Box className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
            <Text className="font-semibold text-gray-800 mb-2 text-sm flex items-center">
              <Icon icon="zi-edit" className="mr-2 text-blue-600" size={16} />
              Ghi chú (Tùy chọn)
            </Text>
            <Input
              placeholder="Nhập ghi chú nếu cần..."
              value={overtimeInfo.notes}
              onChange={(e) => handleInputChange("notes", e.target.value)}
              className="w-full rounded-lg"
              rows={3}
            />
          </Box>

          {/* Submit Button */}
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-lg py-3 font-semibold disabled:opacity-50"
          >
            <Icon icon="zi-send" className="mr-2" size={16} />
            {isSubmitting ? "Đang gửi..." : "Gửi Yêu Cầu"}
          </Button>
        </Box>
      </Box>

      <BottomNavigation />
    </Page>
  );
}

export default OvertimeRequest;
