# Kiểm Tra Cơ Chế Đăng Nhập Zalo Mini App - Báo Cáo Chi Tiết

## 📋 Tổng Quan

Cơ chế đăng nhập của Zalo Mini App hiện tại sử dụng **Zalo SDK** để lấy access token từ Zalo, sau đó xác thực qua backend IMS Server. Dưới đây là phân tích chi tiết về toàn bộ flow.

---

## 🔐 Flow Đăng Nhập Hoàn Chỉnh

```
┌─────────────────────────────────────────────────────────────────┐
│  BƯỚC 1: User Mở Mini App & Nhấn "Đăng Nhập Bằng Zalo"         │
├─────────────────────────────────────────────────────────────────┤
│  File: src/pages/Login.jsx                                      │
│  Function: handleZaloLogin()                                    │
│  → Gọi getAccessToken() từ ZMP SDK                             │
│  → Zalo Mini App trả về access_token                           │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│  BƯỚC 2: Frontend Gửi Access Token Lên Server                  │
├─────────────────────────────────────────────────────────────────┤
│  File: src/services/auth.service.js                            │
│  Function: zaloLogin(accessToken)                              │
│  → POST /auth/zalo-login { access_token }                      │
│  → Endpoint: /api/v1/ims/auth/zalo-login                       │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│  BƯỚC 3: Backend Xác Thực Token Với Zalo API                  │
├─────────────────────────────────────────────────────────────────┤
│  File: ims-server/src/controllers/users/auth.controller.js     │
│  Function: zaloLoginController()                               │
│  → Tính appsecret_proof = HMAC-SHA256(accessToken, SECRET)    │
│  → Gọi https://graph.zalo.me/v2.0/me                          │
│  → Headers: access_token, appsecret_proof                      │
│  → Lấy user profile: id, name, picture                         │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│  BƯỚC 4: Tạo/Cập Nhật User Account                            │
├─────────────────────────────────────────────────────────────────┤
│  • Nếu zalo_id chưa tồn tại → Tạo user mới                    │
│    - approved: 'pending' (cần admin phê duyệt)                 │
│    - status: 'active'                                          │
│    - position: 'Technician'                                    │
│  • Nếu user đã tồn tại → Cập nhật last_login                  │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│  BƯỚC 5: Kiểm Tra Trạng Thái Phê Duyệt Tài Khoản             │
├─────────────────────────────────────────────────────────────────┤
│  • approved = 'approved' → Đăng nhập thành công               │
│  • approved = 'pending' → Hiển thị "Tài khoản chờ phê duyệt"  │
│  • approved = 'rejected' → Hiển thị "Tài khoản bị từ chối"    │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│  BƯỚC 6: Tạo JWT Token & Trả Về Client                        │
├─────────────────────────────────────────────────────────────────┤
│  • JWT Token: JWT.sign({ userId, phone, zalo_id, role })      │
│  • Expires: 24h                                                │
│  • Response: { status: 'success', data: { user, access_token }}
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│  BƯỚC 7: Lưu Token & User Info, Chuyển Hướng                  │
├─────────────────────────────────────────────────────────────────┤
│  File: src/pages/Login.jsx                                      │
│  • Lưu access_token → nativeStorage                            │
│  • Lưu user_info → nativeStorage (JSON stringify)              │
│  • Gọi setTokens() & setUserInfo()                             │
│  • Chuyển hướng tới / (home page)                              │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📁 Cấu Trúc File Liên Quan

### Frontend (technician-lqd)

#### 1. **Login Page** - [src/pages/Login.jsx](src/pages/Login.jsx)
```javascript
// Quy trình:
1. useEffect - Kiểm tra token đã lưu (auto-redirect nếu đã login)
2. handleZaloLogin() - Main login function
   - Gọi getAccessToken() từ ZMP SDK
   - Gọi zaloLogin() service
   - Kiểm tra approval status
   - Lưu token & user info
   - Redirect tới home
