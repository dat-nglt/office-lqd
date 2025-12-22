import React, { useState, useEffect, useRef, useContext } from "react";
import { Box, Button, Page, Text, Icon, Spinner } from "zmp-ui";
import { useNavigate } from "react-router-dom";
import { getAccessToken } from "zmp-sdk/apis";
import { nativeStorage } from "zmp-sdk/apis";
import { zaloLogin } from "../services/auth.service";
import { clearTokens, getTokens, getUserInfo, setTokens, setUserInfo } from "../config/axiosConfig";
import { ToastContext } from "../components/layout";

/**
 * Login Component - Zalo Mini App Authentication
 *
 * Flow:
 * 1. User clicks "Đăng nhập bằng Zalo" button
 * 2. Frontend calls getZaloAccessToken() from Zalo SDK
 * 3. Zalo Mini App returns access_token
 * 4. Frontend sends POST /api/v1/ims/auth/zalo-login { access_token }
 * 5. Backend verifies token with Zalo API (graph.zalo.me/v2.0/me)
 * 6. Backend creates JWT token
 * 7. Backend returns { user, access_token }
 * 8. Frontend saves token + user info to localStorage
 * 9. Frontend redirects to home page (/)
 */
const Login = () => {
    const navigate = useNavigate();
    const toast = useContext(ToastContext);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [step, setStep] = useState(0); // Track login progress
    const [pendingApproval, setPendingApproval] = useState(false); // New state for unapproved users
    const [rejectedApproval, setRejectedApproval] = useState(false); // New state for rejected users
    const isMountedRef = useRef(true);

    useEffect(() => {
        return () => {
            isMountedRef.current = false;
        };
    }, []);

    /**
     * Check if user is already logged in
     */
    useEffect(() => {
        const token = getTokens();
        const userInfo = getUserInfo();

        console.log("[Login] Existing token:", token);
        console.log("[Login] Existing user info:", userInfo);

        if (token && userInfo) {
            try {
                setUserInfo(JSON.parse(userInfo));
                navigate("/", { replace: true });
            } catch (err) {
                console.error("Error parsing stored user info:", err);
                localStorage.removeItem("access_token");
                localStorage.removeItem("user_info");
            }
        }
    }, [navigate]);

    /**
     * Handle Zalo login flow
     */
    const handleZaloLogin = async () => {
        if (loading) return;

        setLoading(true);
        setError(null);
        setStep(0);
        setPendingApproval(false); // Reset pending state
        setRejectedApproval(false); // Reset rejected state

        try {
            setStep(1); //Bước 1: Lấy access token từ Zalo Mini App
            const accessToken = await getAccessToken(); // Lấy access token từ Zalo Mini App

            console.log("Zalo Access Token:", accessToken);

            if (!accessToken) throw new Error("Không nhận được mã xác thực từ Zalo");

            setStep(2); //Bước 2: Gửi access token lên server để đăng nhập
            const response = await zaloLogin(accessToken);

            if (!response || response.status !== "success") throw new Error(response?.message || "Đăng nhập thất bại");

            setStep(3); //Bước 3: Xử lý phản hồi từ server và lưu token + user info
            const { access_token, user } = response.data;

            // Kiểm tra trạng thái phê duyệt tài khoản
            if (user.approved === "rejected") {
                clearTokens();
                setRejectedApproval(true); // Show rejected approval UI
                return;
            } else if (user.approved !== "approved") {
                setPendingApproval(true); // Show pending approval UI
                return;
            }

            setTokens(access_token, null);
            setUserInfo(user);

            getUserInfo(); // Đảm bảo user info được lưu đúng
            getTokens();

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
            const errorMsg = err.message || "Đã xảy ra lỗi. Vui lòng thử lại.";
            setError(errorMsg);
            toast?.error({
                title: "Lỗi đăng nhập",
                message: errorMsg,
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
                    <Text className="text-blue-800 text-sm">
                        Đảm bảo bạn đã đăng nhập trong ứng dụng Zalo trước khi sử dụng Mini App này.
                    </Text>
                </Box>

                {/* Conditional Rendering: Approval Status or Welcome Card */}
                {rejectedApproval ? (
                    <Box className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
                        <Text.Title className="text-red-800 text-sm font-semibold mb-2">
                            Tài khoản đã bị từ chối
                        </Text.Title>
                        <Text className="text-red-700 text-xs mb-4">
                            Tài khoản của bạn đã bị từ chối phê duyệt. Vui lòng liên hệ quản trị viên để biết thêm chi
                            tiết.
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
                        <Text.Title className="text-yellow-800 text-sm font-semibold mb-2">
                            Tài khoản đang chờ phê duyệt
                        </Text.Title>
                        <Text className="text-yellow-700 text-xs mb-4">
                            Tài khoản của bạn cần được chấp thuận từ phía quản trị viên. Vui lòng đợi và thử đăng nhập
                            lại sau.
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
                        <Text className="text-gray-600 text-xs mb-6">
                            Đăng nhập bằng tài khoản Zalo nội bộ để truy cập hệ thống chấm công và quản lý công việc
                        </Text>

                        {/* Loading Progress */}
                        {loading && (
                            <Box className="bg-blue-50 rounded-lg p-2 py-3">
                                <Icon icon="zi-auto" className="animate-spin text-blue-600" />
                            </Box>
                        )}

                        {/* Login Button */}
                        {!loading && (
                            <Button
                                onClick={handleZaloLogin}
                                className={`w-full py-3 rounded-lg font-semibold text-white ${
                                    loading ? "bg-blue-300" : "bg-blue-600 hover:bg-blue-700"
                                }`}
                            >
                                Đăng nhập bằng Zalo
                            </Button>
                        )}
                    </Box>
                )}

                {/* Features List */}
                <Box className="bg-white rounded-lg shadow-sm p-4">
                    <Text className="text-gray-700 text-sm font-semibold mb-3">Tính năng chính</Text>
                    <Box className="space-y-2">
                        {[
                            {
                                icon: "zi-location",
                                text: "Chấm công theo vị trí",
                            },
                            {
                                icon: "zi-calendar",
                                text: "Quản lý lịch làm việc",
                            },
                            {
                                icon: "zi-camera",
                                text: "Báo cáo tiến độ công việc",
                            },
                            {
                                icon: "zi-clock-1",
                                text: "Theo dõi thời gian làm việc",
                            },
                        ].map((feature, index) => (
                            <Box key={index} className="flex items-center gap-2">
                                <Icon icon={feature.icon} className="text-blue-600" size={16} />
                                <Text className="text-gray-600 text-sm">{feature.text}</Text>
                            </Box>
                        ))}
                    </Box>
                </Box>

                {/* Support */}
                <Box className="bg-white rounded-lg shadow-sm p-4">
                    <Text className="text-gray-700 text-sm font-semibold mb-3">Hỗ trợ</Text>
                    <Box className="space-y-2">
                        <Box className="flex items-center gap-2">
                            <Icon icon="zi-call" className="text-blue-600" size={16} />
                            <Text className="text-gray-600 text-sm">0397.364.664 - Tấn Đạt</Text>
                        </Box>
                    </Box>
                </Box>
            </Box>

            {/* Footer */}
            <Box className="bg-white border-t border-gray-200 py-3 px-4 text-center">
                <Text className="text-gray-500 text-xs py-4">
                    Lam Quang Dai HVAC © 2025 IMS System. All rights reserved.
                </Text>
            </Box>
        </Page>
    );
};

export default Login;
