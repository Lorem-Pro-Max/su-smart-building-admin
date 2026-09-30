import { notification } from "antd";

/* สไตล์ toast ของหน้าจองห้อง รวมไว้ที่เดียวเพราะมีทั้ง SubmitModalBody (จองใบเดียว)
   และ Form (จองต่อเนื่อง) เรียกใช้ ถ้าปล่อยให้ต่างคนต่าง copy จะเพี้ยนกันแน่ */
const BASE_STYLE = {
  borderRadius: "8px",
  fontFamily: "Kanit, sans-serif",
};

export function notifyBookingSuccess({ message, description, duration = 3 }) {
  notification.success({
    message,
    description,
    placement: "topRight",
    duration,
    style: {
      ...BASE_STYLE,
      backgroundColor: "#F6FFED",
      border: "1px solid #B7EB8F",
    },
  });
}

export function notifyBookingError(
  err,
  { message = "ส่งคำขอการจองห้องไม่สำเร็จ", description } = {},
) {
  notification.error({
    message,
    /* description ที่ส่งมาเองมาก่อน เพราะบางเคส (เช่นจองต่อเนื่องแล้วชนหมด)
       ไม่มี err จาก axios แต่มีเหตุผลที่อธิบายได้ชัดกว่า */
    description:
      description ??
      err?.response?.data?.error ??
      err?.response?.data?.message ??
      "กรุณาลองใหม่อีกครั้ง หรือติดต่อผู้ดูแลระบบ",
    placement: "topRight",
    duration: 4,
    style: {
      ...BASE_STYLE,
      backgroundColor: "#FFF1F0",
      border: "1px solid #FFCCC7",
    },
  });
}
