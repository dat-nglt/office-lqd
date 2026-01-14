import { Box, Text, Icon, Page, Modal, Input } from "zmp-ui";
import { useState, useEffect, useContext, useRef } from "react";
import { getAllCustomersService } from "../services/customers.service";
import BottomNavigation from "../components/BottomNavigation";
import { ToastContext } from "../components/layout";
import CheckInHeader from "../components/checkin/CheckInHeader";

function Customer() {
  const toast = useContext(ToastContext);

  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [formCustomer, setFormCustomer] = useState({
    name: "",
    phone: "",
    address: "",
    location_lat: "",
    location_lng: "",
    notes: "",
  });
  const [isSaving, setIsSaving] = useState(false);

  const deleteConfirmRef = useRef(null);

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        setLoading(true);
        const resp = await getAllCustomersService();
        const data = Array.isArray(resp) ? resp : resp.data || [];
        setCustomers(
          data.map((c) => ({
            id: c.id,
            name: c.name || "Không tên",
            phone: c.phone || "",
            address: c.address || "",
            location_lat: c.location_lat || "",
            location_lng: c.location_lng || "",
            notes: c.notes || "",
          }))
        );
      } catch (err) {
        console.error("Error loading customers:", err);
        setError("Không thể tải danh sách khách hàng.");
        setCustomers([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCustomers();
  }, []);

  const filteredCustomers = customers;

  const openEditModal = (customer) => {
    setSelectedCustomer(customer);
    setFormCustomer({ ...customer });
    setShowEditModal(true);
  };

  const saveCustomer = async () => {
    if (!formCustomer.name || formCustomer.name.trim() === "") {
      toast?.error?.({ title: "Thiếu thông tin", message: "Tên khách hàng là bắt buộc", duration: 2000 });
      return;
    }

    setIsSaving(true);
    try {
      // For now we persist locally. Backend endpoints for create/update are not defined in apiEndpoints.
      if (selectedCustomer) {
        setCustomers((prev) => prev.map((c) => (c.id === selectedCustomer.id ? { ...c, ...formCustomer } : c)));
        toast?.success?.({
          title: "Cập nhật thành công",
          message: "Thông tin khách hàng đã được cập nhật",
          duration: 2000,
        });
      } else {
        const newItem = { ...formCustomer, id: `c_${Date.now()}` };
        setCustomers((prev) => [newItem, ...prev]);
        toast?.success?.({ title: "Thêm thành công", message: "Đã thêm khách hàng mới", duration: 2000 });
      }
      setShowEditModal(false);
    } catch (err) {
      console.error("Error saving customer:", err);
      toast?.error?.({ title: "Lỗi", message: "Không thể lưu khách hàng", duration: 2000 });
    } finally {
      setIsSaving(false);
    }
  };

  const confirmDelete = (customer) => {
    setSelectedCustomer(customer);
    setShowDeleteModal(true);
  };

  const deleteCustomer = async () => {
    if (!selectedCustomer) return;
    try {
      setCustomers((prev) => prev.filter((c) => c.id !== selectedCustomer.id));
      toast?.success?.({ title: "Xóa thành công", message: "Khách hàng đã được xóa", duration: 2000 });
      setShowDeleteModal(false);
    } catch (err) {
      console.error("Error deleting customer:", err);
      toast?.error?.({ title: "Lỗi", message: "Không thể xóa khách hàng", duration: 2000 });
    }
  };

  useEffect(() => {
    if (showDeleteModal) {
      setTimeout(() => deleteConfirmRef.current?.focus(), 120);
    }
  }, [showDeleteModal]);

  return (
    <Page className="bg-gray-50 min-h-screen pb-20">
      <CheckInHeader title={"Quản lý khách hàng"} />
      <Box className="px-4 pt-4 pb-28">
        <Box className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <Box className="divide-y divide-gray-200">
            {loading ? (
              <Box className="text-center py-12">
                <Icon icon="zi-spinner" className="text-green-600 text-5xl mb-4 animate-spin" />
                <Text className="text-gray-600 font-semibold">Đang tải danh sách khách hàng...</Text>
              </Box>
            ) : error ? (
              <Box className="text-center py-12">
                <Icon icon="zi-alert" className="text-yellow-600 text-5xl mb-4" />
                <Text className="text-yellow-600 mb-2 font-semibold">Có lỗi</Text>
                <Text className="text-gray-500 text-sm">{error}</Text>
              </Box>
            ) : filteredCustomers.length > 0 ? (
              filteredCustomers.map((c) => (
                <Box key={c.id} className="p-4 hover:bg-gray-50 transition-colors">
                  <Box className="flex items-start justify-between gap-2 mb-2">
                    <Box className="flex-1 min-w-0">
                      <Text className="font-semibold text-gray-900 line-clamp-2">{c.name}</Text>
                      <Text className="text-xs text-gray-600">{c.phone}</Text>
                      <Text className="text-xs text-gray-500 mt-1">{c.address}</Text>
                    </Box>
                    <Box className="flex gap-2 flex-shrink-0">
                      <button
                        onClick={() => openEditModal(c)}
                        className="px-3 py-2 bg-orange-600 text-white rounded text-xs font-semibold hover:bg-orange-700 transition-colors"
                      >
                        Sửa
                      </button>
                      <button
                        onClick={() => confirmDelete(c)}
                        className="px-3 py-2 bg-red-600 text-white rounded text-xs font-semibold hover:bg-red-700 transition-colors"
                      >
                        Xóa
                      </button>
                    </Box>
                  </Box>
                </Box>
              ))
            ) : (
              <Box className="text-center py-12 p-4">
                <Icon icon="zi-check-circle" className="text-gray-400 text-5xl mb-4" />
                <Text className="text-gray-600 font-semibold">Không có khách hàng</Text>
                <Text className="text-gray-500 text-xs mt-1">Thêm khách hàng mới bằng nút Thêm</Text>
              </Box>
            )}
          </Box>
        </Box>
      </Box>
      {/* Edit / Add Modal */}
      <Modal visible={showEditModal} onClose={() => setShowEditModal(false)}>
        <Box className="p-0 space-y-4">
          <Box className="bg-green-50 rounded p-3 border border-green-200">
            <Text className="text-xs text-green-700 mb-1 font-semibold">
              {selectedCustomer ? "Cập nhật" : "Thêm"} khách hàng
            </Text>
            <Text className="font-semibold text-gray-900 text-sm">{formCustomer.name || ""}</Text>
          </Box>

          <Box>
            <Text className="text-sm font-semibold text-gray-700 mb-2">Tên khách hàng</Text>
            <Input
              placeholder="Tên khách hàng"
              value={formCustomer.name}
              onChange={(e) => setFormCustomer((p) => ({ ...p, name: e.target.value }))}
            />
          </Box>

          <Box>
            <Text className="text-sm font-semibold text-gray-700 mb-2">Số điện thoại</Text>
            <Input
              placeholder="SĐT"
              value={formCustomer.phone}
              onChange={(e) => setFormCustomer((p) => ({ ...p, phone: e.target.value }))}
            />
          </Box>

          <Box>
            <Text className="text-sm font-semibold text-gray-700 mb-2">Địa chỉ</Text>
            <Input
              placeholder="Địa chỉ"
              value={formCustomer.address}
              onChange={(e) => setFormCustomer((p) => ({ ...p, address: e.target.value }))}
              rows={2}
            />
          </Box>

          <Box className="flex gap-2">
            <button
              onClick={() => setShowEditModal(false)}
              className="flex-1 px-3 py-2 bg-gray-200 text-gray-800 rounded font-semibold hover:bg-gray-300 transition-colors text-sm"
            >
              Hủy
            </button>
            <button
              onClick={saveCustomer}
              disabled={isSaving}
              className="flex-1 px-3 py-2 bg-green-600 text-white rounded font-semibold hover:bg-green-700 transition-colors text-sm"
            >
              {isSaving ? "Đang lưu..." : "Lưu"}
            </button>
          </Box>
        </Box>
      </Modal>
      {/* Delete Confirm Modal */}
      <Modal visible={showDeleteModal} onClose={() => setShowDeleteModal(false)}>
        <Box className="p-0 space-y-4">
          {selectedCustomer && (
            <>
              <Box className="bg-red-50 rounded p-3 border border-red-200">
                <Text className="text-xs text-red-900 font-semibold mb-1">Xác nhận xóa</Text>
                <Text className="font-semibold text-gray-900 text-sm">{selectedCustomer.name}</Text>
              </Box>

              <Box>
                <Text className="text-sm text-gray-700 mb-2">
                  Bạn có chắc chắn muốn xóa khách hàng này? Hành động sẽ không thể hoàn tác.
                </Text>
              </Box>

              <Box className="flex gap-2 mt-3">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="flex-1 px-3 py-2 bg-gray-200 text-gray-800 rounded font-semibold hover:bg-gray-300 transition-colors text-sm"
                >
                  Quay lại
                </button>
                <button
                  ref={deleteConfirmRef}
                  onClick={deleteCustomer}
                  className="flex-1 px-3 py-2 bg-red-600 text-white rounded font-semibold hover:bg-red-700 transition-colors text-sm"
                >
                  Xóa
                </button>
              </Box>
            </>
          )}
        </Box>
      </Modal>
      <BottomNavigation />
    </Page>
  );
}

export default Customer;
