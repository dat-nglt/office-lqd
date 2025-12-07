# Router Configuration Guide

## Tổng Quan

Ứng dụng sử dụng ZMP Router framework với các tối ưu sau:

- **Lazy Loading**: Tất cả components được load lazy để cải thiện performance
- **Error Boundaries**: Xử lý lỗi router một cách graceful
- **Route Guards**: Bảo vệ các routes cần authentication
- **Custom Router Hook**: API dễ sử dụng cho navigation

## Cấu Trúc Router

### Layout Component (`src/components/layout.jsx`)

```jsx
<ZMPRouter>
  <Suspense fallback={<LoadingFallback />}>
    <AnimationRoutes>
      {/* Public routes */}
      <Route path="/login" element={<Login />} />

      {/* Protected routes */}
      <Route path="/" element={<RouteGuard><HomePage /></RouteGuard>} />
      {/* ... other routes */}
    </AnimationRoutes>
  </Suspense>
</ZMPRouter>
```

### Route Guard (`src/components/RouteGuard.jsx`)

Component bảo vệ routes cần authentication:

```jsx
<RouteGuard>
  <ProtectedComponent />
</RouteGuard>
```

### Custom Router Hook (`src/hooks/useRouter.js`)

Hook cung cấp các methods navigation:

```jsx
import { useRouter } from '../hooks/useRouter';

const MyComponent = () => {
  const {
    goHome,
    goToWorkList,
    goToCheckIn,
    goToProfile,
    goBack
  } = useRouter();

  return (
    <button onClick={goToProfile}>Go to Profile</button>
  );
};
```

## Các Methods Router

### Navigation Methods

| Method | Description | Example |
|--------|-------------|---------|
| `goTo(path, options)` | Navigate to path | `goTo('/profile')` |
| `goBack(options)` | Go back | `goBack()` |
| `goHome()` | Go to home page | `goHome()` |
| `goToLogin()` | Go to login page | `goToLogin()` |
| `goToProfile()` | Go to profile page | `goToProfile()` |
| `goToWorkList()` | Go to work list | `goToWorkList()` |
| `goToCheckIn()` | Go to check-in page | `goToCheckIn()` |
| `goToWorkManagement()` | Go to work management | `goToWorkManagement()` |
| `goToNotifications()` | Go to notifications | `goToNotifications()` |
| `goToWorkReports()` | Go to work reports | `goToWorkReports()` |
| `goToWorkReportDetail(id)` | Go to work report detail | `goToWorkReportDetail(123)` |
| `goToAttendanceHistory()` | Go to attendance history | `goToAttendanceHistory()` |
| `goToProgressReport()` | Go to progress report | `goToProgressReport()` |
| `goToOvertimeRequest()` | Go to overtime request | `goToOvertimeRequest()` |

### Advanced Navigation

```jsx
// Navigate with query params
goTo({ path: '/work-report', query: { id: 123, tab: 'details' } });

// Navigate with options
goTo('/profile', {
  replace: true,  // Replace current history entry
  animate: true   // Enable animation
});
```

## Route Protection

### Automatic Redirect

RouteGuard tự động:
- Kiểm tra authentication tokens
- Redirect đến `/login` nếu chưa đăng nhập
- Hiển thị loading khi đang kiểm tra

### Custom Route Guard

```jsx
// For routes that don't require auth
<Route path="/public-page" element={<PublicPage />} />

// For routes that require auth (default)
<Route
  path="/protected-page"
  element={
    <RouteGuard>
      <ProtectedPage />
    </RouteGuard>
  }
/>

// Custom redirect path
<Route
  path="/admin"
  element={
    <RouteGuard redirectTo="/unauthorized">
      <AdminPage />
    </RouteGuard>
  }
/>
```

## Error Handling

### Error Boundary

Tự động catch và hiển thị lỗi router:

```jsx
<ErrorBoundary>
  <ZMPRouter>
    {/* routes */}
  </ZMPRouter>
</ErrorBoundary>
```

### Custom Error Pages

Tạo error pages cho các HTTP status codes:

```jsx
// Add to routes
<Route path="/404" element={<NotFoundPage />} />
<Route path="/500" element={<ServerErrorPage />} />
```

## Performance Optimizations

### Code Splitting

Components được lazy loaded theo route:

```jsx
const HomePage = lazy(() => import("../pages/index"));
const WorkListPage = lazy(() => import("../pages/WorkList"));
// ...
```

### Loading States

Suspense với custom fallback:

```jsx
<Suspense fallback={<LoadingFallback />}>
  <AnimationRoutes>
    {/* routes */}
  </AnimationRoutes>
</Suspense>
```

## Best Practices

### 1. Sử dụng useRouter Hook

```jsx
// ✅ Good
const { goToProfile } = useRouter();

// ❌ Avoid
const navigate = useNavigate();
navigate('/profile');
```

### 2. Protected Routes

```jsx
// ✅ Good
<Route path="/profile" element={
  <RouteGuard>
    <ProfilePage />
  </RouteGuard>
} />

// ❌ Avoid
<Route path="/profile" element={<ProfilePage />} />
```

### 3. Error Boundaries

```jsx
// ✅ Good
<ErrorBoundary>
  <AppContent />
</ErrorBoundary>

// ❌ Avoid - no error handling
<AppContent />
```

### 4. Loading States

```jsx
// ✅ Good
<Suspense fallback={<Spinner />}>
  <LazyComponent />
</Suspense>

// ❌ Avoid - no loading state
<LazyComponent />
```

## Troubleshooting

### Common Issues

1. **"Cannot read property 'navigate' of undefined"**
   - Đảm bảo sử dụng `useRouter` hook trong component được wrap bởi `ZMPRouter`

2. **Route không được bảo vệ**
   - Kiểm tra RouteGuard component có wrap route không

3. **Lazy loading không hoạt động**
   - Đảm bảo component được export default
   - Kiểm tra import path đúng

4. **Navigation không hoạt động**
   - Kiểm tra route path có tồn tại trong layout.jsx không
   - Đảm bảo component được import đúng

### Debug Tips

```jsx
// Log current route
const { zmproute } = props; // in component props
console.log('Current route:', zmproute);

// Log router instance
import { zmp } from 'zmp-framework/react';
console.log('Router:', zmp.views.main.router);
```