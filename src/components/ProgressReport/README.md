# Hướng Dẫn Tính Năng Chọn Ảnh - Báo Cáo Tiến Độ

## Tổng Quan

Tính năng báo cáo tiến độ giờ đây hỗ trợ **ba cách** để chọn ảnh:

1. **Chụp ảnh bằng camera trực tiếp** - Sử dụng HTML5 getUserMedia API
2. **Chọn ảnh từ thiết bị** - Sử dụng Zalo Mini App `chooseImage` API
3. **Chọn từ album** - Sử dụng Zalo Mini App album picker

## Kiến Trúc Component

### Thư Mục Cấu Trúc
```
src/
├── components/
│   └── ProgressReport/
│       ├── WorkAssignmentCard.jsx          # Thông tin công việc
│       ├── ProgressStagesSelection.jsx     # Chọn giai đoạn
│       ├── CameraView.jsx                  # Chụp/chọn ảnh
│       ├── ProgressReportsSummary.jsx      # Tóm tắt báo cáo
│       ├── ImagePreviewModal.jsx           # Xem trước ảnh
│       ├── SubmittedReportsHistory.jsx     # Lịch sử gửi
│       └── index.js                        # Export tất cả
├── hooks/
│   └── useZaloImagePicker.js               # Custom hook Zalo image picker
├── utils/
│   └── imageUtils.js                       # Hàm tiện ích ảnh
└── pages/
    └── ProgressReport.jsx                  # Page chính
```

## API Sử Dụng

### 1. chooseImage API (Zalo Mini App SDK)
**Tài Liệu:** https://miniapp.zaloplatforms.com/documents/api/chooseImage/

```javascript
// Import từ zmp-sdk
import { chooseImage } from "zmp-sdk/apis";

// Cách sử dụng
const result = await chooseImage({
  sourceType: ["album", "camera"],  // Nguồn: album, camera, hoặc cả hai
  cameraType: "back",               // Camera trước/sau (nếu sourceType có "camera")
  count: 1                           // Số lượng ảnh tối đa
});

// Result
{
  filePaths: ["file_path"],
  tempFiles: [
    {
      path: "file_path",
      size: 123456
    }
  ]
}
```

## Sử Dụng

### Cách 1: Sử dụng Utility Functions

```javascript
import { 
  selectImageFromDevice, 
  selectImageFromAlbum, 
  capturePhotoWithZaloCamera 
} from "@/utils/imageUtils";

// Chọn từ album hoặc camera
const imagePath = await selectImageFromDevice({
  sourceType: ["album", "camera"],
  count: 1
});

// Chỉ chọn từ album
const albumImage = await selectImageFromAlbum(1);

// Chỉ chụp từ camera
const cameraImage = await capturePhotoWithZaloCamera("back");
```

### Cách 2: Sử dụng Custom Hook

```javascript
import { useZaloImagePicker } from "@/hooks/useZaloImagePicker";

function MyComponent() {
  const { selectImage, selectFromAlbum, captureFromCamera, isLoading } = 
    useZaloImagePicker();

  const handleSelectImage = async () => {
    try {
      const imageDataUrl = await selectImage({
        sourceType: ["album", "camera"]
      });
      // imageDataUrl là base64 data URL, sử dụng trực tiếp trong <img> tag
      console.log(imageDataUrl);
    } catch (error) {
      console.error("Lỗi chọn ảnh:", error);
    }
  };

  return (
    <button onClick={handleSelectImage} disabled={isLoading}>
      {isLoading ? "Đang tải..." : "Chọn Ảnh"}
    </button>
  );
}
```

### Cách 3: Trong CameraView Component

Component `CameraView` đã được cập nhật với nút "Chọn từ Thiết Bị":

```jsx
<CameraView
  videoRef={videoRef}
  canvasRef={canvasRef}
  capturedPhoto={capturedPhoto}
  // ... other props
  onImageSelected={handleImageSelected}  // Callback khi chọn ảnh
/>
```

## Tính Năng

### ✅ CameraView Component
- **Chụp ảnh trực tiếp** - Sử dụng camera thiết bị qua HTML5 API
- **Chọn từ thiết bị** - Mở album hoặc camera thông qua Zalo SDK
- **Xem trước ảnh** - Hiển thị ảnh trước khi lưu
- **Ghi chú** - Thêm ghi chú cho mỗi ảnh
- **Chụp lại** - Chụp hoặc chọn ảnh khác

### ✅ Giao Diện
- **Thân thiện người dùng** - UI rõ ràng, dễ sử dụng
- **Trạng thái loading** - Hiển thị khi đang tải ảnh
- **Xử lý lỗi** - Thông báo lỗi rõ ràng
- **Icon rõ ràng** - Biểu tượng giúp người dùng hiểu chức năng

## Luồng Sử Dụng

1. Người dùng truy cập trang "Báo Cáo Tiến Độ"
2. Chọn giai đoạn (Trước/Trong/Sau)
3. Chọn cách lấy ảnh:
   - **Chụp Ảnh** - Sử dụng camera thiết bị
   - **Chọn từ Thiết Bị** - Chọn ảnh từ album hoặc camera Zalo
4. Thêm ghi chú (tùy chọn)
5. Lưu ảnh báo cáo
6. Lặp lại bước 2-5 cho các giai đoạn khác
7. Gửi báo cáo hoàn chỉnh

## Xử Lý Lỗi

Tất cả các hàm đều có xử lý lỗi tích hợp:

```javascript
try {
  const image = await selectImage({ sourceType: ["album"] });
} catch (error) {
  console.error("Lỗi:", error);
  // Hiển thị thông báo lỗi cho người dùng
  toast?.error({
    title: "Lỗi chọn ảnh",
    message: error.message,
    duration: 2000
  });
}
```

## Yêu Cầu

- **Zalo Mini App SDK** >= 2.23.4
- **Browser hỗ trợ HTML5 Camera API** (cho chức năng chụp trực tiếp)
- **Quyền truy cập camera/album** trên thiết bị

## Ví Dụ Hoàn Chỉnh

```javascript
import { useZaloImagePicker } from "@/hooks/useZaloImagePicker";
import { useState } from "react";

export function ImagePickerExample() {
  const { selectImage, isLoading } = useZaloImagePicker();
  const [selectedImage, setSelectedImage] = useState(null);

  const handlePickImage = async () => {
    try {
      const imageUrl = await selectImage({
        sourceType: ["album", "camera"],
        count: 1
      });
      setSelectedImage(imageUrl);
    } catch (error) {
      console.error("Lỗi:", error);
    }
  };

  return (
    <div>
      <button 
        onClick={handlePickImage} 
        disabled={isLoading}
      >
        {isLoading ? "Đang tải..." : "Chọn Ảnh"}
      </button>
      {selectedImage && (
        <img src={selectedImage} alt="Selected" style={{ width: "200px" }} />
      )}
    </div>
  );
}
```

## Troubleshooting

### "chooseImage is not defined"
**Giải pháp:** Đảm bảo SDK được import: `import { chooseImage } from "zmp-sdk/apis"`

### Ảnh không hiển thị
**Giải pháp:** Kiểm tra xem file path có phải là base64 hoặc blob URL không

### Quyền truy cập camera bị từ chối
**Giải pháp:** Kiểm tra quyền truy cập camera trong cài đặt ứng dụng Zalo

## Tương Lai

- [ ] Hỗ trợ cắt ảnh (crop)
- [ ] Xoay ảnh
- [ ] Lọc ảnh
- [ ] Nén ảnh trước khi gửi
- [ ] Upload ảnh trực tiếp lên server
