import { Box } from "zmp-ui";

function CameraView({ capturedPhoto, videoRef, canvasRef }) {
  return (
    <Box className="mb-4 relative">
      <Box className="relative w-full aspect-square rounded-2xl overflow-hidden border-4 border-blue-600 shadow-lg bg-black">
        {!capturedPhoto ? (
          <>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              className="w-full h-full object-cover -scale-x-100"
            />
            {/* Grid overlay */}
            <Box className="absolute inset-0 pointer-events-none">
              <Box className="absolute inset-0 border-2 border-white/30 opacity-50">
                <Box className="absolute top-1/3 left-0 right-0 border-t border-white/30"></Box>
                <Box className="absolute top-2/3 left-0 right-0 border-t border-white/30"></Box>
                <Box className="absolute left-1/3 top-0 bottom-0 border-l border-white/30"></Box>
                <Box className="absolute left-2/3 top-0 bottom-0 border-l border-white/30"></Box>
              </Box>
              {/* Center circle indicator */}
              <Box className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-60 h-60 border-2 border-blue-400 rounded-lg"></Box>
            </Box>
          </>
        ) : (
          <img
            src={capturedPhoto}
            alt="Captured"
            className="w-full h-full object-cover"
          />
        )}
      </Box>
      <canvas ref={canvasRef} className="hidden" />
    </Box>
  );
}

export default CameraView;
