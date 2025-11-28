import { getSystemInfo } from "zmp-sdk";
import { AnimationRoutes, App, Route, SnackbarProvider, ZMPRouter } from "zmp-ui";

import HomePage from "../pages/index";
import WorkListPage from "../pages/WorkList";
import Notifications from "../pages/Notifications";
import WorkManagement from "../pages/WorkManagement";
import EmployeeProfile from "../pages/EmployeeProfile";
import CheckIn from "../pages/CheckIn";
import ToastContainer from "./ToastContainer";
import { useToast } from "../hooks/useToast";

// Create Toast Context
import React from "react";
import ProgressReport from "../pages/ProgressReport";
export const ToastContext = React.createContext();

const Layout = () => {
    const { toasts, removeToast, success, error, warn, info } = useToast();

    return (
        <App theme={getSystemInfo().zaloTheme}>
            <SnackbarProvider>
                <ToastContext.Provider value={{ success, error, warn, info }}>
                    <ZMPRouter>
                        <AnimationRoutes>
                            <Route path="/" element={<HomePage />}></Route>
                            <Route path="/report" element={<ProgressReport />}></Route>
                            <Route path="/worklist" element={<WorkListPage />}></Route>
                            <Route path="/notifications" element={<Notifications />}></Route>
                            <Route path="/work-management" element={<WorkManagement />}></Route>
                            <Route path="/profile" element={<EmployeeProfile />}></Route>
                            <Route path="/checkin" element={<CheckIn />}></Route>
                        </AnimationRoutes>
                    </ZMPRouter>
                    <ToastContainer toasts={toasts} onRemoveToast={removeToast} />
                </ToastContext.Provider>
            </SnackbarProvider>
        </App>
    );
};

export default Layout;
