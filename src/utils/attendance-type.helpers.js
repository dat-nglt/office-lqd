// Check if time is valid for check-in type
export const isValidTimeForType = (typeOrId) => {
  const now = new Date();
  const hour = now.getHours();
  const minute = now.getMinutes();
  const currentTime = hour * 60 + minute;

  // Parse time string format "HH:MM:SS" or "HH:MM" to minutes
  const parseToMinutes = (timeStr) => {
    const parts = (timeStr || "").split(":");
    const h = parseInt(parts[0] || "0", 10);
    const m = parseInt(parts[1] || "0", 10);
    return h * 60 + m;
  };

  // Use object with start_time/end_time if available
  if (typeOrId && typeof typeOrId === "object" && typeOrId.start_time) {
    const startMin = parseToMinutes(typeOrId.start_time);
    const endMin = parseToMinutes(typeOrId.end_time);

    // Handle overnight range (e.g., 22:00 - 06:00)
    if (startMin <= endMin) {
      return currentTime >= startMin && currentTime <= endMin;
    }
    return currentTime >= startMin || currentTime <= endMin;
  }

  // Fallback to numeric id mapping for backwards compatibility
  const typeId = typeof typeOrId === "number" ? typeOrId : typeOrId?.id;
  const timeRanges = {
    1: { start: 8 * 60, end: 17 * 60 }, // Regular Work: 08:00 - 17:00
    2: { start: 22 * 60, end: 6 * 60, overnight: true }, // Night Shift: 22:00 - 06:00
    3: { start: 17 * 60, end: 22 * 60 }, // Overtime After: 17:00 - 22:00
    4: { start: 11 * 60 + 30, end: 13 * 60 }, // Overtime Lunch: 11:30 - 13:00
  };

  const range = timeRanges[typeId];
  if (!range) return false;

  return range.overnight
    ? currentTime >= range.start || currentTime <= range.end
    : currentTime >= range.start && currentTime <= range.end;
};

// Format time message for validation error
export const getTimeValidationMessage = (type) => {
  if (type && typeof type === "object" && type.start_time && type.end_time) {
    const start = type.start_time.slice(0, 5);
    const end = type.end_time.slice(0, 5);
    return `trong khoảng ${start} - ${end}`;
  }

  const timeMessages = {
    overtime_after: "sau 17:00",
    overtime_lunch: "trong khoảng 11:30 - 13:00",
    night_shift: "trong khoảng 22:00 - 06:00",
  };

  return timeMessages[type?.code] || "";
};
