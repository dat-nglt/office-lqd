import { Box, Page, Text, Button, Icon } from "zmp-ui";
import { useNavigate, useSearchParams } from "react-router-dom";
import BottomNavigation from "../components/BottomNavigation";
import CheckInHeader from "../components/checkin/CheckInHeader";

// ============================================================================
// GUIDE CONFIGURATION - THÊM HƯỚNG DẪN MỚI TẠI ĐÂY
// ============================================================================
export const GUIDES_CONFIG = {
  coordinates: {
    id: "coordinates",
    title: "Cách lấy tọa độ địa điểm",
    subtitle: "Hướng dẫn nhanh từ Google Maps",
    description: "Tìm hiểu cách lấy tọa độ chính xác từ Google Maps cho công việc của bạn",
    icon: "zi-location",
    color: "green",
    badge: "Cơ bản",
    customRules: null,
    steps: [
      {
        number: 1,
        title: "Mở Google Maps",
        description: "Truy cập google.com/maps hoặc mở ứng dụng trên điện thoại",
      },
      {
        number: 2,
        title: "Tìm kiếm địa điểm",
        description: "Nhập tên công trình hoặc địa chỉ vào ô tìm kiếm",
      },
      {
        number: 3,
        title: "Xem tọa độ",
        description: "Nhấn vào địa điểm, cuộn xuống sẽ thấy tọa độ",
      },
      {
        number: 4,
        title: "Sao chép & dán",
        description: "Sao chép tọa độ, quay lại form báo cáo và dán vào các trường Vĩ độ, Kinh độ",
      },
    ],
    tips: "Sử dụng Google Maps trên Laptop hoặc PC để xác định tọa độ chính xác hơn cho công việc.",
  },
  checkin: {
    id: "checkin",
    title: "Hướng dẫn chấm công",
    subtitle: "Quy trình chấm công từng bước",
    description: "Hướng dẫn chi tiết cách thực hiện chấm công hàng ngày",
    icon: "zi-camera",
    color: "blue",
    badge: "Quan trọng",
    customRules: "ImportantRules",
    steps: [
      {
        number: 1,
        title: "Chọn ca chấm công",
        description:
          "Trên màn hình chính, chọn ca làm việc phù hợp với thời gian hiện tại. Hệ thống sẽ lọc các ca đang hoạt động.",
        example: "Ca sáng: 8:00 - 17:00, Ca chiều: 13:00 - 22:00, Ca đêm: 22:00 - 6:00 sáng hôm sau",
      },
      {
        number: 2,
        title: "Kiểm tra điều kiện chấm công",
        description:
          "Hệ thống tự động kiểm tra: công việc được giao hôm nay, chưa chấm công lần này, và nếu là tăng ca thì phải có yêu cầu được phê duyệt",
        example: "Tăng ca trưa/tối: cần yêu cầu tăng ca được phê duyệt trước đó",
      },
      {
        number: 3,
        title: "Lấy vị trí hiện tại",
        description:
          "Nhấn nút 'Lấy vị trí' để hệ thống xác định vị trí GPS của bạn. Điều này rất quan trọng để kiểm tra tính hợp lệ.",
        example: "Bật GPS trên điện thoại. Hệ thống sẽ hiển thị: vị trí, tọa độ, và phạm vi cho phép (±150m)",
      },
      {
        number: 4,
        title: "Chọn địa điểm chấm công",
        description:
          "Hệ thống tự động gợi ý công việc gần nhất, hoặc bạn có thể chọn thủ công từ danh sách công việc được giao hôm nay. Có thể chấm tại kho vật tư, văn phòng hoặc địa điểm công trường",
        example: "Phạm vi hợp lệ: 150m từ vị trí công việc. Nếu quá 150m sẽ bị cảnh báo 'VI PHẠM' màu đỏ",
      },
      {
        number: 5,
        title: "Chọn chế độ chấm công",
        description: "Chọn 'Chấm vào' (Check In) để bắt đầu làm việc hoặc 'Chấm ra' (Check Out) để kết thúc",
        example: "QUY TẮC: Bạn phải 'Chấm vào' trước. Không thể 'Chấm ra' nếu chưa 'Chấm vào'",
      },
      {
        number: 6,
        title: "Chụp ảnh xác thực",
        description:
          "Camera mở tự động. Chụp ảnh chân dung (Selfie) với khuôn mặt rõ ràng. Nếu không đạt, nhấn 'Chụp lại'.",
        example: "Điều kiện tốt: ánh sáng đủ, khuôn mặt chiếm 70% ảnh, cả hai mắt mở",
      },
      {
        number: 7,
        title: "Kiểm tra thông tin trước xác nhận",
        description:
          "Xem lại tất cả dữ liệu trước khi gửi: thời gian chấm công, vị trí, tọa độ, loại ca, ảnh chụp, và khoảng cách",
        example: "Nếu vi phạm vị trí, sẽ hiển thị mục 'Khoảng cách vi phạm' với thông báo màu đỏ",
      },
      {
        number: 8,
        title: "Nhập ghi chú (nếu cần)",
        description: "Tùy chọn: Nhập ghi chú về chấm công (ví dụ: lý do trễ, sự cố, vv). Giới hạn 500 ký tự.",
        example: "VD: 'Chấm công trễ do kẹt xe', 'Chấm công tại kho vật tư thay vì công trình'",
      },
      {
        number: 9,
        title: "Xác nhận chấm công",
        description: "Nhấn nút 'Xác nhận' để gửi dữ liệu chấm công lên server IMS. Hệ thống sẽ xử lý dữ liệu.",
        example: "Sau khi xác nhận, sẽ có thông báo thành công hoặc lỗi",
      },
      {
        number: 10,
        title: "Hệ thống xử lý tự động",
        description:
          "Hệ thống sẽ: tính thời lượng làm việc, kiểm tra hoàn thành sớm, cập nhật trạng thái công việc, gửi thông báo cho quản lý",
        example: "Nếu hoàn thành sớm: yêu cầu phê duyệt gửi đến quản lý, nếu đó là công việc duy nhất",
      },
      {
        number: 11,
        title: "Kiểm tra lịch sử chấm công",
        description:
          "Lịch sử chấm công hôm nay hiển thị dưới danh sách, ghi lại tất cả chấm vào/ra: thời gian, vị trí, tọa độ, ảnh, trạng thái",
        example: "Bạn có thể xem lại chi tiết mỗi lần chấm công để kiểm tra tính chính xác",
      },
      {
        number: 12,
        title: "Thực hiện công việc tiếp theo",
        description:
          "Nếu hoàn thành công việc trước hết giờ ca, bạn có thể chấm ra công việc đó rồi chấm vào công việc khác trong cùng ca làm việc (vẫn cùng phiên). Không cần phải chấm vào ca mới.",
        example:
          "Ví dụ: Ca sáng, bạn làm công việc A (chấm vào 8:00), hoàn thành 10:00 (chấm ra), rồi làm công việc B (chấm vào 10:05, chấm ra 17:00)",
      },
    ],
  },
  // TEMPLATE - Uncomment và chỉnh sửa để thêm hướng dẫn mới
  // newGuide: {
  //   id: "newGuide",
  //   title: "Tiêu đề hướng dẫn",
  //   subtitle: "Phụ đề mô tả",
  //   description: "Mô tả chi tiết hướng dẫn",
  //   icon: "zi-[icon-name]",
  //   color: "purple",
  //   badge: "Mới",
  //   customRules: null,
  //   steps: [...],
  //   tips: "Lời khuyên chính",
  // },
};

