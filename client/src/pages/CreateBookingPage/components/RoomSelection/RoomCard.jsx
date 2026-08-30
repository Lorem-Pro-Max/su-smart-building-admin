import { EnvironmentOutlined } from "@ant-design/icons";
import BuildingIcon from "@assets/images/create-booking/building.svg"
import { Col } from "antd";
import RoomSeatInfo from "./RoomSeatInfo";


function RoomCard({ roomItem, floorKey, tempSelectedRoom, onSelectTempRoom, disabled = false }) {
    const roomId = roomItem.id ?? `${roomItem.floor}-${roomItem.title ?? roomItem.name}`;
    const roomName = roomItem.title ?? roomItem.name ?? "-";
    const buildingName = roomItem.building_name ?? "";
    const isSelected = tempSelectedRoom?.id === roomItem.id;

    return (
        <Col key={roomId} xs={24} sm={12} md={12} lg={8}>
            <div
                className={`p-4 rounded-2xl bg-white shadow-lg ${disabled ? "opacity-60 cursor-not-allowed bg-gray-50" : "hover:ring-2 hover:ring-mint-light cursor-pointer"} ${isSelected && !disabled ? "ring-1 ring-mint-dark ring-offset-1" : ""}`}
                onClick={() => !disabled && onSelectTempRoom(roomItem)}
                title={disabled ? "ห้องนี้ถูกจองในช่วงเวลาที่เลือกแล้ว (approved)" : undefined}
            >
                <div className="flex gap-3">
                    <div className="w-10 h-10 bg-teal-400 rounded-lg flex items-center justify-center text-white shrink-0">
                        <img src={BuildingIcon} className="w-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                        <div className="flex items-baseline gap-2">
                            <span className="font-bold text-sm leading-tight truncate">{roomName}</span>
                            <span className="text-[12px] text-gray-500 shrink-0">ชั้น {floorKey}</span>
                        </div>
                        <RoomSeatInfo studySeats={roomItem.study_seats} examSeats={roomItem.exam_seats} />
                    </div>
                </div>
                {buildingName ? <div className="text-[12px] text-gray-400 mt-2 line-clamp-2">{buildingName}</div> : null}
            </div>
        </Col>
    );
}

export default RoomCard