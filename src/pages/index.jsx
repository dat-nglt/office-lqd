/*
 * Dữ liệu cần thiết cho trang HomePage (index.jsx):
 * - todayAssignments: Mảng các đối tượng công việc với các trường id (số), title (chuỗi), serviceType (chuỗi), location (chuỗi), coordinates (đối tượng với lat, lng), company (chuỗi), customerName (chuỗi), phoneNumber (chuỗi), scheduledDate (chuỗi), scheduledTime (chuỗi), status (chuỗi như "pending"), priority (chuỗi như "high"), notes (chuỗi), content (chuỗi), workType (chuỗi), technicians (mảng đối tượng với name, phone, specialization). Được sử dụng để hiển thị danh sách công việc hôm nay.
 * - statistics: Đối tượng với các trường totalAssignedToday (số), completed (số), inProgress (số), pending (số), totalHours (số), averageRating (số). Được sử dụng để hiển thị thống kê công việc.
 * - showDetailModal: Boolean để hiển thị modal chi tiết công việc.
 * - selectedWork: Đối tượng công việc được chọn để hiển thị trong modal.
 *
 * API cần thiết (đề xuất thực hiện):
 * - fetchTodayAssignments(employeeId): API để lấy danh sách công việc hôm nay từ backend dựa trên ID nhân viên. Ví dụ: GET /api/work/assignments?employeeId=123&date=today. Trả về mảng todayAssignments.
 * - fetchWorkStatistics(employeeId): API để lấy thống kê công việc cho nhân viên. Ví dụ: GET /api/work/stats?employeeId=123. Trả về đối tượng statistics.
 * - updateWorkStatus(workId, status): API để cập nhật trạng thái công việc (e.g., từ pending sang in_progress). Ví dụ: PUT /api/work/update-status với body {workId: 1, status: "in_progress"}.
 * - fetchWorkDetail(workId): API để lấy chi tiết công việc cho modal. Ví dụ: GET /api/work/detail?workId=1. Trả về đối tượng selectedWork.
 * - Cải tiến tiềm năng: Tích hợp useEffect để gọi API khi component mount; thêm xử lý lỗi và loading states; sử dụng Axios hoặc Fetch cho các API backend.
 * - Không có lệnh gọi API backend hiện tại; dựa vào dữ liệu local hardcode.
 */

import { Box, Button, Icon, Page, Text } from "zmp-ui";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getUserInfo } from "zmp-sdk/apis";
import Header from "../components/Header";
import WorkDetailModal from "../components/WorkDetailModal";
import BottomNavigation from "../components/BottomNavigation";
import JobListItem from "../components/JobListItem";
import { miniAppGetListOfWorkAssignmentsInCurrentDayByZAID, miniAppGetProfileInfoByID } from "../services/user.service";

