import { Box, Button, Icon, Text } from "zmp-ui";
import { getPriorityColor, getPriorityLabel, getStatusColor, getStatusLabel } from "../hooks/useLabelColor";

function JobListItem({ job, onStartWork, onProgressReport, onShowDetail, sx = "" }) {
  return (
    <Box className={`p-4 hover:bg-gray-50 transition-colors ${sx}`}>
      {/* Job Header */}
      <Box className="flex items-start justify-between gap-2 mb-2">
        <Box className="flex-1">
          <Box className="flex items-center gap-2 mb-1">
            <Text className="font-semibold text-gray-900 line-clamp-2">{job.title}</Text>
          </Box>
          <Text className="text-xs text-gray-600">{job.company}</Text>
        </Box>
        <Box className={`text-xs font-semibold ${getStatusColor(job.status)}`}>{getStatusLabel(job.status)}</Box>
      </Box>

      {/* Service & Equipment Info */}
      <Box className="mb-2">
        <Box className="flex flex-wrap gap-2 mb-2">
          <Box className="text-xs px-2 py-1 bg-gray-100 rounded text-gray-700 font-medium">{job.serviceType}</Box>
          <Box className="text-xs px-2 py-1 bg-gray-100 rounded text-gray-700 font-medium">{job.equipment}</Box>
        </Box>
      </Box>

      {/* Scheduled Time */}
      <Box className="mb-2 flex items-center gap-2">
        <Icon icon="zi-clock-1" className="text-gray-400" size={14} />
        <Text className="text-sm font-semibold text-gray-700">{job.scheduledTime}</Text>
        <Box className={`text-xs p-1 rounded font-medium ${getPriorityColor(job.priority)}`}>
          Ưu tiên: {getPriorityLabel(job.priority)}
        </Box>
      </Box>

      {/* Customer Info */}
      <Box className="mb-2 flex items-center gap-2">
        <Icon icon="zi-user" className="text-gray-400" size={14} />
        <Text className="text-xs text-gray-600">
          <span className="font-semibold">{job.customerName}</span> • {job.phoneNumber}
        </Text>
      </Box>

      {/* Location */}
      <Box className="mb-2 flex items-start gap-2">
        <Icon icon="zi-location" className="text-red-500 mt-0.5 flex-shrink-0" size={14} />
        <Text className="text-xs text-gray-600">{job.location}</Text>
      </Box>

      {/* Notes */}
      {job.content && (
        <Box className="p-2 bg-blue-50 rounded border border-blue-200 mb-2">
          <Text className="text-xs text-blue-800">
            <span className="font-semibold">Nội dung:</span> {job.content}
          </Text>
        </Box>
      )}

      {job.notes && (
        <Box className="p-2 bg-yellow-50 rounded border border-yellow-200 mb-2">
          <Text className="text-xs text-yellow-800">
            <span className="font-semibold">Ghi chú:</span> {job.notes}
          </Text>
        </Box>
      )}

      {/* Action Buttons */}
      <Box className="flex gap-2 flex-col">
        <Box className="flex gap-2 mt-3">
          {job.assignedStatus === "pending" && (
            <Button
              size="small"
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs"
              onClick={() => onStartWork(job)}
            >
              <Icon icon="zi-send-solid" size={12} className="mr-1" />
              Bắt đầu
            </Button>
          )}
          {job.assignedStatus === "in_progress" && (
            <>
              <Button
                size="small"
                className="flex-1 bg-green-600 hover:bg-green-700 text-white rounded text-xs"
                onClick={() => onProgressReport(job)}
              >
                <Icon icon="zi-camera" size={12} className="mr-1" />
                Báo cáo
              </Button>
            </>
          )}
          {job.assignedStatus === "in_progress" && (
            <>
              <Button
                size="small"
                className="flex-1 bg-orange-600 hover:bg-orange-700 text-white rounded text-xs"
                onClick={() => onStartWork(job)}
              >
                <Icon icon="zi-leave" size={12} className="mr-1" />
                Kết thúc
              </Button>
            </>
          )}
          <Button
            size="small"
            className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded text-xs"
            onClick={() => onShowDetail(job)}
          >
            <Icon icon="zi-info-circle" size={12} className="mr-1" />
            Chi tiết
          </Button>
        </Box>
      </Box>
    </Box>
  );
}

export default JobListItem;
