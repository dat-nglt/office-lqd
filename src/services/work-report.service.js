import axiosInstance from "../config/axiosConfig";
import API_ENDPOINTS from "../config/apiEndpoints";

/**
 * Work Report Service
 * Provides methods for work report API calls
 */

export const create = async (data) => {
    try {
        const response = await axiosInstance.post(API_ENDPOINTS.WORK_REPORTS.CREATE, data);
        return response.data;
    } catch (error) {
        throw error.response?.data || error;
    }
};

export const getAll = async (params) => {
    try {
        const response = await axiosInstance.get(API_ENDPOINTS.WORK_REPORTS.GET_ALL, { params });
        return response.data;
    } catch (error) {
        throw error.response?.data || error;
    }
};

export const getById = async (id) => {
    try {
        const response = await axiosInstance.get(API_ENDPOINTS.WORK_REPORTS.GET_BY_ID(id));
        return response.data;
    } catch (error) {
        throw error.response?.data || error;
    }
};

export const update = async (id, data) => {
    try {
        const response = await axiosInstance.put(API_ENDPOINTS.WORK_REPORTS.UPDATE(id), data);
        return response.data;
    } catch (error) {
        throw error.response?.data || error;
    }
};

export const deleteReport = async (id) => {
    try {
        const response = await axiosInstance.delete(API_ENDPOINTS.WORK_REPORTS.DELETE(id));
        return response.data;
    } catch (error) {
        throw error.response?.data || error;
    }
};

export const getByDate = async (date) => {
    try {
        const response = await axiosInstance.get(API_ENDPOINTS.WORK_REPORTS.GET_BY_DATE(date));
        return response.data;
    } catch (error) {
        throw error.response?.data || error;
    }
};

export const getByStatus = async (status) => {
    try {
        const response = await axiosInstance.get(API_ENDPOINTS.WORK_REPORTS.GET_BY_STATUS(status));
        return response.data;
    } catch (error) {
        throw error.response?.data || error;
    }
};