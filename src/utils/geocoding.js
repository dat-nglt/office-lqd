/**
 * Reverse Geocoding Utility
 * Converts coordinates (latitude, longitude) to human-readable place names
 */

// Cache for geocoding results to reduce API calls
const geocodingCache = new Map();

/**
 * Get place name from coordinates using reverse geocoding
 * @param {number} latitude - Latitude coordinate
 * @param {number} longitude - Longitude coordinate
 * @returns {Promise<string>} - Human-readable place name
 */
export const getPlaceNameFromCoordinates = async (latitude, longitude) => {
    try {
        // Check cache first
        const cacheKey = `${latitude.toFixed(6)},${longitude.toFixed(6)}`;
        if (geocodingCache.has(cacheKey)) {
            return geocodingCache.get(cacheKey);
        }

        // Try using OpenStreetMap Nominatim API (free, no API key required)
        const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`,
            {
                headers: {
                    "Accept-Language": "vi",
                },
            }
        );

        if (!response.ok) {
            throw new Error("Geocoding API error");
        }

        const data = await response.json();
        const placeName = formatPlaceName(data);

        // Cache the result
        geocodingCache.set(cacheKey, placeName);

        return placeName;
    } catch (error) {
        console.error("Error getting place name from coordinates:", error);
        // Return formatted coordinates as fallback
        return `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
    }
};

/**
 * Format place name from Nominatim API response
 * @param {object} data - Nominatim API response data
 * @returns {string} - Formatted place name
 */
const formatPlaceName = (data) => {
    if (!data || !data.address) {
        return "Vị trí không xác định";
    }

    const address = data.address;
    const parts = [];

    // Priority order for Vietnamese addresses
    if (address.road || address.path) {
        parts.push(address.road || address.path);
    }

    if (address.suburb || address.neighbourhood) {
        parts.push(address.suburb || address.neighbourhood);
    }

    if (address.village) {
        parts.push(address.village);
    }

    if (address.ward) {
        parts.push(address.ward);
    }

    if (address.district || address.county) {
        parts.push(address.district || address.county);
    }

    if (address.city || address.province) {
        parts.push(address.city || address.province);
    }

    return parts.length > 0 ? parts.join(", ") : address.display_name || "Vị trí không xác định";
};

/**
 * Get detailed place information from coordinates
 * @param {number} latitude - Latitude coordinate
 * @param {number} longitude - Longitude coordinate
 * @returns {Promise<object>} - Detailed place information
 */
export const getPlaceDetailsFromCoordinates = async (latitude, longitude) => {
    try {
        const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`,
            {
                headers: {
                    "Accept-Language": "vi",
                },
            }
        );

        if (!response.ok) {
            throw new Error("Geocoding API error");
        }

        const data = await response.json();

        return {
            address: data.address ? formatPlaceName(data) : "Vị trí không xác định",
            fullAddress: data.display_name || "Vị trí không xác định",
            latitude: data.lat,
            longitude: data.lon,
            postalCode: data.address?.postcode || null,
            country: data.address?.country || null,
            city: data.address?.city || data.address?.province || null,
            district: data.address?.district || data.address?.county || null,
            ward: data.address?.ward || null,
            road: data.address?.road || null,
            raw: data,
        };
    } catch (error) {
        console.error("Error getting place details:", error);
        return {
            address: `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`,
            fullAddress: `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`,
            latitude,
            longitude,
            postalCode: null,
            country: null,
            city: null,
            district: null,
            ward: null,
            road: null,
            raw: null,
        };
    }
};

/**
 * Format coordinates to string
 * @param {number} latitude - Latitude coordinate
 * @param {number} longitude - Longitude coordinate
 * @returns {string} - Formatted coordinates string
 */
export const formatCoordinates = (latitude, longitude) => {
    return `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
};

/**
 * Get distance between two coordinates in meters
 * @param {number} lat1 - First latitude
 * @param {number} lon1 - First longitude
 * @param {number} lat2 - Second latitude
 * @param {number} lon2 - Second longitude
 * @returns {number} - Distance in meters
 */
export const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Earth's radius in kilometers
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos((lat1 * Math.PI) / 180) *
            Math.cos((lat2 * Math.PI) / 180) *
            Math.sin(dLon / 2) *
            Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c * 1000; // Convert to meters
};

/**
 * Check if a point is within a circular radius
 * @param {number} userLat - User latitude
 * @param {number} userLon - User longitude
 * @param {number} centerLat - Center latitude
 * @param {number} centerLon - Center longitude
 * @param {number} radiusMeters - Radius in meters
 * @returns {boolean} - True if point is within radius
 */
export const isPointWithinRadius = (userLat, userLon, centerLat, centerLon, radiusMeters) => {
    const distance = calculateDistance(userLat, userLon, centerLat, centerLon);
    return distance <= radiusMeters;
};

/**
 * Clear geocoding cache
 */
export const clearGeocodingCache = () => {
    geocodingCache.clear();
};

/**
 * Get cache size
 * @returns {number} - Number of cached items
 */
export const getGeocodingCacheSize = () => {
    return geocodingCache.size;
};
