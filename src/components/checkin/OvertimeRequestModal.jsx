import { Modal, Box, Button, Text, Icon, Input, DatePicker } from "zmp-ui";
import { useState } from "react";
import "./OvertimeRequestModal.css";

const OVERTIME_CATEGORIES = [
    { value: "administrative_work", label: "Công việc hành chính" },
    { value: "project_support", label: "Hỗ trợ dự án" },
    { value: "event_support", label: "Hỗ trợ sự kiện" },
    { value: "report_processing", label: "Xử lý báo cáo" },
    { value: "data_entry", label: "Nhập liệu" },
    { value: "meeting_support", label: "Hỗ trợ cuộc họp" },
    { value: "emergency_work", label: "Công việc khẩn cấp" },
    { value: "other", label: "Khác" },
];

const PRIORITY_LEVELS = [
    { value: "low", label: "Thấp" },
    { value: "medium", label: "Trung bình" },
    { value: "high", label: "Cao" },
    { value: "urgent", label: "Khẩn cấp" },
];

function OvertimeRequestModal({ visible, onClose, onSubmit, loading = false }) {
    const [formData, setFormData] = useState({
        overtime_category: "administrative_work",
        priority: "medium",
        requested_date: new Date(),
        start_time: "18:00",
        end_time: "20:00",
        reason: "Tăng ca hoàn thành công việc được giao",
        notes: "",
    });

    const [errors, setErrors] = useState({});

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
        // Clear error for this field
        if (errors[name]) {
            setErrors((prev) => ({
                ...prev,
                [name]: "",
            }));
        }
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.requested_date) {
            newErrors.requested_date = "Vui lòng chọn ngày";
        }

        if (!formData.start_time) {
            newErrors.start_time = "Vui lòng chọn giờ bắt đầu";
        }

        if (!formData.end_time) {
            newErrors.end_time = "Vui lòng chọn giờ kết thúc";
        }

        if (formData.start_time && formData.end_time) {
            if (formData.start_time >= formData.end_time) {
                newErrors.end_time = "Giờ kết thúc phải sau giờ bắt đầu";
            }
        }

        if (!formData.reason || formData.reason.trim() === "") {
            newErrors.reason = "Vui lòng nhập lý do tăng ca";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = () => {
        if (validateForm()) {
            onSubmit(formData);
            setFormData({
                overtime_category: "administrative_work",
                priority: "medium",
                requested_date: new Date(),
                start_time: "18:00",
                end_time: "20:00",
                reason: "",
                notes: "",
            });
        }
    };

    const handleClose = () => {
        setFormData({
            overtime_category: "administrative_work",
            priority: "medium",
            requested_date: new Date(),
            start_time: "18:00",
            end_time: "20:00",
            reason: "",
            notes: "",
        });
        setErrors({});
        onClose();
    };

    return (
        <Modal
            visible={visible}
            onClose={handleClose}
            className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
        >
            <Box className="space-y-5">
                {/* Section 1: Phân loại & Ưu tiên */}
                <Box>
                    <Text className="font-semibold text-gray-900 text-sm mb-3 flex items-center">
                        <Icon icon="zi-note" className="mr-1 text-blue-600" size={16} />
                        Phân Loại Tăng Ca
                    </Text>
                    <Box className="space-y-3">
                        <Box>
                            <Text className="text-xs text-gray-700 font-medium mb-2">
                                Phân loại tăng ca <span className="text-red-500">*</span>
                            </Text>
                            <select
                                name="overtime_category"
                                value={formData.overtime_category}
                                onChange={handleInputChange}
                                className="w-full px-3 py-2 border bg-transparent border-gray-300 rounded-lg text-sm focus:outline-none focus:border-blue-600 h-10"
                            >
                                {OVERTIME_CATEGORIES.map((cat) => (
                                    <option key={cat.value} value={cat.value}>
                                        {cat.label}
                                    </option>
                                ))}
                            </select>
                        </Box>

                        <Box>
                            <Text className="text-xs text-gray-700 font-medium mb-2">
                                Mức độ ưu tiên <span className="text-red-500">*</span>
                            </Text>
                            <select
                                name="priority"
                                value={formData.priority}
                                onChange={handleInputChange}
                                className="w-full px-3 py-2 border bg-transparent border-gray-300 rounded-lg text-sm focus:outline-none focus:border-blue-600 h-10"
                            >
                                {PRIORITY_LEVELS.map((level) => (
                                    <option key={level.value} value={level.value}>
                                        {level.label}
                                    </option>
                                ))}
                            </select>
                        </Box>
                    </Box>
                </Box>

                <Box className="border-t border-gray-100" />

                {/* Section 2: Thời Gian */}
                <Box>
                    <Text className="font-semibold text-gray-900 text-sm mb-3 flex items-center">
                        <Icon icon="zi-calendar" className="mr-1 text-blue-600" size={16} />
                        Thời Gian Tăng Ca
                    </Text>
                    <Box className="space-y-3">
                        <Box>
                            <Text className="text-xs text-gray-700 font-medium mb-2">
                                Ngày tăng ca <span className="text-red-500">*</span>
                            </Text>
                            <DatePicker
                                name="requested_date"
                                dateFormat="dd/mm/yyyy"
                                value={formData.requested_date}
                                onChange={(date) => handleInputChange("requested_date", date)}
                                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 text-sm ${
                                    errors.requested_date
                                        ? "border-red-500 focus:ring-red-500"
                                        : "border-gray-300 focus:ring-blue-500"
                                }`}
                            />
                            {errors.requested_date && (
                                <Text size="xSmall" className="text-red-500 mt-1">
                                    {errors.requested_date}
                                </Text>
                            )}
                        </Box>

                        <Box className="grid grid-cols-2 gap-3">
                            <Box>
                                <Text className="text-xs text-gray-700 font-medium mb-2">
                                    Giờ bắt đầu <span className="text-red-500">*</span>
                                </Text>
                                <Input
                                    type="time"
                                    name="start_time"
                                    value={formData.start_time}
                                    onChange={handleInputChange}
                                    className={`w-full border rounded-lg focus:outline-none focus:ring-1 text-sm ${
                                        errors.start_time
                                            ? "border-red-500 focus:ring-red-500"
                                            : "border-gray-300 focus:ring-blue-500"
                                    }`}
                                />
                                {errors.start_time && (
                                    <Text size="xSmall" className="text-red-500 mt-1">
                                        {errors.start_time}
                                    </Text>
                                )}
                            </Box>

                            <Box>
                                <Text className="text-xs text-gray-700 font-medium mb-2">
                                    Giờ kết thúc <span className="text-red-500">*</span>
                                </Text>
                                <Input
                                    type="time"
                                    name="end_time"
                                    value={formData.end_time}
                                    onChange={handleInputChange}
                                    className={`w-full border rounded-lg focus:outline-none focus:ring-1 text-sm ${
                                        errors.end_time
                                            ? "border-red-500 focus:ring-red-500"
                                            : "border-gray-300 focus:ring-blue-500"
                                    }`}
                                />
                                {errors.end_time && (
                                    <Text size="xSmall" className="text-red-500 mt-1">
                                        {errors.end_time}
                                    </Text>
                                )}
                            </Box>
                        </Box>
                    </Box>
                </Box>

                <Box className="border-t border-gray-100" />

                {/* Section 3: Nội dung & Ghi chú */}
                <Box>
                    <Text className="font-semibold text-gray-900 text-sm mb-3 flex items-center">
                        <Icon icon="zi-drag-indicator-solid" className="mr-1 text-blue-600" size={16} />
                        Chi Tiết Yêu Cầu
                    </Text>
                    <Box className="space-y-3">
                        <Box>
                            <Text className="text-xs text-gray-700 font-medium mb-2">
                                Lý do tăng ca <span className="text-red-500">*</span>
                            </Text>
                            <textarea
                                name="reason"
                                value={formData.reason}
                                onChange={handleInputChange}
                                placeholder="Nhập lý do yêu cầu tăng ca..."
                                rows="3"
                                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 text-sm resize-none ${
                                    errors.reason
                                        ? "border-red-500 focus:ring-red-500"
                                        : "border-gray-300 focus:ring-blue-500"
                                }`}
                            />
                            {errors.reason && (
                                <Text size="xSmall" className="text-red-500 mt-1">
                                    {errors.reason}
                                </Text>
                            )}
                        </Box>

                        <Box>
                            <Text className="text-xs text-gray-700 font-medium mb-2">
                                Ghi chú thêm (không bắt buộc)
                            </Text>
                            <textarea
                                name="notes"
                                value={formData.notes}
                                onChange={handleInputChange}
                                placeholder="Nhập ghi chú bổ sung..."
                                rows="2"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm resize-none"
                            />
                        </Box>
                    </Box>
                </Box>

                <Box className="border-t border-gray-100" />

                {/* Action Buttons */}
                <Box className="flex gap-2">
                    <Button
                        onClick={handleClose}
                        disabled={loading}
                        fullWidth
                        variant="secondary"
                        className="px-3 py-3 bg-gray-400 hover:bg-gray-500 text-white rounded-lg text-sm font-semibold transition-colors disabled:opacity-50"
                    >
                        Hủy
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        disabled={loading}
                        fullWidth
                        className="px-3 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold transition-colors disabled:opacity-50"
                    >
                        {loading ? "Đang gửi..." : "Gửi yêu cầu"}
                    </Button>
                </Box>
            </Box>
        </Modal>
    );
}

export default OvertimeRequestModal;
