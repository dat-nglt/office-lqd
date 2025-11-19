import axios from "axios";

/**
 * Axios Configuration for Zalo Mini App
 * Handles authentication, token refresh, and API requests
 */

// ============================================
// 1. Token Management Functions
// ============================================

/**
 * Get stored tokens from localStorage
 * @returns {Object} - { accessToken, refreshToken }
 */
const getTokens = () => {
    try {
        const tokensStr = localStorage.getItem("authTokens");
        return tokensStr ? JSON.parse(tokensStr) : {};
    } catch (error) {
        console.error("Error getting tokens:", error);
        return {};
    }
};

/**
 * Save tokens to localStorage
 * @param {Object} tokens - { accessToken, refreshToken }
 */
const setTokens = (tokens) => {
    try {
        localStorage.setItem("authTokens", JSON.stringify(tokens));
    } catch (error) {
        console.error("Error setting tokens:", error);
    }
};

/**
 * Clear stored tokens
 */
const clearTokens = () => {
    try {
        localStorage.removeItem("authTokens");
    } catch (error) {
        console.error("Error clearing tokens:", error);
    }
};

/**
 * Get user info from localStorage
 * @returns {Object} - User information
 */
const getUserInfo = () => {
    try {
        const userStr = localStorage.getItem("userInfo");
        return userStr ? JSON.parse(userStr) : null;
    } catch (error) {
        console.error("Error getting user info:", error);
        return null;
    }
};

/**
 * Save user info to localStorage
 * @param {Object} userInfo - User information
 */
const setUserInfo = (userInfo) => {
    try {
        localStorage.setItem("userInfo", JSON.stringify(userInfo));
    } catch (error) {
        console.error("Error setting user info:", error);
    }
};

// ============================================
// 2. Axios Instance Creation
// ============================================

const axiosInstance = axios.create({
    baseURL: import.meta.env.VITE_API_URL || "https://lamquangdai.vn/api",
    timeout: 30000,
    headers: {
        "Content-Type": "application/json",
    },
});

// ============================================
// 3. Request Interceptor
// ============================================

axiosInstance.interceptors.request.use(
    (config) => {
        const { accessToken } = getTokens();

        if (accessToken) {
            config.headers.Authorization = `Bearer ${accessToken}`;
        }

        return config;
    },
    (error) => {
        console.error("Request interceptor error:", error);
        return Promise.reject(error);
    }
);

// ============================================
// 4. Response Interceptor with Token Refresh
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
        // Handle 401 (Unauthorized) - Token Expired
        // ============================================
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            if (isRefreshing) {
                // If already refreshing, queue this request
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
                const { refreshToken } = getTokens();

                if (!refreshToken) {
                    // No refresh token available
                    throw new Error("No refresh token available");
                }

                // Call refresh token endpoint
                const response = await axios.post(
                    `${import.meta.env.VITE_API_URL || "https://lamquangdai.vn/api"}/auth/refresh-token`,
                    { refreshToken },
                    {
                        headers: {
                            "Content-Type": "application/json",
                        },
                    }
                );

                const { accessToken: newAccessToken, refreshToken: newRefreshToken } = response.data;

                // Save new tokens
                setTokens({
                    accessToken: newAccessToken,
                    refreshToken: newRefreshToken,
                });

                // Update default headers
                axiosInstance.defaults.headers.common.Authorization = `Bearer ${newAccessToken}`;
                originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

                isRefreshing = false;
                processQueue(null, newAccessToken);

                return axiosInstance(originalRequest);
            } catch (refreshError) {
                isRefreshing = false;
                processQueue(refreshError);

                // Clear tokens and redirect to login
                clearTokens();
                window.location.href = "/";

                return Promise.reject(new Error("Session expired. Please login again."));
            }
        }

        // ============================================
        // Handle 403 (Forbidden) - Access Denied
        // ============================================
        if (error.response?.status === 403) {
            console.error("Access denied (403)");
            // Could redirect to an error page or show a message
        }

        // ============================================
        // Handle 404 (Not Found)
        // ============================================
        if (error.response?.status === 404) {
            console.error("Resource not found (404)");
        }

        // ============================================
        // Handle 500 (Server Error)
        // ============================================
        if (error.response?.status >= 500) {
            console.error("Server error:", error.response.status);
        }

        return Promise.reject(error);
    }
);

// ============================================
// 5. Export Functions and Instance
// ============================================

export {
    axiosInstance,
    getTokens,
    setTokens,
    clearTokens,
    getUserInfo,
    setUserInfo,
};

export default axiosInstance;
