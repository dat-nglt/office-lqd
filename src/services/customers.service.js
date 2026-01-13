import axiosInstance from "../config/axiosConfig";
import API_ENDPOINTS from "../config/apiEndpoints";

export const getAllCustomersService = async () => {
  try {
    const response = await axiosInstance.get(API_ENDPOINTS.CUSTOMERS.GET_ALL_CUSTOMERS);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};
