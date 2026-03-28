import { EditOutlined } from "@ant-design/icons";

export default function RoomBox({ room, onEdit }) {
  return (
    <div className="rounded-content-layout-tab shadow-content-layout-card bg-white p-4 flex items-center justify-between gap-2 min-w-0">
      <span className="text-base text-black/88 font-medium truncate">
        {room.title?.trim() || `ห้อง #${room.id}`}
      </span>
      <button
        type="button"
        aria-label="แก้ไขชื่อห้อง"
        className="shrink-0 p-1 rounded-md text-black/45 hover:text-[#11A8A8]! cursor-pointer border-0 bg-transparent leading-none"
        onClick={() => onEdit(room)}
      >
        <EditOutlined className="text-lg" />
      </button>
    </div>
  );
}
