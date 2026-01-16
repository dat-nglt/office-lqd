import { lazy } from "react";

// Lazy load components for better performance
const HomePage = lazy(() => import("../pages/index"));
const Login = lazy(() => import("../pages/Login"));
const WorkListPage = lazy(() => import("../pages/WorkList"));
const Notifications = lazy(() => import("../pages/Notifications"));
const WorkManagement = lazy(() => import("../pages/WorkManagement"));
const Customer = lazy(() => import("../pages/Customer"));
const EmployeeProfile = lazy(() => import("../pages/EmployeeProfile"));
const CheckIn = lazy(() => import("../pages/Attendance"));
const ProgressReport = lazy(() => import("../pages/ProgressReport"));
const OvertimeRequest = lazy(() => import("../pages/OvertimeRequest"));
const OvertimeList = lazy(() => import("../pages/OvertimeList"));
const WorkReportDetail = lazy(() => import("../pages/WorkReportDetail"));
const AttendanceHistory = lazy(() => import("../pages/AttendanceHistory"));
const CoordinatesGuide = lazy(() => import("../pages/CoordinatesGuide"));

export const routes = [
  {
    path: "/login",
    component: Login,
    protected: false,
  },
  {
    path: "/",
    component: HomePage,
    protected: true,
  },
  {
    path: "/report/:id",
    component: ProgressReport,
    protected: true,
  },
  {
    path: "/worklist",
    component: WorkListPage,
    protected: true,
  },
  {
    path: "/notifications",
    component: Notifications,
    protected: true,
  },
  {
    path: "/work-management",
    component: WorkManagement,
    protected: true,
  },
  {
    path: "/customers",
    component: Customer,
    protected: true,
  },
  {
    path: "/profile",
    component: EmployeeProfile,
    protected: true,
  },
  {
    path: "/checkin",
    component: CheckIn,
    protected: true,
  },
  {
    path: "/overtime-request",
    component: OvertimeRequest,
    protected: true,
  },
  {
    path: "/work-reports",
    component: OvertimeList,
    protected: true,
  },
  {
    path: "/work-detail/:id",
    component: WorkReportDetail,
    protected: true,
  },
  {
    path: "/attendance-history",
    component: AttendanceHistory,
    protected: true,
  },
  {
    path: "/coordinates-guide",
    component: CoordinatesGuide,
    protected: true,
  },
];
