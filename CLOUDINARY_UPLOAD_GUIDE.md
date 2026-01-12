# Cloudinary Upload Integration for Progress Report Images

## 📋 Tóm Tắt

Dự án đã được tích hợp khả năng upload ảnh từ album (base64/blob URL) lên Cloudinary. Dữ liệu từ album sẽ được xử lý, validate, tối ưu hóa, và upload lên cloud.

---

## 🏗️ Architecture

```
Album Selection (Base64/Blob URL)
    ↓
CameraView Component
    ↓
convertFilePathToDataUrl()
    ↓
validateProgressReportImage()
    ↓
uploadProgressReportImage()
    ├─ dataUrlToBlob() - Convert base64 → Blob
    ├─ compressImageBlob() - Compress if > 1MB
    ├─ getCloudinarySignature() - Get upload signature
    └─ uploadToCloudinary() - Upload to Cloudinary
    ↓
Cloudinary (Secure URL + Public ID)
```

---

## 📁 Files Created/Modified

### Created:
1. **`src/services/progress-report-upload.service.js`** 📄
   - Core upload logic
   - Image validation
   - Compression
   - Batch upload support

2. **`src/hooks/useProgressReportUpload.js`** 📄
   - React hook for upload state management
   - Progress tracking
   - Error handling

### Modified:
1. **`src/components/ProgressReport/CameraView.jsx`** ✏️
   - Added Cloudinary upload button
   - Upload progress UI
   - Upload error handling

---

## 💻 Usage Example

### 1. Basic Setup in Component

```javascript
import CameraView from "./CameraView";

function ProgressReportPage() {
  const handleUploadProgress = (status) => {
    if (status.status === "success") {
      console.log("Upload successful:", status.result);
      // {
      //   secureUrl: "https://res.cloudinary.com/...",
      //   publicId: "progress-reports/tech/report-1/progress",
      //   metadata: {
      //     uploadDuration: "1234ms",
      //     blobSize: 245678,
      //     cloudinary: { width: 1920, height: 1080, ... }
      //   }
      // }
    } else {
      console.error("Upload failed:", status.error);
    }
  };

  return (
    <CameraView
      videoRef={videoRef}
      canvasRef={canvasRef}
      capturedPhoto={photo}
      selectedStage="progress"
      onUploadProgress={handleUploadProgress}
      reportId="report-123"
      technicianName="john-doe"
      {...otherProps}
    />
  );
}
```

### 2. Using Upload Hook Directly

```javascript
import useProgressReportUpload from "../hooks/useProgressReportUpload";

function MyComponent() {
  const { 
    isUploading, 
    progress, 
    error, 
    uploadImage, 
    uploadMultiple,
    validateImage,
    resetState,
  } = useProgressReportUpload();

  const handleUpload = async () => {
    try {
      const result = await uploadImage(base64Data, {
        reportId: "report-123",
        stage: "before",
        technicianName: "john-doe",
        compressImage: true,
      });
      
      console.log("Uploaded:", result.secureUrl);
    } catch (error) {
      console.error("Upload failed:", error.message);
    }
  };

  return (
    <div>
      <button onClick={handleUpload} disabled={isUploading}>
        Upload ({progress}%)
      </button>
      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
}
```

### 3. Batch Upload Multiple Images

```javascript
const imageDatas = [
  base64Image1,
  base64Image2,
  base64Image3,
];

const results = await uploadMultiple(imageDatas, {
  reportId: "report-123",
  stage: "progress",
  technicianName: "john-doe",
});

// results = [
//   { secureUrl: "...", publicId: "...", metadata: {...} },
//   { secureUrl: "...", publicId: "...", metadata: {...} },
//   { secureUrl: "...", publicId: "...", metadata: {...} },
// ]
```

### 4. Validate Image Before Upload

```javascript
const validation = await validateImage(base64Data, {
  maxSizeInMB: 10,
  allowedFormats: ["image/jpeg", "image/png", "image/webp"],
});

if (!validation.valid) {
  console.error("Validation errors:", validation.errors);
  // ["Image size 15.50MB exceeds maximum 10MB", ...]
} else {
  console.log("Validation passed:", validation.metadata);
  // { size: 1024000, sizeInMB: "1.00", type: "image/jpeg" }
}
```

