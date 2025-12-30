import { Box, Text, Icon, Modal } from "zmp-ui";
import { useContext } from "react";
import { ToastContext } from "./layout";

function WorkDetailModal({ visible, onClose, work }) {
  const toast = useContext(ToastContext);

  if (!work) return null;

  const getStatusColor = (status) => {
    switch (status) {
      case "completed":
        return "text-green-800 border-green-200 bg-green-50";
      case "in_progress":
        return "text-yellow-800 border-yellow-200 bg-yellow-50";
      case "pending":
        return "text-red-800 border-red-200 bg-red-50";
      case "scheduled":
        return "text-blue-800 border-blue-200 bg-blue-50";
      default:
        return "text-gray-800 border-gray-200 bg-gray-50";
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case "completed":
        return "Hoàn thành";
      case "in_progress":
        return "Đang thực hiện";
      case "pending":
        return "Chờ thực hiện";
      case "scheduled":
        return "Lên lịch";
      default:
        return "Không xác định";
    }
  };

  const handleCopyCoordinates = () => {
    if (work.coordinates) {
      const { lat, lng } = work.coordinates;
      const coordinatesText = `${lat}, ${lng}`;
      navigator.clipboard
        .writeText(coordinatesText)
        .then(() => {
          toast?.success({
            title: "Sao chép thành công",
            message: `Tọa độ: ${coordinatesText}`,
            duration: 2000,
          });
        })
        .catch(() => {
          toast?.error({
            title: "Lỗi sao chép",
            message: "Không thể sao chép tọa độ",
            duration: 2000,
          });
        });
    }
  };

  const handleCopyAddress = () => {
    if (work.address || work.location) {
      const addressText = work.address || work.location;
      navigator.clipboard
        .writeText(addressText)
        .then(() => {
          toast?.success({
            title: "Sao chép thành công",
            message: "Địa chỉ đã được sao chép",
            duration: 2000,
          });
        })
        .catch(() => {
          toast?.error({
            title: "Lỗi sao chép",
            message: "Không thể sao chép địa chỉ",
            duration: 2000,
          });
        });
    }
  };

  const handleCallTechnician = (phone) => {
    if (!phone) {
      toast?.warn({
        title: "Không có thông tin",
        message: "Không có số điện thoại",
        duration: 2000,
      });
      return;
    }
    window.location.href = `tel:${phone}`;
  };

  return (
    <Modal visible={visible} onClose={onClose} className="rounded-t-3xl">
      <Box className="p-0 space-y-3 pb-6">
        {/* Work Header */}
        <Box className="pb-3 border-b border-gray-200 pt-1">
          <Box className="flex-1 min-w-0 mb-2">
            <Box className="flex gap-1 mb-1">
              <Text className="font-bold text-sm text-blue-600 uppercase">{work.title}</Text>
            </Box>
          </Box>
          <Box className="flex items-center justify-between gap-2 mt-3">
            <Box className="flex items-center space-x-1 text-xs text-gray-600">
              <Icon icon="zi-calendar" size={14} />
              <Text>{work.scheduledDate || work.date || "N/A"}</Text>
              <Box className={`inline-block px-2 rounded text-xs font-semibold border ${getStatusColor(work.status)}`}>
                {getStatusLabel(work.status)}
              </Box>
            </Box>
            {work.progress !== undefined && (
              <Box className="flex items-center space-x-1 text-xs font-semibold text-blue-600">
                <Icon icon="zi-check-circle" size={14} />
                <Text>{work.progress}%</Text>
              </Box>
            )}
          </Box>
        </Box>

        {/* Basic Info Section */}
        <Box>
          <Text className="text-xs text-gray-500 uppercase font-bold mb-2 block">Thông Tin Cơ Bản</Text>
          <Box className="space-y-2">
            {(work.serviceType || work.service) && (
              <Box className="p-2 bg-gray-50 rounded-lg border border-gray-200">
                <Text className="text-xs text-gray-600 font-semibold mb-0.5">Phân loại công việc</Text>
                <Text className="text-xs font-semibold text-gray-900">{work.serviceType || "Không xác định"}</Text>
              </Box>
            )}
            {work.equipment && (
              <Box className="p-2 bg-gray-50 rounded-lg border border-gray-200">
                <Text className="text-xs text-gray-600 font-semibold mb-0.5">Hạng mục công việc</Text>
                <Text className="text-xs font-semibold text-gray-900">{work.equipment}</Text>
              </Box>
            )}
            {work.priority && (
              <Box className="p-2 bg-gray-50 rounded-lg border border-gray-200">
                <Text className="text-xs text-gray-600 font-semibold mb-0.5">Mức độ ưu Tiên</Text>
                <Text className="text-xs font-semibold text-gray-900">
                  {work.priority === "high" ? "Cao" : work.priority === "medium" ? "Trung bình" : "Thấp"}
                </Text>
              </Box>
            )}
          </Box>
        </Box>

        {/* Schedule Section */}
        {work.scheduledTime && (
          <Box>
            <Text className="text-xs text-gray-500 uppercase font-bold mb-2 block">Lịch Trình</Text>
            <Box className="p-2 bg-gray-50 rounded-lg border border-gray-200">
              <Text className="text-xs text-gray-600 font-semibold mb-0.5">Giờ</Text>
              <Text className="text-xs font-semibold text-gray-900">{work.scheduledTime}</Text>
            </Box>
          </Box>
        )}

        {/* Technician Section */}
        {work.technicians && work.technicians.length > 0 && (
          <Box>
            <Text className="text-xs text-gray-500 uppercase font-bold mb-2 block">
              Danh sách kỹ thuật viên ({work.technicians.length})
            </Text>
            <Box className="space-y-2">
              {work.technicians.slice(0, 2).map((tech, index) => (
                <Box
                  key={index}
                  className="flex items-center justify-between p-2 bg-blue-50 rounded-lg border border-blue-200"
                >
                  <Box className="flex-1 min-w-0">
                    <Text className="text-xs font-semibold text-gray-900">{tech.name}</Text>
                    <Text className="text-xs text-gray-600">{tech.specialization}</Text>
                  </Box>
                  <button
                    onClick={() => handleCallTechnician(tech.phone)}
                    className="text-blue-600 hover:text-blue-800 p-1.5 hover:bg-blue-100 rounded transition-colors flex-shrink-0"
                    title={`Gọi ${tech.name}`}
                  >
                    <Icon icon="zi-call" size={16} />
                  </button>
                </Box>
              ))}
              {work.technicians.length > 2 && (
                <Text className="text-xs text-gray-600 p-2 text-center">+{work.technicians.length - 2} KTV khác</Text>
              )}
            </Box>
          </Box>
        )}

        {/* Customer Section */}
        <Box>
          <Text className="text-xs text-gray-500 uppercase font-bold mb-2 block">Khách Hàng</Text>
          <Box className="space-y-2">
            {work.customerName && (
              <Box className="p-2 bg-blue-50 rounded-lg border border-blue-200">
                <Text className="text-xs text-gray-600 font-semibold mb-0.5">Tên</Text>
                <Text className="text-xs font-semibold text-blue-600">{work.customerName}</Text>
              </Box>
            )}
            {work.phoneNumber && (
              <Box
                className="p-2 bg-blue-50 rounded-lg border border-blue-200 cursor-pointer hover:bg-blue-100 transition-colors"
                onClick={() => handleCallTechnician(work.phoneNumber)}
              >
                <Text className="text-xs text-gray-600 font-semibold mb-0.5">Số Điện Thoại</Text>
                <Text className="text-xs font-semibold text-blue-600">{work.phoneNumber}</Text>
              </Box>
            )}
          </Box>
        </Box>

        {/* Location Section */}
        <Box>
          <Text className="text-xs text-gray-500 uppercase font-bold mb-2 block">Địa Điểm</Text>
          <Box className="space-y-2">
            {/* Address */}
            {(work.address || work.location) && (
              <Box className="p-2 bg-gray-50 rounded-lg border border-gray-200">
                <Text className="text-xs text-gray-600 font-semibold mb-1">Địa Chỉ</Text>
                <Box className="flex items-start justify-between gap-2">
                  <Text className="text-xs font-semibold text-gray-900 flex-1 line-clamp-3">
                    {work.address || work.location}
                  </Text>
                  <button
                    onClick={handleCopyAddress}
                    className="text-blue-600 hover:text-blue-800 p-1 flex-shrink-0 hover:bg-blue-50 rounded transition-colors"
                    title="Sao chép địa chỉ"
                  >
                    <Icon icon="zi-copy" size={16} />
                  </button>
                </Box>
              </Box>
            )}

            {/* Coordinates */}
            {work.coordinates && (
              <Box className="p-2 bg-gray-50 rounded-lg border border-gray-200">
                <Text className="text-xs text-gray-600 font-semibold mb-1">Tọa Độ</Text>
                <Box className="flex items-center justify-between gap-2">
                  <Box className="flex-1 min-w-0">
                    <Text className="text-xs font-semibold text-gray-900 font-mono truncate">
                      {work.coordinates.lat}, {work.coordinates.lng}
                    </Text>
                    <Text className="text-xs text-gray-500 mt-0.5">Sao chép để dán vào Google Maps</Text>
                  </Box>
                  <button
                    onClick={handleCopyCoordinates}
                    className="text-blue-600 hover:text-blue-800 p-1 flex-shrink-0 hover:bg-blue-50 rounded transition-colors"
                    title="Sao chép tọa độ"
                  >
                    <Icon icon="zi-copy" size={16} />
                  </button>
                </Box>
              </Box>
            )}
          </Box>
        </Box>

        {/* Work Details Section */}
        {work.content && (
          <Box>
            <Text className="text-xs text-gray-500 uppercase font-bold mb-2 block">Nội Dung Công Việc</Text>
            <Box className="p-2 bg-gray-50 rounded-lg border border-gray-200">
              <Text className="text-xs leading-relaxed text-gray-800">{work.content}</Text>
            </Box>
          </Box>
        )}

        {/* Notes Section */}
        {work.notes && (
          <Box>
            <Text className="text-xs text-gray-500 uppercase font-bold mb-2 block">Ghi Chú</Text>
            <Box className="p-2 bg-gray-50 rounded-lg border border-gray-200">
              <Text className="text-xs leading-relaxed text-gray-800 whitespace-pre-wrap">{work.notes}</Text>
            </Box>
          </Box>
        )}

        {/* Action Button */}
        <Box className="pt-2">
          <button
            onClick={onClose}
            className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold transition-colors"
          >
            Đóng
          </button>
        </Box>
      </Box>
    </Modal>
  );
}

export default WorkDetailModal;
