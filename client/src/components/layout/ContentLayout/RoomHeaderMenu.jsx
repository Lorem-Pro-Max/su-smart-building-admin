import { CardButtonOpen, CardButtonClosed } from "@components/utils";
import { DoorControlButton } from "../../../assets/icons";

export function RoomHeaderMenu({
  title,
  floor,
  closeButtonText,
  openButtontext,
}) {
  return (
    <div className="bg-transparent h-max gap-6 flex flex-col">
      <div className="rounded-door-tab shadow-door-card h-door-card bg-white font-medium text-lg p-4 flex items-center justify-between">
        <h5 className="font-medium text-lg h-max">
          {title} {floor}
        </h5>
        <div className="flex gap-4">
          <CardButtonOpen icon={<DoorControlButton />} text={openButtontext} />
          <CardButtonClosed
            icon={<DoorControlButton />}
            text={closeButtonText}
          />
        </div>
      </div>
    </div>
  );
}

export default RoomHeaderMenu;
