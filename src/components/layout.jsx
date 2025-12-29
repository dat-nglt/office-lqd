import { getSystemInfo } from "zmp-sdk";
import { AnimationRoutes, App, Route, SnackbarProvider, ZMPRouter } from "zmp-ui";
import { Suspense, Component, useMemo } from "react";
import { routes } from "../config/mini-app.route.js";

// Lazy load components for better performance
import ToastContainer from "./ToastContainer";
import RouteGuard from "./RouteGuard";
import { useToast } from "../hooks/useToast";

// Create Toast Context
import React from "react";
import LoadingFallback from "./LoadingFallback";

export const ToastContext = React.createContext();

/**
 * Error Boundary Component để catch React errors
 * Giúp app không crash hoàn toàn khi có lỗi trong component
 */
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("[ErrorBoundary] React Error Caught:", error, errorInfo);
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
    });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-50">
          <div className="bg-white rounded-lg shadow-md p-8 max-w-md w-full">
            <h2 className="text-2xl font-bold text-red-600 mb-3">⚠️ Có lỗi xảy ra</h2>

            <p className="text-gray-600 mb-6 text-sm">Ứng dụng gặp lỗi. Vui lòng thử lại hoặc quay về trang chủ.</p>

            <div className="space-y-3">
              <button
                onClick={this.handleReset}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-semibold"
              >
                Thử lại
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

const Layout = () => {
  const { toasts, removeToast, success, error, warn, info } = useToast();

  // Memoize routes processing để tránh re-render không cần thiết
  const renderedRoutes = useMemo(() => {
    return routes.map((route) => (
      <Route
        key={route.path}
        path={route.path}
        element={
          route.protected ? (
            <RouteGuard redirectTo="/login" requireAuth={true}>
              <route.component />
            </RouteGuard>
          ) : (
            <route.component />
          )
        }
      />
    ));
  }, []);

  // Memoize toast context value
  const toastContextValue = useMemo(() => ({ success, error, warn, info }), [success, error, warn, info]);

  return (
    <App theme={getSystemInfo().zaloTheme}>
      <SnackbarProvider>
        <ToastContext.Provider value={toastContextValue}>
          <ErrorBoundary>
            <ZMPRouter>
              <Suspense fallback={<LoadingFallback />}>
                <AnimationRoutes>{renderedRoutes}</AnimationRoutes>
              </Suspense>
            </ZMPRouter>
          </ErrorBoundary>
          <ToastContainer toasts={toasts} onRemoveToast={removeToast} />
        </ToastContext.Provider>
      </SnackbarProvider>
    </App>
  );
};

export default Layout;
