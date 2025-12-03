import axiosInstance, { getTokens, setTokens, setUserInfo } from "../config/axiosConfig";
import API_ENDPOINTS from "../config/apiEndpoints";

/**
 * API Service
 * Provides methods for all API calls
 */

// ============================================
// Authentication Service
// ============================================

export const authService = {
    login: (credentials) => axiosInstance.post(API_ENDPOINTS.AUTH.LOGIN, credentials),

    zaloLogin: (accessToken) => axiosInstance.post(API_ENDPOINTS.AUTH.ZALO_LOGIN, { access_token: accessToken }),

    logout: () => axiosInstance.post(API_ENDPOINTS.AUTH.LOGOUT),

    refreshToken: (refreshToken) => axiosInstance.post(API_ENDPOINTS.AUTH.REFRESH_TOKEN, { refreshToken }),

    verifyToken: () => axiosInstance.get(API_ENDPOINTS.AUTH.VERIFY_TOKEN),
};

// ============================================
// User Service
// ============================================

export const userService = {
    getProfile: () => axiosInstance.get(API_ENDPOINTS.USERS.GET_PROFILE),

    updateProfile: (data) => axiosInstance.put(API_ENDPOINTS.USERS.UPDATE_PROFILE, data),

    getUserById: (id) => axiosInstance.get(API_ENDPOINTS.USERS.GET_USER_BY_ID(id)),

    getAttendance: () => axiosInstance.get(API_ENDPOINTS.USERS.GET_ATTENDANCE),

    getAttendanceHistory: (params) => axiosInstance.get(API_ENDPOINTS.USERS.GET_ATTENDANCE_HISTORY, { params }),
};

// ============================================
// Work Report Service
// ============================================

export const workReportService = {
    create: (data) => axiosInstance.post(API_ENDPOINTS.WORK_REPORTS.CREATE, data),

    getAll: (params) => axiosInstance.get(API_ENDPOINTS.WORK_REPORTS.GET_ALL, { params }),

    getById: (id) => axiosInstance.get(API_ENDPOINTS.WORK_REPORTS.GET_BY_ID(id)),

    update: (id, data) => axiosInstance.put(API_ENDPOINTS.WORK_REPORTS.UPDATE(id), data),

    delete: (id) => axiosInstance.delete(API_ENDPOINTS.WORK_REPORTS.DELETE(id)),

    getByDate: (date) => axiosInstance.get(API_ENDPOINTS.WORK_REPORTS.GET_BY_DATE(date)),

    getByStatus: (status) => axiosInstance.get(API_ENDPOINTS.WORK_REPORTS.GET_BY_STATUS(status)),
};

// ============================================
// Work Management Service
// ============================================

export const workManagementService = {
    getTasks: (params) => axiosInstance.get(API_ENDPOINTS.WORK_MANAGEMENT.GET_TASKS, { params }),

    getTaskById: (id) => axiosInstance.get(API_ENDPOINTS.WORK_MANAGEMENT.GET_TASK_BY_ID(id)),

    rescheduleTask: (id, data) => axiosInstance.put(API_ENDPOINTS.WORK_MANAGEMENT.RESCHEDULE_TASK(id), data),

    cancelTask: (id, data) => axiosInstance.put(API_ENDPOINTS.WORK_MANAGEMENT.CANCEL_TASK(id), data),
};

// ============================================
// Check-in Service
// ============================================

export const checkinService = {
    submit: (data) => axiosInstance.post(API_ENDPOINTS.CHECKIN.SUBMIT, data),

    getHistory: (params) => axiosInstance.get(API_ENDPOINTS.CHECKIN.GET_HISTORY, { params }),

    getToday: () => axiosInstance.get(API_ENDPOINTS.CHECKIN.GET_TODAY),
};

// ============================================
// Notification Service
// ============================================

export const notificationService = {
    getAll: (params) => axiosInstance.get(API_ENDPOINTS.NOTIFICATIONS.GET_ALL, { params }),

    getUnread: () => axiosInstance.get(API_ENDPOINTS.NOTIFICATIONS.GET_UNREAD),

    markAsRead: (id) => axiosInstance.put(API_ENDPOINTS.NOTIFICATIONS.MARK_AS_READ(id)),

    markAllAsRead: () => axiosInstance.put(API_ENDPOINTS.NOTIFICATIONS.MARK_ALL_AS_READ),

    delete: (id) => axiosInstance.delete(API_ENDPOINTS.NOTIFICATIONS.DELETE(id)),
};

// ============================================
// Location Service
// ============================================

export const locationService = {
    getCheckinLocations: () => axiosInstance.get(API_ENDPOINTS.LOCATION.GET_CHECKIN_LOCATIONS),

    verifyLocation: (data) => axiosInstance.post(API_ENDPOINTS.LOCATION.VERIFY_LOCATION, data),
};

// ============================================
// Project Service
// ============================================

export const projectService = {
    getAll: (params) => axiosInstance.get(API_ENDPOINTS.PROJECTS.GET_ALL, { params }),

    getById: (id) => axiosInstance.get(API_ENDPOINTS.PROJECTS.GET_BY_ID(id)),

    getActive: () => axiosInstance.get(API_ENDPOINTS.PROJECTS.GET_ACTIVE),
};

export default {
    authService,
    userService,
    workReportService,
    workManagementService,
    checkinService,
    notificationService,
    locationService,
    projectService,
};
