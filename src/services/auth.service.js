import axiosInstance from "../config/axiosConfig";
import API_ENDPOINTS from "../config/apiEndpoints";

/**
 * Authentication Service
 * Provides methods for authentication API calls
 */

export const login = async (phone, password, rememberMe = false) => {
  try {
    const response = await axiosInstance.post(API_ENDPOINTS.AUTH.LOGIN, {
      phone,
      password,
      remember_me: rememberMe,
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const zaloLogin = async (accessToken) => {
  try {
    const response = await axiosInstance.post(API_ENDPOINTS.AUTH.ZALO_LOGIN, {
      access_token: accessToken,
    });

    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};


export const linkZalo = async (zaloId) => {
  try {
    const response = await axiosInstance.post(API_ENDPOINTS.AUTH.LINK_ZALO, {
      zalo_id: zaloId,
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const getCompanyInfo = async () => {
  try {
    const response = await axiosInstance.get(API_ENDPOINTS.AUTH.GET_COMPANY_INFO);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const logout = async (refreshToken) => {
  try {
    const response = await axiosInstance.post(API_ENDPOINTS.AUTH.LOGOUT, {
      refresh_token: refreshToken,
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const refreshToken = async (refreshToken) => {
  try {
    const response = await axiosInstance.post(API_ENDPOINTS.AUTH.REFRESH_TOKEN, {
      refresh_token: refreshToken,
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const verifyToken = async () => {
  try {
    const response = await axiosInstance.get(API_ENDPOINTS.AUTH.VERIFY_TOKEN);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};
