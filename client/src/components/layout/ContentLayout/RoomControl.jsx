import { CardButtonOpen, CardButtonClosed } from "@components/utils";
import { Checkbox, Segmented } from "antd";

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
            <CardButtonOpen
              icon={ButtonIcon}
              text={
                selectedCount > 0
                  ? `เปิด${title}ที่เลือก (${selectedCount})`
                  : `เปิด${title}ทั้งหมด`
              }
            />
          </div>

          <div onClick={onClose} className="cursor-pointer">
            <CardButtonClosed
              icon={ButtonIcon}
              text={
                selectedCount > 0
                  ? `ปิด${title}ที่เลือก (${selectedCount})`
                  : `ปิด${title}ทั้งหมด`
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
  status,
  onStatusChange,
  statusOn,
  statusOff,
}) {
  const unlockedTextStyle =
    status === statusOn ? "text-green-600 font-medium" : "";
  const lockedTextStyle =
    status === statusOff ? "text-neutral-800 font-medium" : "";

  return (
    <div className="bg-white h-23 w-full rounded-2xl flex items-center shadow-content-layout-header pr-3">
      <div className="w-full h-full pl-4 flex-40 flex items-center">
        <Checkbox checked={checked} onChange={onCheck} />
      </div>
      <div className="text-lg text-black h-full flex-817 flex items-center pl-2.5">
        <p>{roomName || "ชื่อห้อง"}</p>
      </div>
      <div className="text-lg text-black h-full flex-237 flex items-center pl-2 py-5">
        <Segmented
          value={status}
          onChange={onStatusChange}
          className="w-38.25 h-full"
          options={[
            {
              label: <span className={unlockedTextStyle}>เปิด</span>,
              value: statusOn,
            },
            {
              label: <span className={lockedTextStyle}>ปิด</span>,
              value: statusOff,
            },
          ]}
          style={{ overflow: "hidden" }}
        />
      </div>
    </div>
  );
}

export function RoomControlBody({
  children,
  onSelectAll,
  isAllSelected,
  isIndeterminate,
}) {
  return (
    <div className="w-full h-full gap-6 flex flex-col ">
      <div className="bg-content-layout-header-row h-10 rounded-xl shadow-content-layout-header flex w-full pr-3">
        <div className="w-full h-full pl-4 flex-40 flex items-center">
          <Checkbox
            onChange={onSelectAll}
            checked={isAllSelected}
            indeterminate={isIndeterminate}
          />
        </div>
        <div className="text-lg text-white h-full flex-817 flex items-center pl-2.5">
          <p>ชื่อห้องเรียน/ห้องประชุม</p>
        </div>
        <div className="text-lg text-white h-full flex-237 flex items-center pl-2.5">
          <p>สถานะ</p>
        </div>
      </div>
      {children}
    </div>
  );
}

export function RoomNotFound() {
  return <div></div>;
}

export function RoomControl({ children }) {
  return (
    <div className="flex flex-col gap-6 w-full h-max pb-6">{children}</div>
  );
}
