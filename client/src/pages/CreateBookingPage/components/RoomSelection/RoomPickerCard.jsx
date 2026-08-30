import { PlusOutlined, CheckCircleFilled } from "@ant-design/icons";
import BuildingIcon from "@assets/images/create-booking/building.svg"
import RoomSeatInfo from "./RoomSeatInfo";

export default function RoomPickerCard({ rooms, formData, onOpenModal }) {
  const selectedRoomName = formData.room?.title
  const selectedFloor = formData.room?.floor

  return (
    <button
      onClick={onOpenModal}
      className="w-full flex justify-start item-center gap-4 cursor-pointer rounded-2xl shadow-md p-4"
    >
      <div
        className={`flex w-18 h-14 justify-center item-center rounded-xl ${formData.room ? "bg-mint-dark text-white" : "bg-teal-100 text-teal-500"
          }`}
      >
        {formData.room ? (
          <img src={BuildingIcon} className="w-7" />
        ) : (
          <PlusOutlined className="text-xl" />
        )}
      </div>
      <div className="flex flex-col min-w-0">
        <span className="text-start">{selectedRoomName || "เลือกห้องเรียน/ห้องประชุม"}</span>
        <span className={`text-start ${formData.room ? "" : "hidden"}`} > ชั้น {selectedFloor || null}</span>
        {formData.room ? (
          <RoomSeatInfo
            studySeats={formData.room.study_seats}
            examSeats={formData.room.exam_seats}
          />
        ) : null}
        <span className="m-0 text-start text-xs text-gray-600 font-normal">{rooms?.[0]?.building_name}</span>
      </div>
    </button >
  );
}
