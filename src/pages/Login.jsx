import React, { useState, useEffect, useRef, useContext } from "react";
import { Box, Button, Page, Text, Icon, Spinner } from "zmp-ui";
import { useNavigate } from "react-router-dom";
import { getAccessToken } from "zmp-sdk/apis";
import { authService } from "../services/apiService";
import { setTokens, setUserInfo } from "../config/axiosConfig";
import { ToastContext } from "../components/layout";
import BottomNavigation from "../components/BottomNavigation";

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
        const token = localStorage.getItem("access_token");
        const userInfo = localStorage.getItem("user_info");

        if (token && userInfo) {
            try {
                setUserInfo(JSON.parse(userInfo));
                navigate("/", { replace: true });
            } catch (err) {
                console.error("Error parsing stored user info:", err);
                // Clear invalid data
                localStorage.removeItem("access_token");
                localStorage.removeItem("user_info");
            }
        }
    }, [navigate]);

    /**
     * Handle Zalo login flow
     * Step 1: Get Zalo Access Token
     * Step 2: Send to backend
     * Step 3: Save JWT and redirect
     */
    const handleZaloLogin = async () => {
        // Prevent multiple simultaneous login attempts
        if (loading) return;

        setLoading(true);
        setError(null);
        setStep(0);

        try {
            // ========================================
            // Step 1: Get Access Token from Zalo SDK
            // ========================================
            setStep(1);
            console.log("[Login] Step 1: Requesting Zalo access token...");

            let accessToken;
            try {
                accessToken = await getAccessToken();
            } catch (err) {
                console.error(
                    "[Login] Step 1 Failed: Cannot get Zalo access token",
                    err
                );
                const errorMsg =
                    "Không thể kết nối với Zalo. Vui lòng đảm bảo bạn đang sử dụng Zalo ứng dụng.";
                setError(errorMsg);
                toast?.error({
                    title: "Lỗi kết nối Zalo",
                    message: errorMsg,
                    duration: 3000,
                });
                return;
            }

            if (!accessToken) {
                console.error("[Login] Step 1 Failed: Access token is empty");
                const errorMsg = "Không nhận được mã xác thực từ Zalo.";
                setError(errorMsg);
                toast?.error({
                    title: "Lỗi xác thực",
                    message: errorMsg,
                    duration: 3000,
                });
                return;
            }

            console.log("[Login] Step 1 Success: Received Zalo access token");

            // ========================================
            // Step 2: Send Access Token to Backend
            // ========================================
            setStep(2);
            console.log("[Login] Step 2: Sending access token to backend...");

            let response;
            try {
                response = await authService.zaloLogin(accessToken);
            } catch (err) {
                console.error(
                    "[Login] Step 2 Failed: Backend authentication error",
                    err
                );

                // Handle specific error responses
                const status = err.response?.status;
                const message = err.response?.data?.message;

                let errorMsg = "Không thể xác thực. Vui lòng thử lại.";

                if (status === 400) {
                    errorMsg = "Yêu cầu không hợp lệ. Vui lòng thử lại.";
                } else if (status === 401) {
                    errorMsg =
                        "Mã xác thực đã hết hạn. Vui lòng đăng nhập lại.";
                } else if (status === 403) {
                    errorMsg =
                        message || "Tài khoản đã bị khóa hoặc không hoạt động.";
                } else if (status === 408) {
                    errorMsg = "Kết nối đến server quá lâu. Vui lòng thử lại.";
                } else if (status === 500) {
                    errorMsg = "Lỗi server. Vui lòng liên hệ quản trị viên.";
                }

                setError(errorMsg);
                toast?.error({
                    title: "Lỗi đăng nhập",
                    message: errorMsg,
                    duration: 3000,
                });
                return;
            }

            if (!response || response.status !== "success") {
                console.error(
                    "[Login] Step 2 Failed: Invalid response from backend",
                    response
                );
                const errorMsg = response?.message || "Đăng nhập thất bại.";
                setError(errorMsg);
                toast?.error({
                    title: "Lỗi đăng nhập",
                    message: errorMsg,
                    duration: 3000,
                });
                return;
            }

            console.log("[Login] Step 2 Success: Backend returned JWT token");

            // ========================================
            // Step 3: Save JWT and User Info
            // ========================================
            setStep(3);
            console.log(
                "[Login] Step 3: Saving JWT and user info to localStorage..."
            );

            const { access_token, user } = response.data;

            if (!access_token || !user) {
                console.error(
                    "[Login] Step 3 Failed: Missing token or user data in response"
                );
                const errorMsg = "Dữ liệu đăng nhập không hợp lệ.";
                setError(errorMsg);
                toast?.error({
                    title: "Lỗi dữ liệu",
                    message: errorMsg,
                    duration: 3000,
                });
                return;
            }

            try {
                // Update Axios instance with new token
                setTokens(access_token, null);

                // Save to localStorage
                localStorage.setItem("access_token", access_token);
                localStorage.setItem("user_info", JSON.stringify(user));

                // Update user info in state
                setUserInfo(user);

                console.log(
                    "[Login] Step 3 Success: Data saved to localStorage"
                );
                console.log("[Login] Logged in user:", user.name || user.id);

                // Show success toast
                toast?.success({
                    title: "Đăng nhập thành công",
                    message: `Chào mừng ${user.name || "bạn"}!`,
                    duration: 2000,
                });

                // ========================================
                // Step 4: Redirect to Home Page
                // ========================================
                setStep(4);
                console.log("[Login] Step 4: Redirecting to home page...");

                // Use replace to prevent going back to login page
                if (isMountedRef.current) {
                    navigate("/", { replace: true });
                }
            } catch (err) {
                console.error("[Login] Step 3 Failed: Error saving data", err);
                const errorMsg = "Không thể lưu thông tin đăng nhập.";
                setError(errorMsg);
                toast?.error({
                    title: "Lỗi lưu dữ liệu",
                    message: errorMsg,
                    duration: 3000,
                });
            }
        } catch (err) {
            console.error("[Login] Unexpected error:", err);
            const errorMsg = "Đã xảy ra lỗi. Vui lòng thử lại.";
            setError(errorMsg);
            toast?.error({
                title: "Lỗi",
                message: errorMsg,
                duration: 3000,
            });
        } finally {
            if (isMountedRef.current) {
                setLoading(false);
            }
        }
    };

    /**
     * Get step description for progress feedback
     */
    const getStepDescription = () => {
        switch (step) {
            case 1:
                return "Kết nối với Zalo...";
            case 2:
                return "Xác thực tài khoản...";
            case 3:
                return "Lưu thông tin...";
            case 4:
                return "Chuyển hướng...";
            default:
                return "Đang đăng nhập...";
        }
    };

    return (
        <Page className="bg-gray-50 min-h-screen pb-20 flex flex-col">
            {/* Header Section - Optimized for better mobile fit */}
            <Box className="bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 shadow-lg pb-6 relative overflow-hidden flex-shrink-0">
                {/* Background Effects */}
                <Box className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full -mr-24 -mt-24"></Box>
                <Box className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full -ml-16 -mb-16"></Box>

                <Box className="px-4 pt-12 pb-4 relative z-10">
                    <Text.Title className="text-white font-bold" size="large">
                        Hệ Thống IMS
                    </Text.Title>
                    <Text className="text-blue-100 text-sm mt-1">
                        Đăng nhập để tiếp tục
                    </Text>
                </Box>
            </Box>

            {/* Main Content - Streamlined with flex for better flow */}
            <Box className="flex-1 p-4 pb-20 space-y-6">
                {/* Info Box - Simplified layout */}
                <Box className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-4 flex gap-3">
                    <Icon
                        icon="zi-info-circle"
                        className="text-amber-600 text-lg flex-shrink-0"
                    />
                    <Box className="flex-1">
                        <Text className="text-amber-900 text-xs font-semibold mb-1">
                            Gợi ý
                        </Text>
                        <Text className="text-amber-800 text-xs leading-relaxed">
                            Đảm bảo bạn đã đăng nhập trong ứng dụng Zalo trước
                            khi sử dụng Mini App này. Nếu gặp vấn đề, hãy liên
                            hệ quản trị viên.
                        </Text>
                    </Box>
                </Box>

                {/* Welcome Card - Consolidated and centered */}
                <Box className="bg-white rounded-2xl shadow-md p-6 border-t-4 border-blue-500 text-center">
                    {/* Logo */}
                    <Box className="flex justify-center mb-6">
                        <Box className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-full p-4 shadow-lg w-fit">
                            <Icon
                                icon="zi-user"
                                className="text-4xl text-white"
                            />
                        </Box>
                    </Box>

                    {/* Welcome Text */}
                    <Text.Title className="text-gray-800 mb-2">
                        Chào mừng
                    </Text.Title>
                    <Text className="text-gray-600 text-sm mb-6">
                        Đăng nhập bằng tài khoản Zalo để sử dụng hệ thống quản
                        lý công việc
                    </Text>

                    {/* Loading Progress - Streamlined */}
                    {loading && (
                        <Box className="bg-blue-50 border-l-4 border-blue-500 rounded-lg p-4 mb-6">
                            <Box className="flex items-center gap-2 mb-3">
                                <Spinner size="small" />
                                <Text className="text-blue-700 text-sm font-semibold">
                                    {getStepDescription()}
                                </Text>
                            </Box>
                            <Box className="bg-blue-200 rounded-full h-2 w-full overflow-hidden">
                                <Box
                                    className="bg-gradient-to-r from-blue-500 to-blue-600 h-full transition-all duration-500"
                                    style={{
                                        width: `${(step / 4) * 100}%`,
                                    }}
                                />
                            </Box>
                        </Box>
                    )}

                    {/* Login Button - Enhanced with better disabled state */}
                    <Button
                        onClick={handleZaloLogin}
                        disabled={loading}
                        className={`w-full font-semibold py-3 px-6 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 text-white ${
                            loading
                                ? "bg-blue-300 cursor-not-allowed opacity-75"
                                : "bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 active:from-blue-800 active:to-blue-900 shadow-md hover:shadow-lg"
                        }`}
                    >
                        {loading ? (
                            <>
                                <Spinner size="small" />
                                <Text>{getStepDescription()}</Text>
                            </>
                        ) : (
                            <>
                                {/* <Icon icon="zi-user" /> */}
                                <Text>Đăng nhập bằng Zalo</Text>
                            </>
                        )}
                    </Button>
                </Box>

                {/* Features List - Improved spacing and alignment */}
                <Box className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
                    <Text className="text-gray-700 text-sm font-semibold mb-3">
                        Tính năng chính
                    </Text>
                    <Box className="space-y-2">
                        {[
                            {
                                icon: "zi-location",
                                text: "Chấm công theo vị trí",
                            },
                            { icon: "zi-calendar", text: "Quản lý công việc" },
                            { icon: "zi-list-2", text: "Báo cáo tiến độ" },
                            {
                                icon: "zi-check-circle",
                                text: "Theo dõi thời gian",
                            },
                        ].map((feature, index) => (
                            <Box
                                key={index}
                                className="flex items-center gap-2"
                            >
                                <Icon
                                    icon={feature.icon}
                                    className="text-blue-600"
                                />
                                <Text className="text-gray-600 text-xs">
                                    {feature.text}
                                </Text>
                            </Box>
                        ))}
                    </Box>
                </Box>
            </Box>

            {/* Footer - Fixed positioning maintained */}
            <Box className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 py-3 px-4 text-center">
                <Text className="text-gray-500 text-xs">
                    © 2024 IMS System. All rights reserved.
                </Text>
            </Box>
        </Page>
    );
};

export default Login;
