import axiosInstance from "../config/axiosConfig";
import API_ENDPOINTS from "../config/apiEndpoints";

/**
 * Project Service
 * Provides methods for project API calls
 */

export const getAll = async (params) => {
    try {
        const response = await axiosInstance.get(API_ENDPOINTS.PROJECTS.GET_ALL, { params });
        return response.data;
    } catch (error) {
        throw error.response?.data || error;
    }
};

export const getById = async (id) => {
    try {
        const response = await axiosInstance.get(API_ENDPOINTS.PROJECTS.GET_BY_ID(id));
        return response.data;
    } catch (error) {
        throw error.response?.data || error;
    }
};

export const getActive = async () => {
    try {
        const response = await axiosInstance.get(API_ENDPOINTS.PROJECTS.GET_ACTIVE);
        return response.data;
    } catch (error) {
        throw error.response?.data || error;
    }
};