---

## 📊 API Functions

### `uploadProgressReportImage(imageData, options)`

Upload single image to Cloudinary.

**Parameters:**
```javascript
{
  // Image data (required)
  imageData: "data:image/jpeg;base64,..." or "blob:http://...",
  
  // Options
  options: {
    reportId: "report-123",           // Work report ID
    stage: "before",                  // "before", "during", "after", "progress"
    technicianName: "john-doe",      // Technician name for folder structure
    compressImage: true,              // Compress if > 1MB (default: true)
    maxSizeInMB: 10,                 // Max size validation
  }
}
```

**Returns:**
```javascript
{
  secureUrl: "https://res.cloudinary.com/xxx/image/upload/...",
  publicId: "progress-reports/john-doe/report-123/before",
  metadata: {
    timestamp: "2026-01-12T10:30:45.123Z",
    blobSize: 245678,              // Original size
    compressedSize: 125000,         // After compression
    uploadDuration: "1234ms",
    totalDuration: "2500ms",
    cloudinary: {
      format: "jpeg",
      width: 1920,
      height: 1080,
      bytes: 125000,
    }
  }
}
```

### `uploadMultipleProgressReportImages(imageDatas, options)`

Upload multiple images with progress tracking.

**Parameters:**
```javascript
{
  imageDatas: [base64Image1, base64Image2, ...],  // Array of images
  options: { ... }                                 // Same as above
}
```

**Returns:**
```javascript
[
  { secureUrl, publicId, metadata },
  { secureUrl, publicId, metadata },
  // or error objects for failed uploads:
  { error: "message", index: 0 }
]
```

### `validateProgressReportImage(imageData, options)`

Validate image format and size before upload.

**Parameters:**
```javascript
{
  imageData: "data:image/jpeg;base64,...",
  options: {
    maxSizeInMB: 10,
    allowedFormats: ["image/jpeg", "image/png", "image/webp"]
  }
}
```

**Returns:**
```javascript
{
  valid: true,
  errors: [],
  metadata: {
    size: 1024000,
    sizeInMB: "1.00",
    type: "image/jpeg"
  }
}
```

### `dataUrlToBlob(imageData)`

Convert base64 or blob URL to Blob.

**Parameters:**
```javascript
imageData: "data:image/jpeg;base64,..." or "blob:http://..."
```

**Returns:**
```javascript
Blob {
  size: 1024000,
  type: "image/jpeg"
}
```

### `compressImageBlob(blob, quality)`

Compress image blob using canvas.

**Parameters:**
```javascript
{
  blob: Blob,              // Original blob
  quality: 0.7            // 0-1, default 0.7
}
```

**Returns:**
```javascript
Blob {
  size: 500000,           // Compressed size
  type: "image/jpeg"
}
```

---

## 🎯 Data Flow - Album to Cloudinary

### Step 1: Album Selection
```
User Click "Tải lên" → selectImageFromDevice()
↓
Returns: base64 or blob URL
Dung lượng: 0.5-10MB (thường)
```

### Step 2: Data Conversion
```
Input: "data:image/jpeg;base64,/9j/4AAQSkZJRg..."
↓
convertFilePathToDataUrl()
↓
Output: Same as input or converted format
```

### Step 3: Validation
```
validateProgressReportImage()
├─ Check format: jpeg, png, webp ✓
├─ Check size: ≤ 10MB ✓
└─ Returns: { valid: true, metadata: {...} }
```

### Step 4: Upload
```
dataUrlToBlob() → Blob {size: 245678, type: "image/jpeg"}
↓
Optional Compression (if > 1MB)
↓
getCloudinarySignature() → Get upload credentials
↓
uploadToCloudinary() → POST to Cloudinary
↓
Response: {
  secure_url: "https://res.cloudinary.com/...",
  public_id: "progress-reports/tech/report-1/before",
  width: 1920,
  height: 1080,
  bytes: 245678
}
```

