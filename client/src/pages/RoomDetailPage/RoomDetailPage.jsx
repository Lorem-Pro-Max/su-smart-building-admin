import { useParams } from "react-router-dom";
import { Button, ConfigProvider } from "antd";
import {
  RoomTitleBadgeIcon,
  RoomChairIcon,
  EditRoomButtonIcon,
  DeviceGridDoorsIcon,
  DeviceGridFansIcon,
  DeviceGridLightsIcon,
  DeviceGridAcIcon,
} from "@assets/icons";
import DeviceGridCard from "@components/layout/ContentLayout/DeviceGridCard";
import AcGridCard from "@components/layout/ContentLayout/AcGridCard";
import EditRoomModal from "./components/EditRoomModal";
import OnOffSegmented from "@components/layout/ContentLayout/OnOffSegmented";
import { useRoomDetail } from "@hooks/pageHooks/useRoomDetail";
import { DEVICE_CONFIGS } from "@config/devices";
import { getDeviceUid } from "@hooks/devices/useDeviceSelection";
import { ContentLayoutTheme } from "@styles/themes/contentLayoutTheme";

const metaRegularStyle = {
  fontFamily: "var(--font-main)",
  fontWeight: 400,
  fontSize: 16,
  lineHeight: "24px",
  letterSpacing: "0.005em",
  color: "#000000",
};

const metaMediumStyle = { ...metaRegularStyle, fontWeight: 500 };

function DeviceTypeSection({ label, Icon, devices, control }) {
  if (devices.length === 0) return null;

  return (
    <div className="flex flex-col" style={{ gap: 16 }}>
      <h4 style={{ fontFamily: "var(--font-main)", fontWeight: 500, fontSize: 18 }}>
        {label}
      </h4>
      <div className="flex flex-wrap" style={{ gap: 24 }}>
        {devices.map((device, index) => {
          const uid = getDeviceUid(device);
          return (
            <DeviceGridCard
              key={uid}
              Icon={Icon}
              name={devices.length > 1 ? `${label} ${index + 1}` : label}
              isOn={device.isOn}
              onToggle={(isTurningOn) =>
                control.handleSingleToggle(uid, isTurningOn)
              }
            />
          );
        })}
      </div>
    </div>
  );
}

function AcTypeSection({ label, Icon, devices, control, tempControl }) {
  if (devices.length === 0) return null;

  const primaryDevice = devices[0];
  const anyOn = devices.some((device) => device.isOn);
  const allUids = devices.map(getDeviceUid);

  return (
    <div className="flex flex-col" style={{ gap: 16 }}>
      <h4 style={{ fontFamily: "var(--font-main)", fontWeight: 500, fontSize: 18 }}>
        {label}
      </h4>
      <div className="flex">
        <AcGridCard
          title={`${label} ${devices.length} เครื่อง`}
          device={primaryDevice}
          Icon={Icon}
          isOn={anyOn}
          onToggle={(isTurningOn) =>
            control.handleExecuteAction(allUids, isTurningOn ? "on" : "off")
          }
          tempControl={tempControl}
        />
      </div>
    </div>
  );
}

