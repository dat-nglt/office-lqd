import axios from "axios";
import { nativeStorage } from "zmp-sdk/apis";

const STORAGE_KEYS = {
  AUTH_TOKENS: "authTokens",
  USER_INFO: "user_info",
  ACCESS_TOKEN: "access_token", // Legacy compatibility
};

const getTokens = () => {
  try {
    // Try new format first
    const tokensStr = nativeStorage.getItem(STORAGE_KEYS.AUTH_TOKENS);
    if (tokensStr) {
      return JSON.parse(tokensStr);
    }
    console.log("tokensStr:", tokensStr);

    // Fallback to legacy format for backward compatibility
    const legacyToken = nativeStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
    if (legacyToken) {
      return {
        accessToken: legacyToken,
        refreshToken: null,
      };
    }

    return null;
  } catch (error) {
    console.error("[Storage] Error getting tokens:", error);
    return {};
  }
};

/**
 * Save tokens to nativeStorage
 * @param {string} accessToken - JWT access token
 * @param {string|null} refreshToken - Optional refresh token
 */
const setTokens = (accessToken, refreshToken = null) => {
  try {
    if (!accessToken) {
      console.warn("[Storage] Attempting to set empty access token");
      return;
    }

    const tokens = {
      accessToken,
      refreshToken,
    };

    nativeStorage.setItem(STORAGE_KEYS.AUTH_TOKENS, JSON.stringify(tokens));

    // Keep legacy key for backward compatibility
    nativeStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, accessToken);

    console.log("[Storage] Tokens saved successfully");
  } catch (error) {
    console.error("[Storage] Error setting tokens:", error);
  }
};

/**
 * Clear all stored tokens
 */
const clearTokens = () => {
  try {
    nativeStorage.removeItem(STORAGE_KEYS.AUTH_TOKENS);
    nativeStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
    nativeStorage.removeItem(STORAGE_KEYS.USER_INFO);

    // Also clear from localStorage for safety
    try {
      localStorage.removeItem("authTokens");
      localStorage.removeItem("access_token");
      localStorage.removeItem("userInfo");
    } catch (e) {}
    console.log("[Storage] All tokens cleared");
  } catch (error) {
    console.error("[Storage] Error clearing tokens:", error);
  }
};

/**
 * Get user info from nativeStorage
 * @returns {Object|null} - User information or null
 */
const getUserInfo = () => {
  try {
    const userStr = nativeStorage.getItem(STORAGE_KEYS.USER_INFO);
    return userStr ? JSON.parse(userStr) : null;
  } catch (error) {
    console.error("[Storage] Error getting user info:", error);
    return null;
  }
};

/**
 * Save user info to nativeStorage
 * @param {Object} userInfo - User information object
 */
const setUserInfo = (userInfo) => {
  try {
    if (!userInfo || !userInfo.id) {
      toast?.error({
        title: "Lỗi lưu thông tin người dùng",
        message: "Dữ liệu người dùng không hợp lệ",
        duration: 3000,
      });
      return;
    }

    nativeStorage.setItem(STORAGE_KEYS.USER_INFO, JSON.stringify(userInfo));
    console.log("[Storage] User info saved successfully");
  } catch (error) {
    console.error("[Storage] Error setting user info:", error);
  }
};

// ============================================
// 3. Axios Instance Creation
// ============================================

const axiosInstance = axios.create({
  baseURL: "https://lamquangdai.vn/api/v1/ims",
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
});

// ============================================
// 4. Request Interceptor - Add Auth Header
// ============================================

axiosInstance.interceptors.request.use(
  (config) => {
    const { accessToken } = getTokens() || {};

    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    } else {
      console.warn("[RequestInterceptor] No access token found");
    }

    return config;
  },
  (error) => {
    console.error("[RequestInterceptor] Error:", error);
    return Promise.reject(error);
  }
);

// ============================================
// 5. Response Interceptor - Token Refresh & Error Handling
// ============================================

let isRefreshing = false;
let failedQueue = [];

/**
 * Process queued requests after token refresh
 * @param {Error} error - Error object if refresh failed
 * @param {string} token - New access token if refresh succeeded
 */
const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // ============================================
    // Handle 401 (Unauthorized) - Token Expired/Invalid
    // ============================================
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      if (isRefreshing) {
        // Queue request while refreshing token
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return axiosInstance(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      isRefreshing = true;

      try {
        const { refreshToken } = getTokens() || {};

        if (!refreshToken) {
          console.warn("[401Handler] No refresh token available");
          throw new Error("No refresh token available");
        }

        // Call refresh token endpoint using same baseURL as main instance
        const baseURL =
          import.meta.env.VITE_IMS_API_URL || import.meta.env.IMS_API_URL || "https://lamquangdai.vn/api/v1";

        const response = await axios.post(
          `${baseURL}/auth/refresh-token`,
          { refresh_token: refreshToken },
          {
            headers: {
              "Content-Type": "application/json",
            },
            timeout: 10000,
          }
        );

        const newAccessToken = response.data?.data?.access_token;
        const newRefreshToken = response.data?.data?.refresh_token;

        if (!newAccessToken) {
          throw new Error("No access token in refresh response");
        }

        // Save new tokens
        setTokens(newAccessToken, newRefreshToken || null);

        // Update default headers
        axiosInstance.defaults.headers.common.Authorization = `Bearer ${newAccessToken}`;
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

        isRefreshing = false;
        processQueue(null, newAccessToken);

        return axiosInstance(originalRequest);
      } catch (refreshError) {
        isRefreshing = false;
        processQueue(refreshError);

        console.error("[401Handler] Token refresh failed:", refreshError.message);

        // Clear tokens and redirect to login
        clearTokens();
        window.location.href = "/login";

        return Promise.reject(new Error("Session expired. Please login again."));
      }
    }

    // ============================================
    // Handle 403 (Forbidden) - Access Denied
    // ============================================
    if (error.response?.status === 403) {
      console.error("[403Handler] Access denied");
      return Promise.reject(error);
    }

    // ============================================
    // Handle 404 (Not Found)
    // ============================================
    if (error.response?.status === 404) {
      console.warn("[404Handler] Resource not found");
      return Promise.reject(error);
    }

    // ============================================
    // Handle 500+ (Server Error)
    // ============================================
    if (error.response?.status >= 500) {
      console.error("[5xxHandler] Server error:", error.response.status);
      return Promise.reject(error);
    }

    // ============================================
    // Handle Network/Timeout Errors
    // ============================================
    if (error.code === "ECONNABORTED") {
      console.error("[TimeoutHandler] Request timeout");
      return Promise.reject(new Error("Request timeout. Please try again."));
    }

    if (!error.response) {
      console.error("[NetworkHandler] Network error:", error.message);
      return Promise.reject(new Error("Network error. Please check your connection."));
    }

    return Promise.reject(error);
  }
);

// ============================================
// 6. Export Functions and Instance
// ============================================

export { axiosInstance, getTokens, setTokens, clearTokens, getUserInfo, setUserInfo };

export default axiosInstance;
