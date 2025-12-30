export const isDateInRange = (dateStr, startStr, endStr) => {
  const parseDate = (str) => {
    const [day, month, year] = str.split("/").map(Number);
    return new Date(year, month - 1, day, 0, 0, 0, 0);
  };
  const date = parseDate(dateStr);
  const start = parseDate(startStr);
  const end = parseDate(endStr);

  return date >= start && date <= end;
};

// Helper functions để tính toán ngày
export const getStartOfWeek = (date) => {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
  const startWeek = new Date(d.setDate(diff));
  return startWeek.toLocaleDateString("vi-VN");
};

export const getEndOfWeek = (date) => {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
  const endWeek = new Date(d.setDate(diff + 6));
  return endWeek.toLocaleDateString("vi-VN");
};

export const getStartOfMonth = (date) => {
  const d = new Date(date);
  const startMonth = new Date(d.getFullYear(), d.getMonth(), 1);
  return startMonth.toLocaleDateString("vi-VN");
};

export const getEndOfMonth = (date) => {
  const d = new Date(date);
  const endMonth = new Date(d.getFullYear(), d.getMonth() + 1, 0);
  return endMonth.toLocaleDateString("vi-VN");
};
