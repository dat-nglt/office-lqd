import { useState, useCallback } from "react";

export const useToast = () => {
    const [toasts, setToasts] = useState([]);

    const showToast = useCallback(
        ({
            type = "info",
            title = "",
            message = "",
            duration = 3000,
            action = null,
            id = Date.now(),
        }) => {
            setToasts((prev) => [
                ...prev,
                {
                    id,
                    type,
                    title,
                    message,
                    duration,
                    action,
                    visible: true,
                },
            ]);

            if (duration > 0) {
                setTimeout(() => {
                    removeToast(id);
                }, duration + 300);
            }

            return id;
        },
        []
    );

    const removeToast = useCallback((id) => {
        setToasts((prev) =>
            prev.map((toast) =>
                toast.id === id ? { ...toast, visible: false } : toast
            )
        );

        setTimeout(() => {
            setToasts((prev) => prev.filter((toast) => toast.id !== id));
        }, 300);
    }, []);

    const success = useCallback(
        ({ title = "Thành công", message = "", duration = 3000, action = null }) =>
            showToast({
                type: "success",
                title,
                message,
                duration,
                action,
            }),
        [showToast]
    );

    const error = useCallback(
        ({ title = "Lỗi", message = "", duration = 3000, action = null }) =>
            showToast({
                type: "error",
                title,
                message,
                duration,
                action,
            }),
        [showToast]
    );

    const warn = useCallback(
        ({ title = "Cảnh báo", message = "", duration = 3000, action = null }) =>
            showToast({
                type: "warn",
                title,
                message,
                duration,
                action,
            }),
        [showToast]
    );

    const info = useCallback(
        ({ title = "Thông tin", message = "", duration = 3000, action = null }) =>
            showToast({
                type: "info",
                title,
                message,
                duration,
                action,
            }),
        [showToast]
    );

    return {
        toasts,
        showToast,
        removeToast,
        success,
        error,
        warn,
        info,
    };
};