function RoomDetailPage() {
  const { roomId } = useParams();
  const {
    room,
    roomDevices,
    controls,
    handleMasterSwitch,
    tempControl,
    editModal,
    contextHolder,
    deviceContextHolders,
  } = useRoomDetail(roomId);

  const allDevices = [
    ...roomDevices.doors,
    ...roomDevices.fans,
    ...roomDevices.lights,
    ...roomDevices.ac,
  ];
  const anyOn = allDevices.some((device) => device.isOn);

  return (
    <ConfigProvider theme={ContentLayoutTheme}>
      <div className="w-full h-full bg-page-mint flex flex-col overflow-y-auto">
        {contextHolder}
        {deviceContextHolders}

        <EditRoomModal
          open={editModal.isOpen}
          room={room}
          isSaving={editModal.isSaving}
          onCancel={editModal.close}
          onSave={editModal.save}
        />

        {/* Header band */}
        <div className="w-full flex justify-center shrink-0">
          <div
            className="w-full max-w-max-page-content flex items-start justify-between"
            style={{ padding: 24, gap: 24 }}
          >
            <div className="flex flex-col flex-1 min-w-0" style={{ gap: 16 }}>
              <div className="flex items-center" style={{ height: 40, gap: 16 }}>
                <div className="flex items-center" style={{ gap: 8 }}>
                  <RoomTitleBadgeIcon />
                  <span
                    style={{
                      fontFamily: "var(--font-main)",
                      fontWeight: 500,
                      fontSize: 20,
                      lineHeight: "32px",
                      letterSpacing: "0.0025em",
                      color: "#000000",
                    }}
                  >
                    {room?.name || "ห้อง"}
                  </span>
                </div>

                <Button
                  onClick={editModal.open}
                  icon={<EditRoomButtonIcon />}
                  style={{
                    width: 190,
                    height: 40,
                    padding: "0 16px",
                    background: "#E6FFFB",
                    border: "1px solid #13C2C2",
                    borderRadius: 8,
                    color: "rgba(0, 0, 0, 0.85)",
                  }}
                >
                  แก้ไขข้อมูลห้องเรียน
                </Button>
              </div>

              <div className="flex items-center" style={{ gap: 16 }}>
                <span style={metaRegularStyle}>
                  ชั้น <span style={metaMediumStyle}>{room?.floor ?? "-"}</span>
                </span>
                <div className="flex items-start" style={{ gap: 4 }}>
                  <span style={metaRegularStyle}>ขนาดห้อง</span>
                  <RoomChairIcon />
                </div>
                <span style={metaMediumStyle}>
                  จำนวนนั่งเรียน{" "}
                  <span style={{ color: "#08979C" }}>
                    {room?.study_seats ?? "-"}
                  </span>{" "}
                  คน
                </span>
                <span style={{ width: 1, height: 16, background: "#D9D9D9" }} />
                <span style={metaMediumStyle}>
                  จำนวนนั่งสอบ{" "}
                  <span style={{ color: "#08979C" }}>
                    {room?.exam_seats ?? "-"}
                  </span>{" "}
                  คน
                </span>
              </div>
            </div>

            <div
              className="flex items-center shrink-0"
              style={{
                width: 373,
                height: 84,
                background: "#FFFFFF",
                borderRadius: 24,
                padding: "16px 24px",
                gap: 24,
                boxShadow: "1px 2px 10px 0px rgba(142, 142, 142, 0.25)",
              }}
            >
              <span
                style={{
                  fontFamily: "var(--font-main)",
                  fontWeight: 500,
                  fontSize: 24,
                  lineHeight: "32px",
                  letterSpacing: 0,
                  color: "#1E1E1E",
                }}
              >
                Master switch
              </span>
              <OnOffSegmented
                isOn={anyOn}
                onChange={(isTurningOn) =>
                  handleMasterSwitch(isTurningOn ? "on" : "off")
                }
              />
            </div>
          </div>
        </div>

        {/* Body band */}
        <div className="w-full flex justify-center">
          <div
            className="w-full max-w-max-page-content flex flex-col"
            style={{ gap: 16, padding: 24 }}
          >
            <div
              className="flex items-center justify-center"
              style={{
                width: 99,
                height: 40,
                background: "#FAAD14",
                borderRadius: 8,
                fontFamily: "var(--font-main)",
                fontWeight: 500,
                fontSize: 20,
              }}
            >
              อุปกรณ์
            </div>

            <DeviceTypeSection
              label={DEVICE_CONFIGS.DOORS.label}
              Icon={DeviceGridDoorsIcon}
              devices={roomDevices.doors}
              control={controls.doors}
            />
            <DeviceTypeSection
              label={DEVICE_CONFIGS.LIGHTS.label}
              Icon={DeviceGridLightsIcon}
              devices={roomDevices.lights}
              control={controls.lights}
            />
            <DeviceTypeSection
              label={DEVICE_CONFIGS.EXHAUST_FANS.label}
              Icon={DeviceGridFansIcon}
              devices={roomDevices.fans}
              control={controls.fans}
            />
            <AcTypeSection
              label={DEVICE_CONFIGS.AC.label}
              Icon={DeviceGridAcIcon}
              devices={roomDevices.ac}
              control={controls.ac}
              tempControl={tempControl}
            />
          </div>
        </div>
      </div>
    </ConfigProvider>
  );
}

export default RoomDetailPage;
