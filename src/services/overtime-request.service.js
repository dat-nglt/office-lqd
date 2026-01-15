import axiosInstance from "../config/axiosConfig";
import API_ENDPOINTS from "../config/apiEndpoints";

/**
 * Overtime Request Service
 * Provides methods for overtime request API calls
 */

export const submitOvertimeRequest = async (data) => {
    try {
        const response = await axiosInstance.post("/overtime-requests", data);
        return response.data;
    } catch (error) {
        throw error.response?.data || error;
    }
};

export const getOvertimeRequestHistory = async (params) => {
    try {
        const response = await axiosInstance.get("/overtime-requests", { params });
        return response.data;
    } catch (error) {
        throw error.response?.data || error;
    }
};

export const getOvertimeRequestById = async (id) => {
    try {
        const response = await axiosInstance.get(`/overtime-requests/${id}`);
        return response.data;
    } catch (error) {
        throw error.response?.data || error;
    }
};

export const updateOvertimeRequest = async (id, data) => {
    try {
        const response = await axiosInstance.put(`/overtime-requests/${id}`, data);
        return response.data;
    } catch (error) {
        throw error.response?.data || error;
    }
};

export const cancelOvertimeRequest = async (id) => {
    try {
        const response = await axiosInstance.patch(`/overtime-requests/${id}/cancel`, {});
        return response.data;
    } catch (error) {
        throw error.response?.data || error;
    }
};
