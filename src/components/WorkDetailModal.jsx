import { Box, Text, Icon, Modal } from "zmp-ui";
import { useContext } from "react";
import { ToastContext } from "./layout";

function WorkDetailModal({ visible, onClose, work }) {
    const toast = useContext(ToastContext);

    if (!work) return null;

    const handleCopyCoordinates = () => {
        if (work.coordinates) {
            const { lat, lng } = work.coordinates;
            const coordinatesText = `${lat}, ${lng}`;
            navigator.clipboard
                .writeText(coordinatesText)
                .then(() => {
                    toast?.success({
                        title: "Sao chép thành công",
                        message: `Tọa độ: ${coordinatesText}`,
                        duration: 2000,
                    });
                })
                .catch(() => {
                    toast?.error({
                        title: "Lỗi sao chép",
                        message: "Không thể sao chép tọa độ",
                        duration: 2000,
                    });
                });
        }
    };

    const handleCopyAddress = () => {
        if (work.address || work.location) {
            const addressText = work.address || work.location;
            navigator.clipboard
                .writeText(addressText)
                .then(() => {
                    toast?.success({
                        title: "Sao chép thành công",
                        message: "Địa chỉ đã được sao chép",
                        duration: 2000,
                    });
                })
                .catch(() => {
                    toast?.error({
                        title: "Lỗi sao chép",
                        message: "Không thể sao chép địa chỉ",
                        duration: 2000,
                    });
                });
        }
    };

    const handleCallCustomer = (phone) => {
        if (!phone) {
            toast?.warn({
                title: "Không có thông tin",
                message: "Không có số điện thoại",
                duration: 2000,
            });
            return;
        }
        window.location.href = `tel:${phone}`;
    };

    const InfoRow = ({ label, value, action, actionIcon, onAction }) => (
        <Box className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
            <Box className="flex-1">
                <Text className="text-xs text-gray-500 font-medium mb-1">{label}</Text>
                <Text className="text-sm font-semibold text-gray-900">{value}</Text>
            </Box>
            {action && (
                <button
                    onClick={onAction}
                    className="ml-3 p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded transition-colors flex-shrink-0"
                    title={action}
                >
                    <Icon icon={actionIcon} size={16} />
                </button>
            )}
        </Box>
    );

    return (
        <Modal visible={visible} onClose={onClose} title="Chi Tiết Công Việc">
            <Box className="p-0 space-y-4 pb-4">
                {/* Work Title Section */}
                <Box className="px-3 py-3 border-b-2 border-blue-200">
                    <Text className="text-xs text-blue-600 font-bold uppercase mb-1">Công Việc</Text>
                    <Text className="text-base font-bold text-gray-900">{work.title}</Text>
                    <Text className="text-sm text-gray-600 mt-1">{work.company}</Text>
                </Box>

                {/* Basic Information */}
                <Box className="px-3">
                    <Text className="text-xs text-gray-500 font-bold uppercase mb-3">Thông Tin Cơ Bản</Text>
                    <Box className="space-y-0">
                        <InfoRow
                            label="Loại dịch vụ"
                            value={work.serviceType || work.service || "N/A"}
                        />
                        <InfoRow
                            label="Thiết bị"
                            value={work.equipment || "N/A"}
                        />
                        <InfoRow
                            label="Ưu tiên"
                            value={
                                work.priority === "high" ? "Cao" :
                                    work.priority === "medium" ? "Trung bình" :
                                        "Thấp"
                            }
                        />
                    </Box>
                </Box>

                {/* Schedule Information */}
                <Box className="px-3">
                    <Text className="text-xs text-gray-500 font-bold uppercase mb-3">Lịch Trình</Text>
                    <Box className="space-y-0">
                        <InfoRow
                            label="Ngày"
                            value={work.scheduledDate || work.date || "N/A"}
                        />
                        {work.scheduledTime && (
                            <InfoRow
                                label="Giờ"
                                value={work.scheduledTime}
                            />
                        )}
                    </Box>
                </Box>

                {/* Location Information */}
                <Box className="px-3">
                    <Text className="text-xs text-gray-500 font-bold uppercase mb-3">Địa Điểm</Text>
                    {(work.address || work.location) && (
                        <InfoRow
                            label="Địa chỉ"
                            value={work.address || work.location}
                            action="Sao chép"
                            actionIcon="zi-copy"
                            onAction={handleCopyAddress}
                        />
                    )}
                    {work.coordinates && (
                        <Box className="flex items-center justify-between py-3 border-b border-gray-100">
                            <Box className="flex-1">
                                <Text className="text-xs text-gray-500 font-medium mb-1">Tọa độ GPS</Text>
                                <Text className="text-sm font-mono text-gray-900">
                                    {work.coordinates.lat}, {work.coordinates.lng}
                                </Text>
                            </Box>
                            <button
                                onClick={handleCopyCoordinates}
                                className="ml-3 p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded transition-colors flex-shrink-0"
                                title="Sao chép"
                            >
                                <Icon icon="zi-copy" size={16} />
                            </button>
                        </Box>
                    )}
                </Box>

                {/* Customer Information */}
                <Box className="px-3">
                    <Text className="text-xs text-gray-500 font-bold uppercase mb-3">Khách Hàng</Text>
                    <Box className="space-y-0">
                        {work.customerName && (
                            <InfoRow
                                label="Tên khách hàng"
                                value={work.customerName}
                            />
                        )}
                        {work.phoneNumber && (
                            <InfoRow
                                label="Số điện thoại"
                                value={work.phoneNumber}
                                action="Gọi"
                                actionIcon="zi-call"
                                onAction={() => handleCallCustomer(work.phoneNumber)}
                            />
                        )}
                    </Box>
                </Box>

                {/* Technicians Information */}
                {work.technicians && work.technicians.length > 0 && (
                    <Box className="px-3">
                        <Text className="text-xs text-gray-500 font-bold uppercase mb-3">
                            Kỹ Thuật Viên ({work.technicians.length})
                        </Text>
                        <Box className="space-y-2">
                            {work.technicians.map((tech, idx) => (
                                <Box
                                    key={idx}
                                    className="flex items-center justify-between p-2 bg-gray-50 rounded border border-gray-200"
                                >
                                    <Box>
                                        <Text className="text-sm font-semibold text-gray-900">{tech.name}</Text>
                                        <Text className="text-xs text-gray-600">{tech.specialization}</Text>
                                    </Box>
                                    <button
                                        onClick={() => handleCallCustomer(tech.phone)}
                                        className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-100 rounded transition-colors flex-shrink-0"
                                        title={`Gọi ${tech.name}`}
                                    >
                                        <Icon icon="zi-call" size={16} />
                                    </button>
                                </Box>
                            ))}
                        </Box>
                    </Box>
                )}

                {/* Content */}
                {work.content && (
                    <Box className="px-3">
                        <Text className="text-xs text-gray-500 font-bold uppercase mb-2">Nội Dung</Text>
                        <Box className="p-3 bg-gray-50 rounded border border-gray-200">
                            <Text className="text-sm text-gray-900 leading-relaxed">{work.content}</Text>
                        </Box>
                    </Box>
                )}

                {/* Notes */}
                {work.notes && (
                    <Box className="px-3">
                        <Text className="text-xs text-gray-500 font-bold uppercase mb-2">Ghi Chú</Text>
                        <Box className="p-3 bg-gray-50 rounded border border-gray-200">
                            <Text className="text-sm text-gray-900 leading-relaxed whitespace-pre-wrap">
                                {work.notes}
                            </Text>
                        </Box>
                    </Box>
                )}

                {/* Close Button */}
                <Box className="px-3">
                    <button
                        onClick={onClose}
                        className="w-full px-4 py-2.5 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors text-sm"
                    >
                        Đóng
                    </button>
                </Box>
            </Box>
        </Modal>
    );
}

export default WorkDetailModal;
