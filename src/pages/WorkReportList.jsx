import { Box, Button, Icon, Page, Text } from "zmp-ui";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import BottomNavigation from "../components/BottomNavigation";
import { getUserInfoInStorage } from "../config/axiosConfig";
import { miniAppGetListOfWorkAssignmentsByID } from "../services/user.service";

function WorkReportList() {
  const navigate = useNavigate();
  const [assignedWorks, setAssignedWorks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [workReportsByWork, setWorkReportsByWork] = useState({});

  // Mock data cho báo cáo công việc với hình ảnh
  const mockWorkReports = {
    1: [
      {
        id: 101,
        date: "2024-01-15",
        status: "completed",
        beforeImages: [
          { id: "b1", url: "https://via.placeholder.com/400x300?text=Before+1", caption: "Trước khi thực hiện 1" },
          { id: "b2", url: "https://via.placeholder.com/400x300?text=Before+2", caption: "Trước khi thực hiện 2" },
        ],
        afterImages: [
          { id: "a1", url: "https://via.placeholder.com/400x300?text=After+1", caption: "Sau khi thực hiện 1" },
          { id: "a2", url: "https://via.placeholder.com/400x300?text=After+2", caption: "Sau khi thực hiện 2" },
        ],
        description: "Lắp đặt hệ thống điện hoàn tất",
        actualStartTime: "08:15",
        actualEndTime: "17:30",
        notes: "Hoàn thành đúng kế hoạch, khách hàng hài lòng",
      },
      {
        id: 102,
        date: "2024-01-16",
        status: "completed",
        beforeImages: [
          { id: "b3", url: "https://via.placeholder.com/400x300?text=Before+3", caption: "Trước khi thực hiện 3" },
        ],
        afterImages: [
          { id: "a3", url: "https://via.placeholder.com/400x300?text=After+3", caption: "Sau khi thực hiện 3" },
          { id: "a4", url: "https://via.placeholder.com/400x300?text=After+4", caption: "Sau khi thực hiện 4" },
        ],
        description: "Lắp đặt hệ thống điện tiếp tục",
        actualStartTime: "08:00",
        actualEndTime: "16:45",
        notes: "Tiến độ tốt",
      },
    ],
    2: [
      {
        id: 103,
        date: "2024-01-17",
        status: "in_progress",
        beforeImages: [
          { id: "b4", url: "https://via.placeholder.com/400x300?text=Before+4", caption: "Trước khi thực hiện 4" },
          { id: "b5", url: "https://via.placeholder.com/400x300?text=Before+5", caption: "Trước khi thực hiện 5" },
        ],
        afterImages: [
          { id: "a5", url: "https://via.placeholder.com/400x300?text=After+5", caption: "Sau khi thực hiện 5" },
        ],
        description: "Bảo trì điều hòa - Đang thực hiện",
        actualStartTime: "09:30",
        actualEndTime: null,
        notes: "Đang tiến hành bảo trì máy lạnh tầng 2",
      },
    ],
  };

  useEffect(() => {
    const fetchAssignedWorks = async () => {
      try {
        setLoading(true);
        const user = getUserInfoInStorage();
        if (!user?.id) {
          setLoading(false);
          return;
        }
        const resp = await miniAppGetListOfWorkAssignmentsByID(user.id);
        if (resp && resp.success && resp.data) {
          const works = resp.data.map((a) => ({
            id: a.id,
            title: a.work?.title || "Công việc không tên",
            description: a.work?.description || "Không có mô tả",
            company: a.work?.company || "NEXUS HOUSE",
            customer: a.work?.customer || "Khách hàng",
            location: a.work?.location || "Địa điểm",
            status: a.work?.status || "pending",
            priority: a.work?.priority || "normal",
            startDate: a.work?.startDate || new Date().toISOString().split("T")[0],
          }));
          setAssignedWorks(works);

          // Mock: Tạo dữ liệu báo cáo cho các công việc
          const reportsMap = {};
          works.forEach((work, idx) => {
            reportsMap[work.id] = mockWorkReports[idx + 1] || [];
          });
          setWorkReportsByWork(reportsMap);
        }
      } catch (err) {
        console.error("Failed to fetch assigned works", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAssignedWorks();
  }, []);

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

  {
    /* // View danh sách công việc */
  }
  return (
    <Page className="bg-gray-50 min-h-screen">
      {/* Header */}
      <Box className="bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 shadow-lg pb-4 relative overflow-hidden">
        <Box className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full -mr-24 -mt-24"></Box>
        <Box className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full -ml-16 -mb-16"></Box>

        <Box className="px-4 pt-6 pb-4 relative z-10">
          <Box className="flex items-center space-x-3 mb-3 mt-10">
            <Text.Title className="text-white font-bold" size="large">
              Danh Sách Công Việc
            </Text.Title>
          </Box>

          <Box className="flex gap-2">
            <Box className="flex-1 bg-white/15 rounded-lg px-3 py-2 text-center border border-white/20">
              <Text className="text-white font-bold text-sm">{assignedWorks.length}</Text>
              <Text className="text-blue-100 text-xs">Công việc</Text>
            </Box>
            <Box className="flex-1 bg-white/15 rounded-lg px-3 py-2 text-center border border-white/20">
              <Text className="text-white font-bold text-sm">{Object.values(workReportsByWork).flat().length}</Text>
              <Text className="text-blue-100 text-xs">Báo cáo</Text>
            </Box>
          </Box>
        </Box>
      </Box>

      <Box className="px-4 pt-4 pb-28">
        {loading ? (
          <Box className="text-center py-12">
            <Icon icon="zi-loading" className="text-blue-600 text-4xl mb-3 animate-spin" />
            <Text className="text-gray-600">Đang tải dữ liệu...</Text>
          </Box>
        ) : assignedWorks.length > 0 ? (
          <Box className="space-y-3">
            {assignedWorks.map((work) => {
              const reports = workReportsByWork[work.id] || [];
              const completedReports = reports.filter((r) => r.status === "completed").length;
              return (
                <Box
                  key={work.id}
                  onClick={() => navigate(`/work-detail/${work.id}`)}
                  className="bg-white rounded-lg p-4 shadow-sm border border-gray-100 hover:border-blue-300 hover:shadow-md transition-all cursor-pointer"
                >
                  {/* Header */}
                  <Box className="flex items-start justify-between mb-3">
                    <Box className="flex-1">
                      <Text className="font-semibold text-gray-900 text-base">{work.title}</Text>
                    </Box>
                  </Box>

                  {/* Info Grid */}
                  <Box className="bg-gray-50 rounded-lg p-3 mb-3 space-y-4">
                    <Box className="flex items-center justify-between">
                      <Box className="flex items-center space-x-2">
                        <Icon icon="zi-location" className="text-blue-600" size={14} />
                        <Text className="text-xs text-gray-600">Công ty:</Text>
                      </Box>
                      <Text className="text-xs  text-gray-900">{work.company}</Text>
                    </Box>
                    <Box className="flex items-center justify-between">
                      <Box className="flex items-center space-x-2">
                        <Icon icon="zi-user" className="text-green-600" size={14} />
                        <Text className="text-xs text-gray-600">Khách hàng:</Text>
                      </Box>
                      <Text className="text-xs  text-gray-900">{work.customer}</Text>
                    </Box>
                    <Box className="flex items-center justify-between">
                      <Box className="flex items-center space-x-2">
                        <Icon icon="zi-calendar" className="text-orange-600" size={14} />
                        <Text className="text-xs text-gray-600">Ngày bắt đầu:</Text>
                      </Box>
                      <Text className="text-xs  text-gray-900">{work.startDate}</Text>
                    </Box>
                    <Box className="flex items-center justify-between">
                      <Box className="flex items-center space-x-2">
                        <Icon icon="zi-calendar" className="text-orange-600" size={14} />
                        <Text className="text-xs text-gray-600">Trạng thái:</Text>
                      </Box>
                      <Text className="text-xs  text-gray-900">{getStatusText(work.status)}</Text>
                    </Box>
                  </Box>

                  {/* Footer */}
                  <Box className="flex items-center justify-between">
                    <Box className="flex items-center space-x-3">
                      <Box className={`px-2 py-1 rounded text-xs font-semibold ${getPriorityColor(work.priority)}`}>
                        Độ ưu tiên: {getPriorityText(work.priority)}
                      </Box>
                      <Box className="text-xs text-gray-600">
                        Báo cáo: <span className="font-bold text-blue-600">{reports.length}</span>
                        {completedReports > 0 && (
                          <span className="text-green-600 ml-1">({completedReports} hoàn thành)</span>
                        )}
                      </Box>
                    </Box>
                    <Icon icon="zi-chevron-right" className="text-gray-400" size={16} />
                  </Box>
                </Box>
              );
            })}
          </Box>
        ) : (
          <Box className="text-center py-12">
            <Icon icon="zi-inbox" className="text-gray-400 text-4xl mb-3" />
            <Text className="text-gray-600 font-semibold">Không có công việc nào</Text>
            <Text className="text-gray-500 text-sm mt-1">Bạn chưa có công việc được phân bổ</Text>
          </Box>
        )}
      </Box>

      <BottomNavigation />
    </Page>
  );
}

export default WorkReportList;
