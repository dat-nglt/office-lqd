import { Box, Button, Icon, Page, Text, Input, DatePicker } from "zmp-ui";
import { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import WorkDetailModal from "../components/WorkDetailModal";
import BottomNavigation from "../components/BottomNavigation";
import MapPickerModal from "../components/MapPickerModal";
import { ToastContext } from "../components/layout";
import { miniAppGetListOfWorkAssignmentsInCurrentDayByZAID, miniAppGetProfileInfoByID } from "../services/user.service";
import { getUserInfoInStorage } from "../config/axiosConfig";
import { calculateWorkHours, formatDate, validateFormFields } from "../utils/helpers";
import { getAllWorkCategoriesService, creatNewWorkService } from "../services/work-management.service";
import { getAllCustomersService } from "../services/customers.service";

function HomePage() {
  const navigate = useNavigate();
  const toast = useContext(ToastContext);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedWork, setSelectedWork] = useState(null);
  const [totalAssignedToday, setTotalAssignedToday] = useState(0);
  const [totalAssignedCompletedToday, setTotalAssignedCompletedToday] = useState(0);
  const [totalAssignedPendingToday, setTotalAssignedPendingToday] = useState(0);
  const [todayAssignments, setTodayAssignments] = useState([]);
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
    navigate(`/checkin?work_id=${job.id}`);
  };

  const handleProgressReport = (job) => {
    navigate(`/report/${job.workCode}`);
  };

  const getUserInfoMiniApp = async () => {
    const userInfo = getUserInfoInStorage(); // Lấy thông tin người dùng từ storage
    const ZAID = userInfo.id;

    const userInfoResp = await miniAppGetProfileInfoByID(ZAID);
    const listOfWorkAssignmentsResp = await miniAppGetListOfWorkAssignmentsInCurrentDayByZAID(ZAID);

    if (userInfoResp.success) {
      // Kiểm tra nếu lấy thông tin người dùng thành công
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
        notes: assign.work.notes || "Không có ghi chú nào",
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
          assign.assigned_status === "completed" &&
          new Date(assign.work.required_date).toISOString().split("T")[0] === today
      ).length;

      const pendingToday = (listOfWorkAssignmentsResp?.data || []).filter(
        (assign) =>
          assign.assigned_status === "pending" &&
          new Date(assign.work.required_date).toISOString().split("T")[0] === today
      ).length;

      setTotalAssignedCompletedToday(completedToday);
      setTotalAssignedPendingToday(pendingToday);
    } else {
      clearTokens();
    }
  };

  const handleRefreshData = () => {
    getUserInfoMiniApp();
  };

  // Overtime Request State
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
    customer_id: null,
    company: "",
    address: "",
    content: "Lắp đặt máy lạnh VRV",
    customerName: "",
    phoneNumber: "",
    notes: "",
    estimatedStartTime: "17:00",
    estimatedEndTime: "21:00",
    title: "Lắp đặt máy lạnh VRV",
    work_code: `WK${Date.now().toString().slice(-6)}${Math.floor(Math.random() * 100)
      .toString()
      .padStart(2, "0")}`,
    work_category: "",
    priority: "medium",
    estimated_hours: "",
    location_lat: "",
    location_lng: "",
  });

  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const [showProjectList, setShowProjectList] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [customers, setCustomers] = useState([]);
  const [customersLoading, setCustomersLoading] = useState(false);
  const [workCategories, setWorkCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(false);
  const [showCustomerList, setShowCustomerList] = useState(false);
  const [useSystemCustomer, setUseSystemCustomer] = useState(false);
  const [useManualCustomer, setUseManualCustomer] = useState(false);
  const [showMapPicker, setShowMapPicker] = useState(false);

  const handleSelectProject = (project) => {
    setSelectedProjectId(project.id);
    setOvertimeInfo((prev) => ({
      ...prev,
      company: project.company,
      address: project.address,
      location_lat: String(project.coordinates?.lat || ""),
      location_lng: String(project.coordinates?.lng || ""),
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
      location_lat: "",
      location_lng: "",
    }));
  };

  const handleCustomerSelect = (customer) => {
    if (!customer) {
      setOvertimeInfo((prev) => ({
        ...prev,
        customer_id: null,
        customerName: "",
        phoneNumber: "",
        address: "",
        location_lat: "",
        location_lng: "",
        company: "",
      }));
      setUseSystemCustomer(false);
      return;
    }

    // Auto-fill customer information
    setOvertimeInfo((prev) => ({
      ...prev,
      customer_id: customer.id,
      customerName: customer.name || "",
      phoneNumber: customer.phone || "",
      address: customer.address || "",
      location_lat: customer.location_lat || "",
      location_lng: customer.location_lng || "",
      company: customer.name || "",
    }));
    setUseSystemCustomer(true);
    setUseManualCustomer(false);
    setShowCustomerList(false);
    toast?.success({
      title: "Chọn khách hàng thành công",
      message: `Đã chọn: ${customer.name}`,
      duration: 2000,
    });
  };

  const handleToggleManualCustomer = () => {
    if (!useManualCustomer) {
      // Switching to manual mode
      setUseManualCustomer(true);
      setUseSystemCustomer(false);
      setShowCustomerList(false);
      // Clear customer_id but keep manually entered data
      setOvertimeInfo((prev) => ({
        ...prev,
        customer_id: null,
      }));
    } else {
      // Switching back to system mode
      setUseManualCustomer(false);
      setOvertimeInfo((prev) => ({
        ...prev,
        customer_id: null,
        customerName: "",
        phoneNumber: "",
        address: "",
        location_lat: "",
        location_lng: "",
        company: "",
      }));
    }
  };

  const handleInputChange = (field, value) => {
    setOvertimeInfo((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleMapConfirm = (mapData) => {
    setOvertimeInfo((prev) => ({
      ...prev,
      address: mapData.address,
      location_lat: mapData.latitude,
      location_lng: mapData.longitude,
    }));
    toast?.success({
      title: "Cập nhật vị trí thành công",
      message: "Địa chỉ và tọa độ đã được cập nhật",
      duration: 2000,
    });
  };

  const validateFormOvertime = () => {
    return validateFormFields(overtimeInfo, [
      "title",
      "customer_id",
      "address",
      "content",
      "work_category",
      "phoneNumber",
    ]);
  };

  const handleSubmitOvertime = async () => {
    if (isSubmitting) return;

    const validationResult = validateFormOvertime();
    if (!validationResult.isValid) {
      toast?.error({
        title: "Lỗi nhập liệu",
        message: `Vui lòng điền đầy đủ thông tin bắt buộc: ${validationResult.failedFields.join(", ")}`,
        duration: 3000,
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Tính toán giờ ước tính
      const [startHour, startMin] = overtimeInfo.estimatedStartTime.split(":").map(Number);
      const [endHour, endMin] = overtimeInfo.estimatedEndTime.split(":").map(Number);
      const startMinutes = startHour * 60 + startMin;
      const endMinutes = endHour * 60 + endMin;
      const durationMinutes = Math.max(0, endMinutes - startMinutes);

      const workPayload = {
        title: overtimeInfo.title,
        description: overtimeInfo.content,
        customer_id: overtimeInfo.customer_id,
        work_category_id: overtimeInfo.work_category,
        priority: overtimeInfo.priority,
        scheduled_date: new Date(overtimeInfo.date).toISOString().split("T")[0],
        start_time: overtimeInfo.estimatedStartTime,
        end_time: overtimeInfo.estimatedEndTime,
        estimated_hours: Number(overtimeInfo.estimated_hours) || durationMinutes / 60,
        location: overtimeInfo.address,
        location_lat: overtimeInfo.location_lat ? parseFloat(overtimeInfo.location_lat) : null,
        location_lng: overtimeInfo.location_lng ? parseFloat(overtimeInfo.location_lng) : null,
        notes: overtimeInfo.notes || null,
      };

      const response = await creatNewWorkService(workPayload);

      if (response.success || response.status === "success") {
        toast?.success({
          title: "Thành công",
          message: "Yêu cầu ca phát sinh đã được tạo!",
          duration: 3000,
        });
        // Reset form
        setOvertimeInfo({
          date: new Date(),
          customer_id: null,
          company: "",
          address: "",
          content: "",
          customerName: "",
          phoneNumber: "",
          notes: "",
          estimatedStartTime: "17:00",
          estimatedEndTime: "21:00",
          title: "",
          work_code: `WK${Date.now().toString().slice(-6)}${Math.floor(Math.random() * 100)
            .toString()
            .padStart(2, "0")}`,
          work_category: "",
          priority: "medium",
          estimated_hours: "",
          location_lat: "",
          location_lng: "",
        });
        setSelectedProjectId(null);
        setUseSystemCustomer(false);
        setUseManualCustomer(false);
      } else {
        throw new Error(response.message || "Không thể tạo công việc");
      }
    } catch (error) {
      console.error("Lỗi khi tạo công việc:", error);
      toast?.error({
        title: "Lỗi tạo công việc",
        message: error.message || "Có lỗi xảy ra. Vui lòng thử lại!",
        duration: 3000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    getUserInfoMiniApp();

    // Fetch work categories
    const fetchCategories = async () => {
      try {
        setCategoriesLoading(true);
        const workCateResp = await getAllWorkCategoriesService();
        const categoryData = workCateResp.data || workCateResp;
        if (Array.isArray(categoryData)) {
          setWorkCategories(categoryData);
        }
      } catch (error) {
        console.error("Lỗi khi tải danh mục công việc:", error);
        setWorkCategories([]);
      } finally {
        setCategoriesLoading(false);
      }
    };

    // Fetch customers
    const fetchCustomers = async () => {
      try {
        setCustomersLoading(true);
        const customersResp = await getAllCustomersService();
        const customerData = customersResp.data || customersResp;
        if (Array.isArray(customerData)) {
          setCustomers(customerData);
        }
      } catch (error) {
        console.error("Lỗi khi tải danh sách khách hàng:", error);
        setCustomers([]);
      } finally {
        setCustomersLoading(false);
      }
    };

    fetchCategories();
    fetchCustomers();

    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <Page className="bg-gray-50 min-h-screen pb-20">
      <Header title="Theo Dõi Tiến Độ Báo Cáo" currentTime={currentTime} userInfo={userInfo} />

      <Box className="px-4 pt-4 pb-28">
        {/* Statistics Cards */}
        {/* <Box className="p-4 border-b  rounded-t-xl border-gray-200 bg-gradient-to-r from-green-50 to-green-100 flex items-center justify-between">
          <Text className="font-bold text-gray-900 flex items-center capitalize">Thống Kê Công Việc</Text>
        </Box>
        <Box className="bg-white rounded-b-xl shadow-sm p-4 mb-4 border border-gray-100">
          <Box className="grid grid-cols-2 gap-3 mb-3">
            <Box className="bg-green-50 rounded-lg p-3 border border-green-200 text-center">
              <Text className="text-2xl font-bold text-green-600">{totalAssignedToday}</Text>
              <Text className="text-xs text-gray-600 mt-1">Công việc được phân bổ</Text>
            </Box>
            <Box className="bg-yellow-50 rounded-lg p-3 border border-yellow-200 text-center">
              <Text className="text-2xl font-bold text-yellow-600">{totalAssignedPendingToday}</Text>
              <Text className="text-xs text-gray-600 mt-1">Công việc chờ thực hiện</Text>
            </Box>
          </Box>

          <Box className="grid grid-cols-2 gap-3">
            <Box className="bg-green-50 rounded-lg- p-3 border border-green-200 text-center">
              <Text className="text-2xl font-bold text-green-600">{totalAssignedCompletedToday}</Text>
              <Text className="text-xs text-gray-600 mt-1">Công việc hoàn thành</Text>
            </Box>
            <Box
              className="bg-orange-50 rounded-lg p-3 border border-orange-200 text-center cursor-pointer hover:bg-orange-100 transition-colors"
              onClick={() => navigate("/overtime-request")}
            >
              <Text className="text-lg font-bold text-orange-600">Ca phát sinh</Text>
              <Text className="text-xs text-gray-600 mt-1">Báo công việc phát sinh</Text>
            </Box>
          </Box>
        </Box> */}

        {/* Overtime Request Form - Optimized */}
        <Box className="space-y-4">
          {/* Form Header */}
          <Box className="bg-gradient-to-r from-green-500 via-green-600 to-green-700 rounded-xl p-4 shadow-md">
            <Text className="font-bold text-white text-lg mb-1 capitalize">Báo cáo công việc hôm nay</Text>
            <Text className="text-green-100 text-xs">Điền thông tin chi tiết về công việc cần báo cáo của bạn</Text>
          </Box>

          {/* Main Form Container */}
          <Box className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <Box className="p-4 space-y-4">
              {/* Section 0: Work Information */}
              <Box>
                <Text className="font-semibold text-gray-900 text-sm mb-3">
                  <Icon icon="zi-note" className="mb-0.5 mr-1 text-gray-600" size={16} />
                  Thông Tin Công Việc
                </Text>

                <Box className="space-y-4">
                  {/* Work Code (Read-only) */}
                  <Box>
                    <Text className="text-xs text-gray-700 font-medium mb-1 px-1">Mã công việc</Text>
                    <Input
                      placeholder="Mã công việc"
                      value={overtimeInfo.work_code}
                      disabled={true}
                      className="w-full bg-gray-50"
                    />
                  </Box>

                  {/* Work Title */}
                  <Box>
                    <Text className="text-xs text-gray-700 font-medium mb-1 px-1">Tiêu đề công việc *</Text>
                    <Input
                      placeholder="Nhập tiêu đề công việc"
                      value={overtimeInfo.title}
                      onChange={(e) => handleInputChange("title", e.target.value)}
                    />
                  </Box>

                  {/* Section 3: Location & Description */}
                  <Box className="space-y-3">
                    <Box>
                      <Text className="text-xs text-gray-700 font-medium mb-1 px-1">Nội dung công việc *</Text>
                      <Input
                        placeholder="Mô tả chi tiết công việc cần thực hiện"
                        value={overtimeInfo.content}
                        onChange={(e) => handleInputChange("content", e.target.value)}
                        rows={3}
                      />
                    </Box>

                    <Box>
                      <Text className="text-xs text-gray-700 font-medium mb-1 px-1">Ghi chú thêm</Text>
                      <Input
                        placeholder="Thêm ghi chú nếu cần..."
                        value={overtimeInfo.notes}
                        onChange={(e) => handleInputChange("notes", e.target.value)}
                        rows={2}
                      />
                    </Box>
                  </Box>

                  {/* Work Category & Priority - Grid */}
                  <Box>
                    <Text className="text-xs text-gray-700 font-medium mb-1 px-1">Danh mục công việc *</Text>
                    <select
                      value={overtimeInfo.work_category}
                      onChange={(e) => handleInputChange("work_category", e.target.value)}
                      className="w-full bg-transparent px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-orange-600 h-[50px]"
                      disabled={categoriesLoading}
                    >
                      {/* <option value="">Chọn danh mục công việc</option> */}
                      {workCategories.map((category) => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                  </Box>
                  <Box>
                    <Text className="text-xs text-gray-700 font-medium mb-1 px-1">Mức độ ưu tiên</Text>
                    <select
                      value={overtimeInfo.priority}
                      onChange={(e) => handleInputChange("priority", e.target.value)}
                      className="w-full bg-transparent px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-orange-600 h-[50px]"
                    >
                      <option value="low">Thấp</option>
                      <option value="medium">Trung bình</option>
                      <option value="high">Cao</option>
                      <option value="urgent">Khẩn cấp</option>
                    </select>
                  </Box>
                </Box>
              </Box>

              {/* Section 1: Date & Time */}
              <Box>
                <Text className="font-semibold text-gray-900 text-sm mb-3">
                  <Icon icon="zi-calendar" className="mb-0.5 mr-1 text-gray-600" size={16} />
                  Thông Tin Ngày Giờ
                </Text>

                <Box className="space-y-3">
                  {/* Date Field */}
                  <Box>
                    <DatePicker
                      value={overtimeInfo.date}
                      onChange={(date) => handleInputChange("date", date)}
                      placeholder="Chọn ngày"
                      className="w-full"
                      dateFormat="dd/mm/yyyy"
                    />
                  </Box>

                  {/* Time Fields - Grid */}
                  <Box className="grid grid-cols-2 gap-2">
                    <Box>
                      <Text className="text-xs text-gray-600 mb-1 px-1 font-medium">Bắt đầu</Text>
                      <Input
                        type="time"
                        value={overtimeInfo.estimatedStartTime}
                        onChange={(e) => handleInputChange("estimatedStartTime", e.target.value)}
                        className="w-full"
                      />
                    </Box>
                    <Box>
                      <Text className="text-xs text-gray-600 mb-1 px-1 font-medium">Kết thúc</Text>
                      <Input
                        type="time"
                        value={overtimeInfo.estimatedEndTime}
                        onChange={(e) => handleInputChange("estimatedEndTime", e.target.value)}
                        className="w-full"
                      />
                    </Box>
                  </Box>
                  <Text className="text-xs text-gray-500 mt-1 px-1">
                    {formatDate(overtimeInfo.date)} - Từ {overtimeInfo.estimatedStartTime} đến{" "}
                    {overtimeInfo.estimatedEndTime}{" "}
                  </Text>
                </Box>
              </Box>

              {/* Section 2b: Project Selection */}
              <Box>
                <Text className="font-semibold text-gray-900 text-sm mb-3">
                  <Icon icon="zi-home" className="mb-0.5 mr-1 text-gray-600" size={16} />
                  Chọn dự án liên quan đến công việc nếu có
                </Text>

                {selectedProjectId ? (
                  <Box className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-lg p-3 border-2 border-orange-300 mb-3">
                    <Box className="flex items-start justify-between gap-2">
                      <Box className="flex-1 min-w-0">
                        <Text className="font-semibold text-orange-900 text-sm truncate">
                          {existingProjects.find((p) => p.id === selectedProjectId)?.name}
                        </Text>
                        <Text className="text-xs text-orange-700 mt-1 line-clamp-2">
                          {existingProjects.find((p) => p.id === selectedProjectId)?.address}
                        </Text>
                      </Box>
                      <button
                        onClick={handleClearProject}
                        className="text-orange-600 hover:text-orange-800 hover:bg-orange-100 p-2 rounded-full flex-shrink-0 transition-colors"
                        title="Xóa chọn"
                      >
                        <Icon icon="zi-close" size={16} />
                      </button>
                    </Box>
                  </Box>
                ) : null}

                {!selectedProjectId && (
                  <Box className="space-y-2 mb-3">
                    <button
                      onClick={() => setShowProjectList(!showProjectList)}
                      className="w-full px-3 py-3 border border-green-400 text-green-600 rounded-lg font-semibold hover:bg-green-50 active:bg-green-100 transition-colors flex items-center justify-center gap-2"
                    >
                      Chọn dự án có sẵn
                    </button>

                    {showProjectList && (
                      <Box className="space-y-2 p-2 bg-gray-50 rounded-lg border border-gray-300 max-h-64 overflow-y-auto">
                        {existingProjects.map((project) => (
                          <button
                            key={project.id}
                            onClick={() => handleSelectProject(project)}
                            className="w-full text-left p-3 rounded-lg border-2 border-gray-200 bg-white hover:border-orange-400 hover:bg-orange-50 transition-all active:bg-orange-100"
                          >
                            <Text className="font-semibold text-gray-900 text-sm">{project.company}</Text>
                            <Text className="text-xs text-gray-600 mt-0.5 line-clamp-1">{project.name}</Text>
                          </button>
                        ))}
                      </Box>
                    )}
                  </Box>
                )}

                {selectedProjectId && (
                  <Box className="bg-orange-100 rounded-lg p-2.5 border border-orange-300">
                    <Text className="text-xs text-orange-800 flex items-center font-medium">
                      <Icon icon="zi-check-circle" className="mr-1.5" size={14} />
                      Thông tin công trình đã được tự động điền
                    </Text>
                  </Box>
                )}
              </Box>

              {/* Section 2: Customer Selection */}
              <Box>
                <Text className="font-semibold text-gray-900 text-sm mb-3">
                  <Icon icon="zi-user" className="mb-0.5 mr-1 text-gray-600" size={16} />
                  Thông Tin Khách Hàng *
                </Text>

                {/* Mode Toggle */}
                <Box className="flex gap-2 mb-3">
                  <button
                    onClick={() => {
                      if (useManualCustomer) {
                        handleToggleManualCustomer();
                      }
                    }}
                    className={`flex-1 px-3 py-2 rounded-lg text-sm transition-colors ${
                      !useManualCustomer ? "bg-green-600 text-white" : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                    }`}
                  >
                    Chọn từ hệ thống
                  </button>
                  <button
                    onClick={() => {
                      if (!useManualCustomer) {
                        handleToggleManualCustomer();
                      }
                    }}
                    className={`flex-1 px-3 py-2 rounded-lg text-sm transition-colors ${
                      useManualCustomer ? "bg-green-600 text-white" : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                    }`}
                  >
                    Nhập thủ công
                  </button>
                </Box>

                {/* System Customer Mode */}
                {!useManualCustomer && (
                  <Box className="space-y-2 mb-3">
                    {useSystemCustomer && overtimeInfo.customer_id ? (
                      <Box className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-lg p-3 border-2 border-orange-300 mb-3">
                        <Box className="flex items-start justify-between gap-2">
                          <Box className="flex-1 min-w-0">
                            <Text className="font-semibold text-orange-900 text-sm truncate">
                              {overtimeInfo.customerName}
                            </Text>
                            <Text className="text-xs text-orange-700 mt-1">{overtimeInfo.phoneNumber}</Text>
                            <Text className="text-xs text-orange-700 mt-1 line-clamp-2">{overtimeInfo.address}</Text>
                          </Box>
                          <button
                            onClick={() => handleCustomerSelect(null)}
                            className="text-orange-600 hover:text-orange-800 hover:bg-orange-100 p-2 rounded-full flex-shrink-0 transition-colors"
                            title="Xóa chọn"
                          >
                            <Icon icon="zi-close" size={16} />
                          </button>
                        </Box>
                      </Box>
                    ) : (
                      <>
                        <button
                          onClick={() => setShowCustomerList(!showCustomerList)}
                          className="w-full px-3 py-3 border border-green-400 text-green-600 rounded-lg font-semibold hover:bg-green-50 active:bg-green-100 transition-colors flex items-center justify-center gap-2"
                          disabled={customersLoading}
                        >
                          {customersLoading ? "Đang tải..." : "Chọn khách hàng"}
                        </button>

                        {showCustomerList && (
                          <Box className="space-y-2 p-2 bg-gray-50 rounded-lg border border-gray-300 max-h-64 overflow-y-auto">
                            {customers.length > 0 ? (
                              customers.map((customer) => (
                                <button
                                  key={customer.id}
                                  onClick={() => handleCustomerSelect(customer)}
                                  className="w-full text-left p-3 rounded-lg border-2 border-gray-200 bg-white hover:border-orange-400 hover:bg-orange-50 transition-all active:bg-orange-100"
                                >
                                  <Text className="font-semibold text-gray-900 text-sm">{customer.name}</Text>
                                  <Text className="text-xs text-gray-600 mt-0.5">
                                    {customer.phone || "Không có số điện thoại"}
                                  </Text>
                                  <Text className="text-xs text-gray-500 mt-1 line-clamp-1">
                                    {customer.address || "Không có địa chỉ"}
                                  </Text>
                                </button>
                              ))
                            ) : (
                              <Text className="text-xs text-gray-500 p-3 text-center">Không có khách hàng nào</Text>
                            )}
                          </Box>
                        )}
                      </>
                    )}

                    {useSystemCustomer && (
                      <Box className="bg-orange-100 rounded-lg p-2.5 border border-orange-300">
                        <Text className="text-xs text-orange-800 flex items-center font-medium">
                          <Icon icon="zi-check-circle" className="mr-1.5" size={14} />
                          Thông tin khách hàng đã được tự động điền
                        </Text>
                      </Box>
                    )}
                  </Box>
                )}

                {/* Manual Customer Mode */}
                {useManualCustomer && (
                  <Box>
                    <Box>
                      <Text className="text-xs text-gray-700 font-medium mb-1 px-1">Tên khách hàng *</Text>
                      <Input
                        placeholder="Nhập tên khách hàng"
                        value={overtimeInfo.customerName}
                        onChange={(e) => handleInputChange("customerName", e.target.value)}
                      />
                    </Box>

                    <Box>
                      <Text className="text-xs text-gray-700 font-medium mb-1 px-1">Số điện thoại *</Text>
                      <Input
                        placeholder="Nhập số điện thoại"
                        value={overtimeInfo.phoneNumber}
                        onChange={(e) => handleInputChange("phoneNumber", e.target.value)}
                        type="tel"
                      />
                    </Box>
                  </Box>
                )}
              </Box>

              {/* Section 4: Contact Information */}
              <Box>
                <Text className="font-semibold text-gray-900 text-sm mb-3">
                  <Icon icon="zi-location" className="mb-0.5 mr-1 text-gray-600" size={16} />
                  Thông Tin Địa Chỉ
                </Text>

                <Box className="space-y-3">
                  <Box>
                    <Text className="text-xs text-gray-700 font-medium mb-1 px-1">Địa chỉ *</Text>
                    <Input
                      placeholder="Nhập địa chỉ"
                      value={overtimeInfo.address}
                      onChange={(e) => handleInputChange("address", e.target.value)}
                      disabled={selectedProjectId !== null || (useSystemCustomer && !useManualCustomer)}
                      rows={2}
                    />
                    {selectedProjectId && <Text className="text-xs text-gray-500 mt-1 px-1">Tự động từ dự án</Text>}
                    {useSystemCustomer && !useManualCustomer && !selectedProjectId && (
                      <Text className="text-xs text-gray-500 mt-1 px-1">Tự động từ khách hàng</Text>
                    )}
                  </Box>

                  {/* Coordinates Section */}
                  <Box>
                    <Box className="grid grid-cols-2 gap-2">
                      <Box>
                        <Text className="text-xs text-gray-600 mb-1 px-1">Vĩ độ</Text>
                        <Input
                          placeholder="10.7769"
                          value={overtimeInfo.location_lat}
                          onChange={(e) => handleInputChange("location_lat", e.target.value)}
                          disabled={selectedProjectId !== null || (useSystemCustomer && !useManualCustomer)}
                        />
                      </Box>
                      <Box>
                        <Text className="text-xs text-gray-600 mb-1 px-1">Kinh độ</Text>
                        <Input
                          placeholder="106.7009"
                          value={overtimeInfo.location_lng}
                          onChange={(e) => handleInputChange("location_lng", e.target.value)}
                          disabled={selectedProjectId !== null || (useSystemCustomer && !useManualCustomer)}
                        />
                      </Box>
                    </Box>
                    {selectedProjectId && <Text className="text-xs text-gray-500 mt-1 px-1">Tự động từ dự án</Text>}
                    {useSystemCustomer && !useManualCustomer && !selectedProjectId && (
                      <Text className="text-xs text-gray-500 mt-1 px-1">Tự động từ khách hàng</Text>
                    )}

                    {/* <Text
                      onClick={() => navigate("/coordinates-guide")}
                      className="font-semibold text-right text-yellow-600 text-xs mt-3 cursor-pointer hover:text-yellow-700 hover:underline transition-colors"
                    >
                      Ấn để xem hướng dẫn lấy toạ độ
                    </Text> */}
                  </Box>
                </Box>
              </Box>
            </Box>
          </Box>

          {/* Action Buttons */}
          <Box className="flex gap-2">
            <Button
              onClick={() => {
                setOvertimeInfo({
                  date: new Date(),
                  customer_id: null,
                  company: "",
                  address: "",
                  content: "",
                  customerName: "",
                  phoneNumber: "",
                  notes: "",
                  estimatedStartTime: "17:00",
                  estimatedEndTime: "21:00",
                  title: "",
                  work_code: `WK${Date.now().toString().slice(-6)}${Math.floor(Math.random() * 100)
                    .toString()
                    .padStart(2, "0")}`,
                  work_category: "",
                  priority: "medium",
                  estimated_hours: "",
                  location_lat: "",
                  location_lng: "",
                });
                setSelectedProjectId(null);
                setUseSystemCustomer(false);
                setUseManualCustomer(false);
              }}
              fullWidth
              variant="secondary"
              className="px-3 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg text-sm font-semibold transition-colors flex items-center justify-center gap-1 disabled:opacity-50"
            >
              Hủy
            </Button>
            <Button
              fullWidth
              onClick={handleSubmitOvertime}
              disabled={isSubmitting}
              className="px-3 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-semibold transition-colors flex items-center justify-center gap-1 disabled:opacity-50"
            >
              {isSubmitting ? "Đang gửi..." : "Báo cáo"}
            </Button>
          </Box>
        </Box>
      </Box>

      {/* Work Detail Modal */}
      <WorkDetailModal visible={showDetailModal} onClose={() => setShowDetailModal(false)} work={selectedWork} />
      <BottomNavigation />
    </Page>
  );
}

export default HomePage;
