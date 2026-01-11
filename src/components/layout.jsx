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
      errorInfo: null,
      showDetails: false,
      copySuccess: false,
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("[ErrorBoundary] React Error Caught:", error, errorInfo);
    // store component stack for debugging UI
    this.setState({ errorInfo });
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      showDetails: false,
      copySuccess: false,
    });
  };

  toggleDetails = () => {
    this.setState((s) => ({ showDetails: !s.showDetails }));
  };

  copyError = async () => {
    const { error, errorInfo } = this.state;
    const text = `${error?.message || ""}\n\n${error?.stack || ""}\n\n${errorInfo?.componentStack || ""}`;
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
      } else {
        const ta = document.createElement("textarea");
        ta.value = text;
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        ta.remove();
      }
      this.setState({ copySuccess: true });
      setTimeout(() => this.setState({ copySuccess: false }), 2000);
    } catch (err) {
      console.error("[ErrorBoundary] copy failed:", err);
      alert("Không thể sao chép lỗi vào clipboard.");
    }
  };

  render() {
    if (this.state.hasError) {
      const { error, errorInfo, showDetails, copySuccess } = this.state;
      return (
        <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-50">
          <div className="bg-white rounded-lg shadow-md p-6 max-w-2xl w-full">
            <h2 className="text-2xl font-bold text-red-600 mb-3">Sự cố hệ thống</h2>

            <p className="text-gray-600 mb-4 text-sm">Ứng dụng gặp sự cố. Vui lòng thử lại hoặc báo lỗi cho bộ phận kỹ thuật.</p>

            <div className="flex gap-3 mb-4">
              <button
                onClick={this.handleReset}
                className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-semibold"
              >
                Thử lại
              </button>

              <button
                onClick={() => window.location.reload()}
                className="px-3 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 text-sm"
              >
                Tải lại
              </button>

              <button
                onClick={this.copyError}
                className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm"
              >
                {copySuccess ? "Đã sao chép" : "Sao chép lỗi"}
              </button>

              <button
                onClick={this.toggleDetails}
                className="px-3 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 text-sm"
              >
                {showDetails ? "Ẩn chi tiết" : "Xem chi tiết"}
              </button>
            </div>

            {showDetails && (
              <div className="mt-2">
                <div className="text-xs text-gray-500 mb-2">Thông tin lỗi (message + stack + component stack):</div>
                <pre className="bg-gray-100 p-3 rounded text-xs overflow-auto whitespace-pre-wrap max-h-64">
{`${error?.message || 'No message'}\n\n${error?.stack || ''}\n\n${errorInfo?.componentStack || ''}`}
                </pre>
              </div>
            )}

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
