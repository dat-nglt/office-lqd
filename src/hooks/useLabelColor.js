export const getStatusColor = (status) => {
  switch (status) {
    case "pending":
      return "bg-yellow-100 text-yellow-800 border-yellow-300";
    case "in_progress":
      return "bg-blue-100 text-blue-800 border-blue-300";
    case "completed":
      return "bg-blue-100 text-blue-800 border-blue-300";
    default:
      return "bg-gray-100 text-gray-800 border-gray-300";
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
      return "text-red-600 bg-red-50";
    case "medium":
      return "text-orange-600 bg-orange-50";
    case "low":
      return "text-blue-600 bg-blue-50";
    default:
      return "text-gray-600 bg-gray-50";
  }
};
