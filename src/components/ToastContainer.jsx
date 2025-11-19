import { Box } from "zmp-ui";
import Toast from "./Toast";

function ToastContainer({ toasts = [], onRemoveToast = () => {} }) {
    return (
        <Box>
            {toasts.map((toast) => (
                <Toast
                    key={toast.id}
                    type={toast.type}
                    title={toast.title}
                    message={toast.message}
                    duration={0}
                    visible={toast.visible}
                    action={toast.action}
                    onClose={() => onRemoveToast(toast.id)}
                />
            ))}
        </Box>
    );
}

export default ToastContainer;
