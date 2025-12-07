import { getSystemInfo } from "zmp-sdk";
import {
    AnimationRoutes,
    App,
    Route,
    SnackbarProvider,
    ZMPRouter,
} from "zmp-ui";
import { Suspense, Component } from "react";
import { routes } from "../config/mini-app.route.js";

// Lazy load components for better performance
import ToastContainer from "./ToastContainer";
import RouteGuard from "./RouteGuard";
import { useToast } from "../hooks/useToast";

// Create Toast Context
import React from "react";
import LoadingFallback from "./LoadingFallback";

export const ToastContext = React.createContext();

// Error Boundary Component for better error handling
class ErrorBoundary extends Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error("Router Error:", error, errorInfo);
        // You can log to error reporting service here
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="flex flex-col items-center justify-center min-h-screen p-4">
                    <div className="text-center">
                        <h2 className="text-xl font-semibold text-red-600 mb-2">
                            Có lỗi xảy ra
                        </h2>
                        <p className="text-gray-600 mb-4">
                            Vui lòng thử lại hoặc liên hệ hỗ trợ
                        </p>
                        <button
                            onClick={() => window.location.reload()}
                            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                        >
                            Tải lại trang
                        </button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

// Loading fallback component

const Layout = () => {
    const { toasts, removeToast, success, error, warn, info } = useToast();

    return (
        <App theme={getSystemInfo().zaloTheme}>
            <SnackbarProvider>
                <ToastContext.Provider value={{ success, error, warn, info }}>
                    <ErrorBoundary>
                        <ZMPRouter>
                            <Suspense fallback={<LoadingFallback />}>
                                <AnimationRoutes>
                                    {routes.map((route) => (
                                        <Route
                                            key={route.path}
                                            path={route.path}
                                            element={
                                                route.protected ? (
                                                    <RouteGuard>
                                                        <route.component />
                                                    </RouteGuard>
                                                ) : (
                                                    <route.component />
                                                )
                                            }
                                        />
                                    ))}
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