// ============================================================================
// COLOR MAPPING
// ============================================================================
const COLOR_CLASSES = {
  green: "from-green-600 to-green-500",
  blue: "from-blue-600 to-blue-500",
  purple: "from-purple-600 to-purple-500",
  orange: "from-orange-600 to-orange-500",
  red: "from-red-600 to-red-500",
  pink: "from-pink-600 to-pink-500",
};

// ============================================================================
// UI COMPONENTS
// ============================================================================

/**
 * Hiển thị một bước hướng dẫn
 */
const GuideStep = ({ number, title, description, example }) => (
  <Box className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
    <Box className="flex items-center gap-3">
      <Box className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
        <Text className="text-white font-bold text-sm">{number}</Text>
      </Box>
      <Box className="flex-1">
        <Text className="font-semibold text-gray-900">{title}</Text>
        <Text className="text-xs text-gray-600 mt-1">{description}</Text>
        {example && (
          <Box className="mt-2 p-2 bg-blue-50 rounded border border-blue-200">
            <Text className="text-xs text-blue-700">
              <strong>
                {example.includes("VD:") || example.includes("Dạng:") || example.includes(":")
                  ? example.split(":")[0] + ":"
                  : "Ví dụ:"}
              </strong>{" "}
              {example.includes(":") ? example.split(":")[1] : example}
            </Text>
          </Box>
        )}
      </Box>
    </Box>
  </Box>
);

