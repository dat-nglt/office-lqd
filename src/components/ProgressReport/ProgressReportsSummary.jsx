import { Box, Text, Icon } from "zmp-ui";

function ProgressReportsSummary({ progressReports, onDeleteReport, onPreviewImage }) {
  if (progressReports.length === 0) return null;

  return (
    <Box className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 mb-4">
      <Box className="flex items-center justify-between mb-3">
        <Text className="font-bold text-gray-900 flex items-center">
          <Icon icon="zi-gallery" className="mr-2 text-blue-600" size={16} />
          Ảnh Báo Cáo ({progressReports.length})
        </Text>
        <Text className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded font-semibold">
          Sẵn sàng gửi
        </Text>
      </Box>

      <Box className="space-y-2 max-h-80 overflow-y-auto">
        {progressReports.map((report, index) => (
          <Box
            key={report.id}
            className="p-2 bg-gray-50 rounded-lg border border-gray-200 hover:border-blue-300 transition-colors"
          >
            <Box className="flex items-start justify-between gap-2 mb-2">
              <Box className="flex-1">
                <Box className="flex items-center gap-2 mb-0.5">
                  <Text className="text-xs font-semibold text-gray-900">
                    #{index + 1} - {report.stageName}
                  </Text>
                  {report.duringCount && (
                    <Text className="text-xs px-1.5 py-0.5 bg-amber-100 text-amber-800 rounded">
                      Lần {report.duringCount}
                    </Text>
                  )}
                </Box>
                <Text className="text-xs text-gray-600">
                  {report.timestamp}
                  {report.notes && ` • ${report.notes}`}
                </Text>
              </Box>
              <button
                onClick={() => onDeleteReport(report.id)}
                className="text-gray-400 hover:text-red-600 p-1 flex-shrink-0"
              >
                <Icon icon="zi-close" size={14} />
              </button>
            </Box>

            <Box
              className="relative aspect-square rounded-lg overflow-hidden bg-gray-200 border border-gray-300 cursor-pointer hover:opacity-80 transition-opacity"
              onClick={() => onPreviewImage(report)}
            >
              <img src={report.photo} alt={report.stageName} className="w-full h-full object-cover" />
              <Box className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 bg-black/30 transition-opacity">
                <Icon icon="zi-expand" className="text-white" size={24} />
              </Box>
            </Box>
          </Box>
        ))}
      </Box>
    </Box>
  );
}

export default ProgressReportsSummary;
