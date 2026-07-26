import { useState, useEffect } from "react";
import { Modal, Input, Button } from "antd";
import { EditPencilIcon } from "@assets/icons";

const labelStyle = {
  fontFamily: "var(--font-main)",
  fontWeight: 500,
  fontSize: 16,
  lineHeight: "24px",
  letterSpacing: "0.005em",
  color: "rgba(0, 0, 0, 0.85)",
};

const subLabelStyle = {
  ...labelStyle,
  fontWeight: 400,
  fontSize: 14,
  lineHeight: "20px",
  color: "rgba(0, 0, 0, 0.65)",
};

const buttonStyle = {
  flex: 1,
  height: 40,
  borderRadius: 8,
  fontFamily: "var(--font-main)",
  fontWeight: 500,
  fontSize: 16,
};

function EditRoomModal({ open, room, onCancel, onSave, isSaving }) {
  const [title, setTitle] = useState("");
  const [studySeats, setStudySeats] = useState("");
  const [examSeats, setExamSeats] = useState("");

  useEffect(() => {
    if (!open) return;
    setTitle(room?.name ?? "");
    setStudySeats(room?.study_seats ?? "");
    setExamSeats(room?.exam_seats ?? "");
  }, [open, room]);

  const handleSeatChange = (setter) => (e) => {
    const value = e.target.value;
    if (value === "" || /^\d+$/.test(value)) setter(value);
  };

  const handleSave = () => {
    onSave({
      title: title.trim(),
      study_seats: studySeats === "" ? null : Number(studySeats),
      exam_seats: examSeats === "" ? null : Number(examSeats),
    });
  };

  return (
    <Modal
      open={open}
      onCancel={onCancel}
      footer={null}
      closable
      centered
      width={508}
      styles={{
        body: { padding: 0 },
        header: {
          paddingBottom: 12,
          marginBottom: 0,
          borderBottom: "1px solid rgba(0, 0, 0, 0.06)",
        },
      }}
      title={
        <div className="flex items-center" style={{ gap: 8 }}>
          <EditPencilIcon />
          <span style={labelStyle}>แก้ไขข้อมูลห้องเรียน</span>
        </div>
      }
    >
      <div className="flex flex-col" style={{ gap: 16, paddingBottom: 24 }}>
        <div className="flex flex-col" style={{ gap: 8 }}>
          <span style={labelStyle}>ชื่อห้อง</span>
          <Input
            size="large"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="ชื่อห้อง"
          />
        </div>

        <div className="flex flex-col" style={{ gap: 8 }}>
          <span style={labelStyle}>จำนวนที่นั่ง</span>
          <div className="flex" style={{ gap: 16 }}>
            <div className="flex flex-col flex-1" style={{ gap: 8 }}>
              <span style={subLabelStyle}>จำนวนที่นั่งเรียน</span>
              <Input
                size="large"
                inputMode="numeric"
                value={studySeats}
                onChange={handleSeatChange(setStudySeats)}
                placeholder="จำนวน"
              />
            </div>
            <div className="flex flex-col flex-1" style={{ gap: 8 }}>
              <span style={subLabelStyle}>จำนวนที่นั่งสอบ</span>
              <Input
                size="large"
                inputMode="numeric"
                value={examSeats}
                onChange={handleSeatChange(setExamSeats)}
                placeholder="จำนวน"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="flex" style={{ gap: 8 }}>
        <Button onClick={onCancel} style={buttonStyle}>
          ยกเลิก
        </Button>
        <Button
          type="primary"
          loading={isSaving}
          onClick={handleSave}
          style={{ ...buttonStyle, background: "#13C2C2" }}
        >
          บันทึก
        </Button>
      </div>
    </Modal>
  );
}

export default EditRoomModal;
