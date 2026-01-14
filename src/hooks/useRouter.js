import { useContext } from "react";
import { useNavigate } from "zmp-ui";

/**
 * Custom hook để sử dụng router instance theo ZMP best practices
 * @returns {Object} Router utilities
 */
export const useRouter = () => {
  const navigate = useNavigate();

  /**
   * Navigate đến một route mới
   * @param {string|Object} path - Path hoặc object {path, query}
   * @param {Object} options - Tùy chọn navigation
   */
  const goTo = (path, options = {}) => {
    if (typeof path === "string") {
      navigate(path, options);
    } else if (typeof path === "object" && path.path) {
      const url = path.query ? `${path.path}?${new URLSearchParams(path.query).toString()}` : path.path;
      navigate(url, options);
    }
  };

  /**
   * Trở lại trang trước
   * @param {Object} options - Tùy chọn back navigation
   */
  const goBack = (options = {}) => {
    navigate(-1, options);
  };

  /**
   * Navigate đến trang chủ
   */
  const goHome = () => {
    navigate("/", { replace: true });
  };

  /**
   * Navigate đến trang login
   */
  const goToLogin = () => {
    navigate("/login", { replace: true });
  };

  /**
   * Navigate đến trang profile
   */
  const goToProfile = () => {
    navigate("/profile");
  };

  /**
   * Navigate đến trang work list
   */
  const goToWorkList = () => {
    navigate("/worklist");
  };

  /**
   * Navigate đến trang check-in
   */
  const goToCheckIn = () => {
    navigate("/checkin");
  };

  /**
   * Navigate đến trang work management
   */
  const goToWorkManagement = () => {
    navigate("/work-management");
  };

  /**
   * Navigate đến trang notifications
   */
  const goToNotifications = () => {
    navigate("/notifications");
  };

  /**
   * Navigate đến trang work reports
   */
  const goToWorkReports = () => {
    navigate("/work-reports");
  };

  /**
   * Navigate đến chi tiết work report
   * @param {string|number} id - ID của work report
   */
  const goToWorkReportDetail = (id) => {
    navigate(`/work-report/${id}`);
  };

  /**
   * Navigate đến trang attendance history
   */
  const goToAttendanceHistory = () => {
    navigate("/attendance-history");
  };

  /**
   * Navigate đến trang progress report
   */
  const goToProgressReport = () => {
    navigate("/report");
  };

  /**
   * Navigate đến trang overtime request
   */
  const goToOvertimeRequest = () => {
    navigate("/overtime-request");
  };

  const goToCustomers = () => {
    navigate("/customers");
  };

  return {
    goTo,
    goBack,
    goHome,
    goToLogin,
    goToCustomers,
    goToProfile,
    goToWorkList,
    goToCheckIn,
    goToWorkManagement,
    goToNotifications,
    goToWorkReports,
    goToWorkReportDetail,
    goToAttendanceHistory,
    goToProgressReport,
    goToOvertimeRequest,
  };
};
