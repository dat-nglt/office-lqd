import axiosInstance from "../config/axiosConfig";

export const miniAppGetProfileInfoByID = async (ZAID) => {
  try {
    const response = await axiosInstance.get(`/mini-app/profile/${ZAID}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const miniAppGetListOfWorkAssignmentsInCurrentDayByZAID = async (ZAID) => {
  try {
    const response = await axiosInstance.get(`/mini-app/profile/list-of-work-assignments-current-day/${ZAID}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const miniAppGetListOfWorkAssignmentsByID = async (ZAID) => {
  try {
    const response = await axiosInstance.get(`/mini-app/profile/list-of-work-assignments/${ZAID}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const miniAppGetLocationByUserToken = async (locationToken, accessToken) => {
  try {
    const response = await axiosInstance.post(`/mini-app/profile/location/decode`, { locationToken, accessToken });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const miniAppGetAttendanceLocation = async () => {
  try {
    const response = await axiosInstance.get(`/mini-app/profile/attendance/location`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const miniAppGetAttendanceType = async () => {
  try {
    const response = await axiosInstance.get(`/mini-app/profile/attendance/type`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};