/**
 * Quy tắc quan trọng cho chấm công
 */
const ImportantRules = () => (
  <Box className="space-y-3 mb-6">
    <Box className="bg-red-50 border-l-4 border-red-500 rounded p-4">
      <Box className="space-y-2  text-red-800">
        <Text className="text-xs">
          <strong>Địa điểm chấm công:</strong> Có thể chấm tại kho, văn phòng, hoặc địa điểm làm việc được giao
        </Text>
        <Text className="text-xs">
          <strong>Tăng ca:</strong> Chỉ được chấm công tăng ca khi có yêu cầu tăng ca được phê duyệt từ quản lý
        </Text>
        <Text className="text-xs">
          <strong>Một ca - Một phiên:</strong> Chỉ được thực hiện chấm công trên một phiên cho một ca làm việc. Tuy
          nhiên, khi hoàn thành công việc, bạn có thể chấm ra và chấm vào công việc khác trong cùng ca làm việc
        </Text>
        <Text className="text-xs">
          <strong>Thời gian ghi nhận:</strong> Thời gian chấm công được lấy từ máy chủ IMS, KHÔNG bị ảnh hưởng bởi giờ
          trên thiết bị của bạn. Do đó, điều chỉnh giờ trên điện thoại sẽ được hệ thống ghi nhận
        </Text>
      </Box>
    </Box>
  </Box>
);

/**
 * Card hướng dẫn trong danh sách lựa chọn
 */
const GuideCard = ({ guide, onSelect }) => {
  const iconColorMap = {
    green: "text-green-600",
    blue: "text-blue-600",
    purple: "text-purple-600",
    orange: "text-orange-600",
    red: "text-red-600",
    pink: "text-pink-600",
  };

  const bgColorMap = {
    green: "bg-green-100",
    blue: "bg-blue-100",
    purple: "bg-purple-100",
    orange: "bg-orange-100",
    red: "bg-red-100",
    pink: "bg-pink-100",
  };

  return (
    <button
      onClick={onSelect}
      className="w-full bg-white rounded-xl p-4 border-2 border-gray-200 hover:border-blue-500 hover:shadow-lg transition-all text-left"
    >
      <Box className="flex items-center justify-between">
        <Box className="flex items-center gap-3 flex-1">
          <Box
            className={`w-12 h-12 ${bgColorMap[guide.color]} rounded-lg flex items-center justify-center flex-shrink-0`}
          >
            <Icon icon={guide.icon} size={24} className={iconColorMap[guide.color]} />
          </Box>
          <Box className="flex-1 min-w-0">
            <Box className="flex items-center gap-2">
              <Text className="font-bold text-gray-600">{guide.title}</Text>
            </Box>
            <Text className="text-xs text-gray-600 mt-1">{guide.description}</Text>
          </Box>
        </Box>
        <Icon icon="zi-arrow-right" size={20} className="text-gray-400 flex-shrink-0 ml-2" />
      </Box>
    </button>
  );
};

