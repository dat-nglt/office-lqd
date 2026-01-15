import { Box, Text, Icon } from "zmp-ui";
import { useEffect, useState } from "react";

function Toast({
    type = "info",
    title = "",
    message = "",
    duration = 3000,
    onClose = null,
    action = null,
    visible = true,
}) {
    const [isVisible, setIsVisible] = useState(visible);
    const [isAnimating, setIsAnimating] = useState(false);

    useEffect(() => {
        setIsVisible(visible);
        setIsAnimating(true);

        if (duration > 0 && visible) {
            const timer = setTimeout(() => {
                setIsAnimating(false);
                setTimeout(() => {
                    setIsVisible(false);
                    onClose?.();
                }, 300);
            }, duration);

            return () => clearTimeout(timer);
        }
    }, [visible, duration, onClose]);

    const handleClose = () => {
        setIsAnimating(false);
        setTimeout(() => {
            setIsVisible(false);
            onClose?.();
        }, 300);
    };

    const handleAction = () => {
        if (action?.onClick) {
            action.onClick();
        }
        handleClose();
    };

    if (!isVisible) return null;

    const getTypeConfig = () => {
        switch (type) {
            case "success":
                return {
                    bgColor: "bg-green-50 border-green-200",
                    titleColor: "text-green-900",
                    messageColor: "text-green-700",
                    icon: "zi-check-circle",
                    iconColor: "text-green-600",
                    accentBg: "bg-green-100",
                    actionBg: "bg-green-600 hover:bg-green-700",
                };
            case "error":
                return {
                    bgColor: "bg-red-50 border-red-200",
                    titleColor: "text-red-900",
                    messageColor: "text-red-700",
                    icon: "zi-close-circle",
                    iconColor: "text-red-600",
                    accentBg: "bg-red-100",
                    actionBg: "bg-red-600 hover:bg-red-700",
                };
            case "warn":
                return {
                    bgColor: "bg-yellow-50 border-yellow-200",
                    titleColor: "text-yellow-900",
                    messageColor: "text-yellow-700",
                    icon: "zi-warning",
                    iconColor: "text-yellow-600",
                    accentBg: "bg-yellow-100",
                    actionBg: "bg-yellow-600 hover:bg-yellow-700",
                };
            case "info":
            default:
                return {
                    bgColor: "bg-blue-50 border-blue-200",
                    titleColor: "text-blue-900",
                    messageColor: "text-blue-700",
                    icon: "zi-info-circle",
                    iconColor: "text-blue-600",
                    accentBg: "bg-blue-100",
                    actionBg: "bg-blue-600 hover:bg-blue-700",
                };
        }
    };

    const config = getTypeConfig();

    return (
        <Box
            className={`fixed top-20 left-4 right-4 z-1000000 transition-all duration-300 transform ${
                isAnimating ? "translate-y-0 opacity-100" : "translate-y-full opacity-0"
            }`}
        >
            <Box className={`rounded-2xl border-2 p-4 shadow-2xl backdrop-blur-sm ${config.bgColor}`}>
                <Box className="flex items-start gap-3">
                    {/* Icon */}
                    {/* <Box className={`flex-shrink-0 p-2 rounded-xl ${config.accentBg}`}>
                        <Icon icon={config.icon} className={config.iconColor} size={24} />
                    </Box> */}

                    {/* Content */}
                    <Box className="flex-1 min-w-0">
                        {title && <Text className={`font-bold text-sm mb-1 ${config.titleColor}`}>{title}</Text>}
                        <Text className={`text-sm leading-relaxed ${config.messageColor}`}>{message}</Text>

                        {/* Action Button */}
                        {action && (
                            <Box className="mt-3">
                                <button
                                    onClick={handleAction}
                                    className={`px-4 py-2 rounded-lg text-white text-sm font-semibold transition-colors duration-200 ${config.actionBg}`}
                                >
                                    {action.label}
                                </button>
                            </Box>
                        )}
                    </Box>

                    {/* Close Button */}
                    <button
                        onClick={handleClose}
                        className={`flex-shrink-0 p-1.5 rounded-lg hover:bg-black/10 transition-colors duration-200 ${config.titleColor}`}
                    >
                        <Icon icon="zi-close" size={20} />
                    </button>
                </Box>
            </Box>
        </Box>
    );
}

export default Toast;
