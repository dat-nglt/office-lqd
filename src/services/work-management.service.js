import axiosInstance from "../config/axiosConfig";
import API_ENDPOINTS from "../config/apiEndpoints";

/**
 * Work Management Service
 * Provides methods for work management API calls
 */

export const getTasks = async (params) => {
  try {
    const response = await axiosInstance.get(API_ENDPOINTS.WORK_MANAGEMENT.GET_TASKS, { params });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const getWorkByID = async (id) => {
  try {
    const response = await axiosInstance.get(API_ENDPOINTS.WORK_MANAGEMENT.GET_WORK_BY_ID(id));
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const rescheduleTask = async (id, data) => {
  try {
    const response = await axiosInstance.put(API_ENDPOINTS.WORK_MANAGEMENT.RESCHEDULE_TASK(id), data);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const cancelTask = async (id, data) => {
  try {
    const response = await axiosInstance.put(API_ENDPOINTS.WORK_MANAGEMENT.CANCEL_TASK(id), data);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const requestOvertimeService = async (overtimeData) => {
  try {
    const response = await axiosInstance.post(API_ENDPOINTS.WORK_MANAGEMENT.REQUEST_OVERTIME, overtimeData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const getAllTechniciansService = async () => {
  try {
    const response = await axiosInstance.get(API_ENDPOINTS.WORK_MANAGEMENT.GET_ALL_TECHNICIANS);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const getAllWorkCategoriesService = async () => {
  try {
    const response = await axiosInstance.get(API_ENDPOINTS.WORK_MANAGEMENT.GET_ALL_WORK_CATEGORIES);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const getAllWorkGroupByUserIdService = async (userId) => {
  try {
    console.log("Fetching works for userId:", userId);
    const response = await axiosInstance.get(API_ENDPOINTS.WORK_MANAGEMENT.GET_ALL_WORKS_GROUP_BY_USER_ID(userId));
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const creatNewWorkService = async (workData) => {
  try {
    const response = await axiosInstance.post(API_ENDPOINTS.WORK_MANAGEMENT.CREATE_NEW_WORK, workData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};
