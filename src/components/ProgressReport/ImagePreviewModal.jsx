import { Box, Text, Icon } from "zmp-ui";

function ImagePreviewModal({ showPreview, previewImage, previewReport, onClose }) {
  if (!showPreview || !previewImage) return null;

  return (
    <Box className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
      <Box className="relative max-w-2xl w-full max-h-96">
        <Box className="relative aspect-square rounded-lg overflow-hidden bg-gray-900">
          <img src={previewImage} alt="Preview" className="w-full h-full object-contain" />
        </Box>

        {/* Preview Info */}
        {previewReport && (
          <Box className="mt-3 bg-white rounded-lg p-3 shadow-lg">
            <Text className="text-xs font-semibold text-gray-900 mb-1">{previewReport.stageName}</Text>
            <Text className="text-xs text-gray-600 mb-1">{previewReport.timestamp}</Text>
            {previewReport.notes && (
              <Text className="text-xs text-gray-700">
                <span className="font-semibold">Ghi chú:</span> {previewReport.notes}
              </Text>
            )}
          </Box>
        )}

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute -top-10 right-0 text-white hover:text-gray-300 transition-colors"
        >
          <Icon icon="zi-close" size={24} />
        </button>
      </Box>
    </Box>
  );
}

export default ImagePreviewModal;
