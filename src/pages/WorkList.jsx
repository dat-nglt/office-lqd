import { Box, Text, Icon, Button, Page } from "zmp-ui";
import { useState, useMemo, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import BottomNavigation from "../components/BottomNavigation";
import WorkDetailModal from "../components/WorkDetailModal";
import { ToastContext } from "../components/layout";
import { miniAppGetListOfWorkAssignmentsByID } from "../services/user.service";
import {
  getEndOfMonth,
  getEndOfWeek,
  getStartOfMonth,
  getStartOfWeek,
  isDateInRange,
} from "../hooks/useValidationDate";
import JobListItem from "../components/JobListItem";
import { clearTokens, getTokens, getUserInfoInStorage } from "../config/axiosConfig";

function WorkList() {
  const navigate = useNavigate();
  const toast = useContext(ToastContext);
  const [selectedPeriod, setSelectedPeriod] = useState("today");
  const [selectedWork, setSelectedWork] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [workList, setWorkList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch user info và work assignments từ API
  useEffect(() => {
    const currentToken = getTokens();
    if (!currentToken.accessToken) {
      clearTokens();
    } else {
      const fetchWorkAssignments = async () => {
        try {
          setLoading(true);
          setError(null);
          const userInfo = getUserInfoInStorage();
          const ZAID = userInfo.id;

          // Gọi API để lấy danh sách work assignments
          const response = await miniAppGetListOfWorkAssignmentsByID(ZAID);
          if (response && response.success && response.data) {
            // Transform dữ liệu từ API sang format của workList
            const transformedWorkList = response.data.map((assignment) => ({
              id: assignment.id,
              workName: assignment.work?.title || "Công việc không có tên",
              equipment: assignment.work?.category?.name || "",
              title: assignment.work?.title || "Công việc không có tên",
              required_date: assignment.work?.required_date
                ? new Date(assignment.work.required_date).toLocaleDateString("vi-VN")
                : "Không xác định",
              scheduledDate: assignment.work?.required_date
                ? new Date(assignment.work.required_date).toLocaleDateString("vi-VN")
                : "Không xác định",
              scheduledTime: `${assignment.work?.required_time_hour || "00"}:${String(
                assignment.work?.required_time_minute || 0
              ).padStart(2, "0")}`,
              status: assignment.work.status?.toLowerCase() || "pending",
              priority: assignment.work?.priority?.toLowerCase() || "medium",
              service: assignment.work?.service_type || "Không xác định",
              serviceType: assignment.work?.service_type || "Không xác định",
              progress:
                assignment.work?.status === "completed" ? 100 : assignment.work?.status === "in_progress" ? 50 : 0,
              customerName: assignment.work?.customer_name || "Không xác định",
              phoneNumber: assignment.work?.customer_phone || "",
              location: assignment.work?.location || "Không xác định",
              address: assignment.work?.customer_address || "Không xác định",
              coordinates: {
                lat: assignment.work?.location_lat || 0,
                lng: assignment.work?.location_lng || 0,
              },
              content: assignment.work?.description || "",
              notes: assignment.work?.notes || "Không có ghi chú nào",
              technicians: [
                {
                  name: userInfo?.name || "Kỹ thuật viên",
                  phone: userInfo?.phone || "",
                  specialization: assignment.work?.category?.name || "Không xác định",
                },
              ],
            }));

            setWorkList(transformedWorkList);
          }
        } catch (err) {
          setError("Không thể tải danh sách công việc. Vui lòng thử lại sau khi hoàn thành bảo trì hệ thống.");
          toast?.show?.({
            type: "error",
            message: err.message || "Lỗi khi tải danh sách công việc",
            duration: 2000,
          });
        } finally {
          setLoading(false);
        }
      };
      fetchWorkAssignments();
    }
  }, [selectedPeriod]);

  const handleStartWork = (job) => {
    navigate(`/checkin`);
  };

  const handleProgressReport = (job) => {
    navigate(`/report`);
  };

  const periodOptions = [
    { value: "today", label: "Hôm nay" },
    { value: "week", label: "Tuần này" },
    { value: "month", label: "Tháng này" },
  ];

  const filteredWorkList = useMemo(() => {
    let filtered = workList;

    if (selectedPeriod === "today") {
      filtered = filtered.filter((work) => work.required_date === new Date().toLocaleDateString("vi-VN"));
    } else if (selectedPeriod === "week") {
      const startOfWeek = getStartOfWeek(new Date());
      const endOfWeek = getEndOfWeek(new Date());
      filtered = filtered.filter((work) => isDateInRange(work.required_date, startOfWeek, endOfWeek));
    } else if (selectedPeriod === "month") {
      const startOfMonth = getStartOfMonth(new Date());
      const endOfMonth = getEndOfMonth(new Date());
      filtered = filtered.filter((work) => isDateInRange(work.required_date, startOfMonth, endOfMonth));
    }

    return filtered.sort((a, b) => {
      const statusOrder = { pending: 1, in_progress: 2, completed: 3 };
      return statusOrder[a.status] - statusOrder[b.status];
    });
  }, [workList, selectedPeriod]);

  const getWorkStats = () => {
    const completed = filteredWorkList.filter((w) => w.status === "completed").length;
    const inProgress = filteredWorkList.filter((w) => w.status === "in_progress").length;
    const pending = filteredWorkList.filter((w) => w.status === "pending").length;

    return { completed, inProgress, pending, total: filteredWorkList.length };
  };

  const stats = getWorkStats();

  const handleViewDetail = (work) => {
    setSelectedWork(work);
    setShowDetailModal(true);
  };

  return (
    <Page className="bg-gray-50 min-h-screen pb-20">
      {/* Enhanced Header */}
      <Box className="bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 shadow-lg pb-4 relative overflow-hidden">
        {/* Background Effects */}
        <Box className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full -mr-24 -mt-24"></Box>
        <Box className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full -ml-16 -mb-16"></Box>

        <Box className="px-4 pt-10 mt-5 pb-2 relative z-10">
          {/* Title */}
          <Box className="flex items-center justify-between mb-4">
            <Text.Title className="text-white font-bold" size="large">
              Lịch Công Việc
            </Text.Title>
            <Box className="flex items-center space-x-2 text-sm text-blue-100">
              <Icon icon="zi-clock-1" size={16} />
              <Text>{new Date().toLocaleDateString("vi-VN")}</Text>
            </Box>
          </Box>

          {/* Quick Stats */}
          <Box className="grid grid-cols-4 gap-2 mb-3">
            <Box className="bg-white/15 backdrop-blur-md rounded-xl p-2 border border-white/20 text-center">
              <Text className="text-sm font-bold text-white">{stats.pending}</Text>
              <Text className="text-xs text-blue-100/70">Chờ</Text>
            </Box>
            <Box className="bg-white/15 backdrop-blur-md rounded-xl p-2 border border-white/20 text-center">
              <Text className="text-sm font-bold text-white">{stats.inProgress}</Text>
              <Text className="text-xs text-blue-100/70">Đang</Text>
            </Box>
            <Box className="bg-white/15 backdrop-blur-md rounded-xl p-2 border border-white/20 text-center">
              <Text className="text-sm font-bold text-white">{stats.completed}</Text>
              <Text className="text-xs text-blue-100/70">Xong</Text>
            </Box>
            <Box className="bg-white/15 backdrop-blur-md rounded-xl p-2 border border-white/20 text-center">
              <Text className="text-sm font-bold text-white">{stats.total}</Text>
              <Text className="text-xs text-blue-100/70">Tổng</Text>
            </Box>
          </Box>

          <Box className="flex space-x-2">
            {periodOptions.map((option) => (
              <Button
                key={option.value}
                size="small"
                variant={selectedPeriod === option.value ? "primary" : "secondary"}
                className={`flex-1 rounded-lg text-xs ${
                  selectedPeriod === option.value ? "bg-white text-blue-600" : "bg-white/20 text-white"
                }`}
                onClick={() => setSelectedPeriod(option.value)}
              >
                {option.label}
              </Button>
            ))}
          </Box>
        </Box>
      </Box>

      <Box className="p-4 pb-20">
        {/* Work Cards Grid */}
        <Box className="space-y-3">
          {loading ? (
            <Box className="text-center py-12">
              <Icon icon="zi-spinner" className="text-blue-600 text-5xl mb-4 animate-spin" />
              <Text className="text-gray-600 font-semibold">Đang tải danh sách công việc...</Text>
            </Box>
          ) : error ? (
            <Box className="text-center py-12">
              <Icon icon="zi-alert" className="text-yellow-600 text-5xl mb-4" />
              <Text className="text-yellow-600 mb-2 font-semibold">Sự cố hệ thống</Text>
              <Text className="text-gray-500 text-sm">{error}</Text>
            </Box>
          ) : filteredWorkList.length > 0 ? (
            filteredWorkList.map((work) => (
              <JobListItem
                sx={"border border-gray-200 rounded-lg shadow-sm bg-white"}
                key={work.id}
                job={work}
                onStartWork={handleStartWork}
                onProgressReport={handleProgressReport}
                onShowDetail={handleViewDetail}
              />
            ))
          ) : (
            <Box className="text-center py-12">
              <Icon icon="zi-calendar-check" className="text-gray-400 text-5xl mb-4" />
              <Text className="text-gray-500 mb-2 font-semibold">Không có công việc nào</Text>
              <Text className="text-gray-400 text-sm">Chọn khoảng thời gian khác để xem</Text>
            </Box>
          )}
        </Box>
      </Box>

      {/* Work Detail Modal - Use Component */}
      <WorkDetailModal visible={showDetailModal} onClose={() => setShowDetailModal(false)} work={selectedWork} />

      <BottomNavigation />
    </Page>
  );
}

export default WorkList;
