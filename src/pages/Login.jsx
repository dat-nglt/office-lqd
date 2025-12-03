import React, { useState, useEffect } from 'react';
import { Box, Button, Page, Text, Icon, Spinner } from 'zmp-ui';
import { useNavigate } from 'react-router-dom';
import { getZaloAccessToken } from '../services/zaloAuth';
import { authService } from '../services/apiService';
import { setTokens, setUserInfo } from '../config/axiosConfig';

const Login = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        // Kiểm tra xem đã đăng nhập chưa
        const token = localStorage.getItem('access_token');
        if (token) {
            navigate('/');
        }
    }, [navigate]);

    const handleZaloLogin = async () => {
        setLoading(true);
        setError(null);

        try {
            // Lấy Access Token từ Zalo
            const accessToken = await getZaloAccessToken();

            // Gọi API đăng nhập với access token
            const response = await authService.zaloLogin(accessToken);

            if (response.status === 'success') {
                // Lưu token và thông tin user
                const { access_token, user } = response.data;
                setTokens(access_token, null); // Không có refresh token trong response
                setUserInfo(user);

                // Lưu vào localStorage
                localStorage.setItem('access_token', access_token);
                localStorage.setItem('user_info', JSON.stringify(user));

                // Chuyển hướng về trang chủ
                navigate('/');
            } else {
                setError(response.message || 'Đăng nhập thất bại');
            }
        } catch (err) {
            console.error('Login error:', err);

            // Handle specific error codes
            if (err.response?.status === 401) {
                setError('Phiên đăng nhập Zalo đã hết hạn. Vui lòng thử lại.');
            } else if (err.response?.status === 403) {
                setError('Không có quyền truy cập thông tin Zalo.');
            } else if (err.response?.status === 408) {
                setError('Kết nối đến Zalo servers quá lâu. Vui lòng thử lại.');
            } else {
                setError('Không thể đăng nhập. Vui lòng thử lại.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <Page className="page">
            <Box
                flex
                flexDirection="column"
                justifyContent="center"
                alignItems="center"
                className="h-screen bg-gradient-to-br from-blue-500 to-purple-600"
            >
                <Box
                    className="bg-white rounded-lg shadow-lg p-8 max-w-sm w-full mx-4"
                    flex
                    flexDirection="column"
                    alignItems="center"
                >
                    {/* Logo */}
                    <Box className="mb-6">
                        <Icon icon="zi-home" className="text-6xl text-blue-500" />
                    </Box>

                    {/* Title */}
                    <Text className="text-2xl font-bold text-gray-800 mb-2 text-center">
                        Chào mừng đến với
                    </Text>
                    <Text className="text-xl font-semibold text-blue-600 mb-6 text-center">
                        IMS - Hệ thống Quản lý
                    </Text>

                    {/* Description */}
                    <Text className="text-gray-600 text-center mb-8 px-4">
                        Đăng nhập bằng tài khoản Zalo để tiếp tục sử dụng ứng dụng
                    </Text>

                    {/* Error Message */}
                    {error && (
                        <Box className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4 w-full">
                            <Text className="text-red-600 text-sm text-center">
                                {error}
                            </Text>
                        </Box>
                    )}

                    {/* Login Button */}
                    <Button
                        onClick={handleZaloLogin}
                        disabled={loading}
                        className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
                    >
                        {loading ? (
                            <>
                                <Spinner />
                                <Text>Đang đăng nhập...</Text>
                            </>
                        ) : (
                            <>
                                <Icon icon="zi-user" />
                                <Text>Đăng nhập bằng Zalo</Text>
                            </>
                        )}
                    </Button>

                    {/* Footer */}
                    <Box className="mt-6 text-center">
                        <Text className="text-xs text-gray-500">
                            © 2024 IMS System. All rights reserved.
                        </Text>
                    </Box>
                </Box>
            </Box>
        </Page>
    );
};

export default Login;