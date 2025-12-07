import axiosInstance from "../config/axiosConfig";
import API_ENDPOINTS from "../config/apiEndpoints";

/**
 * Location Service
 * Provides methods for location/geocoding API calls
 */

export const getCheckinLocations = async () => {
    try {
        const response = await axiosInstance.get(API_ENDPOINTS.LOCATION.GET_CHECKIN_LOCATIONS);
        return response.data;
    } catch (error) {
        throw error.response?.data || error;
    }
};

export const verifyLocation = async (data) => {
    try {
        const response = await axiosInstance.post(API_ENDPOINTS.LOCATION.VERIFY_LOCATION, data);
        return response.data;
    } catch (error) {
        throw error.response?.data || error;
    }
};