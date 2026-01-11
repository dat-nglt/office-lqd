import { Button, Icon } from "zmp-ui";

function GetLocationButton({ onGetLocation, isCheckingLocation }) {
  return (
    <Button
      variant="primary"
      fullWidth
      onClick={onGetLocation}
      disabled={isCheckingLocation}
      className="py-3 rounded-lg font-semibold text-base bg-blue-600 hover:bg-blue-700 flex items-center justify-center gap-2"
    >
      {isCheckingLocation ? (
        <>
          <Icon icon="zi-loading" className="animate-spin" size={16} />
          Đang lấy vị trí...
        </>
      ) : (
        <>Xác Định Vị Trí Hiện Tại</>
      )}
    </Button>
  );
}

export default GetLocationButton;
