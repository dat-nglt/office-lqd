import axiosInstance from "../config/axiosConfig";
import API_ENDPOINTS from "../config/apiEndpoints";

/**
 * Check-in Service
 * Provides methods for check-in API calls
 */

export const submit = async (data) => {
    try {
        const response = await axiosInstance.post(API_ENDPOINTS.CHECKIN.SUBMIT, data);
        return response.data;
    } catch (error) {
        throw error.response?.data || error;
    }
};

export const getHistory = async (params) => {
    try {
        const response = await axiosInstance.get(API_ENDPOINTS.CHECKIN.GET_HISTORY, { params });
        return response.data;
    } catch (error) {
        throw error.response?.data || error;
    }
};

export const getToday = async () => {
    try {
        const response = await axiosInstance.get(API_ENDPOINTS.CHECKIN.GET_TODAY);
        return response.data;
    } catch (error) {
        throw error.response?.data || error;
    }
};