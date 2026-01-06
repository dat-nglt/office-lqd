export const getStatusColor = (status) => {
  switch (status) {
    case "pending":
      return "text-yellow-600 border-yellow-300";
    case "in_progress":
      return "text-blue-600 border-blue-300";
    case "completed":
      return "text-green-600 border-green-300";
    default:
      return "text-gray-600 border-gray-300";
  }
};

export const getStatusLabel = (status) => {
  switch (status) {
    case "pending":
      return "Chờ thực hiện";
    case "in_progress":
      return "Đang thực hiện";
    case "completed":
      return "Hoàn thành";
    case "cancelled":
      return "Đã hủy";
    default:
      return "Không xác định";
  }
};

export const getPriorityLabel = (priority) => {
  switch (priority) {
    case "high":
      return "Cao";
    case "medium":
      return "Trung bình";
    case "low":
      return "Thấp";
    default:
      return "Bình thường";
  }
};

export const getPriorityColor = (priority) => {
  switch (priority) {
    case "high":
      return "text-red-600";
    case "medium":
      return "text-orange-600";
    case "low":
      return "text-blue-600";
    default:
      return "text-gray-600";
  }
};
