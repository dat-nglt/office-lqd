import { Box, Text, Icon } from "zmp-ui";

function SubmittedReportsHistory({ submittedReports, onPreviewImage }) {
  if (submittedReports.length === 0) return null;

  return (
    <Box className="mt-6 bg-white rounded-xl p-4 shadow-sm border border-gray-100">
      <Text className="font-bold text-gray-900 mb-3 flex items-center">
        <Icon icon="zi-gallery" className="mr-2 text-green-600" size={16} />
        Báo Cáo Đã Gửi ({submittedReports.length})
      </Text>

      <Box className="space-y-4">
        {submittedReports.map((submission) => (
          <Box key={submission.id} className="pb-4 border-b border-gray-200 last:border-b-0">
            {/* Submission Header */}
            <Box className="flex items-start justify-between mb-2">
              <Box className="flex-1">
                <Text className="text-sm font-semibold text-gray-900">
                  {submission.submittedDate} • {submission.submittedTime}
                </Text>
                <Text className="text-xs text-gray-600 mt-0.5">
                  {submission.totalPhotos} ảnh • {submission.workTitle}
                </Text>
              </Box>
              <Box className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded font-semibold flex-shrink-0">
                ✓ Đã gửi
              </Box>
            </Box>

            {/* Submitted Images Grid */}
            <Box className="grid grid-cols-3 gap-2 mt-2">
              {submission.reports.map((report) => (
                <Box
                  key={report.id}
                  className="relative aspect-square rounded-lg overflow-hidden bg-gray-200 border border-gray-300 cursor-pointer hover:opacity-80 transition-opacity group"
                  onClick={() => onPreviewImage(report)}
                >
                  <img src={report.photo} alt={report.stageName} className="w-full h-full object-cover" />
                  <Box className="absolute inset-0 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 bg-black/40 transition-opacity">
                    <Icon icon="zi-expand" className="text-white mb-1" size={18} />
                    <Text className="text-xs text-white font-semibold text-center px-1">
                      {report.stageName}
                    </Text>
                  </Box>
                </Box>
              ))}
            </Box>

            {/* Submission Details */}
            <Box className="mt-2 text-xs text-gray-600 space-y-1">
              <Text>
                <span className="font-semibold">Công việc:</span> {submission.workTitle}
              </Text>
              <Text>
                <span className="font-semibold">Công ty:</span> {submission.workCompany}
              </Text>
              <Text>
                <span className="font-semibold">Tổng ảnh:</span> {submission.totalPhotos}
              </Text>
            </Box>
          </Box>
        ))}
      </Box>
    </Box>
  );
}

export default SubmittedReportsHistory;
