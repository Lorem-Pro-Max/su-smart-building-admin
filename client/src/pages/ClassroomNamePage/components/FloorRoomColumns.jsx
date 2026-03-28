import RoomBox from "./RoomBox";

export default function FloorRoomColumns({ section, onEditRoom }) {
  if (!section || (section.left.length === 0 && section.right.length === 0)) {
    return (
      <div className="flex flex-col gap-6 w-full h-max pb-6">
        <div className="rounded-content-layout-tab shadow-content-layout-card bg-white p-6">
          <p className="text-base text-black/60 leading-relaxed">
            ไม่มีห้องในชั้นนี้
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 w-full h-max pb-6">
      <div className="flex flex-row gap-4 w-full items-start">
        <div className="flex flex-col gap-3 flex-1 min-w-0">
          {section.left.map((room) => (
            <RoomBox key={room.id} room={room} onEdit={onEditRoom} />
          ))}
        </div>
        <div className="flex flex-col gap-3 flex-1 min-w-0">
          {section.right.map((room) => (
            <RoomBox key={room.id} room={room} onEdit={onEditRoom} />
          ))}
        </div>
      </div>
    </div>
  );
}
