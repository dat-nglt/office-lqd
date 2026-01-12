# 🚀 Cloudinary Upload - Quick Start Guide

## ✅ Đã Cài Đặt

### 📁 Files Tạo Mới:
1. **`src/services/progress-report-upload.service.js`**
   - Upload image service
   - Image validation
   - Compression

2. **`src/hooks/useProgressReportUpload.js`**
   - React hook cho upload state
   - Progress tracking

3. **`CLOUDINARY_UPLOAD_GUIDE.md`**
   - Detailed documentation

### ✏️ Files Sửa Đổi:
1. **`src/components/ProgressReport/CameraView.jsx`**
   - Added upload button
   - Upload progress UI
   - Props: `reportId`, `technicianName`, `onUploadProgress`

---

## 🎯 Dữ Liệu Từ Album → Cloudinary

### Input (Album Selection):
```
Base64: "data:image/jpeg;base64,/9j/4AAQSkZJRg..."
Hoặc
Blob URL: "blob:https://..."
```

### Process:
```
Validate (format + size)
    ↓
Compress (if > 1MB)
    ↓
Get Signature (from server)
    ↓
Upload (POST to Cloudinary)
```

### Output (Cloudinary):
```javascript
{
  secureUrl: "https://res.cloudinary.com/ims-xxx/image/upload/...",
  publicId: "progress-reports/john-doe/report-123/before",
  metadata: {
    uploadDuration: "1234ms",
    blobSize: 245678,
    compressedSize: 125000,
    cloudinary: {
      width: 1920,
      height: 1080,
      format: "jpeg"
    }
  }
}
```

---

## 💻 Usage

### 1. CameraView Component
```jsx
<CameraView
  {...props}
  reportId="report-123"
  technicianName="john-doe"
  onUploadProgress={(status) => {
    if (status.status === "success") {
      console.log("URL:", status.result.secureUrl);
    }
  }}
/>
```

### 2. Upload Hook
```jsx
const { 
  isUploading, 
  progress,
  uploadImage,
} = useProgressReportUpload();

const result = await uploadImage(base64Data, {
  reportId: "123",
  stage: "before",
  technicianName: "john-doe",
});
```

### 3. Service Function
```javascript
import { uploadProgressReportImage } from "../services/progress-report-upload.service";

const result = await uploadProgressReportImage(imageData, {
  reportId: "report-123",
  stage: "during",
  technicianName: "tech-name",
  compressImage: true,
});
```

---

## 🔍 Debug

Set in `progress-report-upload.service.js`:
```javascript
const DEBUG = true;  // See detailed logs
```

Console output:
```
[ProgressReportUpload] Upload started: {...}
[ProgressReportUpload] Blob created: {...}
[ProgressReportUpload] Getting Cloudinary signature: {...}
[ProgressReportUpload] Uploading to Cloudinary: {...}
[ProgressReportUpload] Upload completed: {...}
```

---

## 📦 Folder Structure in Cloudinary

```
progress-reports/
└─ {technicianName}/
   └─ {reportId}/
      ├─ before/
      ├─ during/
      ├─ after/
      └─ progress/
```

Example: `progress-reports/john-doe/report-123/before/image.jpg`

---

## ⚙️ Requirements

✅ Project setup:
- [x] Cloudinary credentials in `.env`
  - `CLOUDINARY_CLOUD_NAME`
  - `CLOUDINARY_API_KEY`
  - `CLOUDINARY_API_SECRET`
- [x] Server endpoint: `POST /api/uploads/cloudinary/sign`
- [x] Upload service already exists

---

## 🎯 Features

- ✅ Upload from album (base64/blob URL)
- ✅ Image validation (format, size)
- ✅ Auto compression (> 1MB)
- ✅ Progress tracking
- ✅ Error handling
- ✅ Batch upload
- ✅ Signed uploads (secure)
- ✅ Debug logging
- ✅ TypeScript-friendly

---

## 🔗 Related Files

- [CLOUDINARY_UPLOAD_GUIDE.md](./CLOUDINARY_UPLOAD_GUIDE.md) - Full documentation
- [OPTIMIZATION_SUMMARY.md](./OPTIMIZATION_SUMMARY.md) - Component optimization
- [CAMERA_VIEW_OPTIMIZATION.md](./src/components/ProgressReport/CAMERA_VIEW_OPTIMIZATION.md) - CameraView changes

---

## 📊 Data Formats Supported

- ✅ JPEG
- ✅ PNG
- ✅ WebP
- ❌ GIF (compressed to JPEG)

Max size: 10MB per image

---

## 🎓 Complete Example

```javascript
// Parent Component (ProgressReport)
import CameraView from "./CameraView";

function ProgressReport() {
  const [uploadedImages, setUploadedImages] = useState({});

  const handleUploadProgress = (status) => {
    console.log("Upload status:", status);
    
    if (status.status === "success") {
      setUploadedImages(prev => ({
        ...prev,
        [status.result.metadata.stage]: {
          url: status.result.secureUrl,
          publicId: status.result.publicId,
          metadata: status.result.metadata,
        }
      }));
    }
  };

  const handleSaveReport = async () => {
    // Save report with uploaded images
    const payload = {
      work_id: 123,
      before_image: uploadedImages.before?.url,
      during_image: uploadedImages.during?.url,
      after_image: uploadedImages.after?.url,
      progress_image: uploadedImages.progress?.url,
      // Include metadata for reference
      image_metadata: uploadedImages,
    };

    await saveProgressReport(payload);
  };

  return (
    <CameraView
      videoRef={videoRef}
      canvasRef={canvasRef}
      capturedPhoto={photo}
      selectedStage="before"
      progressNotes={notes}
      progressStages={stages}
      onCapturePhoto={handleCapture}
      onRetakePhoto={handleRetake}
      onProgressNotesChange={setNotes}
      onSaveReport={handleSaveReport}
      onCancel={handleCancel}
      onImageSelected={setPhoto}
      
      // New props for Cloudinary
      reportId="report-123"
      technicianName="john-doe"
      onUploadProgress={handleUploadProgress}
    />
  );
}
```

---

## ✨ Summary

**Có thể upload lên Cloudinary không?** ✅ **CÓ!**

Dữ liệu từ album (base64/blob URL) → Validate → Compress → Upload Cloudinary

- Đã setup xong
- Có UI button "Cloud" trong CameraView
- Hỗ trợ progress tracking
- Auto compression nếu cần
- Secure upload (signed)
- Full debug logging

**Bắt đầu sử dụng:** Thêm 3 props vào CameraView component! 🚀
