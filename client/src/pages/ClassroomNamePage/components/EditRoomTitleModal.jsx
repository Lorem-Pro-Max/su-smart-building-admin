import { Button, Input, Modal } from "antd";

export default function EditRoomTitleModal({
  open,
  title,
  onTitleChange,
  onCancel,
  onSave,
}) {
  return (
    <Modal
      open={open}
      title={null}
      closable
      onCancel={onCancel}
      footer={null}
      destroyOnHidden
      width={400}
      centered
    >
      <div className="flex flex-col gap-6 pt-2">
        <Input
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
          placeholder="ชื่อห้อง"
          size="large"
        />
        <div className="flex justify-end gap-2">
          <Button size="large" onClick={onCancel}>
            ยกเลิก
          </Button>
          <Button type="primary" size="large" onClick={onSave}>
            บันทึก
          </Button>
        </div>
      </div>
    </Modal>
  );
}
