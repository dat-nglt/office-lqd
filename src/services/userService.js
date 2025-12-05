import axiosInstance from "../config/axiosConfig";
import API_ENDPOINTS from "../config/apiEndpoints";

/**
 * User Service
 * Provides methods for user-related API calls
 */

export const getProfile = async () => {
    try {
        const response = await axiosInstance.get(API_ENDPOINTS.USERS.GET_PROFILE);
        return response.data;
    } catch (error) {
        throw error.response?.data || error;
    }
};

export const updateProfile = async (data) => {
    try {
        const response = await axiosInstance.put(API_ENDPOINTS.USERS.UPDATE_PROFILE, data);
        return response.data;
    } catch (error) {
        throw error.response?.data || error;
    }
};

export const getUserById = async (id) => {
    try {
        const response = await axiosInstance.get(API_ENDPOINTS.USERS.GET_USER_BY_ID(id));
        return response.data;
    } catch (error) {
        throw error.response?.data || error;
    }
};

export const getAttendance = async () => {
    try {
        const response = await axiosInstance.get(API_ENDPOINTS.USERS.GET_ATTENDANCE);
        return response.data;
    } catch (error) {
        throw error.response?.data || error;
    }
};

export const getAttendanceHistory = async (params) => {
    try {
        const response = await axiosInstance.get(API_ENDPOINTS.USERS.GET_ATTENDANCE_HISTORY, {
            params,
        });
        return response.data;
    } catch (error) {
        throw error.response?.data || error;
    }
};