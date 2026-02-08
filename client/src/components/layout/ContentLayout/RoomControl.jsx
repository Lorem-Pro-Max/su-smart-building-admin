import { CardButton } from "@components/utils";
import { Checkbox, Segmented } from "antd";
import { RoomNotFoundIcon } from "../../../assets/icons";

export function RoomControlMenu({
  title,
  floor,
  onOpen,
  onClose,
  selectedCount,
  ButtonIcon,
}) {
  return (
    <div className="bg-transparent h-max gap-6 flex flex-col">
      <div className="rounded-content-layout-tab shadow-content-layout-card h-content-layout-card bg-white font-medium text-lg p-4 flex items-center justify-between">
        <h5 className="font-medium text-lg h-max">
          ควบคุม{title} ชั้น {floor}
        </h5>
        <div className="flex gap-4">
          <div onClick={onOpen} className="cursor-pointer">
            <CardButton
              icon={ButtonIcon}
              bgColor={"#13C2C2"}
              text={
                selectedCount > 0
                  ? `เปิด ${title}ที่เลือก (${selectedCount})`
                  : `เปิด ${title}ทั้งหมด`
              }
            />
          </div>

          <div onClick={onClose} className="cursor-pointer">
            <CardButton
              icon={ButtonIcon}
              bgColor={"#FA8C16"}
              text={
                selectedCount > 0
                  ? `ปิด ${title}ที่เลือก (${selectedCount})`
                  : `ปิด ${title}ทั้งหมด`
              }
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export function RoomCard({
  checked,
  onCheck,
  roomName,
  isOn,
  onToggle,
  children,
}) {
  const unlockedTextStyle = isOn ? "text-green-600 font-medium" : "";
  const lockedTextStyle = !isOn ? "text-neutral-800 font-medium" : "";

  return (
    <div className="bg-white h-23 w-full rounded-2xl flex items-center shadow-content-layout-header ">
      <div className="w-full h-full flex-40 flex ">
        <div className="w-full flex justify-center items-center pl-4">
          <Checkbox checked={checked} onChange={onCheck} />
        </div>
      </div>
      <div
        className={`text-lg text-black h-full ${
          children ? "flex-580" : "flex-817"
        } flex items-center`}
      >
        <div className=" pl-2.5">
          <p>{roomName || "ชื่อห้อง"}</p>
        </div>
      </div>

      {children && (
        <div className="flex-236 w-max h-full flex items-center">
          <div className="pl-2">{children}</div>
        </div>
      )}
      <div className="text-lg text-black h-full flex-237 flex items-center ">
        <div className="pl-2 pr-4 py-5 h-full w-full">
          <div className="w-38.25 h-13">
            <Segmented
              value={isOn ? "on" : "off"}
              onChange={(val) => onToggle(val === "on")}
              className="w-full h-full"
              options={[
                {
                  label: <span className={unlockedTextStyle}>เปิด</span>,
                  value: "on",
                },
                {
                  label: <span className={lockedTextStyle}>ปิด</span>,
                  value: "off",
                },
              ]}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export function RoomControlBody({
  children,
  onSelectAll,
  isAllSelected,
  isIndeterminate,
  extraColumnTitle,
}) {
  return (
    <div className="w-full h-full gap-6 flex flex-col">
      <div className="bg-content-layout-header-row h-10 rounded-xl shadow-content-layout-header flex w-full">
        <div className="w-full h-full flex-40 flex items-center">
          <div className="w-full flex justify-center items-center pl-4">
            <Checkbox
              onChange={onSelectAll}
              checked={isAllSelected}
              indeterminate={isIndeterminate}
            />
          </div>
        </div>
        <div
          className={`text-lg text-white h-full ${
            extraColumnTitle ? "flex-580" : "flex-817"
          } flex items-center`}
        >
          <div className="pl-2.5">
            <p>ชื่อห้องเรียน/ห้องประชุม</p>
          </div>
        </div>
        {extraColumnTitle ? (
          <div className="text-lg text-white h-full flex-237 flex items-center">
            <div className="pl-2.5">
              <p>{extraColumnTitle}</p>
            </div>
          </div>
        ) : null}
        <div className="text-lg text-white h-full flex-237 flex items-center">
          <div className="pl-2.5">
            <p>สถานะ</p>
          </div>
        </div>
      </div>
      {children}
    </div>
  );
}

export function RoomNotFound() {
  return (
    <div className="w-full h-full flex justify-center">
      <div className="flex flex-col items-center">
        <RoomNotFoundIcon />
        <p className="text-lg">ไม่มีอุปกรณ์ในชั้นนี้</p>
      </div>
    </div>
  );
}

export function RoomControl({ children }) {
  return (
    <div className="flex flex-col gap-6 w-full h-max pb-6">{children}</div>
  );
}
