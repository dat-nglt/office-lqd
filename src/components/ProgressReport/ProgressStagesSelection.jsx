import { Box, Text, Icon } from "zmp-ui";

function ProgressStagesSelection({ progressStages, selectedStage, progressReports, onSelectStage }) {
  return (
    <Box className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 mb-4">
      <Text className="font-bold text-gray-900 mb-3 flex items-center">
        <Icon icon="zi-camera" className="mr-2 text-blue-600" size={16} />
        Chụp Ảnh Báo Cáo Tiến Độ
      </Text>

      <Box className="grid grid-cols-1 gap-2">
        {progressStages.map((stage) => {
          const stageReports = progressReports.filter((r) => r.stageId === stage.id);
          const isCompleted = stageReports.length > 0;

          return (
            <button
              key={stage.id}
              onClick={() => onSelectStage(stage.id)}
              className={`p-3 rounded-lg border-2 transition-all text-left ${
                selectedStage === stage.id
                  ? `border-2 border-blue-600 bg-blue-50`
                  : `border-gray-200 ${stage.bgColor} hover:border-blue-300`
              }`}
            >
              <Box className="flex items-center space-x-3">
                <Box
                  className={`w-10 h-10 rounded-full bg-gradient-to-br ${stage.color} flex items-center justify-center text-white shadow-md relative`}
                >
                  <Icon icon={stage.icon} size={18} />
                  {isCompleted && (
                    <Box className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
                      <Icon icon="zi-check" size={10} className="text-white" />
                    </Box>
                  )}
                </Box>
                <Box className="flex-1">
                  <Text className="font-semibold text-gray-900 text-sm">{stage.name}</Text>
                  <Text className="text-xs text-gray-600">{stage.description}</Text>
                </Box>
                {stageReports.length > 0 && (
                  <Box className={`text-xs px-2 py-1 rounded font-semibold ${stage.badgeColor}`}>
                    {stageReports.length}
                    {stage.id === "during" ? "+" : ""}
                  </Box>
                )}
              </Box>
            </button>
          );
        })}
      </Box>
    </Box>
  );
}

export default ProgressStagesSelection;