```

**Trạng thái kiểm tra:**
- ✅ `approved = 'approved'` → Cho phép đăng nhập
- ⏳ `approved = 'pending'` → Hiển thị modal "Chờ phê duyệt"
- ❌ `approved = 'rejected'` → Hiển thị modal "Bị từ chối"

#### 2. **Auth Service** - [src/services/auth.service.js](src/services/auth.service.js)
```javascript
zaloLogin(accessToken) {
  // POST /auth/zalo-login
  // Request: { access_token: string }
  // Response: { status, data: { user, access_token } }
}
```

#### 3. **Axios Config** - [src/config/axiosConfig.js](src/config/axiosConfig.js)

**Token Management:**
- `getTokens()` - Lấy tokens từ nativeStorage
- `setTokens(accessToken, refreshToken)` - Lưu tokens
- `clearTokens()` - Xóa tokens

⚠️ **Issues Phát Hiện:**
1. `setTokens()` function nhận tham số không rõ ràng
2. Không có refresh token mechanism rõ ràng cho mini app
3. Response interceptor cố gắng refresh token nhưng không có endpoint refresh-token

#### 4. **Route Guard** - [src/components/RouteGuard.jsx](src/components/RouteGuard.jsx)

⚠️ **Issue Lớn:**
- Tất cả logic auth check đã bị comment out
- Component chỉ return `children` mà không kiểm tra gì
- **Kết quả:** Protected routes không được bảo vệ!

```javascript
// ❌ Tất cả code dưới đây bị comment:
// if (tokens && tokens.accessToken) {
//     setIsAuthenticated(true);
// } else {
//     navigate(redirectTo, { replace: true });
// }
```

#### 5. **Layout** - [src/components/layout.jsx](src/components/layout.jsx)
- Sử dụng RouteGuard cho protected routes
- Cung cấp ToastContext cho notifications

### Backend (ims-server)

#### 1. **Zalo Login Controller** - [ims-server/src/controllers/users/auth.controller.js](../ims-server/src/controllers/users/auth.controller.js#L143)

**Các bước:**
1. ✅ Nhận access_token từ request
2. ✅ Validate ZALO_SECRET_KEY
3. ✅ Tính appsecret_proof = HMAC-SHA256(access_token, secret)
4. ✅ Gọi Zalo API: `GET https://graph.zalo.me/v2.0/me`
5. ✅ Tìm user theo zalo_id
6. ✅ Tạo user mới nếu chưa tồn tại (approved: 'pending')
7. ✅ Kiểm tra approval status
8. ✅ Tạo JWT token (24h expiry)
9. ✅ Cập nhật last_login

**Error Handling:**
```javascript
- 400: Thiếu access token
- 401: Token không hợp lệ/hết hạn
- 403: Không có quyền truy cập
- 408: Timeout kết nối Zalo
- 500: Server error
```

#### 2. **Auth Middleware** - [ims-server/src/middlewares/auth.middleware.js](../ims-server/src/middlewares/auth.middleware.js)

**Xác thực JWT Token:**
1. Lấy token từ header Authorization: Bearer <token>
2. Verify token signature với JWT_SECRET
3. Gắn user info vào req.user
4. Kiểm tra account status
5. Lấy roles & permissions

#### 3. **User Model** - [ims-server/src/models/users/user.model.js](../ims-server/src/models/users/user.model.js#L54)

**Fields quan trọng:**
```javascript
zalo_id:    STRING(100) - Zalo ID unique
phone:      STRING(20) - Nullable cho Zalo users
email:      STRING(255) - Nullable cho Zalo users
password:   STRING(255) - Nullable cho Zalo users
status:     STRING(50) - active/inactive/suspended
approved:   ENUM - pending/approved/rejected
last_login: DATE - Cập nhật mỗi lần đăng nhập
```

#### 4. **Auth Routes** - [ims-server/src/routes/users/auth.route.js](../ims-server/src/routes/users/auth.route.js)

```javascript
POST /auth/login           - Đăng nhập phone/password
POST /auth/zalo-login     - Đăng nhập Zalo ✅
POST /auth/register       - Đăng ký mới
POST /auth/link-zalo      - Liên kết Zalo (auth required)
POST /auth/refresh-token  - Làm mới token
```

---

## 🚨 Các Vấn Đề Phát Hiện

