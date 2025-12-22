import { Box, Text, Icon } from "zmp-ui";

function CheckInHistory({ checkInRecords }) {
    return (
        <Box className="mt-8 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <Box className="p-4 border-b border-gray-200">
                <Text className="font-bold text-gray-900 flex items-center">
                    <Icon icon="zi-list-1" className="mr-2 text-blue-600" size={16} />
                    Lịch Sử Chấm Công Hôm Nay
                </Text>
            </Box>

            <Box className="divide-y divide-gray-200">
                {checkInRecords.length > 0 ? (
                    checkInRecords.map((record) => (
                        <Box key={record.id} className={`p-4`}>
                            <Box className="flex items-start justify-between mb-2">
                                <Box>
                                    <Box className="flex items-center gap-2">
                                        <Text className="font-semibold text-gray-900">
                                            {record.type === "Vào" ? "Chấm Vào" : "Chấm Ra"}
                                        </Text>
                                        {record.isViolation && (
                                            <Box className="flex items-center gap-1 bg-red-600 text-white px-2 py-0.5 rounded text-xs font-semibold">
                                                VI PHẠM
                                            </Box>
                                        )}
                                    </Box>
                                    <Text className="text-sm text-gray-600 mt-1">
                                        {record.checkInTime} - {record.location}
                                    </Text>
                                    <Text className="text-xs text-gray-500 mt-1">
                                        {record.checkInType} -{" "}
                                        {record.locationType === "warehouse" ? "Kho vật tư" : "Công trình"}
                                    </Text>
                                    <Box className="flex items-center justify-between mt-2">
                                        <Text className="text-xs text-gray-500 font-mono">
                                            {record.latitude.toFixed(4)}, {record.longitude.toFixed(4)}
                                        </Text>
                                    </Box>
                                    {record.isViolation && (
                                        <Text className="text-xs text-red-700 font-semibold mt-1">
                                            Cách vị trí làm việc ~ {(record.violationDistance / 1000).toFixed(2) || 0}Km
                                        </Text>
                                    )}
                                </Box>
                                <Box
                                    className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                        record.type === "Vào"
                                            ? "bg-blue-100 text-blue-800"
                                            : "bg-purple-100 text-purple-800"
                                    }`}
                                >
                                    {record.type}
                                </Box>
                            </Box>

                            {record.photo && (
                                <Box
                                    className={`mt-3 rounded-lg overflow-hidden border-2 aspect-square bg-gray-100 ${
                                        record.isViolation ? "border-red-500" : "border-gray-200"
                                    }`}
                                >
                                    <img src={record.photo} alt="Check-in" className="w-full h-full object-cover" />
                                    {record.isViolation && (
                                        <Box className="absolute inset-0 bg-red-600/5 pointer-events-none"></Box>
                                    )}
                                </Box>
                            )}
                        </Box>
                    ))
                ) : (
                    <Box className="text-center py-8">
                        <Icon icon="zi-check-circle" className="text-gray-400 text-3xl mb-2" />
                        <Text className="text-gray-500 text-sm">Chưa có chấm công hôm nay</Text>
                    </Box>
                )}
            </Box>
        </Box>
    );
}

export default CheckInHistory;
