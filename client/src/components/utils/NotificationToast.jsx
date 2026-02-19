import { notification } from "antd";

export const useToast = () => {
  const [api, contextHolder] = notification.useNotification({
    stack: { threshold: 0 },
  });

  const notify = (type, message, duration = 3) => {
    const isError = type === "error";

    const description = typeof message === "object" 
      ? message.message || message.error || "เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ" 
      : message;

    api[type]({
      message: isError ? "ดำเนินการล้มเหลว" : "ดำเนินการสำเร็จ",
      description: String(description),
      placement: "topRight",
      duration: duration,
      style: { 
        backgroundColor: isError ? "#FFF1F0" : "#F6FFED", 
        border: `1px solid ${isError ? "#FFA39E" : "#B7EB8F"}` 
      },
    });
  };

  return {
    successToast: (msg, duration) => notify("success", msg, duration),
    errorToast: (msg, duration) => notify("error", msg, duration),
    contextHolder,
  };
};