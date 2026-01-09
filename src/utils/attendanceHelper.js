/**
 * attendanceHelper.js
 * Helpers to parse and normalize attendance records returned by server for "today"
 */

/**
 * Normalize a single timestamp to localized strings
 * @param {string|Date|null} timestamp
 * @returns {{date: string, time: string, iso: string}}
 */
const normalizeTimestamp = (timestamp) => {
  if (!timestamp) {
    const now = new Date();
    return {
      date: now.toLocaleDateString("vi-VN"),
      time: now.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }),
      iso: now.toISOString(),
    };
  }
  const d = new Date(timestamp);
  return {
    date: d.toLocaleDateString("vi-VN"),
    time: d.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }),
    iso: d.toISOString(),
  };
};

/**
 * Create a normalized event object for a single check-in or check-out
 */
const buildEvent = ({ attendance, mode }) => {
  const isOut = mode === "out";

  // Lấy metadata tương ứng với mode (check-in hoặc check-out)
  const metadata = isOut ? attendance.check_out_metadata : attendance.check_in_metadata;
  const fallbackMetadata = attendance.metadata; // Fallback để backward compatibility

  const timeField = isOut ? attendance.check_out_time : attendance.check_in_time;
  const photoField = isOut ? attendance.photo_url_check_out || attendance.photo_url : attendance.photo_url;
  const latField = isOut ? attendance.latitude_check_out || attendance.latitude : attendance.latitude;
  const lonField = isOut ? attendance.longitude_check_out || attendance.longitude : attendance.longitude;
  const isWithinRadiusField = isOut
    ? attendance.is_within_radius_check_out ?? attendance.is_within_radius
    : attendance.is_within_radius;
  const violationDistanceField = isOut
    ? attendance.violation_distance_check_out ||
      attendance.distance_from_work_check_out ||
      attendance.violation_distance
    : attendance.violation_distance || attendance.distance_from_work;

  const time = normalizeTimestamp(timeField);

  // Xác định vị trí và loại địa điểm từ metadata chính xác
  const locationName = attendance.location_name || "Không rõ";
  const locationCheckOutName = attendance.location_name_check_out || locationName;
  const currentLocation = isOut ? locationCheckOutName : locationName;

  // Lấy thông tin từ metadata ưu tiên, nếu không có thì fallback
  const isAtHub = metadata?.isAtHub ?? fallbackMetadata?.isAtHub ?? false;
  const locationType = metadata?.locationType ?? fallbackMetadata?.locationType ?? null;
  const attendanceMode = metadata?.attendanceMode ?? mode;

  // Xác định tiêu đề công việc
  let workTitle = attendance.work?.title || "chưa xác định";

  return {
    attendanceId: `${attendance.id}-${mode}`,
    id: attendance.id,
    workTitle,
    mode: mode,
    attendanceMode: attendanceMode, // 'in' hoặc 'out' từ metadata
    type: isOut ? "Chấm công Ra" : "Chấm công Vào",
    attendanceType: isOut ? "Chấm công ra" : "Chấm công vào",
    checkInTime: time.time,
    date: time.date,
    iso: time.iso,
    location: currentLocation,
    locationType: locationType, // Loại địa điểm: 'work', 'warehouse', 'office', etc.
    isAtHub: isAtHub, // Xác định xem có phải tại hub hay không
    photo: photoField || null,
    latitude: latField != null ? parseFloat(latField) : 0,
    longitude: lonField != null ? parseFloat(lonField) : 0,
    isViolation: !isWithinRadiusField, // default false
    violationDistance: violationDistanceField != null ? parseFloat(violationDistanceField) : 0,
    raw: attendance,
  };
};

/**
 * Parse server attendance records for today into an array of events
 * - Each attendance record can contain both check_in and check_out timestamps; we split into two events
 * - Returned array is sorted by timestamp DESC (newest first)
 *
 * @param {Array<Object>} attendances - Array of attendance records from server
 * @returns {Array<Object>} parsedEvents
 */
export const parseTodayAttendanceRecords = (attendances = []) => {
  if (!Array.isArray(attendances)) return [];

  const events = [];

  attendances.forEach((attendance) => {
    // If the record has check_in_time, add an "in" event
    if (attendance.check_in_time) {
      events.push(buildEvent({ attendance, mode: "in" }));
    }

    // If the record has check_out_time, add an "out" event
    if (attendance.check_out_time) {
      events.push(buildEvent({ attendance, mode: "out" }));
    }
  });

  // Sort by ISO timestamp desc
  events.sort((a, b) => new Date(b.iso) - new Date(a.iso));

  return events;
};

export default { parseTodayAttendanceRecords };
