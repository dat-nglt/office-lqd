import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "zmp-ui";
import { clearTokens, getTokens, getUserInfoInStorage } from "../config/axiosConfig";
import { Spinner } from "zmp-ui";

/**
 * Route Guard Component để bảo vệ các routes cần authentication
 *
 * Kiểm tra:
 * 1. Token tồn tại
 * 2. Token còn hạn sử dụng
 * 3. User info được lưu
 *
 * @param {Object} props
 * @param {React.Component} props.children - Component cần bảo vệ
 * @param {string} props.redirectTo - Path để redirect nếu chưa login (default: '/login')
 * @param {boolean} props.requireAuth - Có yêu cầu authentication không (default: true)
 */

/**
 * Kiểm tra token có hết hạn hay không
 * @param {string} token - JWT token
 * @returns {boolean} - true nếu token còn hạn
 */
const isTokenValid = (token) => {
  if (!token) return false;

  try {
    // Decode JWT payload
    const parts = token.split(".");
    if (parts.length !== 3) return false;

    const payload = JSON.parse(atob(parts[1]));

    // Kiểm tra expiry time (exp là seconds từ epoch)
    const now = Math.floor(Date.now() / 1000);
    const isExpired = payload.exp && payload.exp < now;

    return !isExpired;
  } catch (error) {
    console.error("Token validation error:", error);
    return false;
  }
};

const RouteGuard = ({ children, redirectTo = "/login", requireAuth = true }) => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Memoize token validation logic
  const validateAuth = useCallback(async () => {
    try {
      if (!requireAuth) {
        setIsAuthenticated(true);
        setIsLoading(false);
        return;
      }

      // Lấy tokens từ storage
      const tokens = getTokens();
      const userInfo = getUserInfoInStorage();

      // Kiểm tra token tồn tại
      if (!tokens?.accessToken || !isTokenValid(tokens.accessToken)) {
        clearTokens();
        navigate(redirectTo, { replace: true });
        setIsLoading(false);
        return;
      }

      // Kiểm tra user info được lưu
      if (!userInfo || !userInfo.id) {
        clearTokens();
        navigate(redirectTo, { replace: true });
        setIsLoading(false);
        return;
      }

      // Token và user info hợp lệ
      setIsAuthenticated(true);
    } catch (error) {
      console.error("[RouteGuard] Auth validation error:", error);
      navigate(redirectTo, { replace: true });
    } finally {
      setIsLoading(false);
    }
  }, [navigate, redirectTo, requireAuth]);

  useEffect(() => {
    validateAuth();
  }, [validateAuth]);

  // Hiển thị loading khi đang kiểm tra authentication
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <div className="text-center">
          <Spinner logo="https://res.cloudinary.com/djiwsnmtq/image/upload/v1768034655/lqd_l8z0wh.jpg" />
          <p className="mt-4 text-gray-600 text-sm">Đang kiểm tra quyền truy cập...</p>
        </div>
      </div>
    );
  }

  // Chỉ render children nếu đã authenticated (hoặc không yêu cầu auth)
  if (!isAuthenticated && requireAuth) {
    return null;
  }

  return children;
};

export default RouteGuard;
