import axiosInstance from "../config/axiosConfig";

export const miniAppGetProfileInfoByID = async (UID) => {
  try {
    const response = await axiosInstance.get(`/mini-app/profile/${UID}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};
