import axiosInstance from "../config/axiosConfig";
import API_ENDPOINTS from "../config/apiEndpoints";

/**
 * Notification Service
 * Provides methods for notification API calls
 */

export const getAll = async (params) => {
  try {
    const response = await axiosInstance.get(API_ENDPOINTS.NOTIFICATIONS.GET_ALL, { params });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const getUnread = async () => {
  try {
    const response = await axiosInstance.get(API_ENDPOINTS.NOTIFICATIONS.GET_UNREAD);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const markAsRead = async (id) => {
  try {
    const response = await axiosInstance.put(API_ENDPOINTS.NOTIFICATIONS.MARK_AS_READ(id));
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const markAllAsRead = async () => {
  try {
    const response = await axiosInstance.put(API_ENDPOINTS.NOTIFICATIONS.MARK_ALL_AS_READ);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const deleteNotification = async (id) => {
  try {
    const response = await axiosInstance.delete(API_ENDPOINTS.NOTIFICATIONS.DELETE(id));
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};
