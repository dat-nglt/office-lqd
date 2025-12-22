import { getSystemInfo } from "zmp-sdk";
import {
    AnimationRoutes,
    App,
    Route,
    SnackbarProvider,
    ZMPRouter,
} from "zmp-ui";
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
            errorCount: 0 
        };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        // Increment error count để prevent infinite loops
        this.setState(prev => ({
            errorCount: prev.errorCount + 1
        }));

        console.error(
            "[ErrorBoundary] React Error Caught:",
            error,
            errorInfo
        );

        // Log error to backend nếu cần
        if (process.env.NODE_ENV === 'production') {
            // Có thể gửi error log tới server
            console.log("[ErrorBoundary] Error logged for monitoring");
        }
    }

    handleReset = () => {
        this.setState({ 
            hasError: false, 
            error: null 
        });
    };

    render() {
        if (this.state.hasError) {
            const isRecurringError = this.state.errorCount > 3;

            return (
                <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-50">
                    <div className="bg-white rounded-lg shadow-md p-8 max-w-md w-full">
                        <h2 className="text-2xl font-bold text-red-600 mb-3">
                            ⚠️ Có lỗi xảy ra
                        </h2>
                        
                        <p className="text-gray-600 mb-4 text-sm">
                            {isRecurringError
                                ? "Ứng dụng gặp vấn đề lặp lại. Vui lòng khởi động lại."
                                : "Xin lỗi, ứng dụng gặp lỗi. Bạn có thể thử các cách sau:"}
                        </p>

                        {!isRecurringError && (
                            <>
                                <ul className="text-sm text-gray-600 mb-4 space-y-2">
                                    <li>✓ Tải lại trang</li>
                                    <li>✓ Xóa cache trình duyệt</li>
                                    <li>✓ Liên hệ hỗ trợ nếu vấn đề tiếp tục</li>
                                </ul>

                                <button
                                    onClick={this.handleReset}
                                    className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition mb-2 text-sm font-semibold"
                                >
                                    Thử lại
                                </button>
                            </>
                        )}

                        <button
                            onClick={() => window.location.reload()}
                            className="w-full px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition text-sm font-semibold"
                        >
                            Tải lại trang
                        </button>

                        {process.env.NODE_ENV === 'development' && (
                            <details className="mt-4 text-xs text-gray-500">
                                <summary className="cursor-pointer font-semibold">
                                    Chi tiết lỗi (dev only)
                                </summary>
                                <pre className="mt-2 p-2 bg-gray-100 rounded overflow-auto max-h-40 text-red-600">
                                    {this.state.error?.toString()}
                                </pre>
                            </details>
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
                        <RouteGuard
                            redirectTo="/login"
                            requireAuth={true}
                        >
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
    const toastContextValue = useMemo(
        () => ({ success, error, warn, info }),
        [success, error, warn, info]
    );

    return (
        <App theme={getSystemInfo().zaloTheme}>
            <SnackbarProvider>
                <ToastContext.Provider value={toastContextValue}>
                    <ErrorBoundary>
                        <ZMPRouter>
                            <Suspense fallback={<LoadingFallback />}>
                                <AnimationRoutes>
                                    {renderedRoutes}
                                </AnimationRoutes>
                            </Suspense>
                        </ZMPRouter>
                    </ErrorBoundary>
                    <ToastContainer
                        toasts={toasts}
                        onRemoveToast={removeToast}
                    />
                </ToastContext.Provider>
            </SnackbarProvider>
        </App>
    );
};

export default Layout;
