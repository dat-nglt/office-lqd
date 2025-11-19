/**
 * API Usage Examples
 * Shows how to use the API services
 */

import {
    authService,
    userService,
    workReportService,
    checkinService,
} from "../services/apiService";

// ============================================
// Work Report Example
// ============================================

export const submitWorkReport = async (reportData) => {
    try {
        const response = await workReportService.create({
            date: reportData.date,
            company: reportData.company,
            address: reportData.address,
            content: reportData.content,
            customerName: reportData.customerName,
            phoneNumber: reportData.phoneNumber,
            notes: reportData.notes,
        });

        console.log("Work report submitted:", response.data);
        return response.data;
    } catch (error) {
        console.error("Error submitting work report:", error);
        throw error;
    }
};

// ============================================
// Check-in Example
// ============================================

export const submitCheckin = async (checkinData) => {
    try {
        const response = await checkinService.submit({
            type: checkinData.type, // "Vào" or "Ra"
            location: checkinData.location,
            latitude: checkinData.latitude,
            longitude: checkinData.longitude,
            photo: checkinData.photo,
        });

        console.log("Check-in submitted:", response.data);
        return response.data;
    } catch (error) {
        console.error("Error submitting check-in:", error);
        throw error;
    }
};

// ============================================
// Get User Profile Example
// ============================================

export const fetchUserProfile = async () => {
    try {
        const response = await userService.getProfile();
        console.log("User profile:", response.data);
        return response.data;
    } catch (error) {
        console.error("Error fetching user profile:", error);
        throw error;
    }
};