function HomePage() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedWork, setSelectedWork] = useState(null);
  const [totalAssignedToday, setTotalAssignedToday] = useState(0);
  const [totalAssignedCompletedToday, setTotalAssignedCompletedToday] = useState(0);
  const [totalAssignedPendingToday, setTotalAssignedPendingToday] = useState(0);
  const [todayAssignments, setTodayAssignments] = useState([]);
  const navigate = useNavigate();
  const [userInfo, setUserInfo] = useState({
    name: "",
    employee_id: "",
    position: {},
    avatar_url: null,
    email: null,
    phone: null,
    zalo_id: "",
    profile: {
      departmentInfo: null,
      specialization: [],
      dailySalary: "0",
    },
    assignments: [],
    reports: [],
  });

  const handleShowDetail = (job) => {
    setSelectedWork(job);
    setShowDetailModal(true);
  };

  const handleStartWork = (job) => {
    navigate(`/checkin?work_code=${job.workCode}`);
  };

  const handleProgressReport = (job) => {
    navigate(`/report`);
  };

  const getUserInfoMiniApp = async () => {
    const { userInfo } = await getUserInfo();
    const ZAID = userInfo.id;

    const userInfoResp = await miniAppGetProfileInfoByID(ZAID);
    const listOfWorkAssignmentsResp = await miniAppGetListOfWorkAssignmentsInCurrentDayByZAID(ZAID);
    console.log("listOfWorkAssignmentsResp", listOfWorkAssignmentsResp);

    if (userInfoResp.success) {
      setUserInfo(userInfoResp.data);

      const today = new Date().toISOString().split("T")[0];

      // Map assignments từ listOfWorkAssignmentsResp sang todayAssignments
      const mappedAssignments = (listOfWorkAssignmentsResp?.data || []).map((assign) => ({
        id: assign.work.id,
        assignmentId: assign.id,
        title: assign.work.title,
        workName: assign.work.title,
        serviceType: assign.work.service_type,
        service: assign.work.service_type,
        equipment: assign.work.category?.name || "",
        location: assign.work.location,
        address: assign.work.customer_address,
        coordinates: {
          lat: parseFloat(assign.work.location_lat),
          lng: parseFloat(assign.work.location_lng),
        },
        company: assign.work.customer_name,
        customerName: assign.work.customer_name,
        phoneNumber: assign.work.customer_phone,
        scheduledDate: new Date(assign.work.required_date).toLocaleDateString("vi-VN"),
        scheduledTime: `${assign.work.required_time_hour}:${String(assign.work.required_time_minute).padStart(2, "0")}`,
        status: assign.work.status,
        priority: assign.work.priority,
        notes: assign.work.notes || assign.work.description,
        content: assign.work.description,
        workType: "service",
        technicians:
          assign.work.assignments?.map((tech) => ({
            id: tech.technician?.id,
            name: tech.technician?.name,
            email: tech.technician?.email,
            phone: tech.technician?.phone,
            avatar_url: tech.technician?.avatar_url,
            position_id: tech.technician?.position_id,
          })) || [],
        workCode: assign.work.work_code,
        estimatedHours: assign.work.estimated_hours,
        requiredDate: assign.work.required_date,
        assignedStatus: assign.assigned_status,
        assignedBy: assign.assignedByUser,
      }));

      // Filter assignments for today
      const todayAssignmentsList = mappedAssignments.filter(
        (assign) => assign.scheduledDate === new Date().toLocaleDateString("vi-VN")
      );

      setTodayAssignments(todayAssignmentsList);
      setTotalAssignedToday(todayAssignmentsList.length);

      const completedToday = (listOfWorkAssignmentsResp?.data || []).filter(
        (assign) =>
          assign.work.status === "completed" &&
          new Date(assign.work.required_date).toISOString().split("T")[0] === today
      ).length;

      const pendingToday = (listOfWorkAssignmentsResp?.data || []).filter(
        (assign) =>
          assign.work.status === "pending" && new Date(assign.work.required_date).toISOString().split("T")[0] === today
      ).length;

      setTotalAssignedCompletedToday(completedToday);
      setTotalAssignedPendingToday(pendingToday);
    } else {
      clearTokens();
    }
  };

  useEffect(() => {
    getUserInfoMiniApp();
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    return () => clearInterval(timer);
  }, []);

  return (
    <Page className="bg-gray-50 min-h-screen pb-20">
      <Header title="Theo Dõi Tiến Độ Công Việc" currentTime={currentTime} userInfo={userInfo} />

      <Box className="px-4 pt-4 pb-28">
        {/* Statistics Cards */}
        <Box className="bg-white rounded-xl shadow-sm p-4 mb-4 border border-gray-100">
          <Text className="font-bold text-gray-900 mb-3 flex items-center">
            <Icon icon="zi-reorder-solid" className="mr-2 text-blue-600" size={16} />
            Thống Kê Hôm Nay
          </Text>

          <Box className="grid grid-cols-2 gap-3 mb-3">
            <Box className="bg-blue-50 rounded-lg p-3 border border-blue-200 text-center">
              <Text className="text-2xl font-bold text-blue-600">{totalAssignedToday}</Text>
              <Text className="text-xs text-gray-600 mt-1">Công việc được phân bổ</Text>
            </Box>
            <Box className="bg-yellow-50 rounded-lg p-3 border border-yellow-200 text-center">
              <Text className="text-2xl font-bold text-yellow-600">{totalAssignedPendingToday}</Text>
              <Text className="text-xs text-gray-600 mt-1">Công việc chờ thực hiện</Text>
            </Box>
          </Box>

          <Box className="grid grid-cols-2 gap-3">
            <Box className="bg-green-50 rounded-lg p-3 border border-green-200 text-center">
              <Text className="text-2xl font-bold text-blue-600">{totalAssignedCompletedToday}</Text>
              <Text className="text-xs text-gray-600 mt-1">Công việc hoàn thành</Text>
            </Box>
            <Box
              className="bg-purple-50 rounded-lg p-3 border border-purple-200 text-center cursor-pointer hover:bg-purple-100 transition-colors"
              onClick={() => navigate("/overtime-request")}
            >
              <Text className="text-lg font-bold text-purple-600">Ca phát sinh</Text>
              <Text className="text-xs text-gray-600 mt-1">Báo công việc phát sinh</Text>
            </Box>
          </Box>
        </Box>

        {/* Today's Assignments */}
        <Box className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <Box className="p-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-blue-100">
            <Text className="font-bold text-gray-900 flex items-center">
              <Icon icon="zi-list-1" className="mr-2 text-blue-600" size={16} />
              Công Việc Hôm Nay ({todayAssignments.length})
            </Text>
          </Box>

          <Box className="divide-y divide-gray-200">
            {todayAssignments.map((job) => (
              <JobListItem
                key={job.id}
                job={job}
                onStartWork={handleStartWork}
                onProgressReport={handleProgressReport}
                onShowDetail={handleShowDetail}
              />
            ))}
          </Box>
        </Box>

        {/* Submit Report Button */}
        {/* <Box className="mt-4">
                    <Button
                        variant="primary"
                        fullWidth
                        onClick={() => navigate("/report")}
                        className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg py-3 font-semibold"
                    >
                        <Icon icon="zi-send" className="mr-2" size={16} />
                        Gửi Báo Cáo Công Việc
                    </Button>
                </Box> */}
      </Box>

      {/* Work Detail Modal */}
      <WorkDetailModal visible={showDetailModal} onClose={() => setShowDetailModal(false)} work={selectedWork} />

      <BottomNavigation />
    </Page>
  );
}

export default HomePage;
