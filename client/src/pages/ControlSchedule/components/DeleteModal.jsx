import { Modal, notification } from "antd";
import { deleteScheduleById, getAllSchedule } from "../../../services/schedule";
import { useState } from "react";

function DeleteModal({
  open,
  onCancel,
  bookingId,
  setBookingId,
  setTableData,
}) {
  const [deleting, setDeleting] = useState(false);
  const handleDeleteSchedule = async () => {
    if (!bookingId) return;

    try {
      setDeleting(true);

      await deleteScheduleById(bookingId);

      notification.success({
        message: "ลบการตั้งเวลาเปิด-ปิด สำเร็จ",
      });

      onCancel();
      setBookingId(null);

      const res = await getAllSchedule();

      const formatted = (res?.data || []).map((item) => {
        const firstSchedule = item.schedules?.[0];

        const cleanAction = firstSchedule?.action?.replace(/"/g, "") || "";

        const actionTime = firstSchedule?.action_time
          ? new Date(firstSchedule.action_time)
          : null;

        return {
          ...item,
          room_name: item.room?.title,
          device_count: item.schedules?.length || 0,
          operator: firstSchedule?.action_by?.full_name,
          action: cleanAction,
          date: actionTime ? actionTime.toLocaleDateString("th-TH") : "-",
          time: actionTime
            ? actionTime.toLocaleTimeString("th-TH", {
                hour: "2-digit",
                minute: "2-digit",
              })
            : "-",
        };
      });
      setTableData(formatted);
    } catch {
      notification.error({
        message: "ลบไม่สำเร็จ",
      });
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Modal open={open} footer={null} centered width={508} onCancel={onCancel}>
      <div className="flex flex-col items-center text-center m-4">
        <img
          src="src/assets/images/schedule/transh.svg"
          alt="decline"
          className="w-[160px] h-[160px] m-4"
        />

        <h3 className="text-lg font-semibold">ยืนยันการลบการตั้งเวลานี้?</h3>

        <p className="text-gray-500 text-sm mt-1">
          คุณต้องการลบการตั้งเวลาเปิด-ปิดนี้ใช่หรือไม่?
          เมื่อลบแล้วอุปกรณ์จะไม่ทำงานตามเวลานี้
        </p>

        <div className="flex gap-3 w-full mt-6">
          <button
            type="button"
            className="flex-1 border border-[#D9D9D9] rounded-lg py-2 hover:bg-gray-50 text-[18px] font-bold"
            onClick={onCancel}
          >
            ยกเลิก
          </button>

          <button
            type="submit"
            loading={deleting}
            className="flex-1 bg-red-500 text-white rounded-lg py-2 hover:bg-red-600 text-[18px] font-bold"
            onClick={handleDeleteSchedule}
          >
            ยืนยัน
          </button>
        </div>
      </div>
    </Modal>
  );
}

export default DeleteModal;
