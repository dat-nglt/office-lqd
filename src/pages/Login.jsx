import React, { useState, useEffect, useRef, useContext } from "react";
import { Box, Button, Page, Text, Icon } from "zmp-ui";
import { useNavigate } from "react-router-dom";
import { getAccessToken, getSetting, authorize, openPermissionSetting, openPhone } from "zmp-sdk/apis";
import { zaloLogin } from "../services/auth.service";
import { clearTokens, getTokens, getUserInfo, setTokens, setUserInfo } from "../config/axiosConfig";
import { ToastContext } from "../components/layout";

// Constants
const FEATURES = [
  { icon: "zi-location", text: "Chấm công theo vị trí" },
  { icon: "zi-calendar", text: "Quản lý lịch làm việc" },
  { icon: "zi-camera", text: "Báo cáo tiến độ công việc" },
  { icon: "zi-clock-1", text: "Theo dõi thời gian làm việc" },
];

const APPROVAL_STATUS = {
  APPROVED: "approved",
  REJECTED: "rejected",
  PENDING: "pending",
};

const Login = () => {
  const navigate = useNavigate();
  const toast = useContext(ToastContext);
  const [loading, setLoading] = useState(false);
  const [pendingApproval, setPendingApproval] = useState(false);
  const [rejectedApproval, setRejectedApproval] = useState(false);
  const isMountedRef = useRef(true);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // Kiểm tra nếu đã đăng nhập trước đó và chuyển hướng tự động
  useEffect(() => {
    const token = getTokens();

    if (token) {
      navigate("/", { replace: true });
    }
  }, [navigate]);

  const handleCallSupport = async () => {
    await openPhone({
      phoneNumber: "+84397364664",
    });
  };

  const requestPermissions = async () => {
    try {
      const { authSetting } = await getSetting();

      if (
        authSetting["scope.userLocation"] &&
        authSetting["scope.userPhonenumber"] &&
        authSetting["scope.userInfo"] &&
        authSetting["scope.camera"]
      ) {
        return true;
      }

      await openPermissionSetting();
      await authorize({
        scopes: ["scope.userLocation", "scope.userPhonenumber"],
      });
    } catch (error) {
      const isPermissionDenied = error?.code === -201;
      const errorTitle = "Không được cấp quyền";
      const errorMessage = isPermissionDenied
        ? "Vui lòng cấp quyền để tiếp tục"
        : "Vui lòng kiểm tra kết nối và thử lại";

      toast?.error({ title: errorTitle, message: errorMessage, duration: 3000 });
      console.error("Permission error:" + error);
      console.error("Permission error:", error);
      return false;
    }
  };

  const handleZaloLogin = async () => {
    if (loading) return;

    setLoading(true);
    setPendingApproval(false);
    setRejectedApproval(false);

    try {
      const permissionGranted = await requestPermissions();
      if (!permissionGranted) {
        setLoading(false);
        return;
      }

      const accessToken = await getAccessToken();
      if (!accessToken) throw new Error("Không nhận được mã xác thực từ Zalo");

      const response = await zaloLogin(accessToken);
      // if (!response?.data) throw new Error(response?.message || "Đăng nhập thất bại");
      console.log(response);

      const { access_token, user } = response.data;

      // Handle approval status
      if (user.approved === APPROVAL_STATUS.REJECTED) {
        clearTokens();
        setRejectedApproval(true);
        return;
      }

      if (user.approved !== APPROVAL_STATUS.APPROVED) {
        setPendingApproval(true);
        return;
      }

      setTokens(access_token);
      setUserInfo(user);

      toast?.success({
        title: "Đăng nhập thành công",
        message: `Chào mừng ${user.name || "bạn"}!`,
        duration: 2000,
      });

      if (isMountedRef.current) {
        navigate("/", { replace: true });
      }
    } catch (err) {
      clearTokens();
      console.error("[Login] Error:", err);
      toast?.error({
        title: "Lỗi đăng nhập",
        message: err.message || "Đã xảy ra lỗi. Vui lòng thử lại.",
        duration: 3000,
      });
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  };

  return (
    <Page className="bg-gray-50 min-h-screen flex flex-col">
      {/* Header */}
      <Box className="bg-gradient-to-r from-blue-600 to-blue-800 pb-6 px-4 pt-12">
        <Text.Title className="text-white font-bold text-xl">Hệ Thống Chấm Công IMS</Text.Title>
        <Text className="text-blue-100 text-sm">Đăng nhập nội bộ cho kỹ thuật viên Lâm Quang Đại</Text>
      </Box>

      {/* Main Content */}
      <Box className="flex-1 p-6 space-y-6">
        {/* Info Box */}
        <Box className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <Text className="text-blue-800 text-sm ">
            Đảm bảo bạn đã đăng nhập tài khoản Zalo trước khi sử dụng Mini App này. Hệ thống sẽ gửi yêu cầu cấp quyền để
            lấy thông tin cần thiết cho việc sử dụng Mini App. Vui lòng đồng ý để tiếp tục.
          </Text>
        </Box>

        {/* Approval Status or Login Card */}
        {rejectedApproval ? (
          <Box className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <Text.Title className="text-red-800 text-sm font-semibold mb-2">Tài khoản đã bị từ chối</Text.Title>
            <Text className="text-red-700 text-xs mb-4">
              Tài khoản của bạn đã bị từ chối phê duyệt. Vui lòng liên hệ quản trị viên để biết thêm chi tiết.
            </Text>
            <Button
              onClick={() => setRejectedApproval(false)}
              className="bg-red-600 hover:bg-red-700 w-full py-3 rounded-lg font-semibold text-white"
            >
              Thử lại
            </Button>
          </Box>
        ) : pendingApproval ? (
          <Box className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
            <Text.Title className="text-yellow-800 text-sm font-semibold mb-2">Tài khoản đang chờ phê duyệt</Text.Title>
            <Text className="text-yellow-700 text-xs mb-4">
              Tài khoản của bạn cần được chấp thuận từ phía quản trị viên. Vui lòng đợi và thử đăng nhập lại sau.
            </Text>
            <Button
              onClick={() => setPendingApproval(false)}
              className="bg-yellow-600 hover:bg-yellow-700 w-full py-3 rounded-lg font-semibold text-white"
            >
              Thử lại
            </Button>
          </Box>
        ) : (
          <Box className="bg-white rounded-lg shadow-md p-6 text-center">
            <Text className="text-gray-600 text-sm mb-6">
              Đăng nhập bằng tài khoản Zalo của bạn để truy cập hệ thống chấm công và quản lý công việc
            </Text>

            {loading ? (
              <Box className="bg-blue-50 rounded-lg p-3 py-3">
                <Icon icon="zi-auto" className="animate-spin text-blue-600" />
              </Box>
            ) : (
              <Button
                onClick={handleZaloLogin}
                className="w-full py-3 rounded-lg font-semibold text-white bg-blue-600 hover:bg-blue-700"
              >
                Đăng nhập bằng Zalo
              </Button>
            )}
          </Box>
        )}

        {/* Features List */}
        <Box className="bg-white rounded-lg shadow-sm p-4">
          {/* <Text className="text-gray-700 text-sm font-semibold mb-3">Tính năng chính</Text> */}
          <Box className="space-y-2">
            {FEATURES.map((feature, index) => (
              <Box key={index} className="flex items-center gap-2">
                <Icon icon={feature.icon} className="text-blue-600" size={16} />
                <Text className="text-gray-600 text-sm">{feature.text}</Text>
              </Box>
            ))}
          </Box>
        </Box>

        {/* Support */}
        <Box
          className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg shadow-md p-5 cursor-pointer hover:shadow-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-300"
          onClick={handleCallSupport}
        >
          <Box className="flex items-start gap-3">
            <Box className="flex-1">
              <Text className="text-white text-sm font-bold mb-1">Cần hỗ trợ?</Text>
              <Text className="text-blue-100 text-xs mb-2">Gọi ngay để được hỗ trợ nhanh nhất</Text>
              <Box className="flex items-center gap-1">
                <Text className="text-white text-sm font-semibold">0397.364.664</Text>
              </Box>
              <Text className="text-blue-100 text-xs mt-1">Nguyễn Lê Tấn Đạt</Text>
            </Box>
            <Box className="flex-shrink-0 opacity-80">
              <Icon icon="zi-arrow-right" className="text-white" size={24} />
            </Box>
          </Box>
        </Box>
      </Box>

      {/* Footer */}
      <Box className="bg-white border-t border-gray-200 py-3 px-4 text-center">
        <Text className="text-gray-500 text-xs py-4">Lam Quang Dai HVAC © 2025 IMS System</Text>
      </Box>
    </Page>
  );
};

export default Login;