### Step 5: Result
```
Return to parent component:
{
  secureUrl: "https://res.cloudinary.com/...",
  publicId: "progress-reports/tech/report-1/before",
  metadata: { ... }
}
```

---

## 🔍 Debug Information

### Enable Debug Logs:
```javascript
// File: progress-report-upload.service.js
const DEBUG = true;  // Set to true for debug logs
```

### Console Output Example:
```
[ProgressReportUpload] Upload started: {
  stage: "progress",
  reportId: "report-123",
  imageDataLength: 245678,
  compressImage: true
}

[ProgressReportUpload] Blob created: {
  size: 245678,
  type: "image/jpeg"
}

[ProgressReportUpload] Getting Cloudinary signature: {
  folderPath: "progress-reports/john-doe/report-123/progress"
}

[ProgressReportUpload] Uploading to Cloudinary: {
  cloudName: "ims-xxx",
  folder: "progress-reports/john-doe/report-123/progress"
}

[ProgressReportUpload] Upload completed: {
  duration: "1234ms",
  secureUrl: "https://res.cloudinary.com/xxx/image/upload/...",
  publicId: "progress-reports/john-doe/report-123/progress"
}
```

---

## 📦 Cloudinary Folder Structure

```
Cloudinary Storage:
└─ progress-reports/
   └─ {technicianName}/
      └─ {reportId}/
         ├─ before/      (Photos before work)
         ├─ during/      (Photos during work)
         ├─ after/       (Photos after work)
         └─ progress/    (Progress report photos)
```

Example:
```
progress-reports/
├─ john-doe/
│  ├─ report-123/
│  │  ├─ before/ → image.jpg
│  │  ├─ during/ → image1.jpg, image2.jpg
│  │  ├─ after/  → image.jpg
│  │  └─ progress/ → snapshot.jpg
│  └─ report-124/
│     ├─ before/ → image.jpg
│     └─ progress/ → snapshot.jpg
└─ jane-smith/
   └─ report-125/
      ├─ during/ → image1.jpg, image2.jpg
      └─ after/  → image.jpg
```

---

## ✅ Checklist

- [x] Album selection (base64/blob URL)
- [x] Image validation (format, size)
- [x] Image compression (> 1MB)
- [x] Cloudinary signature generation
- [x] Upload to Cloudinary
- [x] Progress tracking
- [x] Error handling
- [x] Batch upload support
- [x] Debug logging
- [x] React Hook for state management
- [x] CameraView integration
- [x] Documentation

---

## 🚀 Supported Formats

- ✅ JPEG (.jpg, .jpeg)
- ✅ PNG (.png)
- ✅ WebP (.webp)

---

## ⚠️ Limitations

- Max file size: 10MB per image
- Supported formats: JPEG, PNG, WebP
- Compression: Only applied if > 1MB
- Compression quality: 0.7 (70%)

---

## 🔒 Security

- ✅ Signed uploads (signature + timestamp)
- ✅ Server-side signature validation
- ✅ Folder-based access control
- ✅ HTTPS encryption
- ✅ No direct API key exposure

---

## 🎓 Example: Complete Workflow

```javascript
// 1. User selects image from album
// CameraView receives base64 data

// 2. Component validates and uploads
const result = await uploadImage(base64Data, {
  reportId: "report-123",
  stage: "before",
  technicianName: "john-doe",
  compressImage: true,
});

// 3. Image stored in Cloudinary
console.log(result.secureUrl);
// "https://res.cloudinary.com/ims-cloud/image/upload/v1234567890/progress-reports/john-doe/report-123/before/abc123.jpg"

// 4. Save URL to database
const newReport = await saveProgressReport({
  work_id: 123,
  before_image: result.secureUrl,
  before_image_public_id: result.publicId,
  before_image_metadata: result.metadata,
});

// 5. Later: Delete image from Cloudinary if needed
await deleteImage(result.publicId);  // Using cloudinary.service.js
```

---

## 📞 Support

For issues or questions:
1. Check debug logs (set `DEBUG = true`)
2. Verify Cloudinary credentials in `.env`
3. Check network request in DevTools
4. Review validation results
5. Check server-side signature endpoint
