import { useEffect, useState } from "react";
import { useNavigate } from "zmp-ui";
import { getTokens } from "../config/axiosConfig";
import { Spinner } from "zmp-ui";

/**
 * Route Guard Component để bảo vệ các routes cần authentication
 * @param {Object} props
 * @param {React.Component} props.children - Component cần bảo vệ
 * @param {string} props.redirectTo - Path để redirect nếu chưa login (default: '/login')
 * @param {boolean} props.requireAuth - Có yêu cầu authentication không (default: true)
 */
const RouteGuard = ({
    children,
    redirectTo = "/login",
    requireAuth = true,
}) => {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const tokens = getTokens();

                if (requireAuth) {
                    // Kiểm tra có token không
                    if (tokens && tokens.accessToken) {
                        // Có thể thêm validation token ở đây nếu cần
                        setIsAuthenticated(true);
                    } else {
                        // Chưa login, redirect đến login page
                        navigate(redirectTo, { replace: true });
                        return;
                    }
                } else {
                    // Route không yêu cầu auth, cho phép access
                    setIsAuthenticated(true);
                }
            } catch (error) {
                console.error("Auth check error:", error);
                if (requireAuth) {
                    navigate(redirectTo, { replace: true });
                } else {
                    setIsAuthenticated(true);
                }
            } finally {
                setIsLoading(false);
            }
        };

        checkAuth();
    }, [navigate, redirectTo, requireAuth]);

    // Hiển thị loading khi đang kiểm tra authentication
    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Spinner />
            </div>
        );
    }

    // Chỉ render children nếu đã authenticated (hoặc không yêu cầu auth)
    return isAuthenticated ? children : null;
};

export default RouteGuard;
