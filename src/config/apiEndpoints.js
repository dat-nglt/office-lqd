/**
 * API Endpoints Configuration
 * Centralized API endpoint definitions
 */

const API_ENDPOINTS = {
  // ============================================
  // Authentication Endpoints
  // ============================================
  AUTH: {
    LOGIN: "/auth/login",
    ZALO_LOGIN: "/auth/zalo-login",
    LOGOUT: "/auth/logout",
    REFRESH_TOKEN: "/auth/refresh-token",
    VERIFY_TOKEN: "/auth/validate-session",
  },

  // ============================================
  // User Endpoints
  // ============================================
  USERS: {
    GET_PROFILE: "/users/profile",
    UPDATE_PROFILE: "/users/profile",
    GET_USER_BY_ID: (id) => `/users/${id}`,
    GET_ATTENDANCE: "/users/attendance",
    GET_ATTENDANCE_HISTORY: "/users/attendance/history",
  },

  // ============================================
  // Work Report Endpoints
  // ============================================
  WORK_REPORTS: {
    CREATE: "/work-reports",
    GET_ALL: "/work-reports",
    GET_BY_ID: (id) => `/work-reports/${id}`,
    UPDATE: (id) => `/work-reports/${id}`,
    DELETE: (id) => `/work-reports/${id}`,
    GET_BY_DATE: (date) => `/work-reports/date/${date}`,
    GET_BY_STATUS: (status) => `/work-reports/status/${status}`,
  },

  // ============================================
  // Work Management Endpoints
  // ============================================
  WORK_MANAGEMENT: {
    GET_TASKS: "/work-management/tasks",
    GET_TASK_BY_ID: (id) => `/work-management/tasks/${id}`,
    RESCHEDULE_TASK: (id) => `/work-management/tasks/${id}/reschedule`,
    CANCEL_TASK: (id) => `/work-management/tasks/${id}/cancel`,
    REQUEST_OVERTIME: "/overtime-requests",
    GET_ALL_TECHNICIANS: "/works/technicians-list-to-assign",
  },

  // ============================================
  // Check-in Endpoints
  // ============================================
  ATTENDANCE: {
    SUBMIT_CHECKIN: "/attendance/check-in",
    SUBMIT_CHECKOUT: "/attendance/check-out",
    GET_HISTORY: "/attendance/check-in/history",
    GET_TODAY_HISTORY: "/attendance/user/today",
    GET_MONTH_HISTORY: "/attendance/user/month",
  },

  // ============================================
  // Upload Endpoints
  // ============================================
  UPLOADS: {
    CLOUDINARY_SIGN: "/uploads/cloudinary/sign",
  },

  // ============================================
  // Notification Endpoints
  // ============================================
  NOTIFICATIONS: {
    GET_ALL: "/notifications",
    GET_UNREAD: "/notifications/unread",
    MARK_AS_READ: (id) => `/notifications/${id}/read`,
    MARK_ALL_AS_READ: "/notifications/read-all",
    DELETE: (id) => `/notifications/${id}`,
  },

  // ============================================
  // Location/Geocoding Endpoints
  // ============================================
  LOCATION: {
    GET_CHECKIN_LOCATIONS: "/locations/checkin",
    VERIFY_LOCATION: "/locations/verify",
  },

  // ============================================
  // Project Endpoints
  // ============================================
  PROJECTS: {
    GET_ALL: "/projects",
    GET_BY_ID: (id) => `/projects/${id}`,
    GET_ACTIVE: "/projects/active",
  },
};

export default API_ENDPOINTS;
