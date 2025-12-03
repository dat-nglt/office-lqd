// zaloAuth.js
import { getAccessToken } from 'zmp-sdk';

/**
 * Lấy Access Token từ Zalo
 * @returns {Promise<string>} Access token
 */
export const getZaloAccessToken = async () => {
    try {
        const { accessToken } = await getAccessToken({});
        return accessToken;
    } catch (error) {
        console.error('Error getting Zalo access token:', error);
        throw error;
    }
};

/**
 * Lấy thông tin người dùng từ Zalo (legacy - không dùng nữa)
 * @deprecated Sử dụng getZaloAccessToken thay thế
 */
export const getZaloUserInfo = async () => {
    throw new Error('Deprecated: Use getZaloAccessToken instead');
};