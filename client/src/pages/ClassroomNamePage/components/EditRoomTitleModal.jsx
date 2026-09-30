import { Button, Input, Modal } from "antd";
import roomTitleIllustration from "@assets/images/roomTitle/room-title.png";

export default function EditRoomTitleModal({
  open,
  title,
  onTitleChange,
  onCancel,
  onSave,
  saveLoading = false,
}) {
  return (
    <Modal
      open={open}
      title={null}
      closable={!saveLoading}
      onCancel={onCancel}
      footer={null}
      destroyOnHidden
      width={400}
      centered
      maskClosable={!saveLoading}
    >
      <div className="flex flex-col gap-6 pt-2">
        <div className="flex flex-col items-center gap-3">
          <img
            src={roomTitleIllustration}
            alt=""
            className="w-[100px] h-auto object-contain select-none"
            draggable={false}
          />
          <p className="text-center text-base text-black/88 leading-relaxed px-1">
            โปรดระบุชื่อที่ต้องการแก้ไข
          </p>
        </div>
        <div className="flex flex-col gap-2">
          <label
            htmlFor="classroom-edit-room-title"
            className="text-base font-medium text-black/88"
          >
            ชื่อห้อง
          </label>
          <Input
            id="classroom-edit-room-title"
            value={title}
            onChange={(e) => onTitleChange(e.target.value)}
            placeholder="กรอกชื่อห้อง"
            size="large"
            disabled={saveLoading}
            required
            className="hover:border-[#11A8A8]! focus:border-teal-500!"
          />
        </div>
        <div className="flex justify-end gap-2 w-full">
          <Button size="large" onClick={onCancel} disabled={saveLoading} className="w-full hover:border-[#11A8A8]! hover:text-[#11A8A8]!">
            ยกเลิก
          </Button>
          <Button
            type="primary"
            size="large"
            onClick={onSave}
            loading={saveLoading}
            className="w-full bg-[#13C2C2]! border-[#13C2C2]! hover:bg-[#11A8A8]! hover:border-[#11A8A8]! active:bg-[#0F9E9E]! active:border-[#0F9E9E]!"
          >
            บันทึก
          </Button>
        </div>
      </div>
    </Modal>
  );
}
