import { Box, Text, Modal, Input } from "zmp-ui";

function OvertimeRequestModal({
  visible,
  onClose,
  selectedWork,
  overtimeRequest,
  setOvertimeRequest,
  calculateOvertimeHours,
  onConfirm,
}) {
  const availableTechnicians = [
    { id: 1, name: "Sơn" },
    { id: 2, name: "Lâm" },
    { id: 3, name: "Sỹ" },
    { id: 4, name: "Huy" },
    { id: 5, name: "Quang" },
    { id: 6, name: "Thương TT" },
  ];

  return (
    <Modal visible={visible} onClose={onClose}>
      <Box className="p-0 space-y-4">
        {selectedWork && (
          <>
            <Box className="bg-orange-50 rounded p-3 border border-orange-200">
              <Text className="text-xs text-orange-700 font-semibold mb-1">Công việc</Text>
              <Text className="font-semibold text-gray-900 text-sm">{selectedWork.title}</Text>
              <Text className="text-xs text-gray-600 mt-1">Thời gian: {selectedWork.scheduledTime}</Text>
            </Box>

            {/* Kỹ thuật viên công tác */}
            <Box>
              <Text className="text-sm font-semibold text-gray-700 mb-2">Kỹ thuật viên công tác</Text>
              <Box className="max-h-32 overflow-y-auto border rounded-lg p-2 bg-gray-50">
                {availableTechnicians.map((tech) => (
                  <Box key={tech.id} className="flex items-center mb-1">
                    <input
                      type="checkbox"
                      id={`tech-${tech.id}`}
                      checked={overtimeRequest.technicians.includes(tech.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setOvertimeRequest((prev) => ({
                            ...prev,
                            technicians: [...prev.technicians, tech.id],
                          }));
                        } else {
                          setOvertimeRequest((prev) => ({
                            ...prev,
                            technicians: prev.technicians.filter((t) => t !== tech.id),
                          }));
                        }
                      }}
                      className="mr-2"
                    />
                    <label htmlFor={`tech-${tech.id}`} className="text-sm cursor-pointer">
                      {tech.name}
                    </label>
                  </Box>
                ))}
              </Box>
            </Box>

            {/* Loại tăng ca */}
            <Box>
              <Text className="text-sm font-semibold text-gray-700 mb-1">Loại tăng ca</Text>
              <select
                value={overtimeRequest.type}
                onChange={(e) => {
                  const v = e.target.value;
                  setOvertimeRequest((prev) => {
                    const updated = { ...prev, type: v };
                    if (v === "overtime_lunch") {
                      updated.startTime = "11:30";
                      updated.endTime = "13:00";
                    } else if (v === "overtime_night") {
                      updated.startTime = "17:00";
                      updated.endTime = "22:00";
                    }
                    return updated;
                  });
                }}
                className="w-full h-[50px] rounded-lg border border-gray-300 p-2 bg-white"
              >
                <option value="lunch">Tăng ca trưa</option>
                <option value="night">Tăng ca tối</option>
                <option value="other">Khác</option>
              </select>
            </Box>

            {/* Thời gian bắt đầu và kết thúc */}
            <Box className="grid grid-cols-2 gap-4 items-end">
              <Box>
                <Text className="text-sm font-semibold text-gray-700 mb-1">Bắt đầu</Text>
                <Input
                  type="time"
                  value={overtimeRequest.startTime}
                  onChange={(e) => setOvertimeRequest((prev) => ({ ...prev, startTime: e.target.value }))}
                  className="w-full rounded-lg"
                />
              </Box>

              <Box>
                <Text className="text-sm font-semibold text-gray-700 mb-1">Kết thúc</Text>
                <Input
                  type="time"
                  value={overtimeRequest.endTime}
                  onChange={(e) => setOvertimeRequest((prev) => ({ ...prev, endTime: e.target.value }))}
                  className="w-full rounded-lg"
                />
              </Box>
            </Box>

            {/* Số giờ tăng ca dự kiến */}
            <Box>
              <Text className="text-sm font-semibold text-gray-700 mb-2">Số giờ tăng ca dự kiến</Text>
              <Input value={`${calculateOvertimeHours()} giờ`} readOnly className="w-full rounded-lg bg-gray-100" />
            </Box>

            {/* Lý do tăng ca */}
            <Box>
              <Text className="text-sm font-semibold text-gray-700 mb-2">Lý do yêu cầu tăng ca</Text>
              <Input
                placeholder="Nhập lý do tăng ca..."
                value={overtimeRequest.reason}
                onChange={(e) => setOvertimeRequest((prev) => ({ ...prev, reason: e.target.value }))}
                className="w-full rounded-lg border-gray-300"
                rows={3}
              />
            </Box>

            {/* Action buttons */}
            <Box className="flex gap-2">
              <button
                onClick={onClose}
                className="flex-1 px-3 py-2 bg-gray-200 text-gray-800 rounded-lg font-semibold hover:bg-gray-300 transition-colors text-sm"
              >
                Hủy
              </button>
              <button
                onClick={onConfirm}
                className="flex-1 px-3 py-2 bg-orange-600 text-white rounded-lg font-semibold hover:bg-orange-700 transition-colors text-sm"
              >
                Gửi yêu cầu
              </button>
            </Box>
          </>
        )}
      </Box>
    </Modal>
  );
}

export default OvertimeRequestModal;
