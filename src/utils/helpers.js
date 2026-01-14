/**
 * Format date to Vietnamese format with day name
 * @param {Date} date
 * @returns {string}
 */
export const formatDate = (date) => {
  const days = ["Chủ nhật", "Thứ hai", "Thứ ba", "Thứ tư", "Thứ năm", "Thứ sáu", "Thứ bảy"];
  const dayName = days[date.getDay()];
  const formattedDate = date.toLocaleDateString("vi-VN");
  return `${formattedDate}  ${dayName}`;
};

/**
 * Calculate work hours between two times
 * @param {string} startTime - format: HH:mm
 * @param {string} endTime - format: HH:mm
 * @returns {Object} {hours, mins, total}
 */
export const calculateWorkHours = (startTime, endTime) => {
  if (!startTime || !endTime) {
    return { hours: 0, mins: 0, total: 0 };
  }

  const [startHour, startMin] = startTime.split(":").map(Number);
  const [endHour, endMin] = endTime.split(":").map(Number);
  const start = startHour * 60 + startMin;
  const end = endHour * 60 + endMin;
  const minutes = Math.max(0, end - start);
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return { hours, mins, total: minutes };
};

/**
 * Validate required form fields and return validation result with failed fields
 * @param {Object} formData
 * @param {string[]} 
 * @returns {Object} {isValid: boolean, failedFields: string[]}
 */
export const validateFormFields = (formData, requiredFields) => {
  const failedFields = [];
  
  requiredFields.forEach((field) => {
    const value = formData[field];
    const isValid = typeof value === "string" ? value.trim() !== "" : value !== "" && value !== null;
    
    if (!isValid) {
      failedFields.push(field);
    }
  });
  
  return {
    isValid: failedFields.length === 0,
    failedFields,
  };
};

/**
 * Get status badge color and text
 * @param {string} status
 * @returns {Object} {color, text}
 */
export const getStatusStyle = (status) => {
  const statusMap = {
    completed: { color: "bg-green-100 text-green-800 border-green-300", text: "Hoàn thành" },
    in_progress: { color: "bg-blue-100 text-blue-800 border-blue-300", text: "Đang thực hiện" },
    pending: { color: "bg-yellow-100 text-yellow-800 border-yellow-300", text: "Chờ xử lý" },
  };
  return statusMap[status] || { color: "bg-gray-100 text-gray-800 border-gray-300", text: "Không xác định" };
};

/**
 * Format date string to Vietnamese format
 * @param {string} dateString - format: YYYY-MM-DD
 * @returns {string}
 */
export const formatDateString = (dateString) => {
  const date = new Date(dateString + "T00:00:00");
  return formatDate(date);
};

/**
 * Format phone number
 * @param {string} phone
 * @returns {string}
 */
export const formatPhoneNumber = (phone) => {
  const cleaned = phone.replace(/\D/g, "");
  if (cleaned.length === 10) {
    return `0${cleaned}`;
  }
  return cleaned;
};

// Helper function để format khoảng cách
export const formatDistance = (distance) => {
  // Accept number or string; coerce to number safely
  const d = distance == null ? 0 : typeof distance === "string" ? parseFloat(distance) : Number(distance);
  if (isNaN(d) || d <= 0) return "0m";
  if (d > 1000) {
    return `${(d / 1000).toFixed(1)}km`;
  }
  return `${Math.round(d)}m`;
};
