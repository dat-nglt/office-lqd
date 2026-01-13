import { Box, Text, Button, Icon } from "zmp-ui";
import { useState, useEffect, useRef } from "react";
import { Input } from "zmp-ui";

const MapPickerModal = ({ visible, onClose, onConfirm, initialAddress = "", initialLat = "", initialLng = "" }) => {
  const [address, setAddress] = useState(initialAddress);
  const [latitude, setLatitude] = useState(initialLat || "10.7769");
  const [longitude, setLongitude] = useState(initialLng || "106.7009");
  const [mapSearching, setMapSearching] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  const [accuracy, setAccuracy] = useState("Trung bình");
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const mapContainer = useRef(null);
  const map = useRef(null);
  const marker = useRef(null);
  const circle = useRef(null);

  // Initialize map when modal opens
  useEffect(() => {
    if (!visible) return;

    // Delay to ensure container is rendered
    const timer = setTimeout(() => {
      if (mapContainer.current) {
        // Check if Leaflet is already loaded
        if (!window.L) {
          // Load Leaflet CSS
          if (!document.querySelector('link[href*="leaflet"]')) {
            const link = document.createElement("link");
            link.rel = "stylesheet";
            link.href = "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css";
            document.head.appendChild(link);
          }

          // Load Leaflet JS
          const script = document.createElement("script");
          script.src = "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js";
          script.async = true;
          script.onload = () => {
            // Give DOM time to settle
            setTimeout(initializeMap, 100);
          };
          document.body.appendChild(script);
        } else {
          // Leaflet already loaded
          initializeMap();
        }
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [visible]);

  // Update marker when coordinates change
  useEffect(() => {
    if (map.current && marker.current) {
      const lat = parseFloat(latitude) || 10.7769;
      const lng = parseFloat(longitude) || 106.7009;
      marker.current.setLatLng([lat, lng]);
      map.current.setView([lat, lng], 17);

      if (circle.current) {
        circle.current.setLatLng([lat, lng]);
      }
    }
  }, [latitude, longitude]);

  const initializeMap = () => {
    if (!mapContainer.current || !window.L) return;

    // Clear existing map if any
    if (map.current) {
      map.current.remove();
      map.current = null;
      marker.current = null;
      circle.current = null;
    }

    const L = window.L;
    const lat = parseFloat(latitude) || 10.7769;
    const lng = parseFloat(longitude) || 106.7009;

    try {
      // Create map instance
      map.current = L.map(mapContainer.current, {
        preferCanvas: true,
      }).setView([lat, lng], 17);

      // Add tile layer
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
        minZoom: 1,
      }).addTo(map.current);

      // Add initial marker
      marker.current = L.marker([lat, lng], {
        draggable: true,
        title: "Kéo để điều chỉnh vị trí",
      })
        .addTo(map.current)
        .bindPopup(`${lat.toFixed(6)}, ${lng.toFixed(6)}`);

      // Add accuracy circle
      circle.current = L.circle([lat, lng], {
        color: "blue",
        fillColor: "#30b0fc",
        fillOpacity: 0.1,
        radius: 50,
        weight: 2,
      }).addTo(map.current);

      // Handle marker drag
      marker.current.on("dragend", (e) => {
        const { lat, lng } = e.target.getLatLng();
        updateMarker(lat, lng);
        reverseGeocode(lat, lng);
      });

      // Handle map clicks
      map.current.on("click", (e) => {
        const { lat, lng } = e.latlng;
        updateMarker(lat, lng);
        reverseGeocode(lat, lng);
      });

      // Invalidate map size to ensure proper rendering
      setTimeout(() => {
        if (map.current) {
          map.current.invalidateSize();
        }
      }, 300);
    } catch (error) {
      console.error("Lỗi khởi tạo bản đồ:", error);
    }
  };

  const updateMarker = (lat, lng) => {
    const L = window.L;
    const latStr = lat.toFixed(6);
    const lngStr = lng.toFixed(6);
    setLatitude(latStr);
    setLongitude(lngStr);

    if (marker.current) {
      marker.current.setLatLng([lat, lng]);
      marker.current.setPopupContent(`${latStr}, ${lngStr}`);
    }

    if (circle.current) {
      circle.current.setLatLng([lat, lng]);
    }

    if (map.current) {
      map.current.setView([lat, lng], 17);
    }
  };

  const reverseGeocode = async (lat, lng) => {
    try {
      setMapSearching(true);
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1&accept-language=vi`
      );
      const data = await response.json();

      // Build address with full details
      const addressParts = [];
      const addr = data.address || {};

      if (addr.road) addressParts.push(addr.road);
      if (addr.house_number) addressParts.unshift(addr.house_number);
      if (addr.hamlet) addressParts.push(addr.hamlet);
      if (addr.village) addressParts.push(addr.village);
      if (addr.suburb) addressParts.push(addr.suburb);
      if (addr.district) addressParts.push(addr.district);
      if (addr.city) addressParts.push(addr.city);
      if (addr.county) addressParts.push(addr.county);

      const fullAddress = addressParts.length > 0 ? addressParts.join(", ") : data.display_name;
      setAddress(fullAddress);
      setAccuracy("Cao");
    } catch (error) {
      console.error("Lỗi geocoding ngược:", error);
      setAccuracy("Thấp");
    } finally {
      setMapSearching(false);
    }
  };

  const handleSearchAddress = async () => {
    if (!searchInput.trim()) return;

    try {
      setMapSearching(true);
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          searchInput
        )}&accept-language=vi&countrycodes=vn&limit=5`
      );
      const data = await response.json();

      if (data.length > 0) {
        setSuggestions(data);
        setShowSuggestions(true);
      } else {
        alert("Không tìm thấy địa chỉ. Vui lòng thử lại.");
        setSuggestions([]);
      }
    } catch (error) {
      console.error("Lỗi tìm kiếm địa chỉ:", error);
      alert("Lỗi tìm kiếm địa chỉ");
    } finally {
      setMapSearching(false);
    }
  };

  const handleSelectSuggestion = (result) => {
    const lat = parseFloat(result.lat);
    const lng = parseFloat(result.lon);

    updateMarker(lat, lng);
    setAddress(result.display_name);
    setSearchInput("");
    setSuggestions([]);
    setShowSuggestions(false);
  };

  const handleCurrentLocation = () => {
    if (navigator.geolocation) {
      setMapSearching(true);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          updateMarker(latitude, longitude);
          reverseGeocode(latitude, longitude);
        },
        (error) => {
          console.error("Lỗi lấy vị trí hiện tại:", error);
          alert("Không thể lấy vị trí hiện tại");
          setMapSearching(false);
        }
      );
    } else {
      alert("Thiết bị không hỗ trợ định vị");
    }
  };

  const handleCoordinateChange = (field, value) => {
    const numValue = parseFloat(value);
    if (!isNaN(numValue)) {
      if (field === "latitude") {
        if (numValue >= -90 && numValue <= 90) {
          setLatitude(value);
        }
      } else {
        if (numValue >= -180 && numValue <= 180) {
          setLongitude(value);
        }
      }
    }
  };

  const handleConfirm = () => {
    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);

    if (isNaN(lat) || isNaN(lng)) {
      alert("Vui lòng nhập tọa độ hợp lệ");
      return;
    }

    if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      alert("Tọa độ nằm ngoài phạm vi hợp lệ");
      return;
    }

    onConfirm({
      address: address,
      latitude: latitude,
      longitude: longitude,
    });

    // Cleanup map
    if (map.current) {
      map.current.remove();
      map.current = null;
      marker.current = null;
      circle.current = null;
    }

    onClose();
  };

  const handleCloseModal = () => {
    // Cleanup map
    if (map.current) {
      map.current.remove();
      map.current = null;
      marker.current = null;
      circle.current = null;
    }

    onClose();
  };

  if (!visible) return null;

  return (
    <Box className="fixed inset-0 z-50 flex items-end bg-black bg-opacity-50" onClick={handleCloseModal}>
      <Box
        className="w-full bg-white rounded-t-3xl shadow-2xl max-h-[85vh] overflow-auto flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <Box className="sticky top-0 bg-gradient-to-r from-green-500 to-green-600 p-4 flex items-center justify-between rounded-t-3xl">
          <Box className="flex items-center gap-2">
            <Icon icon="zi-map" className="text-white" size={20} />
            <Text className="text-white font-bold text-lg">Chọn Vị Trí Trên Bản Đồ</Text>
          </Box>
          <button onClick={handleCloseModal} className="p-1 hover:bg-green-700 rounded-full transition-colors">
            <Icon icon="zi-close" className="text-white" size={20} />
          </button>
        </Box>

        {/* Content */}
        <Box className="flex-1 overflow-auto">
          {/* Map Container */}
          <Box ref={mapContainer} className="w-full bg-gray-200" style={{ minHeight: "380px", height: "380px" }} />

          {/* Search Section */}
          <Box className="p-4 bg-gray-50 border-b border-gray-200 space-y-3">
            {/* Search Input */}
            <Box className="relative">
              <Box className="flex gap-2">
                <Input
                  placeholder="Tìm kiếm địa chỉ (VD: Số 5 Đường Lê Lợi, TP.HCM)..."
                  value={searchInput}
                  onChange={(e) => {
                    setSearchInput(e.target.value);
                    if (e.target.value.trim()) {
                      setShowSuggestions(true);
                    }
                  }}
                  onKeyPress={(e) => {
                    if (e.key === "Enter") {
                      handleSearchAddress();
                    }
                  }}
                  className="flex-1"
                />
                <Button
                  onClick={handleSearchAddress}
                  disabled={mapSearching || !searchInput.trim()}
                  className="px-3 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-semibold transition-colors disabled:opacity-50"
                >
                  <Icon icon="zi-search" size={16} />
                </Button>
              </Box>

              {/* Suggestions Dropdown */}
              {showSuggestions && suggestions.length > 0 && (
                <Box className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-10 max-h-48 overflow-y-auto">
                  {suggestions.map((result, index) => (
                    <button
                      key={index}
                      onClick={() => handleSelectSuggestion(result)}
                      className="w-full text-left px-3 py-2 hover:bg-orange-50 border-b border-gray-200 last:border-0 transition-colors"
                    >
                      <Text className="text-sm font-medium text-gray-900 line-clamp-1">{result.display_name}</Text>
                      {result.address && (
                        <Text className="text-xs text-gray-500 line-clamp-1">
                          {result.address.city || result.address.county}
                        </Text>
                      )}
                    </button>
                  ))}
                </Box>
              )}
            </Box>

            <Box className="flex gap-2">
              <button
                onClick={handleCurrentLocation}
                disabled={mapSearching}
                className="flex-1 px-3 py-2 border-2 border-blue-400 text-blue-600 rounded-lg font-semibold hover:bg-blue-50 active:bg-blue-100 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <Icon icon="zi-location" size={16} />
                Vị Trí Hiện Tại
              </button>
              <Box className="flex-1 px-3 py-2 bg-blue-100 text-blue-800 rounded-lg font-semibold text-xs flex items-center justify-center">
                <Icon icon="zi-info" size={14} className="mr-1" />
                Độ chính xác: {accuracy}
              </Box>
            </Box>
          </Box>
          {/* Info Section */}
          <Box className="p-4 space-y-3 bg-white border-t border-gray-200">
            {/* Address Input */}
            <Box>
              <Text className="text-xs text-gray-700 font-medium mb-1 px-1">Địa Chỉ (Tự Động Cập Nhật)</Text>
              <Input
                placeholder="Địa chỉ sẽ được cập nhật khi bạn chọn vị trí trên bản đồ"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                rows={2}
                className="w-full"
              />
            </Box>

            {/* Coordinate Inputs with Validation */}
            <Box>
              <Text className="text-xs text-gray-700 font-medium mb-2 px-1 flex items-center">
                <Icon icon="zi-location" size={14} className="mr-1" />
                Tọa Độ (Có Thể Chỉnh Sửa)
              </Text>
              <Box className="grid grid-cols-2 gap-2">
                <Box>
                  <Text className="text-xs text-gray-600 mb-1 px-1">Vĩ độ (Latitude)</Text>
                  <Box className="relative">
                    <Input
                      placeholder="-90 ~ 90"
                      value={latitude}
                      onChange={(e) => handleCoordinateChange("latitude", e.target.value)}
                      className="w-full"
                    />
                    <Text className="text-xs text-gray-500 mt-1 px-1">
                      {parseFloat(latitude) >= -90 && parseFloat(latitude) <= 90 ? "✓ Hợp lệ" : "✗ Không hợp lệ"}
                    </Text>
                  </Box>
                </Box>
                <Box>
                  <Text className="text-xs text-gray-600 mb-1 px-1">Kinh độ (Longitude)</Text>
                  <Box className="relative">
                    <Input
                      placeholder="-180 ~ 180"
                      value={longitude}
                      onChange={(e) => handleCoordinateChange("longitude", e.target.value)}
                      className="w-full"
                    />
                    <Text className="text-xs text-gray-500 mt-1 px-1">
                      {parseFloat(longitude) >= -180 && parseFloat(longitude) <= 180 ? "✓ Hợp lệ" : "✗ Không hợp lệ"}
                    </Text>
                  </Box>
                </Box>
              </Box>
            </Box>

            {/* Hints */}
            <Box className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <Text className="text-xs text-blue-800 font-medium mb-2">💡 Mẹo sử dụng:</Text>
              <Text className="text-xs text-blue-700">
                • Click trực tiếp trên bản đồ để chọn vị trí{"\n"}• Kéo marker để điều chỉnh vị trí{"\n"}• Tìm kiếm hoặc
                chỉnh sửa tọa độ thủ công{"\n"}• Độ chính xác sẽ cập nhật tự động
              </Text>
            </Box>
          </Box>
        </Box>

        {/* Actions */}
        <Box className="sticky bottom-0 p-4 bg-gray-50 border-t border-gray-200 flex gap-2">
          <Button
            onClick={handleCloseModal}
            fullWidth
            variant="secondary"
            className="px-3 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg text-sm font-semibold transition-colors"
          >
            Hủy
          </Button>
          <Button
            onClick={handleConfirm}
            fullWidth
            disabled={mapSearching}
            className="px-3 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-semibold transition-colors disabled:opacity-50"
          >
            {mapSearching ? "Đang xử lý..." : "✓ Xác Nhận"}
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default MapPickerModal;
