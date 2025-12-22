import { Box, Button, Icon } from "zmp-ui";

function ActionButtons({ capturedPhoto, onCapturePhoto, onSubmitCheckIn, onRetakePhoto, onCancel, submitting = false }) {
  return (
    <Box className="space-y-2">
      {!capturedPhoto ? (
        <>
          <Button
            variant="primary"
            fullWidth
            onClick={onCapturePhoto}
            className="py-3 rounded-lg font-semibold text-base bg-blue-600 hover:bg-blue-700 flex items-center justify-center gap-2"
          >
            <Icon icon="zi-camera" size={16} />
            Chụp Ảnh
          </Button>
          <button
            onClick={onCancel}
            className="w-full px-3 py-3 bg-gray-200 text-gray-800 rounded-lg text-sm font-semibold hover:bg-gray-300 transition-colors"
          >
            Hủy
          </button>
        </>
      ) : (
        <>
          <Button
            variant="primary"
            fullWidth
            onClick={onSubmitCheckIn}
            disabled={submitting}
            className="py-3 rounded-lg font-semibold text-base bg-blue-600 hover:bg-blue-700 flex items-center justify-center gap-2"
          >
            <Icon icon={submitting ? "zi-loading" : "zi-check-circle"} size={16} />
            {submitting ? "Đang gửi..." : "Xác Nhận Chấm Công"}
          </Button>
          <button
            onClick={onRetakePhoto}
            className="w-full px-3 py-3 bg-blue-200 text-blue-800 rounded-lg text-sm font-semibold hover:bg-blue-300 transition-colors"
          >
            Chụp Lại
          </button>
          <button
            onClick={onCancel}
            className="w-full px-3 py-3 bg-gray-200 text-gray-800 rounded-lg text-sm font-semibold hover:bg-gray-300 transition-colors"
          >
            Hủy
          </button>
        </>
      )}
    </Box>
  );
}

export default ActionButtons;
