import { Box, Text, Icon, Page, Modal, Input, DatePicker } from "zmp-ui";
import { useState, useContext, useEffect, useRef } from "react";
import { getPriorityColor, getPriorityLabel, getStatusColor, getStatusLabel } from "../hooks/useLabelColor";
import { miniAppGetListOfWorkAssignmentsByID, miniAppGetProfileInfoByID } from "../services/user.service";
import { clearTokens, getTokens, getUserInfoInStorage } from "../config/axiosConfig";
import BottomNavigation from "../components/BottomNavigation";
import WorkDetailModal from "../components/WorkDetailModal";
import OvertimeRequestModal from "../components/OvertimeRequestModal";
import { ToastContext } from "../components/layout";
import { getAllTechniciansService, requestOvertimeService } from "../services/work-management.service";

function WorkManagement() {
  const toast = useContext(ToastContext);
  const today = new Date().toLocaleDateString("vi-VN");

  // Technician list for reference
  const [availableTechnicians, setAvailableTechnicians] = useState([]);

  const fetchAvailableTechnicians = async () => {
    try {
      const availableTechniciansResp = await getAllTechniciansService();
      if (availableTechniciansResp.status === "success") {
        console.log("Available technicians:", availableTechniciansResp);
        setAvailableTechnicians(availableTechniciansResp.data);
      }
    } catch (error) {
      console.error("Error fetching available technicians:", error);
    }
  };

  // Helper function to get technician names from IDs
  const getTechnicianNames = (techIds) => {
    return techIds.map((id) => availableTechnicians.find((t) => t.id === id)?.name || `ID: ${id}`).join(", ");
  };

  const [workList, setWorkList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showOvertimeModal, setShowOvertimeModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedWork, setSelectedWork] = useState(null);
  const [newDate, setNewDate] = useState(new Date());
  const [newTime, setNewTime] = useState("08:00");
  const [cancelReason, setCancelReason] = useState("");
  const cancelInputRef = useRef(null);
  const cancelReasonMax = 300;
  const cancelReasonMin = 5;
  // Consolidated overtime request state
  const [overtimeRequest, setOvertimeRequest] = useState({
    type: "overtime_lunch", // overtime_lunch | overtime_night | other
    reason: "Hoàn thành công việc ngoài giờ",
    startTime: "17:00",
    endTime: "21:00",
    technicians: [],
    work: "",
    workId: null,
    userRequestingId: getUserInfoInStorage()?.id || null,
  });

  // Filter only today's work
  const todayWorkList = workList.filter((w) => w.scheduledDate === today);
  console.log("Today's work list:", todayWorkList);

  const handleReschedule = (work) => {
    setSelectedWork(work);
    if (work.scheduledDate && work.scheduledDate.includes("/")) {
      const dateParts = work.scheduledDate.split("/");
      setNewDate(new Date(dateParts[2], parseInt(dateParts[1]) - 1, dateParts[0]));
    } else {
      setNewDate(new Date());
    }
    const startTime = work.scheduledTime ? work.scheduledTime.split(" - ")[0] : work.scheduledTime || "08:00";
    setNewTime(startTime);
    setShowRescheduleModal(true);
  };

  const handleCancel = (work) => {
    setSelectedWork(work);
    setCancelReason("");
    setShowCancelModal(true);
  };

  const handleRequestOvertime = async (work) => {
    const userId = getUserInfoInStorage()?.id;
    const userInSystem = await miniAppGetProfileInfoByID(userId);
    setSelectedWork(work);
    setOvertimeRequest({
      type: "overtime_lunch",
      reason: "Hoàn thành công việc ngoài giờ",
      startTime: "11:30",
      endTime: "13:00",
      technicians: userId ? [userInSystem?.data?.id] : [], // Thêm ID người dùng hiện tại vào mảng technicians ban đầu
      work: work.title,
      workId: work.id,
      userRequestingId: userInSystem?.data?.id || null,
    });
    setShowOvertimeModal(true);
  };

  const handleShowDetail = (work) => {
    setSelectedWork(work);
    setShowDetailModal(true);
  };

  const confirmReschedule = () => {
    if (selectedWork) {
      setWorkList(
        workList.map((w) =>
          w.id === selectedWork.id
            ? {
                ...w,
                scheduledDate: newDate.toLocaleDateString("vi-VN"),
                scheduledTime: `${newTime} - ${parseInt(newTime) + 3}:00`,
                status: "pending",
              }
            : w
        )
      );
      toast?.success({
        title: "Cập nhật thành công",
        message: "Lịch công việc đã được thay đổi!",
        duration: 2500,
      });
      setShowRescheduleModal(false);
    }
  };

  const confirmCancel = () => {
    const reason = cancelReason.trim();
    if (selectedWork && reason.length >= cancelReasonMin) {
      setWorkList(workList.filter((w) => w.id !== selectedWork.id));
      toast?.success({
        title: "Hủy thành công",
        message: `Công việc đã được hủy. Lý do: ${reason}`,
        duration: 3500,
      });
      setShowCancelModal(false);
    } else {
      toast?.error({
        title: "Thông tin chưa đủ",
        message: `Vui lòng nhập lý do hủy (${cancelReasonMin} ký tự trở lên).`,
        duration: 2500,
      });
    }
  };

  // Function to calculate overtime hours
  const calculateOvertimeHours = () => {
    const start = new Date(`1970-01-01T${overtimeRequest.startTime}:00`);
    const end = new Date(`1970-01-01T${overtimeRequest.endTime}:00`);
    const diffMs = end - start;
    const diffHours = diffMs / (1000 * 60 * 60);
    return diffHours > 0 ? diffHours : 0;
  };

  const confirmOvertimeRequest = async () => {
    const hours = calculateOvertimeHours();

    if (selectedWork && overtimeRequest.reason.trim() && hours > 0 && overtimeRequest.type) {
      const technicianNames = getTechnicianNames(overtimeRequest.technicians);
      const requestOverTimeResp = await requestOvertimeService(overtimeRequest);

      console.log("Overtime request response:", requestOverTimeResp);

      if (requestOverTimeResp && requestOverTimeResp.success) {
        toast?.success({
          title: "Yêu cầu thành công",
          message: `Yêu cầu ${
            overtimeRequest.type === "overtime_lunch"
              ? "tăng ca trưa"
              : overtimeRequest.type === "overtime_night"
              ? "tăng ca tối"
              : "tăng ca"
          } ${hours} giờ cho ${technicianNames} đã được gửi!`,
          duration: 2500,
        });
      } else {
        toast?.error({
          title: "Yêu cầu thất bại",
          message: requestOverTimeResp.message || "Đã có lỗi xảy ra khi gửi yêu cầu tăng ca.",
          duration: 2500,
        });
      }

      setShowOvertimeModal(false);
    } else {
      toast?.error({
        title: "Thông tin chưa đủ",
        message: "Vui lòng nhập đủ thông tin (loại tăng ca, lý do, thời gian) và chọn kỹ thuật viên!",
        duration: 2500,
      });
    }
  };

  // Focus cancel reason input when modal opens
  useEffect(() => {
    if (showCancelModal) {
      setTimeout(() => cancelInputRef.current?.focus(), 120);
    }
  }, [showCancelModal]);

  // Fetch today's work assignments from backend and transform to UI shape
  useEffect(() => {
    const currentToken = getTokens();
    if (!currentToken?.accessToken) {
      clearTokens();
      setLoading(false);
      return;
    }
    const fetchWorkAssignments = async () => {
      try {
        setLoading(true);
        setError(null);
        const userInfo = getUserInfoInStorage();
        const ZAID = userInfo.id;
        const response = await miniAppGetListOfWorkAssignmentsByID(ZAID);
        if (response && response.success && response.data) {
          const transformedWorkList = response.data.map((assignment) => ({
            id: assignment.work.id,
            title: assignment.work?.title || "Công việc không có tên",
            assignedStatus: assignment.assigned_status || "pending",
            serviceType: assignment.work?.service_type || "Không xác định",
            equipment: assignment.work?.category?.name || "",
            company: assignment.work?.customer_name || "",
            location: assignment.work?.location || "Không xác định",
            address: assignment.work?.customer_address || "Không xác định",
            coordinates: {
              lat: assignment.work?.location_lat || 0,
              lng: assignment.work?.location_lng || 0,
            },
            scheduledDate: assignment.work?.required_date
              ? new Date(assignment.work.required_date).toLocaleDateString("vi-VN")
              : "Không xác định",
            scheduledTime: `${assignment.work?.required_time_hour || "00"}:${String(
              assignment.work?.required_time_minute || 0
            ).padStart(2, "0")}`,
            status: assignment.work?.status?.toLowerCase() || "pending",
            priority: assignment.work?.priority?.toLowerCase() || "medium",
            customerName: assignment.work?.customer_name || "Không xác định",
            phoneNumber: assignment.work?.customer_phone || "",
            notes: assignment.work?.notes || "Không có ghi chú nào",
            content: assignment.work?.description || "",
          }));
          setWorkList(transformedWorkList);
        } else {
          setWorkList([]);
        }
      } catch (err) {
        setError("Không thể tải danh sách công việc. Vui lòng thử lại sau.");
        toast?.show?.({
          type: "error",
          message: err.message || "Lỗi khi tải danh sách công việc",
          duration: 2000,
        });
      } finally {
        setLoading(false);
      }
    };
    fetchAvailableTechnicians();
    fetchWorkAssignments();
  }, []);

  const handleRefreshData = () => {
    fetchWorkAssignments();
  };

  const stats = {
    total: todayWorkList.length,
    pending: todayWorkList.filter((w) => w.status === "pending").length,
    inProgress: todayWorkList.filter((w) => w.status === "in_progress").length,
    completed: todayWorkList.filter((w) => w.status === "completed").length,
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
              Quản Lý Công Việc
            </Text.Title>
            <Box className="flex items-center space-x-2 text-sm text-blue-100">
              <Icon icon="zi-clock-1" size={16} />
              <Text>{today}</Text>
            </Box>
          </Box>

          {/* Quick Stats */}
          <Box className="grid grid-cols-3 gap-2 mb-3">
            <Box className="bg-white/10 backdrop-blur-md rounded-xl p-2 border border-white/20 text-center">
              <Text className="text-sm font-bold text-blue-100">{stats.total}</Text>
              <Text className="text-xs text-blue-100/70">Tổng công việc</Text>
            </Box>
            <Box className="bg-white/10 backdrop-blur-md rounded-xl p-2 border border-white/20 text-center">
              <Text className="text-sm font-bold text-blue-100">{stats.inProgress}</Text>
              <Text className="text-xs text-blue-100/70">Đang làm</Text>
            </Box>
            <Box className="bg-white/10 backdrop-blur-md rounded-xl p-2 border border-white/20 text-center">
              <Text className="text-sm font-bold text-blue-100">{stats.pending}</Text>
              <Text className="text-xs text-blue-100/70">Chờ thực hiện</Text>
            </Box>
          </Box>

          {/* Info Message */}
          <Box className="bg-white/10 backdrop-blur-md rounded-lg p-2 border border-white/20">
            <Text size="small" className="text-blue-100 flex items-center">
              <Icon icon="zi-info-circle" className="mr-1" size={14} />
              Việc thay đổi sẽ được thông báo đến các quản lý
            </Text>
          </Box>
        </Box>
      </Box>

      <Box className="px-4 pt-4 pb-28">
        {/* Work List */}
        <Box className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <Box className="p-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-blue-100 flex items-center justify-between">
            <Text className="font-bold text-gray-900 flex items-center">
              <Icon icon="zi-list-1" className="mr-2 text-blue-600" size={16} />
              Danh Sách Công Việc Hôm Nay
            </Text>
            <Icon icon="zi-retry" className="mr-2 text-blue-600" size={16} onClick={handleRefreshData} />
          </Box>

          <Box className="divide-y divide-gray-200">
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
            ) : todayWorkList.length > 0 ? (
              todayWorkList.map((work, index) => (
                <Box key={work.id} className="p-4 hover:bg-gray-50 transition-colors">
                  {/* Work Header */}
                  <Box className="flex items-start justify-between gap-2 mb-2">
                    <Box className="flex-1">
                      <Box className="flex items-center gap-2 mb-1">
                        <Text className="font-semibold text-gray-900 line-clamp-2">{work.title}</Text>
                      </Box>
                      <Text className="text-xs text-gray-600">{work.company}</Text>
                    </Box>
                    <Box
                      className={`text-xs font-semibold  whitespace-nowrap flex-shrink-0 ${getStatusColor(
                        work.assignedStatus
                      )}`}
                    >
                      {getStatusLabel(work.assignedStatus)}
                    </Box>
                  </Box>

                  {/* Service & Equipment Tags */}
                  <Box className="flex flex-wrap gap-1 mb-2">
                    <Box className="text-xs px-2 py-0.5 bg-gray-100 rounded text-gray-700 font-medium">
                      {work.serviceType}
                    </Box>
                    <Box className="text-xs px-2 py-0.5 bg-gray-100 rounded text-gray-700 font-medium">
                      {work.equipment}
                    </Box>
                  </Box>

                  {/* Time & Location */}
                  <Box className="space-y-1 mb-2 text-sm text-gray-600">
                    <Box className="flex items-center gap-2">
                      <Icon icon="zi-clock-1" size={14} className="text-gray-400 flex-shrink-0" />
                      <Text className="text-xs font-medium">{work.scheduledTime}</Text>
                      <Box className={`text-xs p-1 rounded font-medium ${getPriorityColor(work.priority)}`}>
                        Ưu tiên: {getPriorityLabel(work.priority)}
                      </Box>
                    </Box>
                    <Box className="flex items-start gap-2">
                      <Icon icon="zi-location" size={14} className="text-red-500 flex-shrink-0 mt-0.5" />
                      <Text className="text-xs">{work.location}</Text>
                    </Box>
                    <Box className="flex items-center gap-2">
                      <Icon icon="zi-user" size={14} className="text-gray-400 flex-shrink-0" />
                      <Text className="text-xs">
                        <span className="font-semibold">{work.customerName}</span> • {work.phoneNumber}
                      </Text>
                    </Box>
                  </Box>

                  {/* Notes */}
                  {work.notes && (
                    <Box className="p-2 bg-yellow-50 rounded border border-yellow-200 mb-3">
                      <Text className="text-xs text-yellow-800">
                        <span className="font-semibold">Ghi chú:</span> {work.notes}
                      </Text>
                    </Box>
                  )}

                  {/* Action Buttons */}
                  <Box className="flex gap-2 flex-wrap">
                    {work.assignedStatus !== "completed" && (
                      <>
                        <button
                          onClick={() => handleReschedule(work)}
                          className="px-3 py-2 bg-blue-600 text-white rounded text-xs font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center gap-1 flex-1 min-w-fit"
                        >
                          Thay đổi lịch
                        </button>
                        <button
                          onClick={() => handleCancel(work)}
                          className="px-3 py-2 bg-red-600 text-white rounded text-xs font-semibold hover:bg-red-700 transition-colors flex items-center justify-center gap-1 flex-1 min-w-fit"
                        >
                          Hủy
                        </button>
                      </>
                    )}
                    <button
                      onClick={() => handleShowDetail(work)}
                      className="px-3 py-2 bg-gray-200 text-gray-700 rounded text-xs font-semibold hover:bg-gray-300 transition-colors flex items-center justify-center gap-1 flex-1 min-w-fit"
                    >
                      Chi tiết
                    </button>
                    {work.status == "in_progress" && (
                      <button
                        onClick={() => handleRequestOvertime(work)}
                        className="px-3 py-2 bg-green-600 text-white rounded text-xs font-semibold hover:bg-green-700 transition-colors flex items-center justify-center gap-1 flex-1 min-w-fit"
                      >
                        Yêu cầu tăng ca
                      </button>
                    )}
                  </Box>
                </Box>
              ))
            ) : (
              <Box className="text-center py-12 p-4">
                <Icon icon="zi-check-circle" className="text-gray-400 text-5xl mb-4" />
                <Text className="text-gray-600 font-semibold">Không có công việc hôm nay</Text>
                <Text className="text-gray-500 text-xs mt-1">Tất cả công việc đã hoàn thành hoặc được dời lịch</Text>
              </Box>
            )}
          </Box>
        </Box>
      </Box>

      {/* Reschedule Modal */}
      <Modal visible={showRescheduleModal} onClose={() => setShowRescheduleModal(false)}>
        <Box className="p-0 space-y-4">
          {selectedWork && (
            <>
              <Box className="bg-blue-50 rounded p-3 border border-blue-200">
                <Text className="text-xs text-blue-700 mb-1 font-semibold">Yêu cầu thay đổi lịch công việc:</Text>
                <Text className="font-semibold text-gray-900 text-sm">{selectedWork.title}</Text>
              </Box>

              <Box>
                <Text className="text-sm font-semibold text-gray-700 mb-2">Chọn ngày mới:</Text>
                <DatePicker value={newDate} onChange={setNewDate} className="w-full" dateFormat="dd/mm/yyyy" />
              </Box>

              <Box>
                <Text className="text-sm font-semibold text-gray-700 mb-2">Chọn giờ bắt đầu:</Text>
                <Input
                  type="time"
                  value={newTime}
                  onChange={(e) => setNewTime(e.target.value)}
                  className="w-full rounded"
                />
              </Box>

              <Box className="flex gap-2">
                <button
                  onClick={() => setShowRescheduleModal(false)}
                  className="flex-1 px-3 py-2 bg-gray-200 text-gray-800 rounded font-semibold hover:bg-gray-300 transition-colors text-sm"
                >
                  Hủy
                </button>
                <button
                  onClick={confirmReschedule}
                  className="flex-1 px-3 py-2 bg-blue-600 text-white rounded font-semibold hover:bg-blue-700 transition-colors text-sm"
                >
                  Xác nhận
                </button>
              </Box>
            </>
          )}
        </Box>
      </Modal>

      {/* Cancel Modal */}
      <Modal visible={showCancelModal} onClose={() => setShowCancelModal(false)}>
        <Box className="p-0 space-y-4">
          {selectedWork && (
            <>
              <Box className="bg-red-50 rounded p-3 border border-red-200">
                <Text className="text-xs text-red-900 font-semibold mb-1">Yêu cầu huỷ công việc</Text>
                <Text className="font-semibold text-gray-900 text-sm">{selectedWork.title}</Text>
              </Box>

              <Box>
                <Text className="text-sm font-semibold text-gray-700 mb-2">Lý do hủy công việc:</Text>
                <Input
                  ref={cancelInputRef}
                  placeholder="Nhập lý do hủy..."
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value.slice(0, cancelReasonMax))}
                  className="w-full rounded border-gray-300"
                  rows={4}
                />
                <Box className="flex justify-between items-center mt-2">
                  <Text className="text-xs text-gray-500">Yêu cầu tối thiểu {cancelReasonMin} ký tự</Text>
                  <Text
                    className={`text-xs ${cancelReason.length > cancelReasonMax ? "text-red-600" : "text-gray-500"}`}
                  >
                    {cancelReason.length}/{cancelReasonMax} ký tự
                  </Text>
                </Box>
              </Box>

              <Box className="flex gap-2 mt-3">
                <button
                  onClick={() => setShowCancelModal(false)}
                  className="flex-1 px-3 py-2 bg-gray-200 text-gray-800 rounded font-semibold hover:bg-gray-300 transition-colors text-sm"
                >
                  Quay lại
                </button>
                <button
                  onClick={confirmCancel}
                  disabled={cancelReason.trim().length < cancelReasonMin}
                  className={`flex-1 px-3 py-2 bg-red-600 text-white rounded font-semibold hover:bg-red-700 transition-colors text-sm ${
                    cancelReason.trim().length < cancelReasonMin ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                >
                  Yêu cầu huỷ
                </button>
              </Box>
            </>
          )}
        </Box>
      </Modal>

      {/* Overtime Request Modal Component */}
      <OvertimeRequestModal
        visible={showOvertimeModal}
        availableTechnicians={availableTechnicians}
        onClose={() => setShowOvertimeModal(false)}
        selectedWork={selectedWork}
        overtimeRequest={overtimeRequest}
        setOvertimeRequest={setOvertimeRequest}
        calculateOvertimeHours={calculateOvertimeHours}
        onConfirm={confirmOvertimeRequest}
      />

      {/* Work Detail Modal - Use Component */}
      <WorkDetailModal visible={showDetailModal} onClose={() => setShowDetailModal(false)} work={selectedWork} />

      <BottomNavigation />
    </Page>
  );
}

export default WorkManagement;
