import { Box, Button, Icon, Page, Text } from "zmp-ui";
import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import BottomNavigation from "../components/BottomNavigation";

function WorkReportDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [selectedImage, setSelectedImage] = useState(null);

  // Mock data - in real app, fetch from API or context
  const [workReport] = useState({
    id: parseInt(id),
    title: "Lắp đặt hệ thống điện",
    date: "2024-01-15",
    company: "NEXUS HOUSE",
    location: "05A Quốc Hương, Phường An Khánh, Quận 2, TP.HCM",
    customer: "Nguyễn Văn A",
    status: "completed",
    priority: "high",
    startDate: "2024-01-15",
  });

  // Single report detail
  const [report] = useState({
    id: 101,
    date: "2024-01-15",
    status: "completed",
    beforeImages: [
      {
        id: "b1",
        url: "https://dienlanhlamquangdai.vn/uploads/large/anh-nen/490794514-1169641748507151-6122091388124195332-n-(1).jpg",
        caption: "Trước khi thực hiện 1",
      },
      {
        id: "b2",
        url: "https://dienlanhlamquangdai.vn/uploads/large/anh-nen/490794514-1169641748507151-6122091388124195332-n-(1).jpg",
        caption: "Trước khi thực hiện 2",
      },
      {
        id: "b3",
        url: "https://dienlanhlamquangdai.vn/uploads/large/anh-nen/490794514-1169641748507151-6122091388124195332-n-(1).jpg",
        caption: "Trước khi thực hiện 3",
      },
    ],
    inProgressImages: [
      {
        id: "b1",
        url: "https://dienlanhlamquangdai.vn/uploads/large/anh-nen/490794514-1169641748507151-6122091388124195332-n-(1).jpg",
        caption: "Trước khi thực hiện 1",
      },
      {
        id: "b2",
        url: "https://dienlanhlamquangdai.vn/uploads/large/anh-nen/490794514-1169641748507151-6122091388124195332-n-(1).jpg",
        caption: "Trước khi thực hiện 2",
      },
    ],
    afterImages: [
      {
        id: "a1",
        url: "https://dienlanhlamquangdai.vn/uploads/large/anh-nen/490794514-1169641748507151-6122091388124195332-n-(1).jpg",
        caption: "Sau khi thực hiện 1",
      },
      {
        id: "a2",
        url: "https://dienlanhlamquangdai.vn/uploads/large/anh-nen/490794514-1169641748507151-6122091388124195332-n-(1).jpg",
        caption: "Sau khi thực hiện 2",
      },
    ],
    description: "Lắp đặt hệ thống điện hoàn tất",
    actualStartTime: "08:15",
    actualEndTime: "17:30",
    notes: "Hoàn thành đúng kế hoạch, khách hàng hài lòng",
  });

  const getStatusColor = (status) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "in_progress":
        return "bg-blue-100 text-blue-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "completed":
        return "Hoàn thành";
      case "in_progress":
        return "Đang thực hiện";
      case "pending":
        return "Chờ xử lý";
      default:
        return "Không xác định";
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      case "low":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getPriorityText = (priority) => {
    switch (priority) {
      case "high":
        return "Cao";
      case "medium":
        return "Trung bình";
      case "low":
        return "Thấp";
      default:
        return "Bình thường";
    }
  };

  return (
    <Page className="bg-gray-50 min-h-screen">
      {/* Image Modal Dialog */}
      {selectedImage && (
        <Box className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4" onClick={() => setSelectedImage(null)}>
          <Box className="bg-white rounded-lg p-4 max-w-2xl max-h-[90vh] overflow-auto" onClick={(e) => e.stopPropagation()}>
            <Box className="flex items-center justify-between mb-3">
              <Text className="font-semibold text-gray-900">{selectedImage.caption}</Text>
              <Button
                variant="secondary"
                size="small"
                onClick={() => setSelectedImage(null)}
                className="!p-1"
              >
                <Icon icon="zi-close" size={18} />
              </Button>
            </Box>
            <img
              src={selectedImage.url}
              alt={selectedImage.caption}
              className="w-full h-auto rounded-lg"
            />
          </Box>
        </Box>
      )}
      {/* Header */}
      <Box className="bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 shadow-lg pb-4 relative overflow-hidden">
        <Box className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full -mr-24 -mt-24"></Box>
        <Box className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full -ml-16 -mb-16"></Box>

        <Box className="px-4 pt-6 pb-4 relative z-10">
          <Box className="flex items-center space-x-3 mb-1 mt-10">
            <Text.Title className="text-white font-bold" size="large">
              Chi Tiết Báo Cáo Công Việc
            </Text.Title>
          </Box>
          <Box className="flex items-center space-x-3 ">
            <Text.Title className="text-white text-sm" size="large">
              {workReport.title} - {workReport.date}
            </Text.Title>
          </Box>
        </Box>
      </Box>

      <Box className="px-4 pt-4 pb-28">
        {/* Work Info Card */}
        <Box className="bg-white rounded-lg shadow-sm border border-gray-100 mb-4 p-4 space-y-3">
          {/* Work */}
          <Box className="flex items-center justify-between">
            <Box className="flex items-center space-x-2">
              <Icon icon="zi-info-circle" className="text-blue-600" size={14} />
              <Text className="text-xs text-gray-600 min-w-[80px]">Công việc:</Text>
            </Box>
            <Text className="text-xs  text-gray-900">{workReport.title}</Text>
          </Box>

          {/* Location */}
          <Box className="flex items-center justify-between border-t border-gray-100 pt-3">
            <Box className="flex items-center space-x-2">
              <Icon icon="zi-home" className="text-red-500" size={14} />
              <Text className="text-xs text-gray-600 min-w-[80px]">Công ty:</Text>
            </Box>
            <Text className="text-xs  text-gray-900 text-right">{workReport.company}</Text>
          </Box>

          {/* Priority */}
          <Box className="flex items-center justify-between border-t border-gray-100 pt-3">
            <Box className="flex items-center space-x-2">
              <Icon icon="zi-clock-1" className="text-orange-600" size={14} />
              <Text className="text-xs text-gray-600 min-w-[80px]">Thời gian:</Text>
            </Box>
            <Box className={`text-xs rounded `}>
              {report.actualStartTime} - {report.actualEndTime || "Đang thực hiện..."}
            </Box>
          </Box>

          {/* Customer */}
          <Box className="flex items-center justify-between border-t border-gray-100 pt-3">
            <Box className="flex items-center space-x-2">
              <Icon icon="zi-user" className="text-green-600" size={14} />
              <Text className="text-xs text-gray-600 min-w-[80px]">Khách hàng:</Text>
            </Box>
            <Text className="text-xs  text-gray-900">{workReport.customer}</Text>
          </Box>

          {/* Location */}
          <Box className="flex items-center justify-between border-t border-gray-100 pt-3">
            <Box className="flex items-center space-x-2">
              <Icon icon="zi-location" className="text-red-500" size={14} />
              <Text className="text-xs text-gray-600 min-w-[80px]">Địa chỉ:</Text>
            </Box>
            <Text className="text-xs  text-gray-900 text-right">{workReport.location}</Text>
          </Box>
        </Box>

        {/* Images Section */}
        <Box className="mb-4">
          <Text className="font-semibold text-gray-800 text-sm mb-3 flex items-center">
            <Icon icon="zi-gallery" className="mr-2 text-blue-600" size={16} />
            Hình Ảnh Báo Cáo
          </Text>

          {/* Before Images */}
          {report.beforeImages.length > 0 && (
            <Box className="mb-4">
              <Text className="text-xs font-semibold text-gray-700 mb-2 flex items-center">
                <Icon icon="zi-link" size={12} className="mr-1 text-red-500" />
                Trước khi thực hiện ({report.beforeImages.length})
              </Text>
              <Box className="grid grid-cols-2 gap-2 mb-5">
                {report.beforeImages.map((img) => (
                  <Box
                    key={img.id}
                    className="relative group overflow-hidden rounded-lg bg-gray-200 aspect-video cursor-pointer"
                    title={img.caption}
                    onClick={() => setSelectedImage(img)}
                  >
                    <img
                      src={img.url}
                      alt={img.caption}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                    />
                    <Box className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2">
                      <Text className="text-xs text-white font-semibold line-clamp-1">{img.caption}</Text>
                    </Box>
                  </Box>
                ))}
              </Box>
            </Box>
          )}

          {/* Before Images */}
          {report.beforeImages.length > 0 && (
            <Box className="mb-4">
              <Text className="text-xs font-semibold text-gray-700 mb-2 flex items-center">
                <Icon icon="zi-link" size={12} className="mr-1 text-red-500" />
                Trong khi thực hiện ({report.inProgressImages.length})
              </Text>
              <Box className="grid grid-cols-2 gap-2 mb-5">
                {report.inProgressImages.map((img) => (
                  <Box
                    key={img.id}
                    className="relative group overflow-hidden rounded-lg bg-gray-200 aspect-video cursor-pointer"
                    title={img.caption}
                    onClick={() => setSelectedImage(img)}
                  >
                    <img
                      src={img.url}
                      alt={img.caption}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                    />
                    <Box className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2">
                      <Text className="text-xs text-white font-semibold line-clamp-1">{img.caption}</Text>
                    </Box>
                  </Box>
                ))}
              </Box>
            </Box>
          )}

          {/* After Images */}
          {report.afterImages.length > 0 && (
            <Box>
              <Text className="text-xs font-semibold text-gray-700 mb-2  flex items-center">
                <Icon icon="zi-link" size={12} className="mr-1 text-red-500" />
                Sau khi thực hiện ({report.afterImages.length})
              </Text>
              <Box className="grid grid-cols-2 gap-2">
                {report.afterImages.map((img) => (
                  <Box
                    key={img.id}
                    className="relative group overflow-hidden rounded-lg bg-gray-200 aspect-video cursor-pointer"
                    title={img.caption}
                    onClick={() => setSelectedImage(img)}
                  >
                    <img
                      src={img.url}
                      alt={img.caption}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                    />
                    <Box className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2">
                      <Text className="text-xs text-white font-semibold line-clamp-1">{img.caption}</Text>
                    </Box>
                  </Box>
                ))}
              </Box>
            </Box>
          )}
        </Box>

        {/* Notes Section */}
        {report.notes && (
          <Box className="bg-amber-50 rounded-lg border border-amber-200 p-3 mb-6">
            <Text className="text-xs font-semibold text-amber-900 mb-2 flex items-center">
              <Icon icon="zi-edit" size={14} className="mr-2" />
              Ghi Chú
            </Text>
            <Text className="text-xs text-amber-900 leading-relaxed">{report.notes}</Text>
          </Box>
        )}

        {/* Back Button */}
        <Button
          variant="primary"
          fullWidth
          onClick={() => navigate(-1)}
          className="py-3 rounded-lg font-semibold text-base bg-gray-600 text-white hover:bg-gray-700"
        >
          ← Quay Lại
        </Button>
      </Box>

      <BottomNavigation />
    </Page>
  );
}

export default WorkReportDetail;
