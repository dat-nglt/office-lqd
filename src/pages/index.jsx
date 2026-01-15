import { Box, Button, Icon, Page, Text, Input, DatePicker } from "zmp-ui";
import { useState, useEffect, useContext } from "react";
import Header from "../components/Header";
import BottomNavigation from "../components/BottomNavigation";
import { ToastContext } from "../components/layout";
import { miniAppGetProfileInfoByID } from "../services/user.service";
import { getUserInfoInStorage } from "../config/axiosConfig";
import { validateFormFields } from "../utils/helpers";
import { getAllWorkCategoriesService, creatNewWorkService } from "../services/work-management.service";
import { getAllCustomersService } from "../services/customers.service";

function HomePage() {
  const toast = useContext(ToastContext);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [userInfo, setUserInfo] = useState({
    name: "",
    employee_id: "",
    position: {},
    avatar_url: null,
    email: null,
    phone: null,
    zalo_id: "",
  });

  const getUserInfoMiniApp = async () => {
    try {
      const userInfoStorage = getUserInfoInStorage();
      const ZAID = userInfoStorage.id;
      const userInfoResp = await miniAppGetProfileInfoByID(ZAID);

      if (userInfoResp.success) {
        setUserInfo(userInfoResp.data);
      }
    } catch (error) {
      console.error("Lỗi khi lấy thông tin người dùng:", error);
    }
  };

  // Overtime Request State
  const [newDailyReport, setNewDailyReport] = useState({
    date: new Date(),
    customer_id: null,
    company: "",
    address: "",
    content: "Thực hiện công việc mới",
    customerName: "",
    phoneNumber: "",
    notes: "",
    estimatedStartTime: "17:00",
    estimatedEndTime: "21:00",
    title: "Công việc mới",
    work_category: null,
    priority: "high",
    estimated_hours: "",
    estimated_cost: "",
    location_lat: "",
    location_lng: "",
    project_id: null,
  });

  const PROJECTS_LIST = [
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
  ];

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
    setNewDailyReport((prev) => ({
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
    setNewDailyReport((prev) => ({
      ...prev,
      company: "",
      address: "",
      location_lat: "",
      location_lng: "",
    }));
  };

  const handleCustomerSelect = (customer) => {
    if (!customer) {
      setNewDailyReport((prev) => ({
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
    setNewDailyReport((prev) => ({
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
      setNewDailyReport((prev) => ({
        ...prev,
        customer_id: null,
      }));
    } else {
      // Switching back to system mode
      setUseManualCustomer(false);
      setNewDailyReport((prev) => ({
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
    setNewDailyReport((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleMapConfirm = (mapData) => {
    setNewDailyReport((prev) => ({
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

  const resetFormData = () => ({
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
    work_category: "",
    priority: "medium",
    estimated_hours: "",
    estimated_cost: "",
    location_lat: "",
    location_lng: "",
    project_id: null,
  });

  const handleSubmitOvertime = async () => {
    if (isSubmitting) return;

    // Validate bắt buộc theo createWorkService
    const requiredFields = [
      { field: "title", label: "Tiêu đề công việc" },
      { field: "content", label: "Nội dung công việc" },
      { field: "work_category", label: "Danh mục công việc" },
      { field: "customerName", label: "Tên khách hàng" },
      { field: "phoneNumber", label: "Số điện thoại" },
      { field: "address", label: "Địa chỉ" },
      { field: "location_lat", label: "Vĩ độ (latitude)" },
      { field: "location_lng", label: "Kinh độ (longitude)" },
      // { field: "estimated_hours", label: "Giờ ước tính" },
    ];

    const missingFields = requiredFields
      .filter(({ field }) => {
        const value = newDailyReport[field];
        return !value || (typeof value === "string" && value.trim() === "");
      })
      .map(({ label }) => label);

    if (missingFields.length > 0) {
      toast?.error({
        title: "Lỗi nhập liệu",
        message: `Vui lòng điền đầy đủ: ${missingFields.join(", ")}`,
        duration: 3000,
      });
      return;
    }

    // Validate số điện thoại
    if (newDailyReport.phoneNumber.length > 20) {
      toast?.error({
        title: "Lỗi nhập liệu",
        message: "Số điện thoại tối đa 20 ký tự",
        duration: 3000,
      });
      return;
    }

    // Validate GPS coordinates
    const lat = parseFloat(newDailyReport.location_lat);
    const lng = parseFloat(newDailyReport.location_lng);
    if (isNaN(lat) || lat < -90 || lat > 90) {
      toast?.error({
        title: "Lỗi nhập liệu",
        message: "Vĩ độ phải nằm trong khoảng [-90, 90]",
        duration: 3000,
      });
      return;
    }
    if (isNaN(lng) || lng < -180 || lng > 180) {
      toast?.error({
        title: "Lỗi nhập liệu",
        message: "Kinh độ phải nằm trong khoảng [-180, 180]",
        duration: 3000,
      });
      return;
    }

    // Validate estimated_hours
    const estHours = Number(newDailyReport.estimated_hours);
    if (isNaN(estHours) || estHours < 0 || estHours > 999.99) {
      toast?.error({
        title: "Lỗi nhập liệu",
        message: "Giờ ước tính phải từ 0 đến 999.99",
        duration: 3000,
      });
      return;
    }

    // Validate estimated_cost nếu có
    if (newDailyReport.estimated_cost && newDailyReport.estimated_cost !== "") {
      const estCost = Number(newDailyReport.estimated_cost);
      if (isNaN(estCost) || estCost < 0 || estCost > 9999999.99) {
        toast?.error({
          title: "Lỗi nhập liệu",
          message: "Chi phí ước tính phải từ 0 đến 9999999.99",
          duration: 3000,
        });
        return;
      }
    }

    setIsSubmitting(true);

    try {
      console.log("Đang gửi yêu cầu tạo công việc với dữ liệu:", userInfo);
      // Lấy thông tin người dùng từ storage
      const createdByUserId = userInfo.id;
      const salesPersonId = userInfo.id;

      if (!createdByUserId || !salesPersonId) {
        throw new Error("Không thể lấy thông tin người dùng");
      }

      // Tính toán giờ yêu cầu từ estimatedStartTime
      const [startHour, startMin] = newDailyReport.estimatedStartTime.split(":").map(Number);
      const [endHour, endMin] = newDailyReport.estimatedEndTime.split(":").map(Number);
      const startMinutes = startHour * 60 + startMin;
      const endMinutes = endHour * 60 + endMin;
      const durationMinutes = Math.max(0, endMinutes - startMinutes);

      const generateWorkCode = () => {
        const timestamp = Date.now().toString().slice(-6); // Lấy 6 chữ số cuối của timestamp
        const randomNum = Math.floor(Math.random() * 100)
          .toString()
          .padStart(2, "0"); // Random 2 chữ số
        return `WK${timestamp}${randomNum}`;
      };

      const work_code = generateWorkCode();

      // Chuẩn bị payload theo yêu cầu của createWorkService
      const workPayload = {
        // Trường bắt buộc
        work_code: work_code,
        title: String(newDailyReport.title).trim(),
        description: String(newDailyReport.content).trim(),
        category_id: Number(newDailyReport.work_category),
        created_by: createdByUserId,
        created_by_sales_id: salesPersonId,
        required_date: new Date(newDailyReport.date).toISOString().split("T")[0],
        location: String(newDailyReport.address).trim(),
        customer_name: String(newDailyReport.customerName).trim(),
        customer_phone: String(newDailyReport.phoneNumber).trim(),
        customer_address: String(newDailyReport.address).trim(),
        location_lat: lat,
        location_lng: lng,
        estimated_hours: estHours,
        estimated_cost: newDailyReport.estimated_cost ? Number(newDailyReport.estimated_cost) : 0,
        customer_id: newDailyReport.customer_id || null,
        priority: newDailyReport.priority || "medium",
        status: "pending",
        notes: newDailyReport.notes || null,
        due_date: null,
        required_time_hour: String(startHour).padStart(2, "0"),
        required_time_minute: String(startMin).padStart(2, "0"),
        timeSlot: startHour > 0 ? startHour : null,
        project_id: newDailyReport.project_id || null,
        payment_status: "unpaid",
        is_active: true,
      };

      console.log("Payload công việc gửi đi:", workPayload);

      const response = await creatNewWorkService(workPayload);

      if (response.success || response.status === "success") {
        toast?.success({
          title: "Thành công",
          message: "Công việc đã được tạo thành công!",
          duration: 3000,
        });
        // Reset form
        setNewDailyReport(resetFormData());
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
      <Header title="Báo Cáo Công Việc" currentTime={currentTime} userInfo={userInfo} />

      <Box className="px-4 pt-4 pb-28">
        {/* Overtime Request Form - Optimized Layout */}
        <Box className="space-y-3">
          {/* Main Form Container */}
          <Box className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <Box className="p-4 space-y-5">
              {/* Section 1: Work Information */}
              <Box>
                <Text className="font-semibold text-gray-900 text-sm mb-3 flex items-center">
                  <Icon icon="zi-note" className="mr-2 text-green-600" size={16} />
                  Thông Tin Công Việc
                </Text>
                <Box className="space-y-3">
                  <Box>
                    <Text className="text-xs text-gray-700 font-medium mb-2">Tiêu đề công việc *</Text>
                    <Input
                      placeholder="Nhập tiêu đề công việc"
                      value={newDailyReport.title}
                      onChange={(e) => handleInputChange("title", e.target.value)}
                    />
                  </Box>

                  <Box>
                    <Text className="text-xs text-gray-700 font-medium mb-2">Nội dung công việc *</Text>
                    <Input
                      placeholder="Mô tả chi tiết công việc cần thực hiện"
                      value={newDailyReport.content}
                      onChange={(e) => handleInputChange("content", e.target.value)}
                      rows={3}
                    />
                  </Box>

                  <Box className="grid grid-cols-2 gap-3">
                    <Box>
                      <Text className="text-xs text-gray-700 font-medium mb-2">Danh mục *</Text>
                      <select
                        value={newDailyReport.work_category}
                        onChange={(e) => handleInputChange("work_category", e.target.value)}
                        className="w-full px-3 py-2 border bg-transparent border-gray-300 rounded-lg text-sm focus:outline-none focus:border-green-600 h-10"
                        disabled={categoriesLoading}
                      >
                        <option value="">Chọn danh mục</option>
                        {workCategories.map((category) => (
                          <option key={category.id} value={category.id}>
                            {category.name}
                          </option>
                        ))}
                      </select>
                    </Box>
                    <Box>
                      <Text className="text-xs text-gray-700 font-medium mb-2">Mức độ ưu tiên</Text>
                      <select
                        value={newDailyReport.priority}
                        onChange={(e) => handleInputChange("priority", e.target.value)}
                        className="w-full px-3 py-2 border bg-transparent border-gray-300 rounded-lg text-sm focus:outline-none focus:border-green-600 h-10"
                      >
                        <option value="low">Thấp</option>
                        <option value="medium">Trung bình</option>
                        <option value="high">Cao</option>
                        <option value="urgent">Khẩn cấp</option>
                      </select>
                    </Box>
                  </Box>

                  {/* <Box className="grid grid-cols-2 gap-3">
                    <Box>
                      <Text className="text-xs text-gray-700 font-medium mb-2">Giờ ước tính *</Text>
                      <Input
                        placeholder="0.00"
                        type="number"
                        value={newDailyReport.estimated_hours}
                        onChange={(e) => handleInputChange("estimated_hours", e.target.value)}
                        step="0.01"
                        min="0"
                      />
                    </Box>
                    <Box>
                      <Text className="text-xs text-gray-700 font-medium mb-2">Chi phí ước tính (VND)</Text>
                      <Input
                        placeholder="0"
                        type="number"
                        value={newDailyReport.estimated_cost}
                        onChange={(e) => handleInputChange("estimated_cost", e.target.value)}
                        min="0"
                      />
                    </Box>
                  </Box> */}

                  <Box>
                    <Text className="text-xs text-gray-700 font-medium mb-2">Ghi chú thêm</Text>
                    <Input
                      placeholder="Thêm ghi chú nếu cần..."
                      value={newDailyReport.notes}
                      onChange={(e) => handleInputChange("notes", e.target.value)}
                      rows={2}
                    />
                  </Box>
                </Box>
              </Box>

              <Box className="border-t border-gray-100" />

              {/* Section 2: Date & Time */}
              <Box>
                <Text className="font-semibold text-gray-900 text-sm mb-3 flex items-center">
                  <Icon icon="zi-calendar" className="mr-2 text-green-600" size={16} />
                  Thời Gian Thực Hiện
                </Text>
                <Box className="space-y-3">
                  <Box>
                    <Text className="text-xs text-gray-700 font-medium mb-2">Ngày thực hiện</Text>
                    <DatePicker
                      value={newDailyReport.date}
                      onChange={(date) => handleInputChange("date", date)}
                      placeholder="Chọn ngày"
                      className="w-full"
                      dateFormat="dd/mm/yyyy"
                    />
                  </Box>

                  <Box className="grid grid-cols-2 gap-3">
                    <Box>
                      <Text className="text-xs text-gray-700 font-medium mb-2">Giờ bắt đầu</Text>
                      <Input
                        type="time"
                        value={newDailyReport.estimatedStartTime}
                        onChange={(e) => handleInputChange("estimatedStartTime", e.target.value)}
                        className="w-full"
                      />
                    </Box>
                    <Box>
                      <Text className="text-xs text-gray-700 font-medium mb-2">Giờ kết thúc</Text>
                      <Input
                        type="time"
                        value={newDailyReport.estimatedEndTime}
                        onChange={(e) => handleInputChange("estimatedEndTime", e.target.value)}
                        className="w-full"
                      />
                    </Box>
                  </Box>
                </Box>
              </Box>

              <Box className="border-t border-gray-100" />

              {/* Section 3: Customer Information */}
              <Box>
                <Text className="font-semibold text-gray-900 text-sm mb-3 flex items-center">
                  <Icon icon="zi-user" className="mr-2 text-green-600" size={16} />
                  Thông Tin Khách Hàng & Địa điểm
                </Text>
                <Box className="space-y-3">
                  {/* System Customer Mode */}
                  {!useManualCustomer && (
                    <Box className="space-y-3">
                      <button
                        onClick={() => setShowCustomerList(!showCustomerList)}
                        className="w-full px-3 py-2.5 border border-green-400 text-green-600 rounded-lg font-semibold text-sm hover:bg-green-50 transition-colors"
                        disabled={customersLoading}
                      >
                        {customersLoading ? "Đang tải..." : "Chọn khách hàng từ danh sách"}
                      </button>

                      {showCustomerList && (
                        <Box className="rounded-lg border border-gray-200 bg-white shadow-md overflow-hidden">
                          <Box className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                            <Text className="text-xs font-semibold text-gray-700 uppercase tracking-wide">
                              {customers.length} khách hàng trong hệ thống
                            </Text>
                          </Box>
                          <Box className="max-h-64 overflow-y-auto">
                            {customers.length > 0 ? (
                              customers.map((customer) => (
                                <button
                                  key={customer.id}
                                  onClick={() => handleCustomerSelect(customer)}
                                  className="w-full text-left px-4 py-3 border-b border-gray-100 hover:bg-green-50 active:bg-green-100 transition-all group last:border-b-0"
                                >
                                  <Box className="flex items-start gap-3">
                                    <Box className="flex-1 min-w-0">
                                      <Text className="font-semibold text-gray-900 text-sm group-hover:text-green-600 transition-colors">
                                        {customer.name}
                                      </Text>
                                      <Box className="flex items-center gap-2 mt-1">
                                        <Text className="text-xs text-gray-600">{customer.phone || "N/A"}</Text>
                                      </Box>
                                      {customer.address && (
                                        <Text className="text-xs text-gray-500 mt-1 line-clamp-1">
                                          {customer.address}
                                        </Text>
                                      )}
                                    </Box>
                                    <Icon
                                      icon="zi-chevron-right"
                                      className="text-gray-300 group-hover:text-green-600 flex-shrink-0 mt-1"
                                      size={16}
                                    />
                                  </Box>
                                </button>
                              ))
                            ) : (
                              <Box className="px-4 py-8 text-center">
                                <Icon icon="zi-inbox" className="text-gray-300 mx-auto mb-2" size={32} />
                                <Text className="text-xs text-gray-500">Chưa có khách hàng trong hệ thống</Text>
                              </Box>
                            )}
                          </Box>
                        </Box>
                      )}
                    </Box>
                  )}

                  {/* Manual Customer Mode */}
                  {useManualCustomer && (
                    <Box>
                      <Box className="border-l-3 border-blue-400 pt-3 text-xs text-blue-800">
                        <Icon icon="zi-info-circle" className="mr-1 inline-block" size={14} />
                        Thông tin sẽ được lưu tạm thời cho báo cáo này
                      </Box>
                    </Box>
                  )}
                </Box>
              </Box>

              {/* Section 4: Location Information */}
              <Box>
                <Box className="space-y-3">
                  <Box>
                    <Text className="text-xs text-gray-700 font-medium mb-2 mt-2">Tên khách hàng *</Text>
                    <Input
                      placeholder="Ví dụ: Công ty ABC, Anh Sơn..."
                      value={newDailyReport.customerName}
                      onChange={(e) => handleInputChange("customerName", e.target.value)}
                      className="focus:ring-2 focus:ring-green-300"
                    />
                  </Box>
                  <Box>
                    <Text className="text-xs text-gray-700 font-medium mb-2">Số điện thoại *</Text>
                    <Input
                      placeholder="Ví dụ: 0901234567"
                      value={newDailyReport.phoneNumber}
                      onChange={(e) => handleInputChange("phoneNumber", e.target.value)}
                      type="tel"
                      className="focus:ring-2 focus:ring-green-300"
                    />
                  </Box>
                  <Box>
                    <Text className="text-xs text-gray-700 font-medium mb-2">Địa chỉ *</Text>
                    <Input
                      placeholder="Nhập địa chỉ công việc"
                      value={newDailyReport.address}
                      onChange={(e) => handleInputChange("address", e.target.value)}
                      disabled={selectedProjectId !== null || (useSystemCustomer && !useManualCustomer)}
                      rows={2}
                    />
                  </Box>

                  <Box>
                    <Box className="grid grid-cols-2 gap-3">
                      <Box>
                        <Text className="text-xs text-gray-600 mb-1">Vĩ độ</Text>
                        <Input
                          placeholder="10.7769"
                          value={newDailyReport.location_lat}
                          onChange={(e) => handleInputChange("location_lat", e.target.value)}
                          disabled={selectedProjectId !== null || (useSystemCustomer && !useManualCustomer)}
                        />
                      </Box>
                      <Box>
                        <Text className="text-xs text-gray-600 mb-1">Kinh độ</Text>
                        <Input
                          placeholder="106.7009"
                          value={newDailyReport.location_lng}
                          onChange={(e) => handleInputChange("location_lng", e.target.value)}
                          disabled={selectedProjectId !== null || (useSystemCustomer && !useManualCustomer)}
                        />
                      </Box>
                    </Box>
                  </Box>
                </Box>
              </Box>

              <Box className="border-t border-gray-100" />

              {/* Section 5: Project Selection */}
              <Box>
                <Text className="font-semibold text-gray-900 text-sm mb-3 flex items-center">
                  <Icon icon="zi-home" className="mr-2 text-green-600" size={16} />
                  Dự Án (Tùy Chọn)
                </Text>
                <Box className="space-y-3">
                  {selectedProjectId ? (
                    <Box className="bg-green-50 rounded-lg p-3 border-2 border-green-300">
                      <Box className="flex items-start justify-between gap-2">
                        <Box className="flex-1 min-w-0">
                          <Text className="font-semibold text-green-900 text-sm">
                            {PROJECTS_LIST.find((p) => p.id === selectedProjectId)?.name}
                          </Text>
                          <Text className="text-xs text-green-700 mt-1 line-clamp-1">
                            {PROJECTS_LIST.find((p) => p.id === selectedProjectId)?.address}
                          </Text>
                        </Box>
                        <button
                          onClick={handleClearProject}
                          className="text-green-600 hover:bg-green-100 p-1.5 rounded transition-colors"
                        >
                          <Icon icon="zi-close" size={16} />
                        </button>
                      </Box>
                    </Box>
                  ) : (
                    <Box className="space-y-2">
                      <button
                        onClick={() => setShowProjectList(!showProjectList)}
                        className="w-full px-3 py-2.5 border border-green-400 text-green-600 rounded-lg font-semibold text-sm hover:bg-green-50 transition-colors"
                      >
                        Chọn dự án đang thi công
                      </button>

                      {showProjectList && (
                        <Box className="space-y-2 p-2 bg-gray-50 rounded-lg border border-gray-200 max-h-56 overflow-y-auto">
                          {PROJECTS_LIST.map((project) => (
                            <button
                              key={project.id}
                              onClick={() => handleSelectProject(project)}
                              className="w-full text-left p-2.5 rounded-lg border border-gray-200 bg-white hover:border-green-400 hover:bg-green-50 transition-all text-sm"
                            >
                              <Text className="font-semibold text-gray-900">{project.company}</Text>
                              <Text className="text-xs text-gray-600 mt-0.5 line-clamp-1">{project.address}</Text>
                            </button>
                          ))}
                        </Box>
                      )}
                    </Box>
                  )}
                </Box>
              </Box>
            </Box>
          </Box>

          {/* Action Buttons */}
          <Box className="flex gap-2">
            <Button
              onClick={() => {
                setNewDailyReport(resetFormData());
                setSelectedProjectId(null);
                setUseSystemCustomer(false);
                setUseManualCustomer(false);
              }}
              fullWidth
              variant="secondary"
              className="px-3 py-3 bg-gray-400 hover:bg-gray-500 text-white rounded-lg text-sm font-semibold transition-colors disabled:opacity-50"
            >
              Hủy
            </Button>
            <Button
              fullWidth
              onClick={handleSubmitOvertime}
              disabled={isSubmitting}
              className="px-3 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-semibold transition-colors disabled:opacity-50"
            >
              {isSubmitting ? "Đang gửi..." : "Báo Cáo"}
            </Button>
          </Box>
        </Box>
      </Box>

      <BottomNavigation />
    </Page>
  );
}

export default HomePage;
