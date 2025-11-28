import { Button, Icon } from "zmp-ui";

function GetLocationButton({ onGetLocation, isCheckingLocation }) {
  return (
    <Button
      variant="primary"
      fullWidth
      onClick={onGetLocation}
      disabled={isCheckingLocation}
      className={`py-3 rounded-lg font-semibold text-base flex items-center justify-center gap-2 ${
        isCheckingLocation
          ? "bg-gray-400 cursor-not-allowed"
          : "bg-blue-600 hover:bg-blue-700"
      }`}
    >
      {isCheckingLocation ? (
        <>
          <Icon icon="zi-loading" className="animate-spin" size={16} />
          Đang lấy vị trí...
        </>
      ) : (
        <>
          <Icon icon="zi-location" size={16} />
          Xác Định Vị Trí
        </>
      )}
    </Button>
  );
}

export default GetLocationButton;