### 1. **RouteGuard Không Hoạt Động** ⚠️ CRITICAL
**Vị trí:** [src/components/RouteGuard.jsx](src/components/RouteGuard.jsx)

**Vấn đề:** Tất cả logic xác thực đều bị comment out

**Tác động:** 
- Protected routes không được bảo vệ
- User chưa đăng nhập có thể truy cập mọi trang
- Không có kiểm tra token validity

**Khuyến nghị:**
```javascript
// Uncomment logic check authentication
const checkAuth = async () => {
    const tokens = getTokens();
    if (requireAuth && !tokens?.accessToken) {
        navigate(redirectTo, { replace: true });
        return;
    }
    setIsAuthenticated(true);
};
```

### 2. **Token Storage Không Nhất Quán** ⚠️ HIGH
**Vị trí:** [src/config/axiosConfig.js](src/config/axiosConfig.js#L19-L30)

**Vấn đề:**
- `getTokens()` đọc từ `nativeStorage` với key `authTokens` (JSON)
- `setTokens()` được gọi với 2 parameters riêng biệt trong Login.jsx
- Actual storage logic không match with caller

**Code hiện tại:**
```javascript
// setTokens được gọi như:
setTokens(access_token, null);  // Lỗi: chỉ 2 params

// Nhưng hàm định nghĩa là:
const setTokens = (tokens) => {  // Chỉ 1 param
    nativeStorage.setItem('authTokens', JSON.stringify(tokens));
};
```

### 3. **Không Có Refresh Token Flow** ⚠️ HIGH
**Vị trí:** [src/config/axiosConfig.js](src/config/axiosConfig.js#L95-L150)

**Vấn đề:**
- Response interceptor cố gắng refresh token (line 125)
- Nhưng backend không trả refresh token cho Zalo login
- Endpoint refresh-token không được configure đúng

**Code:**
```javascript
const { refreshToken } = getTokens();
if (!refreshToken) {
    throw new Error("No refresh token available");
}
// ❌ refreshToken sẽ luôn undefined cho Zalo users
```

### 4. **User Info Storage Mismatch** ⚠️ MEDIUM
**Vị trí:** [src/pages/Login.jsx](src/pages/Login.jsx#L37-L51) & [src/config/axiosConfig.js](src/config/axiosConfig.js#L51-L65)

**Vấn đề:**
- Login.jsx lưu user_info vào `nativeStorage`
- axiosConfig.js đọc userInfo từ `localStorage`
- Chúng là 2 storage riêng biệt!

**Code:**
```javascript
// Login.jsx (dòng 95):
nativeStorage.setItem("user_info", JSON.stringify(user));

// axiosConfig.js (dòng 57):
const userStr = localStorage.getItem("userInfo");  // ❌ Sai key & storage
```

### 5. **No Token Expiration Handling** ⚠️ MEDIUM
**Vị trí:** [src/pages/Login.jsx](src/pages/Login.jsx)

**Vấn đề:**
- JWT token có expiry 24h
- Không có mechanism để refresh token khi hết hạn
- Response interceptor cố gắng nhưng thiếu refresh token

### 6. **Zalo Access Token Validation** ⚠️ MEDIUM
**Vị trí:** [src/services/auth.service.js](src/services/auth.service.js#L18)

**Vấn đề:**
- Không validate access_token locally trước khi gửi server
- Nếu token invalid, sẽ gọi server dù biết sẽ fail
- Không có timeout/retry logic

### 7. **Missing Error Logging** ⚠️ LOW
**Vị trí:** [src/pages/Login.jsx](src/pages/Login.jsx#L71-L120)

**Vấn đề:**
- Lỗi không được log chi tiết
- Khó debug trong production
- `step` state không được sử dụng hết

---

## ✅ Những Điểm Tốt

### 1. **Approval Status Check** ✓
- Kiểm tra `approved` field sau khi đăng nhập
- Hiển thị UI tương ứng cho pending/rejected
- Tốt cho security & compliance

### 2. **Security - appsecret_proof** ✓
- Backend tính appsecret_proof đúng cách
- Dùng HMAC-SHA256 chuẩn Zalo
- Gửi tới Zalo API với headers đúng

### 3. **Auto User Creation** ✓
- Tự động tạo user từ Zalo profile
- Tạo unique employee_id
- Default positions & departments

### 4. **Last Login Tracking** ✓
- Cập nhật last_login sau mỗi đăng nhập
- Hữu ích cho audit & analytics

### 5. **Toast Notifications** ✓
- Thông báo user-friendly
- Phân biệt success/error/warning

---

## 🔧 Giải Pháp Đề Xuất

### Bước 1: Fix RouteGuard (URGENT)
```javascript
// Uncomment logic authentication check
const checkAuth = async () => {
    const { accessToken } = getTokens();
    
    if (requireAuth && !accessToken) {
        navigate(redirectTo, { replace: true });
        return;
    }
    
    setIsAuthenticated(true);
};

useEffect(() => {
    checkAuth();
}, []);
```

### Bước 2: Fix Token Storage Consistency
```javascript
// Login.jsx
const { access_token, user } = response.data;
setTokens(access_token, null);  // ✓ Correct

// axiosConfig.js
const setTokens = (accessToken, refreshToken = null) => {
    nativeStorage.setItem('authTokens', JSON.stringify({
        accessToken,
        refreshToken
    }));
};

const setUserInfo = (userInfo) => {
    nativeStorage.setItem("user_info", JSON.stringify(userInfo));
};
```

### Bước 3: Implement Proper Token Refresh
```javascript
// Backend: Return refresh token for Zalo login
const refreshToken = jwt.sign(
    { userId: user.id },
    process.env.JWT_REFRESH_SECRET || 'ims-refresh-secret',
    { expiresIn: '7d' }
);

res.json({
    status: "success",
    data: {
        user: fullUser,
        access_token: token,
        refresh_token: refreshToken  // ✓ Thêm refresh token
    }
});
```

### Bước 4: Handle Token Expiration
```javascript
// axiosConfig.js - Check token expiry before request
const isTokenExpired = (token) => {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.exp * 1000 < Date.now();
};

axiosInstance.interceptors.request.use((config) => {
    const { accessToken } = getTokens();
    
    if (accessToken && !isTokenExpired(accessToken)) {
        config.headers.Authorization = `Bearer ${accessToken}`;
    }
    
    return config;
});
```

---

## 📊 Security Checklist

| Tiêu Chí | Status | Ghi Chú |
|---------|--------|--------|
| Xác thực Zalo Access Token | ✅ | Dùng appsecret_proof |
| JWT Token Validation | ✅ | Verify signature |
| Token Storage (Secure) | ❌ | Dùng nativeStorage chứ không localStorage |
| Token Expiry Handling | ❌ | Cần implement refresh token |
| Protected Routes | ❌ | RouteGuard không hoạt động |
| Approval System | ✅ | Check pending/approved/rejected |
| HTTPS Only | ⚠️ | Cần kiểm tra Zalo Mini App config |
| CSRF Protection | ⚠️ | Backend nên có |

---

## 📝 Environment Variables Cần

```bash
# Backend (.env)
ZALO_APP_ID=<your_zalo_app_id>
ZALO_SECRET_KEY=<your_zalo_app_secret>
JWT_SECRET=<your_jwt_secret>
JWT_REFRESH_SECRET=<your_jwt_refresh_secret>
IMS_API_URL=https://lamquangdai.vn/api/v1/ims

# Frontend (.env)
VITE_IMS_API_URL=https://lamquangdai.vn/api/v1/ims
VITE_ZALO_APP_ID=<your_zalo_app_id>
```

---

## 🎯 Kết Luận

Cơ chế đăng nhập Zalo Mini App có **base tốt** nhưng cần **fix các issues quan trọng**:

### Priority 1 (URGENT):
- [ ] Uncomment RouteGuard logic
- [ ] Fix token storage consistency

### Priority 2 (HIGH):
- [ ] Implement proper refresh token flow
- [ ] Add token expiration handling
- [ ] Fix user info storage

### Priority 3 (MEDIUM):
- [ ] Add error logging
- [ ] Add token validation
- [ ] Add retry logic

### Priority 4 (LOW):
- [ ] Optimize performance
- [ ] Add analytics
- [ ] Improve UX
