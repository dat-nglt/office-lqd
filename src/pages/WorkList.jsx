import { Box, Text, Icon, Button, Page } from "zmp-ui";
import { useState, useMemo, useContext } from "react";
import BottomNavigation from "../components/BottomNavigation";
import WorkCard from "../components/WorkCard";
import WorkDetailModal from "../components/WorkDetailModal";
import { ToastContext } from "../components/layout";

function WorkList() {
    const toast = useContext(ToastContext);
    const [selectedPeriod, setSelectedPeriod] = useState("today");
    const [selectedWorkType, setSelectedWorkType] = useState("all");
    const [selectedWork, setSelectedWork] = useState(null);
    const [showDetailModal, setShowDetailModal] = useState(false);

    const [workList] = useState([
        {
            id: 1,
            workName: "Bảo trì điều hòa",
            title: "Bảo trì điều hòa",
            date: "17/11/2025",
            scheduledDate: "17/11/2025",
            scheduledTime: "08:00 - 12:00",
            company: "NEXUS HOUSE",
            status: "in_progress",
            priority: "high",
            service: "Bảo trì",
            workType: "service",
            progress: 75,
            customerName: "Nguyễn Văn A",
            phoneNumber: "0901234567",
            location: "05A Quốc Hương, Phường An Khánh, Quận 2, TP.HCM",
            address: "05A Quốc Hương, Phường An Khánh, Quận 2, TP.HCM",
            coordinates: { lat: 10.7769, lng: 106.7009 },
            content: "Bảo trì hệ thống điều hòa định kỳ",
            notes: "Cần kiểm tra gas và lọc. Mang theo dụng cụ vệ sinh máy lạnh.",
            technicians: [
                { name: "Nguyễn Văn A", phone: "0901234567", specialization: "Điều hòa" },
                { name: "Nguyễn Văn A", phone: "0901234567", specialization: "Điều hòa" },
            ],
        },
        {
            id: 2,
            workName: "Sửa chữa hệ thống điện",
            title: "Sửa chữa hệ thống điện",
            date: "17/11/2025",
            scheduledDate: "17/11/2025",
            scheduledTime: "13:00 - 17:00",
            company: "VINHOMES",
            status: "pending",
            priority: "high",
            service: "Sửa chữa",
            workType: "project",
            progress: 0,
            customerName: "Trần Thị B",
            phoneNumber: "0902345678",
            location: "456 Lê Văn Việt, Quận 9, TP.HCM",
            address: "456 Lê Văn Việt, Quận 9, TP.HCM",
            coordinates: { lat: 10.8411, lng: 106.8097 },
            content: "Sửa chữa hệ thống điện và kiểm tra bảng mạch",
            notes: "Có bảng mạch bị lỗi. Cần kiểm tra và thay thế nếu cần.",
            technicians: [{ name: "Trần Văn B", phone: "0907654321", specialization: "Điện công nghiệp" }],
        },
        {
            id: 3,
            workName: "Kiểm tra an ninh",
            title: "Kiểm tra an ninh",
            date: "16/11/2025",
            scheduledDate: "16/11/2025",
            scheduledTime: "09:30 - 11:30",
            company: "MASTERI",
            status: "completed",
            priority: "medium",
            service: "Kiểm tra",
            workType: "project",
            progress: 100,
            customerName: "Lê Văn C",
            phoneNumber: "0903456789",
            location: "789 Võ Văn Ngân, Thủ Đức, TP.HCM",
            address: "789 Võ Văn Ngân, Thủ Đức, TP.HCM",
            coordinates: { lat: 10.8505, lng: 106.7717 },
            content: "Kiểm tra hệ thống camera an ninh",
            notes: "Hoàn thành đúng giờ. Tất cả camera hoạt động bình thường.",
            technicians: [{ name: "Lê Văn C", phone: "0903456789", specialization: "An ninh" }],
        },
    ]);

    const periodOptions = [
        { value: "today", label: "Hôm nay" },
        { value: "week", label: "Tuần này" },
        { value: "month", label: "Tháng này" },
    ];

    const workTypeOptions = [
        { value: "all", label: "Tất cả" },
        { value: "project", label: "Dự án" },
        { value: "service", label: "Dịch vụ" },
    ];

    const filteredWorkList = useMemo(() => {
        let filtered = workList;

        if (selectedWorkType !== "all") {
            filtered = filtered.filter((work) => work.workType === selectedWorkType);
        }

        if (selectedPeriod === "today") {
            filtered = filtered.filter((work) => work.date === "17/11/2025");
        } else if (selectedPeriod === "week") {
            filtered = filtered.filter((work) => ["17/11/2025", "18/11/2025", "16/11/2025"].includes(work.date));
        }

        return filtered.sort((a, b) => {
            const statusOrder = { pending: 1, in_progress: 2, completed: 3 };
            return statusOrder[a.status] - statusOrder[b.status];
        });
    }, [workList, selectedWorkType, selectedPeriod]);

    const getWorkStats = () => {
        const completed = filteredWorkList.filter((w) => w.status === "completed").length;
        const inProgress = filteredWorkList.filter((w) => w.status === "in_progress").length;
        const pending = filteredWorkList.filter((w) => w.status === "pending").length;

        return { completed, inProgress, pending, total: filteredWorkList.length };
    };

    const stats = getWorkStats();

    const handleViewDetail = (work) => {
        setSelectedWork(work);
        setShowDetailModal(true);
    };

    const getStatusColor = (status) => {
        switch (status) {
            case "completed":
                return "bg-green-100 text-green-800 border-green-300";
            case "in_progress":
                return "bg-blue-100 text-blue-800 border-blue-300";
            case "pending":
                return "bg-yellow-100 text-yellow-800 border-yellow-300";
            default:
                return "bg-gray-100 text-gray-800 border-gray-300";
        }
    };

    const getStatusLabel = (status) => {
        switch (status) {
            case "completed":
                return "Hoàn thành";
            case "in_progress":
                return "Đang thực hiện";
            case "pending":
                return "Chờ thực hiện";
            default:
                return "Không xác định";
        }
    };

    return (
        <Page className="bg-gray-50 min-h-screen pb-20">
            {/* Enhanced Header */}
            <Box className="bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 shadow-lg pb-4 relative overflow-hidden">
                {/* Background Effects */}
                <Box className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full -mr-24 -mt-24"></Box>
                <Box className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full -ml-16 -mb-16"></Box>

                <Box className="px-4 pt-10 mt-5 pb-2 relative z-10">
                    {/* Title */}
                    <Box className="flex items-center justify-between mb-4">
                        <Text.Title className="text-white font-bold" size="large">
                            Lịch Công Việc
                        </Text.Title>
                        <Box className="flex items-center space-x-2 text-sm text-blue-100">
                            <Icon icon="zi-clock-1" size={16} />
                            <Text>{new Date().toLocaleDateString("vi-VN")}</Text>
                        </Box>
                    </Box>

                    {/* Quick Stats */}
                    <Box className="grid grid-cols-4 gap-2 mb-3">
                        <Box className="bg-white/15 backdrop-blur-md rounded-xl p-2 border border-white/20 text-center">
                            <Text className="text-sm font-bold text-white">{stats.pending}</Text>
                            <Text className="text-xs text-blue-100/70">Chờ</Text>
                        </Box>
                        <Box className="bg-white/15 backdrop-blur-md rounded-xl p-2 border border-white/20 text-center">
                            <Text className="text-sm font-bold text-white">{stats.inProgress}</Text>
                            <Text className="text-xs text-blue-100/70">Đang</Text>
                        </Box>
                        <Box className="bg-white/15 backdrop-blur-md rounded-xl p-2 border border-white/20 text-center">
                            <Text className="text-sm font-bold text-white">{stats.completed}</Text>
                            <Text className="text-xs text-blue-100/70">Xong</Text>
                        </Box>
                        <Box className="bg-white/15 backdrop-blur-md rounded-xl p-2 border border-white/20 text-center">
                            <Text className="text-sm font-bold text-white">{stats.total}</Text>
                            <Text className="text-xs text-blue-100/70">Tổng</Text>
                        </Box>
                    </Box>

                    <Box className="flex space-x-2">
                        {periodOptions.map((option) => (
                            <Button
                                key={option.value}
                                size="small"
                                variant={selectedPeriod === option.value ? "primary" : "secondary"}
                                className={`flex-1 rounded-lg text-xs ${
                                    selectedPeriod === option.value
                                        ? "bg-white text-blue-600"
                                        : "bg-white/20 text-white"
                                }`}
                                onClick={() => setSelectedPeriod(option.value)}
                            >
                                {option.label}
                            </Button>
                        ))}
                    </Box>
                </Box>
            </Box>

            <Box className="p-4 pb-20">
                {/* Work Type Filter */}
                <Box className="mb-2">
                    <Box className="flex space-x-2 overflow-x-auto pb-2">
                        {workTypeOptions.map((option) => (
                            <button
                                key={option.value}
                                onClick={() => setSelectedWorkType(option.value)}
                                className={`rounded-full flex-1 px-4 py-1.5 text-xs font-semibold whitespace-nowrap border transition-all ${
                                    selectedWorkType === option.value
                                        ? "bg-blue-600 text-white border-blue-600"
                                        : "bg-white text-gray-700 border-gray-300 hover:border-blue-300"
                                }`}
                            >
                                {option.label}
                            </button>
                        ))}
                    </Box>
                </Box>

                {/* Work Cards Grid */}
                <Box className="space-y-3">
                    {filteredWorkList.length > 0 ? (
                        filteredWorkList.map((work) => (
                            <WorkCard
                                key={work.id}
                                work={work}
                                onViewDetail={handleViewDetail}
                                getStatusColor={getStatusColor}
                                getStatusLabel={getStatusLabel}
                            />
                        ))
                    ) : (
                        <Box className="text-center py-12">
                            <Icon icon="zi-calendar-check" className="text-gray-400 text-5xl mb-4" />
                            <Text className="text-gray-500 mb-2 font-semibold">Không có công việc nào</Text>
                            <Text className="text-gray-400 text-sm">Chọn khoảng thời gian khác để xem</Text>
                        </Box>
                    )}
                </Box>
            </Box>

            {/* Work Detail Modal - Use Component */}
            <WorkDetailModal visible={showDetailModal} onClose={() => setShowDetailModal(false)} work={selectedWork} />

            <BottomNavigation />
        </Page>
    );
}

export default WorkList;