/**
 * Trang chọn hướng dẫn
 */
function GuideSelector() {
  const navigate = useNavigate();
  const guidesList = Object.values(GUIDES_CONFIG);

  return (
    <Page className="bg-gray-50 min-h-screen pb-20">
      <CheckInHeader title={"Trợ Giúp & Hướng Dẫn"} />
      <Box className="px-4 py-10">
        {/* Header */}

        {/* Guide List */}
        <Box className="space-y-3 mb-8">
          {guidesList.map((guide) => (
            <GuideCard key={guide.id} guide={guide} onSelect={() => navigate(`/coordinates-guide?type=${guide.id}`)} />
          ))}
        </Box>

        {/* Info Box */}
        <Box className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <Text className="text-xs text-blue-800 font-medium flex gap-2">
            <Icon icon="zi-info" size={14} />
            <span>💡 Có {guidesList.length} hướng dẫn có sẵn. Nhấn vào một hướng dẫn để xem chi tiết từng bước.</span>
          </Text>
        </Box>
      </Box>

      <BottomNavigation />
    </Page>
  );
}

/**
 * Trang xem chi tiết hướng dẫn
 */
function GuideDetailView({ guide, guideType }) {
  const navigate = useNavigate();
  const colorGradient = COLOR_CLASSES[guide.color] || COLOR_CLASSES.blue;
  const needsCustomRules = guide.customRules === "ImportantRules";

  return (
    <Page className="bg-gray-50 min-h-screen pb-20">
      <Box className="px-4 pt-6 pb-10">
        {/* Header (styled like Attendance) */}
        <CheckInHeader title={guide.title} />
        <Box className="px-4 pt-3 pb-2">
          <Text className="text-gray-600 text-sm">{guide.subtitle}</Text>
        </Box>

        {/* Custom Rules Section */}
        {needsCustomRules && <ImportantRules />}

        {/* Steps Section */}
        <Box className="mb-6">
          <Text className="font-semibold text-gray-900 mb-3 text-sm">Các bước thực hiện</Text>
          <Box className="space-y-3">
            {guide.steps.map((step) => (
              <GuideStep
                key={step.number}
                number={step.number}
                title={step.title}
                description={step.description}
                example={step.example}
              />
            ))}
          </Box>
        </Box>

        {/* Tips Section */}
        {guide.tips && (
          <Box className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-6">
            <Text className="text-xs text-amber-800 font-medium flex gap-2">
              <Icon icon="zi-bulb" size={14} />
              {guide.tips}
            </Text>
          </Box>
        )}

        {/* Navigation Buttons */}
        <Box className="space-y-3">
          {guideType !== "coordinates" && (
            <Button
              fullWidth
              onClick={() => navigate("/coordinates-guide")}
              className="px-4 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg text-sm font-semibold transition-colors flex items-center justify-center gap-2"
            >
              <Icon icon="zi-home" size={16} />
              Chọn Hướng Dẫn Khác
            </Button>
          )}

          <Button
            fullWidth
            onClick={() => navigate(-1)}
            className="px-4 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg text-sm font-semibold transition-colors flex items-center justify-center gap-2"
          >
            <Icon icon="zi-arrow-left" size={16} />
            Quay lại
          </Button>
        </Box>
      </Box>

      <BottomNavigation />
    </Page>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================
function CoordinatesGuide() {
  const [searchParams] = useSearchParams();
  const guideType = searchParams.get("type");
  const guide = GUIDES_CONFIG[guideType];

  // Nếu không có type hoặc type không hợp lệ, hiển thị trang chọn hướng dẫn
  if (!guide) {
    return <GuideSelector />;
  }

  // Hiển thị chi tiết hướng dẫn
  return <GuideDetailView guide={guide} guideType={guideType} />;
}

export default CoordinatesGuide;
